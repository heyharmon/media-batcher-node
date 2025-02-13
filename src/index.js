import Fastify from 'fastify';
import FastifyCors from '@fastify/cors';
import FastifyStatic from '@fastify/static';
import fetch from 'node-fetch';
import fs from 'fs-extra';
import path from 'path';
import sharp from 'sharp';
import archiver from 'archiver';
import ffmpeg from 'fluent-ffmpeg';

const fastify = Fastify({ logger: true });
const PORT = process.env.PORT || 8080;
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

fs.ensureDirSync(UPLOADS_DIR);

// Enable CORS
fastify.register(FastifyCors, {
  origin: '*', // Allow all origins. Change this to a specific domain if needed.
  methods: ['GET', 'POST'], // Specify allowed methods
  allowedHeaders: ['Content-Type'], // Specify allowed headers
});

async function downloadFile(url, dest) {
  try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to download ${url}: ${response.statusText}`);
      const buffer = await response.buffer();
      await fs.writeFile(dest, buffer);
      return true; // Indicate success
  } catch (error) {
      console.error(`Error downloading file ${url}:`, error.message);
      return false; // Indicate failure
  }
}

async function processImage(inputPath, outputPath) {
    await sharp(inputPath)
        .resize({ width: 2000 })
        .jpeg({ quality: 80 })
        .toFile(outputPath);
}

async function processVideo(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .outputOptions('-b:v 1M') // Reduce bitrate
            .outputOptions('-vf', 'scale=1280:-1') // Resize video
            .save(outputPath)
            .on('end', resolve)
            .on('error', reject);
    });
}

async function processFiles(urls, name) {
  const timestamp = Date.now();
  const tempDir = path.join(UPLOADS_DIR, `batch_${timestamp}`);
  const zipFilename = name ? `${name}.zip` : `output_${timestamp}.zip`;
  const zipPath = path.join(UPLOADS_DIR, zipFilename);

  fs.ensureDirSync(tempDir);

  const processedFiles = [];

  for (const url of urls) {
      const ext = path.extname(url).toLowerCase();
      const filename = path.basename(url);
      const tempFilePath = path.join(tempDir, filename);
      const outputFilePath = path.join(tempDir, `optimized_${filename}`);

      const success = await downloadFile(url, tempFilePath);
      if (!success) {
          console.warn(`Skipping file due to download error: ${url}`);
          continue; // Skip this file and move to the next
      }

      try {
          if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
              await processImage(tempFilePath, outputFilePath);
          } else if (ext === '.webm') {
              await processVideo(tempFilePath, outputFilePath);
          } else {
              await fs.copy(tempFilePath, outputFilePath);
          }

          processedFiles.push(outputFilePath);
      } catch (error) {
          console.error(`Error processing file ${filename}:`, error.message);
          continue; // Skip this file if processing fails
      }
  }

  if (processedFiles.length === 0) {
      throw new Error('No files were successfully processed.');
  }

  const outputZip = fs.createWriteStream(zipPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  return new Promise((resolve, reject) => {
      archive.on('error', reject);
      archive.on('end', async () => {
          try {
              await fs.remove(tempDir); // Clean up temp files
              resolve(zipPath);
          } catch (cleanupErr) {
              reject(cleanupErr);
          }
      });

      archive.pipe(outputZip);

      for (const file of processedFiles) {
          archive.file(file, { name: path.basename(file) });
      }

      archive.finalize();
  });
}


fastify.post('/process', async (request, reply) => {
  const { urls, name } = request.body; // Corrected from request.query to request.body

  if (!urls || (Array.isArray(urls) && urls.length === 0)) {
    return reply.status(400).send({ error: 'Invalid input' });
  }

  try {
    const zipFilePath = await processFiles(urls, name); // Fixed: urls instead of urlList
    const zipUrl = `/downloads/${path.basename(zipFilePath)}`;
    return reply.send({ downloadUrl: zipUrl });
  } catch (err) {
    return reply.status(500).send({ error: err.message });
  }
});

// Register static endpoint for serving downloads
fastify.register(FastifyStatic, {
  root: UPLOADS_DIR, // Serve files from 'uploads' directory
  prefix: '/downloads/', // URL prefix for downloads
});

fastify.get('/downloads/:filename', async (request, reply) => {
  const { filename } = request.params;
  const filePath = path.join(UPLOADS_DIR, filename);

  if (!fs.existsSync(filePath)) {
      return reply.status(404).send({ error: 'File not found' });
  }

  return reply.sendFile(filename);
});

// Health check
fastify.get('/', async (request, reply) => {
  return { message: 'Server is running!' };
});

// Start the Fastify server
fastify.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    console.log(`Server running at ${address}`);
});

# Page Checker Node Service

## Description
This is a Node service designed to downscale media from urls. Give array of urls to images and videos get back a zip file.

## Usage
Send a request to /process with param `urls` array and optional `name` for the resulting zip file. The service will return a url to download zipped media.

## Running Locally
To run the service locally, use the following command:
```bash
npm run dev
```
This will start a local server, typically on port `8080`. You can send requests to `http://127.0.0.1:8080/process`

## Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/heyharmon/media-batcher-node.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Pushing to github can trigger build in DigitalOcean App Platform

## License
MIT

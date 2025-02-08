# GTM Checker Cloudflare Worker

## Description
This is a Node micro service that can be run on Cloudflare Worker designed to batch optimize files. 

## Usage
Send a request to the worker's URL to optimize and zip media files. The worker will return a url to download the zip.

## Running Locally
To run the service locally, use the following command:
```bash
npm run dev
```

To run as a Cloudflare worker locally, use the following command:
```bash
wrangler dev
```
This will start a local server, typically on port `8787`. You can test the worker by sending requests to `http://localhost:8787`.

## Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/gtm-checker-cloudflare.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Deploy the worker:
   ```bash
   wrangler deploy
   ```

## License
MIT

# GTM Checker Cloudflare Worker

## Description
This is a Cloudflare Worker designed to check and manage Google Tag Manager (GTM) tags. It includes rate limiting to prevent abuse.

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

## Running Locally
To run the worker locally, use the following command:
```bash
wrangler dev
```
This will start a local server, typically on port `8787`. You can test the worker by sending requests to `http://localhost:8787`.

## Usage
Send a request to the worker's URL to check GTM tags. The worker will return the status of the tags.

## Dependencies
- `cheerio`: For parsing HTML.
- `wrangler`: For deploying the worker.

## License
MIT

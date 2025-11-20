# Indexing API — Setup & Usage (Vercel)

This project includes a serverless endpoint to publish URLs to the Google Indexing API.

File: `api/indexing/publish.js`
Route: `POST /api/indexing/publish`

## What it does
- Reads a Google service account JSON from an environment variable
- Exchanges credentials for an access token
- Calls the Indexing API `urlNotifications:publish` with `{ url, type }`

## Set up in Vercel (recommended)
1. In your Vercel project, open **Settings > Environment Variables**.
2. Add a new variable named `GOOGLE_APPLICATION_CREDENTIALS_JSON` (or `GOOGLE_CREDENTIALS`).
   - Value: paste the entire contents of your service account JSON file (the JSON you downloaded from GCP).
   - Environment: select `Production`, `Preview`, and `Development` as needed.
3. Save and redeploy your project.

> Alternative: create a Vercel secret with the JSON and reference it.

## Enable Indexing API on GCP
Run (or use Console):

```bash
gcloud services enable indexing.googleapis.com --project=YOUR_PROJECT_ID
```

## Usage
Send a POST to the endpoint (server-side or via curl).

Quick checks (replace `SEU_DOMINIO` with your deployment domain):

- Check the sitemap is reachable:

```bash
curl -I https://20buscarvacationbeach.com.br/sitemap.xml
```

- Publish an indexing notification (example for your site):

```bash
curl -X POST https://20buscarvacationbeach.com.br/api/indexing/publish \
  -H "Content-Type: application/json" \
  -d '{"url":"https://20buscarvacationbeach.com.br/exemplo-pagina","type":"URL_UPDATED"}'
```

Response: JSON containing the status and API response from Google Indexing API.

## Notes & Security
- Keep the service account JSON secret (do not commit it to the repository).
- The function expects the full JSON string in `GOOGLE_APPLICATION_CREDENTIALS_JSON`.
- Use the SA with minimal required permissions and rotate keys if exposed.

## Troubleshooting
- 403 or permission errors: ensure the service account has appropriate IAM roles and the Indexing API is enabled.
- `Missing Google service account credentials in env`: set `GOOGLE_APPLICATION_CREDENTIALS_JSON` in Vercel.

If you want, I can also:
- Add a small admin UI (protected) to trigger publishes from the site admin.
- Use Vercel Secrets via CLI to add the JSON as a secret (I can provide commands).

# Vault Artifact Uploader

Thin HTML utility for uploading collateral artifacts to the Vault API and submitting vault creation payloads in one flow.

## Usage
1. Start the FastAPI server (e.g. `uvicorn vault_core:app --host 0.0.0.0 --port 8000`).
2. Serve this folder (e.g. `cd apps/app-artifact-uploader && python -m http.server 3000`).
3. Open `http://localhost:3000` in a browser.
4. Point the API base URL to the FastAPI host, choose a file, enter owner address and valuation, and submit. The tool uploads to `/vault/upload`, then POSTs the returned `ip_hash` with terms to `/vault/create`.

## Constraints
- Accepted MIME types: PDF, ZIP, JSON, PNG, JPEG, plain text.
- Max artifact size: 10 MB (enforced server-side).

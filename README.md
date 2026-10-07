# FastAPI + Cloudflare Hello World

- Frontend: https://hello.lajo-apps.info
- Cloudflare fallback: https://fastapi-hello-world-frontend.lajo-xyz-2000.workers.dev
- API: https://fastapi-hello-world-i205.onrender.com
- API docs: https://fastapi-hello-world-i205.onrender.com/docs

## Architecture

`frontend/public/` is served by Cloudflare Workers Static Assets. The Worker
proxies `/api/` and `/api/health` to FastAPI on Render. Browser requests are
same-origin, so no CORS configuration is needed. The proxy is restricted to
these read-only endpoints. Render's free service sleeps when idle; the UI
allows time for a cold start.

## Local development

Backend (repository root):

```sh
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt httpx
uvicorn main:app --reload
# Tests: python -m unittest discover -s tests
```

Frontend:

```sh
cd frontend
npm ci
npm run dev
# Tests: npm test
```

The frontend uses the deployed API by default. To use a local backend:
`npx wrangler dev --var API_BASE_URL:http://127.0.0.1:8000`.

## GitHub Actions setup (one-time)

`.github/workflows/ci-deploy.yml` tests both components on pull requests and
pushes. After tests pass, pushes to `main` deploy the frontend and trigger a
Render backend deployment. Manual workflow dispatch is also supported.

Configure these repository secrets before automated deployments can work:

1. `CLOUDFLARE_API_TOKEN`: create a token at
   https://dash.cloudflare.com/profile/api-tokens using **Edit Cloudflare Workers**,
   scoped to account `366267eaff9b52ad4cc51008fa452a5c`. Include **Zone / Zone / Read**
   and **Zone / Workers Routes / Edit** for `lajo-apps.info` to deploy the custom domain.
   Local Wrangler OAuth login does not authenticate GitHub Actions.
2. `RENDER_DEPLOY_HOOK_URL`: copy the deploy hook from the Render service's
   Settings page: https://dashboard.render.com/web/srv-db345a0m7kps73cvfsug.
   Treat the entire URL as a secret.

Set them without committing credentials:

```sh
gh secret set CLOUDFLARE_API_TOKEN --repo lajoxyz/render_sample
gh secret set RENDER_DEPLOY_HOOK_URL --repo lajoxyz/render_sample
```

Once both secrets are set, disable Render's native Auto-Deploy in its settings
so backend deploys happen only through Actions after tests pass. It remains
on until then to preserve the existing working deployment. The deploy hook
starts a deployment; the Actions job does not wait for Render to become live.

Then run:

```sh
gh workflow run ci-deploy.yml --repo lajoxyz/render_sample
```

`frontend/wrangler.jsonc` defines Cloudflare configuration and the API URL.
`render.yaml` describes the Render free web service. To deploy the frontend
locally with your existing OAuth login: `cd frontend && npm run deploy`.

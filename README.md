# FastAPI Hello World

A minimal FastAPI app deployed on Render's free plan.

## Run locally

```sh
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

- `/`: returns `{"message":"Hello, world!"}`
- `/health`: health check
- `/docs`: interactive API documentation

## Deploy

`render.yaml` defines the free Render web service. The start command binds to
`0.0.0.0` and Render's `$PORT`. Pushes to `main` automatically deploy when
GitHub auto-deploy is enabled. Free services sleep when idle.

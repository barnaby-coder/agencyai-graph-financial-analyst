# Deployment notes

## Cloudflare Worker architecture

`src/worker.mjs` is the Cloudflare entrypoint. It delegates `/health` and
`/api/analyze` to the shared request handler, which uses the existing Graph,
financial, evidence, and model modules. Cloudflare Workers Static Assets serves
`public/` through the `ASSETS` binding; the Worker is invoked first for API and
health paths. No financial or model logic is duplicated for the Worker.

The deployment configuration is in `wrangler.toml`. It enables the isolated
`workers.dev` host, and the custom domain was bound only after temporary-host
validation passed.

## Runtime

- Recent Node.js runtime with native `fetch` support.
- Start command: `npm start`.
- Default bind address: `127.0.0.1`.
- Set `HOST=0.0.0.0` on a host that routes external traffic to the process.
- Default port: `4173`; set `PORT` for a host-provided port.
- The server serves `public/` and exposes `/api/health` and `POST /api/analyze`.

For the Worker, the equivalent health endpoint is `/health` (the compatible
`/api/health` path is also retained), and static routes are served from
`public/`.

## Environment

Required for live analysis:

- `GRAPH_API_KEY` — server-side Graph Gateway credential.

Recommended model-backed demo:

- `OPENAI_API_KEY` — server-side OpenAI credential.
- `OPENAI_MODEL` — use `gpt-5.6-luna` for the validated demo configuration.
- `OPENAI_API_URL` — optional; defaults to
  `https://api.openai.com/v1/responses`.

The existing compatible chat-completions transport remains available through
`MODEL_API_URL`, `MODEL_API_KEY`, and optional `MODEL_NAME`. OpenAI is selected
when `OPENAI_API_KEY` is present. If no model credential is configured, the
server uses the deterministic fallback.

## Operational behavior

Graph requests use a 12-second per-request timeout and one bounded retry for
transient failures. The model client uses a 60-second request timeout and the
interpreter has a 65-second outer timeout. Model failure, malformed output,
unknown evidence references, or stale observations fall back honestly; the
application never substitutes fixtures in the normal live path.

Secrets must be injected by the host runtime, never committed, logged, or sent
to the browser. Do not expose authorization headers in diagnostics.

## Cloudflare secrets and deployment credentials

Set these as Cloudflare Worker secrets with Wrangler or the Cloudflare
dashboard; they are runtime secrets, not repository files:

- `GRAPH_API_KEY`
- `OPENAI_API_KEY`
- `OPENAI_API_URL` (configuration variable if overriding the default)
- `OPENAI_MODEL` (configuration variable; validated value is `gpt-5.6-luna`)

The compatible model transport may instead use `MODEL_API_KEY`,
`MODEL_API_URL`, and `MODEL_NAME`.

The GitHub Actions workflow uses only deployment credentials stored as GitHub
Actions secrets: `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. Runtime
Graph/OpenAI secrets are not placed in that workflow.

## Cloudflare commands

Install dependencies with `npm ci`, then deploy the isolated temporary Worker:

```bash
npx wrangler deploy --config wrangler.toml
```

Set runtime secrets separately, for example:

```bash
npx wrangler secret put GRAPH_API_KEY
npx wrangler secret put OPENAI_API_KEY
```

Never put secret values in shell history, source, workflow files, or logs.

## Smoke test

1. Start with the required runtime variables.
2. Confirm `GET /api/health` reports `graphConfigured: true` and, for the model
   path, `modelConfigured: true`.
3. Submit the sample question to `POST /api/analyze`.
4. Confirm `status: "ready"`, three qualified fresh observations, and
   `answer.mode: "model"`.
5. Confirm `answer.evidenceIds` resolves to Aave, Compound, and Spark evidence.
6. Repeat in a process without model variables and confirm HTTP 200,
   `status: "ready"`, and `answer.mode: "fallback"`.

## Validated hosted deployment

On 2026-09-05, the Worker was validated on the temporary host:

- URL: `https://agencyai-graph-financial-analyst.finneigan-barnaby.workers.dev/`
- Result: HTTP 200, `status: "ready"`, `answer.mode: "model"`.
- Graph block: `25912018`; all three observations were fresh and had no
  indexing errors; total request time was approximately 12.4 seconds.

After that validation, the Worker was attached to:

- URL: `https://capital.agencyai.me/`
- Result: HTTP 200, `status: "ready"`, `answer.mode: "model"`.
- Graph block: `25912061`; all three observations were fresh and had no
  indexing errors; the final timed request took approximately 11.0 seconds.

The `agencyai.me` root was checked before and after the custom-domain change
and remained unchanged. This repository does not manage that root deployment.

## Recommended deployment approach

For the current release candidate, use the dedicated Cloudflare Worker. It
serves the static UI and handles `/health` and `/api/analyze` through the
shared runtime-independent handler. Local Node remains available for
development and fallback validation. The repository workflow runs tests and
deploys the Worker when changes reach `main`; deployment still requires an
explicit merge approval.

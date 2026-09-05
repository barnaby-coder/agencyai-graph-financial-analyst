# Deployment notes

## Runtime

- Recent Node.js runtime with native `fetch` support.
- Start command: `npm start`.
- Default bind address: `127.0.0.1`.
- Set `HOST=0.0.0.0` on a host that routes external traffic to the process.
- Default port: `4173`; set `PORT` for a host-provided port.
- The server serves `public/` and exposes `/api/health` and `POST /api/analyze`.

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

## Recommended deployment approach

Use a simple long-running Node service or VM process with a reverse proxy,
runtime secret variables, HTTPS, and a host-provided `PORT`. Set `HOST` to
`0.0.0.0` when the platform requires non-loopback binding. This preserves the
existing server and avoids a framework or hosting-provider rewrite. A serverless
host may require an adapter because this repository currently owns one small
HTTP server rather than separate function handlers.

The current local smoke test is the deployment reference. No hosted deployment
or public demo URL has been approved or recorded yet.

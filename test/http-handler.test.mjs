import test from "node:test";
import assert from "node:assert/strict";
import { handleApi } from "../src/http/handler.mjs";

test("shared API handler exposes health without revealing runtime configuration values", async () => {
  const response = await handleApi({ method: "GET", pathname: "/health", env: { GRAPH_API_KEY: "graph-secret", OPENAI_API_KEY: "model-secret" } });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, graphConfigured: true, modelConfigured: true });
});

test("shared API handler fails closed when the Graph credential is absent", async () => {
  const response = await handleApi({ method: "POST", pathname: "/api/analyze", body: JSON.stringify({ question: "Where can USDC earn lending return?" }), env: {} });
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: { code: "GRAPH_CREDENTIAL_MISSING", message: "Live Graph credentials are not configured on the server." } });
});

test("shared API handler keeps the local health compatibility path", async () => {
  const response = await handleApi({ method: "GET", pathname: "/api/health", env: {} });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, graphConfigured: false, modelConfigured: false });
});

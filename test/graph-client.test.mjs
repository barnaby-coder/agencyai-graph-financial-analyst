import test from "node:test";
import assert from "node:assert/strict";
import fixture from "../spike/fixtures/live-validation-2026-09-04.json" with { type: "json" };
import { PROTOCOLS, fetchProtocolObservation, runLendingAnalysis } from "../src/graph/client.mjs";

const responses = new Map(fixture.protocols.map((p) => [p.deploymentId, {
  data: {
    _meta: { block: { number: String(p.blockNumber), timestamp: String(p.blockTimestamp) }, hasIndexingErrors: p.hasIndexingErrors },
    lendingProtocols: [{ slug: p.usedSlug, markets: [{ ...p.market, inputTokenBalance: p.market.suppliedRaw, variableBorrowedTokenBalance: p.market.borrowedRaw }] }]
  }
}]));

function fakeFetch(url) {
  const deployment = url.split("/deployments/id/")[1];
  return Promise.resolve({ ok: true, status: 200, json: async () => responses.get(deployment) ?? { errors: [{ message: "not found" }] } });
}

test("requires a runtime Graph credential", async () => {
  await assert.rejects(() => runLendingAnalysis("USDC lending", { apiKey: "" }), /GRAPH_CREDENTIAL_MISSING/);
});

test("returns a partial result and excludes one unavailable protocol", async () => {
  const partialFetch = (url, options) => url.includes(PROTOCOLS[2].deploymentId)
    ? Promise.resolve({ ok: true, status: 200, json: async () => ({ errors: [{ message: "temporary Graph error" }] }) })
    : fakeFetch(url, options);
  const result = await runLendingAnalysis("USDC lending", { apiKey: "test-only", fetchImpl: partialFetch, capturedAt: fixture.capturedAt, retries: 0 });
  assert.equal(result.status, "partial");
  assert.equal(result.observations.length, 2);
  assert.deepEqual(result.unavailable.map((item) => item.protocol), ["Spark Lend"]);
  assert.equal(result.comparisons.rankingAllowed, true);
});

test("fails explicitly after bounded request retries", async () => {
  let attempts = 0;
  const failingFetch = async () => { attempts += 1; throw new Error("network down"); };
  await assert.rejects(() => fetchProtocolObservation(PROTOCOLS[0], { apiKey: "test-only", fetchImpl: failingFetch, retries: 1, timeoutMs: 50 }), /network down/);
  assert.equal(attempts, 2);
});

test("fails closed when every Graph source is unavailable", async () => {
  const unavailableFetch = async () => ({ ok: true, status: 200, json: async () => ({ errors: [{ message: "Graph unavailable" }] }) });
  const result = await runLendingAnalysis("USDC lending", { apiKey: "test-only", fetchImpl: unavailableFetch, capturedAt: fixture.capturedAt, retries: 0 });
  assert.equal(result.status, "unavailable");
  assert.equal(result.observations.length, 0);
  assert.equal(result.comparisons.rankingAllowed, false);
  assert.equal(result.evidence.freshness, "caveated");
});

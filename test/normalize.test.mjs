import test from "node:test";
import assert from "node:assert/strict";
import { buildEvidence, classifyFreshness, compareObservations, normalizeMarket } from "../src/financial/normalize.mjs";

const config = { expectedMarketId: "0xc3d688b66703497daa19211eedff47f25384cdc3a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", economicRole: "Compound III USDC base market" };
const meta = { block: { number: "100", timestamp: "1700000000" }, hasIndexingErrors: false };
const market = (id = config.expectedMarketId) => ({ id, name: "Compound V3 USDC - USD Coin", inputToken: { id: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", symbol: "USDC", decimals: 6 }, inputTokenBalance: "100000000", variableBorrowedTokenBalance: "25000000", rates: [{ side: "BORROWER", type: "VARIABLE", rate: "6" }, { side: "LENDER", type: "VARIABLE", rate: "5" }] });

test("normalizes balances, rates, utilization, and provenance", () => {
  const observation = normalizeMarket({ protocol: "Compound III", config, meta, protocolData: { markets: [market()] }, capturedAt: "2023-11-14T22:13:20.000Z" });
  assert.equal(observation.supply, 100);
  assert.equal(observation.borrows, 25);
  assert.equal(observation.utilizationPct, 25);
  assert.equal(observation.supplyRatePct, 5);
  assert.equal(observation.borrowRatePct, 6);
  assert.equal(observation.incentives, "unknown");
  assert.equal(observation.evidence.market, config.expectedMarketId);
});

test("rejects a plausible but wrong Compound USDC collateral market", () => {
  assert.throws(() => normalizeMarket({ protocol: "Compound III", config, meta, protocolData: { markets: [market("0xwrong")] }, capturedAt: "2023-11-14T22:13:20.000Z" }), /expected economic market/);
});

test("classifies freshness boundaries", () => {
  const captured = "2023-11-14T22:13:20.000Z";
  const block = 1700000000;
  assert.equal(classifyFreshness(block, captured), "fresh");
  assert.equal(classifyFreshness(block - 901, captured), "stale");
  assert.equal(classifyFreshness(block - 86401, captured), "unavailable");
  assert.equal(classifyFreshness(null, captured), "unavailable");
});

test("withholds ranking when one observation is stale", () => {
  const fresh = { protocol: "Aave", freshness: "fresh", supplyRatePct: 4, utilizationPct: 90, liquidityProxy: 10, borrowRatePct: 5 };
  const stale = { protocol: "Spark", freshness: "stale", supplyRatePct: 6, utilizationPct: 80, liquidityProxy: 20, borrowRatePct: 7 };
  const comparisons = compareObservations([fresh, stale]);
  assert.equal(comparisons.rankingAllowed, false);
  assert.equal(comparisons.highestSupplyRate, null);
  const evidence = buildEvidence([fresh, stale], comparisons);
  assert.equal(evidence.freshness, "caveated");
});

test("rejects missing required financial fields and indexing errors", () => {
  assert.throws(() => normalizeMarket({ protocol: "Compound III", config, meta: { ...meta, hasIndexingErrors: true }, protocolData: { markets: [market()] }, capturedAt: "2023-11-14T22:13:20.000Z" }), /indexing errors/);
  assert.throws(() => normalizeMarket({ protocol: "Compound III", config, meta, protocolData: { markets: [{ ...market(), variableBorrowedTokenBalance: null }] }, capturedAt: "2023-11-14T22:13:20.000Z" }), /invalid/);
});

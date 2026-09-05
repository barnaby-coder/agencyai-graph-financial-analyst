import test from "node:test";
import assert from "node:assert/strict";
import { createInterpreter, renderDeterministicFallback } from "../src/agent/interpreter.mjs";

const observation = {
  protocol: "Aave V3", chain: "ethereum", asset: "USDC", marketId: "market-a", marketName: "Aave USDC", economicRole: "Aave Ethereum USDC supply market",
  supply: 100, borrows: 92.5, supplyRatePct: 3.5, borrowRatePct: 4.2, utilizationPct: 92.5,
  freshnessAgeSeconds: 8, freshness: "fresh", liquidityProxy: 7.5, incentives: "unknown", blockNumber: 100, blockTimestamp: 1700000000, capturedAt: "2023-11-14T22:13:28.000Z", evidence: { evidenceId: "Aave V3:market-a", deploymentId: "deployment-a", market: "market-a", protocol: "Aave V3", source: "The Graph", blockNumber: 100, blockTimestamp: 1700000000, capturedAt: "2023-11-14T22:13:28.000Z", freshness: "fresh", methodology: "deterministic", unknowns: ["incentives"] }
};

test("fallback is grounded in supplied observations and unknown incentives", async () => {
  const analysis = { observations: [observation], unavailable: [], comparisons: { rankingAllowed: true, highestSupplyRate: "Aave V3", mostObservableLiquidity: "Aave V3", lowestUtilization: "Aave V3" } };
  const answer = await createInterpreter().interpret(analysis);
  assert.equal(answer.mode, "fallback");
  assert.match(answer.sections.observe, /Aave V3/);
  assert.match(answer.sections.observe, /3\.50%/);
  assert.match(answer.sections.risks.join(" "), /unknown/);
  assert.deepEqual(answer.evidenceIds, ["deployment-a"]);
});

test("all-unavailable fallback does not invent a comparison", () => {
  const answer = renderDeterministicFallback({ observations: [], unavailable: [{ protocol: "Spark Lend", reason: "timeout" }], comparisons: {} });
  assert.match(answer.sections.compare, /withheld/);
  assert.match(answer.sections.risks.join(" "), /timeout/);
});

test("model adapter receives facts, comparisons, evidence, and explicit unknowns", async () => {
  let received;
  const modelOutput = {
    summary: { text: "The live observation is current.", evidenceRefs: ["Aave V3:market-a"] },
    observations: [{ text: "Aave reports a 3.50% supply rate.", evidenceRefs: ["Aave V3:market-a"] }],
    comparison: [{ text: "A comparison is available for this observation.", evidenceRefs: ["Aave V3:market-a"] }],
    returnSource: [{ text: "The observed return is the variable supply rate.", evidenceRefs: ["Aave V3:market-a"] }],
    risksAndLimitations: [{ text: "Incentives remain unknown.", evidenceRefs: ["Aave V3:market-a"] }],
    evidenceRefs: ["Aave V3:market-a"]
  };
  const interpreter = createInterpreter({ generate: async (input) => { received = input; return modelOutput; } });
  const analysis = { question: "USDC?", observations: [observation], unavailable: [], comparisons: { rankingAllowed: true }, evidence: { sources: [observation.evidence] } };
  const answer = await interpreter.interpret(analysis);
  assert.equal(received.packet.question, "USDC?");
  assert.equal(received.packet.observations[0].protocol, "Aave V3");
  assert.equal(received.packet.observations[0].supply, 100);
  assert.deepEqual(received.packet.evidence[0].id, "Aave V3:market-a");
  assert.equal(answer.mode, "model");
});

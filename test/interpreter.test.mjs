import test from "node:test";
import assert from "node:assert/strict";
import { createInterpreter, renderDeterministicFallback } from "../src/agent/interpreter.mjs";

const observation = {
  protocol: "Aave V3", supplyRatePct: 3.5, borrowRatePct: 4.2, utilizationPct: 92.5,
  freshnessAgeSeconds: 8, freshness: "fresh", liquidityProxy: 10, evidence: { deploymentId: "deployment-a" }
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
  const interpreter = createInterpreter({ generate: async (input) => { received = input; return { mode: "model", title: "grounded", sections: { observe: "ok", compare: "ok", returnSource: "ok", risks: [] }, evidenceIds: [] }; } });
  const analysis = { question: "USDC?", observations: [observation], comparisons: { rankingAllowed: true }, evidence: { sources: [observation.evidence] } };
  await interpreter.interpret(analysis);
  assert.equal(received.question, "USDC?");
  assert.equal(received.observations[0], observation);
  assert.deepEqual(received.unknowns, ["incentives"]);
});

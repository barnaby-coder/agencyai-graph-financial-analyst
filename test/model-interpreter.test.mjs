import test from "node:test";
import assert from "node:assert/strict";
import { buildEvidencePacket, validateModelOutput } from "../src/agent/model-interpreter.mjs";
import { createJsonModelGenerator, createModelGenerator, createOpenAIResponsesGenerator } from "../src/agent/model-client.mjs";
import { createInterpreter } from "../src/agent/interpreter.mjs";

const source = {
  evidenceId: "Aave V3:market-a", protocol: "Aave V3", market: "market-a", economicRole: "Aave Ethereum USDC supply market",
  source: "The Graph", subgraphId: "subgraph-a", deploymentId: "deployment-a", blockNumber: 100, blockTimestamp: 1700000000,
  capturedAt: "2023-11-14T22:13:28.000Z", freshness: "fresh", methodology: "deterministic", unknowns: ["incentives"]
};
const observation = {
  protocol: "Aave V3", chain: "ethereum", asset: "USDC", marketId: "market-a", marketName: "Aave USDC", economicRole: source.economicRole,
  supply: 100, borrows: 92.5, utilizationPct: 92.5, supplyRatePct: 3.5, borrowRatePct: 4.2, incentives: "unknown", liquidityProxy: 7.5,
  freshness: "fresh", freshnessAgeSeconds: 8, blockNumber: 100, blockTimestamp: 1700000000, capturedAt: source.capturedAt, evidence: source
};
const analysis = { question: "I have USDC. Where can it earn lending yield?", observations: [observation], unavailable: [], comparisons: { rankingAllowed: true, highestSupplyRate: "Aave V3" }, evidence: { sources: [source] } };
const point = (text = "Grounded point.") => ({ text, evidenceRefs: [source.evidenceId] });
const valid = () => ({ summary: point("The observation is current."), observations: [point("Supply is observable.")], comparison: [point("The comparison uses one qualified source.")], returnSource: [point("Return is represented by the supply rate.")], risksAndLimitations: [point("Incentives remain unknown.")], evidenceRefs: [source.evidenceId] });

test("model packet is compact, structured, and excludes raw Graph or secret fields", () => {
  const packet = buildEvidencePacket({ ...analysis, observations: [{ ...observation, rawGraphResponse: { secret: "do-not-send" }, apiKey: "do-not-send" }] });
  const serialized = JSON.stringify(packet);
  assert.equal(packet.observations[0].rawGraphResponse, undefined);
  assert.equal(packet.observations[0].apiKey, undefined);
  assert.equal(serialized.includes("do-not-send"), false);
  assert.equal(packet.evidence[0].id, source.evidenceId);
  assert.deepEqual(packet.caveats, ["Rates are neutral percentage-point fields and are not established APY.", "Incentives are unknown in the qualified standardized source and must not be treated as zero."]);
});

test("valid model output and evidence references are accepted", () => {
  assert.deepEqual(validateModelOutput(valid(), [source.evidenceId]).evidenceRefs, [source.evidenceId]);
  const { evidenceRefs: _aggregate, ...pointOnly } = valid();
  assert.deepEqual(validateModelOutput(pointOnly, [source.evidenceId]).evidenceRefs, [source.evidenceId]);
});

test("unknown evidence references and unsafe claims are rejected", () => {
  assert.throws(() => validateModelOutput({ ...valid(), evidenceRefs: ["missing"] }, [source.evidenceId]), /unknown evidence/);
  assert.throws(() => validateModelOutput({ ...valid(), summary: point("The APY is 4%.") }, [source.evidenceId]), /unsupported claim/);
  assert.doesNotThrow(() => validateModelOutput({ ...valid(), summary: point("The rates are not established APY.") }, [source.evidenceId]));
  assert.throws(() => validateModelOutput({ ...valid(), observations: [{ text: "Unsupported fact", evidenceRefs: [] }] }, [source.evidenceId]), /schema/);
});

test("missing model credential disables the HTTP generator without error", () => {
  assert.equal(createJsonModelGenerator({ endpoint: "https://model.invalid", apiKey: "" }), null);
});

test("provider failure and malformed output use deterministic fallback", async () => {
  const failing = createInterpreter({ generate: async () => { throw new Error("provider down"); } });
  const malformed = createInterpreter({ generate: async () => ({ nope: true }) });
  assert.equal((await failing.interpret(analysis)).mode, "fallback");
  assert.equal((await malformed.interpret(analysis)).mode, "fallback");
});

test("stale data prevents model interpretation and preserves fail-closed comparison", async () => {
  let called = false;
  const staleAnalysis = { ...analysis, observations: [{ ...observation, freshness: "stale" }], comparisons: { rankingAllowed: false } };
  const interpreter = createInterpreter({ generate: async () => { called = true; return valid(); } });
  const answer = await interpreter.interpret(staleAnalysis);
  assert.equal(called, false);
  assert.equal(answer.mode, "fallback");
  assert.match(answer.sections.compare, /withheld/);
});

test("HTTP generator sends only the model packet and never exposes its credential in errors", async () => {
  let request;
  let requestUrl;
  const generator = createJsonModelGenerator({ endpoint: "https://model.test/api/v4", apiKey: "secret-test-key", fetchImpl: async (url, options) => {
    requestUrl = url;
    request = options;
    return { ok: true, status: 200, json: async () => ({ choices: [{ message: { content: JSON.stringify(valid()) } }] }) };
  } });
  const result = await generator({ packet: buildEvidencePacket(analysis) });
  assert.equal(result.evidenceRefs[0], source.evidenceId);
  assert.equal(requestUrl, "https://model.test/api/v4/chat/completions");
  assert.equal(request.headers.authorization, "Bearer secret-test-key");
  const requestBody = JSON.parse(request.body);
  assert.equal(requestBody.messages[1].role, "user");
  assert.equal(JSON.parse(requestBody.messages[1].content).question, analysis.question);
  assert.deepEqual(requestBody.response_format, { type: "json_object" });
  assert.deepEqual(requestBody.thinking, { type: "disabled" });
  assert.equal(requestBody.max_tokens, 1800);
  assert.equal(JSON.stringify(request.body).includes("secret-test-key"), false);
});

test("HTTP generator timeout is explicit", async () => {
  const generator = createJsonModelGenerator({ endpoint: "https://model.test", apiKey: "secret-test-key", timeoutMs: 5, fetchImpl: (_url, options) => new Promise((_, reject) => options.signal.addEventListener("abort", () => { const error = new Error("aborted"); error.name = "AbortError"; reject(error); })) });
  await assert.rejects(() => generator({ packet: buildEvidencePacket(analysis) }), /timed out/);
});

test("OpenAI Responses generator requests strict structured output without raw Graph data or credentials", async () => {
  let request;
  const generator = createOpenAIResponsesGenerator({ endpoint: "https://api.openai.com/v1/responses", apiKey: "secret-openai-key", model: "gpt-5.6-luna", fetchImpl: async (_url, options) => {
    request = options;
    return { ok: true, status: 200, json: async () => ({ model: "gpt-5.6-luna", output_text: JSON.stringify(valid()), usage: { input_tokens: 12, output_tokens: 34 } }) };
  } });
  const result = await generator({ packet: buildEvidencePacket(analysis) });
  assert.equal(result.summary.text, "The observation is current.");
  const requestBody = JSON.parse(request.body);
  assert.equal(requestBody.model, "gpt-5.6-luna");
  assert.equal(requestBody.reasoning.effort, "none");
  assert.equal(requestBody.store, false);
  assert.equal(requestBody.text.format.type, "json_schema");
  assert.equal(requestBody.text.format.strict, true);
  assert.equal(requestBody.text.format.name, "grounded_financial_answer");
  assert.equal(requestBody.tools, undefined);
  assert.equal(JSON.parse(requestBody.input).observations[0].protocol, "Aave V3");
  assert.equal(JSON.stringify(requestBody).includes("secret-openai-key"), false);
  assert.equal(request.headers.authorization, "Bearer secret-openai-key");
});

test("OpenAI Responses malformed output falls back through the provider-neutral interpreter", async () => {
  const generator = createOpenAIResponsesGenerator({ apiKey: "secret-openai-key", fetchImpl: async () => ({ ok: true, status: 200, json: async () => ({ output_text: "not-json" }) }) });
  const interpreter = createInterpreter({ generate: generator });
  assert.equal((await interpreter.interpret(analysis)).mode, "fallback");
});

test("model factory prefers OpenAI Responses when its credential is configured", async () => {
  const generator = createModelGenerator({ openaiApiKey: "secret-openai-key", openaiModel: "gpt-5.6-luna", fetchImpl: async (_url, options) => ({ ok: true, status: 200, json: async () => ({ output_text: JSON.stringify(valid()) }) }) });
  const result = await generator({ packet: buildEvidencePacket(analysis) });
  assert.equal(result.summary.text, "The observation is current.");
});

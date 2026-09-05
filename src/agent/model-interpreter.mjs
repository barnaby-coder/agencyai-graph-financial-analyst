export const MODEL_INSTRUCTIONS = `You are a financial research interpreter for a bounded Ethereum USDC lending comparison.
Use only the supplied packet. Deterministic code has already qualified markets, calculated metrics, classified freshness, and created evidence.
Explain observed facts separately from interpretation. Cite the supplied evidence IDs on every point that makes a factual claim.
Never calculate or alter primary metrics, call rates APY, turn unknown incentives into zero, add protocol facts, rank stale data, or recommend deposits, borrowing, trading, execution, or transactions.
If data is partial, stale, unavailable, or an incentive is unknown, say so clearly. Do not expose chain-of-thought. Return only the requested JSON object.`;

export const MODEL_OUTPUT_SCHEMA = Object.freeze({
  type: "object",
  required: ["summary", "observations", "comparison", "returnSource", "risksAndLimitations", "evidenceRefs"],
  properties: {
    summary: { type: "object", required: ["text", "evidenceRefs"] },
    observations: { type: "array", items: { type: "object", required: ["text", "evidenceRefs"] } },
    comparison: { type: "array", items: { type: "object", required: ["text", "evidenceRefs"] } },
    returnSource: { type: "array", items: { type: "object", required: ["text", "evidenceRefs"] } },
    risksAndLimitations: { type: "array", items: { type: "object", required: ["text", "evidenceRefs"] } },
    evidenceRefs: { type: "array", items: { type: "string" } }
  }
});

const POINT_KEYS = ["observations", "comparison", "returnSource", "risksAndLimitations"];

function evidenceId(observation) {
  return observation.evidence?.evidenceId ?? observation.evidence?.deploymentId ?? `${observation.protocol}:${observation.marketId}`;
}

export function buildEvidencePacket(analysis) {
  const observations = analysis.observations.map((observation) => ({
    evidenceId: evidenceId(observation),
    protocol: observation.protocol,
    chain: observation.chain,
    asset: observation.asset,
    marketId: observation.marketId,
    marketName: observation.marketName,
    economicRole: observation.economicRole,
    supply: observation.supply,
    borrows: observation.borrows,
    utilizationPct: observation.utilizationPct,
    supplyRatePct: observation.supplyRatePct,
    borrowRatePct: observation.borrowRatePct,
    liquidityProxy: observation.liquidityProxy,
    incentives: observation.incentives,
    freshness: observation.freshness,
    freshnessAgeSeconds: observation.freshnessAgeSeconds,
    blockNumber: observation.blockNumber,
    blockTimestamp: observation.blockTimestamp,
    capturedAt: observation.capturedAt
  }));

  const evidence = analysis.evidence.sources.map((source) => ({
    id: source.evidenceId ?? source.deploymentId,
    protocol: source.protocol,
    market: source.market,
    economicRole: source.economicRole,
    source: source.source,
    subgraphId: source.subgraphId,
    deploymentId: source.deploymentId,
    blockNumber: source.blockNumber,
    blockTimestamp: source.blockTimestamp,
    capturedAt: source.capturedAt,
    freshness: source.freshness,
    methodology: source.methodology,
    unknowns: source.unknowns
  }));

  return {
    question: analysis.question,
    scope: { chain: "ethereum", asset: "USDC" },
    observations,
    comparisons: analysis.comparisons,
    evidence,
    caveats: [
      "Rates are neutral percentage-point fields and are not established APY.",
      "Incentives are unknown in the qualified standardized source and must not be treated as zero.",
      ...analysis.unavailable.map((item) => `${item.protocol} is unavailable: ${item.reason}`),
      ...analysis.observations.filter((item) => item.freshness !== "fresh").map((item) => `${item.protocol} is ${item.freshness}; do not use it for a current ranking.`)
    ]
  };
}

function isPoint(value) {
  return value && typeof value === "object" && typeof value.text === "string" && value.text.trim().length > 0 && Array.isArray(value.evidenceRefs) && value.evidenceRefs.length > 0 && value.evidenceRefs.every((ref) => typeof ref === "string" && ref.length > 0);
}

function containsUnsafeClaim(text) {
  return /\bAPY\b/i.test(text) || /\b(incentives?\s+(are\s+)?(zero|0%))\b/i.test(text) || /\b(you should|deposit your|lend your|borrow from|trade your|execute a|sign a transaction|connect your wallet)\b/i.test(text);
}

export function validateModelOutput(output, validEvidenceIds) {
  if (!output || typeof output !== "object" || !output.summary || !isPoint(output.summary)) throw new Error("Model output schema validation failed");
  for (const key of POINT_KEYS) {
    if (!Array.isArray(output[key]) || !output[key].every(isPoint)) throw new Error("Model output schema validation failed");
  }
  if (!Array.isArray(output.evidenceRefs) || !output.evidenceRefs.every((ref) => typeof ref === "string")) throw new Error("Model output schema validation failed");
  const refs = [...output.evidenceRefs, ...output.summary.evidenceRefs, ...POINT_KEYS.flatMap((key) => output[key].flatMap((point) => point.evidenceRefs))];
  const allowed = new Set(validEvidenceIds);
  if (refs.some((ref) => !allowed.has(ref))) throw new Error("Model output referenced unknown evidence");
  const text = [output.summary.text, ...POINT_KEYS.flatMap((key) => output[key].map((point) => point.text))].join(" ");
  if (containsUnsafeClaim(text)) throw new Error("Model output contains an unsupported claim");
  return output;
}

export function renderModelAnswer(output) {
  const join = (points) => points.map((point) => point.text).join(" ");
  const evidenceIds = [...new Set([
    ...output.evidenceRefs,
    ...output.summary.evidenceRefs,
    ...POINT_KEYS.flatMap((key) => output[key].flatMap((point) => point.evidenceRefs))
  ])];
  return {
    mode: "model",
    title: "AI interpretation",
    summary: output.summary.text,
    sections: {
      observe: join(output.observations),
      compare: join(output.comparison),
      returnSource: join(output.returnSource),
      risks: output.risksAndLimitations.map((point) => point.text)
    },
    evidenceIds
  };
}

export const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
export const FRESHNESS = Object.freeze({ fresh: 15 * 60, stale: 24 * 60 * 60 });

export function classifyFreshness(blockTimestamp, capturedAt = Date.now()) {
  if (!Number.isFinite(blockTimestamp)) return "unavailable";
  const ageSeconds = Math.max(0, (new Date(capturedAt).getTime() - blockTimestamp * 1000) / 1000);
  if (ageSeconds <= FRESHNESS.fresh) return "fresh";
  if (ageSeconds <= FRESHNESS.stale) return "stale";
  return "unavailable";
}

export function freshnessAgeSeconds(blockTimestamp, capturedAt = Date.now()) {
  if (!Number.isFinite(blockTimestamp)) return null;
  return Math.max(0, Math.round((new Date(capturedAt).getTime() - blockTimestamp * 1000) / 1000));
}

function variableRate(rates, side) {
  const variable = rates.find((rate) => rate.side === side && rate.type === "VARIABLE");
  return variable?.rate == null ? null : Number(variable.rate);
}

export function normalizeMarket({ protocol, config, meta, protocolData, capturedAt }) {
  if (!meta?.block?.number || !meta?.block?.timestamp) {
    throw new Error(`${protocol}: required Graph block metadata is missing`);
  }
  if (meta.hasIndexingErrors === true) {
    throw new Error(`${protocol}: Graph reports indexing errors`);
  }
  const market = protocolData?.markets?.find((candidate) => candidate.id?.toLowerCase() === config.expectedMarketId);
  if (!market) {
    throw new Error(`${protocol}: expected economic market was not found; refusing to select a different USDC result`);
  }
  if (market.inputToken?.id?.toLowerCase() !== USDC || market.inputToken?.symbol !== "USDC") {
    throw new Error(`${protocol}: selected market does not qualify as Ethereum USDC`);
  }
  if (market.inputTokenBalance == null || market.variableBorrowedTokenBalance == null || market.inputToken?.decimals == null) {
    throw new Error(`${protocol}: required supply/borrow fields are invalid`);
  }
  const suppliedRaw = Number(market.inputTokenBalance);
  const borrowedRaw = Number(market.variableBorrowedTokenBalance);
  const decimals = Number(market.inputToken.decimals);
  if (![suppliedRaw, borrowedRaw, decimals].every(Number.isFinite) || suppliedRaw <= 0 || borrowedRaw < 0 || decimals < 0) {
    throw new Error(`${protocol}: required supply/borrow fields are invalid`);
  }
  const scale = 10 ** decimals;
  const supply = suppliedRaw / scale;
  const borrows = borrowedRaw / scale;
  const blockNumber = Number(meta.block.number);
  const blockTimestamp = Number(meta.block.timestamp);
  const freshness = classifyFreshness(blockTimestamp, capturedAt);
  const rates = Array.isArray(market.rates) ? market.rates : [];
  const supplyRatePct = variableRate(rates, "LENDER");
  const borrowRatePct = variableRate(rates, "BORROWER");
  return {
    protocol,
    chain: "ethereum",
    asset: "USDC",
    marketId: market.id,
    marketName: market.name ?? "Unnamed market",
    economicRole: config.economicRole,
    supply,
    borrows,
    utilizationPct: (borrows / supply) * 100,
    supplyRatePct,
    borrowRatePct,
    incentives: "unknown",
    liquidityProxy: Math.max(0, supply - borrows),
    blockNumber,
    blockTimestamp,
    capturedAt,
    freshness,
    freshnessAgeSeconds: freshnessAgeSeconds(blockTimestamp, capturedAt),
    evidence: {
      evidenceId: `${protocol}:${market.id}`,
      claim: `${protocol} Ethereum USDC lending market observation`,
      protocol,
      market: market.id,
      economicRole: config.economicRole,
      source: "The Graph standardized lending Subgraph",
      subgraphId: config.subgraphId,
      deploymentId: config.deploymentId,
      blockNumber,
      blockTimestamp,
      capturedAt,
      freshness,
      methodology: "raw token balances scaled by inputToken.decimals; utilization = variable borrowed / supplied; variable rates retained as percentage points",
      unknowns: ["incentives"]
    }
  };
}

export function compareObservations(observations) {
  const current = observations.filter((observation) => observation.freshness === "fresh");
  const ranked = current.length === observations.length && current.length > 0;
  const by = (field) => [...(ranked ? current : [])].sort((a, b) => b[field] - a[field]);
  return {
    rankingAllowed: ranked,
    highestSupplyRate: by("supplyRatePct")[0]?.protocol ?? null,
    lowestUtilization: by("utilizationPct").at(-1)?.protocol ?? null,
    mostObservableLiquidity: by("liquidityProxy")[0]?.protocol ?? null,
    rateSpreads: observations.map((observation) => ({
      protocol: observation.protocol,
      spreadPct: observation.borrowRatePct == null || observation.supplyRatePct == null ? null : observation.borrowRatePct - observation.supplyRatePct
    }))
  };
}

export function buildEvidence(observations, comparisons) {
  return {
    claim: "The qualified live observations support a bounded USDC lending comparison.",
    observations,
    interpretationInputs: ["supply", "borrows", "utilizationPct", "supplyRatePct", "borrowRatePct", "liquidityProxy", "freshness"],
    comparisons,
    sources: observations.map((observation) => observation.evidence),
    freshness: observations.length > 0 && observations.every((observation) => observation.freshness === "fresh") ? "fresh" : "caveated"
  };
}

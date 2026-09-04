import fixture from "../fixtures/standardized-lending-2026-08-26.json" with { type: "json" };

const scale = 10 ** fixture.decimals;
const rows = fixture.markets.map((m) => {
  const supply = Number(m.suppliedRaw) / scale;
  const borrows = Number(m.borrowedRaw) / scale;
  return {
    protocol: m.protocol,
    chain: fixture.chain,
    asset: fixture.asset,
    market: m.market,
    supply,
    borrows,
    utilizationPct: (borrows / supply) * 100,
    supplyRatePct: m.supplyRatePct,
    borrowRatePct: m.borrowRatePct,
    incentives: "not observed in standardized record",
    liquidityProxy: supply - borrows,
    timestamp: m.observedAt,
    blockNumber: m.blockNumber,
    evidence: { source: "The Graph standardized lending deployment", subgraphId: m.subgraphId, deploymentId: m.deploymentId }
  };
});

console.log(JSON.stringify({
  methodology: "utilization = borrowed / supplied; rates are APR-like percentage points per audited mapping semantics",
  rows,
  evidence: { claim: "USDC lending markets are comparable on common primitives, with protocol-specific semantic qualification required", observations: rows, interpretationInputs: ["utilizationPct", "supplyRatePct", "borrowRatePct", "liquidityProxy"], timestamp: fixture.capturedAt, sources: rows.map((r) => r.evidence), freshness: "historical capture; requires credentialed live rerun for demo" }
}, null, 2));

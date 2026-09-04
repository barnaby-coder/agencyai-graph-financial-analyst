import fs from "node:fs/promises";

const inputPath = process.argv[2] ?? "../fixtures/standardized-lending-2026-08-26.json";
const raw = JSON.parse(await fs.readFile(new URL(inputPath, import.meta.url), "utf8"));
const fixture = raw.protocols ? {
  capturedAt: raw.capturedAt,
  source: "Fresh authenticated Graph Gateway response",
  chain: "ethereum",
  asset: "USDC",
  decimals: 6,
  markets: raw.protocols.filter((p) => p.status === "pass").map((p) => ({
    protocol: p.protocol,
    market: p.market.id,
    suppliedRaw: p.market.suppliedRaw,
    borrowedRaw: p.market.borrowedRaw,
    supplyRatePct: Number(p.market.supplyRatePct),
    borrowRatePct: Number(p.market.borrowRatePct),
    blockNumber: p.blockNumber,
    observedAt: new Date(Number(p.blockTimestamp) * 1000).toISOString(),
    freshnessSeconds: p.freshnessSeconds,
    subgraphId: p.subgraphId,
    deploymentId: p.deploymentId
  }))
} : raw;

const scale = 10 ** fixture.decimals;
const rows = fixture.markets.map((m) => {
  const supply = Number(m.suppliedRaw) / scale;
  const borrows = Number(m.borrowedRaw) / scale;
  const freshness = m.freshnessSeconds == null ? "historical" : m.freshnessSeconds <= 900 ? "fresh" : m.freshnessSeconds <= 86400 ? "stale" : "unavailable";
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
    freshness,
    evidence: { source: "The Graph standardized lending deployment", subgraphId: m.subgraphId, deploymentId: m.deploymentId }
  };
});

console.log(JSON.stringify({
  methodology: "utilization = borrowed / supplied; rates are APR-like percentage points per audited mapping semantics",
  rows,
  evidence: { claim: "USDC lending markets are comparable on common primitives, with protocol-specific semantic qualification required", observations: rows, interpretationInputs: ["utilizationPct", "supplyRatePct", "borrowRatePct", "liquidityProxy"], timestamp: fixture.capturedAt, sources: rows.map((r) => r.evidence), freshness: "historical capture; requires credentialed live rerun for demo" }
}, null, 2));

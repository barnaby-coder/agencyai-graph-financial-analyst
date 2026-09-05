import fs from "node:fs/promises";

const apiKey = process.env.GRAPH_API_KEY;
if (!apiKey) throw new Error("GRAPH_API_KEY is required");

const gateway = process.env.GRAPH_GATEWAY_URL ?? "https://gateway.thegraph.com/api";
const query = await fs.readFile(new URL("./standardized-lending-query.graphql", import.meta.url), "utf8");
const usdc = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const protocols = [
  { protocol: "Aave V3", subgraphId: "JCNWRypm7FYwV8fx5HhzZPSFaMxgkPuw4TnR3Gpi81zk", deploymentId: "QmcXE5QVcBcvcaJddPxd8mFs6W9xt7STmwfgguoiM6ddAd", slug: "aave-v3", expectedMarketId: "0x98c23e9d8f34fefb1b7bd6a91b7ff122f4e16f5c" },
  { protocol: "Compound III", subgraphId: "AwoxEZbiWLvv6e3QdvdMZw4WDURdGbvPfHmZRc8Dpfz9", deploymentId: "QmNrQoow7pjM3biRnnhzeCaDYhuEbDyjKCpFeNv2oGXnuK", slug: "compound-v3", expectedMarketId: "0xc3d688b66703497daa19211eedff47f25384cdc3a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" },
  { protocol: "Spark Lend", subgraphId: "GbKdmBe4ycCYCQLQSjqGg6UHYoYfbyJyq5WrG35pv1si", deploymentId: "QmTVumjhubXWP8MeDx5g114MRX99E4Gie5mFqVurttF99X", slug: "spark", expectedMarketId: "0x377c3bd93f2a2984e1e7be6a5c22c525ed4a4815" }
];

const discoveryQuery = `{ lendingProtocols(first: 10) { id protocol name slug markets(first: 100) { id inputToken { id symbol decimals } } } }`;

const redact = (value) => String(value).split(apiKey).join("[REDACTED]");
const now = Date.now();
const output = [];

for (const protocol of protocols) {
  const endpoint = `${gateway}/deployments/id/${protocol.deploymentId}`;
  const requestedAt = new Date().toISOString();
  const request = async (body) => fetch(endpoint, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` }, body: JSON.stringify(body) });
  let response = await request({ query, variables: { protocolSlug: protocol.slug, tokenId: usdc, dailyFrom: Math.floor((now - 30 * 86400000) / 1000) } });
  let body = await response.json();
  let usedSlug = protocol.slug;

  if (response.ok && !body.errors?.length && !body.data?.lendingProtocols?.[0]?.markets?.some((m) => m.id?.toLowerCase() === protocol.expectedMarketId)) {
    const discoveryResponse = await request({ query: discoveryQuery });
    const discoveryBody = await discoveryResponse.json();
    const match = discoveryBody.data?.lendingProtocols?.find((p) => p.markets?.some((m) => m.id?.toLowerCase() === protocol.expectedMarketId));
    if (match?.slug) {
      usedSlug = match.slug;
      response = await request({ query, variables: { protocolSlug: usedSlug, tokenId: usdc, dailyFrom: Math.floor((now - 30 * 86400000) / 1000) } });
      body = await response.json();
    }
    body.discovery = { slugs: discoveryBody.data?.lendingProtocols?.map((p) => p.slug) ?? [], matchedSlug: match?.slug ?? null };
  }

  if (!response.ok || body.errors?.length) {
    output.push({ ...protocol, requestedAt, usedSlug, status: "error", httpStatus: response.status, errors: (body.errors ?? [{ message: `HTTP ${response.status}` }]).map((e) => redact(e.message)) });
    continue;
  }

  const meta = body.data?._meta;
  const market = body.data?.lendingProtocols?.[0]?.markets?.find((m) => m.id?.toLowerCase() === protocol.expectedMarketId);
  const rates = market?.rates ?? [];
  const lender = rates.find((r) => r.side === "LENDER" && r.type === "VARIABLE")?.rate ?? rates.find((r) => r.side === "LENDER")?.rate ?? null;
  const borrower = rates.find((r) => r.side === "BORROWER" && r.type === "VARIABLE")?.rate ?? rates.find((r) => r.side === "BORROWER")?.rate ?? null;
  const supplied = market?.inputTokenBalance ?? null;
  const borrowed = market?.variableBorrowedTokenBalance ?? null;
  const blockTimestamp = meta?.block?.timestamp ? Number(meta.block.timestamp) * 1000 : null;
  output.push({
    ...protocol,
    requestedAt,
    usedSlug,
    status: market ? "pass" : "expected-market-not-found",
    httpStatus: response.status,
    blockNumber: meta?.block?.number ?? null,
    blockTimestamp: meta?.block?.timestamp ?? null,
    hasIndexingErrors: meta?.hasIndexingErrors ?? null,
    market: market ? { id: market.id, name: market.name, inputToken: market.inputToken, outputToken: market.outputToken, suppliedRaw: supplied, borrowedRaw: borrowed, supplyRatePct: lender, borrowRatePct: borrower, rates } : null,
    freshnessSeconds: blockTimestamp ? Math.max(0, Math.round((Date.now() - blockTimestamp) / 1000)) : null,
    snapshotCount: body.data?.marketDailySnapshots?.length ?? 0,
    discovery: body.discovery ?? null
  });
}

process.stdout.write(JSON.stringify({ capturedAt: new Date().toISOString(), gateway, protocols: output }, null, 2));

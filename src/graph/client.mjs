import { buildEvidence, compareObservations, normalizeMarket, USDC } from "../financial/normalize.mjs";
import { STANDARDIZED_LENDING_QUERY } from "./standardized-query.mjs";

export const PROTOCOLS = Object.freeze([
  { protocol: "Aave V3", slug: "aave-v3", subgraphId: "JCNWRypm7FYwV8fx5HhzZPSFaMxgkPuw4TnR3Gpi81zk", deploymentId: "QmcXE5QVcBcvcaJddPxd8mFs6W9xt7STmwfgguoiM6ddAd", expectedMarketId: "0x98c23e9d8f34fefb1b7bd6a91b7ff122f4e16f5c", economicRole: "Aave Ethereum USDC supply market" },
  { protocol: "Compound III", slug: "compound-v3", subgraphId: "AwoxEZbiWLvv6e3QdvdMZw4WDURdGbvPfHmZRc8Dpfz9", deploymentId: "QmNrQoow7pjM3biRnnhzeCaDYhuEbDyjKCpFeNv2oGXnuK", expectedMarketId: "0xc3d688b66703497daa19211eedff47f25384cdc3a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", economicRole: "Compound III USDC base market; composite ID encodes Comet plus base token" },
  { protocol: "Spark Lend", slug: "spark-lend", subgraphId: "GbKdmBe4ycCYCQLQSjqGg6UHYoYfbyJyq5WrG35pv1si", deploymentId: "QmTVumjhubXWP8MeDx5g114MRX99E4Gie5mFqVurttF99X", expectedMarketId: "0x377c3bd93f2a2984e1e7be6a5c22c525ed4a4815", economicRole: "Spark Ethereum USDC supply market" }
]);

async function requestGraph({ fetchImpl, endpoint, apiKey, body, timeoutMs, retries }) {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchImpl(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
        body: JSON.stringify(body),
        signal: controller.signal
      });
      const payload = await response.json();
      if ((response.status === 429 || response.status >= 500) && attempt < retries) continue;
      if (!response.ok || payload.errors?.length) {
        throw new Error(`Graph query failed for ${endpoint.split("/deployments/")[1] ?? "deployment"} (HTTP ${response.status})`);
      }
      return payload;
    } catch (error) {
      if (attempt >= retries) {
        if (error.name === "AbortError") throw new Error("Graph query timed out");
        throw new Error(error.message.replace(apiKey, "[REDACTED]"));
      }
    } finally {
      clearTimeout(timer);
    }
  }
  throw new Error("Graph query failed");
}

export async function fetchProtocolObservation(config, { apiKey, fetchImpl = fetch, gateway = "https://gateway.thegraph.com/api", capturedAt = new Date().toISOString(), timeoutMs = 12000, retries = 1 } = {}) {
  if (!apiKey) throw new Error("GRAPH_API_KEY is required at runtime");
  const response = await requestGraph({ fetchImpl, endpoint: `${gateway}/deployments/id/${config.deploymentId}`, apiKey, timeoutMs, retries, body: { query: STANDARDIZED_LENDING_QUERY, variables: { protocolSlug: config.slug, tokenId: USDC, dailyFrom: Math.floor((new Date(capturedAt).getTime() - 30 * 86400000) / 1000) } } });
  const data = response.data;
  const protocolData = data?.lendingProtocols?.[0];
  if (!protocolData) throw new Error(`${config.protocol}: Graph returned no protocol for slug ${config.slug}`);
  return normalizeMarket({ protocol: config.protocol, config, meta: data._meta, protocolData, capturedAt });
}

export async function runLendingAnalysis(question, { apiKey = process.env.GRAPH_API_KEY, fetchImpl = fetch, gateway, capturedAt, timeoutMs, retries } = {}) {
  if (!apiKey) throw new Error("GRAPH_CREDENTIAL_MISSING");
  const settled = await Promise.allSettled(PROTOCOLS.map((config) => fetchProtocolObservation(config, { apiKey, fetchImpl, gateway, capturedAt, timeoutMs, retries })));
  const observations = [];
  const unavailable = [];
  settled.forEach((result, index) => {
    if (result.status === "fulfilled") observations.push(result.value);
    else unavailable.push({ protocol: PROTOCOLS[index].protocol, reason: result.reason?.message ?? "Graph source unavailable" });
  });
  const comparisons = compareObservations(observations);
  return {
    question,
    capturedAt: capturedAt ?? new Date().toISOString(),
    observations,
    unavailable,
    comparisons,
    evidence: buildEvidence(observations, comparisons),
    status: observations.length === 0 ? "unavailable" : unavailable.length ? "partial" : "ready"
  };
}

export { requestGraph };

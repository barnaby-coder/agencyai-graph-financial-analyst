# Graph Financial Analyst Feasibility

_Spike date: 2026-09-04 UTC. Scope: Ethereum USDC lending, read-only._

## 1. Verdict

**CONDITIONAL GO.** The prior bounded Graph benchmark establishes a credible
three-protocol shape and deterministic comparison path, but this spike could
not complete a fresh authenticated query: no `GRAPH_API_KEY` was present in
the environment and the Gateway returned `auth error: missing authorization
header`. A hackathon submission is viable once a credentialed live rerun
confirms the same fields and freshness during the event.

The independence boundary is clean: this repository contains no copied
AgencyAI production code and no execution, wallet, policy, or capital-control
surface.

## 2. Bounty fit

The strongest fit is **Best AI Tooling or AI Use Case with The Graph — From
Scratch / Start Fresh**. The intended demo is a natural-language financial
research agent that uses Graph Subgraphs as live blockchain data, performs
meaningful deterministic analysis, and explains the result. The relevant
requirements are: The Graph must be load-bearing; live data from a Graph
provider is required; the app must do meaningful work beyond printing raw
results; and the code must be open-sourced with a runnable README, public repo,
and 2–4 minute demo video.

The second strong fit is **Best Use of Composable or Standardized Graph
Products**. The project can qualify by meaningfully building on a standardized
schema and showing one query pattern across multiple lending protocols. Its
requirements additionally require either two or more Graph products or a
standardized schema, live provider data, a clear explanation of the standards
leverage, a public repo, and a 2–4 minute video.

Currently unsatisfied: this repo is private (it must become public for
submission), and this spike has not yet captured a fresh authenticated live
response. It also does not use two Graph products; that is not necessary for
the AI track if Subgraphs are load-bearing, but it means the standardized-data
track should rely on the shared schema and not claim composition.

Official requirements checked 2026-09-04:

- [ETHGlobal The Graph prize page](https://ethglobal.com/events/ethonline2026/prizes/the-graph)
- [The Graph hackathon resources](https://thegraph.com/blog/hackathon-resources/)

## 3. Graph capability decision

| Capability | Decision | Rationale |
|---|---|---|
| Subgraphs | **Use** | Best fit for current lending market state, rates, balances, snapshots, events, and `_meta` provenance. |
| Standardized schemas/products | **Use** | Lending/CDP 3.1.0 gives a portable market/rate/snapshot shape. It reduces adapter count, but rate semantics and market roles still require qualification. |
| Subgraph MCP | **Defer for the hot path; test as discovery layer** | Official MCP can search deployments, inspect schemas, and execute queries. Use it for agent discovery or long-tail questions; use typed, pinned GraphQL for repeatable comparison. No MCP server/tool was available in this execution environment, so operational reliability remains unverified. |
| Token API | **Defer** | Relevant for balances, transfers, holders, and token metadata, but not needed to answer the bounded lending question. Add only for wallet/asset context or flow evidence. |
| Subgraph Composition | **Defer** | Same-chain composition of up to five immutable sources could create a future curated intelligence source. It adds deployment and schema constraints without helping the first two-protocol proof. |
| Substreams | **Defer** | Useful for high-throughput event flow, liquidations, or custom real-time pipelines. Existing standardized snapshots cover the first slice; no custom stream is needed yet. |
| x402 | **Reject for this slice** | Officially useful for autonomous per-query USDC payment, but it adds wallet/payment operations and is not required to prove financial intelligence. Do not add it for bounty points. |

Official capability sources checked 2026-09-04:

- [Standardized Subgraphs](https://thegraph.com/docs/en/subgraphs/existing-subgraphs/standard-subgraphs/)
- [Subgraph MCP](https://thegraph.com/docs/en/subgraphs/tooling/subgraph-mcp/introduction/)
- [Subgraph Composition](https://thegraph.com/docs/en/subgraphs/guides/subgraph-composition/)
- [Subgraph Gateway query/authentication](https://thegraph.com/docs/en/gateways/subgraphs/consumer-side/serving-queries/)
- [Subgraph Gateway x402](https://thegraph.com/docs/en/subgraphs/tooling/x402-payments/)
- [The Graph AI overview](https://thegraph.com/docs/en/ai-overview/)

## 4. Protocol matrix

| Protocol | Graph source / live availability | Useful metrics | History | Normalization / freshness | Gaps | Demo recommendation |
|---|---|---|---|---|---|---|
| Aave V3 | Standardized candidate `JCNWRypm7FYwV8fx5HhzZPSFaMxgkPuw4TnR3Gpi81zk`, deployment `QmcXE5QVcBcvcaJddPxd8mFs6W9xt7STmwfgguoiM6ddAd`; prior runtime record reported current and no indexing errors | USDC market identity, supplied, variable borrow, lender/borrower rates, TVL, blocks/timestamps | 30 daily records in prior benchmark | Easy after raw balance scaling; utilization `borrowed/supplied`; rate is APR-like percentage points, not safely APY | Standardized rate schema comment conflicts with implementation semantics; align observation times | **Include** |
| Compound III | Standardized candidate `AwoxEZbiWLvv6e3QdvdMZw4WDURdGbvPfHmZRc8Dpfz9`, deployment `QmNrQoow7pjM3biRnnhzeCaDYhuEbDyjKCpFeNv2oGXnuK`; prior record advancing/current, no indexing errors | Correct USDC *base* market has supplied, variable borrow, lender/borrower rates, TVL | 30 daily records in prior benchmark | Moderate: composite market ID and single-base-token borrow model need role qualification | Do not select the USDC collateral market inside the wstETH Comet; authoritative contract reconciliation pending | **Include after role check** |
| Morpho | Official Subgraphs are deprecated/not maintained since March 2025 per the reviewed coverage notes; no current Graph source was qualified | Current Morpho data may be rich elsewhere, but not proven Graph-native here | Not qualified | High / unavailable on current Graph path | Morpho Blue/vault semantics and current source identity | **Exclude from Graph proof; revisit only if a current Graph source is found** |
| Spark Lend | Standardized candidate `GbKdmBe4ycCYCQLQSjqGg6UHYoYfbyJyq5WrG35pv1si`, deployment `QmTVumjhubXWP8MeDx5g114MRX99E4Gie5mFqVurttF99X`; prior record advancing, no indexing errors | Supplied, borrowed, rates, TVL, blocks/timestamps | 30 daily records in prior benchmark | Easy enough after mapping-family validation; prior latest record was ~30 minutes old | Current authority and rate reconciliation pending | **Include as preferred third protocol if live rerun passes** |

The prior benchmark’s corrected common query executed across Aave, Compound,
and Spark after removing unsupported `Market.lastUpdateTimestamp`; the common
schema portability was recorded as 3/3. That is strong interoperability
evidence, not proof that every field has identical economic meaning.

## 5. Live evidence and experiments

### Experiment 1 — Graph access

Query attempted 2026-09-04 UTC against the official Gateway, using the prior
Compound deployment:

```http
POST https://gateway.thegraph.com/api/deployments/id/QmNrQoow7pjM3biRnnhzeCaDYhuEbDyjKCpFeNv2oGXnuK
content-type: application/json

{"query":"{ _meta { block { number timestamp } } }"}
```

Response shape:

```json
{"errors":[{"message":"auth error: missing authorization header"}]}
```

The request reached the Graph Gateway, but no data query was authorized.
Official docs say API-key requests use `Authorization: Bearer <API_KEY>` and
x402 requests use a separate paid endpoint. No key was present; no credential
was written or guessed. The required next run is the same request with
`GRAPH_API_KEY` injected only at runtime, recording `_meta.block.number`,
`_meta.block.timestamp`, response time, and errors.

The prior live benchmark record (captured 2026-08-26 UTC in the canonical
research repo) reported `hasIndexingErrors=false` and successful standardized
responses for all three candidates. It is retained here as historical supplied
evidence, not presented as fresh data.

### Experiment 2 — Cross-protocol normalization

The exact query is [standardized-lending-query.graphql](../spike/graph/standardized-lending-query.graphql).
The prior run showed one shared incompatibility (`lastUpdateTimestamp`), then
3/3 execution after removing that field. The fixture in
[standardized-lending-2026-08-26.json](../spike/fixtures/standardized-lending-2026-08-26.json)
contains only non-secret captured values.

The minimal common representation is:

```text
protocol, chain, asset, market, supply, borrows, utilizationPct,
supplyRatePct, borrowRatePct, incentives, liquidityProxy, timestamp,
blockNumber, evidence
```

Normalization is credible if the adapter records units, economic role, rate
semantics, and source identity. It would be misleading to label the rates APY
or to compare Compound’s collateral market with its USDC base market.

### Experiment 3 — Subgraph MCP

The official interface is documented as supporting subgraph discovery,
schema inspection, GraphQL query execution, query volumes, and natural-
language questions. This environment exposed no callable Subgraph MCP server,
so no execution test could be performed. Recommendation: use MCP in the demo
only for discovery/schema inspection if a supported client can authenticate
reliably; keep the comparison path on explicit typed GraphQL queries and log
the selected deployment. MCP is valuable agent plumbing, not a substitute for
deterministic source qualification.

### Experiment 4 — Deterministic comparison

Run with `node spike/compare/compare.mjs`. The script calculates supply,
borrows, utilization, and a liquidity proxy from the captured raw balances;
the LLM is not involved. Example results from the fixture:

| Protocol | Supply | Borrows | Utilization | Lender rate | Borrower rate | Liquidity proxy |
|---|---:|---:|---:|---:|---:|---:|
| Aave V3 | 2,192,292,524.17 | 2,028,587,325.55 | 92.53% | 3.88% | 4.66% | 163,705,198.62 |
| Compound III | 364,668,871.64 | 329,332,209.20 | 90.31% | 4.23% | 5.12% | 35,336,662.44 |
| Spark Lend | 22,867,931.82 | 21,055,415.09 | 92.07% | 3.47% | 4.19% | 1,812,516.73 |

These are historical observations and not a current recommendation. Incentives
were not present in the supplied standardized record; they must be reported
as unknown rather than zero.

### Experiment 5 — Evidence object

The script emits a minimal evidence object containing `claim`, `observations`,
`interpretationInputs`, capture timestamp, source IDs, and freshness. This is
enough to make every explanation point back to a market observation and
deployment. Add query hash and schema/methodology versions in the next build.

## 6. Recommended demo scope

One Ethereum-only question flow: user asks the target USDC question; an agent
selects a pinned standardized lending query; Graph returns Aave and Compound
(Spark if the rerun is healthy); deterministic code computes utilization,
lender/borrower rates, available-liquidity proxy, and an explicit organic /
incentive-unknown label; the agent explains return source and risk with inline
evidence links, block/time, freshness, and caveats.

The smallest convincing screen is a comparison table plus an evidence drawer.
No wallet connection, transaction, capital movement, large dashboard, or
multi-chain selector is needed.

## 7. Hackathon-only technical architecture

```text
plain-language question
  -> small intent/orchestrator
  -> pinned Graph standardized Subgraph queries
  -> protocol-role/unit validation
  -> deterministic normalizer + comparison
  -> evidence object
  -> agent explanation with citations and risk caveats
```

Graph Subgraphs are load-bearing. MCP is an optional discovery edge, not the
source of truth for arithmetic. Token API, Composition, Substreams, and x402
remain outside the first vertical slice.

## 8. Explicit non-build list

Do not build wallet signing, transactions, live capital movement, Capital
Control, policy/authorization, brokerage or Giza integrations, IBKR,
portfolio execution, x402 payments, broad multi-chain support, a large UI,
custom Subgraphs, custom Substreams, or copied code from private repositories.

## 9. Risks / unknowns

- Fresh live qualification is still missing because the environment lacks a
  Graph API key.
- Standardized rate values are APR-like percentage points in audited mappings;
  the schema’s APY wording is unsafe without qualification.
- Compound market IDs encode economic role; wrong role selection produces
  plausible but irrelevant results.
- Snapshot continuity and completeness must be measured at demo time.
- Incentives are not covered by the minimal standardized record and need a
  separate source or an honest unknown label.
- MCP authentication, tool names, rate limits, and failure recovery need a
  real client test.
- A private repo cannot be submitted; make it public only after review.

## 10. Estimated remaining build effort

Assuming Graph credentials and a stable model endpoint are available:

| Workstream | Estimate |
|---|---:|
| Data integration and live qualification | 1–2 days |
| Deterministic analytics and evidence | 1 day |
| Agent layer / tool orchestration | 1–2 days |
| Minimal UI/demo | 1 day |
| Testing and failure cases | 0.5–1 day |
| Submission materials, public README, video | 0.5–1 day |

Total: approximately 5–8 focused engineering days after the credentialed
rerun passes.

## 11. Recommended next milestone

Obtain a least-privilege Graph API key outside the repository, rerun the same
query against Aave, Compound, and Spark, capture `_meta` and response errors,
validate USDC market roles and units, and then review whether the repo should
be made public. If two protocols pass with current timestamps and the
normalizer remains semantically honest, proceed to the tiny agent/UI slice.

## Canonical research inputs inspected

Read-only inputs from `barnaby-coder/graph-protocol-analysis` included:

- `project/onchain-financial-intelligence/ARCHITECTURE.md`
- `project/onchain-financial-intelligence/BUILD_MAP.md`
- `project/onchain-financial-intelligence/GRAPH_CAPABILITY_MATRIX.md`
- `project/onchain-financial-intelligence/CODEX_HANDOFF.md`
- `docs/GRAPH_STANDARDIZED_LENDING_BENCHMARK_V1.md`
- `docs/STANDARDIZED_LENDING_RATE_SEMANTICS_AUDIT.md`
- `docs/PROTOCOL_COVERAGE_MAP.md`

`GRAPH_FIRST_PRINCIPLES.md` was requested but does not exist at the specified
path in that repository; this absence is recorded rather than inferred around.

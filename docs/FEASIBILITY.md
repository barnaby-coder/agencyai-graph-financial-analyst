# Graph Financial Analyst Feasibility

_Spike date: 2026-09-04 UTC. Scope: Ethereum USDC lending, read-only._

## 1. Verdict

**GO.** A fresh authenticated query against the three identified Ethereum
standardized lending deployments returned the intended USDC markets for Aave
V3, Compound III, and Spark Lend. All three returned the same Graph block
metadata, `hasIndexingErrors=false`, 30 daily snapshots, sufficient balances
for utilization, variable lender/borrower rates, and freshness of 5–6 seconds
at capture. The common normalizer ran on those live observations and retained
source/deployment provenance.

The GO is for the bounded two-to-three protocol hackathon vertical slice only.
It does not authorize full product implementation.

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

Currently unsatisfied for eventual submission: this repo is private and must
be made public before submission, and a 2–4 minute demo video plus runnable
README still need to be produced. The project uses one Graph product family
(Subgraphs) and a standardized schema; it must not claim Composition or a
two-product implementation.

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
| Aave V3 | Standardized candidate `JCNWRypm7FYwV8fx5HhzZPSFaMxgkPuw4TnR3Gpi81zk`, deployment `QmcXE5QVcBcvcaJddPxd8mFs6W9xt7STmwfgguoiM6ddAd`; live pass at block `25905549`, `hasIndexingErrors=false` | USDC market identity, supplied, variable borrow, lender/borrower rates, TVL, blocks/timestamps | 30 live daily snapshots returned | Easy after raw balance scaling; live utilization `92.79%`; rate is APR-like percentage points, not APY | Standardized rate schema comment conflicts with implementation semantics | **Include** |
| Compound III | Standardized candidate `AwoxEZbiWLvv6e3QdvdMZw4WDURdGbvPfHmZRc8Dpfz9`, deployment `QmNrQoow7pjM3biRnnhzeCaDYhuEbDyjKCpFeNv2oGXnuK`; live pass at block `25905549`, `hasIndexingErrors=false` | Correct USDC *base* market supplied, variable borrow, lender/borrower rates, TVL | 30 live daily snapshots returned | Moderate but honest after selecting composite ID beginning with Comet `0xc3d688...`; live utilization `90.30%` | Query initially surfaced the wrong collateral market when not role-qualified; single-base-token model has no stable-borrow analogue | **Include** |
| Morpho | Official Subgraphs are deprecated/not maintained since March 2025 per the reviewed coverage notes; no current Graph source was qualified | Current Morpho data may be rich elsewhere, but not proven Graph-native here | Not qualified | High / unavailable on current Graph path | Morpho Blue/vault semantics and current source identity | **Exclude from Graph proof; revisit only if a current Graph source is found** |
| Spark Lend | Standardized candidate `GbKdmBe4ycCYCQLQSjqGg6UHYoYfbyJyq5WrG35pv1si`, deployment `QmTVumjhubXWP8MeDx5g114MRX99E4Gie5mFqVurttF99X`; live pass at block `25905549`, `hasIndexingErrors=false`; discovered slug `spark-lend` | Supplied, borrowed, rates, TVL, blocks/timestamps | 30 live daily snapshots returned | Easy enough after mapping-family validation; live utilization `92.20%` | Current authority and rate reconciliation remain application caveats | **Include** |

The prior benchmark’s corrected common query executed across Aave, Compound,
and Spark after removing unsupported `Market.lastUpdateTimestamp`; the common
schema portability was recorded as 3/3. That is strong interoperability
evidence, not proof that every field has identical economic meaning.

## 5. Live evidence and experiments

### Experiment 1 — Graph access

Authenticated query run 2026-09-04 UTC against the official Gateway for all
three prior deployments. The credential was retrieved from the unlocked
Barnaby Vault item `The graph query api`, held in memory, and injected only as
the runtime `Authorization: Bearer` value. It was not printed, captured in a
fixture, or written to source.

```http
POST https://gateway.thegraph.com/api/deployments/id/QmNrQoow7pjM3biRnnhzeCaDYhuEbDyjKCpFeNv2oGXnuK
content-type: application/json

{"query":"query StandardizedLendingUsdc($protocolSlug: String!, $tokenId: Bytes!, $dailyFrom: Int!) { _meta { block { number timestamp } hasIndexingErrors } lendingProtocols(where: { slug: $protocolSlug }, first: 1) { ... } marketDailySnapshots(...) { ... } }","variables":{"protocolSlug":"compound-v3","tokenId":"0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48","dailyFrom":1785952110}}
```

The full non-secret query is [standardized-lending-query.graphql](../spike/graph/standardized-lending-query.graphql).
Representative sanitized response metadata:

```json
{"capturedAt":"2026-09-04T17:49:21.103Z","blockNumber":25905549,"blockTimestamp":1788544115,"hasIndexingErrors":false,"snapshotCount":30}
```

All three authenticated requests returned HTTP 200, `hasIndexingErrors=false`,
the same current block `25905549`, and 30 daily snapshots. The sanitized full
capture is [live-validation-2026-09-04.json](../spike/fixtures/live-validation-2026-09-04.json).
No authentication headers are stored there.

### Experiment 2 — Cross-protocol normalization

The exact query is [standardized-lending-query.graphql](../spike/graph/standardized-lending-query.graphql).
The live fixture contains only non-secret captured values. The normalizer
selected the expected market IDs rather than trusting the first market returned:

- Aave V3: `0x98c23e9d8f34fefb1b7bd6a91b7ff122f4e16f5c`
- Compound III USDC base market: `0xc3d688b66703497daa19211eedff47f25384cdc3a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48`
- Spark Lend: `0x377c3bd93f2a2984e1e7be6a5c22c525ed4a4815`

Spark required one discovery request to learn that its live protocol slug is
`spark-lend`, not the earlier guessed `spark`. This was a bounded query-
discovery correction, not a data-source substitution.

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

Run with `node spike/compare/compare.mjs ../fixtures/live-validation-2026-09-04.json`.
The script calculates supply, borrows, utilization, and a liquidity proxy from
fresh raw balances; the LLM is not involved.

| Protocol | Supply | Borrows | Utilization | Lender rate | Borrower rate | Liquidity proxy |
|---|---:|---:|---:|---:|---:|---:|
| Aave V3 | 2,297,682,194.01 | 2,132,113,602.90 | 92.79% | 3.54% | 4.24% | 165,568,591.11 |
| Compound III | 371,551,895.22 | 335,520,518.16 | 90.30% | 4.21% | 5.09% | 36,031,377.06 |
| Spark Lend | 25,201,888.87 | 23,237,290.75 | 92.20% | 3.54% | 4.27% | 1,964,598.11 |

These are captured observations, not a current investment recommendation.
Incentives were not present in the qualified standardized record; they are
reported as unknown rather than zero.

### Freshness classification

The demo classifies Graph observations as `fresh` at <=15 minutes, `stale` at
>15 minutes and <=24 hours, and `unavailable` when older than 24 hours or when
block metadata is absent. The 15-minute threshold is intentionally stricter
than the observed daily snapshot cadence because a “right now” comparison
needs current market state; the live run measured 5–6 seconds. A current
comparison must fail closed or clearly caveat stale rows.

### Experiment 5 — Evidence object

The script emits a minimal evidence object containing `claim`, `observations`,
`interpretationInputs`, capture timestamp, source IDs, and freshness. This is
enough to make every explanation point back to a market observation and
deployment. Add query hash and schema/methodology versions in the next build.

## 6. Recommended demo scope

One Ethereum-only question flow: user asks the target USDC question; an agent
selects a pinned standardized lending query; Graph returns Aave, Compound, and
Spark; deterministic code computes utilization, lender/borrower rates,
available-liquidity proxy, and an explicit organic / incentive-unknown label;
the agent explains return source and risk with inline evidence links,
block/time, freshness, and caveats. The app should refuse to rank a row whose
data is `stale` or `unavailable` without an explicit caveat.

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

- Standardized rate values are APR-like percentage points in audited mappings;
  the schema’s APY wording is unsafe without qualification.
- Compound market IDs encode economic role; the validator must continue to
  select the base-market composite ID, because the first USDC result was a
  plausible but irrelevant collateral market.
- Snapshot continuity and completeness must be measured at demo time.
- Incentives are not covered by the minimal standardized record and need a
  separate source or an honest unknown label.
- MCP authentication, tool names, rate limits, and failure recovery still
  need a real client test.
- The runtime key path is proven through the approved Vault, but production
  deployment still needs a secret-injection and rotation procedure.
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

Review this GO decision, then implement only the tiny hackathon vertical slice:
keep the authenticated runtime secret injection, pin the three qualified
deployments and market IDs, add fail-closed freshness handling, and expose the
deterministic comparison to a minimal agent-facing interaction. Make the repo
public only after review and before submission. Do not add execution or
capital-control capabilities.

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

# ETHOnline 2026 submission package

This is prepared for review. No ETHGlobal submission has been made.

## Recommended title

**AgencyAI — Graph-Grounded Financial Analyst**

The repository and product name remain **AgencyAI Graph Financial Analyst**;
the submission title makes the AI and Graph relationship explicit.

## One-line description

An AI financial analyst that turns live Ethereum lending data from The Graph
into deterministic, inspectable evidence before AI interpretation.

## Short project description

Onchain financial markets are transparent, but comparing them consistently is
hard: market roles, rates, utilization, liquidity, and missing incentives do
not arrive as one trusted explanation. AgencyAI Graph Financial Analyst lets a
user ask a bounded financial question about Ethereum USDC lending. It queries
live Graph Subgraphs for Aave V3, Compound III, and Spark Lend, qualifies the
correct markets, normalizes comparable observations, and calculates the core
metrics deterministically. An AI model then interprets a compact evidence
packet rather than raw Graph responses or an opaque data dump. The answer
retains protocol, market, block, timestamp, freshness, methodology, and stable
evidence references that a judge can inspect. Unsupported or ungrounded model
output is rejected, with a deterministic evidence-first fallback keeping the
read-only experience useful. The project does not execute transactions or
provide portfolio advice.

## Technical description

The application runs as a Cloudflare Worker serving the single-page UI and
server-side APIs. A typed GraphQL query is sent to qualified standardized
lending deployments for Ethereum. Protocol-specific qualification is
deterministic; Compound III additionally requires the validated USDC base
market rather than a collateral representation. The server preserves Graph
block metadata and indexing-error state, applies the explicit freshness gate,
then normalizes supplied liquidity, borrows, utilization, rate fields, and an
observable liquidity proxy. It creates an evidence object before constructing
a compact structured packet for the OpenAI Responses API using
`gpt-5.6-luna`. The model returns structured interpretation sections and stable
evidence references. The server validates the schema, references, unsupported
claims, APY language, incentives handling, and execution language before the
answer reaches the browser. Provider failure, timeout, stale data, or invalid
output uses the deterministic fallback. GitHub Actions deploys the same
Node-compatible Worker to Cloudflare.

## Why The Graph

The Graph is load-bearing, not a technology badge. Current market observations
originate from live Graph data; without those observations the application
cannot produce its current comparison. Standardized lending representations
let Aave V3, Compound III, and Spark Lend feed one qualification,
normalization, comparison, and evidence pipeline. Graph data is transformed
into financial evidence rather than merely displayed, and source, block, and
freshness provenance remains attached through the AI explanation and evidence
view.

## What is different

Typical simple pattern:

```text
data → LLM → answer
```

AgencyAI:

```text
The Graph → qualified observations → deterministic calculations → evidence
→ AI interpretation → grounding validation → inspectable answer
```

AI is used for synthesis, interpretation, and communication. Deterministic
code owns market qualification, arithmetic, comparison, freshness, and
evidence construction. This keeps the authoritative financial observations
inspectable without removing the value of a natural-language explanation.

## Bounty fit and current requirements

The official ETHOnline 2026 prize page lists two relevant The Graph prizes,
each with a $5,000 pool and awards of $2,500, $1,500, and $1,000:

- **Best AI Tooling or AI Use Case with The Graph (From Scratch)**
- **Best Use of Composable or Standardized Graph Products**

The official requirements currently relevant here are: use The Graph as a
load-bearing source or target; consume live provider data; do meaningful work
beyond printing a raw query result; publish open-source code with a clear
README; and submit a public repository plus a 2–4 minute demo video. The
standardized-products prize additionally requires either composition of two or
more Graph products or meaningful use of a standardized schema, and requires
the standards leverage to be clear.

ETHGlobal's general submission requirements include a project title,
description, and repository link in the Hacker Dashboard. Up to three partner
prizes may be selected. The demo video must be 2–4 minutes; ETHGlobal says
videos outside that range are rejected during upload, with a minimum 720p
export and no AI voiceover. General judging categories are technicality,
originality, practicality, usability, and WOW factor.

The project strongly matches the technical requirements of both prizes. It
uses live standardized Subgraph data across three lending protocols and adds
natural-language interpretation, deterministic analysis, and evidence
grounding. It does not claim MCP, Composition, Token API, Substreams, or x402.

There is one eligibility decision gate. ETHGlobal's current rules say the
From Scratch pool requires all project-specific work to begin after the
hackathon officially starts, and that projects built before the event do not
qualify for partner prizes. This repository's initial setup commit is dated
2026-09-03; the event listing shows ETHOnline 2026 beginning 2026-09-04. The
From Scratch selection therefore requires confirmation from ETHGlobal. The
repository was intentionally kept separate from private AgencyAI production
repositories, so Continuity eligibility should not be claimed without a
separate determination that this qualifies as extending an existing product.

ETHGlobal also asks teams to disclose AI-tool use and distinguish new work from
reused work. Include that disclosure in the final dashboard submission.

Official sources, accessed 2026-09-05 UTC:

- [ETHOnline 2026 prizes](https://ethglobal.com/events/ethonline2026/prizes)
- [ETHOnline 2026 rules and submission details](https://ethglobal.com/events/ethonline2026/info/details)
- [The Graph hackathon resources](https://thegraph.com/blog/hackathon-resources/)

## Primary bounty response

AgencyAI is a read-only financial research application that uses The Graph as
its live source of blockchain data. A natural-language question triggers live
Graph Subgraph queries for three Ethereum USDC lending markets. The app
qualifies protocol and market identity, performs deterministic financial
normalization and comparison, and gives the resulting evidence to an AI model
for explanation. This is meaningful work beyond displaying a query result: the
model communicates a grounded comparison, return-source explanation, and
limitations, while evidence references are validated before acceptance. The
public repository, live demo, and 2–4 minute video satisfy the technical
submission shape. The From Scratch timing/pool requirement remains pending
official clarification because setup work predates the displayed event start.

## Secondary bounty response

The project uses The Graph's standardized lending data path to put Aave V3,
Compound III, and Spark Lend through one common financial-analysis pipeline.
The same query shape and evidence contract support shared primitives such as
supply, borrows, utilization, rate fields, freshness, and provenance, while
explicit qualification preserves protocol-specific economic meaning. This
reduces the need for three separate analyst implementations and makes the
leverage of a shared schema visible in the demo. The submission relies on
standardized Subgraphs and live Graph provider data; it does not claim Graph
Composition or any other unimplemented Graph product.

## Current limitations

- Ethereum mainnet and USDC lending only.
- Aave V3, Compound III, and Spark Lend only.
- Read-only research and explanation; no wallet, transactions, or execution.
- Incentives may remain unknown in the qualified source.
- Rates use neutral percentage-point semantics rather than asserted APY.
- The liquidity figure is an observable comparison proxy, not a guarantee of
  withdrawal or execution liquidity.
- Freshness and live-provider failures can produce a caveated fallback or
  fail-closed result.
- The result is not portfolio advice, a forecast, or a recommendation to move
  capital.

## Technology

The Graph, Ethereum, Aave V3, Compound III, Spark Lend, OpenAI Responses API,
`gpt-5.6-luna`, JavaScript, Node.js, Cloudflare Workers, and GitHub Actions.

## Links

- Repository: <https://github.com/barnaby-coder/agencyai-graph-financial-analyst>
- Live demo: <https://capital.agencyai.me>

## Judge Q&A

### 1. Why use AI if the calculations are deterministic?

The calculations should be deterministic; the hard part for a user is
understanding and comparing the result. AI provides natural-language synthesis
and explanation after the financial evidence has been qualified.

### 2. Why The Graph instead of querying contracts directly?

The Graph supplies indexed, structured, queryable market data with source and
block provenance. Its standardized lending shape lets one analysis path cover
multiple protocols without making the model infer each protocol's raw storage
layout.

### 3. What happens if the AI hallucinates?

The model receives only a compact deterministic evidence packet and must cite
stable evidence IDs. Unknown IDs, unsupported claims, forbidden APY or
execution language, malformed output, and provider failures are rejected in
favor of deterministic fallback.

### 4. How do you know the markets are comparable?

The server qualifies each protocol and maps the shared fields explicitly. The
Compound result must be the Ethereum USDC base market; a collateral
representation is rejected. Remaining semantic limitations are shown rather
than hidden.

### 5. Why does Compound need special handling?

Compound III can expose USDC in more than one economic representation. The
application selects the validated base-market composite identifier so supplied
and borrowed amounts retain the intended lending meaning.

### 6. What does “incentives unknown” mean?

The qualified standardized record does not expose a validated incentive field.
The app preserves that uncertainty instead of treating missing data as zero.

### 7. What happens if Graph data is stale?

Freshness is classified deterministically. Stale or unavailable observations
cannot silently participate in a current comparison; the app surfaces the
condition and falls back or fails closed as appropriate.

### 8. Is this financial advice?

No. It is read-only financial research and explanation of current observed
fields, with explicit limitations and no instruction to move capital.

### 9. Can it execute transactions?

No. There are no wallets, signing, transaction creation, or capital movement
capabilities.

### 10. Why only three protocols?

The vertical slice is intentionally bounded so semantic qualification,
deterministic comparison, and evidence provenance can be demonstrated clearly.
The same pattern can be evaluated for more protocols later.

### 11. What would you build next?

First, validate additional protocol mappings and historical evidence without
weakening the current semantic and freshness gates. Broader scope would follow
only after review; execution and control-plane features are outside this demo.

### 12. What was actually built during the hackathon?

The repository history shows the feasibility investigation, live Graph gate,
deterministic vertical slice, grounded model path, Cloudflare deployment, and
release hardening as separate commits. The final submission should disclose
the AI-assisted development process and distinguish those milestones from any
pre-existing work.

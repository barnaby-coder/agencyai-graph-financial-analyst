# AgencyAI Graph Financial Analyst

An AI financial analyst grounded in live onchain evidence from The Graph.

## Demo

**Deployed demo:** [capital.agencyai.me](https://capital.agencyai.me/)

The demo is currently hosted as a dedicated Cloudflare Worker. The temporary
validation host is
[agencyai-graph-financial-analyst.finneigan-barnaby.workers.dev](https://agencyai-graph-financial-analyst.finneigan-barnaby.workers.dev/).

Use the sample question:

> I have USDC. What productive lending opportunities can we observe on Ethereum, where is the return coming from, how do the opportunities compare, and what risks should I understand?

The app queries current Ethereum lending markets, compares the observations,
and lets the judge inspect the evidence behind the explanation.

## Why this exists

Onchain financial data is transparent, but it is fragmented across protocols
and difficult to interpret consistently. A rate leaderboard does not explain
how utilization, observable liquidity, market semantics, or missing incentives
affect the comparison.

## What it does

```text
user question
    ↓
The Graph live market data
    ↓
market qualification
    ↓
deterministic normalization and calculations
    ↓
evidence object
    ↓
AI interpretation
    ↓
grounding validation
    ↓
answer + inspectable evidence
```

The current vertical slice compares Ethereum USDC supply markets from Aave V3,
Compound III, and Spark Lend. It is read-only: no wallet, signing, transaction,
capital movement, or execution capability exists.

## Why The Graph is essential

The Graph is the application's live onchain data fabric. The normal request
cannot produce its current market observations without Graph data. The app
uses qualified standardized lending Subgraph deployments to obtain comparable
market primitives across Aave V3, Compound III, and Spark Lend, while retaining
each source and block as provenance.

That common data path makes it possible to normalize supplied liquidity,
borrows, utilization, supply/borrow rate fields, and an observable
supply-minus-borrow liquidity proxy before an AI model sees the result. Graph
data is therefore load-bearing, not decorative context attached to a chatbot.

## What the AI does

The model interprets a compact evidence packet and explains what the current
observations may mean. It does not establish financial truth.

Deterministic code owns:

- protocol and market-role qualification, including Compound III's USDC base market;
- unit scaling, utilization, liquidity proxy, rate selection, and freshness;
- comparison calculations and evidence construction;
- evidence-reference and unsupported-claim validation.

Rates are displayed as neutral supply/borrow percentage-point fields rather
than asserted APY. Incentives remain `unknown` when the qualified source does
not expose them. Stale or unavailable observations cannot silently enter a
current ranking. If the model is unavailable or fails grounding validation,
the deterministic evidence-first fallback remains usable.

## Evidence-first architecture

Every material answer point can be traced to a stable evidence reference with
the protocol, market, economic role, Graph source/deployment, block, timestamps,
freshness, normalized metrics, and methodology. The evidence view is part of
the main judge journey: the AI does not ask the reader to trust an unexplained
number.

## Current scope

- Ethereum mainnet
- USDC lending analysis
- Aave V3, Compound III, and Spark Lend
- live Graph data, deterministic comparison, grounded interpretation

This is a bounded ETHOnline 2026 experiment, not a generalized DeFi assistant
or a second AgencyAI production implementation.

## Safety and limitations

- Read-only research and explanation only.
- No wallet connectivity, signing, transactions, execution, or capital movement.
- Incentive yield may be unknown.
- Rates are neutral percentage-point fields, not an asserted APY.
- The liquidity value is an observable comparison proxy, not a guarantee of
  withdrawal or execution liquidity.
- The result is a current point-in-time comparison, not investment advice or a
  forecast.

## Run locally

Requires a recent Node.js runtime. The server listens on `127.0.0.1:4173` by
default; set `PORT` and, for a host that needs external binding, `HOST` to
override them.

Live Graph path:

```bash
GRAPH_API_KEY=<runtime-secret> npm start
```

OpenAI model-backed interpretation:

```bash
GRAPH_API_KEY=<runtime-secret> \
OPENAI_API_KEY=<runtime-secret> \
OPENAI_MODEL=gpt-5.6-luna \
npm start
```

`OPENAI_API_URL` optionally overrides the default OpenAI Responses endpoint.
The OpenAI key is server-only. If it is absent, the deterministic fallback is
used. The existing provider-compatible chat-completions transport can be used
with `MODEL_API_URL`, `MODEL_API_KEY`, and optional `MODEL_NAME`; the server
selects OpenAI when `OPENAI_API_KEY` is present. Never commit credentials.

Health is available at `/api/health`. The primary analysis request is
`POST /api/analyze` with `{ "question": "..." }`.

## Deployment

The application has its own Cloudflare Worker and GitHub Actions deployment
workflow. Static assets are served by the Worker and Graph/OpenAI requests
remain server-side. Worker runtime secrets use the same environment variable
names shown above; deployment credentials are held separately as GitHub
Actions secrets. The production-facing demo URL is
[capital.agencyai.me](https://capital.agencyai.me/). The existing
[agencyai.me](https://agencyai.me/) landing page is deployed separately and
is not managed by this repository.

## Tests

```bash
npm test
```

The tests cover Graph failures, qualification, deterministic calculations,
freshness, evidence linkage, both model transports, structured output, and
deterministic fallback behavior. Live credentials are not required for the
normal test suite.

## Hackathon positioning

The intended primary track is **Best AI Tooling or AI Use Case with The Graph —
From Scratch**: a natural-language financial question is answered using live
Graph evidence, deterministic financial analysis, model interpretation, and
inspectable grounding.

A possible secondary fit is **Best Use of Composable or Standardized Graph
Products**, based on the cross-protocol standardized lending data path. This
repository does not claim to use Graph Composition or any other Graph product
that is outside the current scope.

## Further reading

- [Architecture](docs/ARCHITECTURE.md)
- [Feasibility evidence](docs/FEASIBILITY.md)
- [Acceptance record](docs/ACCEPTANCE.md)
- [Demo storyboard](docs/DEMO.md)
- [Deployment notes](docs/DEPLOYMENT.md)
- [Public-release checklist](docs/PUBLIC_RELEASE.md)

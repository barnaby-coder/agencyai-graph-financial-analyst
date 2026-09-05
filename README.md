# AgencyAI Graph Financial Analyst

A bounded, public-ready experiment exploring how an AI financial analyst can use **The Graph as its onchain data fabric** and turn live blockchain evidence into structured, understandable financial intelligence.

This repository is intentionally separate from any canonical research or private production control plane. It exists as a proving ground for a narrow, Graph-native vertical slice that can be evaluated independently, demonstrated publicly, and discarded or promoted selectively based on evidence.

## What we are trying to prove

The core question is simple:

> Can an agent use live Graph infrastructure to investigate an onchain financial question, normalize the evidence, calculate deterministic financial metrics, and produce a useful explanation without becoming a dashboard wrapper or inventing financial state?

The intended first experience is a bounded research task such as:

> I have USDC. What productive lending opportunities can we observe on Ethereum, where does the return come from, what changed recently, and what risks should I understand?

The system should be able to:

1. interpret the user's financial question;
2. discover and query relevant Graph-powered data;
3. normalize protocol-specific observations into common financial concepts;
4. calculate important metrics deterministically;
5. retain source, freshness, and evidence provenance;
6. compare opportunities across protocols where reliable data permits;
7. produce an evidence-backed explanation in ordinary language;
8. expose the supporting evidence when asked "why?".

## Architectural principle

**Build on The Graph, not around The Graph. Build what The Graph enables, not what The Graph already provides.**

Before implementing material onchain data acquisition, indexing, streaming, transformation, agent-access, or data-payment infrastructure, this project should first determine whether an existing or emerging Graph capability satisfies the requirement.

Prefer integration over duplication unless there is a documented technical reason not to.

This is **Graph-first, not Graph-only**. Specialist systems should still be used where they are objectively better suited to a task. For example, a DEX router may be the right source for an executable quote while The Graph supplies the underlying market evidence and historical context.

## Intended system boundary

```text
THE GRAPH
Subgraphs / standardized data / MCP / Token API / Substreams / other Graph services
        |
        v
GRAPH DATA ADAPTERS
source identity / freshness / raw-to-canonical normalization
        |
        v
FINANCIAL INTELLIGENCE
observations / deterministic metrics / evidence / comparisons
        |
        v
FINANCIAL ANALYST AGENT
investigation / interpretation / synthesis / explanation
        |
        v
USER
```

This repository stops at **research, analysis, explanation, and read-only simulation**.

It does not own capital authorization or execution.

## Promotion rule

Hackathon or experimental code does not become production code automatically.

The promotion path is:

```text
experiment
  -> evidence that the approach works
  -> architectural review
  -> canonical specification update where appropriate
  -> deliberate production implementation or adaptation
```

Never:

```text
hackathon code -> production by default
```

Anything useful discovered here must earn its way back into the canonical AgencyAI architecture.

## Initial scope

The first vertical slice should remain intentionally small:

- Ethereum-first;
- USDC-first;
- lending / productive-use analysis;
- 2-3 protocols only where live Graph-accessible data is reliable;
- cross-protocol normalization where feasible;
- deterministic calculations before agent interpretation;
- explicit source and freshness metadata;
- evidence-backed plain-language explanation;
- no live trading or wallet actions.

Potential Graph-native capabilities to evaluate include:

- Subgraphs and standardized schemas;
- Subgraph MCP for agent-native discovery and querying;
- Token API where it adds useful token or transfer context;
- Substreams where event-level or streaming analysis is justified;
- x402 only if it materially improves the agent workflow rather than being added for novelty.

## Deterministic-before-agent rule

The model should interpret evidence, not manufacture financial state.

```text
raw Graph data
  -> canonical observation
  -> deterministic metric
  -> evidence object
  -> analyst finding
  -> agent synthesis
```

Examples:

- utilization is calculated by code;
- yield spreads are calculated by code;
- changes in deposits/borrows are calculated by code;
- freshness is determined by explicit metadata;
- the agent explains what those facts may mean and why they matter.

Material conclusions should remain traceable to their supporting source and calculation.

## Non-goals

For the initial experiment, do not build:

- wallet signing;
- order submission;
- automated rebalancing;
- live capital movement;
- leverage creation;
- bridges;
- unrestricted cross-chain execution;
- a replacement for AgencyAI policy or Capital Control;
- a large protocol universe;
- a universal risk score;
- a polished dashboard before the intelligence loop works;
- custom indexing infrastructure when The Graph already provides the required primitive.

## Success criteria

The experiment is successful when a user can ask a plain-language financial question and receive a current, evidence-backed answer that is materially more useful than a simple APY leaderboard.

A strong result should make clear:

- what opportunities were observed;
- where the return comes from;
- what changed;
- which risks matter;
- how current the evidence is;
- which Graph sources support the answer;
- what remains uncertain.

## Experimental mindset

This repository is a proving ground, not a commitment to a particular implementation.

We should be willing to discover that:

- a Graph product works extremely well and should be used more broadly;
- a standardized schema reduces significant integration work;
- MCP is a better agent interface than bespoke GraphQL tooling;
- a missing financial primitive is worth building Graph-natively;
- a particular integration is immature or unsuitable;
- an external specialist service is the correct complement to The Graph.

Those findings are useful outcomes in their own right.

## Current status

The current bounded vertical slice is implemented on the model-backed analyst
branch. The repository remains private while the implementation is reviewed.

## Current vertical slice

The app asks one Ethereum + USDC lending question and compares live Graph
observations from Aave V3, Compound III, and Spark Lend. It validates the
market role, calculates supply, borrows, utilization, rates, liquidity proxy,
and freshness in code, then presents an evidence-backed explanation with an
evidence view. When configured, a server-side model interprets a compact,
structured evidence packet. Without a model credential, the deterministic
fallback remains the complete answer path.

Rates are shown as neutral supply/borrow percentage-point fields, not APY.
Incentives remain `unknown` when the qualified source does not expose them.
Stale or unavailable observations are caveated and cannot silently enter a
current ranking.

## Run locally

```bash
GRAPH_API_KEY=<runtime-secret> npm start
```

Open http://127.0.0.1:4173. The key is server-only and must never be committed
or sent to the browser. `npm test` runs the credential-free unit tests.

Optional model interpretation uses a server-side JSON model endpoint:

```bash
MODEL_API_URL=<approved-model-endpoint> MODEL_API_KEY=<runtime-secret> npm start
```

`MODEL_NAME` is optional. The endpoint receives `{ model, system, input,
responseFormat }` and must return the documented structured model output (or a
JSON string in `output_text`); it never receives raw Graph responses. Missing
model configuration, provider failure, invalid output, or unresolved evidence
references selects the deterministic fallback.

The model explains deterministic results; it does not calculate metrics,
qualify markets, decide freshness, or recommend execution. Rates remain neutral
percentage-point fields rather than APY, and incentives remain unknown when the
qualified Graph source does not expose them.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the implementation
boundary and [docs/FEASIBILITY.md](docs/FEASIBILITY.md) for live validation
evidence.

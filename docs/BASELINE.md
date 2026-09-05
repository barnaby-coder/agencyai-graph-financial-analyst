# AgencyAI Graph Financial Analyst baseline

This document records what exists at the `agencyai-graph-analyst-v1`
baseline. It is a stable financial-intelligence reference implementation, not
a claim of production readiness or financial advice.

## Product

**AgencyAI — Graph-Grounded Financial Analyst**

Live application: <https://capital.agencyai.me>

## Scope

- Ethereum mainnet.
- USDC lending.
- Aave V3, Compound III, and Spark Lend.
- Read-only financial analysis.

## Data and deterministic analysis

The application uses live standardized lending data from The Graph and retains:

- protocol and economic-role qualification;
- Graph block metadata;
- freshness classification;
- indexing-error validation;
- normalized supply, borrows, utilization, rate fields, and liquidity proxy;
- explicit unknown incentives;
- canonical evidence construction and provenance.

The core architecture is:

```text
The Graph
→ qualified live observations
→ economic-role qualification
→ freshness validation
→ deterministic normalization
→ financial comparison
→ canonical evidence
→ constrained AI interpretation
→ evidence-reference validation
→ inspectable answer
→ deterministic fallback
```

The governing principle is: “Don't ask AI to invent the financial state. Give
it evidence it can explain.”

## Model layer

- Compact structured evidence packet.
- OpenAI Responses API.
- `gpt-5.6-luna`.
- Structured interpretation.
- Evidence-reference validation.
- Unsupported-claim checks.
- Deterministic fallback when model output is unavailable or not grounded.

The model interprets evidence. It does not own arithmetic, market
qualification, freshness, or execution decisions.

## User experience

- Natural-language financial question.
- Live market observations.
- Deterministic comparison.
- Plain-language interpretation.
- Provenance and evidence inspection.
- Honest loading, stale, partial, and unavailable states.

## Operations

- Cloudflare Worker serving the UI and server-side APIs.
- Custom domain: <https://capital.agencyai.me>.
- GitHub Actions deployment from `main`.
- Automated tests with no live credentials required for the normal suite.

## Non-capabilities

This repository contains no:

- wallet connectivity or signing;
- transaction creation or execution;
- live capital movement;
- portfolio management;
- financial-advice or authorization system;
- Capital Control implementation.

## Relationship to broader AgencyAI systems

This repository stops at read-only financial intelligence. Its conceptual
output belongs upstream of consequential action:

```text
Graph/onchain data
→ FinancialObservation
→ FinancialEvidence
→ FinancialOpportunity / Finding
→ AgencyAI intelligence / interpretation
→ downstream policy / Capital Control
→ execution only in explicitly governed systems
```

Those downstream systems are not implemented here and should not be copied
into this repository.

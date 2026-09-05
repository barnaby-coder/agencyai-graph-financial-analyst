# Main AgencyAI handoff

This is a read-only reuse audit. No code has been moved or copied into another
repository.

## Reusable concepts and components

| Component | Classification | Handoff guidance |
|---|---|---|
| Graph source and deployment provenance | B — promote concept/contract, reimplement | Preserve source identity, deployment, block, timestamp, and query provenance behind the main project's provider boundary. |
| Freshness classification | A — promote nearly as-is | The explicit fresh/stale/unavailable thresholds and fail-closed ranking rule are generic and well-tested. |
| Protocol/economic-role qualification | B — promote concept/contract, reimplement | Keep provider-specific qualification behind adapters; never select a market by display order. |
| Normalized financial observation | B — promote concept/contract, reimplement | Map to the main `FinancialObservation` contract rather than importing this demo's narrow object unchanged. |
| Deterministic comparison | B — promote concept/contract, reimplement | Preserve arithmetic outside the model and make comparison inputs explicit. |
| Canonical evidence structure | A — promote nearly as-is | Preserve stable evidence IDs, methodology, unknowns, source, block, timestamps, and freshness. Adapt naming to the main evidence contract. |
| Model evidence packet | B — promote concept/contract, reimplement | Retain the compact, no-raw-payload boundary and explicit caveats. Do not couple the main project to this prompt or provider. |
| Grounding and evidence-reference validation | A — promote nearly as-is | The fail-closed validation pattern is a strong generic boundary for model-generated explanations. |
| Deterministic fallback | B — promote concept/contract, reimplement | Preserve usefulness when the model or evidence path is unavailable; keep behavior specific to the main product's contracts. |
| Graph client/provider abstraction | B — promote concept/contract, reimplement | Preserve authenticated server-side access, timeouts, bounded retries, and redacted errors. Avoid importing deployment-specific constants. |

## Keep hackathon-specific

- The Ethereum USDC-only protocol registry and market identifiers.
- The single-page demo wording, layout, and loading copy.
- The three-protocol comparison prompt and model response sections.
- The Cloudflare Worker deployment configuration and hackathon workflow.
- Feasibility fixtures and one-off live-validation scripts.
- ETHOnline submission and comparator material.

These artifacts remain useful audit evidence but should not become the main
AgencyAI product contract.

## Do not promote

- Any execution, wallet, signing, or capital-movement behavior: none exists in
  this repository and none should be added as part of this handoff.
- Any assumption that standardized fields are financially identical without
  protocol and economic-role qualification.
- Any model authority over arithmetic, freshness, market selection, policy, or
  execution.
- Any fixture as a substitute for live Graph data in a normal runtime path.

## Integration boundary

The appropriate downstream shape is:

```text
FinancialObservation
→ FinancialEvidence
→ FinancialOpportunity / Finding
→ strategy or recommendation
→ Capital Control
→ policy / risk / eligibility / approval
→ execution intent
→ provider, broker, or onchain adapter
→ reconciliation
```

This repository should contribute only the observation, evidence, and
informational finding portion. It must not create a second Capital Control
engine or bypass policy and approval boundaries.

## Dependencies and limitations

The implementation depends on The Graph standardized lending deployments,
server-side Graph credentials, OpenAI Responses API configuration for the
model path, Node-compatible `fetch`, and Cloudflare Worker static-asset/API
runtime behavior. Incentive data is unknown in the qualified source, rates use
neutral percentage-point semantics, and the current scope is Ethereum USDC
lending across three protocols.

## Recommended first integration milestone

Promote the evidence and financial-intelligence contracts into the main
AgencyAI architecture and connect one read-only Graph-backed intelligence
provider. Start with a shared `FinancialObservation` / `FinancialEvidence`
boundary, one provider adapter, freshness/provenance tests, and an
informational `Finding` output. Keep model interpretation downstream of
deterministic evidence and stop before strategy, Capital Control, or execution.

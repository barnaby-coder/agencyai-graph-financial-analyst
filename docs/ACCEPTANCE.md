# Model-Backed Analyst Acceptance

## Acceptance record

- Acceptance date: 2026-09-05 UTC
- Tested branch: `build/model-backed-analyst`
- Baseline: `25c793a1cd866345b9edad03908cd81b43ff4833`
- Verdict: **PASS WITH MINOR ISSUES**

This milestone adds the smallest model-backed interpretation path while
preserving the accepted live Graph and deterministic analysis boundary. The
repository remains private and no execution or control-plane capability was
added.

## Judge journey

```text
question form
  -> POST /api/analyze
  -> authenticated Graph Gateway
  -> protocol and market-role qualification
  -> deterministic normalization/comparison
  -> structured evidence packet
  -> validated model interpretation or deterministic fallback
  -> observation cards + explanation + evidence inspection
```

The primary question is the bounded Ethereum USDC lending question in the
README. The live Graph path is the normal runtime path; fixtures are used only
by credential-free tests.

## Current Graph and protocol status

The accepted live validation remains valid for Aave V3, Compound III, and Spark
Lend. The last authenticated application smoke test used block `25908192`,
captured at `2026-09-05T02:38:50Z`, with approximately three seconds of block
age and `hasIndexingErrors=false` for all three deployments. The model
integration milestone did not change the Graph query or normalizer.

| Protocol | Semantic qualification | Result |
|---|---|---|
| Aave V3 | Ethereum USDC supply market | Pass |
| Compound III | Explicit USDC base-market composite ID; collateral result rejected | Pass |
| Spark Lend | Ethereum USDC supply market | Pass |

## Model / AI finding

The application now has a provider-neutral model path: a server-side JSON
model generator receives a compact evidence packet and returns structured
evidence-backed points. The interpreter validates the output schema, requires
known evidence references, rejects APY/execution/unsupported-incentive claims,
and falls back on timeout, provider failure, malformed output, grounding
failure, missing configuration, or stale observations.

No approved live model credential or provider configuration was available in
this environment. Consequently, no provider/model was selected and no live
model smoke test was run. The production-shaped adapter is tested with mocks;
the live demo remains clearly labeled `Deterministic fallback` until a model
endpoint is approved and configured with `MODEL_API_URL` and
`MODEL_API_KEY`. This is the remaining minor issue for the AI bounty claim.

The AI use case is credible in architecture and interaction design because
natural-language input is grounded in live Graph evidence and deterministic
financial analysis. Live model execution still needs one secure validation
before claiming a model-backed demo in submission materials.

## Evidence UX

Pass. Evidence records expose protocol, USDC market, economic role, Graph
source/deployment, block, block timestamp, capture timestamp, freshness,
normalized metrics, methodology, and unknown incentives. Model outputs can
reference only the stable IDs supplied in this evidence set. The browser never
receives Graph or model credentials.

## UI review

The existing calm, sparse financial layout was retained. The only model-related
change is a subtle interpretation badge and an optional model summary above the
four answer sections. The primary reading order remains question → live
observations → analyst explanation → evidence. Narrow responsive CSS remains in
place. Browser automation was unavailable, so this is not a pixel-level browser
sign-off and no screenshot artifact was created.

## Security / public-release audit

Pass for the change set reviewed:

- no API keys, auth headers, or credentials in source, fixtures, prompts, or docs;
- model and Graph keys are read only on the server and are not returned to the browser;
- model errors are generic and redact the configured key;
- the model packet excludes raw Graph responses and secret-shaped fields;
- no private paths, internal URLs, Vault details, private repository names, or copied private code;
- no fixtures enter the normal live request path;
- no wallet, transaction, execution, policy, or control-plane surface was added.

The repository remains private. Run a final secret scan immediately before any
future visibility change.

## Validation commands and results

```text
npm test                                  20 passing tests
node --check src/**/*.mjs public/app.js   passed
GET /api/health                           passed; modelConfigured=false without model env
deterministic fallback smoke              passed through live Graph application path
authenticated Graph smoke                 3/3 protocols, fresh, no indexing errors (accepted baseline)
live model smoke                          not run: no approved model credential/provider
public-release scan                       passed: no credential-shaped values or private references found
git diff --check                          passed
```

## Known limitations

- A live model provider still requires secure approval/configuration and one
  explicit smoke test.
- The optional JSON model endpoint is intentionally small and expects the
  documented request/response contract; provider-specific routing is deferred.
- Incentive yield remains unknown in the qualified standardized source.
- Scope is Ethereum + USDC + Aave V3, Compound III, and Spark Lend only.
- Subgraph MCP remains deferred and was not operationally validated.
- Browser automation and screenshot capture were unavailable.

## Required before public release

1. Approve a model provider/endpoint or explicitly submit with the clearly
   labeled deterministic fallback and avoid overstating the AI claim.
2. Run one authenticated live-model smoke test with no credential capture.
3. Run a final secret scan and review the complete public diff.
4. Decide repository visibility explicitly, then prepare the demo materials.

## Recommended next milestone

Review the model-backed branch and choose the approved model provider. If
approved, run the live model smoke test and record the grounded result. Then
prepare only the final public README/demo artifacts; do not add more Graph
products, protocols, chains, execution, wallets, or control-plane features.

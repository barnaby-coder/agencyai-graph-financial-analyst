# Model-Backed Analyst Acceptance

## Acceptance record

- Acceptance date: 2026-09-05 UTC
- Tested branch: `build/model-backed-analyst`
- Baseline: `25c793a1cd866345b9edad03908cd81b43ff4833`
- Implementation head before live validation: `9496862`
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

The final authenticated application smoke test used block `25910488`, with
block timestamp `1788603611` and approximately 12 seconds of age at capture.
All three deployments returned fresh observations and
`hasIndexingErrors=false`. The Graph query, protocol qualification, and
deterministic normalizer remained unchanged apart from shorter model-facing
evidence IDs.

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

Live validation used Z.ai Coding Plan temporarily via
`https://api.z.ai/api/coding/paas/v4/chat/completions` with model
`glm-5.3-flash`. Authentication succeeded, the full evidence packet was sent,
and the response was structured JSON accepted by the application. The final
normal application request returned `mode: "model"` in approximately 32
seconds. Evidence references `aave-v3`, `compound-v3`, and `spark-lend` all
resolved.

The generated answer usefully compared supply rates, utilization, observable
liquidity, borrower-funded return, rate limitations, and unknown incentives. It
did not issue an execution recommendation or label the neutral rates as APY.
The AI acceptance issue is therefore resolved for the temporary validation
configuration. The Coding Plan endpoint is not approved as the final public
deployment choice; general Z.ai API selection remains a release decision.

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
deterministic fallback smoke              passed with model configuration disabled; 3 observations
authenticated Graph smoke                 3/3 protocols, fresh, no indexing errors; block 25910488
live Z.ai application smoke               HTTP 200, mode=model, grounded refs resolved, ~32 seconds
public-release scan                       passed: no credential-shaped values or private references found
git diff --check                          passed
```

## Known limitations

- Z.ai Coding Plan was used only as a temporary validation endpoint; final
  endpoint selection remains open.
- Model latency was approximately 32 seconds for the full evidence packet.
- The optional JSON model endpoint is intentionally small and expects the
  documented request/response contract.
- Incentive yield remains unknown in the qualified standardized source.
- Scope is Ethereum + USDC + Aave V3, Compound III, and Spark Lend only.
- Subgraph MCP remains deferred and was not operationally validated.
- Browser automation and screenshot capture were unavailable.

## Required before public release

1. Decide whether the final runtime should use Z.ai’s general API rather than
   the temporary Coding Plan endpoint.
2. Run a final secret scan and review the complete public diff.
3. Decide repository visibility explicitly, then prepare the demo materials.

## Recommended next milestone

Review the grounded live Z.ai result and choose the final approved endpoint.
Then prepare only the final public README/demo artifacts; do not add more Graph
products, protocols, chains, execution, wallets, or control-plane features.

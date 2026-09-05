# Model-Backed Analyst Acceptance

## Acceptance record

- Acceptance date: 2026-09-05 UTC
- Tested branch: `build/model-backed-analyst`
- Baseline: `25c793a1cd866345b9edad03908cd81b43ff4833`
- Implementation head before live validation: `9496862`
- Release-candidate hardening base: `1ee2b861`
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

The final authenticated application smoke test used block `25910611`, with
block timestamp `1788605087` and approximately 11 seconds of age at capture.
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

## OpenAI comparison validation

Validated 2026-09-05 UTC using OpenAI's Responses API at
`https://api.openai.com/v1/responses` with model `gpt-5.6-luna`. The OpenAI
credential was supplied only to the server process. The normal application
request returned HTTP 200 with `mode: "model"`; all three observations were
fresh, had `hasIndexingErrors=false`, and the evidence references
`aave-v3`, `compound-v3`, and `spark-lend` resolved successfully.

The Graph capture used block `25910611` (block timestamp `1788605087`), with
approximately 11 seconds of freshness at capture. Aave V3, Compound III's
qualified USDC base market, and Spark Lend all passed semantic qualification.
Deterministic supply, borrows, utilization, supply/borrow rate, liquidity
proxy, unknown incentives, provenance, and freshness were produced before the
model request.

The OpenAI request took approximately 10.3 seconds in the measured model run;
the final repeated `/api/analyze` request took approximately 13.6 seconds
total. The response reported 2,143 input
tokens, 975 output tokens, 0 reasoning tokens, and 3,118 total tokens. Using
the model page's listed $0.20 per million input tokens and $1.20 per million
output tokens, the approximate model cost for this request was $0.0016; this
is a runtime comparison estimate, not product cost accounting. See the
[GPT-5.6 Luna model documentation](https://developers.openai.com/api/docs/models/gpt-5.6-luna)
(accessed 2026-09-05 UTC).

The actual answer was materially useful and grounded: it compared the three
observed rate fields, utilization, liquidity proxies, and rate spreads; it
explained that observed lender return is represented by the supply-rate field
and borrowing activity; it preserved unknown incentives; and it stated that
the fields are not established APY. It did not introduce execution language,
unsupported protocol facts, or an unsupported ranking. Compared with the
approximately 32-second Z.ai `glm-5.3-flash` result, OpenAI was materially
faster and at least equally reliable on structured output and evidence
grounding, with somewhat more explicit limitations.

The deterministic fallback was separately exercised with model configuration
disabled. It returned HTTP 200, `status: "ready"`, `mode: "fallback"`, and all
three qualified observations remained usable. Existing Z.ai chat-completions
compatibility remains covered by the original adapter test and was not
removed. The Coding Plan endpoint remains a temporary validation configuration;
final provider and endpoint selection is still a release decision.

## Evidence UX

Pass. Evidence records expose protocol, USDC market, economic role, Graph
source/deployment, block, block timestamp, capture timestamp, freshness,
normalized metrics, methodology, and unknown incentives. Model outputs can
reference only the stable IDs supplied in this evidence set. The browser never
receives Graph or model credentials.

## UI review

The calm, sparse financial layout was retained. Headless Chrome/DevTools review
covered the live model path at approximately 1440px and 390px widths. Both
rendered three protocol cards, the AI interpretation badge, three evidence
rows, and no horizontal overflow. The mobile layout stacks the cards, answer
sections, and evidence details without clipping.

The loading state now communicates the actual bounded sequence — querying live
markets, validating evidence, calculating deterministic metrics, and generating
grounded analysis — without fake progress percentages or cached-result claims.
The primary reading order remains question → live observations → analyst
explanation → evidence. Local desktop, mobile, and loading screenshots were
captured during review and were not committed as product assets. The evidence
detail view exposes the normalized metric relationship alongside source,
deployment, block, timestamp, freshness, and unknown incentives.

## Security / public-release audit

Pass for the change set reviewed:

- no API keys, credential-bearing auth headers, or credentials in source,
  fixtures, prompts, or docs;
- model and Graph keys are read only on the server and are not returned to the browser;
- model errors are generic and redact the configured key;
- the model packet excludes raw Graph responses and secret-shaped fields;
- no private paths, internal URLs, private secret-storage details, private
  repository names, or copied private code;
- no fixtures enter the normal live request path;
- no wallet, transaction, execution, policy, or control-plane surface was added.

The repository remains private. Run a final secret scan immediately before any
future visibility change.

## Validation commands and results

```text
npm test                                  23 passing tests
node --check src/**/*.mjs public/app.js   passed
GET /api/health                           passed; OpenAI model configured only when its env is present
deterministic fallback smoke              passed with model configuration disabled; 3 observations; mode=fallback
authenticated Graph smoke                 3/3 protocols, fresh, no indexing errors; block 25910611
live Z.ai application smoke               HTTP 200, mode=model, grounded refs resolved, ~32 seconds
live OpenAI application smoke             HTTP 200, mode=model, grounded refs resolved, ~13.6 seconds total
OpenAI structured output                   passed; 2,143 input / 975 output / 0 reasoning tokens
OpenAI browser-secret check                passed; no model or Graph credential in response
public-release scan                       passed: no credential-shaped values or private references found
git diff --check                          passed
```

## Known limitations

- Z.ai Coding Plan was used only as a temporary validation endpoint; final
  endpoint selection remains open. OpenAI's Responses API is now the faster
  validated comparison path, but release configuration still requires review.
- OpenAI latency was approximately 10.3 seconds for the model request and
  13.6 seconds end to end in the final repeat; latency and cost can vary by
  account and load.
- The optional JSON model endpoint is intentionally small and expects the
  documented request/response contract.
- Incentive yield remains unknown in the qualified standardized source.
- Scope is Ethereum + USDC + Aave V3, Compound III, and Spark Lend only.
- Subgraph MCP remains deferred and was not operationally validated.
- Browser automation and screenshot capture were unavailable.

## Required before public release

1. Decide whether the final runtime should use OpenAI `gpt-5.6-luna` or Z.ai’s
   general API rather than the temporary Coding Plan endpoint.
2. Run a final secret scan and review the complete public diff.
3. Decide repository visibility explicitly, then prepare the demo materials.

## Recommended next milestone

Review the grounded live OpenAI and Z.ai results and choose the final approved
endpoint. Then prepare only the final public README/demo artifacts; do not add
more Graph products, protocols, chains, execution, wallets, or control-plane
features.

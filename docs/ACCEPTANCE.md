# Acceptance & Demo Hardening

## Acceptance record

- Acceptance date: 2026-09-05 UTC
- Branch: `review/demo-acceptance`
- Reconciled implementation baseline: `88c9eb6`
- Final hardening commit: recorded in the Git handoff for this branch
- Verdict: **PASS WITH MINOR ISSUES**

The bounded product journey works with fresh live Graph data and is ready for
acceptance review. The minor issues are the lack of a real model credential in
this environment, deferred MCP validation, and the final public-release steps.

## Branch reconciliation

After fetching `origin`, the implementation branch was found three commits
ahead of the old main and one README boundary commit behind `origin/main`
(`dc3c32b`). `origin/main` was merged into `build/hackathon-vertical-slice`
with merge commit `88c9eb6`; no history was rewritten and `main` was not
changed. `review/demo-acceptance` was then created from that reconciled state.

Resulting topology:

```text
review/demo-acceptance
  -> 88c9eb6 merge of origin/main + vertical slice history
       -> origin/main dc3c32b README boundary
       -> vertical slice f335734
            -> feasibility a40766e
```

The implementation branch remains preserved and `main` remains unmerged.

## Judge journey tested

Question submitted:

> I have USDC. What productive lending opportunities can we observe on
> Ethereum, where is the return coming from, how do the opportunities compare,
> and what risks should I understand?

The tested path was:

```text
question form
  -> POST /api/analyze
  -> authenticated Graph Gateway
  -> expected-market qualification
  -> deterministic normalization/comparison
  -> evidence object
  -> grounded fallback interpreter
  -> market cards + analyst sections + evidence inspection
```

## Live Graph validation

Authenticated smoke test completed at `2026-09-05T02:38:50Z` through the
server-side Graph client. All three sources returned HTTP 200, a common current
block, `hasIndexingErrors=false`, and 30 snapshots:

| Protocol | Deployment | Market role | Block | Age at capture | Result |
|---|---|---|---:|---:|---|
| Aave V3 | `QmcXE5QVcBcvcaJddPxd8mFs6W9xt7STmwfgguoiM6ddAd` | Ethereum USDC supply market | 25,908,192 | 3 seconds | Pass |
| Compound III | `QmNrQoow7pjM3biRnnhzeCaDYhuEbDyjKCpFeNv2oGXnuK` | USDC base market composite ID | 25,908,192 | 3 seconds | Pass |
| Spark Lend | `QmTVumjhubXWP8MeDx5g114MRX99E4Gie5mFqVurttF99X` | Ethereum USDC supply market | 25,908,192 | 3 seconds | Pass |

The browser-facing response was checked to contain no credential, authorization
header, or Graph secret. The live path does not read fixtures.

## Current protocol status and metrics

The deterministic comparison produced:

| Protocol | Supply | Borrows | Utilization | Supply rate | Borrow rate | Liquidity proxy |
|---|---:|---:|---:|---:|---:|---:|
| Aave V3 | 2,297,682,194 | 2,132,113,603 | 93.50% | 3.60% | 4.28% | 165,568,591 |
| Compound III | 371,551,895 | 335,520,518 | 90.31% | 4.21% | 5.10% | 36,031,377 |
| Spark Lend | 25,201,889 | 23,237,291 | 92.22% | 3.54% | 4.27% | 1,964,598 |

The rates use neutral percentage-point labels. The implementation selects the
variable lender/borrower rates and does not call them APY. Incentives are
explicitly `unknown`, not zero.

## UI findings

The interface presents a calm, financial reading order: question and primary
action; current observation cards; analyst interpretation; evidence records.
Each card exposes rate, utilization, liquidity, age, and freshness. The
evidence rows expand inline to show role, market, deployment, block, timestamps,
methodology, and unknowns. Loading, missing-credential, request-error,
partial-source, stale, and all-unavailable states have explicit behavior.

Desktop and narrow responsive layouts were checked through localhost HTTP/static
asset validation. Browser automation was not available in the environment, so
no screenshot artifact was created and visual acceptance is a review item rather
than a pixel-level browser sign-off.

## AI/interpreter finding

The current fallback is grounded and useful: it explains observations,
comparison limits, return source, high utilization, and unknown incentives from
the deterministic inputs. The provider-neutral interface passes question,
observations, comparisons, evidence, and explicit unknowns to an optional model
adapter.

The current bounty wording accepts an AI app that uses The Graph as a
load-bearing source and does meaningful work with the data, but a fallback-only
demo may look like deterministic analytics with an AI label. A real model would
materially strengthen the judging story, provided it is added behind the
existing interface with grounded structured output and deterministic fallback.
No approved model credential was available during this milestone, so no model
was added or simulated.

## Evidence UX finding

Pass. The judge can inspect protocol, USDC market, economic role, source and
deployment, block, block timestamp, capture timestamp, freshness, normalized
metrics, methodology, and unknown incentives without reading raw JSON.

## Security / public-release audit

Pass for committed content reviewed in this milestone:

- no Graph or model credentials;
- no Vault URLs or secret-storage details;
- no private filesystem paths or internal URLs;
- no private repository names or copied private code;
- no authentication headers in fixtures;
- no stale fixture used in the normal live path;
- Graph credentials stay server-side and are supplied at runtime.

The repository remains private. Public release still requires an explicit
visibility decision and a final secret scan after that review.

## Validation commands and results

```text
npm test                                  12 passing tests
node --check src/**/*.mjs public/app.js   passed
GET /api/health                           passed
POST /api/analyze                         HTTP 200, ready, 3 observations
missing Graph credential                  HTTP 503, explicit error
authenticated Graph smoke                 3/3 protocols, fresh, no indexing errors
```

The exact local preview used was `http://127.0.0.1:4173`.

## Known limitations

- No real model provider was exercised; the deterministic fallback is the
  current answer path.
- Subgraph MCP remains outside the critical path and was not operationally
  tested.
- Incentive yield is unknown in the qualified standardized source.
- The comparison is Ethereum + USDC + three protocols only.
- The repository is not yet public and no demo video exists.
- Browser automation was unavailable; HTTP/static UI verification was used.

## Exact items before public release

1. Review and approve the fallback-only versus model-backed demo decision.
2. If desired, add one small grounded model adapter without moving arithmetic
   or secrets into the browser.
3. Run one final authenticated smoke test and secret scan immediately before
   making the repository public.
4. Refresh the README’s public run instructions if the model adapter changes.
5. Produce the 2–4 minute demo video and submit only after explicit approval.

## Recommended next milestone

Review this branch and the AI bounty positioning. If approved, add only the
smallest model-backed interpreter adapter and a recorded judge walkthrough;
otherwise proceed with the grounded fallback as the clearly labeled analyst
mode. Do not add more Graph products, protocols, chains, execution, wallets,
or control-plane functionality in the next step.

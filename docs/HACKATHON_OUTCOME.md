# ETHOnline 2026 outcome

AgencyAI Graph Financial Analyst was developed during the ETHOnline 2026
period as a bounded experiment around The Graph and evidence-grounded AI
financial analysis.

The application was completed, deployed publicly, and prepared technically for
submission. No ETHOnline submission was made because participant registration
had closed before the developer registered for the event. No prize claim or
judging claim is implied.

## Timeline record

| Period | Git evidence | What existed or was built |
|---|---|---|
| Before the listed event date | `6a69d4b` — 2026-09-03T22:38:51Z | Empty scaffold: `.gitignore` and a three-line placeholder README. No functional capability. |
| Start-window boundary | `dc3c32b` — 2026-09-04T00:31:31Z | Project-purpose and boundary README. The exact event kickoff time was not published on the accessible official pages. |
| ETHOnline development period | `ccc450c` through `3e4833a` | Feasibility, live Graph validation, deterministic analysis, evidence, model interpretation, fallback, UI, deployment, testing, and public-release documentation. |

The substantive implementation did not exist in the initial repository setup.
No timestamps or history were changed.

## Result

- Live Graph standardized lending data from Aave V3, Compound III, and Spark Lend.
- Explicit protocol and economic-role qualification, including Compound's USDC base market.
- Deterministic financial normalization and comparison.
- Canonical evidence with source, block, freshness, methodology, and unknowns.
- Grounded OpenAI interpretation with evidence-reference validation.
- Deterministic fallback when model or data validation fails.
- Public Cloudflare Worker deployment at <https://capital.agencyai.me>.
- Public repository with MIT license and automated tests.

## What this is now

This repository is a stable AgencyAI financial-intelligence reference
implementation and a clean pre-existing baseline for future development. It
can support a future Continuity or existing-project-eligible hackathon after
the event rules and registration requirements are verified.

For future events, preserve this baseline, document new work separately, and do
not imply that this project was submitted to ETHOnline 2026.

## Future hackathon procedure

- Treat the tagged baseline as pre-existing work.
- Enter only events and tracks that explicitly permit Continuity or existing projects, unless a genuinely separate net-new project is started after kickoff.
- Record a pre-event baseline SHA or tag before development.
- Document exactly what is added during the event.
- Do not build speculative competition features before an event if they could become its substantive Continuity milestone.
- Verify participant registration and application status before development begins.

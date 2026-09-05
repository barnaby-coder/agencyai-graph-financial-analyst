# Demo storyboard

This is a reusable recording storyboard retained from the ETHOnline 2026
experiment. No ETHOnline video was recorded or published because participant
registration had closed before the developer registered for the event. Reuse
it for a future approved demo only after checking that event's rules and track
requirements.

Target length: approximately three minutes. Keep the recording between two
and four minutes, use the live app, and show the real loading and evidence
states. The current hosted request normally takes about 11–12 seconds.

Live app: <https://capital.agencyai.me>

Future recording gate: confirm the event, registration, and prize-pool rules
before recording so any required provenance sentence is included once.

## Timed script

### 0:00–0:20 — Problem

“Onchain financial markets are transparent, but comparing them is not simple.
You still have to identify the right market, understand its economic meaning,
normalize the metrics, preserve provenance, and recognize what the data does
not tell you.”

### 0:20–0:35 — Question

Show the live app and submit:

> I have USDC. What productive lending opportunities can we observe on
> Ethereum, where is the return coming from, how do the opportunities compare,
> and what risks should I understand?

“AgencyAI lets me ask that as a financial question rather than manually
investigating three protocols.”

### 0:35–0:55 — What is happening

Let the actual loading state remain visible:

> Querying live onchain markets → validating market evidence → calculating
> deterministic metrics → generating grounded analysis

“The Graph is retrieving live Ethereum lending observations. The AI does not
receive raw data and decide what the financial state means by itself. AgencyAI
qualifies the markets and calculates comparable evidence deterministically
before the model sees anything.”

### 0:55–1:30 — Financial qualification and observations

Show the Aave V3, Compound III, and Spark Lend cards. Point out only:

- fresh observations;
- supply rate and utilization;
- observable liquidity;
- `Incentives: Unknown`.

“These are current Graph-derived observations. Standardized access gives us a
common starting language, then AgencyAI qualifies the economic role of each
market, normalizes the metrics, and preserves explicit unknowns such as
incentives. The rate is shown as a neutral supply-rate field, not as a
guaranteed return or asserted APY.”

### 1:30–2:00 — AI interpretation

Show the analyst sections for the observation, comparison, return source, and
risks or limitations.

“The model receives a compact canonical evidence packet after deterministic
financial analysis. It interprets and communicates what the evidence supports;
it does not invent or calculate the authoritative market state.”

### 2:00–2:35 — Evidence

Open an evidence detail row and show the protocol, market role, Graph source,
block, timestamps, freshness, normalized metrics, and methodology.

“Every important claim points back to a stable evidence reference. Don’t ask AI
to invent the financial state; give it evidence it can explain. If the model
references evidence that does not exist, the response is rejected and the app
falls back to deterministic analysis. Unknown or stale evidence is surfaced,
not silently ranked.”

### 2:35–2:55 — Why The Graph

“The Graph is the live data fabric underneath this experience. Standardized
Graph data gives us a common language for the markets; AgencyAI’s job starts
where standardization ends: determining what those observations mean
financially, preserving what is known and unknown, and giving AI an evidence
boundary it cannot silently escape.”

### 2:55–3:05 — Close

“The Graph makes onchain financial evidence accessible. AgencyAI turns that
evidence into financial intelligence an AI can explain without inventing the
underlying state.”

Do not tell viewers where to deposit capital or present the comparison as
financial advice.

## Recording checklist

### Before recording

- Confirm `/health` and one canonical live analysis are healthy.
- Confirm the response uses model mode and all three observations are fresh.
- Use a clean desktop browser at approximately 1440px wide.
- Close unrelated tabs and applications; disable notifications.
- Set browser zoom so the question, cards, and analyst sections are readable.
- Prepare the canonical question and ensure the evidence section opens cleanly.
- Confirm no personal, credential, or private infrastructure information is visible.

### During recording

- Speak conversationally and keep the cursor deliberate.
- Leave the real loading state visible; do not fake progress or use fixture data.
- Do not narrate every number. Emphasize the Graph, deterministic boundary,
  grounded interpretation, and inspectable evidence.
- Keep the recording between two and four minutes.

### After recording

- Verify audio, readable text, and a minimum 720p export.
- Confirm the app state was live and Graph freshness is visible.
- Confirm evidence provenance is shown and no unsupported claims are made.
- Check the final duration and trim only unnecessary dead air.

## The one-line contrast

Common pattern:

```text
data → LLM → answer
```

This demo:

```text
The Graph → qualified observations → deterministic financial state
→ canonical evidence → constrained AI interpretation
→ evidence-reference validation → inspectable answer
```

The model communicates what the qualified, current evidence supports. It is
not the source of financial truth.

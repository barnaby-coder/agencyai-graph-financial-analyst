# Demo storyboard

Target length: approximately three minutes. Keep the recording between two
and four minutes, use the live app, and show the real loading and evidence
states. The current hosted request normally takes about 11–12 seconds.

Live app: <https://capital.agencyai.me>

## Timed script

### 0:00–0:20 — Problem

“Onchain financial markets are transparent, but comparing them is not simple.
You still have to identify the right market, normalize the metrics, understand
where the return comes from, and recognize what the data does not tell you.”

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

“The Graph is retrieving live Ethereum lending observations. Before the AI sees
anything, AgencyAI qualifies the markets and calculates comparable financial
evidence deterministically.”

### 0:55–1:30 — Live market observations

Show the Aave V3, Compound III, and Spark Lend cards. Point out only:

- fresh observations;
- supply rate and utilization;
- observable liquidity;
- `Incentives: Unknown`.

“These are current Graph-derived observations, normalized into one financial
lens across three protocols. The rate is shown as a neutral supply-rate field,
not as a guaranteed return or asserted APY.”

### 1:30–2:00 — AI interpretation

Show the analyst sections for the observation, comparison, return source, and
risks or limitations.

“The model receives a compact evidence packet after deterministic financial
analysis. It interprets and communicates what the evidence supports; it does
not invent or calculate the authoritative market state.”

### 2:00–2:35 — Evidence

Open an evidence detail row and show the protocol, market role, Graph source,
block, timestamps, freshness, normalized metrics, and methodology.

“Every important claim points back to a stable evidence reference. If the model
references evidence that does not exist, the response is rejected and the app
falls back to deterministic analysis. Unknown or stale evidence is surfaced,
not silently ranked.”

### 2:35–2:55 — Why The Graph

“The Graph is the live data fabric underneath this experience. Without current
Graph observations, there is no market evidence for the analyst to interpret.
The value is not a raw query on screen; it is the qualified, comparable,
traceable evidence that reaches the answer.”

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
The Graph → qualified observations → deterministic analysis → evidence
→ AI interpretation → grounding validation → inspectable answer
```

The model communicates what the qualified, current evidence supports. It is
not the source of financial truth.

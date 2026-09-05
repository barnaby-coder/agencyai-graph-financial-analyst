# Demo storyboard

Target length: approximately three minutes.

## 0:00–0:20 — Problem

“Onchain financial markets are transparent, but comparing them is not simple.
Rates, utilization, liquidity, and protocol semantics need to be normalized
before an AI can responsibly explain them.”

## 0:20–0:40 — Question

Show the app and submit the sample USDC question. Explain that the application
will query live Ethereum lending data through The Graph.

## 0:40–1:05 — Live process

During loading, show the honest process message: live market queries, market
evidence validation, deterministic metric calculation, and grounded analysis.
Do not imply that a cached or prerecorded answer is being shown.

## 1:05–1:45 — Result

Show Aave V3, Compound III, and Spark Lend. Point out the fresh state, supply
rates, utilization, observable liquidity, and the fact that incentives remain
unknown in the qualified source. The compact process cue above the evidence
desk makes the sequence visible: The Graph → deterministic analysis → AI
interpretation → verified evidence.

Explain that the displayed return is the observed supply-rate field, not a
guaranteed return or asserted APY.

## 1:45–2:20 — AI interpretation

Show the analyst explanation. Say:

“The model does not invent or calculate these numbers. It receives a compact
evidence packet after deterministic financial analysis and explains what that
evidence supports.”

Keep the focus on grounded interpretation rather than model branding.

## 2:20–2:45 — Evidence

Open the evidence details and show the protocol, market role, Graph source,
block, timestamp, freshness, normalized metrics, and methodology. Explain that
unknown or stale evidence is surfaced rather than silently ranked.

## 2:45–3:00 — Close

“The Graph makes the live onchain evidence accessible. AgencyAI turns that
evidence into comparable financial intelligence an AI can explain without
inventing the underlying state.”

Do not tell viewers where to deposit capital or present the comparison as
financial advice.

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

The point is not that the model is the source of financial truth. The model
helps communicate what the qualified, current evidence supports.

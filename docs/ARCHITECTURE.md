# Hackathon vertical slice architecture

## User problem

Answer one bounded question: where can USDC earn observable lending return on
Ethereum, how do Aave V3, Compound III, and Spark Lend compare, and what should
a reader understand about the limitations?

The experience is question → investigation → deterministic comparison →
plain-language interpretation → inspectable evidence. It is read-only and
does not connect to a wallet or move capital.

## Live data flow

The browser posts a question to the local server. The server calls the Graph
Gateway with the runtime-only `GRAPH_API_KEY`, using the pinned standardized
lending query and three validated deployment/market identities. The client
applies an explicit timeout and one bounded retry for transient failures.

Each response must include valid `_meta.block` data, no indexing error, and the
expected USDC market ID. Compound is qualified against its USDC base-market
composite ID; the first USDC result is never trusted. The server returns only
normalized observations, analysis, answer text, and evidence — never the Graph
credential.

## Deterministic versus agent boundary

`src/financial/normalize.mjs` owns scaling, utilization, liquidity proxy,
freshness, variable-rate selection, market-role qualification, and evidence
construction. `src/agent/model-interpreter.mjs` builds a compact packet from
those deterministic results. It excludes raw Graph responses and supplies
stable evidence IDs before model invocation.

`src/agent/interpreter.mjs` accepts a provider-neutral `generate` function. The
model client has two transport implementations: the OpenAI Responses API uses
`instructions`, `input`, and strict JSON-schema output; the existing
OpenAI-compatible path uses chat-completions `messages` and `response_format`.
Both receive the same compact packet and return a structured summary plus
evidence-backed points. The application validates the output shape, rejects
unknown evidence IDs and unsupported APY/execution claims, and then renders
the answer. Any missing model configuration, timeout, provider failure,
malformed output, or grounding failure uses the deterministic fallback. The
model never owns arithmetic, market qualification, freshness, or execution
decisions.

The optional HTTP adapters are deliberately transport-thin and provider-neutral
at the financial contract. OpenAI is selected when `OPENAI_API_KEY` is present;
otherwise the existing `MODEL_API_URL`, `MODEL_API_KEY`, and `MODEL_NAME`
configuration selects the compatible chat-completions transport. The OpenAI
request does not enable tools or external capabilities and opts out of response
storage. Provider failures never change the deterministic analysis.

Rates are named `supplyRatePct` and `borrowRatePct`, because the standardized
source is qualified as annualized percentage-point / APR-like data rather than
silently labeled APY. Incentives remain the literal value `unknown`.

The optional OpenAI settings are `OPENAI_API_KEY`, `OPENAI_API_URL`, and
`OPENAI_MODEL`; the compatible transport uses `MODEL_API_URL`, `MODEL_API_KEY`,
and `MODEL_NAME`. They are read only on the server. Credentials are never
returned to the browser or included in model input beyond the transport
authorization header.

## Freshness and failure behavior

Freshness is calculated from Graph block time at capture:

- `fresh`: ≤15 minutes;
- `stale`: >15 minutes and ≤24 hours;
- `unavailable`: >24 hours or missing block metadata.

Only all-fresh observations may be ranked as a current comparison. A partial
response is shown with a warning and unavailable protocols are excluded. No
live request silently falls back to fixtures. With no Graph credential, the
server returns an explicit configuration error. With no qualified observations,
the API returns unavailable rather than an invented answer.

## Current protocol scope

Ethereum mainnet and USDC supply markets for Aave V3, Compound III, and Spark
Lend only. Subgraph MCP, Token API, Substreams, Composition, x402, Morpho, and
additional chains/protocols are deliberately deferred.

## Explicit non-scope

No wallet connection, signing, transactions, execution, Capital Control,
policy/authorization, brokerage, Giza, IBKR, portfolio management, custom
Subgraphs, or broad financial ontology is part of this vertical slice.

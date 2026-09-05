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

`src/agent/interpreter.mjs` accepts a provider-neutral `generate` function. A
configured JSON model endpoint receives the packet and returns a structured
summary plus evidence-backed points. The application validates the output
shape, rejects unknown evidence IDs and unsupported APY/execution claims, and
then renders the answer. Any missing model configuration, timeout, provider
failure, malformed output, or grounding failure uses the deterministic
fallback. The model never owns arithmetic, market qualification, freshness,
or execution decisions.

The optional HTTP adapter is deliberately transport-thin: it sends a JSON
request containing the model name, system instructions, compact `input`
packet, and response schema. The endpoint may return the object directly or as
JSON text in `output_text`. This keeps provider selection outside the financial
analysis contract and avoids adding an agent framework.

Rates are named `supplyRatePct` and `borrowRatePct`, because the standardized
source is qualified as annualized percentage-point / APR-like data rather than
silently labeled APY. Incentives remain the literal value `unknown`.

The optional model settings are `MODEL_API_URL`, `MODEL_API_KEY`, and
`MODEL_NAME`; they are read only on the server. `MODEL_API_KEY` is never
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

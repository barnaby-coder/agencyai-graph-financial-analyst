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
construction. The fallback interpreter in `src/agent/interpreter.mjs` only
turns those results into sections and caveats. A future model adapter can be
injected behind `createInterpreter`; it receives facts and unknowns but does
not own primary arithmetic or execution decisions.

Rates are named `supplyRatePct` and `borrowRatePct`, because the standardized
source is qualified as annualized percentage-point / APR-like data rather than
silently labeled APY. Incentives remain the literal value `unknown`.

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

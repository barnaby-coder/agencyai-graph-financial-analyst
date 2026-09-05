# agencyai-graph-financial-analyst

Bounded Ethereum + USDC lending intelligence for the ETHOnline 2026
experiment. The current implementation queries The Graph, calculates metrics
deterministically, and renders an evidence-backed explanation.

## Run locally

```bash
GRAPH_API_KEY=<runtime-secret> npm start
```

Open http://127.0.0.1:4173. The key is server-only and must never be committed
or sent to the browser. `npm test` runs the credential-free unit tests.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the bounded design and
[docs/FEASIBILITY.md](docs/FEASIBILITY.md) for the live validation evidence.

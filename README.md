# AgentEval

A lightweight agent evaluation dashboard for exploring test results, pass rates over time, and user feedback. This is project 2 in a three-project agentic AI series, following [AuraDesk](https://github.com/RhugvedWaydande/AuraDesk).

## Run locally

Requires Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev
```

Open the URL printed by Vite. No API key, backend, or account is required. Run `npm test` for evaluator tests and `npm run build` for a production build.

## How the demo works

- **Run evaluation** checks eight local sample agent responses against case-insensitive required phrases. A case passes only if every phrase is present. This is a simple deterministic baseline, not a semantic or safety guarantee.
- The latest results power the summary and test table. Run history is stored in this browser's localStorage; reset it with **Reset demo**. Historical runs are illustrative fixtures, not actual past executions.
- Feedback is illustrative sample data inspired by AuraDesk's thumbs-up/down flow. It is not connected to AuraDesk and does not represent real users. Response times are fixture values, not measured latency.
- Test details show the prompt, sample response, and individual phrase checks. For seeded historical runs these current checks may differ from the illustrative historical status.

See [CODE_TOUR.md](CODE_TOUR.md) for the architecture and extension points, and [JOURNEY.md](JOURNEY.md) for the development log.

## Next integration step

A real integration needs an authenticated server-side adapter to invoke AuraDesk, persist runs and feedback, and evaluate actual responses. Avoid placing API keys in client-side Vite variables. Define consent, access control, and retention policies before importing real conversations or feedback.

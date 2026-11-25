# Code tour

This project is a React single-page application built with Vite. There is no server or API key in the demo.

## Start here

1. `index.html` provides the root element and loads `src/main.jsx`.
2. `src/main.jsx` renders the sidebar, overview, test suite, feedback inbox, and test detail dialog. React state controls navigation, filters, the current run history, and the light/dark theme. The theme button stores its preference separately in localStorage. The chart uses Recharts; icons come from Lucide.
3. `src/data.js` contains clearly fictional test cases, sample responses, required phrases, response times, and feedback. Each test has a stable ID used to connect a result to its case.
4. `src/evaluation.js` contains the evaluator and storage helpers. `evaluateCase` performs case-insensitive substring checks; `runEvaluation` evaluates the suite and records a timestamp. `passRate` computes a percentage from results. The seed history is illustrative and relative to the current date.
5. `src/styles.css` contains the responsive layout, cards, colors, and component styles.
6. `src/evaluation.test.js` checks the scoring and aggregation with Node's built-in test runner.

## Data flow

Clicking **Run evaluation** calls `runEvaluation`, appends the result to React state, and attempts to save the history in localStorage. The overview, chart, and test table derive their values from that history. If storage is unavailable, the current session still works and a notice appears. **Reset demo** replaces history with sample runs. The feedback list is independent static demo data.

## Connecting a real agent

Replace the fixture response step with a server-side adapter that submits each prompt to an authorized AuraDesk endpoint and records the actual response, timing, errors, and trace. Keep secrets on the server. Store case versions and individual check outcomes with each run so historical results remain reproducible. Introduce more robust, domain-specific assertions and human review before treating scores as quality or safety measures. A separate authenticated import or API could map consented AuraDesk feedback to a durable store. Do not expose private customer data in browser fixtures.

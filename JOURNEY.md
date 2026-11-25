# Journey

## 2026-11-25 — Initial dashboard

- Started project 2 as a React + Vite application in the existing GitHub repository.
- Added an overview, evaluation suite, trend chart, feedback inbox, and case detail view.
- Built a deterministic phrase-check evaluator over local sample responses, with browser-local run history and a reset action.
- Added illustrative historical runs and feedback; neither is live AuraDesk data. Documented the integration boundary and privacy considerations.
- Added evaluator tests, a code tour, and local setup instructions.

## 2026-11-25 — Theme preference

- Added a dark-mode button to the top bar, with a browser-local preference and a light-mode return action.
- Applied the theme to navigation, charts, feedback, filters, and the test detail dialog.

## 2026-11-25 — Feedback import foundation

- Inspected AuraDesk: feedback is held only in React session state; no export or API exists in the inspected version.
- Added a validated, versioned JSON import, separate demo/imported views, linked prompt and response details, browser-local persistence, and removal.
- Documented the manual preparation steps and privacy limitations in `FEEDBACK_IMPORT.md`. A real AuraDesk export remains a separate integration step.

---
"@aragon/assistant": minor
"@aragon/assistant-contracts": minor
---

Add the proposal-analysis endpoint (`POST /analysis/proposal`): a server-to-server route, authenticated with `ANALYSIS_API_SECRET`, that turns the fact pack and rule findings the Aragon backend computed into a written report via a single structured model call. The report refers to actions by index only (no free amounts or addresses), the proposal text is passed to the model as fenced untrusted data, and the severity can never drop below the rules' floor. The wire contract (`proposalAnalysisRequestSchema`, `proposalAnalysisReportSchema`, `proposalAnalysisResponseSchema`, contract version 1) lives in the contracts package.

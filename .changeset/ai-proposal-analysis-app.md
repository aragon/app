---
"@aragon/app": minor
---

Add the AI analysis card to the proposal details aside behind the `aiProposalAnalysis` feature flag: a button asks the backend for a report on what the proposal actions do and whether they match the description, rendered with a severity tag, the referenced actions resolved from the backend fact pack and an "AI-generated, verify yourself" disclaimer. DAOs outside the backend allowlist see that the analysis is not enabled.

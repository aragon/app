---
'@aragon/assistant': patch
'@aragon/docs-corpus': patch
---

The heading pattern of the corpus loader no longer backtracks quadratically on long runs of spaces (CodeQL `js/polynomial-redos`).

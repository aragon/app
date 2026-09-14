---
'@aragon/app': patch
---

Move Safe transaction execution into an account-wide hook: live authority check, signature-bytes assertion, simulation gate, send, and receipt classification. Whether a caller's own effect landed is supplied by the caller, so governance keeps its report check while an ordinary Safe transaction needs none.

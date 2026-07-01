---
"@aragon/app": minor
---

Reduce the chance of duplicate pending wallet transactions: the in-flight send is now owned outside the transaction dialog, so closing and reopening (or reloading) resumes the existing request instead of re-sending it.

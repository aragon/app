---
"@aragon/app": patch
---

Normalise Safe addresses to their checksummed form at the Safe transaction service boundary, fixing the owners, pending transaction and asset sections failing to load when a Safe address is not already checksummed

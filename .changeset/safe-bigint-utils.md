---
"@aragon/app": patch
---

Fix runtime crash on BigInt conversion of floating-point strings from APIs (e.g. `"10000000000000000000000000.0"`). Add `bigIntUtils.safeParse()` utility that handles decimal suffixes, scientific notation, and non-finite numbers across all token and lock-to-vote plugin components.

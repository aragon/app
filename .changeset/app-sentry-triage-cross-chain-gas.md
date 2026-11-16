---
'@aragon/app': patch
---

Fix the cross-chain forward-message action crashing when a nested action carries a bigint parameter, such as a token amount.

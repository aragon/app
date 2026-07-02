---
"@aragon/app": patch
---

Fix stale "duplicate proposal" warnings on the create-proposal page: pending wallet requests that were interrupted (page reloaded mid-sign) or already mined are no longer counted as in-flight, and settled transactions are reconciled and cleared on reload. When a creation for the same DAO + plugin is genuinely in flight, the warning now lets you resume the existing transaction or start a new one.

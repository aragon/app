---
"@aragon/app": patch
---

Fix stale "duplicate proposal" warnings on the create-proposal page: pending wallet requests that were interrupted (page reloaded mid-sign) or already mined are no longer counted as in-flight, and settled transactions are reconciled and cleared on reload. The warning now lists the in-flight proposal(s) with their status and a link to the transaction, and lets you return to the in-flight transaction dialog to resume it or publish anyway to supersede it.

---
"@aragon/app": patch
---

Surface a warning with an explicitly confirmed retry when a transaction stays unconfirmed past 90 seconds, expire stale persisted pending-transaction records, pin receipt polling to the transaction chain, and show an actionable error for underpriced replacement transactions

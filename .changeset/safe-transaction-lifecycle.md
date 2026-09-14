---
'@aragon/app': patch
---

Complete the Safe transaction lifecycle in Aragon. Owners review the full transaction before signing it, including every call in a batch, and can confirm queued Safe transactions from the Safe account page. Execution checks owners and threshold before spending gas, reports what the transaction actually did rather than treating any receipt as success, and offers a re-queue when a report has lost its nonce or was executed elsewhere. Settled proposal stages show the confirmations from the Safe transaction that reported them, and say why those confirmations are unavailable when they cannot be found.

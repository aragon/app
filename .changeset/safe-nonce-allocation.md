---
"@aragon/app": patch
---

Sign Safe proposal reports against the next free Safe nonce instead of the current one, so a new report no longer competes with an already queued transaction, let an owner re-queue a report whose nonce was consumed, and hold the action while an executed report is still being indexed

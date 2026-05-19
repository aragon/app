---
"@aragon/app": patch
---

Fix DAO members list when the connected user isn't in the paginated backend response yet: pinning no longer evicts a real member from the token/lock-to-vote list, and the "X of Y" counter now reflects the rendered cards in admin/multisig lists.

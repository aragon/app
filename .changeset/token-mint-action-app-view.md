---
"@aragon/app": patch
---

Render token mint actions through an app-owned detail view registered in the action view registry, replacing the gov-ui-kit `ProposalActionTokenMint` basic view. The minted amount is now computed from the raw balances before they are formatted.

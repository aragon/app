---
"@aragon/app": patch
---

Render multisig add-members and remove-members actions through an app-owned detail view registered in the action view registry, replacing the gov-ui-kit `ProposalActionChangeMembers` basic view. The view reads the multisig action directly, so the multisig plugin no longer converts it to the kit action type.

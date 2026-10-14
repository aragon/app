---
"@aragon/app": patch
---

Render multisig, token and lock-to-vote settings changes through an app-owned detail view registered in the action view registry, replacing the gov-ui-kit `ProposalActionChangeSettings` basic view. The plugins still convert the settings into term/definition lists, now typed as the app's `IProposalActionChangeSettings`.

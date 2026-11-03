---
"@aragon/gov-ui-kit": major
---

Remove the last built-in proposal action view. `ProposalActionChangeMembers`, its `IProposalActionChangeMembers` / `IProposalActionChangeMembersProps` types, the `generateProposalActionChangeMembers` test util and the `proposalActionChangeMembers` modules copy are removed, and so is the `ProposalActionType` enum, which has no values left. `ProposalActions.Item` now renders its BASIC view only through `CustomComponent`: without one, the BASIC view mode is disabled and the item opens the decoded or raw view. `ProposalActionTypeNoBasicView` stays exported.

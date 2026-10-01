---
"@aragon/gov-ui-kit": major
---

Remove `ProposalActionWithdrawToken`, its `IProposalActionWithdrawToken` / `IProposalActionWithdrawTokenProps` types, the `generateProposalActionWithdrawToken` test util and the `ProposalActionType.WITHDRAW_TOKEN` value: `ProposalActions.Item` no longer has a built-in view for token transfers. Render them through `CustomComponent`, for example with `AssetTransfer`, which stays exported.

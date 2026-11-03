---
"@aragon/gov-ui-kit": major
---

Remove `ProposalActionTokenMint`, its `IProposalActionTokenMint` / `IProposalActionTokenMintMetadataReceiver` / `IProposalActionTokenMintProps` types, the `generateProposalActionTokenMint` test util, the `ProposalActionType.TOKEN_MINT` value and the unused `proposalActionsTokenMint` modules copy: `ProposalActions.Item` no longer has a built-in view for token mints. Render them through `CustomComponent`, for example with `MemberDataListItemStructure`, which stays exported.

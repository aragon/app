---
"@aragon/gov-ui-kit": major
---

Remove `ProposalActionUpdateMetadata`, its `IProposalActionUpdateMetadata` / `IProposalActionUpdateMetadataDaoMetadata` / `IProposalActionUpdateMetadataDaoMetadataLink` / `IProposalActionUpdateMetadataProps` types, the `generateProposalActionUpdateMetadata` test util, the `ProposalActionType.UPDATE_METADATA` and `ProposalActionType.UPDATE_PLUGIN_METADATA` values and the `proposalActionsUpdateMetadata` modules copy: `ProposalActions.Item` no longer has a built-in view for metadata updates. Render them through `CustomComponent`.

---
"@aragon/gov-ui-kit": major
---

Remove `ProposalActionChangeSettings`, its `IProposalActionChangeSettings` / `IProposalActionChangeSettingsProps` types, the `generateProposalActionChangeSettings` test util, the `ProposalActionType.CHANGE_SETTINGS_MULTISIG` and `ProposalActionType.CHANGE_SETTINGS_TOKENVOTE` values and the `proposalActionsChangeSettings` modules copy: `ProposalActions.Item` no longer has a built-in view for settings changes. Render them through `CustomComponent`, for example with `DefinitionList`, which stays exported together with `IDefinitionSetting`.

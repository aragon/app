---
type: pattern
title: Metadata input
tags: [design, metadata, forms, wizards, ipfs]
status: draft
source: product-owner briefing (2026-08-04, app metadata input; see log.md) + app source verification (2026-08-04, app@122f1bd1; see log.md) + protocol-doc/framework/plugin-metadata.md
---

# Metadata input

The app treats metadata as the user-facing definition of the thing being created or changed. The underlying contract may accept opaque bytes or a metadata URI, but the user provides meaningful fields; the app builds the JSON, pins it to IPFS, and places the resulting pointer in the transaction. The IPFS mechanism stays behind the product abstraction rather than becoming an input the user must understand.

## The common shape

The recurring input asks for:

- a **name** (called **title** on some content-like objects);
- a **description**; and
- zero or more **resources**, each modeled as a URL and a display label.

The shared Resources control stores each item as `{ url, name }`. Its current validation requires the URL and leaves the label optional, but both fields remain part of the resource shape ([resource fields and validation](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/shared/components/forms/resourcesInput/resourcesInputItem.tsx#L43-L78)). Individual surfaces may add fields that belong to their definition, while operational configuration stays separate.

This is an app-owned schema over a looser protocol mechanism. A plugin instance's [`MetadataExtension`](../protocol-doc/framework/plugin-metadata.md#instance-metadata-metadataextension) stores bytes pointing to free-form off-chain JSON; the contract does not enforce the app's fields. The app's forms and readers establish the consistent product meaning.

## Plugin metadata follows the plugin

Every governance plugin uses the common definition fields. A [process](../governance/process.md) adds its **process key**, which the app uses for friendly proposal identifiers ([proposal identifiers](../governance/proposal-identifiers.md)); a [body](../governance/body.md) uses the common shape without a separate body-only identity schema. The current process form asks for name, process key, description, and resources in one bounded component ([process metadata form](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/modules/createDao/components/createProcessForm/createProcessFormMetadata/createProcessFormMetadata.tsx#L32-L117)), while the body dialog asks for name, description, and resources ([body metadata form](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/modules/createDao/dialogs/setupBodyDialog/setupBodyDialogMetadata/setupBodyDialogMetadata.tsx#L12-L51)).

The metadata belongs to the installed plugin, not independently to its product roles. The same plugin record carries `isProcess`, `isBody`, and one set of name, description, links, process key, and metadata pointer fields ([plugin record](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/shared/api/daoService/domain/daoPlugin.ts#L13-L91)). If one plugin is both a process and a body, that same metadata can therefore appear in both the process-partitioned proposals experience and the body-partitioned members experience.

Updating a plugin uses the same abstraction. The action preserves unedited metadata, replaces the fields the user changed, pins the new JSON, and calls `setMetadata` with the encoded pointer; the user never pastes an IPFS hash ([update action](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/modules/governance/components/createProposalForm/createProposalFormActions/proposalActions/updatePluginMetadataAction/updatePluginMetadataAction.tsx#L16-L79)). The process key is included when the target is a standalone process rather than a sub-plugin.

## Deliberate extensions

The common fields are a base that each object type extends deliberately:

- A Capital Distributor [campaign](../governance/capital-distributor.md) uses **title**, description, and resources, and the app adds a fixed `Distribution` type before pinning. Asset, payout behavior, allocation file, and schedule are campaign configuration rather than metadata ([campaign preparation](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/actions/capitalDistributor/components/capitalDistributorCreateCampaignActionCreate/capitalDistributorCreateCampaignActionCreate.tsx#L70-L127)).
- A [gauge](../governance/gauge-voting.md) uses name, description, and resources and may also carry an **avatar**. The gauge address is the thing being described, so it remains a contract argument outside the metadata JSON; an uploaded avatar is pinned separately and its URI is added to that JSON ([gauge preparation](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/actions/gaugeVoter/components/gaugeVoterCreateGaugeActionCreate/gaugeVoterCreateGaugeActionCreate.tsx#L37-L82)).
- Account creation follows the same core shape and adds a **logo** (the user-facing label for the image stored in the metadata's `avatar` field) plus the optional `dao.eth` label described by [the account's optional subname](../accounts/account.md#the-accounts-optional-daoeth-subname). Proposal creation uses its content-specific title, summary, body, and resources fields ([proposal](../governance/proposal.md)).

These additions belong beside the common definition only when they describe what the object *is*. Fields that configure how it operates belong in their own step or group.

## Placement in a wizard

In both [full-screen and dialog wizards](./wizard.md), metadata gets a standard, bounded step before governance, membership, permissions, actions, or other operational configuration. This lets the user define the thing first and keeps each later step focused on one idea, avoiding a mental-context switch inside a screen.

"First" is relative to the object's definition work. A prerequisite selection may come before metadata when it determines what the form can show: Create account selects the network before metadata because the network controls the optional ENS field, and Add Body selects the plugin before rendering that plugin's metadata and configuration. After that prerequisite, metadata precedes the object's behavioral settings. The Create Process wizard makes Metadata step zero before stages, proposal creation, and permissions ([process step order](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/modules/createDao/pages/createProcessPage/createProcessPageDefinitions.ts#L11-L40)); the Add Body dialog orders plugin selection, metadata, proposal type, membership, and governance ([body step order](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/modules/createDao/dialogs/setupBodyDialog/setupBodyDialogSteps.tsx#L30-L78)).

Once the input is complete, the shared [transaction submission stepper](./transaction-submission.md) owns IPFS preparation and transaction submission. That separation is what keeps storage mechanics out of the definition screen.

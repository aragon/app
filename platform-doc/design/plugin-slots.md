---
type: pattern
title: Plugin slots
tags: [design, components, plugins]
status: draft
source: aragon-knowledge-base/design/component-patterns/plugin-slots.md (first-slice brain dump, 2026-07-06) + product-owner briefing (2026-07-28, third answers) + product-owner principles review (2026-07-29, see log.md) + app source verification (2026-08-04, app@122f1bd1; see log.md)
---

# Plugin slots

UI slots that hold **bounded plugin definitions**. Every supported plugin declares itself to the app once, then fills the specific slots where its own rules matter — each slot bounding one piece of that plugin's bespoke logic.

This is how generic flows support plugin-specific configuration: the [governance designer](../governance/governance-designer.md) — a [full-screen wizard](./full-screen-wizard.md) — stays generic while each slot renders its plugin's own configuration.

Each plugin the app builds flows around ships its own components, and those are what populate the plugin slots across the app ([plugin](../governance/plugin.md)).

Partitioning this bespoke logic keeps each supported plugin a linear addition to the product rather than multiplying special cases throughout every generic flow. The value is the plumbing and tooling that let these parts compose, not an ever-growing count of plugins.

Plugin slots are one of two slot kinds — see [DAO slots](./dao-slots.md) for the other.

## The slot contract

A bounded definition bounds four things: what the plugin declares about itself, what its slot content is allowed to be, how its configuration becomes a transaction, and where the app looks the definition up.

### What a plugin declares, and which slots it fills

A plugin's one-time declaration carries its identity and the on-chain version the app installs, plus — optionally — the copy shown when someone picks it while adding a [body](../governance/body.md) ([declaration shape](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/shared/types/pluginInfo.ts#L8-L29)). That copy is what makes a plugin **selectable**: a plugin that ships none is still installed and operated by the product but is never offered as a choice in the add-body flow, which is why the [admin plugin](../accounts/admin-plugin-by-default.md) and the [staged proposal processor](../protocol-doc/plugins/spp-plugin.md) never appear there. Carrying the copy is necessary but not sufficient — the plugin must also be available on the connected network ([selection gate](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/modules/createDao/dialogs/setupBodyDialog/setupBodyDialogSelect/setupBodyDialogSelect.tsx#L34-L43)).

Everything else bespoke lives in the named slots the plugin fills. There are a few dozen, grouped by the part of the app that hosts them — the governance experience, account creation, settings, and whole plugin-owned pages ([one set per hosting area](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/modules/createDao/constants/moduleSlots.ts#L1-L7)). A plugin fills only the slots it has an opinion about, and the set it skips is itself meaningful: [multisig](../protocol-doc/plugins/multisig-plugin.md) supplies no member-list, member-panel, or member-stats content where the token-based plugins do. Where the generic flow has a sensible default — a member list, a proposal row, a body's summary card — that default renders instead.

A few slots are not optional. Without the one that builds its installation payload, a plugin cannot be installed at all: the designer looks that slot up directly and fails outright rather than degrading. So "optional slot" is the rule and "required slot" the exception, and the exceptions are the ones on the transaction path.

### Validation

A plugin's setup fields are ordinary fields of the form they appear in, each carrying its own required, format, and range rules. Those rules are the plugin's own business, and they can be **cross-field**: a multisig's approval threshold is required and capped at the current member count, so a threshold that could never be reached cannot be submitted ([threshold rule](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/plugins/multisigPlugin/components/multisigSetupGovernance/multisigSetupGovernance.tsx#L66-L84)). What that refusal means as a product rule is [refuse unsatisfiable configuration](./invariant-validation.md).

Because the fields belong to the form hosting them, the step cannot advance until they pass, and the generic flow never asks a plugin whether its configuration is valid — there is no plugin-supplied validation step. The add-body dialog is its own form rather than part of the surrounding wizard's: a body returns to the designer only once its plugin's fields are satisfied ([dialog form](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/modules/createDao/dialogs/setupBodyDialog/setupBodyDialog.tsx#L57-L77)).

### Transaction composition

When the designer is ready to install a body, it asks that plugin's slot for one thing: the encoded installation call, given the account, the metadata, and the plugin's own setup values ([the request](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/modules/createDao/dialogs/prepareProcessDialog/prepareProcessDialogUtils.ts#L322-L343)). The plugin alone knows how to turn its configuration into that call — it reads its own repository address and encodes its own setup parameters ([one plugin's build](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/plugins/tokenPlugin/utils/tokenTransactionUtils/tokenTransactionUtils.ts#L100-L135)), wrapping the result through the single shared helper that every plugin uses for the framework-level call ([shared wrapper](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/shared/utils/pluginTransactionUtils/pluginTransactionUtils.ts#L93-L107)). The generic flow never looks inside what comes back; it addresses the result and batches it with the rest of the process's setup ([prepare and apply](../governance/governance-designer.md#preparing-and-applying-an-installation)).

Updating and uninstalling an installed body follow the same division of labour, with the split falling in different places: on update the plugin returns the encoded call as it does on install, while on uninstall the plugin supplies only the helper addresses its removal needs and the generic code encodes the call around them. Either way the plugin contributes the part only it can compute.

### Where the definitions live

All of this is one registration table the app fills at startup ([the registry](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/shared/utils/pluginRegistryUtils/pluginRegistryUtils.ts#L86-L217)). Each plugin contributes its entries from its own self-contained folder, and one aggregator initializes every supported plugin in turn ([registration](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/plugins/index.ts#L16-L24)). Generic screens ask the table "what does this plugin put here?" at the point of use.

The same table also holds the bespoke per-account content behind [DAO slots](./dao-slots.md) ([an account's registration](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/daos/cryptex/index.ts#L10-L29)), so the two slot kinds are one mechanism separated by convention rather than two systems. A plugin is therefore a folder plus a registration list, which is what makes supporting one a linear addition rather than an edit to the flows it appears in.

## Worked example: multisig

The slot for the [multisig plugin](../protocol-doc/plugins/multisig-plugin.md) exposes that plugin's specific configuration: who the members are and the approval threshold, with the threshold bounded by the member count as above.

## Worked example: adding Token Voting as a body

When the governance designer adds a new [body](../governance/body.md), the shared setup dialog lists registered plugins that supply setup metadata. Choosing Token Voting keeps the surrounding add-body flow generic while Token Voting fills the bounded slots for membership setup, voting-governance settings, proposal-creation settings, summary rendering, and installation-data construction ([setup choice](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/plugins/tokenPlugin/constants/tokenPlugin.ts#L4-L40), [slot registration](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/plugins/tokenPlugin/index.ts#L142-L167)). The designer owns the body/stage composition; the [Token Voting plugin](../protocol-doc/plugins/token-voting-plugin.md) owns what its configuration means.

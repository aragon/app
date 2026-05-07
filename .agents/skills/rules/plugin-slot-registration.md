---
name: plugin-slot-registration
description: Plugin index.ts wiring — registry chain, slot kinds, and the silent-failure modes that aren't visible from a single file.
applies-to: src/plugins/*/index.ts
kind: rule
---

# plugin-slot-registration

A plugin's `index.ts` is its registration manifest: it wires the plugin's components, hooks, and util functions into the module slots that consume them. The shape is uniform across all plugins.

## Canon

- `src/plugins/tokenPlugin/index.ts` — most complete reference; covers component, function, and hook registrations across governance, settings, and create-dao slots.
- `src/plugins/multisigPlugin/index.ts` — second reference for confirming a pattern is general, not token-specific.
- `src/shared/utils/pluginRegistryUtils/pluginRegistryUtils.ts` — registry API surface (`registerPlugin`, `registerSlotComponent`, `registerSlotFunction`).
- Module slot enums — `src/modules/{governance,settings,createDao,...}/constants/moduleSlots.ts`.

## Registration grammar

```ts
export const initialiseTokenPlugin = () => {
    pluginRegistryUtils
        .registerPlugin(tokenPlugin)
        .registerSlotComponent({
            slotId: GovernanceSlotId.GOVERNANCE_DAO_MEMBER_LIST,
            pluginId: tokenPlugin.id,
            component: TokenMemberList,
        })
        .registerSlotFunction({
            slotId: GovernanceSlotId.GOVERNANCE_PROCESS_PROPOSAL_STATUS,
            pluginId: tokenPlugin.id,
            function: tokenProposalUtils.getProposalStatus,
        });
};
```

Every plugin exports exactly one `initialise{PluginName}` function called from `src/plugins/index.ts`. The chain starts with `registerPlugin(...)` and follows with one `registerSlotComponent` or `registerSlotFunction` call per slot the plugin participates in.

## Non-obvious

- **Slot kind dictates which `register*` to call.** Slot IDs are plain enum values — the type system does not tell you whether a slot expects a component or a function. The convention is encoded by the consumer (`PluginSingleComponent` for component slots, `useSlotSingleFunction` for function slots). Mismatches compile fine and silently render nothing or return undefined at runtime. To pick correctly, find where the slot is *consumed* in the relevant module and match the consumer's expectation.
- **`pluginId` mismatch is silent.** `pluginId` on registration must equal the `id` field of the `IPlugin` object passed to `registerPlugin`. If a plugin is renamed or duplicated and one site is missed, slot lookups silently miss and the UI degrades to empty. Always reference `{plugin}.id` from the plugin constant — never inline a string literal.
- **Hooks register as functions.** A hook (e.g. `useTokenMemberStats`) goes through `registerSlotFunction`. The slot consumer (`useSlotSingleFunction`) invokes it as a hook in the consumer's render tree.
- **Order of registration is not significant**, but `registerPlugin` must come before any `registerSlot*` call that references its `pluginId`.
- **Missing a slot is acceptable.** Not every plugin participates in every slot. Slots without a registered handler render nothing or return undefined — that's the design, not a bug.

## Folder layout (per plugin)

```
src/plugins/{pluginName}/
├── index.ts                 # registration chain — this file
├── constants/{plugin}.ts    # IPlugin definition (id, metadata, settings)
├── components/              # registered slot components
├── hooks/                   # registered slot hooks (e.g. use{Plugin}MemberStats)
├── utils/                   # registered slot functions (e.g. {plugin}ProposalUtils)
├── types/                   # IPlugin/ISettings interfaces
├── dialogs/                 # plugin-owned dialogs (use next/dynamic)
└── testUtils/generators/    # test data factories
```

When adding a slot registration, the imported component/function must already exist at the path `index.ts` references. Don't stub the registration without the underlying implementation; the chain must compile.

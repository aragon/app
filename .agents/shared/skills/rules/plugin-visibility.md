---
name: plugin-visibility
description: Two filters sit on the plugin list — CMS visibility (opt-in, presentation-only) and unknown interface type (opt-out, applied by default). Never filter a list you then look up by address/slug/type.
globs: apps/app/src/shared/hooks/useDaoPlugins/**, apps/app/src/shared/utils/daoVisibilityUtils/**, apps/app/src/shared/utils/daoUtils/**, apps/app/src/plugins/*/hooks/*NormalizeActions/**, apps/app/src/modules/governance/dialogs/selectPluginDialog/**
kind: rule
---

# plugin-visibility

Two independent filters sit on the plugin list, and their defaults point in **opposite** directions. Get the axis right before reaching for a flag.

| Axis | Flag | Default | Why |
| --- | --- | --- | --- |
| CMS hidden (`pluginsToHide`) | `visibleOnly: true` | off — list is complete | A hidden plugin still works; only its presentation is suppressed, so lookups must resolve it. |
| Unknown interface type | `includeUnsupported: true` | **on — unknowns are dropped** | The app has no UI to render an unclassified plugin with, so it is never a valid target. |

## Canon

- `src/shared/hooks/useDaoPlugins/useDaoPlugins.ts` — `visibleOnly?: boolean` gates `filterHiddenPlugins`. Default `false` = full canonical list.
- `src/shared/utils/daoVisibilityUtils/daoVisibilityUtils.ts` — the only place that removes hidden plugins.
- `src/shared/utils/daoUtils/daoUtils.ts` — `isSupportedPlugin` is the single predicate for the unknown axis, and `getDaoPlugins` applies it unless `includeUnsupported` is set. Deliberately an interface-type check, never a plugin-registry lookup: the registry populates on demand, so a registry check would mark every plugin unsupported during server rendering.

## The invariant

- **Lookups use the full list.** Resolving a plugin by `pluginAddress`, `slug`, `interfaceType`, or `type` to read its `.settings`/metadata, render an existing proposal/action, run a guard, submit a vote, or count plugins → call `useDaoPlugins` WITHOUT `visibleOnly`. A hidden plugin must still resolve.
- **Listings & create-pickers use `visibleOnly: true`.** Rendering a set of plugins to the user — plugin filter tabs (any `useDaoPluginFilterUrlParam` consumer feeding `PluginFilterComponent`), a body/process selector for the aside, or a picker for CREATING new proposals/actions (action composer, process picker, `selectPluginDialog`) → pass `visibleOnly: true`. `useDaoPluginFilterUrlParam` forwards params straight to `useDaoPlugins`, so it inherits the same `false` default — every filter-tab caller must opt in explicitly. Hidden plugins must not be offered for new work.
- **Never filter-then-find.** If you filter by visibility (`visibleOnly: true` or `filterHiddenPlugins(list)`) and then `list.find(byAddress)`, a hidden target resolves to `undefined` and reading `.settings` crashes with `TypeError: Cannot read properties of undefined (reading 'settings')`. This was a real production bug in the normalize hooks (APP-793).
- **`includeUnsupported: true` is for on-chain inventory only.** Surfaces that describe what is *installed* rather than what you can *govern with* — the permissions view, contract versions — must pass it, otherwise a contract holding permissions over the DAO silently disappears from the screen an admin uses to audit exactly that. Everywhere else leaves it unset.

## Null-safety

Even on the full list, a resolved plugin can be `undefined` (uninstalled / external / unknown target). Lookups that read `.settings` MUST guard before dereferencing:

```ts
const plugin = daoPlugins.find(({ meta }) =>
    addressUtils.isAddressEqual(action.to, meta.address),
);
if (plugin == null) {
    return action; // render the raw action instead of crashing
}
```

## Server Components & navigation

Server Components and `navigationDao` can't call the hook. They call `daoVisibilityUtils.filterHiddenPlugins(...)` directly on `daoUtils.getDaoPlugins(...)` / `dao.plugins` for redirect/default/nav decisions. That is the intended presentation boundary — keep it.

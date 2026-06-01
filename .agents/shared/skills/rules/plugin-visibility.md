---
name: plugin-visibility
description: Plugin visibility (CMS pluginsToHide) is presentation-only — never filter a list you then look up by address/slug/type.
globs: src/shared/hooks/useDaoPlugins/**, src/shared/utils/daoVisibilityUtils/**, src/plugins/*/hooks/*NormalizeActions/**, src/modules/governance/dialogs/selectPluginDialog/**
kind: rule
---

# plugin-visibility

CMS "hidden" plugins (`IDaoOverride.pluginsToHide`) are a **presentation** concern, not a data concern. The canonical plugin list is always complete.

## Canon

- `src/shared/hooks/useDaoPlugins/useDaoPlugins.ts` — `visibleOnly?: boolean` gates `filterHiddenPlugins`. Default `false` = full canonical list.
- `src/shared/utils/daoVisibilityUtils/daoVisibilityUtils.ts` — the only place that removes hidden plugins.

## The invariant

- **Lookups use the full list.** Resolving a plugin by `pluginAddress`, `slug`, `interfaceType`, or `type` to read its `.settings`/metadata, render an existing proposal/action, run a guard, submit a vote, or count plugins → call `useDaoPlugins` WITHOUT `visibleOnly`. A hidden plugin must still resolve.
- **Listings & create-pickers use `visibleOnly: true`.** Rendering a set of plugins to the user, or a picker for CREATING new proposals/actions (action composer, process picker, `selectPluginDialog`) → pass `visibleOnly: true`. Hidden plugins must not be offered for new work.
- **Never filter-then-find.** If you filter by visibility (`visibleOnly: true` or `filterHiddenPlugins(list)`) and then `list.find(byAddress)`, a hidden target resolves to `undefined` and reading `.settings` crashes with `TypeError: Cannot read properties of undefined (reading 'settings')`. This was a real production bug in the normalize hooks (APP-793).

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

# GovKit component registry

`registry.json` lists every public `@aragon/gov-ui-kit` export with its source, stories,
props, App usages and curated selection intent. `selection-guide.json` and
`../selection-guide.md` are generated views of it; the Markdown ships with the design system
(see `../SYNC.md`).

## Update

From the repo root:

```sh
node packages/gov-ui-kit/design-system/component-registry/registry.mjs extract
node packages/gov-ui-kit/design-system/component-registry/selection-guide.mjs generate
node packages/gov-ui-kit/design-system/component-registry/registry.mjs check
node packages/gov-ui-kit/design-system/component-registry/selection-guide.mjs check
node --test packages/gov-ui-kit/design-system/component-registry/*.test.mjs
```

- Edit curated intent (`description`, `useWhen`, `alternatives`, `keyProps`, `constraints`,
  `composition`, `methods`) in `registry.json`. Everything else is extracted.
- Usage notes come from a `Usage notes:` bullet list in the component's JSDoc; enum and
  string-union values come from their declarations.
- When a file an intent cites changes, extraction marks the intent `stale`. Re-check the
  intent against source, then update its evidence `sha256` and `line` and set `stale: false`.
- A removed export fails extraction until its record is deleted from `registry.json`.
- Entries holding `Review question (maintainer discussion):` constraints stay out of the guide.
- Roots default to `apps/app` and `packages/gov-ui-kit`; override with `GOVKIT_APP_ROOT`,
  `GOVKIT_KIT_ROOT` and `GOVKIT_CONSUMED_ROOT`.

# Syncing the GovKit design system

How to build the **Aragon Governance UI Kit** design system in Claude from this package. It is published to
https://claude.ai/artifact/XkBmSpR3iXii2onniUDV5x
(the only copy design canvases read; publish nowhere else).
Ask Claude: "Sync the design system from aragon/app `main` following
`packages/gov-ui-kit/design-system/SYNC.md`."

Regenerate everything from the repo on each sync, including notes edited on the page. To
change what the design system says, edit its source.

## Build

From the repo root:

```sh
pnpm install
pnpm --filter @aragon/gov-ui-kit build
pnpm --filter @aragon/gov-ui-kit build:storybook
node packages/gov-ui-kit/design-system/component-registry/registry.mjs check
node packages/gov-ui-kit/design-system/component-registry/selection-guide.mjs check
```

Storybook writes `packages/gov-ui-kit/storybook-static/`, including its manifests. If either
check fails, stop: the registry or selection guide is stale for this commit
(`component-registry/README.md`).

## Sources

Components, props and stories (with each story's description) come from Storybook's
manifest, `storybook-static/manifests/components.json`; guideline pages from `docs.json`
beside it, minus the changelog and coding guidelines. What is written for the design system
lives in this folder: `conventions.md` opens the README, and `selection-guide.md` ships
whole as `guidelines/selection-guide.md`, its `### <Name>` sections, named as in the
manifest, copied into each component's notes. Tokens and fonts are under `src/theme/`.

## No previews

The design system carries no component previews (`components/<Name>/preview.html`): browsing the
components is what the kit's Storybook at https://uikit.aragon.org is for, and nothing that uses
the design system reads them. Design canvases use the bundle, the tokens and the fonts; Claude
working in a canvas uses each component's notes. Each component's `README.md` ends with a
"Storybook" section pointing at uikit.aragon.org, in place of a preview. Do not generate or
compare previews.

## After a sync

Start the README with the commit synced and the `@aragon/gov-ui-kit` version, and set `meta.ref` in
`tokens.json` to `main@<commit>`. A canvas copies `tokens.json` with the kit, so design catch-ups read the commit
there to know which kit that canvas has. A sync records nothing in the repo. Report the
component count against the manifest and skipped stories. Spot-check Wallet:
its notes include "hidden below the `md` breakpoint".

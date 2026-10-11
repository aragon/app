# Syncing the GovKit design system

How to build the **Aragon Governance UI Kit** design system in Claude from this package.
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
```

Storybook writes `packages/gov-ui-kit/storybook-static/`, including its manifests.

## Sources

Components, props and stories (with each story's description) come from Storybook's
manifest, `storybook-static/manifests/components.json`; guideline pages from `docs.json`
beside it, minus the changelog and coding guidelines. What is written for the design system
lives in this folder: `conventions.md` opens the README, and `selection-guide.md` ships
whole as `guidelines/selection-guide.md`, its `### <Name>` sections, named as in the
manifest, copied into each component's notes. Tokens and fonts are under `src/theme/`.

## Previews

- Render each story from the manifest with the decorator in `.storybook/preview.tsx`:
  `GukModulesProvider` around a `<div className="flex">` row.
- Lay previews out at 1024px and scale them to fit. The kit's `md` breakpoint is 768px;
  narrower previews show the mobile layout (Wallet hides its name).
- Load one copy of `react-hook-form` for both stories and kit; stories pass their own form
  context to kit fields.
- Leave out stories that import anything the package doesn't export, and utilities with no
  UI (`Rerender`). List them in the README under "Not synced".
- Compare every preview with the same story in `storybook-static`
  (`iframe.html?id=<story id>&viewMode=story`) at the same width. Fix wrapper or width
  differences; report the rest.

Expected differences:

- Remote images and ENS lookups need network a preview doesn't have. Name the image link
  and affected stories in the component's "Preview notes".
- Dialog, DialogAlert, Dropdown and Tooltip stories open from a trigger, as in Storybook.

## After a sync

Report the commit synced, the component count against the manifest, skipped stories and
blocked assets. Spot-check Wallet: its notes include "hidden below the `md` breakpoint"
and its connected stories show the handle.

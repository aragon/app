# design-sync notes

The design system is `@aragon/gov-ui-kit`, synced from `packages/gov-ui-kit` with
`shape: storybook`. Previews are compiled from the kit's own stories; Storybook is
the fidelity oracle. No App code is bundled: App context reaches Claude Design through
the codebase connection, and the selection guide cites App usages only by path.

## Run it

From the repo root, after `pnpm install`:

```sh
pnpm -F "@aragon/gov-ui-kit..." build
(cd packages/gov-ui-kit && npx storybook build -c .storybook -o "$(git rev-parse --show-toplevel)/.design-sync/sb-reference")
node .design-sync/inject-reference-fonts.mjs
node .ds-sync/resync.mjs --config .design-sync/config.json \
  --node-modules "$PWD/packages/gov-ui-kit/node_modules" \
  --entry "$PWD/packages/gov-ui-kit/dist/index.es.js" --out ./ds-bundle
```

`--entry` and `--node-modules` must be absolute paths: a relative `--entry` resolves
against the repo root and fails with `[NO_DIST]` plus a misleading `[DTS_REACT]`.

## Context the bundle carries

| Bundle output | Source |
|---|---|
| `README.md` header | `.design-sync/conventions.md` (cross-cutting rules only) |
| `guidelines/selection-guide.md` | Generated from the registry; see `component-registry/README.md` |
| `guidelines/src/**` | Kit provider, modules and token MDX listed in `guidelinesGlob` |

Write component usage notes as a `Usage notes:` list in the component's JSDoc, not as a
per-component `.mdx`: a matched doc replaces the prompt's story `## Examples`. Don't put a
JSDoc on a stories file's `meta`; it overrides the component's on the docs page. JSDoc edits
don't re-key grades; story-file edits do.

## Record the sync

After an upload verifies (`list_files` count matches), record which source produced it and
commit the file with `projectId` in `config.json`:

```sh
node -e 'const fs=require("fs"),{execSync:x}=require("child_process"),c=require("crypto");
fs.writeFileSync(".design-sync/last-sync.json",JSON.stringify({
  commit:x("git rev-parse HEAD").toString().trim(),
  kitVersion:require("./packages/gov-ui-kit/package.json").version,
  dsSyncSha256:c.createHash("sha256").update(fs.readFileSync("ds-bundle/_ds_sync.json")).digest("hex"),
  projectId:require("./.design-sync/config.json").projectId,
  syncedAt:new Date().toISOString().slice(0,10)},null,4)+"\n")'
```

`_ds_sync.json` is the upload anchor; its hash ties the Design project to this record.

## Global fixes (config-level)

- [GENERAL] **Kit-internal imports in stories.** Stories import through folder barrels
  (`import { IconType } from '../icon'`, `from '../../../..'`). The default import policy
  only redirects modules that are themselves exported components, so those barrels
  bundled from source: raw `.svg` imports became data URLs (`createElement('data:image/svg+xml,…')`)
  and `documentParser` pulled `sanitize-html` → `postcss` (`terminal-highlight` unresolvable).
  Fix: `storyImports.shim: ["packages/gov-ui-kit/src/"]` sends every kit-source import to
  `window.GovUiKit`. `storyImports.bundle` keeps the non-exported story helpers from source:
  `*StoryComponent`, `proposalActionsTestUtils`, `proposalActionsDecoder`,
  `proposalVotingContext`, and `?raw` CSS.
- [GENERAL] **Decorators.** `.storybook/preview.tsx` imports `../index.css` (`@import "tailwindcss"`)
  and `GukModulesProvider` from `../src/modules`, so the converter's decorator bundle fails,
  and bundling it would ship a second copy of the modules context anyway. `cfg.provider`
  is `GukModulesProvider`. The decorator's `<div className="flex">` row cannot be expressed
  (provider chains take bundle exports only): block-level components (a link `Button`,
  inputs) stretch to card width in previews. Grade that as framing. The kit exports no
  unstyled wrapper to use as an inner provider, and forking the decorator bundler would
  bring back an override layer, so the two components that need the row to render at all
  own their previews: `StateSkeletonBar` and `StateSkeletonCircular` are inline spans that
  collapse to 0×0 without a flex parent.
- [GENERAL] **Reference font.** The kit Storybook build copies fonts to
  `fonts/src/theme/fonts/`, but its CSS asks for `/fonts/Manrope-*.ttf`, so the reference
  renders a system fallback typeface. `inject-reference-fonts.mjs` adds the matching
  `@font-face` to `sb-reference/iframe.html`; run it after every reference build or every
  text-bearing component grades as a font mismatch.
- **CSS** is the kit's published `build.css` (`cfg.cssEntry`). `pnpm css:check` in the kit
  guards it against a source compile, so no sync-time Tailwind compile is needed.

## Known limits

- Dialog, DialogAlert, Dropdown and Tooltip stories are interaction-gated: both Storybook
  and the preview show the closed trigger. The cards are faithful to the stories; they don't
  show the open surface.
- **Two react-hook-form instances.** Stories import `FormProvider` from their own bundled
  `react-hook-form`, while kit fields read the copy inlined in `window.GovUiKit`, so a
  story-level form context never reaches them (`useFormContext: hook must be used inside a
  form context`). The ProposalActions EDIT-mode stories `String Array Type` and `Moveable`
  are skipped for this. `extraEntries: ["react-hook-form"]` would put one instance on the
  global and route story imports to it, but `extraEntries` is part of every component's
  grade key: adopt it only on a run that re-grades everything.
- Validate prints six `[RENDER_THIN]` warnings, all triaged as expected: `Icon`,
  `IllustrationHuman` and `IllustrationObject` ("paint nothing") are SVG-only cards with no
  text, and their cards render correctly; `Dialog`, `DialogAlert` and `Tooltip` ("variants
  render identically") are the click-gated stories above. Any other `[RENDER_THIN]` is new.
- `InputText` `Addon` is skipped: its story wraps the input in an `absolute` div, so the
  Storybook root measures empty.
- `compare.mjs` prints `[ASSETS_BLOCKED] metadata.ens.domains, api.opensea.io`: ENS fixtures
  without an avatar return an error body Chromium blocks (`net::ERR_BLOCKED_BY_ORB`). Grade
  ENS-bearing components on their images.

## Re-sync risks

- Kit bump: rebuild `dist` and the reference before syncing (`[REFERENCE_STALE?]`).
- A new story importing a non-exported kit helper renders `undefined` under the
  `storyImports.shim` rule; add its path to `storyImports.bundle`.
- If the kit fixes its Storybook font path, delete `inject-reference-fonts.mjs` and its step.

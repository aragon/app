# design-sync notes

## Isolation rule (read first)

Sync sessions MUST NOT run in the developer's main checkout — the bundle build
mutates the app workspace (`apps/app/node_modules/@` junction, `next/*` shims
in `apps/app/src/node_modules`). Work from a dedicated git worktree instead:

```sh
git worktree add ../app-design-sync <branch>
cd ../app-design-sync && pnpm install   # fast: pnpm hardlinks from the shared store
# ... run the sync from here ...
git worktree remove ../app-design-sync  # afterwards; commits stay in the shared .git
```

All build artifacts stay confined to the worktree and die with it. As a second
line of defense the app tooling is also shielded from the shims (jest pins
`next/*` — see the shim bullet in "Slice 3 wiring"), and
`node .design-sync/build-css.mjs --clean` removes them from any tree.

## Re-sync risks (watch-list for the next run)

- **Kit version drift:** previews and grades were verified against `@aragon/gov-ui-kit@2.8.1`. On a kit bump, the anchor diff scopes re-verification, but the Storybook-reference claim (local checkout at `c:\dev\gov-ui-kit`) only holds if that checkout matches the installed version.
- **CSS is compiled at sync time** by `cfg.buildCmd` from `.design-sync/tailwind-entry.css` — it inlines the app's `--guk-*` overrides copied from `layoutRoot.css`; if the app changes those overrides, re-copy them into the entry file (they do NOT sync automatically).
- **Tailwind CLI version:** lives inside `.ds-sync/node_modules` (gitignored); `build-css.mjs` bootstraps it automatically on fresh clones, pinned to the app's installed `tailwindcss` version.
- **Dialog/DialogAlert previews** depend on the force-open workaround (frozen-clock + framer-motion); a kit animation refactor may break them silently — check their sheets on any kit bump.
- **Transient validate flake:** Accordion occasionally reports `[RENDER] root empty` in driver runs (animation timing); a re-run clears it. Don't chase unless it repeats.
- The module components (25) and 5 infrastructure primitives ship floor cards by design — the standing offer for incremental authoring on any later re-sync (slice 2: modules with `GukModulesProvider` wrapping).

- Sync source is THIS repo (`apps/app`), not gov-ui-kit. Decision 2026-07-16: the design system is the app's design layer; gov-ui-kit is a component library it inherits. One project ("Aragon App Design System") holds kit re-exports + app shared components across slices.
- Slice plan (run-to-completion slices so verified work banks in the anchor): 1) gov-ui-kit core components ✓, 2) gov-ui-kit modules components ✓, 3) app shared components (wizards, dialogs, etc.) — FINAL slice. A design wiki (semantic layer / interaction patterns) is planned by the user but DOES NOT EXIST yet — do not attempt to read or distill it; when it exists, its distilled rules can join conventions.md via a re-sync.
- Verification hybrid: kit components are graded against the local gov-ui-kit checkout's Storybook renders (`c:\dev\gov-ui-kit`) as ground truth. ONLY valid while the checkout version matches the app's installed `@aragon/gov-ui-kit` (both 2.8.1 as of 2026-07-16) — re-check on every sync. App components have no storybook → absolute rubric.
- Env: Git Bash resolves Node v23.1.0 (breaks pnpm 11 — no `node:sqlite`); PowerShell has Node 24.14 at `C:\Program Files\nodejs` but no `pnpm` on PATH. Use PowerShell + corepack/npx for pnpm.
- Existing Claude Design project "Aragon Gov UI Kit — Design System" (owner Selim) is unrelated to this sync — do not touch.
- **UPSTREAM BUG (report to gov-ui-kit team):** the published package's compiled `build.css` (v2.8.1) is corrupted by its minifier — rules with child selectors got their selector lists wrongly merged with dozens of unrelated utilities (e.g. ~60 `md:*` utilities all give children `border-right: 1px` at ≥768px; ~140 `2xl:*` utilities give `&>:last-child{border-style:none}`). Symptom in previews: stray vertical bars at the right edge of AlertCard/Accordion content. Invisible to the app and Storybook because both compile the kit CSS from source. Any consumer of the precompiled `build.css` is affected.
- Because of that bug the sync does NOT use `build.css`. `cfg.buildCmd` (`node .design-sync/build-css.mjs`) compiles CSS from source with Tailwind CLI 4.3.1 (pinned in `.ds-sync` deps), mirroring the app's own wiring in `layoutRoot.css` (`@import tailwindcss` + kit `index.css` + `@source` scan of the kit package + the app's `--guk-*` z-index/positioning overrides). Output is written to `apps/app/node_modules/@aragon/gov-ui-kit/.design-sync-kit-styles.css` because `cfg.cssEntry` is security-bounded to the package dir; the file is regenerated on every sync so reinstalls are harmless.
- `.design-sync/tailwind-entry.css` imports tailwind via a relative node_modules path (plain `"tailwindcss"` doesn't resolve from `.design-sync/`).

## Known render warns (triaged legitimate)

- `[RENDER_THIN] Icon / IllustrationHuman / IllustrationObject: mounts have no text` — pure-SVG components, no text by construction; review sheets visually verified good (wave 1).
- `[RENDER_BLANK] BlockNavigationContextProvider` — renderless context provider on a floor card; blank is correct (slice 3).

## Preview-authoring learnings (wave 1, 2026-07-16)

- Selection state is expressed via the group parent: Radio/RadioCard/Toggle previews select via `defaultValue` on RadioGroup/ToggleGroup (no `checked` prop); Radio and Toggle throw outside their parent. Give each group a unique `name` per sheet.
- Kit input counters (`useInputProps`) only sync from a controlled `value` prop — `defaultValue` leaves the counter at 0; `value` without `onChange` is safe.
- The capture cell stretches direct children: small inline components (Tag etc.) need a `<div className="flex">` wrapper for natural width.
- Emitted `.d.ts` drops inherited HTML props (placeholder, defaultValue, src, disabled-via-ComponentProps) — those still work at runtime; absence from the `.d.ts` ≠ unsupported.
- Use data-URI SVGs for any image `src` (Avatar, InputFileAvatar) — captures are offline.
- Illustration components: size with inline `style={{width: N}}`, never Tailwind width utilities (component forces `width:100%` via style, and uncommon `w-*` classes aren't in the compiled CSS).
- **UPSTREAM BUG candidate (report to gov-ui-kit team):** InputNumber/InputNumberMax pass `suffix`/`prefix` unescaped into the imask pattern — token chars corrupt display (`suffix="days"` renders `d_ys`). Also their `max` prop truncates over-max values at render (error-state demos must keep value < max).

## Preview-authoring learnings (wave 2, 2026-07-16)

- **Dialog/DialogAlert static rendering:** the capture harness freezes the clock (`page.clock.setFixedTime`), which stalls framer-motion's rAF timeline — dialogs sit at their initial `closed` variant (opacity 0) with no errors. Fix used in previews: controlled `open={true}` (`defaultOpen` renders nothing — the Root gates the portal on `open`), `modal={false}`, `useFocusTrap={false}`, plus a force-open `!important` style tag via `containerClassName`/`overlayClassName`. Any framer-motion-animated component will hit the same failure mode.
- Dialog/DialogAlert subcomponents can't compose standalone outside Root (Radix + kit contexts required).
- DocumentParser sanitizes `data:` img URIs away — keep its preview content image-free.
- Tabs.List needs 2+ triggers to render; Collapsible needs enough content to truncate (3+ paragraphs) or the trigger never shows; EmptyState's `primaryButton` only renders when stacked.
- Card has no built-in padding; Progress is naturally full-width (no flex wrapper); skeleton components need a dark wrapper for contrast (kit stories do the same); DataList.Filter shows buttons only when callbacks are passed; StateSkeletonBar default width is 160px.
- Tooltip/Dropdown/DataList all fit default cards (no cardMode overrides needed): Tooltip via `defaultOpen` + top-padding wrapper, Dropdown via `defaultOpen`.
- Illustration enum values must be validated against the kit's `illustration*Type.ts` files.
- Run rebuild/capture from `c:\dev\app` — relative script paths break if the shell cwd drifted to `ds-bundle`.

## Slice 3 wiring (app shared components, 2026-07-16)

- docsMap stub `category:` frontmatter did NOT regroup Page/AppTransactionStatus/BlockNavigationContextProvider/DebugContextProvider out of their path-derived groups (design-sync/blocknavigationcontext/debugprovider) — cosmetic; stubs left in `.design-sync/docs-stubs/`; investigate the category mechanism on a future re-sync.
- App components enter the bundle via `cfg.extraEntries` → `.design-sync/app-entry.ts` (curated surface; exclusion reasons in its header comment). Component folders come from `componentSrcMap` additions; groups derive from source parent dirs (wizards/, forms/, shared/) with three regroup stubs in `.design-sync/docs-stubs/`.
- `@/` alias resolution: the converter's tsconfig-paths plugin (a) can't parse the app's non-strict-JSON tsconfig and (b) mis-resolves directory imports. Workaround: `apps/app/node_modules/@` junction → `apps/app/src`, recreated by `build-css.mjs`; esbuild's native resolver handles the rest. No cfg.tsconfig set.
- `next/*` shims at `apps/app/src/node_modules/next/` (dynamic→null, image→img, link→a) — nearest-node_modules wins for files under src/; regenerated by `build-css.mjs`. The real `next` package is unbundlable (server internals). App DX is shielded: jest pins `next/*` to the real package (`moduleNameMapper` in `apps/app/jest.config.js`), `next dev`/`build` alias next/* internally, tsc/biome unaffected (all verified with shims present). **End every sync session with `node .design-sync/build-css.mjs --clean`** so the shims don't linger in the working tree.
- `process is not defined`: `.design-sync/process-shim.ts` is the FIRST import of app-entry (import hoisting — a later statement would run too late).
- Entry graph landmines (why some components are excluded): `monitoringUtils → @sentry/nextjs → next server`; `daoUtils → daoService api tree → sentry`; `policyDisplayUtils → capitalFlow module tree`. Anything importing shared/api or shared/utils/daoUtils is unbundlable — trace with an esbuild onResolve logger before adding components.
- `FormWrapper` is exported from the entry so previews AND the design agent get react-hook-form context from the bundle's own RHF copy.
- App `Link` is excluded (collides with kit `Link`); app `DialogRoot` is exported as `AppDialogRoot` (bundle-only, no folder).

## Preview-authoring learnings (wave 4 — app components, 2026-07-16)

- Provider stack for app components: `DebugContextProvider > TranslationsProvider(enTranslations)`; add `BlockNavigationContextProvider` only for wizards. Wrap in TranslationsProvider even when a component looks presentational — subcomponents may call `useTranslations` (AutocompleteInput's menu).
- `FormWrapper defaultValues` is the ONLY way to hydrate `useFieldArray`-backed lists (ResourcesInput/AddressesInput) — component-level `defaultValue` props don't.
- `Page.Container` needs the app's QueryClientProvider (react-query HydrationBoundary) — not in the bundle; previews use a plain div; the design agent should use Page.Main/Content/Aside/Header directly.
- `Page.AsideCard` icon prop uses next/image (shimmed to <img> in the bundle).
- App and kit share one radix copy in the bundle, so the DialogProvider + open Dialog.Root + force-open-style pattern works for app dialogs too.
- `sanitizeHtmlRich` strips heading tags from raw HTML (markdown headings via DocumentParser survive); sanitizers strip data-URI imgs.
- AddressesInput items wrap kit AddressInput → also need GukModulesProvider. Live EIP-55 validation: fabricated mixed-case addresses fail checksum (use lowercase or exploit as error state).
- AdvancedDateInput "fixed" mode unpreviewable without a luxon export from the entry (dropped).
- A component added to componentSrcMap AFTER the last full build is missing from `.stories-map.json` until the next full package-build — preview-rebuild/capture on it silently no-ops (hit by TransactionStatus).

## Preview-authoring learnings (wave 3 — module components, 2026-07-16)

- All module previews wrap in `<GukModulesProvider>` (no props) inside the preview `.tsx` itself — NOT via `cfg.provider`, so core components' render hashes stay untouched.
- Capture clock is frozen around mid-2024: past epoch-ms (~1698000000000) reads "x months ago"; ~1752345600000 reads "1 year left".
- **Offline avatars:** MemberAvatar's blockies fallback races the wagmi ENS query offline (gray circle at capture). Deterministic fix: pass `avatarSrc: 'data:image/png;base64,'` (broken data-URI) — kills ENS queries, blockies always render. Applies anywhere `avatarSrc` is forwarded.
- **Dialog-family blank renders (config-level):** frozen clock freezes `performance.now()` → framer-motion stuck at initial frame → `Dialog.Root`-based components render opacity-0 with no errors. Proven workaround: inject `<style>[data-state='open'] { opacity: 1 !important; transform: none !important; }</style>` in the preview.
- **Never import `@radix-ui/*` in previews** — the preview bundles its own copy while the kit uses `window.GovUiKit`, causing context mismatch errors.
- ProposalAction* components need the common action base (`from/to/data/value/inputData`) plus the required `index` prop; `ProposalActionType` enum exported from kit root.
- ProposalVoting stages render collapsed unless `activeStage` is set; ~450–500px cell height budget — put short breakdowns in the active stage.
- viem's `isAddress` accepts all-lowercase — a checksum-error demo needs a broken mixed-case address.
- Kit story classes like `max-w-140` aren't in the compiled CSS — use inline styles for such wrappers.
- Wallet's connected handle is `hidden xl:block` — avatar-only at the 900px capture viewport is the component's own responsive behavior, not a bug.

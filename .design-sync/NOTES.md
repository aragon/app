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
`pnpm --workspace-root run design-sync:build-css -- --clean` removes them from any tree.

## Re-sync risks (watch-list for the next run)

- **Kit is on 2.10.0 and the anchor now matches it.** Previews and grades were fully re-verified against `@aragon/gov-ui-kit@2.10.0` on 2026-08-24 and uploaded, so APP-1084's "pending write access" blocker is closed. The three upstream kit bugs noted below are fixed in 2.10.0 and confirmed visually.
- **Kit version drift:** on the next bump the anchor diff scopes re-verification. There is no Storybook ground truth any more — the old claim rested on a local `gov-ui-kit` checkout at `c:\dev\gov-ui-kit`, which does not exist on this machine; grading is on the absolute rubric. Also re-check `conventions.md`'s emitted-utility names and the app's radix ranges on every bump (both sections below).
- **CSS is compiled at sync time** by `cfg.buildCmd` from `.design-sync/tailwind-entry.css` — it inlines the app's `--guk-*` overrides copied from `layoutRoot.css`; if the app changes those overrides, re-copy them into the entry file (they do NOT sync automatically).
- **Tailwind CLI version:** `@tailwindcss/cli` is an `apps/app` devDependency managed by the repo's pnpm lockfile and shared catalog; `build-css.mjs` verifies it matches the app's installed `tailwindcss` version, so update both catalog entries in the same PR as any Tailwind bump.
- **Dialog/DialogAlert previews** depend on the force-open workaround (frozen-clock + framer-motion); a kit animation refactor may break them silently — check their sheets on any kit bump.
- **Transient validate flake:** Accordion occasionally reports `[RENDER] root empty` in driver runs (animation timing); a re-run clears it. Don't chase unless it repeats.
- The module components (25) and 5 infrastructure primitives ship floor cards by design — the standing offer for incremental authoring on any later re-sync (slice 2: modules with `GukModulesProvider` wrapping).

- Sync source is THIS repo (`apps/app`), not gov-ui-kit. Decision 2026-07-16: the design system is the app's design layer; gov-ui-kit is a component library it inherits. One project ("Aragon App Design System") holds kit re-exports + app shared components across slices.
- Slice plan (run-to-completion slices so verified work banks in the anchor): 1) gov-ui-kit core components ✓, 2) gov-ui-kit modules components ✓, 3) app shared components (wizards, dialogs, etc.) — FINAL slice. A design wiki (semantic layer / interaction patterns) is planned by the user but DOES NOT EXIST yet — do not attempt to read or distill it; when it exists, its distilled rules can join conventions.md via a re-sync.
- Verification hybrid: kit components are graded against the local gov-ui-kit checkout's Storybook renders (`c:\dev\gov-ui-kit`) as ground truth. ONLY valid while the checkout version matches the app's installed `@aragon/gov-ui-kit` (both 2.8.1 as of 2026-07-16) — re-check on every sync. App components have no storybook → absolute rubric.
- Env: Git Bash resolves Node v23.1.0 (breaks pnpm 11 — no `node:sqlite`); PowerShell has Node 24.14 at `C:\Program Files\nodejs` but no `pnpm` on PATH. Use PowerShell with a standalone pnpm install (https://pnpm.io/installation) or `npx pnpm`.
- Existing Claude Design project "Aragon Gov UI Kit — Design System" (owner Selim) is unrelated to this sync — do not touch.
- **Kit build.css minifier bug — FIXED in `@aragon/gov-ui-kit@2.10.0`** (kit PR #745, APP-1081). The published `build.css` (≤2.9.0) was corrupted by its cssnano pass: rules with child selectors had their selector lists wrongly merged with dozens of unrelated utilities (~54 `md:*` gave children `border-right:1px`; ~140 `2xl:*` gave `&>:last-child{border-style:none}`), showing as stray vertical bars on AlertCard/Accordion for consumers of the precompiled file. It is now minified by Tailwind's own optimizer and guarded by `pnpm css:check`, so a consumer on ≥2.10.0 can trust the precompiled bundle.
- The sync compiles CSS from source rather than using `build.css` regardless: `cfg.buildCmd` (`pnpm --workspace-root run design-sync:build-css`) mirrors the app's own wiring in `layoutRoot.css` (`@import tailwindcss` + kit `index.css` + `@source` scan of the kit package + the app's `--guk-*` z-index/positioning overrides) — those overrides are the reason it can't just consume `build.css`, independent of the (now-fixed) minifier bug. Output is written to `apps/app/node_modules/@aragon/gov-ui-kit/.design-sync-kit-styles.css` because `cfg.cssEntry` is security-bounded to the package dir; the file is regenerated on every sync so reinstalls are harmless.
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
- **InputNumber/InputNumberMax mask bugs — FIXED in `@aragon/gov-ui-kit@2.10.0`** (kit PRs #745/#746, APP-1082/APP-1083). `suffix`/`prefix` are now escaped, so token chars render literally (`suffix="aUSDC"` → `aUSDC`, previously `_USDC`); out-of-range values clamp to `min`/`max` instead of dropping the breaching char (previously `60` with `max={59}` rendered `6`). Preview implication: a token-symbol suffix is safe to author now, and an over-`max` error state is shown via the `alert` prop, not by setting `max` (clamping means `max` can never display an out-of-range value).

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

## macOS environment (2026-08-24 re-sync)

- This sync ran on macOS (Darwin 25.5) from the worktree `~/.herdr/worktrees/app-next/app-1011-app-integration`; earlier NOTES entries describing `c:\dev\app` / Git Bash / PowerShell are Windows-era and no longer apply.
- Playwright browsers cache on macOS is `~/Library/Caches/ms-playwright`, NOT `~/.cache/ms-playwright` — the skill's `ls ~/.cache/ms-playwright` check reports "nothing cached" even after a successful install.
- Converter needs `playwright` (not just `@playwright/test`) importable from `.ds-sync/`: `cd .ds-sync && npm i playwright@<version matching the cached chromium build>`. 1.61.1 ↔ chromium-1228 for this run.
- **`--entry` and `--node-modules` must be ABSOLUTE paths.** A relative `--entry ./dist/index.es.js` resolves against the repo root, not the package dir, and fails with `[NO_DIST]` *plus* a misleading `[DTS_REACT] @types/react not found`. Correct invocation:
  `node .ds-sync/resync.mjs --config .design-sync/config.json --node-modules "$PWD/apps/app/node_modules" --entry "$PWD/apps/app/node_modules/@aragon/gov-ui-kit/dist/index.es.js" --out ./ds-bundle --remote .design-sync/.cache/remote-sync.json`
- `.gitignore` was missing `.ds-sync/` and `.design-sync/node_modules`; both added this run.
- Run `pnpm --workspace-root run design-sync:build-css` AFTER any `pnpm install` — install prunes the `apps/app/node_modules/@` symlink that build-css.mjs creates.
- `pnpm install` exits non-zero with `ERR_PNPM_PEER_DEP_ISSUES` (missing peer `playwright-core` wanted by `@synthetixio/synpress-cache`) whenever pnpm has to RE-RESOLVE, because `strictPeerDependencies: true`. Pre-existing and unrelated to design-sync; `pnpm i --frozen-lockfile` (what CI runs) skips resolution and passes. node_modules still links correctly — verify resolutions rather than trusting the exit code.

## Kit 2.10.0 verification (2026-08-24)

- Full re-verify done against `@aragon/gov-ui-kit@2.10.0`: 31 verified-by-upload, 81 changed + 1 new re-captured and re-graded, 5 canary spot-checks confirmed. 274/274 cells graded `good`; render check `bad` empty.
- `AddressOutput` is NEW in 2.10.0 and ships a floor card (no authored preview) — standing offer for a future re-sync.
- Both upstream fixes are now visually confirmed: `InputNumber` PrefixSuffix renders `ANT 250` / `250 aUSDC` literally (suffix escaping), and `InputNumberMax` Critical shows `1,200` over a 1,000 cap via the `alert` prop (clamping). The earlier wave-1/wave-2 notes about `_USDC` and dropped digits are historical.
- **"Remove the InputNumber/InputNumberMax preview workarounds" (APP-1011 AC) — resolved, mostly by dissolution. Do not re-open it looking for deletions.** The two original workarounds were (a) only ever authoring bug-safe suffixes, since unescaped `suffix="days"` rendered `d_ys`, and (b) "error-state demos must keep value < max", since `max` truncated over-max values at render.
  - (a) was real and is now removed: `InputNumber.Default` uses `suffix="days"` with value `7` — the exact string that used to break — so the previews now *demonstrate* the escaping fix instead of avoiding it. `PrefixSuffix` keeps the `aUSDC` case added by the bump commit.
  - (b) is NOT removable and must stay. 2.10.0 replaced truncation with clamping, so an over-`max` value can never render, and the kit's own `max` JSDoc now prescribes exactly this shape: "Values above it are clamped to it, so render an out-of-range error state through the `alert` property rather than by setting `max`." The former workaround became the documented contract.
  - `InputNumberMax.Critical` looks like a leftover artifact (`max={12_500}` while its alert cites a "1,000 ANT spending cap") but is idiomatic: `max` is the wallet balance, the `alert` is a plugin policy cap. Two different concepts, which is precisely the split the kit prescribes. Leave it.
- **Kit 2.10.0 split the app's radix instances — fixed this run.** The kit depends on `@radix-ui/react-dialog@^1.1.23` and `@radix-ui/react-toggle-group@^1.1.19` while the app pinned `^1.1.19` / `^1.1.15`, so pnpm installed two physical copies of each and React context did not cross them. `WizardDetailsDialog` threw `` `DialogTitle` must be used within `Dialog` `` (render check caught it). Fixed by raising the app's ranges to match the kit (catalog `@radix-ui/react-dialog` → `^1.1.23`; `apps/app/package.json` `@radix-ui/react-toggle-group` → `^1.1.19`).
- **This is a recurring trap, not a one-off.** Two app files import radix primitives the kit does not re-export — `shared/components/wizardDetailsDialog/wizardDetailsDialog.tsx` (`Title`, `Description`) and `plugins/tokenPlugin/.../tokenVotingOptionToggle.tsx` (`ToggleGroupItem`) — because `Dialog.Header`/`Dialog.Content` only take string `title`/`description` and kit `ToggleGroup` has no `.Item`. Every kit bump can silently re-split them. Durable fix is upstream: have gov-ui-kit re-export `Dialog.Title`/`Dialog.Description` (or accept `ReactNode`) and `ToggleGroup.Item`, then delete both direct radix deps from the app. Until then, check the radix ranges on every kit bump.
- Wallet renders its handle at the configured `viewport: 1360x300`; the older note about avatar-only output applies to the 900px default viewport, not this card.
- `AutocompleteInput`'s menu/groups only open on interaction, so its `WithGroups` cell renders the closed input — accepted, not a regression.
- `tokens/` and `guidelines/` come out empty (all tokens live in `_ds_bundle.css`, reachable via `styles.css`); this is expected, not a missing-input bug.

## conventions.md drift found and CORRECTED 2026-08-24

Tailwind v4 only emits utilities its `@source` scan actually sees, so a utility no kit component
uses is absent from `_ds_bundle.css` and silently does nothing for a design agent — even when the
underlying token exists. Three names in `conventions.md` were in that state and were corrected this
run (owner-approved):

- `rounded-2xl` / `rounded-3xl` — utilities NOT emitted, though `--radius-2xl` / `--radius-3xl` tokens
  exist. Emitted radius utilities: `rounded-none/sm/md/lg/xl/full` (+ `rounded-t/b/tl/br`).
- `shadow-neutral-lg` — does not exist. Neutral stops at `shadow-neutral{,-sm,-md}`; the large
  shadows are `shadow-primary-lg` / `shadow-primary-xl`.

**Re-run this check on every kit bump** — the emitted utility set is a function of what the kit's own
source uses, so it moves silently when the kit changes. Everything else in the file verified: all 42
named component folders, `FormWrapper` / `enTranslations` / `IconType` / `GukModulesProvider` in the
bundle text, the colour/spacing/type families, Manrope in `fonts/`, and `--color-*` / `--radius-*` /
`--guk-*` tokens with `styles.css` importing `_ds_bundle.css`.

## Grading mechanics — two traps that cost a full re-grade this run

- **Verdicts go in `.design-sync/.cache/review/<Name>.grade.json`. NOT `<Name>.json`.** `<Name>.json`
  is machine-owned capture state (`gradeKey`, `sourceKey`, `cells` as an ARRAY, `pendingGrade`) and is
  rewritten by every `package-capture.mjs` run. Writing verdicts there looks like it works — the
  driver even reports `pendingGrade: 0` — and then the next capture silently discards all of them.
  The grade file's shape is `{"cells": {"<CellName>": {"verdict": "good", "note": "…"}}}`; cell names
  must equal the capture file's `cells` entries exactly.
- **Canary picks rotate, so grade the whole churned set, not just the picks.** Each driver run picks 5
  spot-checks from `verification.canary.churned` (22 components here). A churned component with no
  grade file lands in `pendingGrade`, and because the picks rotate you chase a new one every run.
  Break the loop once: capture the whole churned set explicitly —
  `node .ds-sync/package-capture.mjs --out ./ds-bundle --components <all 22 comma-separated>` —
  read those sheets and write their grade files. After that every later run reports `pendingGrade: 0`.
  Grade files are gitignored (`.design-sync/.cache/`), so a fresh clone re-does this; the durable
  carry-forward is the uploaded `_ds_sync.json`.

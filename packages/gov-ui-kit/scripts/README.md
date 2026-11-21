# Kit scripts

Plain Node checks that run outside Biome, tsc and Jest. Run them from `packages/gov-ui-kit`
(or from the root as `pnpm --filter @aragon/gov-ui-kit <script>`).

## Screenshot comparison (`visual-diff.mjs`)

Captures every Storybook story and compares two capture sets pixel by pixel. Use it to prove a
refactor (such as moving a component to the semantic colour classes) changes no pixels.

```sh
pnpm visual-diff ref main                  # main vs the working tree, theme "today"
pnpm visual-diff ref main --theme dark     # same in another theme (today | next | dark)
pnpm visual-diff ref main --filter button  # only story ids containing this text
pnpm visual-diff ref HEAD~1 --head HEAD    # two refs, working tree untouched
```

`ref` builds a static Storybook of the ref in a temporary git worktree (dependencies come from
this checkout) and of the working tree, captures both and compares them. It exits 1 when any
story differs, prints the differing pixel count per story and writes diff images (base dimmed,
changes in red) to `node_modules/.cache/visual-diff/diff/`. A full run of the ~300 stories takes
about 5 minutes. The steps are also separate commands: `build <dir> [--ref <ref>]`,
`capture <storybook-dir> <out-dir>` and `compare <base> <head> [--diff <dir>]`.

Captures are deterministic on one machine: fixed 1280×800 viewport (full-page shots), animations
and transitions off, reduced motion, fonts and images awaited, frozen `Date`, seeded
`Math.random`, no network outside the static build, and a screenshot is only accepted once two
consecutive ones match. Baselines are never committed: font rendering differs per platform, so
always compare two captures made on the same machine. Stories that cannot be made stable go in
`excludedStories` in the script, with the reason.

Needs `playwright-core` (resolved from another workspace, e.g. `apps/app`, or
`PLAYWRIGHT_CORE_PATH`) and a Chromium: Playwright's own, else the newest under
`PLAYWRIGHT_BROWSERS_PATH`, or `CHROMIUM_EXECUTABLE`. It never runs `playwright install`.

## Token generator (`tokens/generate.mjs`)

The one generator for every token CSS output: the primitive CSS and the app's artifact, plus the semantic colour layer
when the source has one (`semantic.config.json`), from the DTCG source in `design-system/tokens/source/`.
`pnpm tokens:generate` writes, `pnpm tokens:check` fails when an output is stale, `pnpm tokens:report` lists verified
and fallback Today values of the semantic layer. Tests: `scripts/tokens/generate.test.mjs` (run by the root
`pnpm test:tokens`). Details: `design-system/tokens/README.md`.

## Primitive colour lint (`primitive-colors.mjs`)

Biome plugins in `biome-plugins/` flag primitive palette classes (`bg-primary-400`,
`hover:text-neutral-500/50`, `shadow-neutral-md`, `focus-ring-primary`, `var(--color-…)`) in
component source and CSS `@apply`, as warnings, so `pnpm lint:check` reports them without failing.
Tests, stories, `src/theme` and test utilities are excluded.

```sh
pnpm lint:colors:report    # findings per component folder: the migration to-do list
pnpm lint:colors:generate  # regenerate the .grit files after the primitive theme changes (`pnpm tokens:generate` first)
pnpm lint:colors:check     # .grit files up to date, warn/error scopes disjoint
```

To make a migrated folder strict, add its glob to both `primitive-colors.*.error.grit` entries in
`biome.jsonc` and the same glob negated (`!…`) to both `warn` entries.

## Semantic colour component map (`validate-` / `apply-semantic-component-map.mjs`)

`design-system/tokens/semantic-colors.component-map.json` lists, per component file, every primitive colour class with
its semantic replacement (or `new: null` and a reason to keep it). Both validators read the generated CSS
(`src/theme/tokens/**`), so they follow a token change after `pnpm tokens:generate`.

```sh
pnpm tokens:semantic:map:check   # the map matches the sources and keeps every default-theme colour
pnpm tokens:semantic:map:apply   # replaces each converted occurrence on its line; fails, writing nothing, on any mismatch
```

Applying marks the map with `applied: { base }`: its line numbers then describe the sources of that commit, because
`pnpm lint` re-sorts the renamed classes and re-wraps lines. From then on `map:check` verifies the applied state per
file (only the unconverted primitives are left, every converted class is present, the listed test assertions use
their new class) instead of the line-by-line match.

## Shared with the app (`lib/`)

`lib/semantic-class-scan.mjs` (class extraction, the line editor that applies a map, Tailwind's name order, which
classes can sit on one element) and `lib/primitive-colors-lint.mjs` (the lint pattern, the warn/error scope check and
the findings report) are also used by the app's semantic colour map and colour lint (`apps/app/scripts/semanticColors`).
A change here is checked by both `pnpm tokens:semantic:map:check` / `pnpm lint:colors:check` in the kit and
`pnpm --filter @aragon/app colors:map:check` / `lint:colors:check` in the app.

## App screenshot baseline (`app-baseline/`)

The app-side counterpart of `visual-diff`: a patch for the app screenshot check of the `docs/design-canvas` branch
(121 screenshots of the real app on a mock backend, production build) and `recheck.sh`, which captures a checkout and
compares it with a saved capture at zero tolerance. Not run in CI. See `app-baseline/README.md`.

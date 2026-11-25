# Kit scripts

Plain Node checks that run outside Biome, tsc and Jest. Run them from `packages/gov-ui-kit`
(or from the root as `pnpm --filter @aragon/gov-ui-kit <script>`).

## Screenshot comparison (`visual-diff.mjs`)

Captures every Storybook story and compares two capture sets pixel by pixel. Use it to prove a
refactor (such as a token or class change that should keep every colour) changes no pixels.

```sh
pnpm visual-diff ref main                  # main vs the working tree
pnpm visual-diff ref main --filter button  # only story ids containing this text
pnpm visual-diff ref HEAD~1 --head HEAD    # two refs, working tree untouched
```

`ref` builds a static Storybook of the ref in a temporary git worktree (dependencies come from
this checkout) and of the working tree, captures both and compares them. It exits 1 when any
story differs, prints the differing pixel count per story and writes diff images (base dimmed,
changes in red) to `node_modules/.cache/visual-diff/diff/`. A full run of the ~300 stories takes
about 5 minutes. The steps are also separate commands: `build <dir> [--ref <ref>]`,
`capture <storybook-dir> <out-dir>` and `compare <base> <head> [--diff <dir>]`.

Use a new or empty output directory for the first run. Each command marks its output with a
hidden file so it can replace the contents on subsequent runs. For caches created by older
versions, choose a fresh directory (`--work-dir <dir>` for `ref`).

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

Writes the primitive token CSS (`src/theme/tokens/primitives/`) from the DTCG source in
`design-system/tokens/source/`. `pnpm tokens:generate` writes, `pnpm tokens:check` fails when the CSS is stale.
Tests: `scripts/tokens/generate.test.mjs` (`pnpm test:tokens`, part of `pnpm test`). Details:
`design-system/tokens/README.md`.

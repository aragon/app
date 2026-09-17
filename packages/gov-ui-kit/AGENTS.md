# AGENTS.md — @aragon/gov-ui-kit

Published React 19 + TypeScript component library for Aragon governance UIs. It lives in the
aragon/app monorepo alongside its main consumer, and is **still published to npm** for external
consumers — so public exports, peer dependencies, and semver remain part of the product contract.

`apps/app` builds against this workspace copy, not the npm one: a change here reaches the app as
soon as it merges, with no publish in between. Releasing to npm is a separate, deliberate act —
see `RELEASING.md`. Monorepo-wide conventions live in the root `AGENTS.md`; this file supplements
them for this package.

## Commands

Use pnpm only; npm/yarn installs fail. Node, pnpm and the engine requirements are pinned at the
**repo root** (`.nvmrc`, root `package.json`, `pnpm-workspace.yaml` with `engineStrict: true`) —
this package has none of those files of its own.

Run `pnpm install` **once from the repo root**; it installs every workspace. Git hooks are
root-owned too, so there is no per-package setup step. The scripts below work from this directory,
or from the root as `pnpm --filter @aragon/gov-ui-kit <script>`.

- `pnpm storybook` — Storybook dev server on :6006; primary component dev surface.
- `pnpm build` — Rollup build to `dist/` plus compiled `build.css`.
- `pnpm build:storybook` — static Storybook build used in CI.
- `pnpm test` — Jest. Variants: `pnpm test:watch`, `pnpm test:coverage`.
- `pnpm type-check` — `tsc --noemit`.
- `pnpm lint` — Biome check with writes. `pnpm lint:check` — no writes.
- `pnpm css:check` — verify `build.css` still matches a source compile (runs in CI after `pnpm build`).

Before a PR: `pnpm lint:check && pnpm type-check && pnpm test`.

CI runs `type-check`, `lint:check` and `test:coverage` for **every** workspace from the repo root
through Turbo (`app-development.yml`), so this package's checks run on every PR automatically —
there is no library-specific test workflow. `pnpm build` runs as part of that fan-out because
`type-check` depends on `^build`. Storybook builds and deploys run in the `gov-ui-kit-*` workflows,
gated on the `gov-ui-kit` paths filter (`.github/filters.yml`).

A changeset is required only when `src/**` changes (`.changeset/config.json`), and it must name
**only** `@aragon/gov-ui-kit` — a changeset may never mix release scopes, so a PR touching both the
app and the kit needs two changeset files. `pnpm validate:changesets` enforces this.

## Architecture

- **One workspace package inside the aragon/app monorepo.** Install policy, dependency overrides
  and the catalog live in the root `pnpm-workspace.yaml`. `turbo.json` here extends the root
  config and overrides only `build` (`outputs: ["dist/**", "build.css"]`, cached), which is what
  lets `^build` compile the package before dependents type-check. `build.css` must stay listed
  explicitly — it is emitted to the package root, not into `dist/`.
- **Lint/format is a local `biome.jsonc`**, carried over from the standalone repo so the migration
  caused no reformatting. It sets `"root": false` and must stay `.jsonc`: Biome silently treats a
  commented `biome.json` as a *root* config and fails with "Found a nested root configuration".
  There is a TODO in that file to fold it into the root config later.
- **`tsconfig.json` extends the root `tsconfig.base.json`** but keeps `outDir` literal, because
  `rollup.config.mjs` reads it via `require('./tsconfig.json')` as raw JSON and does not follow
  `extends`. That also means the file can never contain comments. `incremental: false` is set
  deliberately: the base enables it, which makes the rollup TS plugin emit a stray `.rollup.cache/`.
- **One public JS entry.** `src/index.ts` re-exports `./core` and `./modules`, which re-export
  their `assets`, `components`, `hooks`, `types`, and `utils` barrels. Every public symbol
  must ride this chain into `dist/index.es.js`.
- **Public package entries:** `.`, `./index.css`, `./build.css`. Do not add subpath exports or
  tell consumers to import from `dist/…`.
- **`src/core/` = reusable UI primitives**: button, dialog, dropdown, forms, tooltip, tag,
  dataList, accordion, and similar generic building blocks. No governance flow logic here.
- **`src/modules/` = governance-domain composition**: wallet, vote, proposal, dao, member,
  asset, transaction, smartContract, action, and address components built from core + peers.
- **Styling:** Tailwind CSS v4, CSS-first. There is no `tailwind.config.js`. Root `index.css`
  imports `./src/index.css` and `tailwindcss`; `src/index.css` pulls in core + theme CSS.
  Tokens live under `src/theme/tokens/` via `@theme` and expose the `--color-*` scale used
  as utilities such as `bg-primary-500` and `text-neutral-800`.
- **Icons:** SVG imports are transformed by SVGR in Rollup/Storybook. Adding an icon means
  adding the SVG under `src/core/assets/icons/` and registering it in
  `src/core/components/icon/iconType.ts` and `iconList.ts` (checked-in registries).
- **Docs/tests:** component docs are co-located `*.stories.tsx`; tests are co-located
  `*.test.tsx` / `*.spec.ts(x)`. Storybook reads `docs/**/*.@(md|mdx)`,
  `src/**/*.stories.@(js|jsx|ts|tsx)`, and `src/**/*.@(md|mdx)`.
- **Agent entry points:** `AGENTS.md` is canonical. `CLAUDE.md` imports it via `@AGENTS.md`,
  and Cursor reads `AGENTS.md` natively.

## Hard Rules

- **No raw hex/rgb** in components or CSS. Use token-backed utilities; colors must work in
  light and dark themes.
- **No Tailwind arbitrary spacing/values** (`p-[17px]`, `w-[42%]`). Use the token/scale.
- **No component without a co-located `*.stories.tsx`.** Storybook is the docs source of truth.
- **Do not build custom dropdown/dialog/tooltip primitives outside the kit.** Reuse the
  Radix-based primitives in `src/core/components`.
- **Do not edit design-token sources** (`src/theme/tokens/**`) without CODEOWNERS review
  (`@aragon/app-team`). Tokens are the theming contract.
- **Preserve accessibility when composing.** Radix gives primitives their a11y; components in
  `src/modules` must keep labeling, focus order, and keyboard interaction intact, and rely on
  design tokens for contrast.
- **Test through the accessible surface.** Prefer `getByRole` / `getByText` /
  `getByLabelText`; do not assert on class names, snapshots, or internal DOM structure.
- **Do not edit generated build artifacts:** `dist/`, `build.css`, `storybook-static`.
- **Do not add a CSS minifier to the `build.css` pipeline.** It is minified by Tailwind's own
  optimizer in `rollup.config.mjs`; a nesting-unaware pass merges the selector lists of nested
  variant rules and silently corrupts the published bundle. `pnpm css:check` enforces this.
- **Do not add ESLint or Prettier.** Lint/format is Biome via Ultracite.
- **Shared tooling comes from the root catalog** — declare it as `"catalog:"`, never as a local
  version. Git hooks, changesets and the Turbo binary are root-owned and must not reappear here.
  Two deliberate exceptions, both of which regress something if catalogued:
  - `zod` is pinned to `3.25.76` (catalog: `^4.4.3`). The kit never imports zod; it exists only to
    satisfy viem's optional peer, and it must match what `apps/app` resolves. Otherwise pnpm gives
    the two workspaces different peer sets, installs two `viem`/`wagmi` copies, and the app's
    `WagmiProvider` becomes invisible to the kit's hooks (`WagmiProviderNotFoundError`).
  - `@testing-library/jest-dom` is pinned to `7.0.1` (catalog: `^6.9.1`). The kit is on 7.x;
    the root override holds the 6.x line at 6.9.1 for everyone else.
- **Do not move peer deps into `dependencies`:** react, react-dom, react-hook-form,
  @tanstack/react-query, viem, wagmi, tailwindcss, @tailwindcss/typography.
- **Do not break public API casually.** Removing/renaming an exported symbol or prop is a
  breaking change and needs a deliberate Changeset.

## Architectural principles

- **Kit/app boundary litmus test.** Generic, reusable, non-domain UI belongs in `src/core`.
  Governance-domain composition belongs in `src/modules`. App-specific side effects, backend
  orchestration, or aragon/app flows belong in aragon/app, not this package.

## Where to look

- `src/core/components/` — reusable primitives and their stories/tests.
- `src/modules/` — governance feature components and composition.
- `src/theme/tokens/` — design-token source; CODEOWNERS-gated (`@aragon/app-team`).
- `docs/codingGuidelines/` — dependency and coding guidance.
- `docs/`, `.storybook/main.ts`, `.storybook/preview.tsx` — Storybook docs/config.
- `package.json`, `turbo.json`, `biome.jsonc`, `tsconfig.json` — scripts, deps, Turbo/lint/TS rules
  for this package. Install policy and the dependency catalog are at the repo root.
- `rollup.config.mjs`, `svgo.config.js`, `postcss.config.js` — build and asset pipeline.
- `scripts/` — the checks CI runs outside Biome/tsc/Jest: `check-build-css.mjs`. Plain Node, no
  framework; keep new checks in that shape.
- `RELEASING.md` — how a version reaches npm, and the four constraints that break OIDC publishing.
- Root `AGENTS.md` — monorepo layout, release scopes, CI split and Turbo caching.
- `.github/workflows/app-development.yml` — CI truth for the type/lint/test gates (all workspaces);
  `.github/workflows/gov-ui-kit-*.yml` — Storybook deploys, release and npm publish.

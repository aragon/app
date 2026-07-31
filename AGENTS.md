# Aragon App monorepo

pnpm workspaces + Turborepo monorepo. Node >=24.16, pnpm. The main package is `apps/app` (`@aragon/app`) — a Next.js 16 + React 19 + TypeScript plugin-based DAO governance platform.

This file is the team-shared agent entry point. `CLAUDE.md` imports it via `@AGENTS.md` so Claude Code picks up the same content. Personal/IC-local agent context lives under `.agents/local/` and `.claude/` (both gitignored) and **supplements** — never replaces — what's here.

## Monorepo layout

- `apps/*` — deployable applications, one Vercel project each. Every app owns its source, configs, docs and CHANGELOG; workspace specifics live in the workspace's README, not here.
- `packages/*` — version-only workspace libraries that ship inside their consumers. Libraries that ship `dist/` override Turbo `build` in their own `turbo.json` (`outputs: ["dist/**"]`, `cache: true`) so `^build` compiles them before dependents run.
- Root — workspace infra only: `pnpm-workspace.yaml`, `turbo.json`, `biome.json`, `.github/`, `.husky/`, `.changeset/`, agent infra (`.agents/`, `.claude/`). The root `package.json` has no version.
- CI: workflows in `.github/workflows/` are named per workspace (`app-*.yml`, `assistant-*.yml`) plus reusable `shared-*.yml`. Root scripts proxy through `turbo run <task>`, so `pnpm type-check` etc. work from the repo root.

### Releases

Every deployable workspace releases independently through the same PR-based flow; the packages each flow versions together are declared once in `.github/release-scopes.yml` (a flow names its scope via the `scope` input of the `changeset-version` action; the inversion into changesets `--ignore` flags happens inside the action). The shape: dispatch `<workspace>-release-start` → it runs `changeset version` for the scoped packages and opens a `Release <package>@x.y.z` PR (branch `release/<workspace>/…`) describing every bumped package → merging the PR is the release act → `<workspace>-release-pr-finalize` tags the release (`@aragon/app@1.17.0`) and the tag triggers the production deploy.

`packages/*` get no tags or flows of their own and belong to the scope whose release deploys them (a package bundled by exactly one app joins that app's scope; a package shared across scopes stays with its domain owner). Versions never move in lockstep. A single changeset must never mix packages from different release scopes (changesets refuses mixed ignored/not-ignored changesets, which breaks every scoped flow) — write one changeset per scope; CI enforces this via `pnpm validate:changesets`. Details, including the app-specific staging ceremony: `apps/app/docs/projectDocs/release-process.md`.

### Adding a new workspace — the mappers

Cross-cutting workspace knowledge lives in root-level mappers; register a new workspace there instead of touching individual workflows:

- `.github/filters.yml` — workspace→paths mapper for CI change detection (dorny/paths-filter): gates optional side-deploys (the app itself deploys on every PR/push and needs no filter).
- `.github/release-scopes.yml` — package→release-scope mapper: which packages each release flow versions together. Read by the release workflows and by `pnpm validate:changesets`.
- `pnpm-workspace.yaml` `catalog:` — central version pins for shared tooling/deps; workspaces reference them as `"catalog:"`, bumps happen once at the root (then run the full test fan-out — a catalog bump touches every workspace and triggers releases everywhere).
- Releases: a new deployable workspace gets its own release flow (or joins an existing domain flow) by adding its packages to a scope in `release-scopes.yml` and naming that scope in its `changeset-version` call — other flows are not touched.

Shared build/test config also extends from the root: `tsconfig.base.json` (workspace tsconfigs `extends` it) and `jest.config.base.js` (node workspaces use `createNodeConfig`, jsdom workspaces spread `baseConfig` + `createTsJestTransform`). Lint/format is already root-only (`biome.json`).

## Where things live

- **Architecture & structure** — `apps/app/docs/projectDocs/projectStructure.md`, `apps/app/docs/projectDocs/pluginEncapsulation.md`, `apps/app/docs/slots/overview.md`
- **Coding standards** — `apps/app/docs/codingGuidelines/codingGuidelines.md`, `apps/app/docs/codingGuidelines/namingConventions.md`. Ultracite (Biome preset) enforces formatting and lint via `pnpm dlx ultracite fix`.
- **Data fetching** — `apps/app/docs/projectDocs/dataFetching.md`
- **Slots system** — `apps/app/docs/slots/`
- **Testing** — `apps/app/docs/projectDocs/testing.md`

## Dialogs

When you add a dialog that uses `TransactionDialog` internally — or that otherwise needs the connected wallet address to be meaningful — pass `requiresWallet: true` in its `*DialogsDefinitions.ts` entry. `DialogRoot` unmounts and closes flagged dialogs when the wallet disconnects, which is what stops a mid-transaction disconnect from crashing the app. Dialogs stacked on top of a flagged dialog should be flagged too, otherwise the child is left orphaned on the stack once its parent closes.

Full wiring conventions (dynamic imports, definitions map, params) live in the `dialog-conventions` rule-skill, which auto-injects when you edit a dialog barrel or definitions map.

## Repo layout for agent infra

Two parallel trees, each split into `shared/` (checked in) and `local/` (gitignored):

- `.agents/shared/` — agent-neutral commons: guardrails loader, metrics. Rule-skills live at `skills/shared/rules/` (see below). Consumed by any runtime.
- `.agents/local/` — IC-personal agent-neutral stuff (drafts, personal skills, metric buffer).
- `.claude/shared/` — Claude-specific shared wiring (the adapter hook). Tiny on purpose.
- `.claude/` (root) — Claude's required fixed paths: `settings.json` (checked in), `settings.local.json` and `CLAUDE.md` (gitignored, IC-personal).

Gitignore exposes `.agents/shared/**` and `.claude/shared/**` (plus `.claude/settings.json`). Everything else is denied. The pattern is symmetric: anything an IC wants to keep to themselves lives somewhere under `local/`.

## Rule-skills

Narrow, prescriptive guardrails scoped by file path. Each rule fires only when the file you're editing matches its `globs` field.

Rules live at `skills/shared/rules/<name>/SKILL.md` — always checked in, never per-IC. A rule that's worth firing on every PR is by definition a shared convention; personal preferences belong in `.claude/CLAUDE.md` or IC settings, not in the rule stream.

The shared loader lives at `.agents/shared/hooks/inject-rules.mjs`. The rule stream stays agent-agnostic; only the proprietary adapter shape differs. Claude Code consumes it via `.claude/shared/hooks/inject-rules.mjs`. Spec: `skills/shared/rules/README.md`.

In plain English: this is a lazy-loaded guardrails system. Instead of putting every subtle convention in the root prompt, we keep narrow rules in Markdown and load only the ones that match the file being edited. The MVP/POC and its proof live in `skills/shared/rules/README.md` and `.agents/shared/hooks/README.md`.

To author a new rule, copy an existing one in `skills/shared/rules/` and follow the README — the `rule-authoring` rule-skill auto-injects when you edit anything in that folder.

Authorship is bottom-up: when a code review surfaces a non-obvious convention, or you catch yourself fixing the same class of mistake more than once, propose a rule-skill update. Don't pre-write rules speculatively.

## Scripts

The root only carries workspace-wide tasks (turbo fan-out) and root infra:

```sh
pnpm dev          # Dev servers of all workspaces (turbo)
pnpm test         # Jest across workspaces (turbo)
pnpm lint         # Biome check --write (auto-fix)
pnpm lint:check   # Biome check (CI mode)
pnpm type-check   # TypeScript check across workspaces
pnpm test:guardrails  # Guardrails loader + adapter contract tests (root infra)
pnpm dlx ultracite fix  # Format + lint
```

Workspace-specific scripts (e2e, env setup, watch modes, codegen) live in the owning
workspace — run them there: `cd apps/app && pnpm test:watch` (or `pnpm --filter @aragon/app <script>`).

### CI split & Turbo caching

There are two deliberate execution paths in CI, and they must stay that way:

- **Graph tasks** (`type-check`, `lint:check`, `test:coverage`) run **from the repo root** via `turbo run …`. Turbo owns their cache/ordering, so they benefit from local caching and (later) the package graph.
- **`vercel build` and Playwright** run from the repo root via `shared-deploy.yml` (workspace selected by input); Vercel builds the artifact on the GH runner and uploads it with `deploy --prebuilt` (Vercel never builds from git here). `turbo run build` stays a non-caching passthrough at the root (`cache: false`) because app/assistant artifacts are produced by `vercel build`, not Turbo — except workspace libraries that ship `dist/` (e.g. `@aragon/assistant-contracts`), which override `build` in their package `turbo.json` with `outputs: ["dist/**"]` and `cache: true`. `type-check` / `dev` depend on `^build` so those libraries are compiled before dependents run. `shared-deploy.yml` also runs `pnpm --filter "{<workspace>}^..." build` before `vercel build`.

Turbo caching is **local only** right now — no remote cache is wired (no `TURBO_TOKEN`/`TURBO_TEAM`). Task inputs are intentionally left at Turbo's default (hash all package files) rather than hand-narrowed globs — correctness over cache-hit-rate — and the root `biome.json` is listed in `globalDependencies` so lint caches invalidate when lint rules change.

# Aragon App monorepo

pnpm workspaces + Turborepo monorepo. Node >=24.16, pnpm. The main package is `apps/app` (`@aragon/app`) — a Next.js 16 + React 19 + TypeScript plugin-based DAO governance platform.

This file is the team-shared agent entry point. `CLAUDE.md` imports it via `@AGENTS.md` so Claude Code picks up the same content. Personal/IC-local agent context lives under `.agents/local/` and `.claude/` (both gitignored) and **supplements** — never replaces — what's here.
hello test
## Monorepo layout

- `apps/app/` — the Aragon App (app.aragon.org): all app source, configs (`next.config.mjs`, `tsconfig.json`, `jest.config.js`), `e2e/`, `docs/`, `scripts/`, `CHANGELOG.md`. Package name stays `@aragon/app`.
- `apps/*`, `packages/*` — reserved for future workspaces.
- Root — workspace infra only: `pnpm-workspace.yaml`, `turbo.json`, `biome.json`, `.github/`, `.husky/`, `.changeset/`, agent infra (`.agents/`, `.claude/`). Root `package.json` has no version; each workspace is versioned independently via changesets with per-package tags (`@aragon/app@1.17.0`) and release branches (`release/app/…`). See `apps/app/docs/projectDocs/release-process.md`.
- CI: workflows in `.github/workflows/` are grouped per app (`app-*.yml` for `apps/app`, `shared-*.yml` reusable). Root scripts proxy through `turbo run <task>`, so `pnpm type-check` etc. work from the repo root.

## Where things live

- **Architecture & structure** — `apps/app/docs/projectDocs/projectStructure.md`, `apps/app/docs/projectDocs/pluginEncapsulation.md`, `apps/app/docs/slots/overview.md`
- **Coding standards** — `apps/app/docs/codingGuidelines/codingGuidelines.md`, `apps/app/docs/codingGuidelines/namingConventions.md`. Ultracite (Biome preset) enforces formatting and lint via `pnpm dlx ultracite fix`.
- **Data fetching** — `apps/app/docs/projectDocs/dataFetching.md`
- **Slots system** — `apps/app/docs/slots/`
- **Testing** — `apps/app/docs/projectDocs/testing.md`

## Repo layout for agent infra

Two parallel trees, each split into `shared/` (checked in) and `local/` (gitignored):

- `.agents/shared/` — agent-neutral commons: rule-skills, loader, metrics. Consumed by any runtime.
- `.agents/local/` — IC-personal agent-neutral stuff (drafts, personal skills, metric buffer).
- `.claude/shared/` — Claude-specific shared wiring (the adapter hook). Tiny on purpose.
- `.claude/` (root) — Claude's required fixed paths: `settings.json` (checked in), `settings.local.json` and `CLAUDE.md` (gitignored, IC-personal).

Gitignore exposes `.agents/shared/**` and `.claude/shared/**` (plus `.claude/settings.json`). Everything else is denied. The pattern is symmetric: anything an IC wants to keep to themselves lives somewhere under `local/`.

## Rule-skills

Narrow, prescriptive guardrails scoped by file path. Each rule fires only when the file you're editing matches its `globs` field.

Rules live at `.agents/shared/skills/rules/*.md` — always checked in, never per-IC. A rule that's worth firing on every PR is by definition a shared convention; personal preferences belong in `.claude/CLAUDE.md` or IC settings, not in the rule stream.

The shared loader lives at `.agents/shared/hooks/inject-rules.mjs`. The rule stream stays agent-agnostic; only the proprietary adapter shape differs. Claude Code consumes it via `.claude/shared/hooks/inject-rules.mjs`. Spec: `.agents/shared/skills/rules/README.md`.

In plain English: this is a lazy-loaded guardrails system. Instead of putting every subtle convention in the root prompt, we keep narrow rules in Markdown and load only the ones that match the file being edited. The MVP/POC and its proof live in `.agents/shared/skills/rules/README.md` and `.agents/shared/hooks/README.md`.

To author a new rule, copy an existing one in `.agents/shared/skills/rules/` and follow the README — the `rule-authoring` rule-skill auto-injects when you edit anything in that folder.

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
- **`vercel build` and Playwright** run **inside `apps/app`** (`working-directory: apps/app`), because they need the app as the working directory — Vercel builds the artifact on the GH runner and uploads it with `deploy --prebuilt` (Vercel never builds from git here; see the comment in `.github/workflows/shared-deploy.yml`). This is why `turbo run build` is a non-caching passthrough (`cache: false`, no outputs): the real build is `vercel build`, not Turbo.

Turbo caching is **local only** right now — no remote cache is wired (no `TURBO_TOKEN`/`TURBO_TEAM`). With a single package and a build that doesn't go through Turbo, a remote cache would buy nothing; revisit it once a second interdependent package (e.g. the assistant service) lands and Turbo's graph actually has work to memoize across machines. Task inputs are intentionally left at Turbo's default (hash all package files) rather than hand-narrowed globs — correctness over cache-hit-rate — and the root `biome.json` is listed in `globalDependencies` so lint caches invalidate when lint rules change.

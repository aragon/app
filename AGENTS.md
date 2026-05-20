# Aragon app-next

Next.js 15 + React 19 + TypeScript plugin-based DAO governance platform. Node >=22, pnpm.

This file is the team-shared agent entry point. `CLAUDE.md` imports it via `@AGENTS.md` so Claude Code picks up the same content. Personal/IC-local agent context lives under `.agents/local/` and `.claude/` (both gitignored) and **supplements** — never replaces — what's here.

## Where things live

- **Architecture & structure** — `docs/projectDocs/projectStructure.md`, `docs/projectDocs/pluginEncapsulation.md`, `docs/slots/overview.md`
- **Coding standards** — `docs/codingGuidelines/codingGuidelines.md`, `docs/codingGuidelines/namingConventions.md`. Ultracite (Biome preset) enforces formatting and lint via `pnpm dlx ultracite fix`.
- **Data fetching** — `docs/projectDocs/dataFetching.md`
- **Slots system** — `docs/slots/`
- **Testing** — `docs/projectDocs/testing.md`

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

```sh
pnpm dev          # Dev server (Turbopack)
pnpm test         # Jest watch mode
pnpm test:guardrails  # Guardrails loader + adapter contract tests
pnpm lint:fix     # Auto-fix ESLint
pnpm type-check   # TypeScript check
pnpm dlx ultracite fix  # Format + lint
```

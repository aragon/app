# Aragon app-next

Next.js 15 + React 19 + TypeScript plugin-based DAO governance platform. Node >=22, pnpm.

This file is the team-shared agent entry point. A mirror at `AGENTS.md` covers tools that follow the AGENTS.md convention. Personal/IC-local agent context lives under `.claude/` (gitignored) and **supplements** — never replaces — what's here.

## Where things live

- **Architecture & structure** — `docs/projectDocs/projectStructure.md`, `docs/projectDocs/pluginEncapsulation.md`, `docs/slots/overview.md`
- **Coding standards** — `docs/codingGuidelines/codingGuidelines.md`, `docs/codingGuidelines/namingConventions.md`. Ultracite (Biome preset) enforces formatting and lint via `pnpm dlx ultracite fix`.
- **Data fetching** — `docs/projectDocs/dataFetching.md`
- **Slots system** — `docs/slots/`
- **Testing** — `docs/projectDocs/testing.md`

## Rule-skills

Narrow, prescriptive guardrails scoped by file path. Each rule fires only when the file you're editing matches its `applies-to` glob.

- **Shared (commons):** `.agents/skills/rules/*.md` — checked-in, applies to all contributors
- **Local (IC layer):** `.claude/skills/rules/*.md` — gitignored, optional, additive

The shared loader lives at `.agents/hooks/inject-rules.mjs`. The rule stream should stay agent-agnostic; only the proprietary adapter shape should differ. Claude and Codex are the current convention-setters, but the design is meant to extend to any agent runtime. This file's Claude adapter is `.claude/hooks/inject-rules.mjs`, which calls the shared loader on `PreToolUse`. Spec: `.agents/skills/rules/README.md`.

In plain English: this is a lazy-loaded guardrails system. Instead of putting every subtle convention in the root prompt, we keep narrow rules in Markdown and load only the ones that match the file being edited. The MVP/POC and its proof live in `.agents/skills/rules/README.md` and `.agents/hooks/README.md`.

To author a new rule, copy an existing one in `.agents/skills/rules/` and follow the README — the `rule-authoring` rule-skill auto-injects when you edit anything in those folders.

Authorship is bottom-up: when a code review surfaces a non-obvious convention, or you catch yourself fixing the same class of mistake more than once, propose a rule-skill update. Don't pre-write rules speculatively.

## The local layer

Personal customizations belong in:

- `.claude/CLAUDE.md` — IC-specific extensions to this file
- `.claude/skills/rules/*.md` — IC-specific rule-skills (additive, never override shared)
- `.claude/settings.local.json` — IC-specific Claude Code settings and hook adapters

The split is the point: shared workflows live in the commons, idiosyncratic IC tooling stays local without polluting the codebase or breaking other contributors' flows.

## Scripts

```sh
pnpm dev          # Dev server (Turbopack)
pnpm test         # Jest watch mode
pnpm test:guardrails  # Guardrails loader + adapter contract tests
pnpm lint:fix     # Auto-fix ESLint
pnpm type-check   # TypeScript check
pnpm dlx ultracite fix  # Format + lint
```

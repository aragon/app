# Skills

Canonical, auto-synchronized agent skills for this repository. One source of truth under `skills/`, installed into every supported coding agent's discovery root on `pnpm install`.

## Layout

```
skills/
├── shared/              # committed, repo-wide skills
│   ├── rules/           # rule-skills — hook-driven guardrails (kind: rule)
│   │   ├── README.md
│   │   └── <rule-name>/
│   │       └── SKILL.md
│   └── <skill-name>/    # workflow skills
│       ├── SKILL.md     # portable frontmatter + core instructions
│       ├── references/  # detailed specs, long examples (loaded on demand)
│       ├── scripts/     # deterministic helpers, validation tools
│       ├── assets/      # templates, boilerplate, static data
│       └── evals/       # activation tests, output-quality fixtures
├── local/               # private, developer-specific skills (gitignored)
│   ├── .gitignore       # keeps everything here untracked except itself + README
│   ├── README.md
│   └── <skill-name>/
│       └── ...
└── README.md            # this file
```

### Catalog rules

- `skills/shared/` contains committed, repository-wide skills.
- `skills/local/` contains private developer-specific skills — untracked by Git.
- Each skill has its own directory with a `SKILL.md`.
- `SKILL.md` never sits directly under `skills/shared/` or `skills/local/` — `shared` and `local` are catalog categories, not skill names.
- Skill names must be unique across both catalogs (and the `rules` sub-catalog).
- No empty `references/`, `scripts/`, `assets/`, or `evals/` directories — only create them when they contain files.

## Two skill families

### Workflow skills

Invocable capabilities — the agent selects them based on the task (model-invoked) or the user triggers them explicitly (user-invoked). Installed to agent discovery roots by `pnpm skills:sync`. New workflow skills start in `skills/local/` (dogfooded privately) and are promoted to `skills/shared/` once they earn their keep — committed skills must be repo-portable, not coupled to infrastructure this repository doesn't have.

### Rule-skills

Path-scoped guardrails — *constraints* on the agent's work, not invocable capabilities. Discriminated by `kind: rule` in frontmatter. Injected lazily by the PreToolUse hook when the edited file matches the rule's `globs` field. The hook loader reads them directly from `skills/shared/rules/<name>/SKILL.md`; the CLI sync also installs them to the generated roots so agents that discover `SKILL.md` files can enumerate them.

Spec: `skills/shared/rules/README.md`.

## SKILL.md

Portable discovery metadata and core instructions. Frontmatter:

```yaml
---
name: skill-name
description: Describe what the skill does and when an agent should use it.
---
```

- `name` must match the containing directory (kebab-case).
- `description` must be specific enough to support reliable activation — include realistic language users are likely to use.
- Keep portable metadata and core instructions in `SKILL.md`.
- Do not move all frontmatter into `agents/`.

Rule-skills add two required fields:

```yaml
globs: apps/app/src/**/api/**
kind: rule
```

## agents/

Provider-specific machine configuration lives under `<skill>/agents/`. Only create files a supported host officially consumes — do not invent speculative manifests.

## Progressive disclosure

Keep in `SKILL.md`: core workflow, essential rules, inputs/outputs, decision points, completion criteria, direct links to supporting material.

Move to `references/`: detailed specifications, long examples, schemas, domain docs, conditional guidance — material that should only enter context when needed. Link supporting files directly from `SKILL.md`; avoid deep chains and duplicated instructions.

Move to `scripts/`: deterministic transformations, validation tools, executable helpers. Keep script output concise and agent-readable.

Move to `assets/`: templates, boilerplate, static data, files intended to be copied or modified as output.

Move to `evals/`: activation test cases, expected outcomes, input fixtures, critical output-quality checks.

Do not split content merely to populate directories.

## Invocation behavior

Two classes:

- **Model-invoked** — the agent may select it based on the task. Write descriptions with clear activation conditions and realistic user language.
- **User-invoked** — runs only through an explicit command or request. Keep descriptions concise; configure explicit-only invocation where the host supports it.

## Synchronization

`pnpm install` triggers `postinstall` → `pnpm skills:sync`, which discovers all workflow skills under `skills/shared/*/SKILL.md`, rule-skills under `skills/shared/rules/*/SKILL.md`, and local skills under `skills/local/*/SKILL.md`, then installs them (copy mode, non-interactive) into the agent discovery roots.

```bash
pnpm install          # installs deps + syncs skills
pnpm skills:sync      # re-sync without installing deps
```

### Skip

```bash
SKIP_SKILLS_SYNC=1 pnpm install   # skip sync
pnpm install --ignore-scripts     # skips all lifecycle scripts including postinstall
```

On Windows, set the env var in your shell: `set SKIP_SKILLS_SYNC=1 && pnpm install` (cmd) or `$env:SKIP_SKILLS_SYNC=1; pnpm install` (PowerShell).

Sync also skips when `CI` is set or when the `skills` devDependency is intentionally omitted.

### Generated discovery roots

The pinned `skills` CLI installs to these project-level roots:

| Root | Agents |
|---|---|
| `.agents/skills/` | universal store (Codex, Cursor, Gemini CLI, and others that read `.agents/skills/`) |
| `.claude/skills/` | Claude Code |

All generated roots are gitignored — do not commit generated skill copies and do not edit them. They are reproducible from the canonical source under `skills/`.

### What the wrapper does

`scripts/sync-skills.mjs`:

1. Discovers workflow skills under `skills/shared/*/SKILL.md`, rule-skills under `skills/shared/rules/*/SKILL.md`, and local skills under `skills/local/*/SKILL.md`.
2. Rejects duplicate skill names across all catalogs.
3. Rejects category-level `SKILL.md` files.
4. Validates frontmatter `name` matches the directory and `description` is present.
5. Reconciles stale generated skills (removes generated dirs with no canonical source).
6. Installs all skills via the pinned CLI with `--copy --yes --full-depth` to Codex, Claude Code, Cursor, and Gemini CLI.
7. Validates the generated filesystem: every canonical skill exists at each root, `SKILL.md` present, supporting files preserved, categories flattened, executable bits retained.
8. Fails on any inconsistency even if the CLI reported success.

## Adding a new skill

### Shared workflow skill

```sh
mkdir skills/shared/my-skill
# create skills/shared/my-skill/SKILL.md with name + description frontmatter
pnpm skills:sync
git add skills/shared/my-skill
```

### Shared rule-skill

```sh
mkdir skills/shared/rules/my-rule
# create skills/shared/rules/my-rule/SKILL.md with name + description + globs + kind: rule
pnpm skills:sync
git add skills/shared/rules/my-rule
```

The `rule-authoring` rule-skill auto-injects when you edit anything under `skills/shared/rules/`.

### Local (private)

```sh
mkdir skills/local/my-skill
# create skills/local/my-skill/SKILL.md with name + description frontmatter
pnpm skills:sync
```

Local skills are auto-ignored by `skills/local/.gitignore` — no `git add` needed.

## Duplicate names

The sync wrapper rejects duplicate skill names across `shared`, `shared/rules`, and `local` with a clear error naming both locations. Fix by renaming one of the directories (and its `SKILL.md` `name` field) before re-running.

## Validation

```bash
pnpm test:skills       # structure, frontmatter, flattening, git-ignore contract
pnpm test:guardrails   # rule-skill loader + adapter contract tests
```

## CLI

The `skills` CLI ([npm](https://www.npmjs.com/package/skills), [source](https://github.com/vercel-labs/skills)) is pinned as an exact devDependency. The wrapper uses the local `node_modules/.bin/skills` — no global install, no `npx`.
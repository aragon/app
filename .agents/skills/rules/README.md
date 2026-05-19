# Rule-skills

Prescriptive, path-scoped guardrails that ride on the universal `skills` primitive but are *constraints* on the agent's work, not invocable capabilities. Discriminated from workflow skills by `kind: rule` in frontmatter.

Each rule-skill is a single Markdown file with frontmatter declaring which paths it applies to. The shared loader at `.agents/hooks/inject-rules.mjs` walks both folders below, matches each rule's `globs` field against the file the agent is about to edit, and emits one agent-agnostic rule stream lazily for whichever adapter is calling it.

The frontmatter field is named `globs` to match the convention emerging across agent runtimes (Cursor's `.cursor/rules/` reads `globs:` natively). Our rules live at a different path, so we don't conflict with any harness's native loader — but a contributor who copies a rule to a runtime-conventional location gets pickup for free.

## MVP in plain English

This spike is trying to solve a simple problem: the agent should get the right project rule at the moment it becomes relevant, instead of carrying the whole project handbook in every prompt.

The flow is:

1. The agent is about to edit a file.
2. The loader checks the file path.
3. Any rule whose `globs` field matches that path is loaded.
4. Those matched rules are injected as extra context just in time.

So instead of saying "remember all conventions all the time," we say "load the few conventions that matter for this file."

## Why this is useful

In a codebase this size, many mistakes are not syntax mistakes. They are "you touched the right file in the wrong way" mistakes:

- using the wrong registration pattern in a plugin `index.ts`
- breaking query-key parity across query hooks, prefetches, and cache invalidation
- missing conventions that are obvious to maintainers but not obvious from a single file

Rule-skills are meant to catch that kind of error early.

## Why this is an MVP/POC

This is deliberately narrow. It proves four things, and no more:

- rules can be written as plain Markdown with simple frontmatter
- rules can be matched lazily from file paths
- the matching logic can live in a shared place
- agent-specific runtimes can wrap that shared logic without changing the underlying rule stream

It does **not** claim that every runtime already supports the same local hook mechanism. The point of the spike is that the reusable core is small and testable, even if adapters differ.

## Folders

| Folder | Layer | Tracked |
|---|---|---|
| `.agents/skills/rules/` | Shared (commons) | ✓ checked-in |
| `.claude/skills/rules/` | Local (IC-specific) | gitignored, optional |

The loader merges results additively. Local rules never override shared rules, never appear in PRs, and don't risk breaking other contributors' flows.

## Proof this spike works

If someone asks "is this just a concept doc?" the concrete proof is:

- shared rule files exist in `.agents/skills/rules/`
- the shared loader exists in `.agents/hooks/inject-rules.mjs`
- the Claude adapter exists in `.claude/hooks/inject-rules.mjs`
- tests prove the generic and Claude paths carry the same injected rule content

Verification commands:

```sh
node --test .agents/hooks/*.test.mjs .claude/hooks/*.test.mjs
pnpm test:guardrails
```

## Frontmatter schema

```yaml
---
name: query-and-cache
description: One-line summary of what the rule covers.
globs: src/**/api/**, src/**/queries/**
kind: rule
---
```

| Field | Required | Notes |
|---|---|---|
| `name` | yes | Short, kebab-case identifier. |
| `description` | yes | One sentence. Surfaces when the agent enumerates available rules. |
| `globs` | yes | Comma-separated globs, paths relative to repo root. `**` is recursive, `*` is single-segment. |
| `kind` | yes | Must be `rule` for the hook to pick it up. Distinguishes from `kind: command` workflow skills. |

## Authoring guidance

A rule-skill is documentation that loads when relevant — onboarding-grade context for both human contributors and model cold-start. The shape that's earned its keep so far:

- **Canon pointers.** Name 1-3 reference files in the codebase that show the pattern. Lean on the model's pattern recognition for what's clearly derivable from those examples.
- **Non-obvious knowledge.** Encode the things that *aren't* visible from any single file: silent-failure modes, intentional inconsistencies, cross-file invariants, conventions the type system doesn't enforce. This is the load-bearing content.
- **Light reference structure** (folder layouts, frontmatter schemas, registration grammar) — fine when it serves orientation.
- **Narrow glob.** A rule's blast radius is its `globs` field. Prefer `src/plugins/*/index.ts` over `src/plugins/**`. Multiple narrow rules beat one mega-rule.
- **Bottom-up authorship.** The right time to write or update a rule is when a code review catches a domain mistake or a new contributor stumbles. Don't pre-write rules speculatively.

What to avoid:

- Enumerated micro-rules restating what reading the canon would teach
- Architectural essays
- Boilerplate the model would naturally produce correctly given the canon

If the rule grows past one screen, ask whether the extra content is non-obvious or just thorough — if the latter, trim it.

## Adapter contract

The shared loader is a Node script that accepts either:

- a hook payload on stdin
- CLI flags like `--file path/to/file.ts --tool Edit`

It only fires for `Edit`, `Write`, and `MultiEdit`. Failures are silent (exit 0) so a malformed rule file never blocks an edit.

### Current adapters

- **Claude Code:** `.claude/hooks/inject-rules.mjs` calls the shared loader on `PreToolUse` and asks for Claude-shaped hook output.
- **Any other agent or script:** call `.agents/hooks/inject-rules.mjs` directly and consume the same `additionalContext` stream in a different transport shape.

The intent is agnosticism, not lock-in: the guardrails logic lives in `.agents/`, while agent-specific hook plumbing stays in that agent's local/config surface. Codex and Claude are the current standard-setters, but the rule stream should remain portable beyond them; only the final proprietary wrapper should change.

For the executable side of the spike, see `.agents/hooks/README.md`.

To inspect what would fire for a path, run the hook directly:

```sh
node .agents/hooks/inject-rules.mjs \
  --file "$PWD/src/shared/api/daoService/queries/useDao.ts"
```

To inspect the Claude adapter output specifically:

```sh
echo '{"tool_name":"Edit","tool_input":{"file_path":"'"$PWD"'/src/shared/api/daoService/queries/useDao.ts"}}' \
  | node .claude/hooks/inject-rules.mjs
```

Empty output = no rules matched. JSON output with `additionalContext` = those rules will be injected.

# Guardrails Hook MVP

This folder contains the executable part of the guardrails spike.

In plain English: we want the agent to get the right project-specific advice right before it edits a file, without forcing that advice into every prompt all the time.

## What this does

1. The agent says it is about to edit a file.
2. The loader looks at that file path.
3. It finds any matching rule docs under `.agents/skills/rules/` and `.claude/skills/rules/`.
4. It bundles those matches into `additionalContext`.
5. The agent-specific adapter hands that context to the runtime in whatever proprietary shape that runtime expects.

The important split is:

- `.agents/hooks/inject-rules.mjs` = shared matching and assembly logic
- `.claude/hooks/inject-rules.mjs` = Claude-specific transport wrapper

That keeps the actual guardrails behavior portable even if hook APIs differ across runtimes.

## Why this exists

Without this, we have two bad options:

- stuff every convention into `AGENTS.md` / `CLAUDE.md` and make every session noisy
- rely on the agent to rediscover subtle project conventions from scratch every time

This spike tests a third option: lazy-load only the narrow rules that match the file being edited.

## Why the split looks like this

This is an MVP, so the design is intentionally small:

- centralize only the parts that are truly agent-neutral
- isolate proprietary hook wiring at the edge
- prove behavior with executable tests, not just documentation

If another runtime needs a different wrapper, it should reuse the shared loader if possible and only replace the last-mile adapter.

## What counts as proof

This spike is real because all of these are present:

- checked-in shared rules under `.agents/skills/rules/`
- a shared loader that can be run directly from the CLI
- a Claude adapter that uses the shared loader
- contract tests proving the generic and Claude outputs carry the same rule content

## How to inspect it

Generic/shared output:

```sh
node .agents/hooks/inject-rules.mjs \
  --file "$PWD/src/shared/api/daoService/queries/useDao.ts"
```

Claude adapter output:

```sh
echo '{"tool_name":"Edit","tool_input":{"file_path":"'"$PWD"'/src/shared/api/daoService/queries/useDao.ts"}}' \
  | node .claude/hooks/inject-rules.mjs
```

Tests:

```sh
node --test .agents/hooks/*.test.mjs .claude/hooks/*.test.mjs
pnpm test:guardrails
```

These tests intentionally use Node's built-in test runner, not Jest. The main repo Jest suite ignores `/.agents/hooks/` and `/.claude/hooks/` so the guardrails spike can use ESM `.mjs` tests without changing the application's Jest setup.

## Current limits

- The only checked-in runtime adapter in this spike is Claude.
- The architecture is agent-agnostic, but not every agent runtime exposes a repo-local hook surface yet.
- Rule quality still depends on humans writing narrow, useful rules instead of bloated policy docs.

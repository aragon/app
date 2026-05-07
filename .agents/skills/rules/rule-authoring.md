---
name: rule-authoring
description: How to author or revise a rule-skill — fires when editing files inside the rule folders themselves.
applies-to: .agents/skills/rules/**, .claude/skills/rules/**
kind: rule
---

# rule-authoring

You're editing inside a rule-skills folder. Follow the conventions below so the rule earns its keep.

## Canon

- `.agents/skills/rules/README.md` — full spec for the rule-skill convention (frontmatter, glob semantics, hook contract).
- `.agents/skills/rules/query-and-cache.md`, `plugin-slot-registration.md` — reference shapes.
- `.agents/hooks/inject-rules.mjs` — the shared loader; how rules get matched and injected.

## Authoring shape (sweet spot)

A rule-skill is documentation that loads when relevant — onboarding-grade context for both human contributors and agent cold-start. Aim for:

- **Canon pointers** (1-3 example files) — let pattern recognition do the heavy lifting.
- **Non-obvious knowledge** — silent-failure modes, intentional inconsistencies, conventions the type system doesn't enforce, cross-file invariants invisible from any single file. This is the load-bearing content.
- **Light reference structure** (folder layouts, registration grammar) where it serves orientation.
- **Narrow `applies-to` glob** — a rule's blast radius is its glob. `src/plugins/*/index.ts` beats `src/plugins/**`.

What to avoid:

- Enumerated micro-rules that restate what reading the canon would teach
- Architectural essays
- Boilerplate the model would naturally produce correctly given the canon

## When to write or update a rule

The model is bottom-up, not top-down. Write or revise a rule when:

- A code review surfaces a non-obvious convention that wasn't documented
- You catch yourself fixing the same class of mistake more than once
- A new contributor (human or agent) stumbles on something that wasn't visible from the code itself
- An intentional inconsistency exists (e.g. "this is gradually migrating; bias toward X for new code")

Don't write rules speculatively — empty rules atrophy and the routing cost outlasts the value.

## Frontmatter

```yaml
---
name: short-kebab-id
description: One sentence; what the rule covers.
applies-to: src/some/narrow/path/**, src/another/specific/glob/**
kind: rule
---
```

`kind: rule` is required — it's the discriminator the hook uses to skip workflow skills (`kind: command`) sitting next door.

## Sanity check before saving

- Glob is as narrow as the content allows
- A reader who hasn't seen the codebase could find the canon files from your pointers
- The non-obvious bullets describe failure modes or invariants that aren't visible from a single canon file
- The whole rule fits on a screen, or has earned its length with documentation value

If unsure whether a rule earns its keep, leave it out. Friction in a future PR is the right trigger to add it.

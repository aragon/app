# Local skills

Private, developer-specific skills. Intentionally untracked.

Your own workflows and shortcuts belong here. The nested `.gitignore` keeps everything in this folder out of the repository and out of the commit history, while `pnpm skills:sync` still installs it into every agent discovery root — so your skills reach your agents without ever becoming company code.

## Rules

- Local skills are private and intentionally untracked by Git.
- Each local skill belongs at `skills/local/<skill-name>/SKILL.md`.
- `SKILL.md` must not exist directly under `skills/local/` — it always lives inside a named skill directory.
- Local skill names must not collide with shared skill names under `skills/shared/`.
- Local skills participate in synchronization automatically — `pnpm skills:sync` discovers and installs them alongside shared skills.
- Generated agent copies (under `.agents/skills/`, `.claude/skills/`, etc.) must not be edited. They are reproducible from the canonical source here.

## Adding a local skill

```sh
mkdir skills/local/my-skill
# create skills/local/my-skill/SKILL.md with name + description frontmatter
pnpm skills:sync
```

The nested `.gitignore` keeps everything here private except this README and itself.

## Why here, and not directly in a generated root

A skill dropped straight into `.claude/skills/` or `.agents/skills/` works, and the sync will never delete it — it only removes what it installed itself. But a generated root is a copy, not a source: the skill reaches that one agent, is lost if you ever clear the root, and has to be duplicated per agent. Keeping it here means one source, every agent, survives a reset.

## Promoting a local skill to shared

Local is also where a shared skill should start — dogfood it privately, then move it to `skills/shared/<skill-name>/` once it earns its keep. A committed skill must be repo-portable: no dependencies on personal tooling, paths, or infrastructure this repository doesn't have.

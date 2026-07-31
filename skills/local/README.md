# Local skills

Private, developer-specific skills. Intentionally untracked.

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

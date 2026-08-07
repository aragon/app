# gh stack Command Reference

Full reference for `github/gh-stack` v0.1.0.

## Commands

### `gh stack init`

Initialize a new stack targeting the default branch.

```sh
gh stack init                           # from current branch
gh stack init branch1 branch2 branch3   # convert existing branches
```

Options:
- `--base <branch>` — target branch (default: repo's default branch)

### `gh stack submit`

Push all branches and create/recreate PRs for the stack.

```sh
gh stack submit
```

Each PR targets the previous branch in the stack. The bottom PR targets the base branch (e.g., `main`).

**This is the mandatory step.** `gh stack submit` registers the chain with GitHub's Stack metadata — without it, GitHub sees standalone PRs, not a stack. No stack UI, no group-merge, no cascading rebase. Do not substitute `gh pr create` with manual base targeting.

### `gh stack restack`

Rebase the entire stack onto the current base branch. Use when `main` has moved.

```sh
gh stack restack
```

After restacking, run `gh stack submit` to update the PRs.

### `gh stack ls`

List the branches in the current stack with their PR status.

```sh
gh stack ls
```

### `gh stack add`

Add a new branch to the top of an existing stack.

```sh
gh stack add <branch-name>
```

### `gh stack rm`

Remove a branch from the stack.

```sh
gh stack rm <branch-name>
```

## Teardown warnings

### `gh pr close --delete-branch` is destructive

`--delete-branch` deletes both the remote and local branch ref. If you haven't backed up, the branch is gone.

Safe teardown order:
1. Back up branches: `git tag backup/<name> <branch>`
2. Verify backups: `git tag -l 'backup/*'`
3. Create and submit the correct `gh stack` replacement.
4. Verify the new stack's PRs are live.
5. Only then close old PRs: `gh pr close <PR-NUMBER> --delete-branch`

**Never delete before you've verified the replacement stack is created and submitted.**

## Changeset format gotchas

### `none` bump type — correct for intermediate layers

```yaml
---
"@aragon/app": none
---

Internal layer — no user-facing changes.
```

Parses correctly, passes CI, skips versioning, no CHANGELOG entry.

### Truly empty frontmatter — BROKEN

```yaml
---
---
```

Fails `@changesets/parse` v0.4.3+ with "expected a document, but the input is empty." Do not use.

## Tips

- **Commit messages** — follow this repo's `type(scope): summary` convention. `gh stack` doesn't override your commit discipline.
- **Force-push** — `gh stack submit` force-pushes branch updates. This is expected for stacked PRs (the branch history is part of the stack contract), but never force-push to `main`. If doing manual pushes between `gh stack` operations, use `--force-with-lease` (not bare `--force`) to avoid overwriting others' work on shared branches.
- **Multiple remotes** — this repo's worktrees carry more than one remote, so `gh stack submit` fails with "multiple remotes configured." Fix with `git config remote.pushDefault origin`.
- **Conflicts** — if two layers in the stack touch the same file, resolve in the upper layer and restack.
- **Merge order** — always merge bottom-up. Merging a middle PR out of order orphans the layers above it.

## Installation

```sh
gh extension install github/gh-stack
```

Verify:

```sh
gh extension list | grep stack
```

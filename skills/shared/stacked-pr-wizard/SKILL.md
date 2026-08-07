---
name: stacked-pr-wizard
description: >-
  Scaffold stacked PR workflows with gh stack — init a stack, add branches,
  submit, restack, and manage the chain. Covers both greenfield stacks
  (plan → exec → gate) and retroactive decomposition of a finished monolithic
  branch into reviewable layers. Use when starting layered feature delivery:
  "stack PRs", "create a PR stack", "gh stack", "stacked pull requests",
  "chain dependent PRs", "decompose a branch into a stack".
---

# Stacked PR Wizard

Manages stacked pull requests with the `gh stack` CLI extension (`github/gh-stack`). Stacked PRs break a large change into an ordered chain where each PR targets the previous branch, letting reviewers see layers in isolation while the whole stack lands against `main`.

## CRITICAL: Use gh stack — never hand-create stacked PRs

**Do not hand-create stacked PRs** via `gh pr create` with sequential bases. That produces standalone PRs that GitHub does not recognize as a Stack — no stack UI, no group-merge, no cascading rebase. Use `gh stack init` + `gh stack submit` to register the chain with GitHub's Stack metadata. This is the single most important mechanical step in the workflow.

## When to use

- A feature spans multiple ordered PRs (data → UI → wiring → release)
- You want each layer reviewable independently before the whole stack merges
- You need to rebase an entire stack onto `main` in one command
- **Retroactive decomposition** — you have a finished monolithic branch and need to slice it into reviewable layers

## When NOT to use

- Single-PR work — just `gh pr create`
- Unordered parallel PRs with no dependencies between them

## Prerequisites

```sh
gh extension install github/gh-stack
```

Verify:

```sh
gh stack --help
```

This repo is developed in git worktrees with more than one remote (`origin` plus a desktop/client remote), so `gh stack submit` fails with "multiple remotes configured." Fix with:

```sh
git config remote.pushDefault origin
```

## Greenfield workflow

Starting from scratch — plan layers first, then execute each as a branch in the stack.

1. **Init the stack** from a clean branch off `main`:

   ```sh
   git checkout main && git pull
   git checkout -b feat/APP-XXXX-01-domain
   gh stack init
   ```

2. **Commit work on each branch.** Each branch is a layer. Commit messages follow this repo's convention — `type(scope): summary` (e.g. `feat(APP-1030): …`), imperative, single-line, no co-author trailer.

3. **Add layers:**

   ```sh
   gh stack add feat/APP-XXXX-02-data
   # commit work
   gh stack add feat/APP-XXXX-03-ui
   # commit work
   ```

4. **Submit the stack:**

   ```sh
   gh stack submit
   ```

   This pushes all branches and creates a PR for each, targeting the previous branch. The bottom PR targets `main`.

5. **Restack after rebasing** when `main` moves:

   ```sh
   gh stack restack
   gh stack submit
   ```

6. **Merge bottom-up.** Each PR merges into the next branch's base. When the bottom PR merges to `main`, the rest of the stack automatically retargets.

## Retroactive decomposition

You have a finished monolithic branch with many commits touching many concerns. You need to slice it into a reviewable stack. This is harder than greenfield — the code already exists across commited history.

### Step 1: Identify the layer boundaries

Read the full diff (`git diff main...feature-branch`) and group files by concern. Each layer should:
- Represent one coherent concern (domain types, data pipeline, UI, wiring, activation)
- Compile and pass tests in its cumulative state (layer N includes layers 1..N)
- Have a clear commit or set of commits that can be cherry-picked or re-applied

### Step 2: Create the stack branches

```sh
git checkout main
git checkout -b feat/APP-XXXX-01-domain
# cherry-pick or re-apply only the domain-type commits
git checkout main
git checkout -b feat/APP-XXXX-02-data
git rebase feat/APP-XXXX-01-domain  # linear cumulative tree — how gh stack models the chain
# cherry-pick the data pipeline commits
# repeat for each layer (rebase onto the previous layer, not merge)
```

### Step 3: Verify each cumulative tree compiles

After building each layer's branch, verify the cumulative tree (all layers up to and including this one) compiles and passes tests:

```sh
git checkout feat/APP-XXXX-02-data
pnpm type-check && pnpm test
```

If a layer doesn't compile in isolation, it may need a dependency from a later layer — reorder or split differently.

### Step 4: Register as a gh stack

```sh
gh stack init feat/APP-XXXX-01-domain feat/APP-XXXX-02-data feat/APP-XXXX-03-ui feat/APP-XXXX-04-wiring
gh stack submit
```

If the monolithic branch was built on a different base than `main` (e.g., a feature fork), specify the base explicitly:

```sh
gh stack init feat/APP-XXXX-01-domain feat/APP-XXXX-02-data --base develop
```

### Gotchas for retroactive decomposition

- **Files that span concerns** — `package.json`, lockfiles, locale files, and `.changeset/` are touched by multiple layers. See [Shared file strategy](#shared-file-strategy) below.
- **Commits that span concerns** — a single commit touching domain + UI needs to be split (`git rebase -i` + edit, or `git checkout` specific files per layer). Use `git rebase --interactive` and split the commit before assigning files to layers.
- **Verify cumulative, not isolated** — layer 3 must compile with layers 1+2+3, not just layer 3's own changes.

## Shared file strategy

Some files are touched by multiple layers. You must decide which layer owns each shared file. The principle: **put the shared file change in the earliest layer that touches it, then batch all subsequent edits to that file into the same layer.** "First consumed" means the first layer that needs any part of the file — not per-layer. If multiple layers modify the same JSON/locale file, batch all edits into the earliest layer that touches it to avoid restack conflicts.

| Shared file | Strategy |
|---|---|
| `package.json` (deps) | Deps go in the layer that first imports the new package. If layer 2 introduces a new import, `package.json` changes go in layer 2. |
| `package.json` (scripts) | Script changes go in the layer that first uses the script. |
| `pnpm-lock.yaml` | Follows `package.json` — goes wherever the dep change lands. Regenerate after each layer that changes deps. |
| Locale files | **Batch all locale keys into the earliest layer that adds any keys** — even if later layers also add keys. If each layer edits the locale file independently, those edits conflict on every restack. One batched edit in the first layer that touches locale avoids this entirely. |
| `.changeset/` | See [Changeset choreography](#changeset-choreography) below. Each layer gets its own changeset file. |
| Shared schemas/types | Types shared across layers go in the earliest layer that defines them. Later layers import from the cumulative tree. |

### Cross-cutting conflict resolution

When two layers both modify the same file (e.g., both add entries to `package.json`):
1. Put the change in the **earlier** layer (the one that first needs it).
2. The later layer's cumulative tree already includes the earlier change — no conflict.
3. If the later layer adds its own entry to the same file, it modifies the already-merged version, not the original `main` version.

## Changeset choreography

### The none bump type

CI requires a changeset on every PR that touches `src/`. For intermediate layers in a stack that don't warrant a version bump, use the **`none`** bump type:

```yaml
---
"@aragon/app": none
---

Internal refactoring — no user-facing changes.
```

`none` passes `@changesets/parse` (v0.4.3+), satisfies CI's changeset requirement, skips versioning, and produces no CHANGELOG entry. A changeset must never mix packages from different release scopes (see root `AGENTS.md` / `.github/release-scopes.yml`) — write one changeset per scope; `pnpm validate:changesets` enforces this. A PR that touches only non-`src/` paths (docs, `skills/`, CI) needs no changeset.

### Do NOT use truly empty frontmatter

A changeset with empty frontmatter (`---\n---\n`) fails `@changesets/parse` with "expected a document, but the input is empty." This is a known gotcha:

```yaml
# ❌ BROKEN — parser rejects this
---
---

# ❌ also broken (no frontmatter block at all)
Just a description.
```

```yaml
# ✅ Correct — none bump type parses and passes CI
---
"@aragon/app": none
---

Internal refactoring — no user-facing changes.
```

### Stack changeset pattern

- **Intermediate layers** — `none` bump changesets. They satisfy CI's per-PR requirement without bumping the version.
- **Final layer (targets `main`)** — the real `patch` or `minor` bump. This is the single changeset that versions the aggregate stack.
- One real bump for the whole stack, not one per layer.

### Creating a none-bump changeset

```sh
cat > .changeset/stack-layer-internal.md << 'EOF'
---
"@aragon/app": none
---

Internal layer — no user-facing changes.
EOF
```

## Teardown guardrails

### Before tearing down wrongly-created PRs

If you hand-created PRs (wrong) and need to redo them via `gh stack`:

1. **Back up all stack branches** before any teardown:

   ```sh
   # Save refs to a backup location
   git tag backup/feat-01 feat/APP-XXXX-01-domain
   git tag backup/feat-02 feat/APP-XXXX-02-data
   # ... one per branch
   ```

2. **Verify the backup exists** before closing PRs:

   ```sh
   git tag -l 'backup/*'
   ```

3. **Only then close and delete:**

   ```sh
   gh pr close <PR-NUMBER> --delete-branch
   ```

### `gh pr close --delete-branch` is destructive

`--delete-branch` deletes both the remote and local branch ref. If you haven't backed up, the branch is gone. **Never delete before you've verified the replacement stack is created and submitted.**

Safe teardown order:
1. Back up branches (tag them).
2. Create and submit the correct `gh stack` replacement.
3. Verify the new stack's PRs are live.
4. Only then close the old PRs.

## Force-push discipline

`gh stack submit` force-pushes branch updates. This is expected for stacked PRs (the branch history is part of the stack contract), but never force-push to `main`. If doing manual pushes between `gh stack` operations, use `--force-with-lease` (not bare `--force`) to avoid overwriting others' work on shared branches. Rewriting already-published PR history beyond `gh stack`'s own submits follows the repo's git-history-safety rule — get explicit approval first.

## Common patterns

### Starting a feature stack

```sh
git checkout main && git pull
git checkout -b feat/APP-XXXX-01-domain
# commit domain types
gh stack init
git checkout -b feat/APP-XXXX-02-data
# commit data pipeline
gh stack submit
```

### Adding a layer to an existing stack

```sh
gh stack add feat/APP-XXXX-03-ui
# commit UI work
gh stack submit
```

### Inspecting the stack

```sh
gh stack ls
```

### Retroactive decomposition of a monolithic branch

```sh
# 1. Identify concerns from the full diff
git diff main...feature-mono --stat

# 2. Create layer branches from main
git checkout main && git checkout -b feat/APP-XXXX-01-domain
git checkout feature-mono -- src/types/ src/domain/
git commit -m "feat: add domain types"

# 3. Build cumulative tree (rebase, not merge — gh stack models chains linearly)
git checkout main && git checkout -b feat/APP-XXXX-02-data
git rebase feat/APP-XXXX-01-domain
git checkout feature-mono -- src/api/ src/queries/

# 4. Verify each layer compiles
git checkout feat/APP-XXXX-02-data && pnpm type-check && pnpm test

# 5. Register as stack and submit
gh stack init feat/APP-XXXX-01-domain feat/APP-XXXX-02-data
gh stack submit
```

See [references/gh-stack-commands.md](references/gh-stack-commands.md) for the full command reference.

## Invocation

Model-invoked. Triggers on "stack PRs", "create a PR stack", "gh stack", "stacked pull requests", "chain dependent PRs", "decompose a branch into a stack".

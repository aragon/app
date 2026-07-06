# Monorepo migration: moving your in-flight branches

The repo was restructured into a pnpm monorepo: everything app-related moved from the repo root into `apps/app/` (pure `git mv`, history preserved). Workflows were regrouped (`app-*.yml`), tooling (turbo/biome/husky/changesets) stays at the root.

## If your branch was created before the restructure

Rebase, then run the leftovers check — the two steps together cover all cases:

```sh
git fetch origin
git rebase origin/main
```

Git's rename detection relocates your **edits to existing files** into `apps/app/` automatically. Files added directly to a renamed directory get relocated with a `CONFLICT (file location)` notice — accept the suggested `apps/app/...` path. But **new files inside new subdirectories** (e.g. a new component folder under `src/`) are silently left at the old path (verified on git 2.50), so always finish with:

```sh
# relocate anything git left at the old paths (no output = nothing to do)
git ls-files -- src public e2e scripts config docs | while read -r f; do
  mkdir -p "apps/app/$(dirname "$f")" && git mv "$f" "apps/app/$f"
done
git status --porcelain | grep -q . && git commit -m "chore: relocate new files into apps/app after rebase"
```

Then reinstall and sanity-check from the repo root:

```sh
pnpm install
pnpm type-check && pnpm test:changed
```

## If the rebase goes sideways

Fallback: re-apply your branch as a patch relocated into `apps/app/`. Works when all your changes are inside app paths (`src/`, `public/`, `e2e/`, `config/`, `scripts/`, `docs/`, app configs):

```sh
# from your old branch
git diff $(git merge-base HEAD origin/main)...HEAD > /tmp/my-branch.patch
git checkout -b my-branch-migrated origin/main
git apply -3 --directory=apps/app /tmp/my-branch.patch
```

Caveat: `--directory` prefixes *every* path in the patch. If your branch also touched root-level files (`.github/`, `AGENTS.md`, …), split the patch or apply those hunks by hand.

## Uncommitted local changes

Commit or stash them *before* pulling main. A stash created on the old layout restores cleanly after rebase in most cases; if not, use the patch fallback above (`git stash show -p > /tmp/wip.patch`).

## Versioning, tags & releases

Each workspace is versioned independently via changesets. App releases now use per-package
naming (changesets-native format), so future apps/packages get their own parallel streams:

- **Tags:** `@aragon/app@1.17.0` (hotfix: `@aragon/app@1.17.0-hotfix.1`). Old `vX.Y.Z` tags stay as history.
- **Branches:** `release/app/YYYY-MM-DD_HH-mm`, `hotfix/app/<version>_<timestamp>`.
- **Workflows:** the `app-*.yml` release flows only react to `release/app/*`, `hotfix/app/*` and `@aragon/app@*`; a future workspace gets its own copies with its own prefix.
- **Lockstep versions:** when packages must release together (planned: `@aragon/domain` + the indexer app), add them to the `fixed` group in `.changeset/config.json` — it can only reference packages that already exist in the workspace, so this happens when they land.
- **When a second released workspace lands:** `changeset version` consumes changesets of *all* packages at once, so each per-package release flow must pass `--ignore <other-pkg>` (supported by our CLI version) or we adopt a combined release train — decide when it happens.

**Migration boundary caveat:** `App Rollback` and `App Hotfix Start` run the *current* workflow
definitions against the *tag's* checkout. Pre-monorepo tags (`vX.Y.Z`) have the old layout, so
these workflows can't operate on them:

- Roll back to a pre-monorepo version via the Vercel dashboard (promote the old deployment).
- Hotfix a pre-monorepo release from a branch created off the old tag — its own (old) workflow copies still work.

Once the first monorepo release tag exists, both flows are fully functional again.

## Day-to-day changes

- Run scripts from the repo root as before: `pnpm dev`, `pnpm test`, `pnpm type-check`, `pnpm lint` (proxied via turbo). Or `cd apps/app` and run them there.
- Your local `.env` / `.env.local` now live in `apps/app/` — move them once: `git status` won't show them (gitignored), so just `mv .env .env.local apps/app/` if you still have them at the root.
- IDE: open the repo root as usual; TypeScript/Jest configs are per-package and picked up automatically.

This file is temporary and will be removed once all pre-monorepo branches are merged.

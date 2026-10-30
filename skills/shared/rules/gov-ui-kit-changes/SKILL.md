---
name: gov-ui-kit-changes
description: A GovKit source change is a release of its own — a kit-only changeset and a refreshed component registry in the same PR, even inside an app feature PR.
globs: packages/gov-ui-kit/src/**, packages/gov-ui-kit/index.css
kind: rule
---

# gov-ui-kit-changes

`@aragon/gov-ui-kit` is bundled by the app from source (`workspace:*`) but also published to npm under its own release scope. Treat a kit change inside an app PR as a PR within the PR: it carries its own changeset and its own registry refresh. CI enforces both on the PR (`.github/workflows/app-development.yml`).

## Canon

- `packages/gov-ui-kit/RELEASING.md` — changeset rules and how kit releases start.
- `packages/gov-ui-kit/design-system/component-registry/README.md` — registry refresh commands and intent re-checks.
- `.github/release-scopes.yml` — why app and kit changesets can never be one file.

## In the same PR

- **A new kit changeset**, frontmatter naming only `"@aragon/gov-ui-kit"`, whenever `src/**` changes outside `*.stories.tsx` / `*.test.ts(x)`. Editing an existing unreleased kit changeset doesn't count; add another file. An app changeset does not cover it: the app ships the change, but it never reaches npm. App and kit changes need **two** changeset files (one per scope); a mixed file breaks every scoped release flow. "Check GovKit changeset" fails without it.
- **A registry refresh** whenever any file under `packages/gov-ui-kit/` changes (stories and tests included — the registry hashes them). Build the kit, run `registry.mjs extract` and `selection-guide.mjs generate`, then commit `registry.json`, `selection-guide.json` and `../selection-guide.md`. "Check GovKit component registry" fails without it, and the Claude design-system sync reads these files from `main`.

## Non-obvious

- **Stale intents need a human re-check, not a re-run.** When a file a curated intent cites changes, extraction marks the intent `stale: true`. Re-read the source, adjust the intent if the component's behaviour changed, then update the evidence `sha256`/`line` and set `stale: false`. Flipping the flag without re-reading ships wrong guidance to the design system.
- **Don't start a kit release.** There is no kit schedule: every App Release start sweeps pending kit changesets into a `Release @aragon/gov-ui-kit@x.y.z` PR from the same commit. The changeset's bump level (`major` for removed/renamed exports or changed prop contracts) sets the npm version.

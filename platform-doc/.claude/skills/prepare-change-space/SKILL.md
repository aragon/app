---
name: prepare-change-space
description: Prepare or switch to a development branch or worktree for authorized edits and refresh the app-release documentation checkpoint. Do not use for read-only work.
---

# Prepare a change space

Prepare a safe Git change space and check whether the documentation has fallen behind the shipped app. Release reconciliation is queued here, never performed as a hidden side effect.

## Boundary

- Use this workflow only when the task authorizes repository changes and calls for creating or switching to a development branch or worktree.
- A read-only query, diagnosis, review, or audit neither creates a change space nor edits `internal/maintenance/app-release-state.md`.
- Load the `wiki-cli` skill before any wiki command or entry edit. Follow `AGENTS.md` and `WORKFLOW.md`, preserve unrelated user changes, and keep `protocol-doc/` read-only.

## Prepare Git first

1. Inspect the repository root, current branch, worktree status, remotes, and the pinned submodule. Do not move, discard, or absorb unrelated changes.
2. Establish the intended base safely under the repository's Git rules. If pulling, rebasing, or creating a worktree would conflict with existing work, stop and report the exact conflict rather than improvising a destructive cleanup.
3. Create or switch to the requested branch or worktree. The release-state edit belongs inside this newly prepared mutating space, not on the base branch.

## Refresh the release checkpoint

1. Read [App release documentation state](../../../internal/maintenance/app-release-state.md) and [Source repositories](../../../internal/maintenance/repositories.md).
2. Query the official `aragon/app` GitHub Releases ledger for the newest published, non-draft, non-prerelease release whose tag matches `@aragon/app@<semver>`. Do not infer “latest” from a local changelog, the default branch, or tag ordering alone.
3. Resolve and record the exact tagged commit and published date. If a local app checkout is available, it may corroborate the tag without mutating that sibling repository; the official published release remains the release authority.
4. On a successful check, update `latest_official_release`, `latest_official_commit`, `latest_official_published`, and `last_checked`, plus the entry's human-readable table and current/behind statement. If the official source is unavailable or ambiguous, change none of those fields and report that freshness could not be confirmed.
5. Compare releases semantically, not lexically. Never change `documented_through` during workspace preparation.

If the latest official release is newer than `documented_through`, search the task inventory and backlog for an existing task covering the exact interval `(documented_through, latest_official_release]`:

- reuse the existing task if it already covers the interval, preserving an agent-ready state when its owner briefing is already attached;
- otherwise create `internal/maintenance/tasks/reconcile-app-releases-<from>-to-<to>.md` with `type: task`, `status: ready`, `next_actor: owner`, `input_state: awaiting-owner-briefing`, `release_from_exclusive`, `release_to_inclusive`, evidence, scope, present-tense work, and `## Done when`;
- give the task an explicit `**Next action — owner:**` asking for a free-form business-context dump for every release in the interval: intended change, why it matters, audience and outcome, live or rollout boundary, known caveats, and intentionally non-product work; do not require the owner to format it;
- link the task exactly once under **Ready for your input** in `internal/maintenance/backlog.md`, ordered by the board's rules;
- when that briefing is supplied, preserve it under the repository workflow, set `input_state: ready-for-agent`, change `next_actor` to `agent`, replace the immediate action with `**Next action — agent:** Run the reconcile-app-releases workflow`, and move the same task row to **Ready to run** rather than creating a second task;
- do not run the `reconcile-app-releases` workflow merely because preparation found drift.

If the two releases match, create no task. A stale task that overlaps but does not exactly cover the required interval needs an explicit reconciliation decision; do not create overlapping work silently.

## Gate

After any tracker or backlog change, run from the repository root:

```powershell
wiki --root . check
wiki --root . unresolved
wiki --root . orphans
git diff --check
git submodule status protocol-doc
git -C protocol-doc status --short
```

Report the branch/worktree, observed latest release, documented-through release, freshness result, and any task created or reused, including whether it awaits owner context or is ready for the agent. Leave documentation changes uncommitted for owner review.

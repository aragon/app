---
type: reference
title: App release documentation state
tags: [maintenance, releases, repositories]
source: official aragon/app releases + immutable release tags + completed release reconciliation recorded in log.md
latest_official_release: "@aragon/app@1.39.0"
latest_official_commit: "adad67873c8f9dd75e3ed340b70df3e985ae3557"
latest_official_published: "2026-09-09"
documented_through: "@aragon/app@1.39.0"
documented_through_commit: "adad67873c8f9dd75e3ed340b70df3e985ae3557"
last_checked: "2026-09-15"
---

# App release documentation state

The canonical checkpoint between the [official app release ledger](https://github.com/aragon/app/releases) and this documentation base. It separates what has most recently shipped from what has been fully mined, reconciled against application reality, and dispositioned in the graph.

| State | Release | Tagged commit | Date |
|---|---|---|---|
| Latest official stable release observed | `@aragon/app@1.39.0` | `adad67873c8f9dd75e3ed340b70df3e985ae3557` | Published 2026-09-09 |
| Documentation reconciled through | `@aragon/app@1.39.0` | `adad67873c8f9dd75e3ed340b70df3e985ae3557` | — |
| Last successful release check | — | — | 2026-09-15 |

**Current:** the latest official stable app release and the documented-through release are the same.

## How the state moves

The `prepare-change-space` skill refreshes the latest-official fields only when it creates or switches into a branch or worktree for mutating work. A read-only query, review, or audit does not edit this entry. The check uses the newest published, non-draft, non-prerelease GitHub release whose tag matches `@aragon/app@<semver>` and records the exact tagged commit; the [Source repositories](./repositories.md) page identifies the application checkout and the other codebases used later in reconciliation.

`last_checked` records a successful check of the official source, not an attempted one. If that source is unavailable, leave every field unchanged and report that freshness could not be confirmed.

When `latest_official_release` is newer than `documented_through`, branch preparation creates or reuses one finite task for the fixed interval after the documented-through release through the observed latest release. The task starts under **Ready for your input** because each release needs the owner's free-form business-context briefing before code-led reconciliation begins. Once that briefing is preserved, the same task moves to **Ready to run** for the agent; branch preparation does not run the reconciliation as a side effect.

Only the `reconcile-app-releases` workflow may advance `documented_through`. It does so after every release item in the fixed interval has an explicit disposition, the canonical graph and backlog agree, temporary extraction material is retired, and the composite wiki gate passes. The workflow rechecks the official release ledger before closing; a release published during the pass becomes the next finite task instead of silently extending the completed interval.

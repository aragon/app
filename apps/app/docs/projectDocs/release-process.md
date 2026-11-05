# Release Process

This document describes the release process for Aragon App.

The flows are the reusable workflows of [`aragon/github-templates`](https://github.com/aragon/github-templates) (see its `docs/release-design.md`), called from thin workflows in this repository. This process is app-scoped: the release flow versions only the packages of the `app` release scope (declared in `.github/release-scopes.yml` and referenced via the `scope` input of `release-start`). Other workspaces release through their own flows, each following the same shape:

- **Assistant** — `assistant-release.yml` → merge → production deploy (`assistant-production.yml`). Starts every Wednesday.
- **Docs site** — `docs-release.yml` → staging (`stg.platform-doc.aragon.org`) with smoke tests → merge → production deploy (`docs-production.yml`), plus `docs-hotfix-start.yml` and `docs-rollback.yml`: the app's shape, see `apps/docs/README.md`. Starts every Wednesday.
- **Gov UI Kit** — `gov-ui-kit-release.yml` → merge → an **npm publish** rather than a deploy; see `packages/gov-ui-kit/RELEASING.md`. No schedule of its own: every app release start also starts it from the same commit when kit changesets are pending.
- **Aragon Domain** — `aragon-domain-release.yml` → merge → an **npm publish**, same as the kit; see `packages/aragon-domain/RELEASING.md`. Starts every Tuesday.

See the "Releases" section of the root `AGENTS.md` for the per-package model.

## Versioning & tags (monorepo)

Each workspace is versioned independently via changesets and gets its own tags in the
changesets-native format `<package-name>@<version>`:

- App releases: tag `@aragon/app@1.17.0`, branch `release/app/YYYY-MM-DD_HH-mm`, hotfix branch `hotfix/app/<version>_<timestamp>`, hotfix tag `@aragon/app@1.17.0-hotfix.1`.
- Assistant releases: tag `@aragon/assistant@0.2.0`, branch `release/assistant/YYYY-MM-DD_HH-mm`.
- Docs site releases: tag `@aragon/docs@0.1.0`, branch `release/docs/YYYY-MM-DD_HH-mm`, hotfix branch `hotfix/docs/<version>_<timestamp>`, hotfix tag `@aragon/docs@0.1.0-hotfix.1`.
- Gov UI Kit releases: tag `@aragon/gov-ui-kit@2.12.0`, branch `release/gov-ui-kit/YYYY-MM-DD_HH-mm`. Tags from before the monorepo migration keep the standalone repo's `vX.Y.Z` scheme and stay in the archived `aragon/gov-ui-kit`.
- Aragon Domain releases: tag `@aragon/aragon-domain@0.5.0`, branch `release/aragon-domain/YYYY-MM-DD_HH-mm`. The standalone repo's `v0.2.0`…`v0.4.0` tags stay in the archived `aragon/aragon-domain`.
- Future released workspaces follow the same pattern with their own prefix and their own `<pkg>-release.yml` copy.
- Every production workflow filters `release: published` by tag prefix (`startsWith(github.event.release.tag_name, '@aragon/app@')` and the equivalents), so one workspace's release never triggers another's deploy or publish. Any new workspace flow must do the same.

Tags created before the monorepo migration keep the old `vX.Y.Z` format and point at the old
repo layout — hotfix/rollback workflows only work with `@aragon/app@*` tags (see MIGRATION.md).

## Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Start Release  │───▶│  Test & Stage   │───▶│ Approve & Merge │───▶│ Tag, Release &  │
│  (auto/manual)  │    │  (automatic)    │    │    (manual)     │    │ Deploy (auto)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

Every release is one Slack thread in the releases channel. The head message is the release's status
line (Started → Completed or Cancelled) and keeps the release summary; everything that happens
afterwards is a reply in that thread, so the channel reads the same for every workspace.

## Step-by-Step Guide

### 1. Start Release

**Who:** Developer or Manager  
**Action:** Starts automatically every Monday at 15:07 UTC (auto release), or trigger **App Release** manually in GitHub Actions.

The scheduled run green-skips when there are no pending changesets for the `app` scope or an app release PR is already open. Manual trigger:

1. Go to [Actions → App Release](https://github.com/aragon/app/actions/workflows/app-release.yml)
2. Click **Run workflow**
3. Select `main` branch (or specify a commit SHA)
4. Click **Run workflow**

**What happens automatically:**
- Branch `release/app/YYYY-MM-DD_HH-mm` is created
- Version is updated via changeset
- Summary is generated with Linear tickets (open tickets are flagged, never a gate)
- PR is opened to `main`
- Slack thread is started with the team ping; the release is created in the "App front-end" Linear pipeline

### 2. Test on Staging

**Who:** Platform team  
**What happens automatically on each push to the release PR:**

1. The PR description and the Slack head message are refreshed with the current summary
2. Tests run (types, lint, unit tests)
3. ⏳ Slack: "Staging build & deploy started..."
4. Deploy to [stg.app.aragon.org](https://stg.app.aragon.org)
5. ✅ Slack: "Deployed to staging" with what to do next
6. Smoke and BV (Synpress wallet) suites run against staging and report in the thread

**Team actions:**
- Test functionality on staging
- If bugs found — create PR with fixes to release branch, test again
- If all good — proceed to next step

> **Important:** PR description contains `<!-- slack_ts: ... -->` and `<!-- release_actor: ... -->` markers — the first keeps every notification in the same Slack thread, the second keeps the release attributed to whoever started it. The description is owned by the automation and rewritten on every push; do not edit it by hand.

### 3. Approve & Merge

**Who:** Developer from CODEOWNERS  
**Action:**

1. Approve the Release PR (at least 1 approval from CODEOWNERS)
2. Merge it into `main` with a **merge commit** (not squash): the tag goes on the PR head, which must stay in `main`'s history

**Merging is the release act** — everything after this is automatic.

**What happens automatically on merge** (`app-release.yml`, finalize):
1. Guard: the release branch must carry no new app-scope changesets (see the FAQ below)
2. 🏷️ Slack: "PR merged! Creating tag and GitHub Release..."
3. Git tag `@aragon/app@<version>` is created on the staging-tested head SHA (never on the merge commit, which would also carry whatever landed on `main` while the PR was open — the same rule applies to the assistant, gov-ui-kit and aragon-domain flows)
4. GitHub Release is created with the changelog as its notes
5. 📦 Slack: "GitHub Release created" with the link

### 4. Deploy to Production

**What happens automatically when the GitHub Release is published** (`app-production.yml`):

1. 🚀 Slack: "Production build & deploy started..."
2. ⏸️ Slack: "Waiting for approval — deploy to production" with the team ping and the link to approve. The `production` environment requires an approval from `@aragon/app-team`; the deploy waits there.
3. Application build from the tag
4. Deploy to [app.aragon.org](https://app.aragon.org)
5. ✅ Slack: "Deployed to production"; the smoke suite runs and reports in the thread
6. 🎉 The Slack head message flips to "Completed (production)" and the Linear release is marked complete

The deploy job only runs for tags starting `@aragon/app@`, so assistant and gov-ui-kit releases do not trigger it.

If any step of any flow fails, the thread gets a ❌ message with the link to the run.

---

## Hotfix

Urgent fix for production.

### Automated way (recommended)

1. Go to [Actions → App Hotfix Start](https://github.com/aragon/app/actions/workflows/app-hotfix-start.yml)
2. Specify:
   - `base_tag`: tag to create hotfix from (e.g., `@aragon/app@1.16.0`)
   - `commits`: SHA of commits to cherry-pick from main (comma-separated)
3. Run workflow

It opens its own Slack thread, runs the checks, deploys the hotfix to staging, pushes the hotfix tag and runs the smoke suite. Confirm staging, then run **App Production** with the hotfix tag; the production deploy waits for the same approval as a release.

### Manual way

1. Create branch from tag: `git checkout -b hotfix/app/1.16.0_manual '@aragon/app@1.16.0'`
2. Cherry-pick needed commits: `git cherry-pick <commit-sha>`
3. Create changeset: `pnpm changeset`
4. Push and create PR to `main`
5. Test on staging
6. Approve and merge the PR

---

## Rollback

Roll back production to a previous version.

1. Go to [Actions → App Rollback](https://github.com/aragon/app/actions/workflows/app-rollback.yml)
2. Specify tag to rollback to (e.g., `@aragon/app@1.16.0`)
3. Run workflow

Production will be rebuilt and deployed from the specified tag, behind the production approval.

---

## FAQ

### What if the release is approved but new bugs are found?

1. **Don't merge** the Release PR
2. Create PR with fixes to release branch (no changeset needed — the release is already versioned)
3. After fixes are merged — test on staging again
4. Only then approve and merge the Release PR

### Can new features be added to release branch?

No. Release branch is for fixes only. New features should go to the next release.

### What if changeset files appear in release branch?

Workflow will block release creation. You cannot add new changesets to an existing release — start a new release.

### How to cancel a release?

Close the Release PR without merging. Slack will receive a "Release cancelled" notification, the head message flips to "Cancelled" and the Linear release is canceled.

---

## Secrets

Stored in 1Password vault `kv_app_infra`:

| Secret | Description |
|--------|-------------|
| `SLACK_BOT_TOKEN` | Slack bot token |
| `SLACK_CHANNEL_ID` | Release channel ID |
| `SLACK_CODEOWNERS_GROUP_ID` | Team group ID for pings |
| `LINEAR_API_TOKEN` | Token for Linear tickets in the summary |
| `LINEAR_PIPELINE_ACCESS_KEY` | Access key of the "App front-end" Linear release pipeline (`LINEAR_PIPELINE_ACCESS_KEY_ASSISTANT` for the assistant's) |
| `ARABOT_PAT` | Personal Access Token for GitHub API |
| `arabot-1_SIGN_CERTS` | GPG key signing the release commit |

---

## Related Documents

- [Changelog](../../CHANGELOG.md)
- [Rollback Workflow](https://github.com/aragon/app/actions/workflows/app-rollback.yml)
- [Hotfix Workflow](https://github.com/aragon/app/actions/workflows/app-hotfix-start.yml)
- [aragon/github-templates release design](https://github.com/aragon/github-templates/blob/main/docs/release-design.md)

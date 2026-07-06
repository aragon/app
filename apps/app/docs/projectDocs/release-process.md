# Release Process

This document describes the release process for Aragon App.

## Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Start Release  │───▶│  Test & Stage   │───▶│  Approve & Tag  │───▶│  Auto Deploy    │───▶│   Merge PR      │
│  (manual)       │    │  (automatic)    │    │  (label+review) │    │  (automatic)    │    │  (manual)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Step-by-Step Guide

### 1. Start Release

**Who:** Developer or Manager  
**Action:** Manually trigger **App Release (New)** workflow in GitHub Actions.

1. Go to [Actions → App Release (New)](https://github.com/aragon/app/actions/workflows/app-release-v2.yml)
2. Click **Run workflow**
3. Select `main` branch (or specify a commit SHA)
4. Click **Run workflow**

**What happens automatically:**
- Branch `release/YYYY-MM-DD_HH-mm` is created
- Version is updated via changeset
- Summary is generated with Linear tickets
- PR is opened to `main`
- Slack notification is sent with team ping

### 2. Test on Staging

**Who:** Platform team  
**What happens automatically on each push to release PR:**

1. ⏳ Slack: "Staging build & deploy started..."
2. Tests run (types, lint, unit tests)
3. Deploy to [stg.app.aragon.org](https://stg.app.aragon.org)
4. ✅ Slack: "Staging Deployed" + team ping

**Team actions:**
- Test functionality on staging
- If bugs found — create PR with fixes to release branch, test again
- If all good — proceed to next step

> **Important:** PR description contains `<!-- slack_ts: ... -->` — this is needed to send all notifications to the same Slack thread. Don't delete this comment!

### 3. Approve & Create Release

**Who:** Developer from CODEOWNERS  
**Action:**

1. Approve the Release PR (at least 1 approval from CODEOWNERS)
2. Add label `release:ready`

**What happens automatically:**
1. 🏷️ Slack: "Release marked as verified and ready!"
2. Git tag is created
3. GitHub Release is created
4. 📦 Slack: "GitHub Release Created!" + link to release

### 4. Deploy to Production

**What happens automatically when GitHub Release is published:**

1. 🚀 Slack: "Production build & deploy started..."
2. Application build
3. Deploy to [app.aragon.org](https://app.aragon.org)
4. 🎉 Slack: "Production Deployed!" + team ping + PR merge reminder

### 5. Merge PR

**Who:** Developer  
**Action:** After successful production deploy — merge Release PR into `main`.

**What happens automatically:**
- ✅ Slack: "PR merged, release complete!"

---

## Hotfix

Urgent fix for production.

### Automated way (recommended)

1. Go to [Actions → Hotfix Start](https://github.com/aragon/app/actions/workflows/hotfix-start.yml)
2. Specify:
   - `base_tag`: tag to create hotfix from (e.g., `v1.16.0`)
   - `commits`: SHA of commits to cherry-pick from main (comma-separated)
3. Run workflow

The rest of the process is the same as a regular release.

### Manual way

1. Create branch from tag: `git checkout -b hotfix/v1.16.1 v1.16.0`
2. Cherry-pick needed commits: `git cherry-pick <commit-sha>`
3. Create changeset: `pnpm changeset`
4. Push and create PR to `main`
5. Test on staging
6. Approve + add label `release:ready`

---

## Rollback

Roll back production to a previous version.

1. Go to [Actions → App Rollback](https://github.com/aragon/app/actions/workflows/app-rollback.yml)
2. Specify tag to rollback to (e.g., `v1.16.0`)
3. Run workflow

Production will be rebuilt and deployed from the specified tag.

---

## FAQ

### What if the release is approved but new bugs are found?

1. **Don't add** label `release:ready`
2. Create PR with fixes to release branch
3. After fixes are merged — test on staging again
4. Only then add `release:ready`

### Can new features be added to release branch?

No. Release branch is for fixes only. New features should go to the next release.

### What if changeset files appear in release branch?

Workflow will block release creation. You cannot add new changesets to an existing release — start a new release.

### How to cancel a release?

Close the Release PR without merging. Slack will receive "Release cancelled" notification.

---

## Secrets

Stored in 1Password vault `kv_app_infra`:

| Secret | Description |
|--------|-------------|
| `SLACK_BOT_TOKEN` | Slack bot token |
| `SLACK_CHANNEL_ID` | Release channel ID |
| `SLACK_PLATFORM_GROUP_ID` | @platform group ID for pings |
| `LINEAR_API_TOKEN` | Token for Linear tickets |
| `ARABOT_PAT` | Personal Access Token for GitHub API |

---

## Related Documents

- [Changelog](../../CHANGELOG.md)
- [Rollback Workflow](https://github.com/aragon/app/actions/workflows/app-rollback.yml)
- [Hotfix Workflow](https://github.com/aragon/app/actions/workflows/hotfix-start.yml)

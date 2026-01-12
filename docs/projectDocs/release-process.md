# Release Process

This document describes the release flow for the Aragon App.

## Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Start Release  │───▶│  Test & Stage   │───▶│  Approve & Tag  │───▶│  Auto Deploy    │
│  (manual)       │    │  (automatic)    │    │  (label+review) │    │  (automatic)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Workflow

### 1. Start Release

Trigger **App Release (New)** workflow manually (`workflow_dispatch`).

- Creates branch `release/YYYY-MM-DD_HH-mm`
- Bumps version via `changeset`
- Opens PR to `main`
- Posts to Slack

### 2. Test on Staging

Every push to the release PR automatically:

- Runs tests (types, lint, unit tests)
- Deploys to `stg.app.aragon.org`
- Updates PR description with release summary
- Notifies Slack thread

### 3. Approve & Release

When ready to release:

1. **Get approvals** — at least 1 approval from CODEOWNERS
2. **Add label** `release:ready`

Once both conditions are met → **tag + GitHub Release are created automatically**.

### 4. Production Deploy

When GitHub Release is published → production deploys automatically to `app.aragon.org`.

### 5. Merge PR

After production is live, merge the release PR into `main`. This is just cleanup — the release is already done.

---

## Rollback

If a bad release hits production:

1. Trigger **App Rollback** workflow
2. Input: tag to rollback to (e.g., `v1.16.0`)
3. Production redeploys from that tag

---
---

## Secrets

Stored in 1Password `kv_app_infra` vault:

| Secret | Description |
|--------|-------------|
| `SLACK_BOT_TOKEN` | Slack notifications |
| `SLACK_CHANNEL_ID` | Release channel |
| `LINEAR_API_TOKEN` | Issue titles in summary |
| `ARABOT_PAT` | GitHub API operations |

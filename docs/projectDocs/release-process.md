# App Release v2 — Process Guide

This document describes the new release flow for the Aragon App, designed to be **PR-centric, rollback-safe, and deterministic**.

## 🚀 Key Concepts

1.  **Release PR is King**: The source of truth for the release. If it's not in the PR, it's not in the release.
2.  **Staging Only**: Release binaries are tested on `stg.app.aragon.org`. `dev` environment is unaffected and updates continuously from `main`.
3.  **Tag = Production**: Production is deployed from a Git tag that points to the **tested commit** (PR head), not the merge commit.
4.  **No manual deployments**: All deployments are handled by automation.

---

## Workflow

### 1. Start a Release

Trigger the **App Release (New)** workflow manually.

-   **Workflow**: `app-release-new.yml`
-   **Trigger**: `workflow_dispatch`
-   **Actions**:
    -   Creates branch `release/YYYY-MM-DD_HH-mm`
    -   Bumps versions via `changeset`
    -   Generates release summary from Linear issues and commits
    -   Creates a Pull Request to `main`
    -   Posts to Slack thread

### 2. Test on Staging

The release PR automatically deploys to staging.

-   **Trigger**: PR opened or updated (push)
-   **Environment**: `stg.app.aragon.org`
-   **Notification**: Staging URL posted to Slack thread.

### 3. Finalize Release

Merge the Release PR into `main`.

-   **Constraint**: Must use **"Create Merge Commit"**.
-   **Actions**:
    -   Workflow `finish-release.yml` triggers.
    -   Tags the **PR Head Commit** (ensuring exact match with staging).
    -   Creates GitHub Release.
    -   Deploys to `app.aragon.org`.
    -   Notifies Slack.

### 4. Rollback (Emergency)

If a bad release hits production, use **App Rollback**.

-   **Workflow**: `app-rollback.yml`
-   **Trigger**: `workflow_dispatch`
-   **Input**: `tag` (e.g., `v1.16.0`)
-   **Actions**:
    -   Builds exact code from the specified tag.
    -   Deploys to production.

---

## 🛠 Configuration

### Secrets (1Password)

Secrets are stored in `kv_app_infra` vault.

| Secret              | Key                | Description                       |
| :------------------ | :----------------- | :-------------------------------- |
| **Slack Bot Token** | `SLACK_BOT_TOKEN`  | Bot OAuth token for notifications |
| **Slack Channel**   | `SLACK_CHANNEL_ID` | Channel ID for release threads    |
| **Linear API**      | `LINEAR_API_TOKEN` | (Optional) Fetch issue titles     |

### Repository Settings

-   **Main Branch**: Protected.
-   **Merge Method**: **Merge Commit** (Required).
    -   _Why?_ We tag the PR head SHA. Squash/Rebase commits create new SHAs that disconnect the tag from the tested PR history.

---

## ⚠️ Migration

Both the old (`app-release.yml`) and new workflows exist side-by-side.

-   **To use old flow**: Trigger "App Release".
-   **To use new flow**: Trigger "App Release (New)".

Once the new flow is verified, `app-release.yml` will be deprecated.

# Releases

The release process for the application follows a **trunk-based development** approach with the "release from trunk"
variant. The application maintains a single `main` branch, and all feature and bug-fix branches are developed and merged
into `main` before release.

## Release Process

1. The release process is manually triggered using the **App Release** workflow.
2. The workflow must be run on the `main` branch.
3. The workflow executes the following steps:
    - Bumps the package version based on the accumulated changesets.
    - Updates the `CHANGELOG.md` file.
    - Creates a Git tag corresponding to the new version.
    - Bundles and deploys the application.
    - Creates a GitHub release.

## Hotfix Process

For urgent fixes that need to be applied to the production environment, follow these steps:

1. **Branching**:

    - Identify the latest release commit (e.g., `Release v1.0.5`).
    - Create a new hotfix branch from that commit, following the naming convention: `HOTFIX-{{version}}` (e.g.
      `HOTFIX-1.0.5`).

2. **Development & Testing**:

    - Implement the fix on the new hotfix branch.
    - Deploy the changes to the staging environment through the `App Staging` workflow for testing.

3. **Deploying the Hotfix**:

    - If the fix works as expected, trigger the **App Release** workflow on the `HOTFIX-v{{version}}` branch.
    - This workflow will:
        - Deploy the fix directly to production.
        - Skip the version bump and GitHub release steps.

4. **Merging the Fix to Main**:
    - After the fix is live, apply the same fix to `main` by:
        - Branching out from `main`.
        - Implementing the same fix using the regular development workflow.
        - Merging it back into `main`.

# Releases

The release process follows a **trunk-based development** approach, specifically the _release from trunk_ variant. This
means that the application maintains a single `main` branch where all feature and bug-fix branches are developed and
merged before a release.

## Release Process

The application is released manually by triggering the **App Release** workflow. This workflow automates versioning,
changelog updates, tagging, and release creation.

### Steps:

1. The **App Release** workflow is manually triggered on the `main` branch.
2. The workflow executes the following steps:
    - Bumps the package version based on the accumulated changesets.
    - Updates the `CHANGELOG.md` file.
    - Creates a Git tag corresponding to the new version.
    - Creates a GitHub release.
3. When the GitHub release is created, the **App Production** workflow is automatically triggered to deploy the
   application to production.

## Hotfix Process

In cases where urgent fixes are needed in production, the hotfix process ensures rapid deployment while keeping future
releases consistent.

### Steps:

1. **Branching**:

    - Identify the latest release commit (e.g., `Release v1.0.5`).
    - Create a new hotfix branch from that commit, following the naming convention: `HOTFIX-v{{version}}` (e.g.,
      `HOTFIX-v1.0.5`).

2. **Development & Testing**:

    - Implement the fix on the new hotfix branch.
    - Deploy the changes to the staging environment through the **App Staging** workflow for testing and QA.

3. **Deploying the Hotfix**:

    - Once the fix is verified, manually trigger the **App Production** workflow on the `HOTFIX-v{{version}}` branch to
      deploy it to production.

4. **Merging the Fix to Main**:
    - To ensure the fix is included in future releases, merge it into `main`:
        - Create a new branch from `main`.
        - Implement the same fix using the regular development workflow.
        - Merge the fix into `main`.

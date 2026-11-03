# Releasing @aragon/gov-ui-kit

`@aragon/gov-ui-kit` is published to npm, like `@aragon/aragon-domain` (same flow, see
`packages/aragon-domain/RELEASING.md`). Releasing it publishes to npm **for external consumers** — it does not deploy anything, and `apps/app` does not wait on
it: the app builds against the workspace copy, so a kit change reaches the app the moment it
merges to `main`.

The flow mirrors the other workspaces (see `apps/app/docs/projectDocs/release-process.md` for the
shared model); the difference is what happens at the end.

**Where kit changes are recorded.** The app no longer bumps a dependency version to take a kit
change, so `apps/app/CHANGELOG.md` stops gaining an entry per kit release — the old convention
(*"Upgrade `@aragon/gov-ui-kit` to 2.10.0. Number inputs now clamp…"*) ends with the migration.
Kit changes still reach the app's **release notes**, because `.github/filters.yml` lists
`packages/gov-ui-kit/**` under the `app` filter and the release summary is generated from the
commits that filter matches. This package's own `CHANGELOG.md` stays the per-change record, so a
changeset here is the only place a kit change gets described in prose.

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Release Start  │───▶│ Approve & Merge │───▶│  Tag & GitHub   │───▶│   npm publish   │
│ (Tuesday/manual)│    │    (manual)     │    │ Release  (auto) │    │ (needs approval)│
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

The flow is `gov-ui-kit-release.yml` plus `gov-ui-kit-publish.yml`, thin callers of the reusable
workflows of `aragon/github-templates`. Every release is one Slack thread in the releases channel,
the same shape as the app's.

## Release a version

**1. Write a changeset.** Required whenever `src/**` changes (`.changeset/config.json`). It must
name **only** `@aragon/gov-ui-kit` — a changeset may never mix release scopes, so a PR touching
both the app and the kit needs **two** changeset files, one per scope. `pnpm validate:changesets`
enforces this as part of `pnpm test`.

**2. Start the release.** It starts by itself every Tuesday at 15:07 UTC (packages start on
Tuesday, apps on Monday) and green-skips when there are no pending kit changesets or a kit release
PR is already open. By hand: Actions → **Gov UI Kit Release** → Run workflow, optionally with a
`base_commit` (defaults to `main` HEAD).

It versions the `gov-ui-kit` release scope, pushes `release/gov-ui-kit/YYYY-MM-DD_HH-mm`, opens a
`Release @aragon/gov-ui-kit@x.y.z` PR and starts the Slack thread with the summary. Every push to
the PR refreshes the summary and runs the checks.

**3. Approve and merge.** Merging is the release act. On merge, the finalize job tags the merge
commit `@aragon/gov-ui-kit@x.y.z` and creates the GitHub Release with the changelog as its notes;
the thread hears both.

Do not add new changesets to an open release branch — the finalize job blocks on it. Cancel the
release (close the PR) and start a new one instead; the thread and the head message say so.

**4. Approve the publish.** Publishing the GitHub Release triggers `gov-ui-kit-publish.yml`, which
waits for an approval on the `npm-publish` environment (reviewers: `@aragon/app-team`) — the
thread gets the "waiting for approval" ping with the link. Once approved it builds the package and
publishes it to npm as `latest`, with a signed provenance attestation; the thread gets the result
and the head message flips to Completed.

## Publish a snapshot

For trying a change in a downstream project before releasing it: Actions → **Gov UI Kit Publish** →
Run workflow. This publishes `0.0.0-<timestamp>` under the dist-tag `snapshot-<run-id>`, leaving
`latest` untouched. It needs a pending changeset for `@aragon/gov-ui-kit` — changesets for other
packages alone don't count, since they would leave the kit version unchanged.

Snapshots wait on the same `npm-publish` approval as stable releases. They deliberately run
`changeset version --snapshot` unscoped — the bumps live only in the runner's working tree and
nothing is committed, and only the kit is published.

## How publishing is authenticated

npm **trusted publishing** via OIDC — there is no npm token. Four constraints follow from that, and
each one fails in a way that looks like something else:

| Constraint | What breaks if ignored |
|---|---|
| The workflow filename `gov-ui-kit-publish.yml` is part of the npm trusted-publisher registration | Renaming it fails as an auth error |
| The publish steps must stay **inline** in that workflow, never in a reusable one | npm rejects the OIDC exchange with a 404 |
| `repository.url` in `package.json` must point at `aragon/app` with `"directory": "packages/gov-ui-kit"` | `--provenance` fails — *after* the version is committed and tagged |
| The setup action must be called with `registry-url: ""` | `actions/setup-node` writes an `.npmrc` with a placeholder `NODE_AUTH_TOKEN` that shadows OIDC |

The publish workflow also filters `release: published` on the `@aragon/gov-ui-kit@` tag prefix. The
repo publishes releases for several packages, and they all raise the same event.

## Storybook

Deployed separately from the release, straight off `main`:

- **`gov-ui-kit-storybook-publish.yml`** — every merge to `main` that touches `packages/gov-ui-kit/**`
  deploys to [uikit.aragon.org](https://uikit.aragon.org).
- **`gov-ui-kit-storybook-preview.yml`** — add the `preview` label to a PR that touches the kit to get
  a throwaway URL commented on the PR.

Both are gated on the `gov-ui-kit` paths filter (`.github/filters.yml`), so app-only changes don't
trigger a Storybook deploy.

The build is declared in `vercel.json` here as `{ "framework": "storybook" }`, the same minimal
shape `apps/app` uses for `nextjs`. The preset supplies `storybook build` and `storybook-static`
as its build command and output directory — identical to what the dashboard had, so moving this
into the repo changed nothing — and adds three things a bare `framework: null` would not:

- `defaultRoutes` — filesystem handling plus an `/index.html` fallback, the correct static-site
  behaviour.
- `ignoreRuntimes: ["@vercel/next", "@vercel/node"]` — matters in this monorepo, where a Next app
  is present and must not have its runtime applied to a static Storybook.
- `disableRootMiddleware: true` — the app ships a Next middleware; this keeps it out of the
  Storybook deployment.

Note the preset sets `ignorePackageJsonScript: true`, so Vercel deliberately runs `storybook build`
rather than this package's `build:storybook` script. The two are equivalent today; keep them so, or
the deployed Storybook and `pnpm build:storybook` can diverge.

The project's **Root Directory** is still a dashboard setting — until it is set there, the
Storybook workflows call `deploy-vercel.yml` with `patch-root-directory: true`. The published
Storybook is a production Vercel build run under the `development` GitHub environment: it is not a
release and must not wait for the production approval.

## Secrets

| Vault | Used for |
|---|---|
| `kv_app_infra` | `ARABOT_PAT` (GitHub API), `arabot-1_SIGN_CERTS` (GPG signing of the release commit), the Slack and Linear items shared with the app flow |
| `kv_gov-ui-kit_infra` | Vercel credentials for the Storybook deploys |

## Related

- `apps/app/docs/projectDocs/release-process.md` — the shared per-package release model
- `.github/release-scopes.yml` — which packages this flow versions
- `.github/filters.yml` — the `gov-ui-kit` paths filter

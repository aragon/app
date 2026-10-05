# Releasing @aragon/aragon-domain

`@aragon/aragon-domain` is published to npm **for external consumers** — releasing it does not
deploy anything, and `apps/app` does not wait on it: the app builds against the workspace copy, so
a domain change reaches the app the moment it merges to `main`.

The flow is the same as the kit's (`packages/gov-ui-kit/RELEASING.md`) and mirrors the other
workspaces (see `apps/app/docs/projectDocs/release-process.md` for the shared model).

**Where domain changes are recorded.** The app no longer bumps a dependency version to take a
domain change, so `apps/app/CHANGELOG.md` gets no entry per domain release. Domain changes still
reach the app's **release notes**: `.github/filters.yml` lists `packages/aragon-domain/**` under the
`app` filter, and the release summary is built from the commits that filter matches. This
package's own `CHANGELOG.md` stays the per-change record.

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Release Start  │───▶│ Approve & Merge │───▶│  Tag & GitHub   │───▶│   npm publish   │
│    (manual)     │    │    (manual)     │    │ Release  (auto) │    │ (needs approval)│
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Release a version

**1. Write a changeset.** Required whenever `src/**` changes (`.changeset/config.json`). It must
name **only** `@aragon/aragon-domain` — a changeset may never mix release scopes, so a PR touching
both the app and the domain (the usual Envio slice) needs **two** changeset files, one per scope.
`pnpm validate:changesets` enforces this as part of `pnpm test`.

**2. Dispatch the release.** Actions → **Aragon Domain Release Start** → Run workflow. Optionally
pass a `base_commit`; it defaults to `main` HEAD. There is no schedule.

It versions the `aragon-domain` release scope, pushes `release/aragon-domain/YYYY-MM-DD_HH-mm`, and
opens a `Release @aragon/aragon-domain@x.y.z` PR. If there are no pending changesets it exits
without leaving a branch or PR behind.

**3. Approve and merge.** Merging is the release act. On merge,
`aragon-domain-release-pr-finalize.yml` tags the merge commit `@aragon/aragon-domain@x.y.z` and
creates the GitHub Release with the changelog as its notes.

Do not add new changesets to an open release branch — the finalize workflow blocks on it. Cancel
the release (close the PR) and start a new one instead.

**4. Approve the publish.** Publishing the GitHub Release triggers `aragon-domain-publish.yml`,
which waits for an approval on the `npm-publish` environment (reviewers: `@aragon/app-team`). Once
approved it builds the package and publishes it to npm as `latest`, with a signed provenance
attestation.

Tags from the standalone repo (`v0.2.0`…`v0.4.0`) and their GitHub Releases stay in the archived
`aragon/aragon-domain`; releases from this repo use the `@aragon/aragon-domain@x.y.z` scheme.

## Publish a snapshot

For trying a change in a downstream project before releasing it: Actions → **Aragon Domain
Publish** → Run workflow. This publishes `0.0.0-<timestamp>` under the dist-tag `snapshot-<run-id>`,
leaving `latest` untouched; the run summary prints the install command. It needs a pending changeset
for `@aragon/aragon-domain` — changesets for other packages alone don't count, since they would
leave the domain version unchanged.

Snapshots wait on the same `npm-publish` approval as stable releases. They run
`changeset version --snapshot` unscoped — the bumps live only in the runner's working tree and
nothing is committed, and only the domain is published.

## How publishing is authenticated

npm **trusted publishing** via OIDC — there is no npm token. The same four constraints as for the
kit apply, and each one fails in a way that looks like something else:

| Constraint | What breaks if ignored |
|---|---|
| The workflow filename `aragon-domain-publish.yml` is part of the npm trusted-publisher registration | Renaming it fails as an auth error |
| The publish steps must stay **inline** in that workflow, never in a reusable one | npm rejects the OIDC exchange with a 404 |
| `repository.url` in `package.json` must point at `aragon/app` with `"directory": "packages/aragon-domain"` | `--provenance` fails — *after* the version is committed and tagged |
| The setup action must be called with `registry-url: ""` | `actions/setup-node` writes an `.npmrc` with a placeholder `NODE_AUTH_TOKEN` that shadows OIDC |

The publish workflow also filters `release: published` on the `@aragon/aragon-domain@` tag prefix.
The repo publishes releases for several packages, and they all raise the same event.

## Contract test

`aragon-domain-contract-test.yml` runs `test/contract` every night against the development indexer
and can be dispatched by hand; see the README. It is not a release gate, but a red run before a
release means the deployed indexer and the mappers disagree.

## Secrets

| Vault | Used for |
|---|---|
| `kv_app_infra` | `ARABOT_PAT` (GitHub API), `arabot-1_SIGN_CERTS` (GPG signing of the release commit) |
| `kv_app_<env>` | `NEXT_SECRET_ENVIO_GRAPHQL_ENDPOINT` / `NEXT_SECRET_ENVIO_API_TOKEN` for the contract test, the items the deployed app reads |

## Related

- `apps/app/docs/projectDocs/release-process.md` — the shared per-package release model
- `.github/release-scopes.yml` — which packages this flow versions
- `packages/gov-ui-kit/RELEASING.md` — the same flow for the kit

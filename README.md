# Aragon App monorepo

pnpm workspaces + Turborepo. Node >=24.22.3 (see `.nvmrc`), pnpm (see `packageManager` in `package.json`).

## Workspaces

| Path                           | Package                       | What it is                                                         |
| ------------------------------ | ----------------------------- | ------------------------------------------------------------------ |
| `apps/app`                     | `@aragon/app`                 | The Aragon App (app.aragon.org) — see its own README               |
| `apps/assistant`               | `@aragon/assistant`           | Assistant service: support-chat intake API                         |
| `packages/aragon-domain`       | `@aragon/aragon-domain`       | Governance business logic over the Envio indexer, also on npm      |
| `packages/assistant-chat`      | `@aragon/assistant-chat`      | Support-chat widget for the app                                    |
| `packages/assistant-contracts` | `@aragon/assistant-contracts` | Zod contracts shared by the assistant service and the widget       |
| `packages/gov-ui-kit`          | `@aragon/gov-ui-kit`          | Governance UI Kit, also published to npm                           |

## Quick start

```sh
pnpm install
pnpm prepare                      # husky git hooks (pnpm does not run `prepare` on install)
cp apps/app/.env.example apps/app/.env   # then fill in the secrets, see apps/app/README.md
pnpm dev --filter=@aragon/app     # the app only, on http://localhost:3000
```

The `--filter` goes to turbo, which first builds the workspace libraries the app imports from `dist/` (`@aragon/gov-ui-kit`, `@aragon/aragon-domain`, …). `pnpm --filter @aragon/app dev` (or `pnpm dev` inside `apps/app`) skips that step and fails on a fresh clone with `Export … doesn't exist in target module`.

A root `pnpm dev` without the filter starts **every** app (`apps/app`, `apps/assistant` on :4000, `apps/docs` on :3001). The assistant needs its own secrets (`apps/assistant/.env.example`), and both the assistant and docs fetch the private `aragon/platform-doc` repository at startup, so it fails on a machine without that access. Use the filtered command above unless you work on those apps.

The root only carries workspace-wide tasks, fanned out through turbo: `pnpm dev`, `pnpm build`, `pnpm test`, `pnpm type-check`, `pnpm lint`. Anything app-specific (e2e, env setup, codegen, watch modes) runs inside the workspace that owns it: `cd apps/app` (or `pnpm --filter @aragon/app <script>`).

## Repo layout

- `apps/app/` — all app source, configs, `e2e/`, `docs/`, `scripts/`, `CHANGELOG.md`
- `.github/workflows/` — CI, grouped per app: `app-*.yml` (the app), `shared-*.yml` (reusable deploy/e2e building blocks)
- `.changeset/` — release versioning for every workspace; which packages release together is set in `.github/release-scopes.yml`
- `.agents/`, `.claude/` — agent tooling; see `AGENTS.md`

Migrating a branch created before the monorepo restructure? See [MIGRATION.md](./MIGRATION.md).

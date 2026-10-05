# Aragon App monorepo

pnpm workspaces + Turborepo. Node >=24.16 (see `.nvmrc`), pnpm (see `packageManager` in `package.json`).

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
pnpm dev          # runs the app dev server (turbo)
```

The root only carries workspace-wide tasks, fanned out through turbo: `pnpm dev`, `pnpm build`, `pnpm test`, `pnpm type-check`, `pnpm lint`. Anything app-specific (e2e, env setup, codegen, watch modes) runs inside the workspace that owns it: `cd apps/app` (or `pnpm --filter @aragon/app <script>`).

## Repo layout

- `apps/app/` — all app source, configs, `e2e/`, `docs/`, `scripts/`, `CHANGELOG.md`
- `.github/workflows/` — CI, grouped per app: `app-*.yml` (the app), `shared-*.yml` (reusable deploy/e2e building blocks)
- `.changeset/` — release versioning for every workspace; which packages release together is set in `.github/release-scopes.yml`
- `.agents/`, `.claude/` — agent tooling; see `AGENTS.md`

Migrating a branch created before the monorepo restructure? See [MIGRATION.md](./MIGRATION.md).

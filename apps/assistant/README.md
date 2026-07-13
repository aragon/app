# @aragon/assistant

Aragon assistant service: the support-chat intake API behind the in-app support widget (`packages/assistant-chat`). Hono HTTP service deployed as its own Vercel project (`assistant.aragon.org`, dev on `dev.assistant.aragon.org`).

Phase 1 scope: deterministic intake pipeline (classify intent → extract fields → ask for missing → create Linear issue) with hard limits, idempotent issue creation and structured observability. Docs answering (Phase 2) is out of scope; its seam is the `searchDocs` tool stub.

## Development

```sh
pnpm dev            # copies config/.env.local to .env.local and starts the dev server on :4000
pnpm test           # jest (node environment)
pnpm type-check     # tsc --noEmit
pnpm lint           # biome (root biome.json)
```

The Aragon app (`apps/app`) reads `NEXT_PUBLIC_ASSISTANT_URL` from its own env config and points at `http://localhost:4000` locally, so `pnpm dev` from the repo root boots both sides.

## Environments

| Environment | Deploys on | URL |
| --- | --- | --- |
| preview | pull requests touching the assistant (chained: the app preview of the same PR points at it) | per-deployment URL |
| development | every merge to `main` touching the assistant | `https://dev.assistant.aragon.org` |
| production | merging the "Version Packages: assistant" PR (maintained by the Version-PR bot from pending changesets on `main`): the merge is tagged `@aragon/assistant@x.y.z` and the tag triggers the deploy | `https://assistant.aragon.org` |

Configuration layout:

- Non-secret per-environment config is a checked-in typed module (`src/lib/config.ts`) — Vercel functions receive no `.env` file at runtime, so file-based config lives in code and the runtime environment is derived from `ASSISTANT_ENV` (local) or the automatic `VERCEL_ENV`.
- Build/dev-time variables are checked in under `config/.env.<env>` and copied to `.env.local` by `pnpm run setup <env>`.
- Secrets live exclusively in 1Password (`kv_assistant_<env>` vaults) and are propagated by CI — nothing is configured manually in the Vercel dashboard.
- Vercel project settings are config-as-code in `vercel.json` wherever Vercel supports it (framework, and later functions/crons/headers); the dashboard keeps only what cannot live in code: Root Directory, domains and the WAF toggle.

Rollback: re-deploy a previous deployment from the Vercel dashboard (instant rollback), or re-run the production workflow (`workflow_dispatch`) with an older `@aragon/assistant@x.y.z` tag.

## One-time infrastructure setup (runbook)

Manual steps, in order; all resulting credentials go to 1Password, never to the Vercel dashboard:

1. **Vercel**: create project `assistant` in the `aragon-app` scope, Root Directory = `apps/assistant`, domains `assistant.aragon.org` and `dev.assistant.aragon.org`, enable WAF. Marketplace → add Upstash Redis; copy `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` to 1Password. Everything else stays out of the dashboard — project behavior belongs in `vercel.json`.
2. **1Password**: create vaults `kv_assistant_infra` (`VERCEL_PROJECT_ID`, `VERCEL_ORG_ID`, `VERCEL_TOKEN`) and `kv_assistant_{development,preview,production}` (`AI_GATEWAY_API_KEY`, `LINEAR_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `SENTRY_DSN`).
3. **AI Gateway**: create a dedicated key for the assistant and set a spend budget on it.
4. **Sentry**: create project `assistant` in the existing org, copy the DSN, set error-rate alerts.
5. **Linear**: create a service-bot API key scoped to the target team; ensure labels `feedback`, `bug`, `docs-gap` exist; pick the test team/label used by the LLM smoke checks.
6. **GitHub**: review required checks after the CI paths filters (skipped jobs report as passing).

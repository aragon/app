# @aragon/assistant

Aragon assistant service: the support-chat intake API behind the in-app support widget (`packages/assistant-chat`). Hono HTTP service deployed as its own Vercel project (`assistant.aragon.org`, dev on `dev.assistant.aragon.org`).

Phase 1 scope: deterministic intake pipeline (classify intent → extract fields → ask for missing → create Linear issue) with hard limits, idempotent issue creation and structured observability. Docs answering (Phase 2) is out of scope; its seam is the `searchDocs` tool stub.

## Development

```sh
pnpm dev            # copies config/.env.local → .env.local, loads `.env` + `.env.local`, starts on :4000
pnpm test           # jest (node environment)
pnpm type-check     # tsc --noEmit
pnpm lint           # biome (root biome.json)
```

The Aragon app (`apps/app`) reads `NEXT_PUBLIC_ASSISTANT_URL` from its own env config and points at `http://localhost:4000` locally, so `pnpm dev` from the repo root boots both sides.

## Texts & prompts

All chat/assistant copy is centralized in two places: service-side texts live in `src/chat/prompts/` (LLM prompts `respond.ts` / `classifyIntent.ts` / `extractFields.ts`, fixed non-LLM replies `fixedMessages.ts`, Linear ticket texts `issueTexts.ts`), and every user-facing string of the widget lives in `packages/assistant-chat/src/copy.ts`.

## Attachments & content moderation

Users can attach files (images, text/log, PDF) to a support request. Bytes go **client → Vercel Blob directly**, are validated server-side by magic bytes + size (`src/files/validateFile.ts`), queued per session, and move to the **private** Linear ticket only when the ticket is created; abandoned blobs are swept by the daily `/internal/cleanup` cron.

**Current moderation posture (p4): deterrence + reactive.** There is intentionally **no** automated NSFW/illegal-content scanning. The risk is bounded by: a private end-to-end path (Blob → private Linear queue, never public), the type/size allowlist, per-IP rate + session limits (`src/lib/rateLimit.ts`, `src/lib/config.ts`), a small per-session file cap, a client-side upload disclaimer, and quick deletion. Uploaded content is reviewed reactively by the support team.

**Deferred (not in p4), tracked as follow-ups:**

- **Automated vision moderation** — a safety classification of accepted images at `/files/confirm` via the existing AI Gateway, before the file is queued. The hook point is marked with a `TODO(assistant)` in `src/files/validateFile.ts`.
- **CSAM / illegal content** — needs a dedicated provider (hash-matching / reporting obligations); a policy + provider decision outside this codebase, not a model call.
- **Console-log ring buffer** — an app-side `console.*` interceptor (last N lines, privacy-scrubbed) attached to the ticket as a `.log`. The next debug-signal increment after the cheap context already attached (chainId, recent transactions, Sentry `user.id` replay pointer).

## Environments

| Environment | Deploys on | URL |
| --- | --- | --- |
| preview | pull requests touching the assistant (chained: the app preview of the same PR points at it) | per-deployment URL |
| development | every merge to `main` touching the assistant | `https://dev.assistant.aragon.org` |
| production | manually dispatching the "Assistant Release Start" workflow (prepares a `Release @aragon/assistant@x.y.z` PR from pending changesets on `main`, listing every bumped package), then merging that PR: the merge is tagged `@aragon/assistant@x.y.z` and the tag triggers the deploy | `https://assistant.aragon.org` |

Configuration layout:

- Non-secret per-environment config is a checked-in typed module (`src/lib/config.ts`) — Vercel functions receive no `.env` file at runtime, so file-based config lives in code and the runtime environment is derived from `ASSISTANT_ENV` (local, and pinned by CI on the dev deployment where `VERCEL_ENV` reports `preview`) or the automatic `VERCEL_ENV`.
- Runtime secrets reach the deployed functions as per-deployment env vars: CI lifts them from the prepared `.env` and passes them to `vercel deploy -e` (`runtime-env-keys` in the deploy workflows).
- Build/dev-time variables are checked in under `config/.env.<env>` and copied to `.env.local` by `pnpm run setup <env>`.
- Secrets live exclusively in 1Password (`kv_assistant_<env>` vaults) and are propagated by CI — nothing is configured manually in the Vercel dashboard.
- Vercel project settings are config-as-code in `vercel.json` wherever Vercel supports it (framework, and later functions/crons/headers); the dashboard keeps only what cannot live in code: Root Directory, domains and the WAF toggle.

Rollback: re-deploy a previous deployment from the Vercel dashboard (instant rollback), or re-run the production workflow (`workflow_dispatch`) with an older `@aragon/assistant@x.y.z` tag.

## One-time infrastructure setup (runbook)

Manual steps, in order; all resulting credentials go to 1Password, never to the Vercel dashboard:

1. **Vercel**: create project `assistant` in the `aragon-app` scope, Root Directory = `apps/assistant`, domains `assistant.aragon.org` and `dev.assistant.aragon.org`, enable WAF. Marketplace → add Upstash Redis; copy `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` to 1Password. Storage → create a Blob store for the project; copy `BLOB_READ_WRITE_TOKEN` to 1Password (intermediate storage for chat attachments — files move to Linear only when the ticket is created; the daily `/internal/cleanup` cron sweeps abandoned blobs). Generate a random `CRON_SECRET` and store it in 1Password too. Everything else stays out of the dashboard — project behavior belongs in `vercel.json`.
2. **1Password**: create vaults `kv_assistant_infra` (`VERCEL_PROJECT_ID`, `VERCEL_ORG_ID`, `VERCEL_TOKEN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`) and `kv_assistant_{development,preview,production}` (`AI_GATEWAY_API_KEY`, `LINEAR_API_KEY`, `LINEAR_TEAM_ID`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `BLOB_READ_WRITE_TOKEN`, `CRON_SECRET`, `SENTRY_DSN`). `LINEAR_TEAM_ID` points at the dedicated test team in the development/preview vaults and at the real support team in production. The Sentry token needs project release/file upload access; CI uses the three infrastructure values only to upload source maps.
3. **AI Gateway**: create a dedicated key for the assistant and set a spend budget on it.
4. **Sentry**: create a dedicated Node/Hono project, copy its DSN and create an organization auth token with project release/file upload access. Store the organization and project slugs as `SENTRY_ORG` and `SENTRY_PROJECT` in the infrastructure vault rather than checking them into workflows. The service sends errors, traces, profiles, metrics and structured pipeline logs; request bodies, user/IP data, headers, cookies, query strings and free-text exception messages are stripped in code. CI associates telemetry with the deployed git SHA and uploads source maps before deployment. Configure alerts for new issues, error-rate regression and p95 transaction-duration regression. After deploying development, verify the full pipeline once:

   ```sh
   curl -i -H "Authorization: Bearer $CRON_SECRET" \
     https://dev.assistant.aragon.org/internal/debug-sentry
   ```

   Expect HTTP 500, then confirm the `development` event, `assistant.debug_sentry` log, `assistant.debug_counter` metric, trace/profile and de-minified stack in Sentry. The endpoint is authenticated and returns 404 in production.
5. **Linear**: create a service-bot API key scoped to the target team; ensure labels `feedback`, `bug`, `docs-gap` exist; pick the test team/label used by the LLM smoke checks.
6. **GitHub**: review required checks after the CI paths filters (skipped jobs report as passing).

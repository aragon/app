# @aragon/assistant

Aragon assistant service: the support-chat intake API behind the in-app support widget (`packages/assistant-chat`). Hono HTTP service deployed as its own Vercel project (`assistant.aragon.org`, dev on `dev.assistant.aragon.org`).

Scope: an agentic intake conversation (one system prompt; the `createLinearTicket` tool runs only after the user approves the draft) with hard limits, idempotent issue creation and structured observability — and, behind `docsSearchEnabled`, answers to product questions grounded in the platform documentation (see [Documentation answering](#documentation-answering)).

## Development

```sh
pnpm dev            # copies config/.env.local → .env.local, loads `.env` + `.env.local`, starts on :4000
pnpm test           # jest (node environment)
pnpm type-check     # tsc --noEmit
pnpm lint           # biome (root biome.json)
```

The Aragon app (`apps/app`) reads `NEXT_PUBLIC_ASSISTANT_URL` from its own env config and points at `http://localhost:4000` locally, so `pnpm dev` from the repo root boots both sides.

## Texts & prompts

All chat/assistant copy is centralized in two places: service-side texts live in `src/chat/prompts/` (the agent system prompt `agentPrompt.ts`, fixed non-LLM replies `fixedMessages.ts`, Linear ticket texts `issueTexts.ts`), and every user-facing string of the widget lives in `packages/assistant-chat/src/copy.ts`.

## Documentation answering

With `docsSearchEnabled` on (see `src/lib/config.ts`), the agent answers product questions from the platform knowledge base and falls back to intake when the documentation does not cover a question: it says so, and offers to pass the question on to the team — the ticket (intent `question`, Linear label `docs-gap`) is drafted only after the user agrees. Answers carry no sources yet: where the knowledge base gets published, and therefore what a citation would link to, is still open (APP-1145).

**Corpus.** The knowledge base lives at the repository root, `platform-doc/`, a squashed git subtree of [`aragon/platform-doc`](https://github.com/aragon/platform-doc) (branch `development`) — read-only here until that repository is archived; edits go upstream and come back by replacing the tree (`git fetch https://github.com/aragon/platform-doc.git development && git rm -r -q platform-doc && git checkout HEAD -- .gitmodules && git read-tree --prefix=platform-doc/ -u FETCH_HEAD`, then a normal commit) — not with `git subtree pull`, whose squash commit is unsigned and refused by the repository rules. A sync merged to `main` redeploys the dev assistant with the new corpus; production only picks it up with the next assistant release. Only knowledge pages make it into the index (`type` concept, capability, pattern, decision, principle, risk, reference, guide, example — never tasks, notes, opportunities or files without frontmatter), and only in the review states the environment's **corpus mode** publishes: `ready` is the product-owner-validated set (what the public docs site will publish) — pages the owner reviewed, which the base marks by removing `status: draft`, plus any page marked `status: ready`; `drafts` adds the pages still under review. A knowledge page in any other state (`blocked`, `candidate`, …) never publishes. Pages lose their frontmatter, title heading, `Open questions`/`Progress` sections and owner checklists; the protocol-doc submodule is never read.

| Environment | `docsSearchEnabled` | `docsCorpus` |
| --- | --- | --- |
| local, development, preview | on | `drafts` — a real corpus to test against while the review is in progress |
| production | off | `ready` — dark until enough pages are ready; a config change (and a release) flips it |

**Index build.** `pnpm build:docs-index` (part of `pnpm build` and `pnpm dev`) cuts the pages into passages (one per level-two section, sub-split when long, each prefixed with its area › page › section breadcrumb and the page `summary:`), embeds them through the AI Gateway (`voyage/voyage-4`, about a cent for the whole corpus) and writes `src/docs/generated/docsIndex.js` — git-ignored, imported by the bundle. An unchanged corpus is not re-embedded (the module carries the corpus hash). Without `AI_GATEWAY_API_KEY` the index is built full-text only, which is fine locally and refused in CI (the deploy writes the key to `.env` before `vercel build`). `DOCS_CORPUS_DIR` overrides the corpus location.

**Runtime.** The index is loaded into an in-process Orama database on the first search of an instance; a search embeds the query, runs a hybrid (BM25 + vector) retrieval for 20 candidates, reranks them with `voyage/rerank-2.5-lite` and hands the best five passages to the model; a failing embedding or rerank call is reported to Sentry and the search degrades around it. The agent has three tools — `searchDocs`, `readDoc` (a whole page by path) and `listDocs` — none of which needs an approval, and it is asked to call them silently. The model does not always comply, so `src/chat/docsNarrationFilter.ts` drops the sentence it writes right before a documentation tool call ("Let me look that up") from the stream, and the widget shows a spinner on a running documentation tool part instead of a blank bubble. Every search logs a `searchDocs` step (latency, hit count, top score, corpus mode; never the query). A docs merge redeploys the dev assistant through the `assistant` filter in `.github/filters.yml`; production only picks docs changes up with its next release.

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

# @aragon/assistant

Aragon assistant service: the support-chat intake API behind the in-app support widget (`packages/assistant-chat`). Hono HTTP service deployed as its own Vercel project (`assistant.aragon.org`, dev on `dev.assistant.aragon.org`).

Scope: an agentic intake conversation (one system prompt; the `createLinearTicket` tool runs only after the user approves the draft) with hard limits, idempotent issue creation and structured observability — and, when the host enables it for the conversation, answers to product questions grounded in the platform documentation (see [Documentation answering](#documentation-answering)).

## Development

```sh
pnpm dev            # copies config/.env.local → .env.local, loads `.env` + `.env.local`, starts on :4000
pnpm test           # jest (node environment)
pnpm type-check     # tsc --noEmit
pnpm lint           # biome (root biome.json)
```

The Aragon app (`apps/app`) reads `NEXT_PUBLIC_ASSISTANT_URL` from its own env config and points at `http://localhost:4000` locally, so `pnpm dev` from the repo root boots both sides.

## Texts & prompts

All chat/assistant copy is centralized in two places: service-side texts live in `src/chat/prompts/` (the agent system prompt, fixed non-LLM replies `fixedMessages.ts`, Linear ticket texts `issueTexts.ts`), and every user-facing string of the widget lives in `packages/assistant-chat/src/copy.ts`.

**The system prompt** (`agentPrompt.ts`) is the definition of how the assistant behaves: role, answering questions (documentation tools on), tickets, tone, each rule said once. It holds no product knowledge: everything about Aragon comes from the documentation tools, so the same prompt serves whatever the knowledge base contains, and with the tools off the assistant only collects tickets. A case the documentation does not name is answered by searching for the rule behind it and mapping the case onto the results, a suggestion called a suggestion; a question about the user's own situation is reasoned through in the open: the options the documentation gives, which fits and why, what it does not give. How a tool behaves is in that tool's description.

**Checking a change.** A prompt or model change is checked by reading whole conversations side by side, before and after, on the models of the chain: the product owner's own tests (a voting population the documentation does not name, then "it has to be deterministic"), the basics (chains, getting started, a capability the app lacks), a ticket from a vague report. There is no automated score. `scripts/llmSmoke.mjs` runs a few conversations against a deployed instance every night as a pipeline check.

## Documentation answering

When the request enables it (`features.docsSearch`), the agent answers product questions from the platform knowledge base through two tools; a question the documentation does not answer becomes a ticket only when the user agrees (intent `question`, Linear label `docs-gap`). Without it the assistant only collects tickets. The decision is the host's: the Aragon app sends its `supportChatDocs` feature flag, so documentation answers reach production with a flag flip in the app and no assistant release. The flag is a rollout switch: the service enforces its limits whatever a request enables. Answers cite no pages of their own until the knowledge base is published (APP-1145, APP-1229); the links that go out are the GitHub pages of protocol-doc and the [Aragon contact form](https://www.aragon.org/get-assistance-form).

**Corpus.** The knowledge base is [`aragon/platform-doc`](https://github.com/aragon/platform-doc) (branch `development`), a private repository that is not vendored here: the index build fetches its current head into the git-ignored `.docs-corpus/` (one shallow fetch, refreshed on every build), so a documentation change reaches an environment with its next deploy — dev by running the "Assistant Development" workflow by hand (or with the next merge touching the assistant), production with its next release. Only knowledge pages make it into the index (`type` concept, capability, pattern, decision, principle, risk, reference, guide, example — never tasks, notes, opportunities or files without frontmatter), and only in the review states the environment's **corpus mode** publishes: `ready` is the product-owner-validated set (what the public docs site will publish) — pages the owner reviewed, which the base marks by removing `status: draft`, plus any page marked `status: ready`; `drafts` adds the pages still under review. A knowledge page in any other state (`blocked`, `candidate`, …) never publishes. The base's `internal/` folder (builder guidance, design principles, documentation maintenance, product opportunities) is left out whatever its pages' types and statuses, as the base's own workflow excludes it from user-facing content. Pages lose their frontmatter, title heading, `Open questions`/`Progress` sections and owner checklists; their links are rewritten for a reader outside the wiki — a relative link into `protocol-doc/` becomes the public GitHub page of that file (`src/docs/corpus.ts`, `protocolDocPublicBaseUrl`, one constant to move to a developer portal later), any other relative link keeps its text only (an image its alt text), absolute links stay. The protocol-doc submodule is never read (the fetch leaves it empty).

Every environment builds the index and answers from `drafts` (`docsCorpus` in `src/lib/config.ts`): the product owner considers the draft content correct and only its wording unreviewed, so the chatbot may use it, while the public docs site shows the reviewed (`ready`) pages only.

**Index build.** `pnpm build:docs-index` (part of `pnpm build` and `pnpm dev`) cuts the pages into passages (one per level-two section, sub-split when long, each prefixed with its area › page › section breadcrumb and the page `summary:`), embeds them through the AI Gateway (`voyage/voyage-4`, about a cent for the whole corpus) and writes `src/docs/generated/docsIndex.js` — git-ignored, imported by the bundle. An unchanged corpus is not re-embedded (the module carries the corpus hash). Without `AI_GATEWAY_API_KEY` the index is built full-text only, which is fine locally and refused in CI (the deploy writes the key to `.env` before `vercel build`). The fetch uses the git credentials of the machine (`git ls-remote https://github.com/aragon/platform-doc.git` has to work without a prompt; a machine with SSH access only can map the URL: `git config --global url."git@github.com:".insteadOf https://github.com/`) or, when `DOCS_REPO_TOKEN` is set, that token — which is what CI does: `shared-deploy.yml` loads the bot's PAT (`ARABOT_PAT` in `kv_app_infra`) for the assistant build, build-time only. When the repository cannot be fetched a CI build fails, while a local build falls back to the cached checkout, then to the previous index, then to an empty one (documentation answers stay off), so `pnpm dev` works offline. `DOCS_CORPUS_DIR` points the build at a local checkout instead; nothing is fetched then.

**Runtime.** The index is loaded into an in-process Orama database on the first search of an instance; a search embeds the query, runs a hybrid (BM25 + vector) retrieval for 20 candidates, reranks them with `voyage/rerank-2.5-lite` and hands the best five passages to the model; a failing embedding or rerank call is reported to Sentry and the search degrades around it. Both calls carry the user's query and go only to providers that do not train on it; unlike the chat calls they are not held to zero data retention, which the voyage models do not offer on the gateway. The agent has two tools — `searchDocs` and `readDoc` (a whole page by path) — neither of which needs an approval, and it is asked to call them silently. A lookup belongs to the turn that made it: the route drops the documentation tool parts from the history of later turns, so the transcript the model re-reads holds the replies, not the passages behind them. Neither do the passages reach the widget: the route withholds the documentation tool outputs from the response (`src/chat/docsOutputFilter.ts`; the widget only needs the call to label its spinner), so a caller of the API gets the model's account of the documentation, not its pages. The model does not always comply, so `src/chat/docsNarrationFilter.ts` drops the sentence it writes right before a documentation tool call ("Let me look that up") from the stream, and the widget shows one spinner from the send until the answer starts streaming, through every tool call in between, instead of a blank bubble. Every search logs a `searchDocs` step (latency, hit count, top score, corpus mode; never the query).

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
| development | every merge to `main` touching the assistant, and manual runs of the "Assistant Development" workflow (rebuilds the index from the current knowledge base) | `https://dev.assistant.aragon.org` |
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
6. **GitHub**: give the bot account behind `ARABOT_PAT` (`kv_app_infra`) read access to `aragon/platform-doc` — the deploy workflow fetches the knowledge base with it — and review required checks after the CI paths filters (skipped jobs report as passing).

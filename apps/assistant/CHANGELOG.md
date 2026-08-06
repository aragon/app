# @aragon/assistant

## 0.2.0

### Minor Changes

- [#1255](https://github.com/aragon/app/pull/1255) [`3e7c9fd`](https://github.com/aragon/app/commit/3e7c9fd62afdfd79616e98e319b1baf2b303a037) Thanks [@tyhonchik](https://github.com/tyhonchik)! - Rework the assistant backend into a tool-calling agent: one streamed `/chat` turn with an approval-gated `createLinearTicket` tool, replacing the classify/extract/preview pipeline and the `/issues` endpoints.

- [#1222](https://github.com/aragon/app/pull/1222) [`36c1fc4`](https://github.com/aragon/app/commit/36c1fc44d7a3ca3759d8f7d1c4c4fc1046287c0b) Thanks [@tyhonchik](https://github.com/tyhonchik)! - Scaffold the assistant service: Hono app with /health endpoint and CORS allowlist, per-environment config, Vercel project wiring (preview/dev/production deploys) and the Version-PR release flow

- [#1224](https://github.com/aragon/app/pull/1224) [`0c52e23`](https://github.com/aragon/app/commit/0c52e2351022a4a99ef2d3045dcec234179efb9d) Thanks [@tyhonchik](https://github.com/tyhonchik)! - Add the support-chat intake feature: streaming /chat pipeline (intent classification, field extraction, live collected-fields summary, optional email), idempotent /issues creation in Linear with attachment transfer at creation time, client-direct file uploads to Vercel Blob (token/confirm/delete endpoints, server-side magic-byte validation at confirm, daily orphan-cleanup cron), per-IP rate limiting via Upstash, structured step logs with Sentry, runtime env delivery for Vercel deployments and preview CORS narrowed to the aragon-app scope

### Patch Changes

- [#1242](https://github.com/aragon/app/pull/1242) [`4977e3e`](https://github.com/aragon/app/commit/4977e3e565c58842853835796a0a040e28cb5b75) Thanks [@tyhonchik](https://github.com/tyhonchik)! - Move the static Linear ticket texts into chat/prompts/issueTexts.ts so all service copy lives under chat/prompts/

- [#1242](https://github.com/aragon/app/pull/1242) [`4977e3e`](https://github.com/aragon/app/commit/4977e3e565c58842853835796a0a040e28cb5b75) Thanks [@tyhonchik](https://github.com/tyhonchik)! - Turn/size-limit fixed replies point users to the actual "Prepare ticket" button instead of the removed "Create ticket"

- Updated dependencies [[`3e7c9fd`](https://github.com/aragon/app/commit/3e7c9fd62afdfd79616e98e319b1baf2b303a037), [`0c52e23`](https://github.com/aragon/app/commit/0c52e2351022a4a99ef2d3045dcec234179efb9d), [`36c1fc4`](https://github.com/aragon/app/commit/36c1fc44d7a3ca3759d8f7d1c4c4fc1046287c0b), [`0c52e23`](https://github.com/aragon/app/commit/0c52e2351022a4a99ef2d3045dcec234179efb9d)]:
    - @aragon/assistant-contracts@0.2.0

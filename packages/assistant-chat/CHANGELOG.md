# @aragon/assistant-chat

## 0.3.0

### Minor Changes

- [#1255](https://github.com/aragon/app/pull/1255) [`3e7c9fd`](https://github.com/aragon/app/commit/3e7c9fd62afdfd79616e98e319b1baf2b303a037) Thanks [@tyhonchik](https://github.com/tyhonchik)! - Rebuild the assistant-chat widget on assistant-ui with the agentic backend: streamed transcript and a `createLinearTicket` approval card (draft → Create/Dismiss → success or retry), a greeting screen with intake shortcuts and request history, and our own composer.

## 0.2.0

### Minor Changes

- [#1242](https://github.com/aragon/app/pull/1242) [`4977e3e`](https://github.com/aragon/app/commit/4977e3e565c58842853835796a0a040e28cb5b75) Thanks [@tyhonchik](https://github.com/tyhonchik)! - Chat escape hatches point to support@aragon.org instead of the support portal; all widget copy is centralized in a single copy module

- [#1231](https://github.com/aragon/app/pull/1231) [`903fbfe`](https://github.com/aragon/app/commit/903fbfe7cf3b5c3112621c028830b8aace8c4cde) Thanks [@tyhonchik](https://github.com/tyhonchik)! - Add the assistant-chat widget package: side-drawer support chat backed by the assistant service, with live collected-fields summary, file attachments (picker, drag-and-drop, paste) with upload progress, explicit ticket creation with retry, session rotation after a created issue and a monitoring DI seam for the host app.

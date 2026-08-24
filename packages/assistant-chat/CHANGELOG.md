# @aragon/assistant-chat

## 0.4.1

### Patch Changes

- [#1324](https://github.com/aragon/app/pull/1324) [`c92a3c9`](https://github.com/aragon/app/commit/c92a3c912d24c50f57cf97b2f75acf156c2da7c0) Thanks [@tyhonchik](https://github.com/tyhonchik)! - Update dependencies (React 19.2.8, Sentry 10.70, viem 2.55.13, wagmi 3.7.6, Reown AppKit 1.8.23, Next.js 16.3) and fix the transfer-asset proposal action crashing when the amount field is cleared — viem now rejects empty strings in parseUnits

## 0.4.0

### Minor Changes

- [#1303](https://github.com/aragon/app/pull/1303) [`acb5001`](https://github.com/aragon/app/commit/acb5001b3153ca47e34e4c718ffd070bf7b25e20) Thanks [@tyhonchik](https://github.com/tyhonchik)! - Iterate the support assistant on design feedback: the panel header carries the Aragon mark and names the request being drafted or created, the ticket card leads with the ticket title instead of a "Review your request" label, spent drafts collapse into a quiet line, past requests move from the greeting into their own view reached from under the composer, and the mail escape hatch becomes a footnote there. The transcript opens with a time divider, and the navigation trigger withdraws while the panel is open — the panel collapses through its own chevron.

### Patch Changes

- [#1303](https://github.com/aragon/app/pull/1303) [`acb5001`](https://github.com/aragon/app/commit/acb5001b3153ca47e34e4c718ffd070bf7b25e20) Thanks [@tyhonchik](https://github.com/tyhonchik)! - Send the name and type of an attachment with the conversation (never its bytes), so the assistant can say where a file arrived. The panel header now carries the exact height of the app's navigation bar, so the two bottom borders meet in a line rather than a step, and every control in the widget points at the cursor.

## 0.3.0

### Minor Changes

- [#1255](https://github.com/aragon/app/pull/1255) [`3e7c9fd`](https://github.com/aragon/app/commit/3e7c9fd62afdfd79616e98e319b1baf2b303a037) Thanks [@tyhonchik](https://github.com/tyhonchik)! - Rebuild the assistant-chat widget on assistant-ui with the agentic backend: streamed transcript and a `createLinearTicket` approval card (draft → Create/Dismiss → success or retry), a greeting screen with intake shortcuts and request history, and our own composer.

## 0.2.0

### Minor Changes

- [#1242](https://github.com/aragon/app/pull/1242) [`4977e3e`](https://github.com/aragon/app/commit/4977e3e565c58842853835796a0a040e28cb5b75) Thanks [@tyhonchik](https://github.com/tyhonchik)! - Chat escape hatches point to support@aragon.org instead of the support portal; all widget copy is centralized in a single copy module

- [#1231](https://github.com/aragon/app/pull/1231) [`903fbfe`](https://github.com/aragon/app/commit/903fbfe7cf3b5c3112621c028830b8aace8c4cde) Thanks [@tyhonchik](https://github.com/tyhonchik)! - Add the assistant-chat widget package: side-drawer support chat backed by the assistant service, with live collected-fields summary, file attachments (picker, drag-and-drop, paste) with upload progress, explicit ticket creation with retry, session rotation after a created issue and a monitoring DI seam for the host app.

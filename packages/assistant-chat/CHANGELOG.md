# @aragon/assistant-chat

## 0.5.1

### Patch Changes

- [#1394](https://github.com/aragon/app/pull/1394) [`c6e3d70`](https://github.com/aragon/app/commit/c6e3d7045295b954e619659e285ef43723c85eff) Thanks [@tyhonchik](https://github.com/tyhonchik)! - Show a spinner in the support chat while the assistant looks through the documentation. The documentation tools run silently — no text streams around them — so without it the reply was a blank bubble until the answer arrived.

- [#1394](https://github.com/aragon/app/pull/1394) [`c6e3d70`](https://github.com/aragon/app/commit/c6e3d7045295b954e619659e285ef43723c85eff) Thanks [@tyhonchik](https://github.com/tyhonchik)! - Fix three support chat glitches from the feedback round. Links in a reply were plain text: the markdown renderer now enables GitHub-flavored markdown, so a bare URL is a clickable link like a labelled one (both open in a new tab), the rare table renders as one instead of a run of pipes, and images are not rendered at all (a reply never needs one, and an image would make the browser fetch a URL of the model's choosing). A documentation lookup showed two spinners at once (assistant-ui keeps the empty-message spinner up next to a trailing tool part, and each running tool part drew its own) and none while the model read the results: the reply now shows a single spinner from the send until the answer starts streaming, through every lookup in between. And a message longer than the service accepts used to leave as usual and come back as a generic failure: the composer now stops at the limit (8,000 characters, a longer paste is clipped) and shows the count once a message gets close to it.

- [#1415](https://github.com/aragon/app/pull/1415) [`c020ff9`](https://github.com/aragon/app/commit/c020ff97c172f59165d947842c74f6f99b962d8f) Thanks [@tyhonchik](https://github.com/tyhonchik)! - Update dependencies (Next.js 16.3.5, React 19.3, Sentry 10.74, viem 2.56, wagmi 3.7.7, WalletConnect 2.25, assistant-ui 0.15, isomorphic-dompurify 4), bump pnpm to 11.27, and lift gov-ui-kit's sanitize-html to 2.17.7, closing two XSS advisories in proposal body rendering

## 0.5.0

### Minor Changes

- [#1350](https://github.com/aragon/app/pull/1350) [`242489f`](https://github.com/aragon/app/commit/242489f2143c8d530f18d57dde73345509e07e23) Thanks [@tyhonchik](https://github.com/tyhonchik)! - Iterate the support assistant on the second round of design feedback: the header and composer controls (new chat, collapse, back, add attachment) become gov-ui-kit buttons and drop their tooltips, the "Email support" escape hatch follows the app's plain link style — no underline, an external-link icon, opening in a new tab — and typing in a fresh chat no longer bounces the layout: the suggestion chips retire through visibility instead of unmounting. The ticket card gains a bottom margin so text following it in the same message no longer sits against its edge, and nothing links to Linear anymore — the success card and the past-requests view quote the ticket reference instead of linking out to a workspace the user has no access to.

### Patch Changes

- [#1358](https://github.com/aragon/app/pull/1358) [`c1cdcf9`](https://github.com/aragon/app/commit/c1cdcf91c64c156311576acf7c67f13eecc8a9d1) Thanks [@tyhonchik](https://github.com/tyhonchik)! - Update dependencies (gov-ui-kit 2.11.2, next 16.3.2, Sentry 10.71, react-query 5.102, deepmerge-ts 8 closing its stack-exhaustion advisory), bump pnpm to 11.24, and hold the @assistant-ui/tap transitive at 0.9.12 — 0.9.13+ loops forever under the exact-pinned @assistant-ui/react 0.14.27.

- [#1350](https://github.com/aragon/app/pull/1350) [`242489f`](https://github.com/aragon/app/commit/242489f2143c8d530f18d57dde73345509e07e23) Thanks [@tyhonchik](https://github.com/tyhonchik)! - Give the assistant's new `timeout` error code its own wording, so a model call that stalled past the service's cap reads as "the assistant took too long — send your message again" instead of the generic failure text.

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

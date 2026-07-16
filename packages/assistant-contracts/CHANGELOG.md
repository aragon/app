# @aragon/assistant-contracts

## 0.2.0

### Minor Changes

- [#1222](https://github.com/aragon/app/pull/1222) [`36c1fc4`](https://github.com/aragon/app/commit/36c1fc44d7a3ca3759d8f7d1c4c4fc1046287c0b) Thanks [@tyhonchik](https://github.com/tyhonchik)! - Scaffold the assistant contracts package: shared zod schemas between the assistant service and the assistant-chat widget, starting with the /health response contract

- [#1224](https://github.com/aragon/app/pull/1224) [`0c52e23`](https://github.com/aragon/app/commit/0c52e2351022a4a99ef2d3045dcec234179efb9d) Thanks [@tyhonchik](https://github.com/tyhonchik)! - Add the support-chat contracts: chat request/message schemas, collected-fields data part (required fields: summary and description — email is optional), issue create request/response, file confirm/delete requests and upload response, shared error shape, hard limits and the pinned Phase-2 docs-search result shape

### Patch Changes

- [#1224](https://github.com/aragon/app/pull/1224) [`0c52e23`](https://github.com/aragon/app/commit/0c52e2351022a4a99ef2d3045dcec234179efb9d) Thanks [@tyhonchik](https://github.com/tyhonchik)! - Build the package to `dist/` (tsup CJS/ESM/types) so Node runtimes such as Vercel can require it; TypeScript source under `src/` is no longer the package entrypoint

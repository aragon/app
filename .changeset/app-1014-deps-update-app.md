---
"@aragon/app": patch
"@aragon/assistant-chat": patch
---

Update dependencies (gov-ui-kit 2.11.2, next 16.3.2, Sentry 10.71, react-query 5.102, deepmerge-ts 8 closing its stack-exhaustion advisory), bump pnpm to 11.24, and hold the @assistant-ui/tap transitive at 0.9.12 — 0.9.13+ loops forever under the exact-pinned @assistant-ui/react 0.14.27.

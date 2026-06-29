---
name: error-and-monitoring
description: How to report errors/info to Sentry — route through monitoringUtils, classify by what a failure IS, don't dress expected/external/not-found as bugs.
globs: src/shared/utils/monitoringUtils/**, src/shared/utils/errorUtils/**, src/shared/utils/responseUtils/**, src/shared/api/aragonBackendService/**, src/shared/components/transactionDialog/**, src/**/pageError/**, src/**/errorBoundary/**, src/**/globalError/**, src/**/error.tsx, src/**/global-error.tsx, src/**/*MetadataUtils/**
kind: rule
---

# error-and-monitoring

`monitoringUtils` (`src/shared/utils/monitoringUtils/monitoringUtils.ts`) is the **only** Sentry boundary. Never import `@sentry/*` in feature code — go through `logError`, `logMessage`, `identifyUser`.

## When a feature can fail, classify what the failure IS

- **Real bug** (our code/contract broken, actionable) → let it surface: throw to the nearest error boundary or `monitoringUtils.logError(error, { context })` with enough context to debug. This is the only tier that should reach error-level alerts.
- **Expected user/wallet behaviour** (rejection, insufficient balance, not connected, WalletConnect stale session) and **non-actionable external** failures (ENS off-chain/CCIP gateway) → NOT a bug. Don't dress it as an error, but don't silently swallow it either. Report normally; `beforeSend` auto-tags `noise_class=expected` and demotes it to `info`, so it stays searchable per user but never alerts. New phrase / EIP-1193 code not yet caught? Add it to `expectedErrorPatterns` / `nonActionableExternalPatterns` / `expectedProviderErrorCodes`.
- **Backend/RPC/proxy failure** (502, RPC error, HTML instead of JSON) → real signal, not our code; auto-tagged `noise_class=infra`. Keep visible, don't retry-swallow.
- **Resource gone / stale link / bot URL** (404, removed plugin) → render a clean not-found state and do NOT report. Gate logging with `AragonBackendServiceError.isExpectedNotFoundError(error)`.

## Principles

- **Route, don't hide.** Only zero-signal third-party junk (browser extensions, mail crawlers, WebView DOM serialization) is dropped at source. Anything that could aid an investigation stays in Sentry, tagged — never `ignoreErrors` a real or user error.
- **info vs error.** `logMessage(name, { level: 'info' | 'warning' })` for non-bug signals; `logError` only for actual errors. Don't re-raise an expected event as an error to "make it visible" — it's already kept and searchable by `user.id:0x...`.
- **Self-explanatory events.** Pass `context`/tags that let someone debug from the event alone.
- **Never `JSON.stringify` an error/DOM/cyclic object.** Use `errorUtils.serialize` (WeakSet-safe); for backend payloads use `responseUtils.safeJsonParseForResponse`.

## Canon
- `monitoringUtils.ts` — `logError` / `logMessage` / `identifyUser` / `beforeSend` (the `noise_class` taxonomy + info demotion).
- `aragonBackendServiceError.ts` — `isExpectedNotFoundError` (`notFound` + `pluginNotFound`).
- `pageError.tsx` — suppresses expected not-found, reports the rest.

# Lido Money Machine — production readiness checklist

The MVP shipped on `money-mchine-dashboard` (note: branch name has a typo
which is preserved for git history continuity) — and any branch that includes
`infra/lmm-demo/`, `src/modules/flow/demo/`, `src/modules/flow/components/lidoMoneyMachine/`,
or `src/shared/lidoPreview/`) is **demo-only**.  This document is the
delta between the demo branch and a real production rollout that talks to
the Aragon-hosted Envio + the live mainnet Capital Router primitives.

Every line item below maps back to a `LMM_DEMO_HACK` annotation in the
source — grep for them once you start the migration:

```bash
rg LMM_DEMO_HACK app/src capital-flow-indexer/src
```

## P0 — required before any production demo

| Area                                | MVP                                                                           | Production                                                                                                       |
| ----------------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Data source**                     | Local Envio at `localhost:8080` / VM Hasura behind host nginx + Cloudflare    | Aragon-hosted Envio (single endpoint for all flow data).                                                          |
| **DAO query override**              | `useDao`, `useDaoByEns`, `useDaoPolicies`, `useDaoPermissions` short-circuit  | Remove `tryLmmDao*Override()` calls; the Aragon Backend Service must return the LMM DAO + dispatcher policy.     |
| **Synthetic policy**                | `buildPoliciesFromManifest()` synthesizes one `IDaoPolicy`                    | Backend service emits the real policy + sub-strategies; mapper consumes them like any other multi-dispatch.      |
| **Dispatch tx flow**                | `LmmDemoDispatchDialog` writes via viem against Anvil                          | `ProductionDispatchDialog` (wagmi `useSendTransaction`) — keep the routing branch but force it to the prod path. |
| **Manifest**                        | `public/lmm-manifest.json` or `https://<vm>/manifest.json`                     | Drop entirely — addresses come from the backend service or from the chain itself via `inspect()`.                |
| **Cheats menu**                     | `LmmCheatsMenu` (warp time, top up balances, etc)                              | Remove. The production app must never expose these affordances.                                                  |
| **Topology view**                   | `LmmPolicyTopology` runs `inspect()` from the browser                          | Same component is fine for production *if* the RPC is configured per-network; otherwise pre-compute server-side.  |
| **Demo banner / safety guards**     | `LmmDemoBanner`, `assertForkRpc`, `LMM_RPC_ALLOWLIST`                          | Remove `LmmDemoBanner` mounts.  Keep `assertForkRpc` only behind the demo flag.                                  |

## P1 — required before the live indexer rollout

| Area                                | MVP                                                                | Production                                                                                                                            |
| ----------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Indexer event handlers**          | Embedded-strategy registration in `capital-flow-indexer` (this fork) | Port the new event handlers (`DAOFactory`, `DAO`, `DispatcherPlugin`, `WrapDispatchStrategy`, `UniV2LiquidityDispatchStrategy`, `GatedCowSwapDispatchStrategy`, `StreamUntilBudget`, `FullBudget`, `PriceFloorGate`, `EpochProvider`, swap orders) into Aragon's hosted indexer. |
| **Schema**                          | `Strategy`, `Budget`, `Gate`, `EpochProvider`, `SwapOrder` types   | Same schema — apply as a migration on the hosted indexer.                                                                              |
| **ABI shipping**                    | `capital-flow-indexer/abis/*.json` shipped locally                  | Move to a shared `@aragon/contracts-abi` package or fetch from a versioned releases endpoint.                                          |
| **Action decoder**                  | New kinds: `wrap`, `univ2AddLiquidity`, `swapPresign`, `approve`   | Keep — they're production-shaped (no Anvil-specific code).                                                                             |
| **Plugin repo whitelist**           | Demo plugin IDs hardcoded in `constants.ts`                         | Replace with the real repository addresses once `OSX-378` ships and the plugins are deployed.                                          |

## P2 — UI polish before the public preview

| Area                                | MVP                                                                | Production                                                                                          |
| ----------------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| **Multi-dispatch chain rendering**  | Embedded `Strategy[]` chips with budget/gate/epoch sub-chips        | Keep — applies to any dispatcher, demo or production.                                                |
| **Swap chart markers**              | Cyan paired markers + skip markers in `FlowPolicyChart`             | Keep — production benefit, not demo-specific.                                                       |
| **`FlowPolicyTree` MULTI_DISPATCH** | Renders `LmmPolicyTopology` for the demo DAO; SVG tree elsewhere   | Render `LmmPolicyTopology` for every multi-dispatch policy once preview-lib supports prod naming.    |
| **Recipients aggregate**            | Reads `RecipientAggregate` from envio                              | Keep — already production-shaped.                                                                   |
| **Activity feed**                   | Reads `PolicyExecution`/`PolicyEvent`                              | Keep.                                                                                               |
| **Effective `now` clock**           | `useFlowNow()` returns `chainNowMs` (Anvil) when demo is on        | `useFlowNow()` becomes a no-op (returns `Date.now()`); `chain-now` hack drops out of the bundle.    |
| **Orchestrator live snapshot**      | `useLmmLiveSnapshot()` polls Anvil to fill `liveSnapshot`          | Indexer emits `OrchestratorSnapshot`; `FlowDataProvider` reads it from the regular query.            |
| **Destinations table**              | `flowRecipientsTable` falls back to manifest-derived rows          | Indexer emits `recipient` on `ExecutionTransfer`; the table merges them automatically.               |
| **Money-flow graph**                | `buildMoneyFlowGraph()` derives edges from in-browser `simulate()` | Indexer materialises `MoneyFlowEdge` (or directional `ExecutionTransfer`); React Flow renders that.  |
| **Live state Card**                 | `StatusView` reads `liveSnapshot` directly                          | Bind `StatusView` props to the indexed snapshot; component itself stays.                             |

## Cleanup checklist (one-shot)

When the production setup is ready, the following deletions complete the
migration:

1. `app/src/modules/flow/demo/` — entire directory (config, override,
   safety, banner).
2. `app/src/modules/flow/components/lidoMoneyMachine/` — entire directory
   (vendored UI).
3. `app/src/shared/lidoPreview/` — entire directory (vendored library).
   * If `LmmPolicyTopology` was extended to non-demo policies in P2,
     keep it but rename + move out of `lidoMoneyMachine/`.
4. `app/src/modules/capitalFlow/dialogs/dispatchDialog/lmmDemoDispatchDialog.tsx`.
5. `app/infra/lmm-demo/` — entire directory.
6. `NEXT_PUBLIC_LMM_*` env vars from Vercel preview + every `.env*`.
7. Re-route `DispatchTransactionDialog` to not import `LmmDemoDispatchDialog`.
8. Remove `LmmDemoBanner` mounts from `flowOverviewPageClient.tsx` and
   `flowPolicyDetailPageClient.tsx`.
9. Drop `useIsLmmDemoDao` import from `dispatchTransactionDialog.tsx` and
   `lmmDaoOverride` from each `useDao*` hook.
10. Re-run typecheck + lint and a smoke test against an Aragon production
    DAO to confirm nothing references the deleted modules.

## Acceptance gates

* `pnpm test --filter app -- --testPathPattern 'flow|capitalFlow'` green.
* `pnpm lint --filter app` green.
* `pnpm typecheck --filter app` green.
* Manual smoke against a production DAO: `/flow` overview loads, no
  console errors, no `LMM_DEMO_*` references in network or runtime logs.
* Manual smoke against the demo branch on a preview URL: dispatcher
  policy detail page shows topology + cheats menu + demo banner.

## Risk log

* **Vendored components depend on `@xyflow/react` + `@dagrejs/dagre`** —
  these dependencies now ship in production bundles even when the demo
  flag is off.  Consider tree-shaking via a dynamic import for
  `LmmPolicyTopology` (already a client-only component).
* **`viem` direct RPC use in `actions.ts`** — never imported from
  production code paths today, but a future refactor that lifts
  `dispatchAction` into a shared helper would inadvertently ship a
  hardcoded Anvil deployer private key.  The constant is annotated; the
  removal step above keeps it isolated.
* **`assertForkRpc` allowlist** — must be reviewed every time the demo
  VM is rehosted.  Forgetting to update it surfaces as a hard error in
  the dialog, not as a silent fall-through to a real chain.

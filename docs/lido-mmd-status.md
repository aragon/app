# Lido MMD demo — live status

> Living doc for the `money-mchine-dashboard` branch (note: typo in the
> branch name is preserved deliberately).  Update the table
> below whenever a chunk lands so parallel agents (UI polish, indexer
> follow-ups, infra) can grab the next unlocked task without re-reading
> the whole plan.

## Branches involved

| Repo                       | Branch                       | Purpose                                       |
| -------------------------- | ---------------------------- | --------------------------------------------- |
| `aragon/app`               | `money-mchine-dashboard`     | UI + demo override layer (note: branch name has a typo, kept for git history continuity) |
| `aragon/capital-flow-indexer` | branch in this workspace | Envio handlers + schema for the new CR primitives |
| `aragon/dao-launchpad`     | `f/lido-demo`                | Forge/Anvil deployment, preview lib + UI (vendored) |

## Status

| Track / task                                                                                         | Owner agent | State         | Notes |
| ---------------------------------------------------------------------------------------------------- | ----------- | ------------- | ----- |
| VM stack: docker-compose (anvil persistent, envio + postgres + hasura), nginx.lmm-demo.conf snippet for host nginx, init-demo.sh, vm-README.md | demo-infra  | **done**      | `infra/lmm-demo/vm/`. Persistent anvil via `--state`. Cloudflare Flexible-SSL fronts host nginx (no TLS on VM); nginx alias serves manifest from `/srv/lmm/`. |
| `capital-flow-indexer` ABIs                                                                          | indexer     | **done**      | DAOFactory / DAO / PSP-InstallationApplied + Dispatcher/Strategies/Budgets/Gate/Epoch/CowSwap/MockOracle. |
| `capital-flow-indexer` schema                                                                        | indexer     | **done**      | `Strategy`, `Budget`, `Gate`, `EpochProvider`, `SwapOrder` types; `PolicyExecution.strategyIndex/strategy/skipped/skippedReason`. |
| `capital-flow-indexer` EventHandlers                                                                 | indexer     | **done**      | DAOCreated/MetadataSet/InstallationApplied/DispatchHandled/StrategyFailed/CowSwapOrderPosted/PriceFloorGate.*/StreamUntilBudget.*/EpochProvider.*. |
| `capital-flow-indexer` actionDecoder                                                                 | indexer     | **done**      | `wrap`, `addLiquidity`, `setPreSignature`, `approve` decoded; internal kinds filtered out of outbound transfers. |
| Vendored preview-lib (`app/src/shared/lidoPreview/`)                                                 | demo-ui     | **done**      | Source: `dao-launchpad/lido/preview/lib/src`. Refresh procedure in `infra/lmm-demo/README.md`. |
| Vendored preview-ui (`app/src/modules/flow/components/lidoMoneyMachine/`)                            | demo-ui     | **done**      | `TopologyView`, `NodeDetails`, `StatusPanel`, `DispatchDialog`, `ActionsMenu`, `useStatus`, `actions`, etc. |
| App deps `@xyflow/react` + `@dagrejs/dagre`                                                          | demo-ui     | **done**      | Added via `pnpm add`. |
| `lmmDemoConfig.ts` — flag, manifest hook, RPC consts                                                 | demo-ui     | **done**      | `NEXT_PUBLIC_LMM_DEMO_MODE`, `useLmmManifest`, `LMM_RPC_ALLOWLIST`. |
| `useDao*` override hooks                                                                             | demo-ui     | **done**      | `tryLmmDao*Override()` short-circuits Aragon backend when DAO matches manifest. |
| `flowPolicyTree.tsx` MULTI_DISPATCH → `LmmPolicyTopology`                                            | demo-ui     | **done**      | Production policies still render the SVG tree. |
| `flowPolicyChart.tsx` — paired swap markers + skipped marker + legend                                | demo-ui     | **done**      | New colors in `flowEventStyles.ts`. |
| `flowMultiDispatchCard.tsx` — embedded `Strategy[]` chips with Budget/Gate/Epoch sub-chips           | demo-ui     | **done**      | Falls back to legacy chain for non-LMM orchestrators. |
| `envioFlowMapper.ts` — Strategy/Budget/SwapOrder, cooldown from StreamUntilBudget, embedded-chain    | demo-ui     | **done**      | New `IFlowEmbeddedStrategy[]` on `IFlowOrchestrator`. |
| `useEnvioFlowData.ts` — GraphQL fragments for new entities                                           | demo-ui     | **done**      | `EXECUTION_FIELDS` fragment + `strategies`, `budget`, `gate`, `epochProvider`, `swapOrders`. |
| `DispatchTransactionDialog` → `LmmDemoDispatchDialog` for demo DAOs                                  | demo-ui     | **done**      | Routes via `useIsLmmDemoDao(policy.daoAddress)`; production path unchanged. |
| Policy page header — `LmmCheatsMenu` + `LmmDemoBanner`                                               | demo-ui     | **done**      | `LMM_DEMO_MODE` gate; menu wraps `warpAction`/`topUpStEth`/etc. |
| Safety guards — `assertForkRpc`, `manifestFingerprintCheck`, `LmmDemoBanner`                          | demo-ui     | **done**      | `safety.ts` exports; banner mounted on overview + policy pages. |
| `infra/lmm-demo/README.md` — local-first runbook                                                     | demo-infra  | **done**      | Includes manifest symlink trick + cheats walkthrough. |
| `docs/lido-mmd-production-readiness.md` — migration checklist                                        | demo-infra  | **done**      | One-shot deletion list at the bottom. |
| Vercel preview env vars                                                                              | demo-infra  | **done**      | Example values in `infra/lmm-demo/vercel.env.example`; deployer needs to paste them into the Vercel preview-branch env. |
| E2E smoke + production-DAO regression                                                                | qa          | **done**      | `pnpm test` → 1620/1620 passing; `pnpm lint:check` → 0 errors, 3 vendored-code warnings; new `flow/demo/safety.test.ts` covers the RPC allowlist + fingerprint check. Manual rehearsal still recommended once the VM is up (see runbook in `infra/lmm-demo/README.md`). |

## Dashboard polish hacks (Phase 1–7)

Every workaround landed by the "LMM demo dashboard polish" pass is tagged
`LMM_DEMO_HACK: <slug>` in code so the prod cleanup `grep` stays cheap.
The table below maps each slug to where it lives, what it does in the
demo, and what should replace it in production.

| Slug                       | Where                                                                                                  | What it does in demo                                                                                          | Prod replacement                                                                                                          | Priority |
| -------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | -------- |
| `live-snapshot-rpc`        | `src/modules/flow/demo/useLmmLiveSnapshot.ts`, `flowDataProvider.tsx`                                  | Polls Anvil directly via `inspect()`+`useStatus`; exposes legs/budgets/gate via `FlowDataContext.liveSnapshot` | Emit an `OrchestratorSnapshot` entity from `capital-flow-indexer` and consume it through the regular flow query           | high     |
| `pending-from-live`        | `src/modules/flow/providers/flowSelectors.ts` (`selectPolicyPending`)                                  | Merges `pending.amount` from `liveSnapshot.budget()` reads into the selector output                           | Same entity as above; selector falls back to indexer-computed pending                                                     | high     |
| `chain-now`                | `src/modules/flow/demo/useLmmChainNow.ts`, `flowDataProvider.tsx`, `useFlowNow`                        | Replaces `Date.now()` with the fork's latest-block timestamp so cooldown pills/chart match Anvil              | No-op outside demo (`useFlowNow` already returns `Date.now()` when `chainNowMs` is null)                                  | low      |
| `destinations-from-manifest` | `src/modules/flow/components/flowRecipientsTable/flowRecipientsTable.tsx`                              | Synthesises destination rows (DAO, LP recipient, CowSwap settlement, LDO buyback) from `lmm-manifest.json`    | Emit a `recipient` (or `flowDirection`) column on `ExecutionTransfer` so the table can read destinations from the indexer | medium   |
| `synthetic-policy-installed` | `src/modules/flow/utils/envioFlowMapper.ts` (`mapPolicy`)                                              | Always injects an `INSTALLED` event so the chart shows the marker even if the handler missed it               | Indexer guarantees a `PolicyInstalled` event per policy; remove the synthetic event                                       | low      |
| `money-flow-from-simulate` | `src/modules/flow/components/lidoMoneyMachine/buildMoneyFlowGraph.ts`, `TopologyView.tsx`              | Builds the "Money flow" graph from the in-browser `simulate()` predictor instead of indexed transfers         | Materialise `MoneyFlowEdge` (or `ExecutionTransfer` w/ direction) and render from the GraphQL response                    | medium   |

## How to claim a task

1. Read the row above + the related `LMM_DEMO_HACK` comments in code.
2. Update the `State` cell to `claimed by <agent name>` before editing.
3. Mark `done` when the change merges into `money-mchine-dashboard`.
4. If the task spawns follow-ups, add them as new rows so others can
   pick them up.

## Open questions

* Should `LmmPolicyTopology` be lazy-loaded (`dynamic()`) when demo mode
  is off?  It currently pulls in `@xyflow/react` + `@dagrejs/dagre` into
  the production bundle even though it never renders.  See the risk log
  in production-readiness.md.
* Do we want a "Skipped reason" badge on dispatcher cards (separate from
  the chart timeline marker)?  Today the reason is only visible on the
  detail chart tooltip.
* Manifest fingerprint check is wired but no UI surface yet — should it
  block writes or only warn?  Right now it's informational.

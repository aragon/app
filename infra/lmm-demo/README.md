# Lido Money Machine demo — local-first runbook

This directory ships the **demo-only** plumbing required to render Jordi's
Lido Money Machine setup inside the Aragon app's `/flow` dashboard.  Every
file here is annotated with `LMM_DEMO_HACK`: nothing here ships to
production, the goal is to make a leads/Lido presentation feel like the
production app already does this.

Two deployment shapes are supported:

* **Local-first** — everything runs on the presenter's laptop.  This is
  what you'll use to iterate on the UI without touching the VM.  See
  [§ Local quickstart](#local-quickstart).
* **VM** — a single host runs Anvil + Envio + Hasura + Caddy and the app
  reads from `https://<DOMAIN>` via the Vercel preview URL.  See
  [`vm/vm-README.md`](./vm/vm-README.md).

Both shapes share the same data model: a manifest JSON describing the
demo DAO + its plugins, plus an Envio GraphQL endpoint indexed against the
same chain.

---

## TL;DR

```bash
# In dao-launchpad@f/lido-demo
just anvil               # terminal 1: anvil mainnet fork on :8545
just demo-up             # terminal 2: deploys CR slice + LMM DAO

# In capital-flow-indexer (this repo's sibling)
cp .env.example .env     # set ENVIO_RPC_URL=http://localhost:8545
pnpm envio dev           # terminal 3: indexer + hasura on :8080

# In app/
cp .env.example .env.local
echo 'NEXT_PUBLIC_LMM_DEMO_MODE=1'                            >> .env.local
echo 'NEXT_PUBLIC_LMM_MANIFEST_URL=/lmm-manifest.json'        >> .env.local
echo 'NEXT_PUBLIC_FLOW_INDEXER_ENDPOINT=http://localhost:8080/v1/graphql' >> .env.local
echo 'NEXT_PUBLIC_LMM_RPC_URL=http://localhost:8545'          >> .env.local

# Symlink the just-generated manifest into /public so the app can fetch it.
ln -sf ../../dao-launchpad/lido/preview/script/demo/manifest.json \
       public/lmm-manifest.json

pnpm dev                 # terminal 4: open /dao/ethereum-mainnet/<lmm-dao>/flow
```

The DAO address to navigate to is `manifest.lmm.dao` from the generated
`manifest.json`.

---

## Local quickstart

### Prerequisites

* `pnpm` 9+, Node.js 20+
* `foundry` (anvil, cast, forge) — `curl -L https://foundry.paradigm.xyz | bash`
* `just`
* A mainnet archive RPC URL for the Anvil fork (Alchemy / Infura).
  Export it as `MAINNET_RPC=https://...`.
* The three sibling repos checked out alongside `app/`:
  * `dao-launchpad` on branch `f/lido-demo`
  * `capital-flow-indexer` (this branch)

### 1. Start Anvil + deploy the demo

```bash
cd dao-launchpad
git checkout f/lido-demo
cd lido/preview
just demo-up                   # boots anvil, deploys CR + LMM DAO
```

`just demo-up` is idempotent — it tears down any previous fork before
deploying.  The final step writes `script/demo/manifest.json` with all
the addresses the UI needs.

### 2. Start the indexer

```bash
cd ../../../capital-flow-indexer
cp .env.example .env
# Edit .env:
#   ENVIO_RPC_URL=http://localhost:8545
#   ENVIO_CHAIN_ID=1
#   ENVIO_START_BLOCK=0
pnpm install
pnpm envio dev                 # serves GraphQL on http://localhost:8080
```

The indexer auto-discovers the demo's contracts via `DAOFactory.DAOCreated`
and `PluginSetupProcessor.InstallationPrepared` — no need to plug
addresses in by hand.

### 3. Run the app

```bash
cd ../app
pnpm install
cp .env.example .env.local
```

Append the LMM demo flags to `.env.local`:

```
NEXT_PUBLIC_LMM_DEMO_MODE=1
NEXT_PUBLIC_LMM_MANIFEST_URL=/lmm-manifest.json
NEXT_PUBLIC_FLOW_INDEXER_ENDPOINT=http://localhost:8080/v1/graphql
NEXT_PUBLIC_LMM_RPC_URL=http://localhost:8545
```

Symlink the freshly-generated manifest so the dev server can serve it:

```bash
ln -sf ../../dao-launchpad/lido/preview/script/demo/manifest.json \
       public/lmm-manifest.json
```

Boot the app:

```bash
pnpm dev
```

Open `/dao/ethereum-mainnet/<manifest.lmm.dao>/flow` — you should see the
LMM DAO with the Money Machine dispatcher rendered as the only
multi-dispatch policy.  Click into the policy to see the React Flow
topology, the cheats menu, and the demo-mode banner.

### 4. Trigger dispatches

* **From the UI** — open the policy detail page → "Dispatch now" → the
  vendored `DispatchDialog` runs `simulate()` then `dispatch()` against
  the Anvil fork (no wallet required, Anvil is in `--auto-impersonate`).
* **From the cheats menu** — same UI, also exposes:
  * Warp +1 day / +7 days
  * Top up 100 stETH / 1000 LDO from the configured impersonated holders
  * Set ETH/USD price (opens/closes the PriceFloorGate)
  * Bump StreamUntilBudget target epoch
  * Settle the pending CoW order (mock settlement)
* **From the CLI** — `just demo-warp`, `just demo-dispatch`, etc. —
  defined in `dao-launchpad/lido/preview/justfile`.

---

## What the override does

When `NEXT_PUBLIC_LMM_DEMO_MODE=1` and the URL DAO address matches
`manifest.lmm.dao`:

| Hook / dialog                              | Production                        | Demo mode                                            |
| ------------------------------------------ | --------------------------------- | ---------------------------------------------------- |
| `useDao` / `useDaoByEns`                   | `aragonBackendService.getDao()`   | Envio `Dao` + manifest metadata                      |
| `useDaoPolicies`                           | Backend `getDaoPolicies()`        | One synthetic `IDaoPolicy` for the dispatcher        |
| `useDaoPermissions`                        | Backend `getDaoPermissions()`     | Synthetic admin set so the dispatch button is shown  |
| `DispatchTransactionDialog`                | wagmi `useSendTransaction()`      | Direct viem `writeContract()` against the Anvil RPC  |
| `FlowPolicyTree` (MULTI_DISPATCH branch)   | SVG tree from REST sub-router IDs | Vendored React Flow topology from preview-lib `inspect()` |
| Policy header / overview                   | —                                 | Demo banner + cheats menu                            |

Everything else (charts, recipients, history, navigation) is the
unchanged production code reading from the Envio indexer.

## Safety guards

* `assertForkRpc(rpcUrl)` (`src/modules/flow/demo/safety.ts`) refuses to
  fire any write tx when the RPC isn't in `LMM_RPC_ALLOWLIST`.
* The dispatch dialog and cheats menu both run `assertForkRpc()` before
  every action.
* The `LmmDemoBanner` is mounted on the overview + policy pages so the
  presenter cannot miss the chain context.
* `manifestFingerprintCheck()` compares the manifest's DAO address with
  the indexer's first `Dao` entity; UI should refuse demo writes when
  they disagree (TODO: surface the result in the banner).

---

## Updating vendored libs

The app vendors two slices of `dao-launchpad@f/lido-demo`:

| Source                                  | Destination                                        |
| --------------------------------------- | -------------------------------------------------- |
| `lido/preview/lib/src/**`               | `app/src/shared/lidoPreview/`                      |
| `lido/preview/ui/src/{Topology,Status,Steps,DispatchDialog,ActionsMenu,useStatus,actions,icons,layout,format,styles.css}` | `app/src/modules/flow/components/lidoMoneyMachine/` |

When Jordi ships an update:

1. Pull the latest commit of `dao-launchpad@f/lido-demo`.
2. Re-copy the files above on top of the vendored copies.
3. Re-add the `// Vendored from …` header to each file (preserved by the
   sed pass in the original vendoring run; manually add for new files).
4. Strip `.ts`/`.tsx` extensions from relative imports (the app uses
   `moduleResolution=bundler`):
   ```bash
   sed -i '' -E 's|(from \"\\.\\.?/[^\"]+)\\.tsx?|\\1|g' \
       src/shared/lidoPreview/*.ts \
       src/modules/flow/components/lidoMoneyMachine/*.{ts,tsx}
   ```
5. Re-run `pnpm typecheck && pnpm lint`.

---

## Troubleshooting

* **"manifest 404 from /lmm-manifest.json"** — the symlink in `public/`
  is missing or `just demo-up` hasn't completed.  Re-run step 1.
* **"refusing to use RPC ..."** — the RPC URL is not in
  `LMM_RPC_ALLOWLIST` (`lmmDemoConfig.ts`).  Add the hostname there.
* **Production DAOs render the demo banner** — `NEXT_PUBLIC_LMM_DEMO_MODE`
  is forced on.  Set it back to `0` (or unset) in `.env.local`.
* **"Topology inspection failed"** — the RPC isn't reachable, or the
  manifest's `dispatcher` address doesn't exist on the connected chain.
  Verify Anvil is still up: `curl -X POST http://localhost:8545
  -H 'Content-Type: application/json' -d '{"jsonrpc":"2.0","method":"eth_blockNumber","id":1}'`.
* **Dispatch reverts immediately** — likely the PriceFloorGate is closed
  or the StreamUntilBudget hasn't accrued enough.  Use the cheats menu
  to "Set ETH/USD to $3000" + "Warp +1 day" + try again.

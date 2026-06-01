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
* **VM** — a single host runs Anvil + Envio + Hasura behind the host's
  nginx, fronted by Cloudflare in Flexible-SSL mode (TLS terminates at
  Cloudflare's edge; the origin only speaks plain HTTP on :80).  The
  current public endpoint is `https://tests.aragon.in/{rpc,graphql,manifest.json}`.
  See [`vm/vm-README.md`](./vm/vm-README.md) for the full decision tree
  (when the VM is actually needed) and the setup steps, and
  [`vm/nginx.lmm-demo.conf`](./vm/nginx.lmm-demo.conf) for the drop-in
  routing snippet.

Both shapes share the same data model: a manifest JSON describing the
demo DAO + its plugins, plus an Envio GraphQL endpoint indexed against the
same chain.

And there are two surfaces the demo can render to:

* **Aragon app `/flow` page** — the full Next.js dashboard with
  `LMM_DEMO_MODE=1`.  Production-shaped UX; needs Anvil + Envio + the
  app dev server (4 terminals).  This is what the TL;DR + Local
  quickstart below set up.
* **`lido/preview/ui/` (Vite, :5173)** — the standalone UI the
  vendored components in `app/src/modules/flow/components/lidoMoneyMachine/`
  came from.  Needs only Anvil + `just demo-up` + `just ui-dev` (no
  Envio, no Aragon app).  Useful for quick smoke tests of the
  dispatcher topology and cheats menu.  See
  [§ Optional: standalone preview UI for fast iteration](#optional-standalone-preview-ui-for-fast-iteration).

---

## TL;DR

```bash
# In dao-launchpad@f/lido-demo  (run from the `lido/` subdir, not `lido/preview/`)
cd ../dao-launchpad/lido
just bootstrap                # creates .env from .env.example (first time only)
just switch mainnet           # selects the mainnet config from just-foundry
$EDITOR .env                  # set RPC_URL=https://eth-mainnet.g.alchemy.com/v2/<KEY>
just anvil                    # terminal 1: foreground mainnet fork on :8545
just demo-up                  # terminal 2: deploys CR slice + LMM DAO; writes
                              # script/demo/manifest.json

# In capital-flow-indexer (sibling of app/)
cd ../../capital-flow-indexer
cat > .env <<'EOF'
ENVIO_DEMO_RPC_URL=http://localhost:8545
EOF
pnpm install                  # first time only
pnpm dev                      # terminal 3: indexer + postgres + hasura on :8080

# In app/  (already configured via config/.env.local — see Step 3 below).
cd ../app
ln -sf ../../dao-launchpad/lido/script/demo/manifest.json \
       public/lmm-manifest.json
# Flip NEXT_PUBLIC_LMM_DEMO_MODE from 0 to 1 in config/.env.local
# (pnpm dev copies config/.env.local → .env.local on every start via
#  scripts/setupEnv.sh local, so editing the root .env.local is a no-op).
pnpm dev                      # terminal 4: open /dao/ethereum-mainnet/<lmm-dao>/flow
```

The DAO address to navigate to is `lmm.dao` from the generated
`manifest.json`.

---

## Local quickstart

### Prerequisites

* `pnpm` 11.3.0+ and Node.js 24.13+ (matches `app/package.json` engines + packageManager).
* `bun` 1.3+ (used by `dao-launchpad/lido/preview/`).
* `foundry` (anvil, cast, forge) — `curl -L https://foundry.paradigm.xyz | bash && ~/.foundry/bin/foundryup`.
* `just` — `brew install just` (or `cargo install just`).
* A mainnet **archive** RPC URL for the Anvil fork (Alchemy / Infura / QuickNode).
  Public RPCs (`drpc.org`, `llamarpc`) rate-limit the genesis fetch and `just anvil`
  will time out. Put it in `dao-launchpad/lido/.env` as `RPC_URL=https://...`
  (override of the default in `lib/just-foundry/networks/mainnet.env`).  Aragon-internal:
  the `ALCHEMY_API_KEY` lives in 1Password — installing the `vars` CLI lets
  `just anvil` pick it up automatically.
* The two sibling repos checked out alongside `app/`:
  * `dao-launchpad` on branch `f/lido-demo`
  * `capital-flow-indexer` (this branch)

### 1. Start Anvil + deploy the demo

`just anvil` and `just demo-up` both live in `dao-launchpad/lido/justfile`
(the latter via `import 'script/demo/demo.just'`).  `lido/preview/` is a
separate Bun/Vite UI runner and has its own justfile — do **not** run
`demo-up` from there.

```bash
cd dao-launchpad
git checkout f/lido-demo
cd lido
just bootstrap                  # first time only — copies .env.example → .env
just switch mainnet             # selects mainnet defaults from just-foundry
# Edit .env — at minimum set RPC_URL to a mainnet archive endpoint, e.g.
#   RPC_URL=https://eth-mainnet.g.alchemy.com/v2/<KEY>

# Terminal 1 — foreground fork (mainnet, chainId 1, --auto-impersonate):
just anvil

# Terminal 2 — broadcast PrepareDemo.s.sol against the fork.  Idempotent
# (re-running re-deploys everything against a fresh fork; relaunch
# `just anvil` first if you want a clean slate).
just demo-up
```

The final step writes `script/demo/manifest.json` with all the addresses
the UI needs.  `manifest.lmm.dao` is the address you'll navigate to in
the app.

#### Optional: standalone preview UI for fast iteration

If you only want to poke at the dispatcher topology + cheats without
booting the whole Aragon app, the original Vite UI that the
`app/src/modules/flow/components/lidoMoneyMachine/*` files were vendored
from is still alive at `dao-launchpad/lido/preview/ui/`.  In a separate
terminal:

```bash
cd dao-launchpad/lido/preview
just install                    # first time only (bun install)
just ui-dev                     # standalone UI on http://localhost:5173
```

This UI reads `../script/demo/manifest.json` directly via Vite, so it
needs `just demo-up` to have run but does **not** need the Envio
indexer or the Aragon app.  Use it as a sanity check that the deploy is
healthy before pointing the full app at it.  When the vendored code in
`app/` falls out of sync with this UI, see [§ Updating vendored libs](#updating-vendored-libs).

### 2. Start the indexer

```bash
cd ../../capital-flow-indexer       # from dao-launchpad/lido/, two ups to the workspace root
cat > .env <<'EOF'
# config.yaml's mainnet (chain 1) network reads ENVIO_DEMO_RPC_URL
# with a fallback to http://anvil:8545 (the docker hostname used on the VM).
# Locally we point it at the host anvil.
ENVIO_DEMO_RPC_URL=http://localhost:8545
EOF
pnpm install                        # first time only
pnpm dev                            # serves GraphQL on http://localhost:8080
```

Note: `ENVIO_CHAIN_ID` / `ENVIO_START_BLOCK` are **not** used — they're
hard-coded in `config.yaml` (chain 1, block 0) for the local mainnet
fork.  Only `ENVIO_DEMO_RPC_URL` matters.

The indexer auto-discovers the demo's contracts via `DAOFactory.DAOCreated`
and `PluginSetupProcessor.InstallationApplied` — no need to plug
addresses in by hand.

### 3. Run the app

```bash
cd ../app
pnpm install
```

The four LMM flags already live in `config/.env.local` (checked in).
**Do not edit the root `.env.local`** — `pnpm dev` runs
`scripts/setupEnv.sh local` first, which copies `config/.env.local`
→ `.env.local` and clobbers any edits.

Flip the master switch in `config/.env.local`:

```
NEXT_PUBLIC_LMM_DEMO_MODE=1
```

The other three flags should already match the local-first defaults:

```
NEXT_PUBLIC_LMM_MANIFEST_URL=/lmm-manifest.json
NEXT_PUBLIC_FLOW_INDEXER_ENDPOINT=http://localhost:8080/v1/graphql
NEXT_PUBLIC_LMM_RPC_URL=http://localhost:8545
```

Symlink the freshly-generated manifest so the dev server can serve it.
The symlink is `.gitignore`d (`/public/lmm-manifest.json`), so creating
it is local-only:

```bash
ln -sf ../../dao-launchpad/lido/script/demo/manifest.json \
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
* **From the CLI** — `just demo-warp`, `just demo-dispatch`,
  `just demo-status`, `just demo-eth-price`, `just demo-topup`,
  `just demo-set-target-epoch`, `just demo-settle-cowswap` — all defined
  in `dao-launchpad/lido/script/demo/demo.just` (imported by
  `dao-launchpad/lido/justfile`).  Run them from `dao-launchpad/lido/`.

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
  is forced on.  Set it back to `0` in `config/.env.local` (the source
  of truth; the root `.env.local` is regenerated on every `pnpm dev`).
* **My edits to `.env.local` disappeared** — `scripts/setupEnv.sh local`
  ran on `pnpm dev` and overwrote it with `config/.env.local`.  Edit
  `config/.env.local` instead.
* **Anvil falls over on startup / mainnet fork won't sync** — `just anvil`
  is using the public `drpc.org` fallback.  Put a real archive endpoint
  in `dao-launchpad/lido/.env` as `RPC_URL=https://...`.
* **"Topology inspection failed"** — the RPC isn't reachable, or the
  manifest's `dispatcher` address doesn't exist on the connected chain.
  Verify Anvil is still up: `curl -X POST http://localhost:8545
  -H 'Content-Type: application/json' -d '{"jsonrpc":"2.0","method":"eth_blockNumber","id":1}'`.
* **Dispatch reverts immediately** — likely the PriceFloorGate is closed
  or the StreamUntilBudget hasn't accrued enough.  Use the cheats menu
  to "Set ETH/USD to $3000" + "Warp +1 day" + try again.

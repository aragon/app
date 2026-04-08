# Anvil Fork Testing

Anvil (part of [Foundry](https://book.getfoundry.sh/)) lets you spin up a local chain that is a live snapshot of any network. This is the recommended way to manually test on-chain transactions (e.g. ENS record updates) without spending real gas or waiting for testnet deployments.

## Why fork instead of using a testnet

- **Real contracts, real state** — ENS resolver, token contracts, DAO addresses all exist exactly as on mainnet.
- **Impersonation** — send transactions from any address (e.g. `vitalik.eth`) without its private key.
- **Instant mining** — transactions confirm in milliseconds.
- **Isolated** — nothing you do affects mainnet or any other developer.

## Prerequisites

Install Foundry (includes `anvil` and `cast`):

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

## Setup

### 1. Start Anvil

Fork mainnet using your Alchemy key (the same key used by the app in production):

```bash
anvil \
  --fork-url https://eth-mainnet.g.alchemy.com/v2/<NEXT_SECRET_RPC_KEY> \
  --port 8545 \
  --chain-id 1 \
  --dump-state anvil-state.json \
  --load-state anvil-state.json
```

State persistence (remove those if not needed):
- `--dump-state <file>` — when anvil **shuts down**, it writes the current chain state to the file.
- `--load-state <file>` — when anvil **starts up**, it reads that file and restores the state. Remove on the first run!

### 2. Configure the app to use Anvil

Create `.env.local` in the project root (git-ignored) and add:

```
NEXT_SECRET_RPC_OVERRIDE_1=http://127.0.0.1:8545
```

When set, all RPC calls for chain 1 are routed to Anvil instead of Alchemy. Remove the line to revert to production RPC.

### 3. Configure MetaMask

Add a custom network in MetaMask:

| Field | Value |
|---|---|
| Network name | Anvil Fork |
| RPC URL | `http://127.0.0.1:8545` |
| Chain ID | `1` |
| Currency symbol | ETH |

Now you can interact with dApps and update the state on Anvil!

### 4. Start the dev server

```bash
pnpm dev
```

## Useful commands

```bash
# Impersonate an address
cast rpc anvil_impersonateAccount <address> --rpc-url http://localhost:8545
```

```bash
# Fund the impersonated account
cast rpc anvil_setBalance <address> 0xDE0B6B3A7640000 --rpc-url http://localhost:8545
```
`0xDE0B6B3A7640000` = 1 ETH in wei (hex). Increase the value for more gas budget.

```bash
# Check ETH balance
cast balance <address> --rpc-url http://localhost:8545

# Read an ENS text record
cast call 0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63 \
  "text(bytes32,string)(string)" \
  $(cast namehash vitalik.eth) "description" \
  --rpc-url http://localhost:8545

# Take a snapshot (restore point)
cast rpc anvil_snapshot --rpc-url http://localhost:8545

# Restore snapshot
cast rpc anvil_revert <snapshot_id> --rpc-url http://localhost:8545

# Reset fork to latest block
cast rpc anvil_reset \
  '{"forking":{"jsonRpcUrl":"https://eth-mainnet.g.alchemy.com/v2/<KEY>"}}' \
  --rpc-url http://localhost:8545
```

## How the override works

`NEXT_SECRET_RPC_OVERRIDE_<chainId>` is checked first in `proxyRpcUtils` before the normal Alchemy/Ankr routing. Setting it to any HTTP endpoint redirects all traffic for that chain — Anvil, a custom node, or a staging RPC. The variable name pattern follows the existing `NEXT_SECRET_*` convention so it is never exposed to the browser.

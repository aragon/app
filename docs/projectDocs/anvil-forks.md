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
  --chain-id 1
```

`--chain-id 1` keeps MetaMask on the "Ethereum Mainnet" network so ENS resolution works correctly.

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

### 4. Start the dev server

```bash
pnpm dev
```

## Persisting fork state

Anvil state is in-memory only — stopping it loses all changes (reverse records, approvals, balances). To preserve your setup:

```bash
# Save current state to disk
cast rpc anvil_dumpState --rpc-url http://localhost:8545 > anvil-state.json

# Restore on next start
anvil \
  --fork-url https://eth-mainnet.g.alchemy.com/v2/<NEXT_SECRET_RPC_KEY> \
  --port 8545 \
  --chain-id 1 \
  --load-state anvil-state.json
```

`anvil-state.json` is already in `.gitignore` — don't commit it.

## Testing with a real ENS name

Anvil supports impersonation — you can act as any address without its private key.

### Impersonate an ENS holder

```bash
cast rpc anvil_impersonateAccount <address> --rpc-url http://localhost:8545
```

Then in MetaMask, import the account using its private key — or use a wallet that supports impersonation like [Impersonator](https://github.com/wslyvh/impersonator).

### Fund the impersonated account for gas

```bash
cast rpc anvil_setBalance <address> 0xDE0B6B3A7640000 --rpc-url http://localhost:8545
```

`0xDE0B6B3A7640000` = 1 ETH in wei (hex). Increase the value for more gas budget.

### Set reverse ENS record

The reverse record maps your address → primary ENS name so `useEnsName(address)` resolves correctly.

```bash
# 1. Impersonate and fund your address
cast rpc anvil_impersonateAccount <your-address> --rpc-url http://localhost:8545
cast rpc anvil_setBalance <your-address> 0xDE0B6B3A7640000 --rpc-url http://localhost:8545

# 2. Set reverse record via the ENS Reverse Registrar
cast send 0xa58E81fe9b61B5c3fE2AFD33CF304c454AbFc7Cb "setName(string)" "<your-ens-name>" --from <your-address> --unlocked --rpc-url http://localhost:8545
```

### Grant record update permission for a wrapped subdomain

If the ENS name is a **wrapped subdomain** (owner in the registry is the NameWrapper `0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401`), calling `setText` directly will revert. The resolver checks its own `isApprovedForAll` mapping — you need the NameWrapper token owner to approve your address on the **resolver**.

```bash
# 1. Find the NameWrapper token owner for your subdomain
PARENT_OWNER=$(cast call 0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401 \
  "ownerOf(uint256)(address)" \
  $(cast to-dec $(cast namehash <your-ens-name>)) \
  --rpc-url http://localhost:8545)

# 2. Impersonate and fund the token owner
cast rpc anvil_impersonateAccount $PARENT_OWNER --rpc-url http://localhost:8545
cast rpc anvil_setBalance $PARENT_OWNER 0xDE0B6B3A7640000 --rpc-url http://localhost:8545

# 3. Approve your address on the resolver (NOT the NameWrapper)
cast send 0xF29100983E058B709F3D539b0c765937B804AC15 \
  "setApprovalForAll(address,bool)" <your-address> true \
  --from $PARENT_OWNER --unlocked --rpc-url http://localhost:8545
```

Verify:

```bash
cast call 0xF29100983E058B709F3D539b0c765937B804AC15 \
  "isApprovedForAll(address,address)(bool)" \
  $PARENT_OWNER <your-address> \
  --rpc-url http://localhost:8545
# → true
```

After this your address can call `setText` on the resolver for any name owned by `$PARENT_OWNER`.

## Useful commands

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

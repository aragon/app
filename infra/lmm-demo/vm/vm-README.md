# Lido Money Machine demo — VM deployment

Self-contained docker-compose stack for hosting the LMM demo behind a public
TLS endpoint.  Single VM, five containers, ~3 GB RAM at idle.

This is a deployment artifact — **for development, use [`../README.md`](../README.md)**
(local-first instructions, no VM required).

---

## What's inside

| Service  | Image                          | Purpose                                              |
|----------|--------------------------------|------------------------------------------------------|
| anvil    | `ghcr.io/foundry-rs/foundry`   | Mainnet fork, persistent state (`/data/anvil.json`). |
| postgres | `postgres:17-alpine`           | Envio's index DB.                                    |
| envio    | `node:22-bookworm-slim`        | Capital-flow-indexer (mounted from host).            |
| hasura   | `hasura/graphql-engine:v2.42`  | GraphQL frontend for Envio's Postgres.               |
| caddy    | `caddy:2-alpine`               | TLS + CORS proxy.  Public-facing.                    |

Public endpoints (after `docker compose up -d` + `init-demo.sh`):

- `https://$DOMAIN/rpc` — JSON-RPC against anvil
- `https://$DOMAIN/graphql` — Envio GraphQL (public role, read-only)
- `https://$DOMAIN/manifest.json` — deployment manifest
- `https://$DOMAIN/healthz` — liveness

---

## Prerequisites on the VM

```bash
# Ubuntu 22.04/24.04 LTS
sudo apt update
sudo apt install -y docker.io docker-compose-plugin git jq curl

# foundry (forge/cast/anvil) — used by init-demo.sh, not by docker
curl -L https://foundry.paradigm.xyz | bash
~/.foundry/bin/foundryup

# just (task runner) — used by init-demo.sh
sudo apt install -y just || \
	(curl --proto '=https' --tlsv1.2 -sSf https://just.systems/install.sh | sudo bash -s -- --to /usr/local/bin)
```

Open ports 80 + 443 in the firewall (`ufw allow 80,443/tcp`).

---

## First boot

```bash
# 1. Mount the capital-flow-indexer source on the host (sibling of this dir).
cd /srv
git clone https://github.com/aragon/capital-flow-indexer.git
# Or: scp -r ~/dev/aragon/capital-flow-indexer root@vm:/srv/

# 2. Pull this directory onto the VM (or scp it from your laptop).
cd /srv
git clone -b money-mchine-dashboard https://github.com/aragon/app.git
cd app/infra/lmm-demo/vm

# 3. Configure.
cp .env.vm.example .env
$EDITOR .env   # set DOMAIN + MAINNET_RPC + POSTGRES_PASSWORD + HASURA_ADMIN_SECRET

# 4. Start the stack.
docker compose up -d
docker compose logs -f anvil   # watch the fork sync — should take 5-30s

# 5. Bootstrap the demo DAO (one-shot; idempotent).
DOMAIN=$(grep '^DOMAIN=' .env | cut -d= -f2) \
	./init-demo.sh

# 6. Verify.
curl -s https://$DOMAIN/healthz                                 # → ok
curl -s https://$DOMAIN/manifest.json | jq .lmm.dao             # → 0x...
curl -s -X POST -H 'Content-Type: application/json' \
	-d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
	https://$DOMAIN/rpc | jq .result                            # → 0x...
curl -s -X POST -H 'Content-Type: application/json' \
	-d '{"query":"query { Dao { id address } }"}' \
	https://$DOMAIN/graphql | jq .                              # → list with LMM DAO
```

---

## Day-2 ops

### Refresh demo state (clean restart)

```bash
docker compose down -v          # drops anvil state + indexer DB
docker compose up -d
./init-demo.sh                  # re-deploys
```

### Anvil only (keep indexer DB)

```bash
docker compose restart anvil
./init-demo.sh                  # re-deploys against fresh fork
# After that you may want to re-index too:
docker compose restart envio
```

### Inspect a tx

```bash
docker compose exec anvil sh -c 'cast tx 0x... --rpc-url http://localhost:8545'
```

### Tail logs

```bash
docker compose logs -f --tail=100   # all services
docker compose logs -f anvil envio  # specific
```

---

## Updating the indexer

The Envio container mounts `capital-flow-indexer/` from the host.  To deploy
changes:

```bash
cd /srv/capital-flow-indexer
git pull
docker compose -f /srv/app/infra/lmm-demo/vm/docker-compose.yml restart envio
```

If `config.yaml` or `schema.graphql` changes, the next `pnpm codegen + pnpm start`
inside the container picks it up automatically.

---

## Security model

This is **throw-away demo infrastructure**.

- The anvil fork uses a hard-coded deployer private key (anvil[0]); anybody
  with the preview URL can fire dispatches.  That's intentional for demos.
- The Hasura console is gated by `HASURA_ADMIN_SECRET`, but the public
  GraphQL endpoint exposes read-only queries via the `public` role.
- CORS is `*` — production has stricter rules but the demo welcomes any
  Vercel preview origin.

If you need to lock this down (private demo for one client, say):
- Set `HASURA_GRAPHQL_UNAUTHORIZED_ROLE` to `null` and require API key headers.
- Replace `Access-Control-Allow-Origin: *` in the Caddyfile with the specific
  preview domain.
- Use BasicAuth in Caddy via the `basicauth` directive on /rpc.

---

## Cost notes

| Provider          | Plan          | Approx €/mo |
|-------------------|---------------|-------------|
| Hetzner Cloud     | CX22 (2vCPU, 4GB, 40GB SSD) | ~5      |
| DigitalOcean      | s-2vcpu-4gb   | ~24         |
| AWS Lightsail     | 2vcpu-4gb-80gb | ~22        |

The compose stack idles around 1-2 GB RAM and <5% CPU; spikes during a
dispatch sequence to ~80% CPU on one core.  Mainnet RPC usage is the main
external cost — bound to one fork-init per anvil restart (~10k requests),
then very low.

# Lido Money Machine demo — VM deployment

Self-contained docker-compose stack for hosting the LMM demo behind a public
HTTPS endpoint.  Single VM, four containers, ~3 GB RAM at idle.

This is a deployment artifact — **for development, use [`../README.md`](../README.md)**
(local-first instructions, no VM required).

---

## When to use the VM (vs local-first)

| Scenario | VM? | Why |
|----------|-----|-----|
| Iterating on UI on your laptop | **No** — use `../README.md` | Faster feedback, no infra cost |
| Showing the demo from `localhost:3000` to one viewer | **No** | Local-first works |
| Demo on a **Vercel preview URL** (anyone can open the link) | **Yes** | Browsers block mixed content (HTTPS page → HTTP RPC).  The VM gives Vercel-preview a public HTTPS origin |
| Persistent shared demo for the team | **Yes** | Single source of truth, no laptop in the loop |

---

## Topology (what the public sees vs what stays internal)

```
                           public internet
                                  │
                       https://tests.aragon.in
                                  │
                                  ▼
                  ┌──────────────────────────────┐
                  │  Cloudflare (Flexible SSL)   │  TLS terminates here.
                  │  edge ↔ origin = plain HTTP  │  No cert on the VM.
                  └──────────────┬───────────────┘
                                 │  HTTP :80, CF IPs only (UFW allow-list)
                                 ▼
   ┌──────────────────────────────────────────────────────────┐
   │ VM (Ubuntu 24.04, Hetzner CX22 / DO 2vCPU / similar)     │
   │                                                          │
   │   ┌──────────────┐                                       │
   │   │ host nginx   │ ← single public port: 80              │
   │   │ tests.aragon.in server block + LMM `location`s       │
   │   └──┬───────────┘                                       │
   │      │  /rpc          ──► 127.0.0.1:8545  (anvil)        │
   │      │  /graphql      ──► 127.0.0.1:8080  (hasura)       │
   │      │  /manifest.json──► alias /srv/lmm/manifest.json   │
   │      │  /healthz      ──► 200 ok                         │
   │                                                          │
   │   anvil ◄── envio (capital-flow-indexer) ──► hasura ──► postgres │
   │   (all four bind to 127.0.0.1 or docker-internal only)   │
   └──────────────────────────────────────────────────────────┘
```

Public endpoints (after `docker compose up -d` + `init-demo.sh`):

- `https://tests.aragon.in/rpc` — JSON-RPC against anvil
- `https://tests.aragon.in/graphql` — Envio GraphQL (public role, read-only)
- `https://tests.aragon.in/manifest.json` — deployment manifest
- `https://tests.aragon.in/healthz` — liveness

What stays internal (never reachable from the public internet):

- anvil RPC (`127.0.0.1:8545` on the host)
- Hasura admin console (`127.0.0.1:8080`)
- Postgres (docker network only, no host port)
- Envio's HTTP API (docker network only)

Enforcement:

1. **docker-compose** binds anvil/hasura to `127.0.0.1` (not `0.0.0.0`), and postgres/envio expose nothing to the host.
2. **UFW** allows only 22 + 80 inbound (443 is unused because CF speaks plain HTTP to origin).
3. **Cloudflare** acts as the only legitimate caller; restricting nginx to CF IP ranges is recommended (see § Hardening below).

---

## Roles — who owns what

| Concern | Owner | Notes |
|---------|-------|-------|
| DNS for `tests.aragon.in` | DevOps | Already done — orange-cloud proxied through CF |
| Cloudflare zone / SSL mode | DevOps | Already on **Flexible**.  No origin cert needed |
| Host nginx (system package) | DevOps | Already running for `tests.aragon.in` — we add `location` blocks |
| LMM docker-compose stack | Demo owner (you) | This directory |
| Mainnet archive RPC | Demo owner (you) | Alchemy/Infura free tier; set `MAINNET_RPC` in `.env` |
| Periodic redeploys / `init-demo.sh` | Demo owner (you) | One command, idempotent |

What DevOps **does not** have to provide:

- Any TLS certificate (Cloudflare handles it).
- An origin certificate (we're in Flexible mode, not Full-strict).
- A new server block — we're attaching to the existing one.
- Mainnet RPC credentials — you generate that yourself.

---

## What's inside docker-compose

| Service  | Image                          | Host port           | Purpose |
|----------|--------------------------------|---------------------|---------|
| anvil    | `ghcr.io/foundry-rs/foundry`   | `127.0.0.1:8545`    | Mainnet fork; persistent state in `/data/anvil.json` |
| postgres | `postgres:17-alpine`           | (none)              | Envio's index DB |
| envio    | `node:22-bookworm-slim`        | (none)              | Capital-flow-indexer; mounted from host |
| hasura   | `hasura/graphql-engine:v2.42`  | `127.0.0.1:8080`    | GraphQL frontend for Envio's Postgres |

There is **no** Caddy / nginx container in this stack — TLS + routing is the host's job.

### Why nginx (host) and not a containerised proxy?

Because the VM **already runs host nginx for `tests.aragon.in`**.  Adding a second proxy inside docker would either:

- conflict on port 80 (compose can't bind it if nginx is already bound), or
- chain proxies (CF → host nginx → container proxy → upstreams), adding a hop with no benefit.

Cloudflare also makes Let's Encrypt / ACME irrelevant — the cert lives on CF edge, so the origin proxy reduces to "path routing + CORS", which is exactly what the existing nginx is built for.  See [`nginx.lmm-demo.conf`](./nginx.lmm-demo.conf) — ~80 lines including comments.

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

A mainnet **archive** RPC URL is required for the fork; put it in
`/srv/app/infra/lmm-demo/vm/.env` as `MAINNET_RPC=https://...`.  Public RPCs
(`drpc.org`, `llamarpc.com`) rate-limit fork genesis and will fail.

Firewall: `sudo ufw allow 22,80/tcp` (no 443 — CF terminates TLS upstream).

---

## First boot

```bash
# 1. Mount the capital-flow-indexer source on the host (sibling of this dir).
cd /srv
git clone https://github.com/aragon/capital-flow-indexer.git

# 2. Pull the app repo onto the VM.
cd /srv
git clone -b money-mchine-dashboard https://github.com/aragon/app.git  # NB: branch name has a typo on purpose
cd app/infra/lmm-demo/vm

# 3. Configure the compose stack.
cp .env.vm.example .env
$EDITOR .env   # set MAINNET_RPC + POSTGRES_PASSWORD + HASURA_ADMIN_SECRET

# 4. Start the stack (no proxy container — that's host nginx).
docker compose up -d
docker compose logs -f anvil   # watch the fork sync — should take 5-30s

# 5. Bootstrap the demo DAO (idempotent).  Writes manifest into /srv/lmm.
sudo mkdir -p /srv/lmm && sudo chown "$USER" /srv/lmm
./init-demo.sh

# 6. Plumb host nginx — append the LMM `location` blocks to the existing
#    tests.aragon.in server.  Two equivalent ways:
#
#    (a) Include the file as-is:
sudo cp nginx.lmm-demo.conf /etc/nginx/snippets/lmm-demo.conf
# then inside `server { server_name tests.aragon.in; ... }` add
#    include /etc/nginx/snippets/lmm-demo.conf;
#
#    (b) Or just paste the four `location` blocks directly into that
#        server block.
#
sudo nginx -t && sudo systemctl reload nginx

# 7. Verify from outside (run on your laptop, not on the VM):
curl -s https://tests.aragon.in/healthz                              # → ok
curl -s https://tests.aragon.in/manifest.json | jq .lmm.dao          # → 0x...
curl -s -X POST -H 'Content-Type: application/json' \
	-d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
	https://tests.aragon.in/rpc | jq .result                         # → 0x...
curl -s -X POST -H 'Content-Type: application/json' \
	-d '{"query":"query { Dao { id address } }"}' \
	https://tests.aragon.in/graphql | jq .                           # → list with LMM DAO

# 8. Wire the Aragon app's Vercel preview env to point at this VM:
#    see ../vercel.env.example for the four variables.  The hostname
#    (tests.aragon.in) is already in LMM_RPC_ALLOWLIST in
#    src/modules/flow/demo/lmmDemoConfig.ts.
```

If step 7 returns Cloudflare error **521** instead of the expected payload, the LMM container ports are up but **host nginx isn't proxying** — re-check step 6 (`nginx -t` for syntax, then `systemctl reload nginx`).  If it returns **502**, the location is hit but the upstream is down — `docker compose ps` to see which container is unhealthy.

---

## Day-2 ops

### Refresh demo state (clean restart)

```bash
docker compose down -v          # drops anvil state + indexer DB
docker compose up -d
./init-demo.sh                  # re-deploys, rewrites manifest.json atomically
```

### Anvil only (keep indexer DB)

```bash
docker compose restart anvil
./init-demo.sh                  # re-deploys against fresh fork
# After that you usually want to re-index too:
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
sudo journalctl -u nginx -f         # host nginx (separate process)
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

## Hardening (recommended once the demo is stable)

The defaults are deliberately permissive (CORS `*`, no client allow-list,
admin secret = `changeme`).  Before any non-team viewer hits the link:

1. **Restrict nginx :80 to Cloudflare IP ranges.**  Stops attackers from
   pointing a custom DNS record at the VM and bypassing CF.

   ```nginx
   # /etc/nginx/conf.d/cloudflare-only.conf  (in the http {} or per server)
   # Generated from https://www.cloudflare.com/ips/
   allow 173.245.48.0/20;
   allow 103.21.244.0/22;
   # ... (full list)
   deny all;
   ```

   Also enforce at L3: `sudo ufw allow proto tcp from 173.245.48.0/20 to any port 80` etc., then `sudo ufw delete allow 80/tcp`.

2. **Trust `CF-Connecting-IP` for `$remote_addr`** so logs aren't all CF
   edge IPs and rate-limits target real clients.

   ```nginx
   real_ip_header CF-Connecting-IP;
   set_real_ip_from 173.245.48.0/20;
   # ... (one line per CF range)
   ```

3. **Replace `*` CORS** in `nginx.lmm-demo.conf` with the explicit Vercel preview
   pattern (e.g. `https://app-git-*.vercel.app` plus the production aragon
   domain).

4. **Rotate `HASURA_ADMIN_SECRET`** out of `changeme`.  The console is never
   proxied publicly, but anyone with SSH on the VM can reach it on
   `127.0.0.1:8080`.

5. **Add BasicAuth on `/rpc`** via `auth_basic`.  The Aragon app sends an
   `X-Demo-Key` header (configurable in the app) — wire it through.

---

## Security model

This is **throw-away demo infrastructure**.

- The anvil fork uses a hard-coded deployer private key (anvil[0]); anybody
  with the preview URL can fire dispatches.  That's intentional for demos.
- The Hasura console is gated by `HASURA_ADMIN_SECRET`, but the public
  GraphQL endpoint exposes read-only queries via the `public` role.
- CORS is `*` — production has stricter rules but the demo welcomes any
  Vercel preview origin.  Tighten via the Hardening section above.

---

## Cost notes

| Provider          | Plan                          | Approx €/mo |
|-------------------|-------------------------------|-------------|
| Hetzner Cloud     | CX22 (2vCPU, 4GB, 40GB SSD)   | ~5          |
| DigitalOcean      | s-2vcpu-4gb                   | ~24         |
| AWS Lightsail     | 2vcpu-4gb-80gb                | ~22         |

The compose stack idles around 1-2 GB RAM and <5% CPU; spikes during a
dispatch sequence to ~80% CPU on one core.  Mainnet RPC usage is the main
external cost — bound to one fork-init per anvil restart (~10k requests),
then very low.

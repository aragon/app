#!/usr/bin/env bash
#
# Lido Money Machine demo — one-shot bootstrap.
#
# Idempotent: safe to re-run.  Assumes `docker compose up -d` has already
# brought up anvil + postgres + envio + hasura + caddy.
#
# Steps:
#   1. Wait for anvil to be ready (eth_blockNumber).
#   2. If LMM DAO is already deployed (PrepareDemo writes a marker), skip.
#   3. Clone dao-launchpad@f/lido-demo if missing.
#   4. Run `just demo-up` against anvil (deploys CR slice + LMM + mocks + seed).
#   5. Copy the resulting script/demo/manifest.json into the anvil volume
#      so caddy can serve it as https://$DOMAIN/manifest.json.
#
# Usage:
#   DOMAIN=lmm-demo.aragon-team.xyz MAINNET_RPC=... ./init-demo.sh

set -euo pipefail

DAO_LAUNCHPAD_DIR="${DAO_LAUNCHPAD_DIR:-/srv/dao-launchpad}"
DAO_LAUNCHPAD_REPO="${DAO_LAUNCHPAD_REPO:-https://github.com/aragon/dao-launchpad.git}"
DAO_LAUNCHPAD_BRANCH="${DAO_LAUNCHPAD_BRANCH:-f/lido-demo}"
ANVIL_RPC="${ANVIL_RPC:-http://localhost:8545}"
COMPOSE_FILE="${COMPOSE_FILE:-$(dirname "$(readlink -f "$0")")/docker-compose.yml}"

log() { printf '\033[1;36m[init-demo]\033[0m %s\n' "$*"; }
err() { printf '\033[1;31m[init-demo:ERROR]\033[0m %s\n' "$*" >&2; }

require_cmd() {
	if ! command -v "$1" &>/dev/null; then
		err "missing required command: $1"
		exit 1
	fi
}

require_cmd git
require_cmd jq
require_cmd cast
require_cmd just
require_cmd forge

log "waiting for anvil at $ANVIL_RPC..."
for i in $(seq 1 60); do
	if cast block-number --rpc-url "$ANVIL_RPC" &>/dev/null; then
		log "anvil ready"
		break
	fi
	sleep 2
	if [ "$i" -eq 60 ]; then
		err "anvil did not come up within 120s"
		exit 1
	fi
done

if [ ! -d "$DAO_LAUNCHPAD_DIR/.git" ]; then
	log "cloning $DAO_LAUNCHPAD_REPO @ $DAO_LAUNCHPAD_BRANCH → $DAO_LAUNCHPAD_DIR"
	git clone --branch "$DAO_LAUNCHPAD_BRANCH" --depth 1 --recurse-submodules \
		"$DAO_LAUNCHPAD_REPO" "$DAO_LAUNCHPAD_DIR"
else
	log "dao-launchpad already cloned; pulling latest"
	git -C "$DAO_LAUNCHPAD_DIR" fetch --depth 1 origin "$DAO_LAUNCHPAD_BRANCH"
	git -C "$DAO_LAUNCHPAD_DIR" reset --hard "origin/$DAO_LAUNCHPAD_BRANCH"
	git -C "$DAO_LAUNCHPAD_DIR" submodule update --init --recursive
fi

cd "$DAO_LAUNCHPAD_DIR/lido"

# `just switch mainnet` writes RPC_URL into .env — we don't need that since anvil is forked.
# But the foundry-tooling expects .env, so we synthesize one.
if [ ! -f .env ]; then
	log "creating minimal .env for lido package"
	cat >.env <<EOF
NETWORK_NAME=mainnet
CHAIN_ID=1
RPC_URL=$ANVIL_RPC
EOF
fi

# bootstrap pulls submodules (foundry libs); ignore if already bootstrapped.
just bootstrap || true

# Detect if demo-up already ran by reading the manifest's deployer balance — if
# anvil[0] is below its initial 10000 ETH, deployment has happened.  Cheap enough.
DEPLOYER_BAL=$(cast balance 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 --rpc-url "$ANVIL_RPC" | head -c 6)
if [ -f script/demo/manifest.json ] && [ "${DEPLOYER_BAL%???}" -lt "10000" ]; then
	log "demo already deployed (deployer balance ${DEPLOYER_BAL}...); skipping demo-up"
else
	log "running just demo-up"
	just demo-up
fi

log "copying manifest into the lmm-data docker volume (anvil:/data, caddy:/srv/lmm)"
ANVIL_CID=$(docker compose -f "$COMPOSE_FILE" ps -q anvil)
if [ -z "$ANVIL_CID" ]; then
	err "anvil container not running (compose file: $COMPOSE_FILE)"
	exit 1
fi
docker cp script/demo/manifest.json "$ANVIL_CID:/data/manifest.json"

log "done.  LMM DAO: $(jq -r .lmm.dao script/demo/manifest.json)"
log "manifest served at: https://${DOMAIN:-localhost}/manifest.json"

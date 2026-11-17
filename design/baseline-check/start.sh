#!/usr/bin/env bash
# Starts the mock backend and the app (`next dev`) on mock data, each in its own process group, and returns once both
# answer. Logs and pidfiles: out/. Stop them with ./stop.sh. Ports: MOCK_PORT (4100), APP_PORT (3000).
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "$HERE/../../apps/app" && pwd)"
OUT="$HERE/out"
export MOCK_PORT="${MOCK_PORT:-4100}"
export APP_PORT="${APP_PORT:-3000}"
START_TIMEOUT="${START_TIMEOUT:-2400}" # seconds; the first compile of the app can take many minutes

listening() { (exec 3<>"/dev/tcp/127.0.0.1/$1") 2>/dev/null; }

for port in "$MOCK_PORT" "$APP_PORT"; do
    if listening "$port"; then
        echo "Port $port is in use. Run ./stop.sh, or choose other ports with MOCK_PORT / APP_PORT." >&2
        exit 1
    fi
done
if [ ! -x "$APP_DIR/node_modules/.bin/next" ]; then
    echo "apps/app has no node_modules: run 'pnpm install' at the repo root first." >&2
    exit 1
fi

mkdir -p "$OUT"
# Job control gives each background job its own process group, which is what stop.sh kills.
set -m

node "$HERE/mock-server.cjs" >"$OUT/mock-server.log" 2>&1 </dev/null &
echo $! >"$OUT/mock.pid"

# Next.js keeps the CMS files it fetched on disk; drop them so the server reads the snapshot in ./cms.
rm -rf "$APP_DIR/.next/dev/cache/fetch-cache"
(
    # The app's local configuration plus the mock overrides, as process environment (it wins over .env* files, and
    # nothing is written into apps/app).
    while IFS= read -r line; do
        case "$line" in
            '' | '#'*) ;;
            *) export "$line" ;;
        esac
    done <"$APP_DIR/config/.env.local"
    export ARAGON_BACKEND_URL="http://localhost:$MOCK_PORT"
    export NEXT_SECRET_RPC_OVERRIDE_1="http://localhost:$MOCK_PORT/rpc"
    export NEXT_SECRET_RPC_KEY=mock NEXT_SECRET_ANKR_RPC_KEY=mock NEXT_SECRET_DRPC_RPC_KEY=mock
    export NEXT_TELEMETRY_DISABLED=1 TZ=UTC
    export NODE_OPTIONS="${NODE_OPTIONS:-} --require \"$HERE/server-preload.cjs\""
    cd "$APP_DIR"
    exec ./node_modules/.bin/next dev -p "$APP_PORT"
) >"$OUT/next-dev.log" 2>&1 </dev/null &
echo $! >"$OUT/app.pid"

fail() {
    echo "$1" >&2
    tail -n 20 "$2" >&2 || true
    "$HERE/stop.sh" >&2 || true
    exit 1
}

started=$SECONDS
until curl -fsS -o /dev/null "http://localhost:$MOCK_PORT/health" 2>/dev/null; do
    kill -0 "$(cat "$OUT/mock.pid")" 2>/dev/null || fail "The mock backend exited. Last lines of out/mock-server.log:" "$OUT/mock-server.log"
    [ $((SECONDS - started)) -lt 30 ] || fail "The mock backend did not answer within 30s. Last lines of out/mock-server.log:" "$OUT/mock-server.log"
    sleep 0.5
done
echo "mock backend: http://localhost:$MOCK_PORT"

echo "app: waiting for http://localhost:$APP_PORT/ (the first compile can take 10 minutes or more)"
last=$SECONDS
until [ "$(curl -s -o /dev/null -w '%{http_code}' --max-time 60 "http://localhost:$APP_PORT/" 2>/dev/null)" = 200 ]; do
    kill -0 "$(cat "$OUT/app.pid")" 2>/dev/null || fail "next dev exited. Last lines of out/next-dev.log:" "$OUT/next-dev.log"
    [ $((SECONDS - started)) -lt "$START_TIMEOUT" ] || fail "The app did not answer 200 within ${START_TIMEOUT}s. Last lines of out/next-dev.log:" "$OUT/next-dev.log"
    if [ $((SECONDS - last)) -ge 30 ]; then
        last=$SECONDS
        echo "  ... $((SECONDS - started))s: $(tail -n 1 "$OUT/next-dev.log" | cut -c1-100)"
    fi
    sleep 2
done
echo "app: http://localhost:$APP_PORT (ready after $((SECONDS - started))s)"

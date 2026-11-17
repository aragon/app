#!/bin/bash
# Writes apps/app/.env.local (gitignored) pointing at the mock backend and starts `next dev` on port 3000.
M="$(cd "$(dirname "$0")" && pwd)"
APP="$(cd "$M/../../apps/app" && pwd)"
cp $APP/config/.env.local $APP/.env.local
cat >> $APP/.env.local <<EOV

# --- mock overrides (mockrun) ---
ARAGON_BACKEND_URL=http://localhost:4100
NEXT_SECRET_RPC_OVERRIDE_1=http://localhost:4100/rpc
NEXT_SECRET_RPC_KEY=mock
NEXT_SECRET_ANKR_RPC_KEY=mock
NEXT_SECRET_DRPC_RPC_KEY=mock
NEXT_TELEMETRY_DISABLED=1
EOV
cd $APP
NODE_OPTIONS="--require $M/server-fetch-patch.cjs" nohup npx next dev -p 3000 > "$M/next-dev.log" 2>&1 &
echo "next pid $!"

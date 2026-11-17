#!/usr/bin/env bash
# Stops the mock backend and the app started by ./start.sh (their whole process groups) and checks the ports are free.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUT="$HERE/out"
MOCK_PORT="${MOCK_PORT:-4100}"
APP_PORT="${APP_PORT:-3000}"

listening() { (exec 3<>"/dev/tcp/127.0.0.1/$1") 2>/dev/null; }

for name in app mock; do
    pidfile="$OUT/$name.pid"
    [ -f "$pidfile" ] || continue
    pid="$(cat "$pidfile")"
    if kill -TERM -- "-$pid" 2>/dev/null; then
        for _ in $(seq 1 50); do
            kill -0 -- "-$pid" 2>/dev/null || break
            sleep 0.2
        done
        kill -KILL -- "-$pid" 2>/dev/null || true
        echo "stopped $name (process group $pid)"
    fi
    rm -f "$pidfile"
done

for port in "$MOCK_PORT" "$APP_PORT"; do
    for _ in $(seq 1 25); do
        listening "$port" || continue 2
        sleep 0.2
    done
    echo "Port $port is still in use by a process this script did not start." >&2
    exit 1
done
echo "ports $MOCK_PORT and $APP_PORT are free"

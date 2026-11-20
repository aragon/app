#!/usr/bin/env bash
# Re-captures a checkout of aragon/app with the patched baseline check (production build on mock data) and compares
# every screenshot with this baseline at zero tolerance.
#   ./recheck.sh <repo checkout> [extra compare-shots.cjs flags, e.g. --exclude a,b]
# Needs in the checkout: `pnpm install` and `pnpm --filter "@aragon/app^..." build` done. Ports MOCK_PORT (4300) and
# APP_PORT (3300); CHROMIUM_PATH defaults to the Playwright headless shell of this machine.
# Exit 0: no pixel changed on any covered screen. Exit 1: differences (listed; diff images in ./last-run/diff/).
set -uo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BC="$HERE/tooling/design/baseline-check"
export BASELINE_REPO="$(cd "${1:?usage: recheck.sh <repo checkout>}" && pwd)"
shift
export MOCK_PORT="${MOCK_PORT:-4300}" APP_PORT="${APP_PORT:-3300}"
export CHROMIUM_PATH="${CHROMIUM_PATH:-/opt/pw-browsers/chromium_headless_shell}"
export BASELINE_MODE=prod BASELINE_OUT="$HERE/last-run" BASELINE_REFERENCE="$HERE/shots"
unset BASELINE_SKIP_BUILD BASELINE_COVERAGE
echo "commit: $(git -C "$BASELINE_REPO" rev-parse HEAD)$(git -C "$BASELINE_REPO" diff --quiet HEAD -- apps packages || echo ' + uncommitted changes')"
"$BC/start.sh" || exit 1
started=$SECONDS
"$BC/capture.sh"
capture=$?
echo "capture: $((SECONDS - started))s"
"$BC/stop.sh"
[ "$capture" -eq 0 ] || { echo "capture failed: fix the failures above before comparing" >&2; exit 1; }
rm -rf "$BASELINE_OUT/diff"
node "$BC/compare-shots.cjs" "$HERE/shots" "$BASELINE_OUT/shots" --diff "$BASELINE_OUT/diff" "$@"

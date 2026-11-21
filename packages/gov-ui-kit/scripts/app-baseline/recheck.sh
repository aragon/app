#!/usr/bin/env bash
# Re-captures a checkout of aragon/app with the patched baseline check (production build on mock data) and compares
# every screenshot with a saved capture at zero tolerance.
#   BASELINE_TOOLING=<patched design/baseline-check> BASELINE_DIR=<baseline folder> \
#     ./recheck.sh <repo checkout> [extra compare-shots.cjs flags, e.g. --exclude a,b]
# BASELINE_TOOLING: a copy of `design/baseline-check` from `docs/design-canvas` with baseline-check.patch applied
#   (see README.md). BASELINE_DIR (default: the current directory): holds the reference capture in shots/; this run
#   writes last-run/shots/ and last-run/diff/ there.
# Needs in the checkout: `pnpm install` and `pnpm --filter "@aragon/app^..." build` done. Ports MOCK_PORT (4300) and
# APP_PORT (3300); CHROMIUM_PATH defaults to the Playwright headless shell under /opt/pw-browsers. Page errors that the
# app under test is known to throw can be named in BASELINE_IGNORE_ERRORS (a regular expression; same value for the
# reference capture).
# Exit 0: no pixel changed on any covered screen. Exit 1: differences (listed; diff images in last-run/diff/).
set -uo pipefail
BC="$(cd "${BASELINE_TOOLING:?set BASELINE_TOOLING to the patched design/baseline-check folder}" && pwd)"
WORK="$(cd "${BASELINE_DIR:-.}" && pwd)"
export BASELINE_REPO="$(cd "${1:?usage: recheck.sh <repo checkout>}" && pwd)"
shift
[ -d "$WORK/shots" ] || { echo "no reference capture in $WORK/shots" >&2; exit 1; }
export MOCK_PORT="${MOCK_PORT:-4300}" APP_PORT="${APP_PORT:-3300}"
export CHROMIUM_PATH="${CHROMIUM_PATH:-/opt/pw-browsers/chromium_headless_shell}"
export BASELINE_MODE=prod BASELINE_OUT="$WORK/last-run" BASELINE_REFERENCE="$WORK/shots"
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
node "$BC/compare-shots.cjs" "$WORK/shots" "$BASELINE_OUT/shots" --diff "$BASELINE_OUT/diff" "$@"

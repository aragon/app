#!/usr/bin/env bash
# Captures every screenshot (pages, wizards, dialogs) into out/shots. Both servers must be running (./start.sh).
#   ./capture.sh            compare the result with design/reference yourself; nothing tracked is written
#   ./capture.sh --update   baseline update: replaces design/reference with this run's screenshots
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ "$#" -gt 1 ] || { [ "$#" -eq 1 ] && [ "$1" != "--update" ]; }; then
    echo "Usage: $0 [--update]" >&2
    exit 1
fi

rm -rf "$HERE/out/shots" "$HERE/out/failures"
for script in capture-pages capture-wizards capture-dialogs; do
    node "$HERE/$script.cjs"
done

if [ "${1:-}" = "--update" ]; then
    # Every script succeeded: the reference set becomes exactly this run's screenshots.
    REFERENCE="$HERE/../reference"
    mkdir -p "$REFERENCE"
    for file in "$REFERENCE"/*.webp; do
        if [ -e "$file" ] && [ ! -e "$HERE/out/shots/$(basename "$file")" ]; then
            rm "$file"
            echo "removed design/reference/$(basename "$file") (no longer produced)"
        fi
    done
    cp "$HERE/out/shots"/*.webp "$REFERENCE/"
    echo "design/reference updated"
fi

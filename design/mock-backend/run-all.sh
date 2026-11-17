#!/bin/bash
# Captures every screenshot into ../reference as lossless WebP (pages, wizards, dialogs). Requires both servers running.
cd "$(dirname "$0")"
node shoot-pages.cjs
node shoot-wizards.cjs
node shoot-dialogs.cjs

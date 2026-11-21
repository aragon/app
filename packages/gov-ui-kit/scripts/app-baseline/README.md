# App screenshot baseline: patch for `design/baseline-check`

The baseline check on branch `docs/design-canvas` (`design/baseline-check/`) runs the real app on a mock backend and
takes 121 screenshots of pages, wizards and dialogs. This folder holds what is needed to use it as an exact
before/after check of the app itself: the app-side counterpart of the kit's Storybook comparison
(`../visual-diff.mjs`), made for token and colour work, where a kit change must leave every app screen unchanged.
Nothing here is built, deployed or run in CI.

| File | What |
| --- | --- |
| `baseline-check.patch` | Changes to the scripts of `docs/design-canvas` (at `186506cf9`). Apply there with `git apply --directory=design/baseline-check baseline-check.patch`, or to a copy of that folder. |
| `recheck.sh` | Captures a checkout and compares it with a saved capture set; exits 0 only when no pixel changed. |
| `coverage-uncovered.txt` | The app files with primitive colour classes that no screenshot renders (128 of 210), by module, measured on 20 November 2026. |

## Use

```sh
# once: a patched copy of the check, outside the checkout under test
git worktree add /tmp/design-canvas origin/docs/design-canvas
git -C /tmp/design-canvas apply --directory=design/baseline-check "$PWD/packages/gov-ui-kit/scripts/app-baseline/baseline-check.patch"
export BASELINE_TOOLING=/tmp/design-canvas/design/baseline-check BASELINE_DIR=/tmp/app-baseline

# reference: capture the base commit (in its checkout: pnpm install && pnpm --filter "@aragon/app^..." build)
BASELINE_REPO=<base checkout> BASELINE_OUT=$BASELINE_DIR BASELINE_MODE=prod \
  sh -c '"$BASELINE_TOOLING/start.sh" && "$BASELINE_TOOLING/capture.sh"; "$BASELINE_TOOLING/stop.sh"'

# compare another checkout with it (same preparation in that checkout)
packages/gov-ui-kit/scripts/app-baseline/recheck.sh <checkout>           # exit 0 = no pixel changed on any shot
packages/gov-ui-kit/scripts/app-baseline/recheck.sh <checkout> --exclude name1,name2   # report but never fail these
```

Uses ports 4300/3300 (`MOCK_PORT`, `APP_PORT`); `CHROMIUM_PATH` points at a Chromium headless shell. When the app under
test throws a page error that the base already throws (since APP-1454, main throws React error #418, a hydration
mismatch, on four wizard pages), set `BASELINE_IGNORE_ERRORS='Minified React error #418'` for both captures.

## What the patch adds

- Production mode (`BASELINE_MODE=prod`: `next build` + `next start`). `next dev` ran out of memory and produced wrong
  screenshots silently; a production build gave six byte-identical capture sets.
- A capture now fails when a request to the app fails or answers 5xx.
- `compare-shots.cjs` compares two capture folders (the existing `compare.cjs` only compares canvas screens).
- Coverage scripts that report which source files the captures execute.
- Paths settable by environment (`BASELINE_REPO`, `BASELINE_OUT`, `BASELINE_REFERENCE`), so the scripts run from
  outside the repo; `capture.sh` runs all three capture scripts and reports every failure.
- A minimal request context for Vercel's bot check under `next start`, which otherwise blocks the IPFS pin actions.
- `BASELINE_IGNORE_ERRORS`, and the connect dialog opened from `/explore` (on main `/` is the sign-in landing, which
  opens the wallet modal directly).

Measured on 20 November 2026: 121 of 121 captures succeed; zero false positives at zero tolerance; a one-step shade
change on one shared label was flagged on exactly the three screens that show it; a full capture and compare takes
under three minutes. The screenshots exercise about 39% of the app's colour-bearing files and no deliberate hover,
pressed, error or loading states, so they are paired with a static check of the class mapping.

Baseline images are not committed: they depend on the machine and browser that took them and are regenerated in
three minutes.

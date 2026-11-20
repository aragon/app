# App screenshot baseline: patch for `design/baseline-check`

The baseline check on branch `docs/design-canvas` (`design/baseline-check/`) runs the real app on a mock backend and
takes 121 screenshots of pages, wizards and dialogs. This folder holds what was needed to use it as an exact
before/after check of the app itself, for the semantic colour work. Nothing here is built, deployed or run in CI.

| File | What |
| --- | --- |
| `baseline-check.patch` | Changes to the scripts of `docs/design-canvas` (at `186506cf9`). Apply there with `git apply --directory=design/baseline-check baseline-check.patch`. |
| `recheck.sh` | Captures a checkout and compares it with a saved capture set; exits 0 only when no pixel changed. Paths inside it point at the session folder it was written in: adjust them. |
| `coverage-uncovered.txt` | The app files with primitive colour classes that no screenshot renders (128 of 210), by module. |

What the patch adds:

- Production mode (`BASELINE_MODE=prod`: `next build` + `next start`). `next dev` ran out of memory and produced wrong
  screenshots silently; a production build gave six byte-identical capture sets.
- A capture now fails when a request to the app fails or answers 5xx.
- `compare-shots.cjs` compares two capture folders (the existing `compare.cjs` only compares canvas screens).
- Coverage scripts that report which source files the captures execute.
- Paths settable by environment (`BASELINE_REPO`, `BASELINE_OUT`, `BASELINE_REFERENCE`), so the scripts run from
  outside the repo; `capture.sh` runs all three capture scripts and reports every failure.
- A minimal request context for Vercel's bot check under `next start`, which otherwise blocks the IPFS pin actions.

Measured on 20 November 2026: 121 of 121 captures succeed; zero false positives at zero tolerance; a one-step shade
change on one shared label was flagged on exactly the three screens that show it; a full capture and compare takes
under three minutes. The screenshots exercise about 39% of the app's colour-bearing files and no deliberate hover,
pressed, error or loading states, so they are paired with a static check of the class mapping.

Baseline images are not committed: they depend on the machine and browser that took them and are regenerated in
three minutes.

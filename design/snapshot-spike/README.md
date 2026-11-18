# Snapshot spike (idea 2 of 3: exported snapshots)

This branch holds experiment code for reading, not something to merge. It is one of three ideas that were tried for
getting the Aragon App onto a claude.ai design canvas so that design work can happen there before engineering builds
it.

| Idea | Branch | Status |
| --- | --- | --- |
| 1. Static screens: every app page drawn by hand as a still frame | `docs/design-canvas` | Works, but nothing responds, so flows cannot be designed on it |
| 2. Exported snapshots: a script copies each state of the running app into a frame | `docs/design-snapshots` (this one) | Exact, but frozen frames at one width; rejected for design |
| 3. Live prototypes: one frame per flow that holds state and redraws on each click | `docs/design-prototypes` | The only one found acceptable for design |

The spec that compares them is
[Design canvas for the Aragon App: options and tradeoffs](https://claude.ai/artifact/5u6yDMkYhF7bM3Ctf6msWE).

## The idea

Do not draw the app's screens: copy them. Run the app on a mock backend, drive it to a state with Playwright, and
read React's component tree in the page. Each Governance UI Kit component becomes a kit mount with its real props;
everything else is copied as rendered, with the app's own Tailwind classes. The app's compiled CSS is shipped with
the result. One frame is one state of the app at one width.

## What it showed

- The copy is exact. 16 pages and 40 states of the governance designer matched the app's screenshots, most at 0.00%
  of pixels, with no page-specific fixes.
- Once a flow has a script, regenerating its 40 frames took about 2 minutes with the app running. Writing and
  debugging that script the first time took about 16 minutes. Starting the app on mock data took up to about
  14 minutes cold.
- Behaviour cannot be copied. A rendered screen does not say where Next goes. Three attempts to derive the links
  between frames by rule failed. A small hand-written file of interactions (`flow/interactions.gd.json`, 67 lines)
  did pass an automated click-through.

## Why it was rejected for design

The result is a board of separate frozen frames joined by links. It does not feel like using the app, typing does
not carry from one frame to the next, and there is no mobile unless every state is captured a second time. It was
judged not usable for designing flows.

It may still have a use this branch does not explore: as a mechanical check of what the app looks like in a given
state, to compare a hand-built prototype against.

## What is here

The files are exactly as they ran in the experiment. They are not linted, not maintained, and will not run from
this branch as they are.

| Path | What it is |
| --- | --- |
| `export/export.cjs`, `export/extract-in-page.js` | The first exporter: one app page to one canvas file |
| `export/cmp.cjs` | Compares an exported page with the app's screenshot |
| `flow/journey.cjs` | Drives the app through the 40 states of the governance designer and snapshots each |
| `flow/extract-in-page.js` | Runs in the page: walks the React fiber tree and tells kit components from app markup |
| `flow/printer.cjs`, `flow/merge.cjs`, `flow/assemble.cjs` | Turn the captured trees into canvas files |
| `flow/interactions.gd.json`, `flow/interactions.cjs` | The hand-written interactions and the code that applies them |
| `flow/flowtest.cjs`, `flow/flowlib.cjs` | The automated click-through |
| `flow/board.json` | The 40 states and their layout on a canvas page |
| `flow/timings-*.txt` | Timestamps recorded during the runs |
| `example/GD_1_01_step1-empty.dc.html` | One exported frame, to see what the output looks like |

## What it depends on

- **The mock backend and shared helpers of idea 1.** The scripts require `design/baseline-check/lib.cjs`, `data.cjs`
  and `wallet-inject.cjs` by absolute path. Those are on `docs/design-canvas`, not here.
- **The app running in development mode.** The exporter needs React's development build for the owner of each
  element.
- **Next.js internals.** The kit ships minified, so kit components are recognised by identity, through a module
  registered with Turbopack's chunk loader. A Next.js or React upgrade can break this.
- **The app's compiled CSS**, about 360 KB, shipped with every set of frames. It is not included here.

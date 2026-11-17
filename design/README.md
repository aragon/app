# Design

Design canvases for the Aragon App, kept here as versioned source.

The canvas on claude.ai is where screens are viewed, edited, commented on and shared. This folder holds the same files in git,
together with reference screenshots of the real app and the mock backend used to take them.

| | |
|---|---|
| Canvas (this branch) | https://claude.ai/artifact/9gVpqYZDyCe6ksmjvvkA54 |
| Design system | [Aragon Governance UI Kit](https://claude.ai/artifact/BMrtaZwNQzvBsTyH9KvHMC), synced from `packages/gov-ui-kit` (version recorded in `canvas/canvas.json` → `designSystems`) |

## Layout

| Path | What |
|---|---|
| `canvas/canvas.json` | The canvas index: every artboard, its frame, notes and the design-system version in use |
| `canvas/*.dc.html` | One file per screen. Screens mount real kit components (`GovUiKit.*`); app-only layout (sidebar, page header, aside cards) is markup copied from `apps/app` |
| `canvas-assets.json` | Images the screens use: the path a screen links (`assets/net_bg.svg`) → the app's own file in the repo |
| `canvas/assets/` | Only images that exist just in designs (none yet) |
| `reference/*.webp` | Full-page screenshots of the real app running on mock data (lossless WebP). What "correct" looks like |
| `mock-backend/` | Mock Aragon backend + JSON-RPC, app launcher and screenshot scripts. See its README |

The design-system copy the canvas loads (`ds/…`: bundle, stylesheet, fonts) is not stored here. It is derived from the
Governance UI Kit design system and reinstalled from the version recorded in `canvas.json`.

## Branches

- This branch holds the **baseline**: a faithful recreation of the app as it is.
- Each exploration is its own branch off the baseline (`design/<feature>`) paired with its own canvas. Its canvas link
  goes in this README on that branch.
- Handover: the exploration branch's diff against the baseline is the spec. Engineers implement it in `apps/app` on the
  same branch (or one based on it), so one PR carries the design change and the code change. When the build follows the
  design, the baseline is already current after merge.

## Sync and refresh

There is no live link between the canvas and git. A Claude session moves files between them.

**Sync (canvas → repo).** Read every file of the canvas (`project/canvas.json` and each `project/*.dc.html`), write them
into `canvas/`, and commit and push whatever changed. Nothing changed: no commit. Run it:

- when asked to "sync" or "save",
- at the start of every session that works on this canvas,
- before editing the canvas, so hand edits made on claude.ai land in git first and are never overwritten.

**Refresh (repo → canvas).** Publish this branch's `canvas/` files to the branch's canvas. Sync first if the canvas may
have hand edits.

What keeps a refresh deterministic, so the same files always give the same canvas:

- **Pin the kit.** Copy the design system's files at the version recorded in `canvas.json` → `designSystems[].version`,
  never its latest. Moving to a newer kit is a deliberate change (see Kit updates).
- **Images are files, not uploads.** Screens link images by relative path (`assets/net_bg.svg`). Images the app owns
  (logos, textures, illustrations) are published straight from the app's own files, as mapped in `canvas-assets.json`,
  so there is one copy; images that exist only in designs live in `canvas/assets/`. Never upload an image to the canvas:
  an upload gets an id that exists only in that canvas, so a canvas built from this folder would show it broken.
- **Fixed "now".** Mock dates are computed from a fixed timestamp (when the reference screenshots were taken), never
  `Date.now()`. Relative labels drawn by kit components themselves ("3 days left") still use the viewer's clock, as in
  the app.

Edits Claude makes are published to the canvas and committed in the same step.

## Keeping the baseline honest

Baseline updates are manual for now (a GitHub Action can take this over later):

1. Run the app on mock data and re-take the screenshots (`mock-backend/README.md`).
2. Compare the changed screenshots with the canvas. A screen that drifted is fixed on the canvas, then synced.
3. Commit the new screenshots with the screen fixes.

Screenshots are only written by this step, never in feature PRs: binary files cannot be merged, so two PRs touching the
same screen would otherwise always conflict.

## Kit updates

When the Governance UI Kit design system is re-synced, refresh the canvas's copy of it (update the `designSystems` record
in `canvas.json`), check each screen against the new bundle, fix what changed, and commit.

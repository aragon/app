# Design canvas runbook

Procedures for the Claude Code session (or a person) that operates the design canvas workflow described in
[README.md](README.md). To run one, tell Claude: "follow `design/RUNBOOK.md`: sync" (or refresh, start an exploration,
check the baseline, update the kit).

## Ground rules

- Commit to the checked-out branch and push it. Do not open a pull request, create a branch, or delete a canvas
  without the owner's explicit OK.
- Change nothing outside `design/` for design work.
- The file format of a canvas (`canvas.json`, `.dc.html`, how files are published and removed) is described by the
  canvas itself: read the `SKILL.md` its artifact serves before the first publish of a session. This runbook only adds
  what is specific to this repo.
- On a canvas, files live under `project/`. `project/<path>` on the canvas is `design/canvas/<path>` in the repo, except
  `project/ds/**` (the design-system copy), which is not stored in the repo.

## Which canvas belongs to this branch

Each canvas has a pointer file in `design/canvases/`:

```json
{ "name": "baseline", "branch": "…", "canvas": "https://claude.ai/artifact/…", "canvasVersion": "…", "kit": { … } }
```

The canvas of the checked-out branch is the pointer whose `branch` equals `git branch --show-current`. If there is none,
or you were given a canvas link that is not that pointer's `canvas`, stop and ask: syncing a canvas into the wrong
branch overwrites that branch's screens.

`canvasVersion` is the canvas version at the last sync or refresh. The commit that last changed the pointer file is the
state of the repo at that moment (`git log -1 --format=%H -- design/canvases/<name>.json`).

## Sync (canvas → repo)

Run it when asked, at the start of a session that will touch the canvas, and before every refresh.

1. Read `project/canvas.json` from the canvas. The read reports the canvas's current version.
2. If it equals `canvasVersion`, nobody edited the canvas since the last sync or refresh: stop, there is nothing to do.
3. Otherwise list the canvas's files and read every file under `project/` outside `project/ds/`. Note the version
   again after the last read; if it changed while you were reading, start over.
4. Check what came from hand edits before writing anything:
   - a `/_blob/<id>` reference or an image note (`"kind": "image"` in `canvas.json`) is an upload that exists only on
     this canvas. Download it by its id, save it under `design/canvas/assets/`, point the screen at that file, and
     publish the corrected screen. If you cannot, stop and report it;
   - a file that is not a screen, `canvas.json`, `app.css` or under `assets/`: report it and leave it out.
5. Did the repo change since the pointer's commit (`git diff --quiet <that commit> HEAD -- design/canvas`)?
   - No: make `design/canvas/` a mirror of the canvas files. Write each file byte for byte, and delete repo files whose
     screen was deleted on the canvas. App-owned images (`screens.json` → `appAssets`) are not copied back.
   - Yes: both sides changed. Merge file by file with the pointer's commit as the base
     (`git merge-file <repo file> <file at that commit> <canvas file>`). On a conflict, stop and show the owner both
     versions. After a clean merge, publish the merged files to the canvas (a refresh).
6. Set `canvasVersion` to the canvas's version, commit `design/canvas/` and the pointer together, and push.

Never reformat a canvas file. Biome and editors are configured to leave `design/canvas/` alone.

## Refresh (repo → canvas)

1. Sync first.
2. Publish every file under `design/canvas/` to `project/<same path>`, and every entry of `screens.json` →
   `appAssets` (canvas path → repo file). A missing source file is an error: stop.
3. Remove from the canvas every file under `project/`, outside `project/ds/`, that this branch does not have.
4. Design system: the canvas must carry exactly the pinned copy (pointer → `kit`).
   - If `project/ds/<kit.folder>/` is missing, install it from `kit.designSystem` **at `kit.designSystemVersion`**
     (the publish call's `{artifact, path, ver}` source), never from its current version. The files are the keys of
     `kit.files`.
   - Verify: download the installed files and compare their SHA-256 with `kit.files`
     (`baseline-check/render-canvas.cjs` does this for a downloaded copy). On a mismatch, or if the pinned version
     cannot be fetched, stop and report. Do not fall back to the latest version.
   - Remove any other folder under `project/ds/`.
5. Set `canvasVersion` to the version the publish reports, commit the pointer, and push.

## Editing screens

1. Sync.
2. Edit the files in `design/canvas/`. Conventions that keep screens faithful and the canvas runtime happy:
   - mount kit components (`GovUiKit.*`) wherever the app uses one; app layout goes through the classes of `app.css`,
     which name the app source they mirror;
   - a class passed to a kit component must exist in the kit stylesheet or in `app.css`, or it silently does nothing;
   - items of a kit list that paginates (`DataList.Container` followed by `DataList.Pagination`) are written one per
     line at the start of the line, not looped or indented: the kit counts the list's direct children, and the canvas
     runtime counts a loop as one child and indentation as another;
   - a row of a kit `DefinitionList` that is not the last one is wrapped in `<div class="dl-row">`, and text content
     that a kit component must receive as a string goes in the `children` attribute. The canvas wraps every mounted
     component in an element of its own, which hides both from the kit;
   - `style` on a mounted component only positions it. Use `class-name` for anything else;
   - mock values come from `baseline-check/data.cjs`. Dates that a kit component prints relative to now are written as
     offsets from `Date.now()`; absolute dates are fixed text matching the reference;
   - link only to screens that exist; use `#` until the target is drawn;
   - a new screen gets an entry in `screens.json` → `screens` and its name on a row of `screens.json` → `pages`;
     then `node design/baseline-check/layout-canvas.cjs` places it in `canvas.json`. Set its board's `h` to its
     rendered height at 1440 px.
3. Check: `node design/baseline-check/compare.cjs` (see its README; it needs the canvas runtime and the kit copy
   downloaded from the canvas). Every screen must render without errors and match its reference.
4. Refresh, then commit screens and pointer together.

## Starting an exploration

Needs the owner's OK for the branch name.

1. From the baseline branch: `git switch -c exploration/<name>`.
2. Create a new canvas from the Design type, titled after the exploration. Read its `SKILL.md`.
3. Add `design/canvases/<name>.json`: `name`, `branch`, the new canvas link, and the `kit` block copied from
   `baseline.json`.
4. Refresh (this publishes the screens and installs the pinned kit), commit, push.
5. Give the owner the canvas link. It is private until they share it.

The exploration may delete screens it does not need from its canvas; a later merge would then delete them from the
baseline, so restore them (`git checkout <baseline> -- design/canvas/<file>`) before handover.

## Handover and after the merge

Before handover: the chosen version sits in the original screen files, variants are deleted, raw values introduced by
hand edits are replaced by kit tokens where one exists, and `compare.cjs` renders every screen without errors.

After the pull request merged:

1. On the baseline branch, refresh the baseline canvas.
2. Delete `design/canvases/<name>.json` (if the pull request did not already) and commit.
3. Ask the owner whether to delete the exploration's canvas.
4. Note the screens whose reference screenshots are now out of date for the next baseline check.

## Checking the baseline against the app

Tooling and commands: [baseline-check/README.md](baseline-check/README.md).

1. Start the mock backend and the app, capture into the scratch output folder.
2. Compare the new screenshots with `design/reference/`. With the fixed clock and the CMS snapshot, an unchanged app
   gives identical files; a file that differs is a real change in the app.
3. For each changed page, show the owner the before and after. They decide:
   - intended change: update the screen until `compare.cjs` passes against the new screenshot, then retake that
     reference with `--update`;
   - app bug: file it; leave reference and screen as they are.
4. Commit references and screen changes together. Say in the commit which app commit the references were taken from.

## Updating the kit

Only when the owner decides to move to a newer kit (after the design system was re-synced from `packages/gov-ui-kit`,
see `packages/gov-ui-kit/design-system/SYNC.md`).

1. Read the design system's README for the kit version and the commit it was built from, and its current version id.
2. Update the pointer's `kit` block (version, commit, `designSystemVersion`) and install that version on the canvas.
   Download the installed files, put their SHA-256 into `kit.files`.
3. Run `compare.cjs`, fix the screens the new kit changed, refresh.
4. Commit as one change that names the old and the new kit version. Exploration canvases keep their own pin until
   their branch takes this commit and is refreshed.

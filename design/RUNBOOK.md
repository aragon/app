# Runbook: canvases and branches

For a Claude Code session. A canvas cannot read or write the repo; a session moves the files both ways. These steps
were written on 19 November 2026 and **have not yet been run by a session starting from this file alone**, except
where marked. Where a step fails, fix this file.

The model: **one ticket = one chat session = one branch = one canvas.**

| | Reference | A ticket |
| --- | --- | --- |
| Branch | the branch `design/` lives on (`docs/design-prototypes` until it is merged, then `main`) | a branch off it |
| Canvas | "Aragon App prototypes", recorded in `canvases/prototypes.json` | its own canvas, recorded in `canvases/<name>.json` |
| Who edits the canvas | nobody: it is only ever published to | the designer |

Rules: create a branch, a canvas or a pull request only when the owner asked for it. Never reformat a file in
`design/canvas/` (Biome and editors are configured to leave it alone). Images are written as literal paths in the
files (`assets/networks/base.svg`); the scripts swap them for the canvas's uploads and back.

## Start a ticket: a new canvas from the repo

1. Branch off the reference branch. Pick a short canvas name (`proposal-filters`).
2. Create an empty Design canvas with the Artifact tool: `action: "quickstart"`, `intent: "design"` names the Design
   type; publish with its `type_url` and a title, no files. Note the new canvas's url. The create result carries the
   type's own instructions: follow them for how files are published, but **do not use the organisation's default
   design system** (it is the marketing brand). The prototypes use the Governance UI Kit only.
3. Give the canvas the kit. The prototypes load it from `project/ds/aragon-gov-ui-kit/`. Copy that folder's files
   from the reference canvas: list the reference canvas's files (`action: "list"`, `scope: "files"`, its url from
   `canvases/prototypes.json`), then publish to the new canvas with a `files` map entry per kit file,
   `"project/ds/aragon-gov-ui-kit/…": { "artifact": "<reference canvas url>", "path": "project/ds/aragon-gov-ui-kit/…" }`
   (a server-side copy). If the Design type offers its own way to attach the "Aragon Governance UI Kit" design
   system and it produces the same folder, that is fine too; say which you used.
4. `node design/publish/prepare-publish.cjs <folder> <name>` lists every image as needing an upload and copies them
   to `<folder>/uploads/`. Upload them to the new canvas (publish with `url`, `asset: true`, `file_paths`, up to 25
   a call). Write a JSON file mapping each image's path to the url its upload answered with, and run
   `node design/publish/record-assets.cjs <that file> <name>`. This creates `canvases/<name>.json`.
5. Run `prepare-publish.cjs <folder> <name>` again (it must exit 0) and publish `<folder>/project/` to the canvas:
   `file_path` = `<folder>/project/canvas.json`, `root` = `<folder>`, `files` = every other file under `project/`.
6. Add to `canvases/<name>.json`: `canvas` (the url), `branch`, `canvasVersion` (the version id the publish
   answered with), and `appCommit` and `kit` copied from `canvases/prototypes.json`. Commit and push.
7. Give the owner the link. The canvas is private to its owner until they share it.

## Pull: canvas → branch

Run when the designer says so ("sync", "pull it back"), and before every publish to a ticket's canvas.

1. List the canvas's files (Artifact `action: "list"`, `scope: "files"`). The answer names the canvas's version.
   If it equals `canvasVersion` in the record, nothing changed on the canvas: stop.
2. Read every file under `project/` except `project/ds/` into a folder (`action: "read"`, `paths`, `out_dir`).
3. `node design/publish/pull-canvas.cjs <folder> <name>` makes `design/canvas/` match: image urls go back to paths,
   files deleted on the canvas are deleted. Tested locally: publishing and pulling with no change gives an empty diff.
   - Exit code 2: an image was added on the canvas. Download it (read by its asset id), save it under
     `design/canvas/assets/`, record it with `record-assets.cjs`, run the pull again.
   - If the branch's `design/canvas/` also changed since the last publish or pull, do not overwrite: merge file by
     file (`git merge-file`), and on a conflict show the owner both versions.
4. New or removed frames: add a new prototype to `canvas-layout.json`, then `node design/publish/layout-canvas.cjs`
   (it fails if a file is mounted by no prototype). A variant the designer duplicated is a new file; ask whether it
   replaces the original or is dropped before the branch is handed over.
5. Check every prototype still loads (the load check is on `docs/design-canvas`, see README). Set `canvasVersion`,
   commit `design/canvas/` and the record together, push.

The branch's diff against the reference branch, limited to `design/canvas`, is now the design:
`git diff <reference>...<branch> -- design/canvas`.

## Publish: branch → its canvas

1. Pull first if the canvas's version differs from the record.
2. `prepare-publish.cjs <folder> <name>`; upload and record any image it lists; publish the changed files.
3. Set `canvasVersion`, commit, push.

## Refresh the reference canvas

When prototype files change on the reference branch (a ticket merged, or prototypes redrawn after an app change):
publish as above with no name (the record is `prototypes.json`). Nothing triggers this yet; who does it and when is
undecided.

## Finish a ticket

When its pull request merges, delete `canvases/<name>.json` in that pull request or the next, refresh the reference
canvas, and tell the owner the ticket's canvas can be deleted (only they can delete it).

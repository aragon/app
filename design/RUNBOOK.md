# Runbook: canvases and branches

For a Claude Code session. A canvas cannot read or write the repo; a session moves the files both ways. These steps
were written on 19 November 2026 and each has since been run once by a session starting from this file: starting a
ticket (2.5 minutes), saving a designer's changes made four ways (through a coding session, the canvas's chat, by
hand, and a tweak default), and implementing that design in the app. "Refresh the reference canvas" and "Finish a
ticket" have not been run. Where a step fails, fix this file.

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

0. `design/` exists only on the reference branch. Fetch it and check it out first
   (`git fetch origin docs/design-prototypes`), whatever branch the session started on.
1. Branch off the reference branch. Pick a short canvas name (`proposal-filters`).
2. Create an empty Design canvas with the Artifact tool, unless the owner gave you the url of one to use:
   `action: "quickstart"`, `intent: "design"` names the Design type; publish with its `type_url`, a title, no files
   and `auto_open: "after_first_write"`. Note the new canvas's url. The create result carries the type's own
   instructions: follow them for how files are published, but **do not use the organisation's default design
   system** (it is the marketing brand). The prototypes use the Governance UI Kit only.
3. `node design/publish/prepare-publish.cjs <folder> <name>` lists every image as needing an upload and copies them
   to `<folder>/uploads/` (exit code 2 is expected here; `<folder>` is any scratch folder outside the repo). Upload them to the new canvas (publish with `url`, `asset: true`, `file_paths`, up to 25
   a call). Write a JSON file mapping each image to the url its upload answered with; the image may be named by its canvas
   path (`assets/networks/base.svg`) or by the path of the file you uploaded, and run
   `node design/publish/record-assets.cjs <that file> <name>`. This creates `canvases/<name>.json`.
4. Run `prepare-publish.cjs <folder> <name>` again (it must exit 0).
5. Publish everything in **one** call (a publish always needs a `file_path`, so the kit cannot be copied in a call
   of its own): `url` = the new canvas, `file_path` = `<folder>/project/canvas.json`, `root` = `<folder>`, and a
   `files` = the contents of `<folder>/files.json` merged with `<folder>/kit-files.json` (both written by
   `prepare-publish.cjs`: the canvas's own files, and the Governance UI Kit copied server-side from the kit's own
   design system artifact, named in `canvases/prototypes.json` → `kit`). The person needs access to that artifact;
   they do not need access to the reference canvas.

   The canvas keeps the title you created it with in its header, but `canvas.json` carries the reference's title
   ("Aragon App prototypes"). Leave it: changing it would show up as a difference on every pull. The prototypes
   load the kit from that folder. `canvas.json` from the repo already carries the kit's
   `designSystems` record, so nothing else is needed for the canvas to count the kit as installed.
6. Add to `canvases/<name>.json`: `canvas` (the url), `branch`, `base` (the branch this ticket was cut from in
   step 1; the design is always read as the difference against it), `canvasVersion` (the version id the publish
   answered with), and `appCommit` and `kit` copied from `canvases/prototypes.json`. Commit and push the branch
   (the owner's OK to create the branch covers pushing it).
7. Give the owner the link. The canvas is private to its owner until they share it.

## Pull: canvas → branch

Run when the designer says so ("sync", "pull it back"), and before every publish to a ticket's canvas.

1. List the canvas's files (Artifact `action: "list"`, `scope: "files"`). Do not use the canvas's version to decide
   whether anything changed: it moves on its own (seen twice: when the Design type was updated, and seconds after a
   publish). Always pull and let the diff decide.
2. Read every file under `project/` except `project/ds/` into a folder (`action: "read"`, `paths`, `out_dir`). The
   paths have to be listed one by one, from step 1's listing.
3. `node design/publish/pull-canvas.cjs <folder> <name>` makes `design/canvas/` match: image urls go back to paths,
   files deleted on the canvas are deleted. Tested locally: publishing and pulling with no change gives an empty diff.
   - Exit code 2: an image was added on the canvas. Download it (read by its asset id), save it under
     `design/canvas/assets/`, record it with `record-assets.cjs`, run the pull again.
   - If the branch's `design/canvas/` also changed since the last publish or pull, do not overwrite: merge file by
     file (`git merge-file`), and on a conflict show the owner both versions.
4. New or removed frames: add a new prototype to `canvas-layout.json`, then `node design/publish/layout-canvas.cjs`
   (it fails if a file is mounted by no prototype). A variant the designer duplicated is a new file; ask whether it
   replaces the original or is dropped before the branch is handed over.
5. There is no load check on this branch (README, "What is not here"). Ask the owner to open the canvas, or say
   plainly that nothing was checked. Set `canvasVersion` to the listing's version (a record of when, not a test),
   commit `design/canvas/` and the record together, push.

6. Tell the person, in plain words and frame by frame, what changed on the canvas, as a designer would describe it,
   and ask whether that is what they did. They should never have to list their changes for you. Point out anything
   in the diff that does not look like a deliberate design change (reformatting, image addresses, layout churn).

## The UI kit on a canvas

The prototypes draw with the built Governance UI Kit, which is not in the repo. It lives in the kit's design system
artifact on claude.ai, which the design sync produces from `packages/gov-ui-kit`. A canvas gets a copy of it when it
is created and keeps that copy: it does not follow later kit changes.

If a kit component on a canvas looks or behaves differently from the app (a missing prop, an old style), the copy
is the first suspect:

1. Is the kit artifact itself behind the code? If `packages/gov-ui-kit` changed since the artifact's last sync, run
   the design sync for the kit first.
2. Then give the canvas the current kit: publish to it with the entries of `<folder>/kit-files.json`.
3. Check the prototypes still load, set `kit.version` in the canvas's record (and in `canvas.json` →
   `designSystems`) to the artifact's version, commit.

The reference canvas was last given the kit on 20 November 2026 (artifact version `1794992991-48d3`); all 13
prototypes loaded without errors against it at 1440 and 390 px.

## Tweaks

Tweaks (the controls under a frame's Tweaks button, declared in `data-props`) are welcome, including ones that
switch between design variants. One rule: **the default is the source of truth.** Whatever a tweak's default is, is
the design. At handover the default is what the engineer builds, and on the reference branch the default is what
the app has. A variant that lost can be cleaned out later, like a feature flag.

The branch's diff against its base, limited to `design/canvas`, is now the design:
`git diff origin/<base>...<branch> -- design/canvas ':!design/canvas/canvas.json'`.
`<base>` is the `base` field of `canvases/<name>.json`. A record without one (made before 20 November) was cut
from the reference branch in the table above. Never compare against `main` while `design/` is not on it: every
prototype file would show as new.

`canvas.json` is left out on purpose. It records where frames sit on the canvas, not what the app should look like,
and the canvas editor rewrites the whole file whenever a frame is moved by hand (in the first real round trip, about
1,700 changed lines for one frame removed and one moved). GitHub shows it collapsed as a generated file. Also
expect, and ignore, a re-quoted `data-props` line where a tweak's default was changed on the canvas.

## Implement a design

For a developer's session, on the ticket's branch. The design and the code live on the same branch and go in the
same pull request: do not create another branch.

1. Pull first if the ticket has a canvas, so the branch holds everything the designer did.
2. The design is the diff above (against the ticket's `base`, without `canvas.json`). Read the changed files in
   full, not only the changed lines. How to read a prototype file:
   - `<x-import component-from-global-scope="GovUiKit.X" …>` is the kit component `X`; attributes are its props in
     kebab case.
   - Plain elements with classes from `app.css` or `proto.css` are app layout. Build them with the app's own
     components and classes; do not copy the markup.
   - `renderVals()` and everything in it is mock data and prototype wiring, not spec.
   - A tweak's default is the design (see Tweaks).
   - The ticket's canvas (`canvases/<name>.json` → `canvas`) is there to look at when a file is ambiguous.
3. Before writing code, tell the person: in plain words what you understand the design change to be; which app
   files you will change; anything the design implies that is more than UI (new data, sorting, an API field) and
   anything it leaves undecided. Then wait for their go-ahead. If they named a part ("only the to-dos"), keep to it.
4. Implement in `apps/app` following the repo's `AGENTS.md` (changeset included), run type-check, lint and the tests
   for what you touched, and report the results as they are. Say plainly what you could not verify by running the
   app. No pull request unless asked.

Run once: five design changes were built in the app from this section, with type-check, lint and tests passing.
Nothing compared the result with the canvas by eye; a visual check as a last step here is proposed in the spec
and not built.

## Publish: branch → its canvas

1. Pull first if the canvas's version differs from the record.
2. `prepare-publish.cjs <folder> <name>`; upload and record any image it lists; publish with `files` from
   `<folder>/files.json` (or only the entries that changed).
3. Set `canvasVersion`, commit, push.

## Refresh the reference canvas

When prototype files change on the reference branch (a ticket merged, or prototypes redrawn after an app change):
publish as above with no name (the record is `prototypes.json`). Nothing triggers this yet; who does it and when is
undecided.

## Finish a ticket

When its pull request merges, delete `canvases/<name>.json` in that pull request or the next, refresh the reference
canvas, and tell the owner the ticket's canvas can be deleted (only they can delete it).

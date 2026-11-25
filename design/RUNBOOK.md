# Runbook: canvases and branches

For a Claude Code session. A canvas cannot read or write the repo; a session moves the files both ways. These steps
were written on 19 November 2026 and each was then run once by a session starting from this file: starting a
ticket (2.5 minutes), saving a designer's changes made four ways (through a coding session, the canvas's chat, by
hand, and a tweak default), implementing that design in the app, and catching up with `main`. On 23 November
creating a canvas stopped touching git, and saving and updating were reworked around that; Create, Save and Update
have not been run as they now read. "Finish a ticket" has not been run either. Where a step fails, fix this file.

The model: **one ticket = one chat session = one branch = one canvas.**

| | Reference | A ticket |
| --- | --- | --- |
| Branch | `main` | a branch off it |
| Canvas | "Aragon App prototypes", recorded in `canvases/prototypes.json` | its own canvas, recorded in `canvases/<name>.json` from its first save |
| Who edits the canvas | nobody: it is only ever published to | the designer |

Rules: create a branch, a canvas or a pull request only when the owner asked for it. Never reformat a file in
`design/canvas/` (Biome and editors are configured to leave it alone). Images are written as literal paths in the
files (`assets/networks/base.svg`); the scripts swap them for the canvas's uploads and back.

Prototype files are large, so keep a session from reading more of them than its task needs:

- Open the parts the task names, never `design/canvas/` as a whole. For a catch-up those are the parts
  `affected.cjs` lists.
- Publish to an existing canvas only the files that changed: each replaced file has to be read first.
- Let the scripts move files. A prototype is never copied through the model.

## The record, and what touches git

Every canvas has a record: which canvas it is, what it was made from, and where each image was uploaded on it. The
scripts find it by the canvas's name. It starts as a draft in `design/.runtime/canvases/<name>.json`, which git
ignores, and the first save moves it to `design/canvases/<name>.json`, where it is committed with the design. A
canvas made to try something, or to look at someone's pull request, therefore never shows up in git.

Of the three canvas commands, **only Save commits and pushes.** Create and Update do neither.

A lost record: a draft exists only in the checkout that created the canvas. If it is gone before the first save, the
canvas can still be saved. Create an empty record (`record-assets.cjs` with a file holding `{}`), add `canvas`,
`base` and `sourceCommit` as in Create step 6, and run Save. The pull lists every image as an unknown upload and
leaves its url in the files; `git diff design/canvas` then shows, line by line, which path each url replaced. Record
those pairs with `record-assets.cjs` and pull again. A url that replaced no path is an image added on the canvas.

## Load check

`node design/publish/check-canvas.cjs` renders every prototype through the canvas's own runtime at 1440 and 390 px and
fails (exit code 1) on page errors, a part's error box, a frame that never mounts, a missing file, or sideways
overflow. Give names to check only some (`Workspace Dao`, or with a query: `"Workspace?welcome=1"`), `--width` for
one width, `--now <ISO time>` to freeze the clock, `--shots` for screenshots in `design/.runtime/shots/`, and
`--eval <file.js>` to run a click-through (one async JS expression; use real pointer events for tabs, menus and
accordions). Click-throughs belong to the session that wrote them and are not kept. A full run takes about a minute.

It needs two files the repo does not hold (the runtime is claude.ai's code; the kit is a build). Read them once per
session from the canvas being checked, with the Artifact tool, `action: "read"`, `out_dir` = `design/.runtime`
(gitignored), `paths`: `artifact-type/dc-runtime.js` and `project/ds/aragon-gov-ui-kit/<file>` for each file in
`<folder>/kit-files.json`. Without them the script stops and says so.

A passing check means the prototypes open and work. It does not mean they match the app.

## Create a canvas

Makes a private canvas from the checkout and ends with its link. No branch, no commit, no push: the same steps
serve a new ticket, an idea, and a look at someone's pull request.

1. Use the checkout as it is: the branch the person named, or the one the session is on, with no uncommitted
   changes under `design/`. Pick a short canvas name (`proposal-filters`) that neither `design/canvases/` nor
   `design/.runtime/canvases/` has yet.
2. Create an empty Design canvas with the Artifact tool, unless the owner gave you the url of one to use:
   `action: "quickstart"`, `intent: "design"` names the Design type; publish with its `type_url`, a title, no files
   and `auto_open: "after_first_write"`. Note the new canvas's url. The create result carries the type's own
   instructions: follow them for how files are published, but **do not use the organisation's default design
   system** (it is the marketing brand). The prototypes use the Governance UI Kit only.
3. `node design/publish/prepare-publish.cjs <folder> <name>` lists every image as needing an upload and copies them
   to `<folder>/uploads/` (exit code 2 is expected here; `<folder>` is any scratch folder outside the repo). Upload them to the new canvas (publish with `url`, `asset: true`, `file_paths`, up to 25
   a call). Write a JSON file mapping each image to the url its upload answered with; the image may be named by its canvas
   path (`assets/networks/base.svg`) or by the path of the file you uploaded, and run
   `node design/publish/record-assets.cjs <that file> <name>`. This creates the draft record,
   `design/.runtime/canvases/<name>.json`.
4. Run `prepare-publish.cjs <folder> <name>` again (it must exit 0).
5. Publish everything in **one** call (a publish always needs a `file_path`, so the kit cannot be copied in a call
   of its own): `url` = the new canvas, `file_path` = `<folder>/project/canvas.json`, `root` = `<folder>`, and a
   `files` = the contents of `<folder>/files.json` merged with `<folder>/kit-files.json` (both written by
   `prepare-publish.cjs`: the canvas's own files, and the Governance UI Kit copied server-side from the kit's own
   design system artifact, named in `canvases/prototypes.json` → `kit`). The person needs access to that artifact;
   they do not need access to the reference canvas.

   The canvas keeps the title you created it with in its header, but `canvas.json` carries the reference's title
   ("Aragon App prototypes"). Leave it: changing it would show up as a difference on every save. The prototypes
   load the kit from that folder. `canvas.json` from the repo already carries the kit's
   `designSystems` record, so nothing else is needed for the canvas to count the kit as installed.
6. Add to the record: `canvas` (the url), `canvasVersion` (the version id the publish answered with), `base` (the
   branch the checkout is on; the design is always read as the difference against it), `sourceCommit`
   (`git rev-parse HEAD`), and `appCommit` and `kit` copied from `canvases/prototypes.json`. Then
   `node design/publish/canvas-digest.cjs <folder>/project <name> --record`, which is how Update later tells
   whether the canvas was edited.
7. Give the owner the link and stop. The canvas is private to its owner until they share it. Putting it in the
   repo is Save, and only when they ask.

## Save a canvas: canvas → branch

Puts what is on the canvas into the repo: one commit on the ticket's branch, pushed. Run it when the person asks
to save, and never as a step of something else.

- **Which branch.** A canvas saved before: the branch in its record (`branch`); switch to it. A first save: a new
  branch cut from the commit the canvas was made from, `git switch -c design/<name> <sourceCommit>`, or the branch
  the person named. Be on it before step 3, and say which branch before you push. Never `main`, and never the
  branch of a pull request the canvas was only made to look at, unless they said so.
- **Whose commit.** The person's, not the agent's: root `AGENTS.md`, "Commits from interactive agent sessions".

1. List the canvas's files (Artifact `action: "list"`, `scope: "files"`). Do not use the canvas's version to decide
   whether anything changed: it moves on its own (seen twice: when the Design type was updated, and seconds after a
   publish). Always read the files and let the diff decide.
2. Read every file under `project/` except `project/ds/` into a folder (`action: "read"`, `paths`, `out_dir`). The
   paths have to be listed one by one, from step 1's listing.
3. `node design/publish/pull-canvas.cjs <folder> <name>` makes `design/canvas/` match: image urls go back to paths,
   files deleted on the canvas are deleted. Tested locally: publishing and pulling with no change gives an empty diff.
   - Exit code 2: an image was added on the canvas. Download it (read by its asset id), save it under
     `design/canvas/assets/`, record it with `record-assets.cjs`, run the pull again. If it is an image the repo
     already has (an update in another session uploaded it), record the url against that path and save no copy.
   - If the branch's `design/canvas/` also changed since the canvas last got the repo's files, do not overwrite:
     merge file by file (`git merge-file`), and on a conflict show the owner both versions.
4. New or removed frames: add a new prototype to `canvas-layout.json`, then `node design/publish/layout-canvas.cjs`
   (it fails if a file is mounted by no prototype). Give a new file an entry in `sources.json` and drop a removed
   file's entry (`node design/publish/affected.cjs --check` fails otherwise). A variant the designer duplicated is a
   new file; ask whether it replaces the original or is dropped before the branch is handed over.
5. Nothing changed under `design/canvas/`: there is nothing to save. Run step 6's digest command, tell the person, and
   stop without a commit. Otherwise run the load check (above) on the prototypes whose files changed.
6. The record: set `canvasVersion` to the listing's version (a record of when, not a test) and run
   `node design/publish/canvas-digest.cjs <folder>/project <name> --record`. On a first save also set `branch`, and
   move the record to where git sees it: `mv design/.runtime/canvases/<name>.json design/canvases/<name>.json`.
7. Commit `design/canvas/`, the layout files if they changed, and the record together, as the person; push.
8. Tell the person, in plain words and frame by frame, what changed on the canvas, as a designer would describe it,
   and ask whether that is what they did. They should never have to list their changes for you. Point out anything
   in the diff that does not look like a deliberate design change (reformatting, image addresses, layout churn).
9. Once they confirm, write two fields into `canvases/<name>.json`, commit as the person and push: `intent`, one or two sentences
   in their words on what the change is for, and `states`, a list of the states that matter, each a short name and
   how to reach it (a tweak, or the clicks). Ask for what the canvas cannot show: the loading, empty and error cases
   the engineer should build. Whoever implements the design reads these and does not have to guess.

## The UI kit on a canvas

The prototypes draw with the built Governance UI Kit, which is not in the repo. It lives in the kit's design system
artifact on claude.ai, which the design sync produces from `packages/gov-ui-kit`. A canvas gets a copy of it when it
is created and keeps that copy: it does not follow later kit changes.

If a kit component on a canvas looks or behaves differently from the app (a missing prop, an old style), the copy
is the first suspect:

1. Is the canvas's copy behind the kit artifact? Compare file contents (sha256 of each file in
   `<folder>/kit-files.json` on both artifacts, from a `list` with `scope: "files"`), never version numbers: an
   artifact's version moves on its own with no change to its files.
2. Is the kit artifact behind the code? The design sync is described in `packages/gov-ui-kit/design-system/SYNC.md`
   (a kit and Storybook build; no previews). After a sync, set `kit.sourceCommit` and `kit.version` in
   `canvases/prototypes.json`. It publishes to the shared design system artifact, so it needs the person's
   say-so on its own; an OK for a catch-up or a ticket does not cover it.
3. Give the canvas the current kit: publish to it with the entries of `<folder>/kit-files.json`.
4. Check the prototypes still load, and set `kit.version` in the canvas's record (and in `canvas.json` →
   `designSystems`) to the artifact's version. No commit here: on a ticket it goes in with the next save, on the
   reference canvas with the refresh.

**A kit component the app uses that the kit artifact does not have yet** (it was added to the kit after the last
sync): ask whether to run the sync first. If not, draw it in the prototype with kit tokens and `app.css` rules, mark
the element `data-stands-in-for="<Component>"`, and add it to the README's known gaps, so the next session that has
the synced kit replaces it.

The kit was last synced from `main` at `054ac8b47` (25 November 2026, kit 3.1.0): `kit.sourceCommit` records it.

## Tweaks

Tweaks (the controls under a frame's Tweaks button, declared in `data-props`) are welcome, including ones that
switch between design variants. One rule: **the default is the source of truth.** Whatever a tweak's default is, is
the design. At handover the default is what the engineer builds, and on `main` the default is what
the app has. A variant that lost can be cleaned out later, like a feature flag.

The branch's diff against its base, limited to `design/canvas`, is now the design:
`git diff origin/<base>...<branch> -- design/canvas ':!design/canvas/canvas.json'`.
`<base>` is the `base` field of `canvases/<name>.json`: `main`, unless the ticket was cut from another branch.

`canvas.json` is left out on purpose. It records where frames sit on the canvas, not what the app should look like,
and the canvas editor rewrites the whole file whenever a frame is moved by hand (in the first real round trip, about
1,700 changed lines for one frame removed and one moved). GitHub shows it collapsed as a generated file. Also
expect, and ignore, a re-quoted `data-props` line where a tweak's default was changed on the canvas.

## Implement a design

For a developer's session, on the ticket's branch. The design and the code live on the same branch and go in the
same pull request: do not create another branch.

1. Build from the saved ticket diff. If the canvas has newer edits, ask its owner to save them first.
2. The design is the diff above (against the ticket's `base`, without `canvas.json`). Read the changed files in
   full, not only the changed lines. How to read a prototype file:
   - `<x-import component-from-global-scope="GovUiKit.X" …>` is the kit component `X`; attributes are its props in
     kebab case.
   - Plain elements with classes from `app.css` or `proto.css` are app layout. Build them with the app's own
     components and classes; do not copy the markup.
   - `renderVals()` and everything in it is mock data and prototype wiring, not spec.
   - A tweak's default is the design (see Tweaks).
   - `canvases/<name>.json` → `intent` and `states` say what the change is for and which states to build. If they
     are missing, ask the designer before building.
   - The ticket's canvas (`canvases/<name>.json` → `canvas`) is there to look at when a file is ambiguous.
3. Before writing code, tell the person: in plain words what you understand the design change to be; which app
   files you will change; anything the design implies that is more than UI (new data, sorting, an API field) and
   anything it leaves undecided. Then wait for their go-ahead. If they named a part ("only the to-dos"), keep to it.
4. Implement in `apps/app` following the repo's `AGENTS.md` (changeset included), run type-check, lint and the tests
   for what you touched (and the load check if you changed a prototype), and report the results as they are. Say plainly what you could not verify by running the
   app. No pull request unless asked.

Run once: five design changes were built in the app from this section, with type-check, lint and tests passing.
Nothing compared the result with the canvas by eye; a visual check as a last step here is proposed in the spec
and not built.

## Update a canvas: branch → canvas

Replaces the canvas's files with the checkout's. No commit, no push. On the ticket's branch for a saved canvas.

1. Read the canvas as in Save steps 1 and 2, then `node design/publish/canvas-digest.cjs <download>/project <name>`.
   - Exit code 0: nobody edited the canvas since the repo last saw it. Go on.
   - Exit code 2: the canvas has edits that are not in the repo, or the record cannot tell. Stop, say so, and
     offer to save first. Never update over them.

   The read is also what the tools ask for: the Artifact tool refuses a publish to a canvas this session has not
   read, and the Design type asks that each file you replace is read first.
2. `prepare-publish.cjs <folder> <name>` into a fresh folder; upload and record any image it lists, and run it
   again until it exits 0.
3. Publish: `url` = the canvas, `file_path` = `<folder>/project/canvas.json`, `root` = `<folder>`, `files` = the
   entries of `<folder>/files.json` for the files that changed (`diff -rq <folder>/project <download>/project` names
   them). A file in step 1's listing that `<folder>/project/` does not have was deleted
   in the repo: add `"project/<file>": null` to `files` for each, or it stays on the canvas.
4. The record: set `canvasVersion` to the version the publish answered with and run
   `node design/publish/canvas-digest.cjs <folder>/project <name> --record`. A saved canvas's record is a tracked
   file: leave the change in the checkout, uncommitted. It goes in with the next save.

## Refresh the reference canvas

When prototype files change on `main` (a ticket merged, or a catch-up): Update with no name in
`prepare-publish.cjs`, and `prototypes` as the name in `canvas-digest.cjs` (the record is `canvases/prototypes.json`).
Nobody designs on the reference canvas, so exit code 2 in step 1 means someone edited it, or that its record is
older than the check: stop and ask before overwriting. Its record lives on `main`: the change to it goes in the pull
request the refresh belongs to (a catch-up's, or the one that finishes a ticket).

## Catch up with main

A design ticket keeps its prototypes current by itself: design and code merge together. This is for the other kind
of change, app code changed with no design ticket, which leaves a prototype behind without anything noticing.
`canvases/prototypes.json` → `appCommit` is the app commit the prototypes were last brought in line with.

Follow every step in order, in CI too. Each one exists because a run without it missed something; the examples say
what.

### 1. Fix the range

Work on a branch off an up-to-date `main`, or off the release branch when catching up a release. Write down two
commits: `base` = `appCommit`, and `head` = the tip of `main` (or of the release branch): `git rev-parse origin/main`.
`head` must be a commit that will exist on `main` after the merge. Never your branch's own commits or a merge commit
of your branch: a squash merge drops them and the next catch-up cannot resolve its range.

### 2. Get the reading list

`node design/publish/affected.cjs --base <base> --head <head>` lists every changed app file, kit file and string
with the prototype parts that show it (map: `design/sources.json`), and the changed UI files no part covers. Keep the
report: it is the reading list. Read every listed diff once (`git diff <base> <head> -- <file>`); skip nothing it
lists, however many there are.

### 3. Write the ledger: one row per file and part

Write `design/.runtime/catch-up-ledger.md` with **one row for every (file, part) pair** in the report: app files, kit
files and strings alike. A file listed for five parts gets five rows. Columns: file, part, verdict, evidence. The
verdict is exactly one of:

| Verdict | Meaning | Evidence required |
| --- | --- | --- |
| `no visible change` | The diff changes nothing this part draws (logic, types, tests, props it does not use) | One line on what the diff changes |
| `already there` | The part already draws the new version | The line of the part that shows it |
| `behind` | The part draws the old version | The app line and the part's line that differ |
| `no prototype` | The change is a page, dialog or state no part draws | Its name |

Judge each part on its own. The same app component is drawn separately in several prototypes, and fixing it in one
fixes nothing in the others. *25 November, CI: the sidebar's user row lost its chevron in the app; the run fixed
`WsNav` and left `DaoNav`, both listed for the same file.*

No row may be blank, and "not opened" or "probably fine" is not a verdict. Before going on, count: the ledger has
exactly as many rows as the report has (file, part) pairs.

### 4. Find the copies the map does not know

For every `behind` row, search all of `design/canvas/` for what changed: its class names, its text, the kit
component or app component name (`grep -rn "ws-acc-item" design/canvas`, or the Grep tool). Every other file that
draws the same thing gets its own ledger row, marked `(not in map)`, even though the report did not list it, and
the missing source goes in the report to the person as a change for `design/sources.json`. *25 November, CI:
`WsProposals` draws its own copy of the select-account dialog, which the map ties only to `WsTransactionsAccountDialog`;
the run fixed the dialog and left the copy.*

### 5. Check the two things no diff shows

**a. The kit the canvases have.** Canvases draw with the kit as synced at `kit.sourceCommit` in
`canvases/prototypes.json`, not with the kit in the repo. `git log --oneline <kit.sourceCommit> <head> --
packages/gov-ui-kit/src` lists kit changes canvases do not have. **Never use a kit component or prop added in that
range**: on a canvas it renders nothing or fails, and the load check passes anyway when it runs with a newer kit.
Draw it with kit tokens and `app.css`, mark it `data-stands-in-for="<Component>"`, and list it. Interactively, first
ask whether to run the design sync (`packages/gov-ui-kit/design-system/SYNC.md`). *25 November, CI: the run gave
account avatars the kit's new `badge` prop; with the canvas's kit, zero badges render.*

**b. The feature flags.** The prototypes show the flag values recorded in `canvases/prototypes.json` → `flags`
(`values`, for `environment`, with `except` overriding). Read the current values from `feature-flags.json` in
`aragon/app-cms` (`main`): interactively from
`https://raw.githubusercontent.com/aragon/app-cms/main/feature-flags.json`, in CI from
`design/.runtime/feature-flags.json`, which the job fetches. A flag's value is its value for `environment`, else its
`production` value, else `defaultValue` in `apps/app/src/shared/featureFlags/featureFlags.constants.ts`; then apply
`except`. For every flag whose value differs from `values`, find what it gates
(`grep -rn "isEnabled('<flag>')\|'<flag>'" apps/app/src`) and add ledger rows for each part that draws it. Update
`values` once the parts match. *A flag change is not in any app diff: on 25 November the Automation section and the
existing-conditions option were only found because the designer pointed at `app-cms`.*

### 6. Report to the person

A table of the `behind` rows: what changed in a designer's words, the commit, the app file and lines, the prototype
file, a size. Then the `no prototype` rows as "listed, not built", and any `(not in map)` sources. Error, loading
and failure variants are left out of the prototypes on purpose (a prototype has no backend and must never leave a
designer stuck): list them, do not build them. A new page is built only when the person asks. Wait for the person;
if they said to carry on without them, continue and leave undone anything that needs a product decision.

### 7. Fix

Fix every `behind` row from the app's source, following `BRIEF.md`. Work alone when most fixes touch the same files
(often `app.css`); otherwise one agent per group of files, never two on the same file. Prove each fix by clicking
(`check-canvas.cjs --eval`, real pointer events), not only by loading.

### 8. Verify before recording

- Every `behind` row is fixed or listed as left out with its reason.
- Run `affected.cjs` again over the same range and recount: every (file, part) pair still has a row.
- The load check on every prototype, at 1440 and 390 px, with the kit of `kit.sourceCommit` in `design/.runtime/`
  (read from the canvas), not a newer one.

### 9. Record and hand over

`node design/publish/affected.cjs --record <head>` (the `head` from step 1). Add what was left out to the README's
known gaps; update the README's file count and prototype list if they changed; add the run to the table below.
Commit, push, open the pull request with the step 6 table as its description. After it merges, refresh the
reference canvas.

It finds what changed, and what a flag or the kit changed. It does not find a prototype that was wrong from the
start; only someone looking does.

### In CI

`app-design-catch-up.yml` runs this section when the app release PR opens, or by hand for a branch. The script runs
first, and when it lists no part nothing else runs. Otherwise a headless session follows steps 2 to 8 above, with
these differences:

- Nobody is there to ask. Skip the wait in step 6 and leave undone anything that needs a product decision; never
  run the design sync.
- Search with the Grep tool (step 4) and read the flags from `design/.runtime/feature-flags.json` (step 5b). If that
  file is missing, say so at the top of the report: the flags were not checked.
- No load check, no clicking and no canvas refresh: CI reaches neither the runtime nor the canvases. Name every
  prototype file you changed under "Check on a canvas" at the top of the report. The designer checks them before
  merging.
- Change files only under `design/`. `design/sources.json` is locked: list missing sources in the report instead.
- Write the report from step 6, then the whole ledger inside `<details><summary>Ledger</summary>…</details>`, to
  `design/.runtime/catch-up.md`: it becomes the pull request's description.
- The job, not the session, sets `appCommit` and opens the pull request into the release branch. The release's
  Slack thread and a comment on the release PR get one line: a ping to check that pull request, or that nothing
  was behind, or that the run failed. A failed run does not hold the release; the next run covers the same range again.

Runs so far:

| Date | Range | What it found | Time |
| --- | --- | --- | --- |
| 20 November 2026 | 16 to 19 November, 139 app files | 10 behind, 8 fixed by two agents, 2 error states left out | Under an hour, improvised; this section was written afterwards |
| 21 November 2026 | 19 to 20 November, 150 files (mostly one pull request) | 11 behind, all fixed; new pages listed, not built; two new kit components drawn by hand | About 20 minutes, by an agent with no prior context following this section, which it then corrected |

## Finish a ticket

When its pull request merges, delete `canvases/<name>.json` in that pull request or the next, refresh the reference
canvas, and tell the owner the ticket's canvas can be deleted (only they can delete it).

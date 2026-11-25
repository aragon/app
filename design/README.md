# Design prototypes

Live prototypes of the Aragon App's flows, for designing on a claude.ai design canvas before engineering builds the
change. A prototype is one frame per flow: it holds state and redraws on each click, at desktop and phone width. A
design is a diff of these files on a ticket's branch, and it merges together with the code that implements it.
`RUNBOOK.md` has the steps.

Two earlier ideas, static screens and exported snapshots, are kept for reference on the branches
`docs/design-canvas` and `docs/design-snapshots`. Nothing here is built, deployed or released. The one workflow
that touches it, `app-design-catch-up.yml`, brings the prototypes up to an app release when its PR opens.

## What is here

| Path | What it is |
| --- | --- |
| `canvas/*.dc.html` | Thirteen prototypes and the parts they are built from (111 files) |
| `canvas/app.css` | The app's page layout, transcribed by hand. It came from idea 1 and also holds rules for pages that have no prototype yet |
| `canvas/proto.css` | The few rules only the prototypes need |
| `canvas/canvas.json` | The canvas layout: which frames exist and where they sit. Written by `publish/layout-canvas.cjs`, not by hand |
| `canvas-layout.json` | The source of the layout: the prototypes, in rows. Which part goes on which parts page is worked out from what each prototype mounts |
| `canvas/assets/mock/` | Mock DAO avatars and token logos |
| `app-assets.json` | Images the prototypes show that belong to the app (chain logos), by path in the repo |
| `canvases/prototypes.json` | Which canvas these files are published to, each image's upload on it, the kit version, and the app commit the prototypes were built from |
| `canvases/<name>.json` | A ticket's canvas, on that ticket's branch from its first save: the same record, plus the branch it was cut from and, once the design is saved, its `intent` and the `states` that matter |
| `sources.json` | Which app code each part shows, and its route. `publish/affected.cjs` reads it to list the parts a range of app changes touched |
| `publish/` | Scripts that prepare the files for a canvas, pull a canvas's files back, lay the canvas out, load-check the prototypes (`check-canvas.cjs`; see `RUNBOOK.md`, "Load check") and list the parts behind the app (`affected.cjs`; "Catch up with main") |
| `RUNBOOK.md` | Steps for a Claude Code session: a new canvas for a ticket, saving a designer's changes into a branch, updating a canvas, implementing a design, catching up with the app |
| `../skills/shared/aragon-app-canvas*/` | The commands. `/aragon-app-canvas-create` makes a canvas from a branch and touches nothing in git. `/aragon-app-canvas-save` puts what was changed on a canvas into its branch as a commit. `/aragon-app-canvas-update` brings the repo's files onto a canvas. `/aragon-app-canvas` followed by plain words ("refresh the main canvas", "implement this design") covers those and the rest. All of them point a session at the runbook |
| `BRIEF.md` | What a Claude agent is given to build or update a prototype, including the canvas pitfalls |

The prototypes:

- `Explore.dc.html`: the explore page. The entry point; it links to the DAO and the two creation wizards. With
  `workspaces` on (as here) the app now serves it at `/explore`, and `/` is a sign-in landing page that has no prototype.
- `Dao.dc.html`: one mock DAO (Meridian, token voting). Pages: dashboard, proposals, proposal detail, members, member
  detail, assets, transactions, settings, permissions, governance process detail. Connect wallet and the user menu;
  voting, simulating and executing a proposal; delegation; transaction type tabs and the transaction detail dialog.
- `CreateDaoFlow.dc.html`: the create DAO wizard, with validation and a simulated publish transaction.
- `CreateWorkspaceFlow.dc.html`: the create workspace wizard, including adding accounts.
- `CreateProposalFlow.dc.html`: the create proposal wizard for the token-voting DAO: describe, add a transfer action,
  simulate, settings, publish.
- `SafeFlow.dc.html`: a Safe account page: balances, owners, pending transactions, review, approve and execute.
- `AtlasDao.dc.html`: the multisig mock DAO (Atlas Grants Council): all its pages, approving and executing a proposal.
- `NorthstarDao.dc.html`: the multi-stage mock DAO (Northstar Protocol): all its pages, body tabs on members, proposal
  stages, approve, veto, advance and execute, with Safes as voting bodies.
- `CreateProcessFlow.dc.html`: the create governance process wizard with the governance designer: voting bodies,
  stages, stage settings, proposal creation rules, permissions, publish.
- `Workspace.dc.html`: a workspace holding the three mock DAOs and a Safe. All-accounts overview, to-dos, proposals,
  members, assets and transactions; the account selector; each account's pages, which are the same part files the
  DAO prototypes use; the Safe's dashboard and pending transactions.
- `SafeTransactionFlow.dc.html`: creating a Safe transaction from the workspace: add a contract, add an action,
  review, sign.
- `WrapFlow.dc.html`: wrapping and unwrapping a governance token, on the members page of a sample DAO.
- `LockFlow.dc.html`: lock-to-vote on a sample DAO: locking, unlocking, voting, and the dialogs between them.

Every other file is a part. Each prototype is responsive: the phone layout is the same file at a narrow width, so there are no separate phone frames.

The canvas is [Aragon App prototypes](https://claude.ai/artifact/NnpGqxhynigQPwVyKgsc5p). It is private; ask its
owner for access.

## Which app the prototypes show

Every prototype, and every canvas made from these files, shows **the app as it runs on a developer's machine from
`main`**, not what users see in production.

- **Code:** `main`. The first prototypes were built from commit `041dc08` (16 November 2026); later ones from `main`
  as it stood up to 18 November. On 20 November they were caught up with `main` of 19 November (`51c4622`), and on
  21 November with `main` of 20 November (`412581b`), which is what `canvases/prototypes.json` → `appCommit` records. `RUNBOOK.md`, "Catch up with main", has the procedure.
- **Feature flags:** each flag's `local` value, the one a developer's machine uses. Checked against a snapshot of
  the 16 flags taken in mid-November (`design/baseline-check/cms/feature-flags.json` on `docs/design-canvas`):

  | | Flags |
  | --- | --- |
  | On in the prototypes, off in production | `workspaces`, `safeAccountPage`, `capitalFlowAutomation`, `existingProposalCreationCondition` (and the developer-only `debugPanel`, `useMocks`) |
  | Off in the prototypes, on in production | `gateAdvancedGovernance` (the governance designer has a tweak that shows it) |
  | Same in both | the other nine |

  `workspaces` and `safeAccountPage` are also off in the deployed development environment in that snapshot, so the
  Workspace and Safe prototypes show something only a local build has. Since 20 November the code also turns
  `workspaces` on for the OCC soft-launch environment (new.app.aragon.org).
- **Data:** mock data written for this, not any real DAO.

So the prototypes are a picture of what is coming, which suits design work. No prototype can be switched to
"what production looks like", and the flag values above are a snapshot: they are not re-read when flags change.

## How they were made

On 18 November, six Claude Sonnet agents built the first four in parallel from `BRIEF.md`. The first version was on the canvas
12.8 minutes after the start and the set was complete at 14.8 minutes. The DAO pages and the explore page were made
by lifting the matching static screen from `docs/design-canvas` and making it live. The two wizards were built from
the app's source and reference screenshots.

A second batch the same day added create proposal, the Safe page and most of the DAO's interactions: eight agents,
about 28 minutes from start to canvas. A third added the governance designer, the multisig and multi-stage DAOs,
wrapping and lock-to-vote: five agents, about 31 minutes. A fourth added the workspace and creating a Safe
transaction: three agents. Create proposal and voting were ported from older prototypes on
`docs/design-canvas`.

## Layout of the canvas

The first page, Prototypes, has one frame per prototype in five rows: Start here, A DAO (one per governance type),
Workspace and Safe, Creating things, Token mechanics. The second page, Parts, holds the files the prototypes are
built from, in a titled row per group of prototypes with the shared parts first. The canvas shows every file as a
frame, so the parts have to sit somewhere; they are also where a page or dialog is edited. After adding or removing a canvas file, run `node design/publish/layout-canvas.cjs`: it rewrites
`canvas/canvas.json` and fails if a file is mounted by no prototype.

## Publishing

A canvas shows files; it cannot read the repo. A Claude Code session copies the files to it.

```sh
node design/publish/prepare-publish.cjs <folder>
```

writes the files to `<folder>/project/` with each image path swapped for that image's upload on the canvas, as
recorded in `canvases/prototypes.json` (a second canvas has a record of its own: pass its name as a second argument). The session then publishes that folder to the canvas with its Artifact tool.
If an image has no upload yet, the script lists it; after uploading, `publish/record-assets.cjs` records the urls.

The Governance UI Kit files the prototypes load (`ds/aragon-gov-ui-kit/…`) are not in the repo. Each canvas copies
them from the [design system artifact](https://claude.ai/artifact/XkBmSpR3iXii2onniUDV5x), which the design sync
builds from `packages/gov-ui-kit`. Anyone starting a canvas needs access to that artifact. `RUNBOOK.md`, "The UI kit
on a canvas", says what to do when a canvas's copy falls behind.

## What is not here

- **Reference screenshots, the mock backend and the static screens.** They are on `docs/design-canvas`. They are what
  an agent looks at to build a prototype for an area that has none.
- **A visual check of an implementation.** The design → code loop in `RUNBOOK.md` has been run once end to end: a
  ticket canvas from these files, a designer's changes saved back as a diff, and an agent building that design in
  the app. Nothing yet puts the built app next to the canvas. The spec proposes that as the last step of
  "Implement"; it needs the mock backend and capture scripts from `docs/design-canvas`.

## Known gaps in the prototypes

- **Safe.** The standalone Safe account frame is review-only; approving and executing a Safe transaction happens in
  the workspace, on the transaction's voting card, as in the app. The review dialog's warning states, rejecting a
  transaction and error states are not drawn. A Safe transaction created in "Create a Safe transaction" does not then
  appear in the workspace's queue. Everything Safe except the account page was built from source with no screenshot.
- **Safe transactions in the workspace.** An expanded Safe transaction follows the app's components (a voting card
  with Breakdown, Votes and Settings tabs, the simulation, the actions; an execution summary once executed), and a
  transaction can be rejected, which adds the rejection as its own row. Rebuilt from source on 20 November after a
  flattened, invented version was spotted. Not reachable, because the prototype has one connected owner and the
  Safe needs three: a rejection gathering enough approvals to execute, and a second owner approving an existing
  rejection. Not drawn: loading and load-error states, the "You" mark on the connected owner's vote, the gas-refund
  warning in the review, and the error states of the create Safe transaction dialog. A rejection does not appear in
  the to-dos. None of this has been compared with a screenshot.
- **Create proposal from the workspace** exits back to the workspace by carrying the account on the link. That works
  in the local check; whether the canvas keeps it when following a link between frames is not confirmed. If it does
  not, the wizard exits to the DAO as before. The "+ Proposal" buttons on an account's own pages inside the
  workspace still exit to the DAO.
- **Vote amounts do not reconcile.** On a proposal, the individual votes in the Votes tab do not add up to the totals in
  the Breakdown tab; the mismatch comes from the mock data.
- **The vote list is drawn by script.** `DaoProposal.dc.html` defines a small component in code for the Votes tab, so
  that list cannot be selected or edited on the canvas like the rest.
- **Create proposal:** only the Transfer action can be added; the other action types are listed and do nothing.
  Simulation always succeeds. "View proposal" lands on the DAO's dashboard, not on the new proposal.
- **Permissions:** the graph view is a still picture. "Uninstall process" does nothing.
- **Delegation:** the signing dialog does not show the delegate's row. "Add delegate statement" does nothing.
- **Proposals, members and assets have no filters, search or sort,** because the app shows none for a DAO with one
  governance process and no linked accounts.
- **One proposal (MGP-1) shows another proposal's page:** no screenshot of it was ever captured.
- **Member pages** show the right header per member, but the activity lists are always the same member's, and some
  balances are approximated.
- **Wrapping and lock-to-vote were built from the app's source alone.** No mock DAO uses those plugins, so there was no
  screen or screenshot to compare. They run on sample DAOs and sample data written into the prototypes.
- **Multi-stage DAO:** the eight proposals are one template driven by data, so a single proposal's markup cannot be
  edited on its own. Safe voting bodies skip the app's "is this wallet the Safe" check so the flow is never stuck.
  Token holders have no vote area, so a veto through the token body is not built.
- **Multisig DAO:** one existing approval is attributed to a different council member than in the mock data, so that
  the connected user has something to approve.
- **"+ Proposal" in the multisig and multi-stage DAOs opens the token-voting wizard.** It is the only one built.
- **Governance designer:** the import-token, lock-to-vote and external-address body variants, the inner states of
  steps 3 and 4, and "Remove stage" were carried over from an older prototype and only checked to render.
- **Create proposal draws part of its form by script** (`CreateProposalFlowActions.dc.html`), as the vote list does.
- **Workspace:** "Add account", "Workspace admin" and "Import workspace" do nothing. "New proposal" skips the app's pick-a-process step and always opens
  the token-voting wizard. A member's "other DAOs" rows leave the workspace for the standalone DAO prototype.
- **Create a Safe transaction** was built from the app's source alone (it merged days before and has no screenshot).
  Only a token `transfer` on one sample contract can be added.
- **Not built, because open pull requests are changing them:** suggested accounts in the create workspace wizard,
  creating a Safe, and the governance designer inside a workspace.
- **Not built, from the 21 November catch-up** (app pages that merged with no prototype): the sign-in landing page at
  `/` and disconnecting back to it; the Getting started wizard for a user with no workspace; the workspace admin page
  (details, accounts with "Remove from workspace", storage, export) and its Edit details dialog; the demo workspace;
  the empty state of a workspace with no accounts; "These actions are authorized by …" on a process's details page
  (no mock process has an execute-selector condition); the logo input's invalid-file-type error.
- **Workspace navigation draws two kit components by hand.** The joined selector block (`Dropdown.Group`) and the
  stacked avatars of "All accounts" (`AvatarStack`) are markup with `app.css` rules in `WsNav.dc.html`, like the rest
  of the selectors: the kit `Dropdown` trigger cannot mount on the canvas, and neither component is in the kit's
  design system artifact yet (synced from `0cce3df`, 18 November). Kit-only changes since then (the `Avatar` badge and
  its fallback text sizes) are not on the canvas either, until the kit's design sync is run. Both are marked `data-stands-in-for`, so a session with the synced kit can find and replace them.
- **The workspace welcome dialog** opens when the workspace is entered from "View workspace" at the end of create
  workspace, by carrying `?welcome=1` on the link; whether the canvas keeps the query when following a link between
  frames is not confirmed (see "Create proposal from the workspace").
- **Governance designer at phone width:** in the stage settings dialog the value label of the approval threshold bar
  hangs about 15 px past the window's edge.
- **Deliberately inert controls** (they exist in the app and do nothing here): Copy buttons, "Download as JSON",
  "Ask Aragon", "Open support chat", "+ Policy", "Upgrade contracts", file upload, and the wizard's wallet button.
- **Checks.** On 19 November a "break-it" pass tested ten kinds of failure on every prototype (unwired handlers,
  dead links, dialogs that lock the page, dialogs at phone width, typing and Enter, the part wrapper, a later clock,
  list counts, widths between phone and desktop, state that should carry between pages) and fixed about fifty
  findings. It was run once by agents; nothing repeats it. Before that: Each prototype loads without errors at 1440 and 390 px wide, and each flow's main path was clicked through
  once by the agent that built it. On 18 November, 66 states (Explore, the three DAOs' pages and proposals, the first
  steps of the wizards, the Safe page) were compared once with the reference screenshots on `docs/design-canvas`: 30
  matched, and nine distinct mistakes were found, of which seven were fixed. Left as they are: transaction times
  that read 18:18 where the app shows 18:00, and one Safe transaction's signature count, changed on purpose so that
  one approval reaches the threshold. That comparison was run by hand; nothing repeats it. It cannot see what
  changes on scroll or hover: the sticky bars were checked separately by reading the app's source. The workspace,
  wrapping, lock-to-vote, dialogs and later wizard steps have no screenshot and were not compared. The delegation dialogs and most dialogs
  of the create proposal wizard were not looked at at phone width.
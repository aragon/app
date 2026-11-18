# Design prototypes (idea 3 of 3: live prototypes)

This branch is a proposal, not something ready to merge. It holds one of three ideas that were tried for getting the
Aragon App onto a claude.ai design canvas so that design work can happen there before engineering builds it. The
other two are on branches of their own:

| Idea | Branch | Status |
| --- | --- | --- |
| 1. Static screens: every app page drawn by hand as a still frame | `docs/design-canvas` | Works, but nothing responds, so flows cannot be designed on it |
| 2. Exported snapshots: a script copies each state of the running app into a frame | `docs/design-snapshots` | Exact, but frozen frames at one width; rejected for design |
| 3. Live prototypes: one frame per flow that holds state and redraws on each click | `docs/design-prototypes` (this one) | The only one found acceptable for design |

The spec that compares them, with the requirements and the open questions, is
[Design canvas for the Aragon App: options and tradeoffs](https://claude.ai/artifact/5u6yDMkYhF7bM3Ctf6msWE).

**What should live in the repo for this idea is undecided.** The contents of this branch are one possible answer,
kept small so it can be read. Nothing here is built, deployed, released or run in CI.

## What is here

| Path | What it is |
| --- | --- |
| `canvas/*.dc.html` | Thirteen prototypes and the parts they are built from (109 files) |
| `canvas/app.css` | The app's page layout, transcribed by hand. It came from idea 1 and also holds rules for pages that have no prototype yet |
| `canvas/proto.css` | The few rules only the prototypes need |
| `canvas/canvas.json` | The canvas layout: which frames exist and where they sit |
| `canvas/assets/mock/` | Mock DAO avatars and token logos |
| `app-assets.json` | Images the prototypes show that belong to the app (chain logos), by path in the repo |
| `canvases/prototypes.json` | Which canvas these files are published to, each image's upload on it, the kit version, and the app commit the prototypes were built from |
| `publish/` | Two scripts that prepare the files for a canvas (see Publishing) |
| `BRIEF.md` | What a Claude agent is given to build or update a prototype, including the canvas pitfalls |

The prototypes:

- `Explore.dc.html`: the explore / landing page. The entry point; it links to the DAO and the two creation wizards.
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

## Publishing

A canvas shows files; it cannot read the repo. A Claude Code session copies the files to it.

```sh
node design/publish/prepare-publish.cjs <folder>
```

writes the files to `<folder>/project/` with each image path swapped for that image's upload on the canvas, as
recorded in `canvases/prototypes.json`. The session then publishes that folder to the canvas with its Artifact tool.
If an image has no upload yet, the script lists it; after uploading, `publish/record-assets.cjs` records the urls.

The Governance UI Kit files the prototypes load (`ds/aragon-gov-ui-kit/…`) are installed on the canvas from the
[design system artifact](https://claude.ai/artifact/BMrtaZwNQzvBsTyH9KvHMC) and are not in the repo.

## What is not here

- **A check.** The load check used in the test is `design/baseline-check/render-canvas.cjs` on `docs/design-canvas`.
- **Reference screenshots, the mock backend and the static screens.** They are on `docs/design-canvas`. They are what
  an agent looks at to build a prototype for an area that has none.
- **A way back from the canvas.** Copying a designer's edits from the canvas into these files is done by a Claude Code
  session reading the canvas's files and reversing the image swap. `docs/design-canvas` has a runbook for it; it has not
  been exercised on a real design change.

## Known gaps in the prototypes

- **The Safe account page has no entry point** from the other prototypes; it is a frame of its own.
- **Safe review dialog.** It carries Approve and Execute buttons in its footer. In the app the review is read-only and
  those actions live on the voting card. Its warning states, rejecting a transaction and error states are not drawn.
  Everything on the Safe page except the page itself was built from source with no screenshot to compare.
- **Vote amounts do not reconcile.** On a proposal, the individual votes in the Votes tab do not add up to the totals in
  the Breakdown tab; the mismatch comes from the mock data.
- **The vote list is drawn by script.** `DaoProposal.dc.html` defines a small component in code for the Votes tab, so
  that list cannot be selected or edited on the canvas like the rest.
- **Create proposal:** only the Transfer action can be added; the other action types are listed and do nothing.
  Simulation always succeeds. "View proposal" lands on the DAO's dashboard, not on the new proposal.
- **Permissions:** the graph view is a still picture. "Expand all" and "Uninstall process" do nothing.
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
- **Workspace:** "Add account" and "Edit workspace" do nothing. A Safe account's Transactions, Assets, Members and
  Settings sections all show the same Safe page. "New proposal" skips the app's pick-a-process step and always opens
  the token-voting wizard. A member's "other DAOs" rows leave the workspace for the standalone DAO prototype.
- **Create a Safe transaction** was built from the app's source alone (it merged days before and has no screenshot).
  Only a token `transfer` on one sample contract can be added.
- **Not built, because open pull requests are changing them:** editing a workspace, suggested accounts in the create
  workspace wizard, creating a Safe, and the governance designer inside a workspace.
- **Checks.** Each prototype loads without errors at 1440 and 390 px wide, and each flow's main path was clicked through
  once by the agent that built it. On 18 November, 66 states (Explore, the three DAOs' pages and proposals, the first
  steps of the wizards, the Safe page) were compared once with the reference screenshots on `docs/design-canvas`: 30
  matched, and nine distinct mistakes were found, of which seven were fixed. Left as they are: transaction times
  that read 18:18 where the app shows 18:00, and one Safe transaction's signature count, changed on purpose so that
  one approval reaches the threshold. That comparison was run by hand; nothing repeats it. It cannot see what
  changes on scroll or hover: the sticky bars were checked separately by reading the app's source. The workspace,
  wrapping, lock-to-vote, dialogs and later wizard steps have no screenshot and were not compared. The delegation dialogs and most dialogs
  of the create proposal wizard were not looked at at phone width.

## Open questions

These are for whoever decides whether and how this lands. The spec has the detail.

1. Do prototype files live in the repo at all, or only the brief, with prototypes redrawn when needed?
2. If they do: how is a prototype kept current when the app changes, and who owns that?
3. Which parts of `docs/design-canvas` (static screens, screenshots, mock backend, check) are worth keeping alongside?
4. Is any of it checked in CI?

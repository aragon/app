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
| `canvas/*.dc.html` | Four prototypes and the parts they are built from (31 files, about 3,700 lines) |
| `canvas/app.css` | The app's page layout, transcribed by hand. It came from idea 1 and also holds rules for pages that have no prototype yet |
| `canvas/proto.css` | The few rules only the prototypes need |
| `canvas/canvas.json` | The canvas layout: which frames exist and where they sit |
| `canvas/assets/mock/` | Mock DAO avatars and token logos |
| `app-assets.json` | Images the prototypes show that belong to the app (chain logos), by path in the repo |
| `canvases/prototypes.json` | Which canvas these files are published to, each image's upload on it, the kit version, and the app commit the prototypes were built from |
| `publish/` | Two scripts that prepare the files for a canvas (see Publishing) |
| `BRIEF.md` | What a Claude agent is given to build or update a prototype, including the canvas pitfalls |

The four prototypes:

- `Explore.dc.html`: the explore / landing page. The entry point; it links to the other three.
- `Dao.dc.html`: the main pages of one mock DAO (dashboard, proposals, proposal detail, members, member detail, assets,
  transactions, settings). Navigation only: filters, tabs and dialogs on these pages do not respond.
- `CreateDaoFlow.dc.html`: the create DAO wizard, with validation and a simulated publish transaction.
- `CreateWorkspaceFlow.dc.html`: the create workspace wizard, including adding accounts.

Each `*Mobile.dc.html` file mounts the same prototype in a 390 px frame, so the phone layout shows on the canvas.
Every other file is a part.

The canvas is [Aragon App prototypes](https://claude.ai/artifact/NnpGqxhynigQPwVyKgsc5p). It is private; ask its
owner for access.

## How they were made

On 18 November, six Claude Sonnet agents built them in parallel from `BRIEF.md`. The first version was on the canvas
12.8 minutes after the start and the set was complete at 14.8 minutes. The DAO pages and the explore page were made
by lifting the matching static screen from `docs/design-canvas` and making it live. The two wizards were built from
the app's source and reference screenshots.

They were checked by loading each at 1440 and 390 px wide: no page errors, no sideways overflow. Nothing compares
them with the app, and nobody has reviewed the phone layouts.

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

- Controls that lead outside the four prototypes do nothing: Permissions, Vote on proposal, "+ Proposal", Delegate.
- One proposal (MGP-1) shows another proposal's page: no screenshot of it was ever captured.
- Member pages show the right header per member, but the activity lists are always the same member's, and some
  balances are approximated.
- A link from a phone frame to another prototype opens that prototype's desktop frame.
- Only one of the three mock DAOs is covered. Creating a proposal, voting, the governance designer and the workspace
  pages have no prototype here. `docs/design-canvas` has older prototypes for four of those flows.

## Open questions

These are for whoever decides whether and how this lands. The spec has the detail.

1. Do prototype files live in the repo at all, or only the brief, with prototypes redrawn when needed?
2. If they do: how is a prototype kept current when the app changes, and who owns that?
3. Which parts of `docs/design-canvas` (static screens, screenshots, mock backend, check) are worth keeping alongside?
4. Is any of it checked in CI?

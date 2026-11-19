---
name: aragon-app-canvas
description: Use when someone wants to design on a claude.ai canvas of the Aragon App prototypes - start a canvas for a ticket or idea, save or sync what they changed on a canvas into the repo, bring the latest files onto a canvas, or refresh the reference canvas. Also when they type /aragon-app-canvas followed by anything.
---

# Aragon App canvas

The Aragon App's flows exist as live prototypes in `design/canvas/`, published to claude.ai design canvases where
designers work. A canvas cannot read or write the repo: a session moves the files. This skill is the front door;
**the steps live in `design/RUNBOOK.md` and nowhere else.** Read it, and `design/README.md`, before doing anything.

**Announce at start:** "I'm using the aragon-app-canvas skill."

If `design/` is not in the checkout, it is not merged yet: `git fetch origin docs/design-prototypes` and work from
that branch.

## What the person wants

They will say it in their own words, after the command or without it. Map it to one of these and say which one you
understood before you start:

| They say something like | Do | Runbook section |
| --- | --- | --- |
| "start a new one for the filters ticket", "I want to try an idea" | New branch and new canvas from the repo | Start a ticket |
| "save what I did", "sync", "pull my changes in" | Canvas → branch | Pull |
| "update my canvas", "get the latest onto the canvas" | Branch → its canvas | Publish |
| "the app changed, refresh the main canvas" | Reference branch → reference canvas | Refresh the reference canvas |
| "this one is done" | Clean up after the merge | Finish a ticket |

Nothing after the command, or you cannot tell which: ask, offering these five in plain words.

"Latest" is ambiguous. It can mean their canvas edits going into the repo (Pull) or the repo's files going onto
their canvas (Publish). Publish replaces what is on the canvas, so before a Publish: say that is what you
understood, and Pull first, as the runbook requires. Never publish over canvas edits that are not in the branch.

Which canvas: a ticket's canvas is recorded in `design/canvases/<name>.json` on its branch. If the person does not
name one and the branch does not settle it, ask.

## Rules

- A new branch, a new canvas and a pull request each need the person's say-so. "Start a new one" covers the branch
  and the canvas; nothing covers a pull request unless they ask for one.
- Use the scripts in `design/publish/`. Do not write new tools. If a runbook step fails as written, stop, say what
  failed, and fix the runbook once the person agrees.
- Talk about what they see (canvas, frames, their changes), not about git, unless they ask.

## Done when

You have told the person, in a sentence or two: what you did, the canvas link if one was created, which files
changed if you pulled, and anything you did not check (there is no automated load check on this branch).

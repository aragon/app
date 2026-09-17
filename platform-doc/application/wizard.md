---
type: pattern
title: Wizard
tags: [design, interaction, wizard, transactions]
status: draft
source: product-owner briefing, 2026-07-20 (wizard system) + product-owner release-notes briefing (2026-08-03, see log.md) + gov-ui-kit and app source verification (2026-08-04, see log.md) + product-owner briefings (2026-08-04, see log.md) + interrupted-flows pass at app@122f1bd1 (2026-08-05, see log.md) + product-owner ruling (2026-08-07, see log.md) + product-owner briefings (2026-09-11, see log.md) + full-screen variant consolidated after the page-purpose recheck (2026-09-13; original variant provenance retained in log.md); product-owner reader-boundary refinement (2026-09-14, relocated claims and provenance in log.md; no fresh source verification)
---

# Wizard

A wizard guides you through the inputs needed to prepare a transaction. It retains the information you enter while you define an account, configure governance, or prepare actions.

Some transactions need only one choice: voting takes place directly on the proposal page. Wizards support flows that need guided input collection.

## Full-screen and dialog wizards

A full-screen wizard makes the task the main context. A dialog wizard keeps a bounded action within the page or flow you are already using.

### Full-screen wizard

A full-screen wizard is a dedicated destination for focused transaction input. It may contain one screen or several: [Create transaction](../treasury/create-transaction.md) uses one Action builder screen. [Account creation](../accounts/account-creation.md), [governance-process creation](../governance/governance-designer.md), and [proposal creation](../governance/proposal-creation.md#creating-a-proposal) also use this container.

### Dialog wizard

A dialog wizard collects input for a bounded action while the surrounding task remains visible, even when blurred. Adding a body belongs within the governance designer; delegating votes or locking tokens belongs within the member's participation context. These actions can complete a transaction while remaining part of that surrounding task.

## Structuring the input

A metadata-bearing object starts its definition with the shared [metadata input](./metadata-input.md#placement-in-a-wizard) before operational configuration; prerequisites may precede that definition when they determine the available fields.

## Nesting and retained input

A dialog wizard can open inside a full-screen wizard when a bounded sub-flow requires its own guided input. A full-screen wizard never nests inside another wizard, and a dialog wizard does not nest another dialog wizard. The enclosing flow retains the parent's input while the child collects its own.

In the [governance designer](../governance/governance-designer.md), **Add voting body** opens a dialog wizard while the parent retains the process configuration. Returning the configured body resumes that parent flow.

## Submitting the collected input

Continuing from the final input step opens a transaction dialog. The flow can compose one or more transactions; the [transaction submission stepper](./submitting-a-transaction.md) handles preparation, wallet signature, chain confirmation and backend indexing. [Create transaction](../treasury/create-transaction.md#composing-and-submitting) uses a two-step direct-execution send instead of those four phases.

Publishing a governance process hands its configuration to the installation transaction dialogs. The [selected process determines how installation is approved and applied](../governance/governance-designer.md#preparing-and-applying-an-installation).

## Leaving an unfinished wizard

The flows that collect a transaction's inputs share one exit guard. It arms as soon as the form holds any change against its defaults, and it challenges the exits that would discard that input: the flow's own close control and other in-app links, the browser's **Back**, and reloading or closing the tab. The challenge is the browser's own prompt. For an in-app exit it is a native confirmation carrying the app's line, *If you leave this process, you'll lose all the information you've entered so far.*; for a reload or tab close it is the browser's generic leave-site prompt.

A multi-step dialog nested inside one of these flows, such as **Add voting body** in the governance designer, holds a bounded sub-flow with little content, so closing it through its own close control discards that input without a challenge. Those dialogs refuse outside-click dismissal to prevent an incidental click from discarding that input.

The guard releases at the [submission state from which the user can leave](./submitting-a-transaction.md#the-four-phases), including the direct-send exception.

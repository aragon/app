---
type: pattern
title: Transaction submission stepper
tags: [design, interaction, transactions]
status: draft
source: product-owner release-notes briefing (2026-08-03, see log.md) + app transaction-dialog verification (2026-08-04, see log.md) + interrupted-flows pass at app@122f1bd1 (2026-08-05, see log.md)
---

# Transaction submission stepper

The reusable dialog lifecycle that carries an intended transaction from the app to a wallet and then back into the app's indexed view of chain state. It begins after a flow has collected its inputs and supplied what is needed to compose the transaction, so it is distinct from the [wizard](./wizard.md) that may have gathered those inputs; the [dialog taxonomy](./dialog-taxonomy.md) describes the interaction containers rather than this transaction lifecycle.

## The four phases

1. **Prepare** — construct the transaction and finish any prerequisites. When the transaction refers to off-chain metadata, this includes pinning the metadata to IPFS and placing its hash in the transaction arguments.
2. **Approve/sign** — send the prepared transaction to the connected wallet for authorization.
3. **Confirm** — watch the chain until the transaction is confirmed.
4. **Index** — poll the backend for the confirmed transaction hash's indexing status and wait until the app can read the result.

After indexing finishes, the success action closes the dialog into pages that can already show the new state. While indexing is still in progress, **Continue in background** lets the user leave the dialog without waiting; it does not cancel or alter the confirmed transaction, and the destination may need more time before the new state appears.

Separating confirmation from indexing is deliberate: chain confirmation says the transaction happened, while indexing says the app's read model is ready to present what happened. This same submission pattern follows transaction-producing flows such as account creation, proposal creation, and governance-process deployment.

## Connected to the wrong chain

Every submission carries the chain its transaction belongs to — for a flow acting on an [account](../accounts/account.md), that account's network; for account creation, the network chosen in the wizard. When the connected wallet is on a different chain, the dialog discloses it above the phase list, naming the network to switch to. This is disclosure rather than a warning or a refusal ([alert severity](./alert-severity.md)): nothing is hidden or disabled, and no phase is failed.

The mismatch is resolved inside **Approve/sign**, before anything reaches the wallet for authorization. The phase's action requests the chain switch first and sends the transaction only once the switch succeeds, reporting the switch's progress in the meantime in place of the signature it would otherwise be waiting for. A mismatch therefore cannot survive into signing. The prepared request also names its required chain, so if the wallet has meanwhile moved to another one the app refuses to send rather than let it be signed on the wrong chain — which is also what a retry driven from **Confirm** meets, since only the **Approve/sign** action requests a switch.

The wallet's chain never disturbs a submission already under way. An attempt that is awaiting a signature or already broadcast keeps its own phase state instead of falling back to a not-yet-started appearance, which would invite a second send; and **Confirm** keeps watching the transaction's own chain even while the wallet sits on another. The rule is the app's own rather than the component library's, and it is shared: the same disclosure and the same pre-signing switch govern the submission dialog of [direct transaction creation](../treasury/create-transaction.md).

## Uncertain results and safe retries

The app remembers a transaction after it has been broadcast so an interrupted or resumed confirmation can reconcile the same request rather than silently starting over; what that memory covers is set out below. Once a hash exists, the confirmation step exposes its chain-specific block-explorer link.

If confirmation remains unresolved long enough, retry is guarded by an explicit warning: the first transaction may still succeed, and sending the request again can perform the action twice. The user should inspect the transaction state and retry only when they are sure it failed or intentionally want to send it again. This matters across flows using the shared submission dialog; in proposal creation, for example, an unsafe retry can create two proposals.

This uncertainty precedes the **Index** phase. Once a transaction is confirmed, **Continue in background** only leaves the app's indexing wait; it does not resubmit anything.

## Resuming an interrupted submission

A submission that runs through the four phases is remembered against the identity of the action it carries rather than the dialog that opened it. The same action reopened is the same submission; an action the user has since edited is a different one and starts clean — though what counts as an edit is the action's own identity rule: a proposal's, for example, covers its content, not its schedule. Reopening a remembered submission does not restart it: the dialog comes back at the phase the attempt had reached, with the phases before it already complete and inert, so resuming cannot re-send what was already sent. There is no prompt asking whether to resume — returning to the action is itself the resumption. Starting a second, conflicting action instead of returning to the first is a different situation, owned where that action lives ([proposal creation](../governance/proposal-creation.md)).

How much survives depends on how far the attempt got, and on a scope narrower than the whole app:

- A broadcast transaction survives a page reload. Its record lives in the browser tab's session storage, so the memory is scoped to that one tab: the same submission is not offered in another tab or window. It resumes at **Confirm**.
- A signature still sitting unanswered in the wallet does not survive a reload, because the request to the wallet dies with the page. Within one session it resumes at **Approve/sign**; after a reload there is nothing to return to and the flow runs again from **Prepare**.

Stale attempts are suppressed rather than offered back to the user:

- A transaction that confirmed while the user was away is looked up on the chain it was broadcast to and dropped, so settled work does not come back as unfinished.
- A transaction still unconfirmed a day after it was broadcast is dropped on the next page load as one that realistically never will confirm, rather than resurfacing indefinitely.
- A previous failed or rejected attempt is discarded on reopening, so the next run starts fresh instead of resuming into a failure.
- Only the newest attempt for an action can move the dialog; a late answer from an attempt the user has already superseded is ignored.

Even for a broadcast transaction, resumption after a reload is weaker than resumption within a session: the app no longer holds the composed transaction, so it can watch the one already broadcast but cannot re-send it. Retrying there discards the remembered transaction and runs the flow again from **Prepare**. All of this is the app's own logic rather than the component library's, and none of it extends to the submission dialog of [direct transaction creation](../treasury/create-transaction.md) — a two-step send outside these four phases that keeps no memory of an interrupted attempt.

A fresh attempt and a resumed one are distinct states, not the same submission seen twice. Which of the two it is decides the phase the dialog opens at, which phases count as already spent, and when the retry-safety warning applies: a resumed transaction measures how long it has been unconfirmed from its original broadcast, so one that was already stuck warns on arrival instead of restarting the clock.

## Open questions

- [ ] Is the single-tab scope of the pending-transaction memory intended? A second tab sees no resumption and no in-flight-creation conflict warning, so the duplicate send both mechanisms exist to prevent stays reachable there.

---
type: capability
title: Submitting a transaction
tags: [transactions, wallet, cross-cutting]
status: draft
source: product-owner release-notes briefing (2026-08-03, see log.md) + app transaction-dialog verification (2026-08-04, see log.md) + interrupted-flows pass at app@122f1bd1 (2026-08-05, see log.md) + @aragon/app@1.36.0 retry-safety verification (2026-09-08, see log.md) + product-owner briefing (2026-07-20, wizard system) + gov-ui-kit and app source verification (2026-08-04, see log.md) + product-owner ruling (2026-08-07, see log.md); user-facing behavior split from design/transaction-submission.md and design/wizard.md in the product/internal content separation (2026-09-10, see log.md); consolidated source provenance in log.md (page-overlap consolidation, 2026-09-13)
---

# Submitting a transaction

The shared transaction dialog carries a composed transaction to the connected wallet for a signature, watches the chain until the transaction confirms, and waits until the app can read the result. The dialog opens after [account creation](../accounts/account-creation.md), the [governance designer](../governance/governance-designer.md), and [proposal creation](../governance/proposal-creation.md) have collected their inputs, and behind inline actions such as voting, wrapping, locking, and delegating. [Direct transaction creation](../treasury/create-transaction.md) sends its transaction through a shorter two-step dialog.

The transaction submission stepper begins once the input flow has collected what is needed to compose a transaction. A [wizard](./wizard.md) may gather those inputs. The stepper governs the subsequent submission lifecycle.

## The four phases

1. **Prepare** — the app constructs the transaction and finishes any prerequisites. When the transaction refers to off-chain metadata, this includes pinning the metadata to IPFS and placing its hash in the transaction arguments.
2. **Approve/sign** — the prepared transaction goes to the connected wallet for authorization.
3. **Confirm** — the app watches the chain until the transaction is confirmed.
4. **Index** — the app polls its backend for the confirmed transaction's indexing status and waits until it can read the result.

Chain confirmation says the transaction happened; indexing says the app's own view of chain state is ready to present what happened. After indexing finishes, the success action closes the dialog into pages that already show the new state. While indexing is still in progress, **Continue in background** lets the user leave the dialog without waiting; it does not cancel or alter the confirmed transaction, and the destination may need more time before the new state appears.

Inline transactions such as token approval, wrapping, locking, and delegating run through wallet approval and chain confirmation without the indexing phase ([token panel](../governance/token-panel.md)).

The [wizard’s input-loss guard](./wizard.md#leaving-an-unfinished-wizard) releases once the submission dialog reaches a state the user is meant to leave from: the success action after indexing, or the offer to continue in the background while indexing runs. In direct transaction creation it releases as soon as the send succeeds and re-arms if the send fails.

## Connected to the wrong chain

Every submission carries the chain its transaction belongs to: for a flow acting on an [account](../accounts/account.md), that account's network; for account creation, the network chosen in the wizard. When the connected wallet is on a different chain, the dialog discloses it above the phase list and names the network to switch to. The disclosure is an informational [advisory](./alerts.md): nothing is hidden or disabled, and no phase is failed.

The mismatch is resolved inside **Approve/sign**, before anything reaches the wallet for authorization. The phase's action requests the chain switch first, reports the switch's progress in place of the signature it would otherwise wait for, and sends the transaction only once the switch succeeds. The prepared request also names its required chain, so if the wallet has meanwhile moved to another one, the app refuses to send instead of letting the transaction be signed on the wrong chain. A retry driven from **Confirm** meets the same refusal, since only the **Approve/sign** action requests a switch.

The wallet's chain never disturbs a submission already under way. An attempt that is awaiting a signature or already broadcast keeps its own phase state, and **Confirm** keeps watching the transaction's own chain even while the wallet sits on another. The same disclosure and pre-signing switch govern the dialog of [direct transaction creation](../treasury/create-transaction.md).

## Uncertain results and safe retries

Once a transaction has been broadcast, the app remembers it, so an interrupted or resumed confirmation reconciles the same request instead of starting over ([resuming an interrupted submission](#resuming-an-interrupted-submission)). Once a hash exists, the confirmation step exposes the chain's block-explorer link for it.

When confirmation remains unresolved for 90 seconds, retry is guarded by an explicit warning: the first transaction may still succeed, and sending the request again can perform the action twice. Inspect the transaction on the block explorer and retry only when it has clearly failed or a second send is intended. In proposal creation, for example, an unsafe retry can create two proposals. The warning opens over the transaction dialog and returns to it with the submission's state intact.

This uncertainty precedes the **Index** phase. Once a transaction is confirmed, **Continue in background** only leaves the app's indexing wait; it does not resubmit anything.

## Resuming an interrupted submission

The two-step dialog for [direct transaction creation](../treasury/create-transaction.md) keeps no record of an interrupted attempt.

A submission is remembered against the identity of the action it carries. Reopening the same action reopens the same submission: the dialog returns at the phase the attempt had reached, with the earlier phases complete and inert, so resuming cannot re-send what was already sent. There is no prompt asking whether to resume; returning to the action is the resumption. An action the user has since edited is a different one and starts clean. What counts as an edit is the action's own rule: a proposal's identity covers its content and not its schedule, and [proposal creation](../governance/proposal-creation.md#creating-a-proposal) describes the warning shown when an edited proposal would publish a second one.

### What survives a reload

How much survives depends on how far the attempt got, and on a scope narrower than the whole app:

- A broadcast transaction survives a page reload. Its record lives in the browser tab's session storage, so the memory is scoped to that one tab: the same submission is not offered in another tab or window. It resumes at **Confirm**.
- A signature still unanswered in the wallet does not survive a reload, because the request to the wallet dies with the page. Within one session it resumes at **Approve/sign**; after a reload the flow runs again from **Prepare**.

Even for a broadcast transaction, resumption after a reload is weaker than resumption within a session: the app no longer holds the composed transaction, so it can watch the one already broadcast but cannot re-send it. Retrying there discards the remembered transaction and runs the flow again from **Prepare**. A resumed transaction measures how long it has been unconfirmed from its original broadcast, so one that was already stuck shows the retry warning on arrival rather than restarting the 90-second clock.

### Discarding stale attempts

Stale attempts are dropped instead of being offered back:

- A transaction that confirmed while the user was away is looked up on the chain it was broadcast to and dropped, so settled work does not come back as unfinished.
- A transaction still unconfirmed a day after it was broadcast is dropped on the next page load.
- A previous failed or rejected attempt is discarded on reopening, so the next run starts fresh.
- Only the newest attempt for an action can move the dialog; a late answer from an attempt the user has already superseded is ignored.

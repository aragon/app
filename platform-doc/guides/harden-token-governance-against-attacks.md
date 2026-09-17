---
type: guide
title: Harden token governance against governance attacks
tags: [governance, voting, access-control]
status: draft
source: synthesis of existing platform entries and their protocol-doc links (2026-08-07, see log.md); no new source material — every claim traces to the linked pages
---

# Harden token governance against governance attacks

Configure a token-governance [process](../governance/process.md) so that capturing it costs an attacker more than the attack could gain. A governance attack here means using the process itself against the organization: acquiring voting power temporarily to pass a proposal, proposing malicious [actions](../governance/action.md) while few holders are watching, exploiting low participation, or executing a captured decision before anyone can react. Each defense below is a design decision inside the process — what counts as voting power, who may propose, what a decision requires, and what stands between a passed vote and execution.

**Prerequisites and limits.** The single-body decisions below are configured in the [governance designer](../governance/governance-designer.md); the staged safeguards require its advanced flow. Make these decisions before installing: [advanced processes are not editable in the app](../governance/governance-designer.md#editing-across-the-lifecycle), so changing a live process's safeguards later means working outside the app or contacting Aragon. These measures raise the cost and visibility of an attack; none makes one impossible. Weigh each against your token's liquidity and your holders' attention.

## 1. Make voting power expensive to acquire and reuse

Work through [Choose a voting-power mechanism for token governance](./choose-token-voting-power-mechanism.md) first — it decides which economic claim counts and how the mechanism prevents voting with the same claim twice. Two of its consequences are security boundaries:

- [Token Voting](../protocol-doc/plugins/token-voting-plugin.md) weighs each address at a checkpoint immediately before proposal creation, so moving tokens after the snapshot does not change that proposal's weight ([the snapshot](../protocol-doc/plugins/token-voting-plugin/voting-power.md#the-snapshot)). On the wrapped route this cuts both ways: someone can acquire the underlying ERC-20, wrap it, create a proposal, then unwrap and sell while the checkpointed voting power still counts for that proposal. Evaluate that exposure against the token's actual liquidity before accepting the wrapper.
- [Lock to Vote](../protocol-doc/plugins/lock-to-vote-plugin.md) prevents reuse through custody instead: locked tokens cannot move to another address to vote again. A voter cannot exit and keep an open vote — Standard mode keeps cast voting power locked until the relevant proposal ends, and Vote Replacement permits an early unlock only by first withdrawing the holder's open votes — so an attacker's position stays committed for as long as their vote stands.

## 2. Decide who may create proposals

A governance attack starts as an ordinary proposal, so creation eligibility is the first gate. It is configured independently from who decides ([proposal creation](../governance/proposal-creation.md)): narrowing creation does not narrow the vote, and the two choices protect against different failures.

- **Know the defaults.** A basic Token Voting or Lock to Vote process installs with a minimum proposer requirement of one whole token, so any address holding — for Lock to Vote, having locked — at least that much can propose, not only known members. A staged process on the designer's defaults restricts creation to members of the process's bodies; picking **Anyone** instead leaves creation open at the protocol level.
- **Narrow creation to the group that should author proposals.** Eligibility is independent per body, so a staged process can allow a multisig's members to create proposals without extending creation to token holders ([multisig gates](../governance/multisig-gates.md)).
- **Raise the proposer's required stake.** In the advanced designer, an already-deployed condition contract can be composed into the creation rule — for example the above-a-token-threshold `VotingPowerCondition`, which gates creation on token balance ([existing conditions](../governance/proposal-creation.md#existing-conditions-composing-an-already-deployed-condition)).

## 3. Set thresholds with the denominator in mind

The [three thresholds](../protocol-doc/plugins/majority-voting.md#the-three-thresholds) decide what a proposal must earn. The participation threshold is the one that stands against low-turnout capture: it sets how much of the total voting power must take part before a proposal can pass, so a small active minority cannot settle a decision most holders never saw.

What that percentage demands depends on the mechanism's denominator. Token Voting weighs a proposal against the token supply recorded with that proposal's settings at creation, so the demanded voting power stays fixed for the proposal's life; Lock to Vote reads the token's live total supply each time a proposal is evaluated. For a mintable or burnable token, treat supply policy as part of choosing the threshold — a supply change moves the bar with no vote cast ([choosing the mechanism](./choose-token-voting-power-mechanism.md#prevent-reusing-the-same-claim)).

## 4. Give every decision enough time

Attacks profit from speed; every window below is reaction time for defenders.

- Set the voting window deliberately. Token Voting enforces its configured minimum duration at proposal creation, and the multisig wizard recommends at least five days between start and end ([creating a proposal](../governance/proposal-creation.md#creating-a-proposal)).
- In a staged process, the [stage](../governance/stage.md) duration is the window the stage gives its bodies. When any body can veto, the full duration is a protected objection window the stage cannot advance before; early advance exists only for approval-only stages.
- Time only protects holders who learn a proposal exists. Every veto or monitoring role needs a reliable path to discover proposals before its window closes ([the attention risk](../governance/optimistic-governance.md#the-attention-risk)).

## 5. Put safeguards between the vote and execution

In the advanced flow, express each safeguard as its own stage of one [staged proposal](../governance/staged-proposals.md) pipeline; [Add a multisig gate to an advanced governance process](./multisigs-in-advanced-governance.md) walks through configuring the multisig forms.

- **Gate what reaches token holders.** A multisig stage before Token Voting means a proposal clears a smaller, accountable group before the wider vote, with creation limited to its members ([multisig gates](../governance/multisig-gates.md)).
- **Gate what executes.** After Token Voting, an approving multisig stage adds a final sign-off before execution, and a vetoing body gives a security council a protected objection window while the proposal advances by default ([optimistic governance](../governance/optimistic-governance.md)). Reaching a stage's veto threshold blocks the proposal regardless of approvals ([stage](../governance/stage.md)).
- **Add a timelock.** A bodyless stage is a pure delay that becomes advanceable only after its duration, putting guaranteed reaction time between a passed vote and execution ([stage](../governance/stage.md)).

## 6. Keep every safeguard visible

Prefer a stage over a direct permission grant. Granting creation or execution directly to a Safe works, but it keeps that role out of the [Voting Terminal](../design/voting-terminal.md) — real, yet invisible to the people the safeguards protect — and the creation variant buries the proposal's real actions in nested calldata that Safe signers cannot review with the app's action presentation ([stages over direct permission grants](../governance/stages-over-direct-permissions.md)).

## 7. Review what each proposal actually executes

Design-time safeguards still depend on reviewers reading the proposal in front of them. The [action builder](../governance/action-builder.md) makes the exact actions legible, and [action simulation](../governance/action-simulation.md) tests the permission and action-execution path — whether the intended caller will be permitted to execute and whether the actions succeed — during creation and on any proposal in a non-terminal state, on chains Tenderly supports.

## Done state

The configuration is done when the mechanism choice prices in snapshot-and-exit acquisition, creation eligibility names its authors deliberately rather than by default, the participation threshold is chosen with its denominator's supply policy, every safeguard appears as a visible stage, and a passed vote still faces time — a full window, plus a delay or objection stage — before execution.

Two duties continue past installation: veto holders must keep discovering proposals in time to object, and reviewers must keep reading and simulating actions proposal by proposal.

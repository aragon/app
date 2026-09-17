---
type: task
title: Rethink the guide layer around platform use cases
tags: [maintenance, cross-cutting]
status: blocked
next_actor: none
source: product-owner request to rethink guides and use cases (2026-08-03) + product-owner briefing on optimistic governance (2026-08-04, see log.md) + product-owner action-builder briefing (2026-08-05, see log.md)
---

# Rethink the guide layer around platform use cases

This task is good to do once the v1 of this repo is nearly done, since it is a user layer on top.

**Trigger:** the first version of the knowledge base is nearly complete, so its real capability and user-outcome surface is stable enough to inventory.

Rethink the guide layer from first principles against the full set of outcomes people use the Aragon platform to achieve. The owner's settled boundary remains: orientation for reading or maintaining this knowledge base belongs in the root [index](../index.md), while guides serve people trying to do something in Aragon. Within that boundary, determine which user jobs deserve guides, what guides should provide that capability and concept pages do not, and how the layer should be organized. This task produces the strategy and the finite follow-up work; it does not write the full guide portfolio in the same pass.

## What this unblocks

- [Guides](../guides/index.md) — an intentional role, information architecture, and portfolio beyond the current guides.
- The root [index](../index.md) — a durable user-task entry route that stays distinct from product-model orientation.
- The current guide set — [choose a voting-power mechanism for token governance](../guides/choose-token-voting-power-mechanism.md), [choose between a Safe and an Aragon multisig](../guides/safe-vs-aragon-multisig.md), and [add a multisig gate to an advanced governance process](../guides/multisigs-in-advanced-governance.md) — gets a disposition against the resulting model: keep, rewrite, split, or retire.

## Work

- Inventory the user outcomes represented across every current platform area and `type: capability`, including cross-area journeys. For each candidate use case, name the user, starting state, desired outcome, product availability, and canonical pages that own the underlying truth; do not force one guide per capability.
- Identify the meaningful gaps in that inventory by checking the app's user-facing routes and the value proposition. Use source code only to discover flows or verify that a use case exists; the broad code-first survey of the app's product surface belongs to the audit-the-codebase-for-undocumented-business-logic task, whose classification this inventory should cite rather than re-derive.
- Define the selection rubric for a guide: what makes an outcome substantial enough for a walkthrough; where a guide ends and a capability, concept, or reference begins; whether decision support belongs beside operational steps; how self-serve and team-assisted paths are handled; and when one page versus a sequence is warranted.
- Audit all three existing platform guides against the rubric and apply each disposition. Use protocol-doc's guides as boundary examples for protocol-mechanism tasks, never as content to copy or restate in the platform layer.
- Carry these already-named candidates into the inventory rather than rediscovering them: a **guardian-DAO setup guide** — the owner named it lock to vote's main use case while dictating the release notes, then framed it as an [optimistic-governance](../governance/optimistic-governance.md) arrangement in which a vault curator or operator proposes changes and liquidity providers or another token-holder constituency can veto. That sketch is not enough to write the guide; its exact governed changes, token and voting setup, current availability, and notification path need their own deeper treatment.
- Carry a **compose proposal actions through an external dApp** candidate into the same inventory. [Action builder](../governance/action-builder.md) now owns the WalletConnect mechanics: the account pairs to the dApp, transaction requests are queued and decoded where possible, and the resulting batch is attached to a proposal. A guide would need to teach the practical boundary the capability page should not turn into a walkthrough: many dApps assume an EOA can execute a prerequisite transaction before exposing the next step, so an approval-then-swap flow may not survive a governance delay. Decide this candidate by the same rubric rather than treating the owner's "maybe this deserves a guide" as a decision.
- The existing multisig-gate guide is the third already-named item. Each candidate still earns or loses its place by the rubric; being named here is not a decision.
- Produce a prioritized portfolio of guide candidates. Give each candidate a user-goal title, scope, canonical dependencies, availability, and a disposition: ready to write, blocked on named material, already covered without a guide, or rejected with rationale.
- Turn each selected missing guide into a finite task entry with the right ready or blocked state and one queue row. Record rejected or merged candidates in the close-out log so the reasoning survives this task's retirement without creating permanent planning pages in the product graph.

## Where to look

- `wiki --root . list --where type=capability --format json` and each platform area index — the current capability and use-case surface.
- [Value proposition](../value-proposition.md), the root [index](../index.md), and [Guides](../guides/index.md) — the promises and entry routes the guide layer must serve.
- The three current platform guides: [choose a voting-power mechanism for token governance](../guides/choose-token-voting-power-mechanism.md), [choose between a Safe and an Aragon multisig](../guides/safe-vs-aragon-multisig.md), and [add a multisig gate](../guides/multisigs-in-advanced-governance.md).
- `wiki --root . list --where type=guide --prefix protocol-doc/guides/ --format json` — upstream mechanism-oriented comparators and the platform/protocol boundary.
- The `app` sibling repository's routes and navigation — a discovery check for real user flows, not a substitute for canonical product pages.
- [Action builder](../governance/action-builder.md) and [Proposal](../governance/proposal.md) — the settled action-composition, signaling-proposal, and WalletConnect boundaries behind the external-dApp guide candidate.

## Scope boundary

Do not reopen the decision that repository orientation is not a guide or turn guides back into reading paths through the wiki. Do not write every selected guide, restate protocol mechanics, or silently turn uncertain product behavior into present-tense instructions. This task owns the guide model, the comprehensive use-case disposition, the existing guide's disposition, and the scoped follow-up tasks.

## Done when

- Every current platform area and capability is represented in the use-case inventory, and each credible guide candidate has an explicit disposition with rationale.
- [WORKFLOW.md](../WORKFLOW.md) states the settled role, selection rubric, structure, and availability rules for guides; the root and guides indexes match it.
- Each current guide's keep, rewrite, split, or retire decision is applied.
- Every selected missing guide has one finite ready or blocked task on the backlog, while rejected and merged candidates are preserved in the close-out log and no roadmap placeholders appear in the user-facing guide index.
- The pass is recorded in [log.md](../log.md), then the normal task completion sequence and composite wiki gate are run.

---
type: concept
title: Value proposition
tags: [cross-cutting, vision]
status: draft
source: original product vision document (product-owner, mined 2026-07-14, see log.md) + product-owner principles review (2026-07-29, see log.md) + product-owner release-notes briefing (2026-08-03, see log.md) + product-owner ACL one-pager (mined 2026-08-04, see log.md) + product-owner briefing on optimistic governance (2026-08-04, see log.md) + product-owner value-proposition ruling (2026-08-07, see log.md)
---

# Value proposition

What the platform promises, in one sentence:

> *Aragon App empowers organizations to securely govern who may do what across their treasuries and protocols: each kind of action gets its own governance process, modularly composed and uniquely tailored to the organization's needs, with an experience as intuitive and satisfying as that of a web2 platform.*

That promise depends on stewardship of the [abstraction between people and on-chain state](./principles/honest-abstraction.md). Users trust Aragon to make the relevant model, state, and consequences understandable: over-abstraction would be dishonest, while under-abstraction would make governance incomprehensible. The app therefore makes the common path coherent and [provides a route to deeper facts](./design/abstract-then-drill-down.md) when a decision needs one.

## Key benefits

The differentiating capabilities — what the platform uniquely provides. Each is carried by a concept documented in this base:

- **Governing bodies** — an [account](./accounts/account.md) can define separate stakeholder groups, each a distinct [body](./governance/body.md) with its own specific permissions.
- **Staged proposals** — governance [processes](./governance/process.md) whose proposals move through multiple stages, each governed by different bodies, with the whole pipeline displayed transparently so governance decisions visibly translate into on-chain actions ([staged proposals](./governance/staged-proposals.md)).
- **Multiple proposal types** — each type of action the account performs can have its own process (its own "proposal type"), with an execution scope defined through the account's [scoped authority](./access-control/scoped-authority.md).
- **Optimistic governance** — a proposal can follow an accept-unless-challenged path: designated proposers author the concrete proposal while designated stakeholders retain a protected opportunity to veto, avoiding routine affirmative-voting transactions when nobody objects ([optimistic governance](./governance/optimistic-governance.md)).
- **Evolving governance** — governance is not frozen at setup: processes can be added and removed, and bodies and single-plugin processes edited, as the organization's needs evolve ([governance designer](./governance/governance-designer.md)); editing a multi-stage process is a hands-on engagement today rather than an app flow; the app warns but never blocks on the dangerous edge of this ([removing the last process](./accounts/last-process-removal.md)). Governance can also be replaced without reconfiguring the contracts that already authorize the account, because the account keeps its stable target-facing identity while its [scoped authority](./access-control/scoped-authority.md) is reassigned among processes.
- **Modular and extensible UI** — a UI and design system built so plugins with new governance logic integrate cleanly ([plugin slots](./design/plugin-slots.md)) — for example cross-chain gasless voting on non-governance ERC-20 tokens, or governance modules that don't use proposals at all.

## Open questions

- [ ] Confirm the key-benefits list still reflects the product's current positioning (the statement itself was settled by the owner, 2026-08-07).
- [ ] What is the product's intended balance between general-purpose flexibility and opinionated OSx behavior — an application *for* OSx that also aspires to be a broader on-chain control surface? (Owner-flagged 2026-07-21; no answer captured.)

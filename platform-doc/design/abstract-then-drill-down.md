---
type: pattern
title: Abstract, then offer a drill-down
tags: [design, interaction, transparency]
status: draft
source: product-owner principles review (2026-07-29, see log.md)
---

# Abstract, then offer a drill-down

Start with the product-level representation a person can understand and act on. When the on-chain fact, encoded call, or source record behind it matters, offer a route to it without making that detail the default view. The abstraction can stay simple because it never has to substitute for the authoritative fact; a person who wants the fact can still reach it.

This pattern applies [honest abstraction](../principles/honest-abstraction.md) to how information is represented: exhaustive implementation detail does not belong in the first view, but a person who needs to verify a consequential fact must be able to get there. A drill-down satisfies both. It adds a route to the record, not a new concept for the interface to teach, and it earns its place by what it lets a person verify.

## Instances

- The [action builder](../governance/action-builder.md) moves from a basic view to decoded calldata and then raw calldata when each additional level is available.
- [Transactions](../treasury/transactions.md) links transfers to the block explorer and lets a user export an execution's complete action set as JSON.
- [Proposal identifiers](../governance/proposal-identifiers.md) distinguishes the readable slug from the on-chain identifier.
- [Executing on a linked account](../accounts/executing-on-a-linked-account.md) decodes nested calls so voters can inspect what will ultimately run.

## Open questions

- [ ] Which other consequential app surfaces need an explicit route from their product representation to the authoritative on-chain fact?

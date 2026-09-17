---
type: decision
title: Linking does not imply control
tags: [accounts, access-control, semantics]
status: draft
source: product-owner linked-accounts briefing (2026-07-21, see log.md) + product-owner authorization-model review (2026-08-04, see log.md)
---

# Linking does not imply control

**The rule.** A [linked-account](./linked-account.md) relationship is a **display relationship only**. It does not give the primary account any control over a linked account, nor imply any other on-chain behavior. The term "linked" is deliberate — not "sub", not "child" — precisely because the [signal](./linked-account-signaling.md) that links two accounts carries no authority.

**Why.** The product is flexible about *rendering* valid setups but does not *prescribe* a hierarchy. Control between accounts is an OSx [permission](../protocol-doc/core/permissions.md) configuration — highly opinionated and project-specific — so baking control into the act of linking would impose one project's choice on everyone and make unsafe or broken configurations easy to create. The app instead renders whatever valid permission setup exists and leaves the choice of control to the project.

## Configuring actual control (separately)

A project that wants control configures OSx permissions directly. A grant answers one concrete question about one guarded function and caller; causing a final state transition can require several successful calls and checks ([authorization and execution model](../access-control/authorization-and-execution.md)).

- **Execute** — granting a linked account's [Execute permission](../protocol-doc/core/execution.md) to the primary lets the primary execute on the linked account (e.g. withdraw its assets). This runs as **nested execution**: the primary account calls the linked account's `execute`, which authorizes the primary as its caller; the linked account then calls the inner action targets as itself. [`execute` cannot re-enter itself](../protocol-doc/core/execution.md#the-execute-function). This is the route [executing on a linked account](./executing-on-a-linked-account.md) relies on.
- **Root, for true ownership.** Execute alone is not ownership: [Root](../protocol-doc/core/permissions.md#root-the-permission-to-manage-permissions) controls permission changes, so a linked account that keeps Root could simply revoke the primary's Execute. True ownership therefore also grants Root to the primary and revokes it from the linked account.

## Open questions

- [ ] Whether the app surfaces *which* control permissions exist between linked accounts (e.g. indicating that the primary can execute on a linked account), or only renders the link itself.

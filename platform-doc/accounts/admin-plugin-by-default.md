---
type: decision
title: Install admin plugin by default
tags: [accounts, admin, onboarding, governance]
status: draft
source: aragon-knowledge-base/product/decisions/admin-plugin-by-default.md (first-slice brain dump, 2026-07-06) + app source verification (2026-08-04, app@122f1bd1; see log.md)
---

# Install admin plugin by default

Every account created through the app is deployed with the [admin plugin](../protocol-doc/plugins/admin-plugin.md) installed by default.

## Context

A freshly created account still needs its real governance installed, and installing plugins requires permissions on the DAO. With the admin plugin, anything created as a [proposal](../governance/proposal.md) executes instantly in a single transaction; the proposal shape is reused only so history and presentation stay consistent.

## Chosen direction

Install the admin plugin at [account creation](./account-creation.md). Because admin proposals execute instantly, at the end of the [governance designer](../governance/governance-designer.md) the user holds the permissions to fully install their chosen governance — the apply-installation step runs as an admin proposal and executes immediately. Admin is meant as a transitional bootstrap ([admin flow](./admin-flow.md)).

## Consequences

- A bespoke admin experience to build and maintain: a dedicated settings page and settings-route banner ([admin management](./admin-management.md)).
- The dedicated Admin removal entry point is withheld until another full-execute [process](../governance/process.md) exists, so leaving the bootstrap is coupled to setting up governance. The general warn-but-don't-block rule in [removing the last process](./last-process-removal.md) applies to ordinary process removal, not this Admin-specific gate.

## Open questions

- [ ] Who made this decision, and when?

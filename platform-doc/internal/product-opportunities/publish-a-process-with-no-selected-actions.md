---
type: opportunity
title: Publish a process without touching the actions list
tags: [governance, access-control, validation]
status: candidate
source: app source verification (2026-08-04, app@122f1bd1; see log.md) + product-owner editorial feedback (2026-09-13, see log.md)
---

# Publish a process without touching the actions list

## User story

As a governance process author, I want to publish a valid permission configuration without first adding an action, so that I can create an unrestricted process or deliberately start with an empty action allowlist.

## Context + benefit

The [governance designer](../../governance/governance-designer.md) supports **Any action** for unrestricted execution and **Specific actions** with nothing selected for a conditioned execute grant whose [allowlist starts empty](../../access-control/scoped-authority.md). Both are intended configurations.

Publishing can fail silently if the author has never interacted with the actions list, under either choice. Adding an action and removing it again permits publication. This detour affects both an intentionally empty allowlist and the normal path for an unrestricted process; the empty-allowlist state itself is reachable and displays correctly.

The candidate would allow either configuration to publish directly and explain any submission failure where it occurs. Authors could express the intended authority without manipulating an unrelated field to make the form accept it.

The finding is based on source and form-validation checks. Confirm the visible behavior in the designer before ticketing.

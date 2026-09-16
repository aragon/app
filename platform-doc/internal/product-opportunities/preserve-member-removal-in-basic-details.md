---
type: opportunity
title: Preserve member removal in Basic details
tags: [governance, actions, product-planning]
status: candidate
source: basic-action-view audit, app@f8bf9e87260190aefd7d8a0eb59f72844e6e4502 + installed @aragon/gov-ui-kit@2.11.2 (2026-09-10, see log.md) + product-owner editorial feedback (2026-09-13, see log.md)
---

# Preserve member removal in Basic details

## User story

As a proposal reviewer, I want a multisig membership action to state correctly whether it adds or removes members, so that I can decide whether to approve the actual roster change.

## Context + benefit

A removal action's [Basic summary](../../application/basic-action-views.md#multisig-membership-and-rules) can describe an addition even though its function name and calldata identify a removal. The contradiction affects proposal details, execution details, and ordinary nested action details.

The candidate would make the readable summary agree with the encoded action, allowing reviewers to understand the membership change without resolving conflicting descriptions. Verify direction, member addresses, and counts for additions, removals, and mixed batches across all three views while preserving the encoded actions.

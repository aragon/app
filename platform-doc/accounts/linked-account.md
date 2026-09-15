---
type: concept
title: Linked account
tags: [accounts, semantics]
status: draft
source: product-owner linked-accounts briefing (2026-07-21, see log.md) + product-owner marketing-briefs drop and app/app-backend verification (2026-08-03, see log.md)
---

# Linked account

An **application-layer abstraction** for presenting one **primary account** together with any number of **linked accounts** — [accounts](./account.md) an organization might, for example, choose to run as sub-DAOs — inside a single account instance in the app. There is no native on-chain concept of a linked account; the app recognizes the relationship from on-chain [signals](./linked-account-signaling.md) and renders it.

The hierarchy is **one level and flat**: a primary account can have any number of linked accounts, but the app does not represent further nesting, so the visible hierarchy never goes deeper than primary → linked.

Purpose-specific accounts let an organization **earmark funds in its on-chain financial state** instead of maintaining the distinction only through off-chain accounting. Moving assets into an operations, rewards, grants, or other purpose-specific account makes their intended use legible from where they live, while linking preserves one governance and treasury experience. That explicit allocation simplifies downstream on-chain and off-chain processes.

Linking is presentation only: the relationship confers no control over a linked account ([linking does not imply control](./linking-does-not-imply-control.md)).

## How linked-account data surfaces

The app folds linked accounts into the primary's experience rather than giving them a separate hierarchy. It takes three shapes, chosen by what a surface is already organized around:

- **Aggregated.** The **dashboard** sums metrics across the primary and its linked accounts — treasury value ([assets](../treasury/assets.md)), [proposal](../governance/proposal.md) counts, and similar totals.
- **Merged into an existing partition, flat.** Where a list is already partitioned some other way, linked-account items are added into it without a new hierarchy level:
  - The [proposals](../governance/proposal.md) list has an aggregate view across active processes on the primary and linked accounts, then stays partitioned by proposal type (per [process](../governance/process.md)); a linked-account process gets a process tab like any other.
  - The **members** list stays partitioned by [body](../governance/body.md). Bodies on linked accounts join that same flat set of body tabs, and selecting one reads that linked account's members.
- **Partitioned by account.** Where a list has no other partitioning dimension, its tabs can represent the actual linked accounts — [assets](../treasury/assets.md) and [transactions](../treasury/transactions.md) can split per linked account.

When proposal creation uses a process installed on a linked account, the app resolves that account as the target and applies the normal [authorized-actions filtering](../governance/action-builder.md#adding-actions). Linking introduces no separate action-filtering mechanism.

Two further surfaces:

- The **settings page** lists the account hierarchy using each linked account's own name and description from its account metadata; the relationship has no separate alias or description.
- [Processes](../governance/process.md) and [bodies](../governance/body.md) show an **indicator** when they belong to a linked account.

## Open questions

- [ ] The full set of dashboard metrics that aggregate across linked accounts (treasury value and proposal counts are the named examples).
- [ ] Whether partition-by-linked-account on assets/transactions is a default view or an optional toggle.

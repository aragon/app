---
type: opportunity
title: Retire or wire the unused linked-account display helper
tags: [accounts, naming, maintenance]
status: candidate
source: app source verification at app@122f1bd1 + product-owner review (2026-08-05, see log.md)
---

# Retire or wire the unused linked-account display helper

This is a candidate product improvement, not a confirmed user-facing bug or a roadmap commitment. [Linked accounts](./linked-account.md) are live.

The app contains a [`linkedAccountDisplayUtils` helper](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/shared/utils/linkedAccountDisplayUtils/linkedAccountDisplayUtils.ts#L4-L91) that chooses a label from the primary account name, a matching linked-account name, the plugin name, or a generic fallback. Source history shows that the utility has had no production caller since it was introduced with the linked-account assets and transactions work; only its export and tests refer to it. The current assets and transactions selector instead [builds its labels directly through `useDaoFilterUrlParam`](https://github.com/aragon/app/blob/122f1bd161b9d308b19ff509023429af8d118e72/apps/app/src/shared/hooks/useDaoFilterUrlParam/useDaoFilterUrlParam.ts#L82-L128), using the primary account name and each linked account's name.

The evidence therefore establishes dead duplicate code, not missing product behavior. The unused helper cannot define a current naming rule, but keeping a second tested rule makes the source harder to interpret and can mislead future product audits.

## Opportunity

Confirm that the current app branch still has no production caller, then remove the helper, its export, and its dedicated tests. Wire it into a live surface only if verification first identifies a concrete user-visible fallback that the current selector does not provide.

## Before ticketing

- Compare the live linked-account selectors with the helper's fallback cases and name any observable gap.
- If no gap exists, treat removal as code cleanup rather than a feature change.
- If a gap exists, describe the affected surface and expected label before choosing the shared helper as the fix.

---
type: opportunity
title: Let overlapping Permission Viewer filters be cleared
tags: [access-control, permissions]
status: candidate
source: Permission Viewer source verification at app@16d34dc3 (2026-08-28, see log.md)
---

# Let overlapping Permission Viewer filters be cleared

This candidate addresses an empty-state trap in [Permission Viewer](./permission-viewer.md) when every indexed record matches both default hide filters. It is not a roadmap commitment.

## Opportunity

The page initially hides records granted to the selected account and records targeting an identified subplugin. Each switch is disabled when the records remaining under the other active filter contain none of its category. If every fetched record matches both categories, each filter hides the evidence that would enable the other switch: both controls disable, and the list and graph appear empty even though indexed records exist.

Keep each switch clearable whenever the unfiltered permission set contains its category, or provide one action that clears both filters. The empty state should distinguish a genuinely empty indexed set from a set hidden entirely by presentation filters.

## Before ticketing

- Reproduce the state with a permission set in which every row has the selected account as `who` and an identified subplugin as `where`.
- Settle whether independent switches or a combined clear-filters action is the intended recovery.
- Cover the overlap-only data set, mixed data sets, and URL-restored filter states in both list and graph views.

---
type: opportunity
title: Let overlapping Permission Viewer filters be cleared
tags: [access-control, permissions]
status: candidate
source: Permission Viewer source verification at app@16d34dc3 (2026-08-28, see log.md)
---

# Let overlapping Permission Viewer filters be cleared

## User story

As a person inspecting permissions, I want to clear filters even when they hide every record, so that I can reveal the account's permissions and distinguish hidden results from an empty permission set.

## Context + benefit

[Permission Viewer](../../access-control/permission-viewer.md) initially hides permissions granted to the selected account and permissions targeting an identified subplugin. Each filter becomes unavailable when the other filter hides all records in its category. If every record matches both categories, both switches disable and the list and graph appear empty despite indexed permissions being present.

The candidate would keep the filters clearable or provide an action that clears both. An empty state that explains when filters hide existing records would let people recover their view and avoid drawing conclusions from an apparently empty account.

Before ticketing, choose between independent filter recovery and a combined clear action. Verify records that match both filters, mixed permission sets, and filter states restored from the URL in both list and graph views.

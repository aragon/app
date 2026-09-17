---
type: opportunity
title: Preserve account scope in transaction categories
tags: [treasury, linked-accounts, filtering]
status: candidate
source: linked-account data-view verification (2026-09-13, app@adad67873c8f9dd75e3ed340b70df3e985ae3557 and app-backend@107103b4cc9d8f778c78e09c7265f9a4ead89d6e; see log.md)
---

# Preserve account scope in transaction categories

## User story

As a person reviewing treasury activity across linked accounts, I want transaction categories to retain my selected account scope, so that I can inspect executions, deposits, or withdrawals without silently losing part of the history.

## Context + benefit

With **All accounts** selected on [Transactions](../../treasury/transactions.md), the inspected implementation includes linked accounts in unfiltered history but limits category results and category-availability checks to the primary account. Linked-account activity can disappear when a category is selected even though the visible account scope stays the same.

The candidate would preserve the primary and linked accounts in both category results and availability checks. This would let people narrow the type of activity while keeping the account scope they chose.

Confirm the behavior against the deployed backend before ticketing; the source finding does not establish which backend revision is live.

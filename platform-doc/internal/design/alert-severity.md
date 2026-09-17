---
type: pattern
title: Alert severity
tags: [design, content]
status: draft
source: product-owner briefing (2026-07-28, third answers, see log.md) + product-owner principles review (2026-07-29, see log.md) + product-owner release-notes briefing (2026-08-03, see log.md) + gov-ui-kit source verification (2026-08-04, see log.md) + codebase verification at app@122f1bd1 (2026-08-06, see log.md) + product-owner briefings (2026-09-11, see log.md) + product-owner editorial feedback (2026-09-13, see log.md); product-owner reader-boundary refinement (2026-09-14, relocated claims and provenance in log.md; no fresh source verification)
---

# Alert severity

Choose an alert's severity and placement to match the decision the person needs to make. First use [control availability](./control-availability.md) to establish whether an alert is warranted and whether the action remains available. The [meanings and behavior of alerts in the app](../../application/alerts.md) are the shared product contract for those choices.

## Choosing severity

Use **Info** when context helps the person understand the next step without requiring caution. Use **Warning** when a valid choice has a consequence to consider, and **Critical** when an error or serious consequence merits strong concern. Explain the consequence concretely; the treatment must not imply that a permitted governance choice is invalid.

A configuration that cannot satisfy an invariant is refused under [invariant validation](./invariant-validation.md). Describing it in an alert cannot make it valid.

## Choosing an interruption

Use an [alert dialog](./dialog-taxonomy.md) when a consequential action needs acknowledgement before proceeding. Explain what will change and why the decision matters, then let the person cancel or continue where continuation is allowed. For example, [removing Admin](../../governance/admin-flow.md#removal-boundary) ends the authority used to set up the account; the confirmation asks the operator to consider the governance that will remain.

## Keeping context beside the work

Use an inline advisory when the person needs context while continuing the task, and put a repairable field error beside the input that needs correction. Preserve the [advisory's lifetime](../../application/alerts.md#inline-advisories-and-field-errors) so the information remains available while the person acts on it.

## Failure is not emptiness

Choose the page state before choosing advisory styling. A failed request needs recovery guidance; a successful request with no results needs the appropriate empty state. Follow the [collection-page failure and empty-result behavior](../../application/collection-pages.md#failures) so a severity choice does not blur those different outcomes.

---
type: reference
title: Alerts and advisories
tags: [interaction, content, cross-cutting]
status: draft
source: product-owner briefing (2026-07-28, third answers, see log.md) + product-owner principles review (2026-07-29, see log.md) + product-owner release-notes briefing (2026-08-03, see log.md) + gov-ui-kit source verification (2026-08-04, see log.md) + codebase verification at app@122f1bd1 (2026-08-06, see log.md) + product-owner briefings (2026-09-11, see log.md) + product-owner editorial feedback (2026-09-13, see log.md); behavior relocated from design/alert-severity.md at the owner's request (2026-09-14, see log.md), no fresh source verification
---

# Alerts and advisories

Alerts explain conditions that affect what you are doing in the app. Their severity helps you distinguish useful context from a reason for caution or an error. An alert's severity alone does not determine whether you can continue; the action's permissions and configuration rules still apply.

| Severity | Meaning |
| --- | --- |
| **Info** | Relevant context, such as a wallet chain mismatch that the transaction flow resolves before signing. |
| **Warning** | A consequence to consider before continuing with a valid choice. |
| **Critical** | An error or a consequence serious enough to merit strong concern. An authorized person may still be allowed to proceed. |

## Confirming a consequential action

An alert dialog interrupts an action when its consequence needs acknowledgement. It explains what will change and offers cancellation or continuation where the action permits it. For example, the confirmation for [removing Admin](../governance/admin-flow.md#removal-boundary) asks you to consider the governance that will remain after setup authority ends.

The browser also asks for confirmation when [leaving a wizard would discard entered information](./wizard.md#leaving-an-unfinished-wizard). That confirmation uses the browser's prompt, independently of the app's alert treatments.

## Inline advisories and field errors

Inline advisories keep relevant context beside the work it affects. They remain until the state that produced them changes, giving you time to read and act on the information. Field errors appear beside the input that needs correction.

When a collection cannot load or has no results, the app shows the corresponding [failure or empty state](./collection-pages.md#failures). A failure means the requested information could not be retrieved; an empty result follows a successful retrieval with nothing to show.

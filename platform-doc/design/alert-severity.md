---
type: pattern
title: Alert severity
tags: [design, content]
status: draft
source: product-owner briefing (2026-07-28, third answers, see log.md) + product-owner principles review (2026-07-29, see log.md) + product-owner release-notes briefing (2026-08-03, see log.md) + gov-ui-kit source verification (2026-08-04, see log.md) + codebase verification at app@122f1bd1 (2026-08-06, see log.md)
---

# Alert severity

The product distinguishes two severities for alerting the user, used deliberately and consistently with general UX practice. Severity is chosen only after [control availability](./control-availability.md) establishes that an alert is warranted; it does not decide whether a control should be hidden, disabled, guarded, or warned. The rule applies beyond [alert dialogs](./dialog-taxonomy.md), which are just one surface these severities appear on.

Alert severity does not decide whether input is valid. A value that cannot satisfy an invariant is refused under [invariant validation](./invariant-validation.md), even if critical styling also helps explain the error; it never becomes a permitted action merely because an alert can describe it.

- **Warning** — something may be fine, but extra caution is needed. The product is not saying the action is right or wrong, only "be very careful."
- **Critical** — something either does not work (an error), or the product is very confident the action is wrong: "you probably shouldn't do this." The user may still be allowed to proceed.

## Alert dialogs

On the [alert-dialog](./dialog-taxonomy.md) surface, the product severity is the `variant` of `DialogAlert.Root`:

- `warning` gives the header a warning title treatment and icon, and gives the consequential footer action warning treatment.
- `critical` gives the header a critical title treatment and icon, and gives the consequential footer action critical treatment.

For both severities, the footer reverses the ordinary action order so Cancel appears before the consequential action — above it on smaller screens and to its left on larger screens. The component also supports `info` and `success` visual variants, but those toolkit options do not extend or replace the product's warning-versus-critical severity rule.

## Non-dialog surfaces

The severities travel beyond dialogs. Two other surfaces carry them, with different room to move:

- **Freestanding advisory cards and inline advisories** carry the same scale an alert dialog does: the component library gives them `info`, `warning`, `critical`, and `success` visual variants, and as with dialogs those toolkit options do not extend or replace the product's warning-versus-critical severity rule.
- **Inline field errors** are deliberately narrower. The component library types that channel to warning and critical only — `info` is not available on it at all — and the app's shared form layer marks a field error critical, so a field error raised through that layer carries no severity choice.

The app's own full-width banner strip is not a severity surface: it has one fixed warning treatment and no variants, so it carries no severity choice.

**There is no toast.** The product has no transient, self-dismissing notice mechanism, and this is not a toolkit option the product declines — the component library ships no toast either, so the choice was never on the table. Alerting is in-flow and persistent instead: an advisory stays until the state that produced it changes, and anything that needs acknowledgement is a dialog. The only auto-dismissing notices a user can encounter belong to the third-party wallet-connector SDK: they appear inside that SDK's own wallet modal and disappear with it. Connection-state messaging on that surface is the SDK's, not the product's.

## Failure is not emptiness

A page failure, or a required piece of data that cannot be loaded, replaces the page with the app's failure surface and its way out — leaving or contacting support, never an in-place retry. A valid empty result is not a failure: the component library replaces only the list region, the rest of the page keeps working, and no recovery is offered because nothing failed. Neither state is an advisory carrying a severity choice. [Datalist page](./datalist-page.md) owns the full set of list states and what each one shows.

## Open questions

- [ ] The chain-mismatch disclosure on the [transaction submission stepper](./transaction-submission.md) renders as an `info` alert — a product-meaningful use of a variant this page says does not extend the warning/critical vocabulary. Is neutral disclosure a third severity to admit, or is that surface outside the severity rule?

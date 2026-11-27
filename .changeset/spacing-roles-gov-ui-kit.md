---
"@aragon/gov-ui-kit": minor
---

Components take their spacing from role classes: insets (`p-inset-surface`, `px-inset-item`), gaps (`gap-related`, `mt-section`, `space-y-group`), component sizes (`h-control-md`, `px-control-lg`) and `<family>-<role>--<pattern>` exceptions for places that keep their own value (`gap-related--8-12`). One class holds both widths, so it replaces `x md:y`. Values are unchanged. A raw spacing class passed through `className` wins over the component's role at every width: where a component stepped at `md` (`p-4 md:p-6`), a caller's base class (`p-2`) now also replaces the desktop value, where it used to lose to the component's `md:` class. A caller that overrides a component's role with another role needs the important modifier (`gap-related!`), as for colours. Role values are pixels, so a changed `--spacing` no longer scales component spacing.

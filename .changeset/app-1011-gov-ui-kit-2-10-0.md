---
"@aragon/app": patch
---

Upgrade `@aragon/gov-ui-kit` to 2.10.0. Number inputs now clamp an out-of-range value to `max` instead of dropping the digit that breached it, `prefix` and `suffix` render literally rather than mangling token characters, and the stray borders on `AlertCard` and `Accordion` are gone. Also fixes the create-DAO, create-process and create-policy detail dialogs, which crashed with "`DialogTitle` must be used within `Dialog`" whenever the app and the kit resolved separate radix instances.

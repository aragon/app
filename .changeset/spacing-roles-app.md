---
"@aragon/app": minor
"@aragon/assistant-chat": patch
---

The app and the assistant chat set padding, margins, gaps and control heights through the Governance UI Kit's spacing roles instead of number classes; pages look the same. A lint rule rejects number spacing classes in the app outside a few marked places. The spacing roles and exceptions only the app and the chat use come from the kit's app-only token CSS, not from the published package. The debug panel gets a Spacing switch next to the colour theme and the typography that previews the New, looser and compact densities; like them, it only reaches developers with the panel enabled.

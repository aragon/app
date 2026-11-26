---
"@aragon/app": minor
"@aragon/assistant-chat": patch
---

The app and the assistant chat set their text through the Governance UI Kit's typography roles (`type-*` classes) instead of size, line height and weight classes; pages look the same. A lint rule rejects those classes in the app outside a few sizes that follow a component's shape. The debug panel gets a Typography switch next to the colour theme that previews the Next typography; like the theme, it only reaches developers with the panel enabled.

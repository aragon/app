---
"@aragon/app": patch
"@aragon/assistant-chat": patch
---

The app and the assistant chat take their colours from the Governance UI Kit's role classes (`bg-surface-primary`, `text-surface-secondary`, …) instead of palette classes; pages look the same. Where the app overrides the colour of a kit card, data-list item or navigation bar, the override now carries the important modifier. The debug panel gets a colour theme switch (Today, Next, Dark) for developers: the choice is kept in a cookie, the server renders it only while the debug panel is enabled, and the preview stylesheet loads with the panel, so other users never receive it.

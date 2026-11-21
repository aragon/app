---
"@aragon/app": patch
"@aragon/assistant-chat": patch
---

Move the app's own markup and the assistant chat from primitive palette colour classes to the GovKit semantic colour classes (696 classes, 14 chart, graph and loader colours, plus the screens added since: the sign-in landing page, the workspace navigation, selectors and welcome dialog, the workspace admin page and the support chat launcher), so the colour-theme preview reaches the app's own surfaces; the default look is unchanged. Adds the app's colour map with its validator, and a lint that warns on primitive colour classes (an error in the module folders already converted).

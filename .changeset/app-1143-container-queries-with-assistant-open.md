---
"@aragon/app": patch
---

Lay out the application against its own width instead of the browser window, so the interface stays usable while the AI assistant is docked beside it. The shared page shell, navigation, footer and banner now read container queries on the application column: with the assistant open at a 1280px window the app renders its stacked layout instead of a desktop layout that no longer fits, where the main column used to be squeezed to 268px (and to 4px at 1024px). Collapsing the assistant leaves the layout unchanged — the container is then exactly viewport-wide.

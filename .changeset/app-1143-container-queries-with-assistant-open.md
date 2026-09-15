---
"@aragon/app": patch
---

Lay out the application against the width of its own column instead of the browser window, so the interface stays usable while the AI assistant is docked beside it. The breakpoint variants (`sm:` … `2xl:` and `max-*`) are now container queries on the application column, which covers every page and the gov-ui-kit components alike: with the assistant open at a 1280px window the app renders its stacked layout instead of a desktop layout that no longer fits, where the main column used to be squeezed to 268px (and to 4px at 1024px). Collapsing the assistant leaves the layout unchanged — the column is then exactly window-wide. The assistant panel itself keeps measuring the window, and the DAO navigation dialog now lists every destination, since it cannot see which links the bar dropped for width.

---
"@aragon/gov-ui-kit": patch
---

Make the remaining kit parts whose colour differed from their design token follow the `next` and `dark` themes: 75 classes in 26 component files (status tooltips except critical, avatar icons and placeholders, input status borders, addons and icons, search and file-avatar icons, spinner tracks, tabs, checkbox and radio cards, dialog close, wallet, data-list items, collapsible, accordion, ping dot, switch, toggle) move to code-only component-level alias tokens that keep today's colours in the default theme and take the values of the design token they alias in the other themes (73 classes), or to the role token that already holds their colour (2). Adds 82 such alias tokens (`bg-body-sidebar`, `bg-surface-active-control`, `icon-surface-default-control`, …), 27 of them used only by the Aragon app. No visual change in the default theme.

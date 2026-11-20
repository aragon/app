---
"@aragon/gov-ui-kit": patch
---

Make the info, success, warning and critical Tag fills and the success Progress bar follow the `next` and `dark` themes. They move to code-only component-level tokens (`bg-info-subtle-tag`, `bg-success-subtle-tag`, `bg-warning-subtle-tag`, `bg-critical-subtle-tag`, `bg-success-solid-progress`) that keep today's colours in the default theme and take the values of the design tokens they alias (`bg-*-subtle`, `bg-success-solid`) in the other themes. Before, these fills stayed on the old palette in every theme, so dark tags showed light text on a pale fill. No visual change in the default theme.

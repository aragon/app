---
"@aragon/gov-ui-kit": minor
---

Add a semantic colour token layer: `--guk-*` variables named after the design system's `property/group/role` tokens, with three value sets (the default reproduces today's colours, `data-theme="next"` the new palette, `data-theme="dark"` a dark theme) and one Tailwind utility per token (`bg-surface-default`, `text-accent-default`, `border-accent-hover`, `icon-surface-disabled`, `shadow-accent-sm`, `ring-accent-focus`, …). The values are generated from the DTCG token source in `design-system/tokens/source` by `pnpm tokens:generate`. Button is the first component on the semantic classes and keeps its look in the default theme, except one pressed state that now follows the shared token: a secondary button's label turns `primary-600` while pressed. Consumers that compose the kit CSS from its parts must also import `src/theme/tokens/semantic/index.css`, otherwise Button loses its colours.

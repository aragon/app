---
"@aragon/gov-ui-kit": patch
---

Preview the palette change in the "next" colour theme: under `data-theme="next"` the primitive colour variables (`--color-neutral-*`, `--color-primary-*`, `--color-success-*`, `--color-warning-*`, `--color-critical-*`, `--color-info-*`) resolve to the same step of the new palette, so markup that still uses primitive colour classes follows the new palette there. The default and dark themes are unchanged.

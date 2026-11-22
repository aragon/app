---
"@aragon/gov-ui-kit": patch
---

Shrink the generated token CSS. The spacing and typography utilities read one variable and no longer carry their own `md` rule (the variables take their desktop values once, under `@media (width >= 48rem)` on `:root`), and the preview value sets (colour Next and Dark, typography Next, spacing New, looser and compact) move out of `src/theme/tokens` into a preview stylesheet that the published package does not contain. `build.css` keeps Today and renders identically; it goes from 527 KB to 250 KB (47 KB to 30 KB gzipped).

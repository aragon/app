---
"@aragon/gov-ui-kit": patch
---

Generate the primitive token CSS (`src/theme/tokens/primitives/*.css`) from the DTCG token source in `design-system/tokens/source/` (`pnpm tokens:generate`). The focus ring and gradient utilities and the `@font-face` rules move out of the generated files into `src/theme/tokens/` and `src/theme/fonts/`. The compiled `build.css` and every token value, name and class are unchanged.

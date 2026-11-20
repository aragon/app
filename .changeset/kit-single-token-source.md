---
"@aragon/gov-ui-kit": patch
---

Generate the primitive token CSS (`src/theme/tokens/primitives/*.css`) from the DTCG token source in `design-system/tokens/source/`, the single source of the kit's primitives, the designer's palette and the semantic colour modes, with one generator (`pnpm tokens:generate`, `pnpm tokens:check`). The compiled `build.css` and every token value, name and class are unchanged; the generated CSS files only gain a "do not edit" header comment.

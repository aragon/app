---
"@aragon/gov-ui-kit": patch
---

`build.css` compiles class names from the kit source only, dropping the stray `table`, `ring`, `outline`, `p-[17px]` and `w-[42%]` utilities picked up from the package's docs and config.

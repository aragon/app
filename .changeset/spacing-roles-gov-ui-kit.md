---
"@aragon/gov-ui-kit": minor
---

Add a semantic spacing layer: spacing roles (insets `inset-tight` … `inset-page`, gaps `gap-tight` … `gap-layout`, the navigation chrome roles), component sizes (`control-sm/md/lg`, `control-label`, `tag`, `row`) and documented `<role>--<pattern>` exceptions, generated from DTCG tokens into `src/theme/tokens/spacing.css` as utilities such as `px-inset-item`, `gap-group`, `mt-related`, `h-control-md` and `gap-group--12-16`. The core primitives (Button, Tag, Toggle, Tabs, inputs, Dialog parts, Card, DataList, Accordion, Dropdown, DefinitionList, …) now use them; nothing renders differently. `Card` gains an `inset` prop (`none` by default). Preview value sets (`data-spacing="new" | "looser" | "compact"`) are keyed off their own attribute. Note: a padding, gap or height class passed through `className` to a converted component now always wins over the component's own spacing.

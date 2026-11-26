---
"@aragon/gov-ui-kit": minor
---

Components take their colours from role classes (`bg-surface-primary`, `text-surface-secondary`, `border-critical-primary`, `shadow-surface-sm`, …) instead of palette classes. The roles are defined as Tailwind theme variables, generated from the token source, and their default values are the colours the components had before. The Next and Dark value sets are previews for Storybook and the app's debug panel and are not part of the published CSS. A colour class passed through `className` to a kit component that sets the same property now needs the important modifier: stylesheet order is alphabetical by class name, and the kit's base classes moved from `neutral-*` to `surface-*`.

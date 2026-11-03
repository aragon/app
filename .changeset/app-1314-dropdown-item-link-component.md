---
"@aragon/gov-ui-kit": patch
---

Render `Dropdown.Item` links through the `Link` component of the `GukCoreProvider` instead of a plain anchor, as `Button` and `Link` already do. In a Next.js app the items now navigate client-side and prefetch their target.

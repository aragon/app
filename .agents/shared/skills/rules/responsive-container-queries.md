---
name: responsive-container-queries
description: Inside the application column, responsive classes must be container queries (`@app-{size}/app:`), not viewport prefixes — the AI assistant docks beside the app and makes the pane narrower than the window.
globs: apps/app/src/shared/components/page/**, apps/app/src/shared/components/container/**, apps/app/src/shared/components/navigation/**, apps/app/src/shared/components/banner/**, apps/app/src/modules/application/components/layouts/**, apps/app/src/modules/application/components/navigations/**, apps/app/src/modules/application/components/footer/**, apps/app/src/daos/*/components/*PageHeader/**
kind: rule
---

# responsive-container-queries

The application does not own the browser window. The AI assistant panel docks as an **in-flow sibling** of the application column, so the pane the app lays out can be far narrower than the viewport (a 1280px window with the panel open leaves 780px). Viewport breakpoints inside that column therefore lie: they promote the app to a desktop layout that no longer fits, and the 400px aside collides with the main column (APP-1143 — the main column measured 4px at a 1024px viewport).

## Canon

- `src/modules/application/components/layouts/layoutRoot/layoutRoot.tsx` — the application column declares `@container/app`. The chat panel is its sibling, deliberately outside the container.
- `src/modules/application/components/layouts/layoutRoot/layoutRoot.css` — `--container-app-{sm,md,lg,xl,2xl}` = 40/48/64/80/96rem, mirroring the design system's viewport scale.
- `src/shared/components/page/pageContent/pageContent.tsx`, `pageAside`, `container` — the migrated shape.

## The invariant

- Laid out **inside** the application column → `@app-{size}/app:`. Structure, spacing, type scale, visibility, column counts, fixed widths. A bare `md:`/`lg:`/`xl:` there is the bug.
- Genuinely **viewport-spanning** surfaces keep viewport prefixes: the chat panel shell in `supportChat/supportChatPanel.tsx` (its CSS `lg` and its `matchMedia('(min-width: 64rem)')` a11y logic must keep agreeing), dialogs, and fullscreen overlays.
- Token names are `app-*` on purpose. Tailwind's built-in container scale is different (`@lg` = 32rem), so `@md:`/`@lg:` without the `app-` prefix silently retunes the layout.
- The scales match, so a 1:1 swap is behaviour-preserving while the panel is collapsed: the column is then exactly viewport-wide.

## Portals cannot see the container

A surface portalled to `document.body` (gov-ui-kit `Dialog`, `autocompleteInputMenu`) has no `app` container ancestor, so `@container app (...)` never matches and only the base classes apply. A decision that must be shared between a portalled surface and the pane cannot be expressed in CSS at all — do not try, and do not reintroduce it as a viewport query, which desynchronises the two.

The precedent is `navigationDao`: the bar drops its inline links on the pane width, and the dialog lists every destination unconditionally (`navigationDaoUtils.getDefaultLinks`) so nothing becomes unreachable while the bar is compact.

## Still on viewport queries

The shared spine is migrated; the per-page audit is not. Bespoke DAO page headers (`src/daos/*/components/*PageHeader`), the explore page, and gov-ui-kit internals (e.g. `DefinitionList`'s grid) still respond to the browser. Migrating one is the local fix; making a kit component container-aware belongs upstream in `gov-ui-kit`, never in patched output.

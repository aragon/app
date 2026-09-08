# Coding Guidelines

In addition to the coding rules enforced by `biome`, adhere to the following guidelines and conventions
throughout the coding process.

## Clean Code

- Remove all `console.log()` calls before committing code.
- Commented-out code should be removed and not committed.
- Whenever possible, use the
  [early-return pattern](https://gomakethings.com/the-early-return-pattern-in-javascript/#what-is-the-early-return-pattern)
  to improve code readability and reduce nesting levels.

## React Components

- Implement only one React component per file to maintain clarity and organization.
- Always use React Function Components for consistency and simplicity.
- Always use TypeScript and the `.tsx` extension for React components to leverage type checking.
- When a component becomes too large, consider splitting it into multiple sub-components to improve readability and
  maintainability.
- Treat tests as a composition signal: if a test cannot target a node by role, label or text — and reaches for a
  `data-testid`, a CSS selector or DOM traversal instead — the composition is too dense. Split the component rather
  than adding a handle, so assertions stay available at that level. See
  [testing](../projectDocs/testing.md#what-a-test-may-assert).
- When a component requires multiple files (e.g. tests, definitions), locate all files within the component folder.

## Responsive Layout

The application does not own the whole browser window: the AI assistant docks beside it as an in-flow
column, so the pane the app lays out can be much narrower than the viewport. Responsive rules therefore
follow the **surface** they lay out, not the browser.

- The application column in `layoutRoot.tsx` declares `@container/app`, and the container-query
  breakpoints `--container-app-{sm,md,lg,xl,2xl}` in `layoutRoot.css` mirror the viewport scale
  (40/48/64/80/96rem). So `@app-lg/app:flex-row` reads on the application pane exactly like
  `lg:flex-row` reads on the window, and the two agree whenever the assistant is collapsed.
- **Anything laid out inside the application column uses `@app-{size}/app:`** — page shells,
  navigation, cards, grids, column counts, fixed widths, visibility toggles. A bare `lg:` there is a
  bug: it fires on the browser width and collides with the assistant, which is what
  [APP-1143](https://linear.app/aragon/issue/APP-1143) was.
- **Keep `sm:`/`md:`/`lg:` for surfaces that really do span the viewport**: the assistant shell's own
  docked-versus-fullscreen decision (its CSS breakpoint and its `matchMedia` a11y logic must keep
  agreeing), and dialogs and fullscreen overlays.
- Never reuse Tailwind's built-in container scale (`@lg` is 32rem) — always the `app-` tokens.
- Content portalled out of the application column (dialogs, `autocompleteInputMenu`) cannot observe
  the container, so a decision shared between a portalled surface and the pane cannot be expressed in
  CSS. Make the portalled surface unconditional instead of mirroring the query — see
  `navigationDaoUtils.getDefaultLinks`, where the dialog lists every destination because the bar
  drops its inline links on the pane width.

## React Component Properties

- Treat component props as read-only and avoid modifying them within the component.
- Always prefer passing content between components using the `children` property rather than custom props.

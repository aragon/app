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

## React Component Properties

- Treat component props as read-only and avoid modifying them within the component.
- Always prefer passing content between components using the `children` property rather than custom props.

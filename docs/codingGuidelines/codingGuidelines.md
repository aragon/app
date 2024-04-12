# Coding guidelines

In addition to the coding rules enforced by `eslint` and `prettier`, adhere to the following guidelines and conventions
throughout the coding process.

## Clean Code

-   Remove all `console.log()` calls before committing code.
-   Commented-out code should be removed and not committed.

## React Components

-   Implement only one React component per file to maintain clarity and organization.
-   Always use React Function Components for consistency and simplicity.
-   Always use TypeScript and the `.tsx` extension for React components to leverage type checking.
-   When a component becomes too large, consider splitting it into multiple sub-components to improve readability and
    maintainability.
-   When a component requires multiple files (e.g. tests, definitions), locate all files within the component folder.

## React Component Properties

-   Treat component props as read-only and avoid modifying them within the component.
-   Always prefer passing content between components using the `children` property rather than custom props.

## Project Structure

-   Implement components, utilities, and hooks specific to each module within the related module folder (e.g.,
    `/modules/governance`) to maintain modularity and organization.
-   Implement generic UI components, utilities, and hooks shared across the application within the `/shared` folder.
-   Implement plugin-specific components, utilities, and hooks within the related plugin folder (e.g.
    `/plugins/tokenVoting`)

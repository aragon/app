# Naming Conventions

This document outlines the naming conventions to be followed throughout the coding process. Consistently adhering to
these conventions enhances code readability, maintainability, and consistency across the project.

## Components

- Use Camel Case and `.tsx` file extention for component file names (e.g. `daoList.tsx`).
- Use Pascal Case for component names (e.g. `DaoList`).
- Ensure the file name always matches the component name.
- Add `page` suffix to page components (e.g. `ExploreDaosPage`)

## Component Properties

- Use Camel Case for property names;
- Prefix callbacks and event handlers with `on` (e.g. `onDaoSelected`) for consistency;

## Translations

When adding new translations to the project, adhere to the following pattern:

```
app.[moduleName].[componentName].[translationKey]
```

- The `app` prefix denotes the current project.
- The `moduleName` specifies the name of the module where the component is located (e.g. `governance`).
- The `componentName` is the name of the component (e.g. `proposalsPage`). If multiple components exist within the same
  folder, split the key accordingly (e.g. `createDaoDialog.createDaoSteps`).
- The `translationKey` is a descriptive key for the translation.

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

## Enums

- Enum keys must always be written in **UPPERCASE_SNAKE_CASE**.
- By default, enum values should also be **UPPERCASE_SNAKE_CASE**.

There are two exceptions to the default rule for enum values:

1. **Enums representing backend values** If an enum is meant to reflect values coming from the backend, match the values
   exactly as provided by the backend (including case and formatting).
2. **Enums used for tabs or routing** When enums are used for tabs, navigation, or anything affecting the URL, set the
   values in lowercase. This ensures cleaner and more consistent URLs.

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

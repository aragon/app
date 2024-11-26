# Project Structure

The project follows a structured layout to ensure scalability and maintainability. Below is an overview of the folder
structure:

## `/src`

- **`/__mocks__`**: Used for mocking third-party dependencies in unit tests, more info
  [here](https://jestjs.io/docs/manual-mocks#mocking-user-modules).
- **`/app`**: Reserved for Next.js routing. No logic should be implemented here; only imports the layout and pages from
  the modules, more info [here](https://nextjs.org/docs/app/building-your-application/routing).
- **`/assets`**: Contains the application assets such as locales, images, and fonts.
- **`/modules`**: Used to implement the application business logic, split into separate modules. More info in the
  [modules section](#modules) below.
- **`/plugins`**: Contains the plugin-specific logic, with each plugin having its own folder. More info in the
  [plugins section](#plugins) below.
- **`/shared`**: Contains components, hooks, and utilities shared across the application, used by both modules and
  plugins.
- **`/test`**: Used to set up the Jest environment for unit tests.

## Modules

The application logic is organized under the `src/modules` folder. Each module follows the same folder structure for
consistency:

### `Application`

- The `Application` module contains global application logic such as global layouts, application wrappers, and
  providers.

### `CreateDao`

- The `CreateDao` module is used for the logic and pages for creating a DAO.

### `Dashboard`

- The `Dashboard` module has the code and utilities for displaying the DAO dashboard, providing an overview of the
  latest DAO activities and members.

### `Explore`

- The `Explore` module is used for the explore section of the Aragon App, allowing navigation and exploration of
  different DAOs.

### `Finance`

- The `Finance` module handles everything related to DAO finance, including balances, transactions, and deposit/withdraw
  actions.

### `Governance`

- The `Governance` module has the logic for governing and managing a DAO, including the proposal creation process, DAO
  members, and proposals pages.

### `Settings`

- The `Settings` module contains the logic and pages for managing DAO settings.

### Module Folder Structure

Each module within the `src/modules` folder follows a consistent structure:

- **`/api`**: Contains logic for interacting with any third-party service. Each service has its folder with service
  logic, a `/domain` folder for TypeScript interfaces, and React Query queries and mutations.
- **`/components`**: Contains reusable module-specific components.
- **`/constants`**: Contains constants reused across the module.
- **`/pages`**: Contains module-specific pages.
- **`/utils`**: Contains utilities shared within the module.
- **`/testUtils`**: Contains testing utilities needed for unit tests.

This folder structure ensures clarity and maintainability, making it easier to extend the application with additional
modules or plugins in the future.

## Plugins

The `plugins` folder contains plugin-specific logic, with each plugin having its own folder. Currently maintained
plugins include:

- **`multisig`**: Manage a DAO through a list of wallets with the same voting power.
- **`token`**: Manage a DAO through a governance token where an individual's voting power is directly proportional to
  the number of tokens they hold.
- **`gasless`**: Manage a DAO through a gasless voting process.

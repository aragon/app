---
"@aragon/app": patch
---

Move DAO Permissions to its own top-level route and expose it from the DAO navigation menu, the dashboard contract card and the settings account card. Removes the `permissionsPage` feature flag, so the page and its entry points are now enabled in every environment. Upgrades `@aragon/gov-ui-kit` to 2.11.0 for the Permissions navigation icon.

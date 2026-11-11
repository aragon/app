# @aragon/docs

## 0.1.1

### Patch Changes

- [#1571](https://github.com/aragon/app/pull/1571) [`1bd347b`](https://github.com/aragon/app/commit/1bd347bd719091aa82da395b9d25a6b7b362ed88) Thanks [@tyhonchik](https://github.com/tyhonchik)! - `pnpm content:diff` takes the consumer whose pages it compares (`site`, the default, or `assistant`), so the assistant release lists the pages of the knowledge base it indexes the way the docs release does.

- [#1571](https://github.com/aragon/app/pull/1571) [`1bd347b`](https://github.com/aragon/app/commit/1bd347bd719091aa82da395b9d25a6b7b362ed88) Thanks [@tyhonchik](https://github.com/tyhonchik)! - Nest the sidebar the way the knowledge base nests its folders: a folder inside an area sits under the area, in the order the area's index links to it, instead of at the top level.

- Publish the pages the knowledge base changed since the previous release: 75 added, 13 changed, 5 removed.

    - Added `/help/access-control/authorization-and-execution`
    - Added `/help/access-control/permission-viewer`
    - Added `/help/access-control/scoped-authority`
    - Added `/help/accounts/account-creation`
    - Added `/help/accounts/dashboard`
    - Added `/help/accounts/executing-on-a-linked-account`
    - Added `/help/accounts/linked-account`
    - Added `/help/accounts/settings`
    - Added `/help/application/actions`
    - Added `/help/application/actions/action-builder`
    - Added `/help/application/actions/action-simulation`
    - Added `/help/application/actions/basic-action-views`
    - Added `/help/application/actions/execution-routing`
    - Added `/help/application/actions/submitting-a-transaction`
    - Added `/help/application/availability`
    - Added `/help/application/availability/app-cms`
    - Added `/help/application/availability/aragon-deployed-plugins`
    - Added `/help/application/availability/plugin-compatibility`
    - Added `/help/application/availability/supported-chains`
    - Added `/help/application/explore-page`
    - Added `/help/application/identity`
    - Added `/help/application/identity/address-display`
    - Added `/help/application/identity/address-input`
    - Added `/help/application/identity/aragon-names`
    - Added `/help/application/identity/aragon-profiles`
    - Added `/help/application/identity/connecting-a-safe`
    - Added `/help/application/identity/wallet-connection`
    - Added `/help/application/interactions`
    - Added `/help/application/interactions/alerts`
    - Added `/help/application/interactions/collection-pages`
    - Added `/help/application/interactions/metadata-input`
    - Added `/help/application/interactions/wizard`
    - Added `/help/application/support`
    - Added `/help/application/support/aragon-assistant`
    - Added `/help/application/support/getting-help`
    - Added `/help/governance/body`
    - Added `/help/governance/configuration`
    - Added `/help/governance/configuration/admin-governance`
    - Added `/help/governance/configuration/governance-designer`
    - Added `/help/governance/configuration/process-removal`
    - Added `/help/governance/cross-chain-execution`
    - Added `/help/governance/execution-targets`
    - Added `/help/governance/member`
    - Added `/help/governance/participation`
    - Added `/help/governance/participation/aragon-notifications`
    - Added `/help/governance/participation/benqi-lending-market-gauges`
    - Added `/help/governance/participation/delegate-profile-record`
    - Added `/help/governance/participation/gauge-voting`
    - Added `/help/governance/participation/token-panel`
    - Added `/help/governance/participation/velocker`
    - Added `/help/governance/plugin`
    - Added `/help/governance/process`
    - Added `/help/governance/proposals`
    - Added `/help/governance/proposals/proposal-creation`
    - Added `/help/governance/proposals/proposal-identifiers`
    - Added `/help/governance/proposals/proposal-status`
    - Added `/help/governance/staged-governance`
    - Added `/help/governance/staged-governance/multisig-gates`
    - Added `/help/governance/staged-governance/optimistic-governance`
    - Added `/help/governance/staged-governance/safe-as-a-body`
    - Added `/help/governance/staged-governance/stage`
    - Added `/help/guides`
    - Added `/help/guides/choose-token-voting-power-mechanism`
    - Added `/help/guides/harden-token-governance-against-attacks`
    - Added `/help/guides/make-your-dao-immutable`
    - Added `/help/guides/multisigs-in-advanced-governance`
    - Added `/help/guides/safe-vs-aragon-multisig`
    - Added `/help/guides/set-up-a-guardian-dao`
    - Added `/help/osx-and-the-platform`
    - Added `/help/treasury`
    - Added `/help/treasury/assets`
    - Added `/help/treasury/capital-distributor`
    - Added `/help/treasury/create-transaction`
    - Added `/help/treasury/transactions`
    - Added `/help/treasury/vault`
    - Changed `/help`
    - Changed `/help/access-control`
    - Changed `/help/access-control/gradual-permission-handover`
    - Changed `/help/access-control/osx-authorization-paths`
    - Changed `/help/accounts`
    - Changed `/help/accounts/account`
    - Changed `/help/accounts/contract-upgrades`
    - Changed `/help/accounts/safe`
    - Changed `/help/application`
    - Changed `/help/governance`
    - Changed `/help/governance/action`
    - Changed `/help/governance/proposal`
    - Changed `/help/value-proposition`
    - Removed `/help/application/aragon-deployed-plugins`
    - Removed `/help/application/plugin-compatibility`
    - Removed `/help/governance/proposal-status`
    - Removed `/help/governance/stage`
    - Removed `/help/governance/target`

## 0.1.0

### Minor Changes

- [#1526](https://github.com/aragon/app/pull/1526) [`c644df5`](https://github.com/aragon/app/commit/c644df5a14c20e17892fcf194eb2ec891472246b) Thanks [@tyhonchik](https://github.com/tyhonchik)! - Publish the platform knowledge base at app.aragon.org/help: the pages the product owner validated, with their markdown copies, search and sitemap. Every release is tested on stg.platform-doc.aragon.org, and production gets the same pages.

### Patch Changes

- Publish the pages the knowledge base changed since the previous release: 18 added, 0 changed, 0 removed.

    - Added `/help`
    - Added `/help/access-control`
    - Added `/help/access-control/gradual-permission-handover`
    - Added `/help/access-control/osx-authorization-paths`
    - Added `/help/accounts`
    - Added `/help/accounts/account`
    - Added `/help/accounts/contract-upgrades`
    - Added `/help/accounts/safe`
    - Added `/help/application`
    - Added `/help/application/aragon-deployed-plugins`
    - Added `/help/application/plugin-compatibility`
    - Added `/help/governance`
    - Added `/help/governance/action`
    - Added `/help/governance/proposal`
    - Added `/help/governance/proposal-status`
    - Added `/help/governance/stage`
    - Added `/help/governance/target`
    - Added `/help/value-proposition`

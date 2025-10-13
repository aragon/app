# @aragon/app

## 1.12.0

### Minor Changes

- [#776](https://github.com/aragon/app/pull/776) [`4b4d02c`](https://github.com/aragon/app/commit/4b4d02c644d1de788becef33a11d67fc04244a5a) Thanks [@thekidnamedkd](https://github.com/thekidnamedkd)! - Implement useTokenCurrentDelegate hook to fix UX on TokenDelegationForm

- [#774](https://github.com/aragon/app/pull/774) [`c7ff966`](https://github.com/aragon/app/commit/c7ff9667db9d5a5a2cfaa814b3a175101143052d) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update minor and patch NPM dependencies

- [#766](https://github.com/aragon/app/pull/766) [`f40bfe8`](https://github.com/aragon/app/commit/f40bfe8a823d3d273c52e71b52b30fafaeacba3d) Thanks [@milosh86](https://github.com/milosh86)! - Enable Safe bodies to create proposals

- [#772](https://github.com/aragon/app/pull/772) [`6fe7bec`](https://github.com/aragon/app/commit/6fe7bec2c15a28b20ee892112995182ba90c97b2) Thanks [@thekidnamedkd](https://github.com/thekidnamedkd)! - Rename, refactor 'PluginFilterComponent' for Toggle implementation

- [#657](https://github.com/aragon/app/pull/657) [`64102f8`](https://github.com/aragon/app/commit/64102f85b42e257e64f13a5577c7e31e895aa261) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump `recharts` to v3

- [#777](https://github.com/aragon/app/pull/777) [`4f46a7e`](https://github.com/aragon/app/commit/4f46a7e6a423ed86f888c7057e81b23f864e0d0b) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Implement plugin uninstallation flow

- [#771](https://github.com/aragon/app/pull/771) [`c1024d4`](https://github.com/aragon/app/commit/c1024d4e61b611bb1322bf2527a6e4a248d4a7e1) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Support api-key secret for Aragon backend requests

### Patch Changes

- [#785](https://github.com/aragon/app/pull/785) [`dae895c`](https://github.com/aragon/app/commit/dae895c70a0e840f2275082168732b7ff3ad1cef) Thanks [@milosh86](https://github.com/milosh86)! - Implement check if uninstall prepare event has happened before applying

- [#782](https://github.com/aragon/app/pull/782) [`83b8e47`](https://github.com/aragon/app/commit/83b8e4757c7823ab9b9750cde989d56fa73f1a55) Thanks [@milosh86](https://github.com/milosh86)! - Add content-type header to RPC proxy requests and improve monitoring logs

- [#786](https://github.com/aragon/app/pull/786) [`3eeca4d`](https://github.com/aragon/app/commit/3eeca4d008365ce79adc06b29bd9b7716e1b1518) Thanks [@thekidnamedkd](https://github.com/thekidnamedkd)! - Fix breaking transactions with multiple token mint recipients

## 1.11.0

### Minor Changes

- [#735](https://github.com/aragon/app/pull/735) [`e025ee6`](https://github.com/aragon/app/commit/e025ee6b4a1c143fa23ed94ae9bb8dd3d0aea86b) Thanks [@milosh86](https://github.com/milosh86)! - Implement Tenderly simulations for proposal actions

- [#754](https://github.com/aragon/app/pull/754) [`6f3b6e8`](https://github.com/aragon/app/commit/6f3b6e87d735ced17846ddbd2825b056c88b5a90) Thanks [@milosh86](https://github.com/milosh86)! - Add support for token voting 1.4

### Patch Changes

- [#765](https://github.com/aragon/app/pull/765) [`50079a0`](https://github.com/aragon/app/commit/50079a02740b99bccee602920beb5116879e8801) Thanks [@thekidnamedkd](https://github.com/thekidnamedkd)! - Align page error internationalization pattern

- [#767](https://github.com/aragon/app/pull/767) [`34425b8`](https://github.com/aragon/app/commit/34425b8c8a67ebaed4e8c9d43d81eafb11696a57) Thanks [@thekidnamedkd](https://github.com/thekidnamedkd)! - Implement unique enum ID for LockToVote dialog

- [#759](https://github.com/aragon/app/pull/759) [`19d9a09`](https://github.com/aragon/app/commit/19d9a090302ce176cc4983ac37aacaf9c47243e4) Thanks [@milosh86](https://github.com/milosh86)! - Strip all headers from RPC requests to prevent 413 errors

- [#763](https://github.com/aragon/app/pull/763) [`de9bc77`](https://github.com/aragon/app/commit/de9bc7751f625f56131317c6f80107d24a7e89ba) Thanks [@thekidnamedkd](https://github.com/thekidnamedkd)! - Fix calculation for stage 'Expiration period' on process details

- [#769](https://github.com/aragon/app/pull/769) [`9820915`](https://github.com/aragon/app/commit/9820915e6a0d7bc4e3081e4d11b80e07c6eec760) Thanks [@thekidnamedkd](https://github.com/thekidnamedkd)! - Fix isSupportReached utility for token-based plugins to handle support-threshold setting with decimals

- [#764](https://github.com/aragon/app/pull/764) [`5ee5042`](https://github.com/aragon/app/commit/5ee5042240d2e6a67491b9ecb826dfded54716f7) Thanks [@evanaronson](https://github.com/evanaronson)! - Add Lock To Vote plugin support for ZKsync and ZKsync Sepolia

## 1.10.0

### Minor Changes

- [#706](https://github.com/aragon/app/pull/706) [`facccf9`](https://github.com/aragon/app/commit/facccf93b678038768ca3287375c89a91ca2d3e1) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Add support for `lock-to-vote` plugin

### Patch Changes

- [#760](https://github.com/aragon/app/pull/760) [`3f0f702`](https://github.com/aragon/app/commit/3f0f702ab900d5bf095e8cd30433659a03e9c038) Thanks [@thekidnamedkd](https://github.com/thekidnamedkd)! - Update assets for Boundless DAO launch on mainnet

- [#752](https://github.com/aragon/app/pull/752) [`e345715`](https://github.com/aragon/app/commit/e345715e83546ca66297528034612fd9ba0a1ccc) Thanks [@milosh86](https://github.com/milosh86)! - Handle all nullish cases for `totalSupply` on token data lists

- [#762](https://github.com/aragon/app/pull/762) [`f649090`](https://github.com/aragon/app/commit/f6490901fd80ec8206fc39b0385b30a25b27bbe4) Thanks [@thekidnamedkd](https://github.com/thekidnamedkd)! - Resolve @walletconnect packages on 2.21.7 release

- [#740](https://github.com/aragon/app/pull/740) [`0b4ed2a`](https://github.com/aragon/app/commit/0b4ed2ae87bafcd5eb1f38ebbd5e6cebec10e15f) Thanks [@milosh86](https://github.com/milosh86)! - Remove unused SETTINGS_GOVERNANCE_INFO plugin slot

- [#757](https://github.com/aragon/app/pull/757) [`0919c56`](https://github.com/aragon/app/commit/0919c568d31a7643e1abfafa98b158436f0c57f8) Thanks [@milosh86](https://github.com/milosh86)! - Remove unused slot component from lockToVote plugin

## 1.9.0

### Minor Changes

- [#727](https://github.com/aragon/app/pull/727) [`5a33552`](https://github.com/aragon/app/commit/5a335524695ad9daa6ef0c256a0a7c6e92fb0539) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update minor and patch NPM dependencies

- [#716](https://github.com/aragon/app/pull/716) [`1694687`](https://github.com/aragon/app/commit/1694687ca52d54703e263269a8809e0049f4b150) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Add support for campaigns with Merkle tree strategy and regulatory checks

- [#719](https://github.com/aragon/app/pull/719) [`d350e51`](https://github.com/aragon/app/commit/d350e51995da36a4e30428f4899d1034a4701c56) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump actions/cache to 4.2.4

- [#734](https://github.com/aragon/app/pull/734) [`b2d9703`](https://github.com/aragon/app/commit/b2d970381dbe9289436960f1b416a8102d889e8c) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Display native transfer view for authorized transfer actions

- [#748](https://github.com/aragon/app/pull/748) [`ea475ad`](https://github.com/aragon/app/commit/ea475ad38d8e441890f9dbb1d2e28afd3bea4533) Thanks [@milosh86](https://github.com/milosh86)! - Remove the fiat value from DAO transactions list item

- [#730](https://github.com/aragon/app/pull/730) [`56060ee`](https://github.com/aragon/app/commit/56060ee36e9070d0cec6d97859fd949d090c533e) Thanks [@jjavieralv](https://github.com/jjavieralv)! - Rename repository from app-next to app

- [#718](https://github.com/aragon/app/pull/718) [`95662fe`](https://github.com/aragon/app/commit/95662fe6f47c986772d27761f81b53495d4e64b0) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump actions/download-artifact to v5

- [#750](https://github.com/aragon/app/pull/750) [`d86c692`](https://github.com/aragon/app/commit/d86c692963fa522b365b4fe698950c68156beb7b) Thanks [@thekidnamedkd](https://github.com/thekidnamedkd)! - Update member details page 'Last Activity' for block number usage

- [#724](https://github.com/aragon/app/pull/724) [`c50be3f`](https://github.com/aragon/app/commit/c50be3f1daa8f0c8d989676ac9a5070c973ad382) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @sentry/nextjs to v10

- [#710](https://github.com/aragon/app/pull/710) [`2929212`](https://github.com/aragon/app/commit/29292123f219d1bb4eecf1041e09f947b13d2ded) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update minor and patch NPM dependencies

- [#725](https://github.com/aragon/app/pull/725) [`b834d23`](https://github.com/aragon/app/commit/b834d232f7bc7365e77f302fd25855ea5d04a3bc) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump vercel to v46

- [#737](https://github.com/aragon/app/pull/737) [`fb06119`](https://github.com/aragon/app/commit/fb061198ebe7455481c46f641b0c583f05cb6f81) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Update governance designer to support reusing existing bodies

- [#732](https://github.com/aragon/app/pull/732) [`c959a26`](https://github.com/aragon/app/commit/c959a26957525359e80ecd6c29b3b5a62ffdb647) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Update governance designer and process page to support execute condition without function selectors

- [#726](https://github.com/aragon/app/pull/726) [`e71483a`](https://github.com/aragon/app/commit/e71483a7245af9d53f19e95b7a2c3dbb906cf0b1) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump 1password/load-secrets-action to v3

### Patch Changes

- [#721](https://github.com/aragon/app/pull/721) [`b9a6082`](https://github.com/aragon/app/commit/b9a6082d27fccc6158a8960d4d20acd41db611bd) Thanks [@milosh86](https://github.com/milosh86)! - Remove erroneous function selector details for native transfer actions

- [#720](https://github.com/aragon/app/pull/720) [`8f0790a`](https://github.com/aragon/app/commit/8f0790a360030ceb1d0fdf30cfc11cd5a0cabda3) Thanks [@evanaronson](https://github.com/evanaronson)! - Move call to action button on granular permission management step of proposal creation wizard below data list

- [#723](https://github.com/aragon/app/pull/723) [`5debf07`](https://github.com/aragon/app/commit/5debf078d215cc6275d891788e9b653815f0e57a) Thanks [@evanaronson](https://github.com/evanaronson)! - Force casing of proposal slugs to always show in uppercase

- [#738](https://github.com/aragon/app/pull/738) [`cd7500c`](https://github.com/aragon/app/commit/cd7500c946dc3f2a2abd444668288c94707b98d3) Thanks [@milosh86](https://github.com/milosh86)! - Rename `type` to `side` in transaction interface in `finance` module

## 1.8.0

### Minor Changes

- [#659](https://github.com/aragon/app/pull/659) [`6eb0257`](https://github.com/aragon/app/commit/6eb025717fe966d1a234470fcd22a05f4e62bbb7) Thanks [@evanaronson](https://github.com/evanaronson)! - Apply minor UI changes to the transfer basic action component and fix validation of AssetInput component

- [#679](https://github.com/aragon/app/pull/679) [`a79a660`](https://github.com/aragon/app/commit/a79a660cc0fa7b0237c99ed25f424c1508551c72) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Update tabs handling to reflect state on URL search parameters

- [#677](https://github.com/aragon/app/pull/677) [`aa22d3a`](https://github.com/aragon/app/commit/aa22d3ab95f4965404f3b886fe680e2f43b77ef5) Thanks [@milosh86](https://github.com/milosh86)! - Implement proper merging of native and custom actions in the `ActionComposer`

- [#660](https://github.com/aragon/app/pull/660) [`cbc80cd`](https://github.com/aragon/app/commit/cbc80cd68a1c37940a5e9182d356879bbe389bb2) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Support capital-distributor plugin and base claim experience

- [#669](https://github.com/aragon/app/pull/669) [`1906da8`](https://github.com/aragon/app/commit/1906da82c35bc52a55558325a01869f78cce74ad) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update minor and patch NPM dependencies

- [#676](https://github.com/aragon/app/pull/676) [`693dfd0`](https://github.com/aragon/app/commit/693dfd0085a4bcaac8f434959a467336d159023c) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update minor and patch NPM dependencies

- [#654](https://github.com/aragon/app/pull/654) [`439c190`](https://github.com/aragon/app/commit/439c190aad733d3c80605b06a13d0878953ef1c2) Thanks [@thekidnamedkd](https://github.com/thekidnamedkd)! - Update addresses validation

- [#662](https://github.com/aragon/app/pull/662) [`ee8f1ad`](https://github.com/aragon/app/commit/ee8f1adce4955c035d2f1bd65e71308ad7c02341) Thanks [@shan8851](https://github.com/shan8851)! - Refactor governance designer flow to support read-only view

- [#702](https://github.com/aragon/app/pull/702) [`2115878`](https://github.com/aragon/app/commit/211587829429ec6392b7d889ebee72bb154ae780) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @eslint/plugin-kit from 0.3.1 to 0.3.4

- [#674](https://github.com/aragon/app/pull/674) [`9866f6c`](https://github.com/aragon/app/commit/9866f6c0b897657837166e4077f5e3381921cc83) Thanks [@thekidnamedkd](https://github.com/thekidnamedkd)! - Update useMemberLocks params to use escrowAddress instead of pluginAddress

- [#703](https://github.com/aragon/app/pull/703) [`8183696`](https://github.com/aragon/app/commit/8183696be3b14b54679c811c0df667b2f6381dcf) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump linkifyjs from 4.3.1 to 4.3.2

- [#667](https://github.com/aragon/app/pull/667) [`fc71493`](https://github.com/aragon/app/commit/fc71493a8dd813b8661ef4c9c3736a5f726e02f9) Thanks [@evanaronson](https://github.com/evanaronson)! - Add token name and symbol fallback to fix an issue where form validation would block token importing

- [#677](https://github.com/aragon/app/pull/677) [`aa22d3a`](https://github.com/aragon/app/commit/aa22d3ab95f4965404f3b886fe680e2f43b77ef5) Thanks [@milosh86](https://github.com/milosh86)! - Add `excludeActionTypes` prop to `ActionComposer` to filter out specific action types

- [#658](https://github.com/aragon/app/pull/658) [`214b242`](https://github.com/aragon/app/commit/214b2426dab3bf8524e219d960dd0b27c07ac53e) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update minor and patch NPM dependencies

- [#691](https://github.com/aragon/app/pull/691) [`1f1e82e`](https://github.com/aragon/app/commit/1f1e82e362aa547f6c9b49e74d7ad2333eb4c975) Thanks [@shan8851](https://github.com/shan8851)! - Add restriction to remove admin to processes with full execute

- [#684](https://github.com/aragon/app/pull/684) [`b396783`](https://github.com/aragon/app/commit/b3967831b2a6c0c3c76b4931d950763d7068a82a) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @eslint/plugin-kit to 0.3.3

- [#693](https://github.com/aragon/app/pull/693) [`af629a3`](https://github.com/aragon/app/commit/af629a3ae2fcbc5de42eb29059cd9249d2208719) Thanks [@thekidnamedkd](https://github.com/thekidnamedkd)! - Display authorized actions on process pages

- [#711](https://github.com/aragon/app/pull/711) [`8ac04ff`](https://github.com/aragon/app/commit/8ac04ff66e4b5a90fe7914d2ed65d7a4541c43c0) Thanks [@thekidnamedkd](https://github.com/thekidnamedkd)! - Fix crash on settings DAO page when all plugins have been uninstalled

- [#672](https://github.com/aragon/app/pull/672) [`1febb73`](https://github.com/aragon/app/commit/1febb730fb2b9752f2d7368fcf33ae286981d0e2) Thanks [@thekidnamedkd](https://github.com/thekidnamedkd)! - Update Collapsible component for collapsedLines prop change

- [#681](https://github.com/aragon/app/pull/681) [`2d62015`](https://github.com/aragon/app/commit/2d6201555fa2b37ebf934c5f7a3773dda07fa064) Thanks [@thekidnamedkd](https://github.com/thekidnamedkd)! - Implement ProcessDetails page with read-only Process form components

- [#683](https://github.com/aragon/app/pull/683) [`bc9be7d`](https://github.com/aragon/app/commit/bc9be7d4a3162aacd0cafed8751559861f317203) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Display governance processes on settings page

- [#686](https://github.com/aragon/app/pull/686) [`c165d6e`](https://github.com/aragon/app/commit/c165d6eda5a0080455c8ffbfc3197eadfd747c20) Thanks [@shan8851](https://github.com/shan8851)! - Implement permission granting to a governance process

- [#714](https://github.com/aragon/app/pull/714) [`a8f3487`](https://github.com/aragon/app/commit/a8f34878fb79ce799acefe8fd9a6b32ca47a4e77) Thanks [@thekidnamedkd](https://github.com/thekidnamedkd)! - Remove delegationCount from app experience

- [#670](https://github.com/aragon/app/pull/670) [`6830e95`](https://github.com/aragon/app/commit/6830e95ee4b432260ba564cc0a306f55b886d55a) Thanks [@milosh86](https://github.com/milosh86)! - Update action composer to merge native and custom actions

- [#661](https://github.com/aragon/app/pull/661) [`7dc9260`](https://github.com/aragon/app/commit/7dc9260c59f2ef47764031264550d7e7717c2ad4) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Update DAO creation transaction dialog to wait for the admin plugin to be indexed

- [#698](https://github.com/aragon/app/pull/698) [`894ea8e`](https://github.com/aragon/app/commit/894ea8ec8d6f567c2cd2606f5b7f05f9a4f3be30) Thanks [@thekidnamedkd](https://github.com/thekidnamedkd)! - Implement LockToVote plugin setup

- [#688](https://github.com/aragon/app/pull/688) [`cd369cb`](https://github.com/aragon/app/commit/cd369cb404e8e3a1aff4f7dc245adbd775c5d5b9) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update minor and patch NPM dependencies

- [#665](https://github.com/aragon/app/pull/665) [`10d1331`](https://github.com/aragon/app/commit/10d133175e54e7d9c4468f83f2a5b8353594a8f1) Thanks [@evanaronson](https://github.com/evanaronson)! - Fixed an issue where non-mainnet DAOs with a subname but no ENS were crashing the app

- [#699](https://github.com/aragon/app/pull/699) [`e60afea`](https://github.com/aragon/app/commit/e60afea5557877725d637b0578254cd37512a67e) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump cross-env to v10

### Patch Changes

- [#715](https://github.com/aragon/app/pull/715) [`68080f1`](https://github.com/aragon/app/commit/68080f1bbcdeb786354e8177a1bdcca9a19c5abd) Thanks [@milosh86](https://github.com/milosh86)! - Refactor function selector util to make it reusable across the app

- [#708](https://github.com/aragon/app/pull/708) [`9a89b99`](https://github.com/aragon/app/commit/9a89b99dbf6b86b117a63378defc731198895c8c) Thanks [@milosh86](https://github.com/milosh86)! - Introduce Turbopack into dev build to improve HMR speed

- [#695](https://github.com/aragon/app/pull/695) [`d176bac`](https://github.com/aragon/app/commit/d176bac95ad3702371a4e931abbe71408d347d4f) Thanks [@milosh86](https://github.com/milosh86)! - Fix allowed actions switch init logic in `ActionComposer`

- [#695](https://github.com/aragon/app/pull/695) [`d176bac`](https://github.com/aragon/app/commit/d176bac95ad3702371a4e931abbe71408d347d4f) Thanks [@milosh86](https://github.com/milosh86)! - Set maximum page size for `useAllowedActions` hook in `ActionComposer`

- [#694](https://github.com/aragon/app/pull/694) [`60e2798`](https://github.com/aragon/app/commit/60e2798a938b27db4f92760e649e5c26bd25f412) Thanks [@shan8851](https://github.com/shan8851)! - Fix transaction for building execute conditions and add validation to selectors field

- [#697](https://github.com/aragon/app/pull/697) [`f5fbbd0`](https://github.com/aragon/app/commit/f5fbbd0eea185b2b5f7cbb33ab2b762a29a0936f) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Fix formatting of min participation setting value for token-voting plugin

- [#678](https://github.com/aragon/app/pull/678) [`a0bb3bd`](https://github.com/aragon/app/commit/a0bb3bdb2b1de7ec2207171b847c7452f955801e) Thanks [@milosh86](https://github.com/milosh86)! - Refactor ActionComposer into shared, reusable component

- [#695](https://github.com/aragon/app/pull/695) [`d176bac`](https://github.com/aragon/app/commit/d176bac95ad3702371a4e931abbe71408d347d4f) Thanks [@milosh86](https://github.com/milosh86)! - Fix `getAllowedActionItems` in `ActionComposer` to properly handle native items from all plugins

- [#664](https://github.com/aragon/app/pull/664) [`6517943`](https://github.com/aragon/app/commit/651794377affb3c3b09a5e7c197051d2cb1efb87) Thanks [@shan8851](https://github.com/shan8851)! - Fix manage admins flow by adding new max page size param

- [#713](https://github.com/aragon/app/pull/713) [`277dbf7`](https://github.com/aragon/app/commit/277dbf76d9c43ad81cdeacd608da0af75799e544) Thanks [@milosh86](https://github.com/milosh86)! - Add missing condition factory addresses

- [#685](https://github.com/aragon/app/pull/685) [`bff98d7`](https://github.com/aragon/app/commit/bff98d7a3e385201affd295d09e341d0f5dc5155) Thanks [@milosh86](https://github.com/milosh86)! - Update `ActionComposer` to show by default only actions that process has permissions to do

- [#689](https://github.com/aragon/app/pull/689) [`2d4b8c0`](https://github.com/aragon/app/commit/2d4b8c010e3e27cbb3fda430f994acb3fefeeaff) Thanks [@thekidnamedkd](https://github.com/thekidnamedkd)! - Correctly handle decimal values for `minParticipation` setting on token-voting plugin

- [#682](https://github.com/aragon/app/pull/682) [`10cb0ba`](https://github.com/aragon/app/commit/10cb0baf19fab4ec57c53eaa8ba112756df77ae4) Thanks [@milosh86](https://github.com/milosh86)! - Wrap generateMetadata utils in try-catch to properly log Sentry errors

- [#696](https://github.com/aragon/app/pull/696) [`c6904d6`](https://github.com/aragon/app/commit/c6904d6bd72be669450767bfb78a8afabcb05d54) Thanks [@shan8851](https://github.com/shan8851)! - Fix transaction data for deploying execute condition with selectors to match what is expected on the smart contract

- [#687](https://github.com/aragon/app/pull/687) [`9032e22`](https://github.com/aragon/app/commit/9032e22fa749ea63dbdfb8dc04a419f8fd1d0709) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Update values of tab IDs to lowercase for better URL consistency

- [#675](https://github.com/aragon/app/pull/675) [`1491370`](https://github.com/aragon/app/commit/1491370fbc1830c6031236c0c2c0c8a50118baf8) Thanks [@milosh86](https://github.com/milosh86)! - Refactor plugin system to prefer interfaceType over subdomain

- [#715](https://github.com/aragon/app/pull/715) [`68080f1`](https://github.com/aragon/app/commit/68080f1bbcdeb786354e8177a1bdcca9a19c5abd) Thanks [@milosh86](https://github.com/milosh86)! - Fix invalid duplicate action validation on actions from imported contract

## 1.7.0

### Minor Changes

- [#648](https://github.com/aragon/app/pull/648) [`7ceabfe`](https://github.com/aragon/app/commit/7ceabfe78d598daefed746c9fc9378e1bcf83bbc) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump `vercel` to v44

- [#617](https://github.com/aragon/app/pull/617) [`69cba92`](https://github.com/aragon/app/commit/69cba920466cd8a5a39fb804e7f17fc4edac8897) Thanks [@shan8851](https://github.com/shan8851)! - Add VE-locks support to token-member panel

- [#647](https://github.com/aragon/app/pull/647) [`628f124`](https://github.com/aragon/app/commit/628f1241cc3b97cfa8946a044f57ec93d0eae5cc) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update minor and patch NPM dependencies

- [#652](https://github.com/aragon/app/pull/652) [`0c39864`](https://github.com/aragon/app/commit/0c39864816aae4473fe11ea813d29939922ee2f6) Thanks [@shan8851](https://github.com/shan8851)! - Update all backend endpoints to v2 and enforce daoId or network and pluginAddress params

- [#644](https://github.com/aragon/app/pull/644) [`fbc361e`](https://github.com/aragon/app/commit/fbc361e9cce00917332c3d2f610c8e0e9391499a) Thanks [@shan8851](https://github.com/shan8851)! - Implement versioning for Aragon backend endpoints

- [#653](https://github.com/aragon/app/pull/653) [`9c8f1f1`](https://github.com/aragon/app/commit/9c8f1f18c9edfcb54b153ff6adf790d579d4e28a) Thanks [@evanaronson](https://github.com/evanaronson)! - Update strings across app to adhere to style guide

- [#646](https://github.com/aragon/app/pull/646) [`fc99fa1`](https://github.com/aragon/app/commit/fc99fa1cea5c6c61c4a5ef82d5e2e368735ddacf) Thanks [@shan8851](https://github.com/shan8851)! - Add direct RPC calls for checking voting permissions and remove redundant backend endpoint

- [#651](https://github.com/aragon/app/pull/651) [`8158a61`](https://github.com/aragon/app/commit/8158a6157d145509458a427402b81d91807b9dad) Thanks [@jjavieralv](https://github.com/jjavieralv)! - Update release workflow to sign arabot commit

- [#641](https://github.com/aragon/app/pull/641) [`c1584b7`](https://github.com/aragon/app/commit/c1584b768c27ca63f65de13d9fcba40b1c85dc8e) Thanks [@milosh86](https://github.com/milosh86)! - Implement form validation improvements on TokenVoting setup wizard

- [#649](https://github.com/aragon/app/pull/649) [`23dd5de`](https://github.com/aragon/app/commit/23dd5dea154aa1bf24192ac5e964e33d476a2be4) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Add support for Chiliz network

- [#636](https://github.com/aragon/app/pull/636) [`8036f00`](https://github.com/aragon/app/commit/8036f005f183d559e67ac3bad1eb937359df4791) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update minor and patch NPM dependencies

- [#645](https://github.com/aragon/app/pull/645) [`72d9435`](https://github.com/aragon/app/commit/72d94355a5ec76aadd28ef40d10d916c53b38aa3) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Add support for custom plugin and DAO pages

- [#650](https://github.com/aragon/app/pull/650) [`19f8103`](https://github.com/aragon/app/commit/19f81034bafa320b8b2fd8d51bf63dcb7d475674) Thanks [@shan8851](https://github.com/shan8851)! - Remove legacy app button

### Patch Changes

- [#638](https://github.com/aragon/app/pull/638) [`b641def`](https://github.com/aragon/app/commit/b641def7fe40d0db998b8256218f5868301a4103) Thanks [@milosh86](https://github.com/milosh86)! - Add `networks` query param to `daoListByMemberParams` to prevent unknown DAO issues

- [#637](https://github.com/aragon/app/pull/637) [`44190a4`](https://github.com/aragon/app/commit/44190a4576948525278cfb07fbdc8a5358b13afb) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Correctly display native transfer actions on proposal page

- [#635](https://github.com/aragon/app/pull/635) [`ad6c063`](https://github.com/aragon/app/commit/ad6c06315dd9a17ed33c57decbb0559c6be8627d) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Fix crash on Explore page on wallet-connect user disconnect

- [#639](https://github.com/aragon/app/pull/639) [`b3cdb19`](https://github.com/aragon/app/commit/b3cdb19488aa22caddffb23877ee4a00c6d46c84) Thanks [@shan8851](https://github.com/shan8851)! - Implement UX and form validation improvements on governance designer flow

- [#656](https://github.com/aragon/app/pull/656) [`3dcec7e`](https://github.com/aragon/app/commit/3dcec7eae8b0ca149474a490d832c8700655d898) Thanks [@evanaronson](https://github.com/evanaronson)! - Update the logo for the Optimism chain.

- [#642](https://github.com/aragon/app/pull/642) [`dee94d5`](https://github.com/aragon/app/commit/dee94d5af1194f53555831a4d56580f59adfb482) Thanks [@evanaronson](https://github.com/evanaronson)! - Fix style and formatting inconsistencies in the body overview of the voting terminal

## 1.6.0

### Minor Changes

- [#615](https://github.com/aragon/app/pull/615) [`81c9193`](https://github.com/aragon/app/commit/81c91936b7a76e3156d982ba2c660cf84deac1de) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Implement "all" proposals tab on DAO proposals page

- [#620](https://github.com/aragon/app/pull/620) [`6c14e18`](https://github.com/aragon/app/commit/6c14e182b0edaed67067042a5ad5faa25698ef44) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update minor and patch NPM dependencies

- [#601](https://github.com/aragon/app/pull/601) [`bb4bd7a`](https://github.com/aragon/app/commit/bb4bd7a70210f5283946cb89a7b4fa11bc81441a) Thanks [@thekidnamedkd](https://github.com/thekidnamedkd)! - Implement custom dashboard page header for Boundless DAO

- [#630](https://github.com/aragon/app/pull/630) [`620c865`](https://github.com/aragon/app/commit/620c8656a2067e425103844919d8486174185448) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump vercel to 43.2.0

- [#619](https://github.com/aragon/app/pull/619) [`5beca0a`](https://github.com/aragon/app/commit/5beca0a0de299b11658c3132667f9dd565e803b7) Thanks [@evanaronson](https://github.com/evanaronson)! - Display token with copy button on members settings

- [#621](https://github.com/aragon/app/pull/621) [`675f1b7`](https://github.com/aragon/app/commit/675f1b73e45a21555bac3dcb8e4dc6cea421bc2e) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump `brace-expansion` to 1.1.12

- [#629](https://github.com/aragon/app/pull/629) [`b2c0094`](https://github.com/aragon/app/commit/b2c0094b2f3afe9721a130a702164adc5f832b52) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @types/node to v24

- [#623](https://github.com/aragon/app/pull/623) [`76f0fa8`](https://github.com/aragon/app/commit/76f0fa88acec3dc18d185a7dc0400598b13e0746) Thanks [@milosh86](https://github.com/milosh86)! - Add support for Corn network

- [#626](https://github.com/aragon/app/pull/626) [`0724e18`](https://github.com/aragon/app/commit/0724e1899f207d2ea73603b60220568d0ec1fe5b) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update jest to v30

- [#614](https://github.com/aragon/app/pull/614) [`988584d`](https://github.com/aragon/app/commit/988584d329d91639582fef5da93757da0d88b89e) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update minor and patch NPM dependencies

- [#631](https://github.com/aragon/app/pull/631) [`8b4e2a2`](https://github.com/aragon/app/commit/8b4e2a2b6cf7b4e36cd436d9ded501baad4fd23f) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump softprops/action-gh-release to 2.3.2

### Patch Changes

- [#625](https://github.com/aragon/app/pull/625) [`9ead3e6`](https://github.com/aragon/app/commit/9ead3e6b5bbd81fa72b25983a49df32dcb6637c0) Thanks [@evanaronson](https://github.com/evanaronson)! - Fix order of proposals on member pages

- [#624](https://github.com/aragon/app/pull/624) [`ef92185`](https://github.com/aragon/app/commit/ef9218515d93e61472fa4bdb8da04f6a6371af55) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Fix token validation to block wizard when address is not a valid token

- [#618](https://github.com/aragon/app/pull/618) [`aef1bae`](https://github.com/aragon/app/commit/aef1baeb650850e5dbe0d20d042372460d1c2dce) Thanks [@thekidnamedkd](https://github.com/thekidnamedkd)! - Correctly display proposals slug, hide proposals created on uninstalled plugins

- [#607](https://github.com/aragon/app/pull/607) [`ab2b7d5`](https://github.com/aragon/app/commit/ab2b7d5cde137fba83e4332a840d95b74dff2057) Thanks [@evanaronson](https://github.com/evanaronson)! - Fix governance token checks for ERC20 compatibility

## 1.5.0

### Minor Changes

- [#598](https://github.com/aragon/app/pull/598) [`b674a31`](https://github.com/aragon/app/commit/b674a31d5d5e859430757f887c8ab269d84aa461) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update minor and patch NPM dependencies

- [#589](https://github.com/aragon/app/pull/589) [`132fb1d`](https://github.com/aragon/app/commit/132fb1dcf513e2c7f1e697d073e83fd6e785a36b) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update minor and patch NPM dependencies

- [#592](https://github.com/aragon/app/pull/592) [`38a793f`](https://github.com/aragon/app/commit/38a793f43b7f7a80c0435ae806f9c2677d51c1e5) Thanks [@milosh86](https://github.com/milosh86)! - Add support for Optimism network

- [#595](https://github.com/aragon/app/pull/595) [`ce51275`](https://github.com/aragon/app/commit/ce512756a222905777e9f25fcb545fbcf8f54a96) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Use /can-create-proposal endpoint to check user proposal-creation permission

- [#522](https://github.com/aragon/app/pull/522) [`e65598e`](https://github.com/aragon/app/commit/e65598e725d12eb8cbc333e458e9b8b33827f077) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Implement quick copy with `Clipboard` component

- [#599](https://github.com/aragon/app/pull/599) [`9cc4c5a`](https://github.com/aragon/app/commit/9cc4c5a8d26a50fb178896bf90f5557218d14de7) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump vercel to v42

- [#608](https://github.com/aragon/app/pull/608) [`ddfbd7a`](https://github.com/aragon/app/commit/ddfbd7a85ff53b405e706d7b9cbbe083f875f9c4) Thanks [@evanaronson](https://github.com/evanaronson)! - Enable feature to upgrade OSx smart contracts on production and staging environments

- [#522](https://github.com/aragon/app/pull/522) [`e65598e`](https://github.com/aragon/app/commit/e65598e725d12eb8cbc333e458e9b8b33827f077) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Improve veto communications in voting terminal and vote dialog

- [#522](https://github.com/aragon/app/pull/522) [`e65598e`](https://github.com/aragon/app/commit/e65598e725d12eb8cbc333e458e9b8b33827f077) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Display plugin info on settings tab of voting terminal

- [#597](https://github.com/aragon/app/pull/597) [`8c2e7dd`](https://github.com/aragon/app/commit/8c2e7dd765faeb43c7d3924858ab40b0365e7582) Thanks [@evanaronson](https://github.com/evanaronson)! - Fix casing issue on a string on the voting guard

- [#522](https://github.com/aragon/app/pull/522) [`e65598e`](https://github.com/aragon/app/commit/e65598e725d12eb8cbc333e458e9b8b33827f077) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Update style and layout of navigation on DAO pages

- [#522](https://github.com/aragon/app/pull/522) [`e65598e`](https://github.com/aragon/app/commit/e65598e725d12eb8cbc333e458e9b8b33827f077) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Migrate Tailwind CSS library to v4

- [#587](https://github.com/aragon/app/pull/587) [`40644bd`](https://github.com/aragon/app/commit/40644bd135e068a1f5ea54ffae7b0f864807ad82) Thanks [@evanaronson](https://github.com/evanaronson)! - Set "Early Stage Advance" as the default setting in the Governance Designer

### Patch Changes

- [#522](https://github.com/aragon/app/pull/522) [`e65598e`](https://github.com/aragon/app/commit/e65598e725d12eb8cbc333e458e9b8b33827f077) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Update SPP utilities to correctly handle optimistic stages

- [#522](https://github.com/aragon/app/pull/522) [`e65598e`](https://github.com/aragon/app/commit/e65598e725d12eb8cbc333e458e9b8b33827f077) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Fix crash on Explore page on user disconnect

## 1.4.0

### Minor Changes

- [#551](https://github.com/aragon/app/pull/551) [`0212491`](https://github.com/aragon/app/commit/0212491da541561fbcda7b0714c827c0efe270dc) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump lint-staged to v16

- [#543](https://github.com/aragon/app/pull/543) [`f54ea0a`](https://github.com/aragon/app/commit/f54ea0ab3138c1e10547527141d6f377d59b2f89) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Implement flow for updating DAO smart contracts (only enabled on non production environments)

- [#549](https://github.com/aragon/app/pull/549) [`373102e`](https://github.com/aragon/app/commit/373102e75fc80a7dba6cd848e4563584cde13737) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update minor and patch NPM dependencies

- [#545](https://github.com/aragon/app/pull/545) [`c3e4d26`](https://github.com/aragon/app/commit/c3e4d26e5c7fb4595632be142f50e4afb56c96d7) Thanks [@milosh86](https://github.com/milosh86)! - Add support for ENS in DAO urls

- [#542](https://github.com/aragon/app/pull/542) [`e40a5f5`](https://github.com/aragon/app/commit/e40a5f55d8be82df1cd3a3f78daac1485a7f8cbe) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update minor and patch NPM dependencies

### Patch Changes

- [#553](https://github.com/aragon/app/pull/553) [`e33baa7`](https://github.com/aragon/app/commit/e33baa7719291f7d7d136a45203c6116d6c76c8d) Thanks [@shan8851](https://github.com/shan8851)! - Refactor plugins directory to improve DX for complex slot components as app complexity grows, update documentation accordingly

- [#585](https://github.com/aragon/app/pull/585) [`61cb6a8`](https://github.com/aragon/app/commit/61cb6a8a8bdad77dcefeea1b954673a292098d8b) Thanks [@milosh86](https://github.com/milosh86)! - Fix calling get-dao-by-ens API to use full ENS name

- [#548](https://github.com/aragon/app/pull/548) [`83b3310`](https://github.com/aragon/app/commit/83b3310fc4df6bad9d8fbe7c3ec600795aafa407) Thanks [@shan8851](https://github.com/shan8851)! - Update to new simplified proposals endpoint and introduce new getProposalActions endpoint and usage throughout the app

- [#537](https://github.com/aragon/app/pull/537) [`43720fe`](https://github.com/aragon/app/commit/43720fedecc9395ee6fa2847825d1d38577d5408) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Update release workflow to retrieve secrets from 1Password

- [#546](https://github.com/aragon/app/pull/546) [`c92fc7b`](https://github.com/aragon/app/commit/c92fc7b373b99d3242562f30c80ee5af905230f2) Thanks [@thekidnamedkd](https://github.com/thekidnamedkd)! - Implement branded external bodies on ProposalVoting, support loading state decoding ProposlActions

- [#554](https://github.com/aragon/app/pull/554) [`92fd154`](https://github.com/aragon/app/commit/92fd154336398c0e9bdd7193b59c5328c3a2edf0) Thanks [@evanaronson](https://github.com/evanaronson)! - Update strings and resolve typos throughout the app

- [#552](https://github.com/aragon/app/pull/552) [`a2ab827`](https://github.com/aragon/app/commit/a2ab827d01e4f765b09431224787398c943002d5) Thanks [@milosh86](https://github.com/milosh86)! - Fix test warnings and create process link

## 1.3.0

### Minor Changes

- [#528](https://github.com/aragon/app/pull/528) [`62e9b1f`](https://github.com/aragon/app/commit/62e9b1f8bf655f4b923c786d69c975f89503208d) Thanks [@thekidnamedkd](https://github.com/thekidnamedkd)! - Display links to block explorer on external body setup

- [#523](https://github.com/aragon/app/pull/523) [`5b2e14a`](https://github.com/aragon/app/commit/5b2e14a0ff07d6732798f4eaed31fb5e515f2e9c) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump actions/download-artifact to 4.3.0

- [#495](https://github.com/aragon/app/pull/495) [`d9c0cd5`](https://github.com/aragon/app/commit/d9c0cd556bec8a8153b5f24ae57036c3ef92b5e3) Thanks [@thekidnamedkd](https://github.com/thekidnamedkd)! - Implement debug panel

- [#509](https://github.com/aragon/app/pull/509) [`ced4fa0`](https://github.com/aragon/app/commit/ced4fa08c0c622b637c715a41e7d265b082a317c) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Hide testnet DAOs from all-daos list on explore page

- [#506](https://github.com/aragon/app/pull/506) [`25f4f92`](https://github.com/aragon/app/commit/25f4f9256eb0e080e49edaa361bc4090bedf39b4) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Update Governance Designer and Voting Terminal to support external addresses

- [#524](https://github.com/aragon/app/pull/524) [`ada13c8`](https://github.com/aragon/app/commit/ada13c817d14250e72f866a814ce6720f77d2d13) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update minor and patch NPM dependencies

- [#518](https://github.com/aragon/app/pull/518) [`86c37de`](https://github.com/aragon/app/commit/86c37de11c446f7a1457c02c859a742fda56e9bb) Thanks [@shan8851](https://github.com/shan8851)! - Use universal proposal status utility for token and multisig plugins

- [#503](https://github.com/aragon/app/pull/503) [`9fbad8f`](https://github.com/aragon/app/commit/9fbad8fbbce01d0e9baf23f769f23799e6da43cf) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update minor and patch NPM dependencies

- [#513](https://github.com/aragon/app/pull/513) [`2ddb6d3`](https://github.com/aragon/app/commit/2ddb6d3568980ee407840d059c437a0ec189d944) Thanks [@shan8851](https://github.com/shan8851)! - Add ens subdomain to dao creation on mainnet

- [#527](https://github.com/aragon/app/pull/527) [`2dd614a`](https://github.com/aragon/app/commit/2dd614abcd8a2d9738e5959e4f504f1d706adb7a) Thanks [@evanaronson](https://github.com/evanaronson)! - Change demo DAO header from Aragon X to the Aragon demo DAO

- [#514](https://github.com/aragon/app/pull/514) [`81e9251`](https://github.com/aragon/app/commit/81e925125fc9fa626a2bd560f8398a51ad9ea146) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Implement proxy function for backend requests

- [#505](https://github.com/aragon/app/pull/505) [`4be4893`](https://github.com/aragon/app/commit/4be4893e66f7617e116361a8969dbc607cd4f5c0) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump softprops/action-gh-release to 2.2.2

- [#492](https://github.com/aragon/app/pull/492) [`73f7080`](https://github.com/aragon/app/commit/73f7080432457e358b3678fb02d4b5c466e763eb) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update minor and patch NPM dependencies

- [#489](https://github.com/aragon/app/pull/489) [`8aab0cf`](https://github.com/aragon/app/commit/8aab0cf8355a3a4de708f2dd84da07f7da9f977e) Thanks [@milosh86](https://github.com/milosh86)! - Implement new process creation flow via an existing process

### Patch Changes

- [#490](https://github.com/aragon/app/pull/490) [`17a570a`](https://github.com/aragon/app/commit/17a570a9ee25fe98b7187bd8d181138355647a96) Thanks [@thekidnamedkd](https://github.com/thekidnamedkd)! - Increase query params for min dimensions on IPFS asset fetching

- [#529](https://github.com/aragon/app/pull/529) [`e44c680`](https://github.com/aragon/app/commit/e44c68063a856dff1f185694cd8db535d1367a5d) Thanks [@shan8851](https://github.com/shan8851)! - Fix validation on ens subdomain during DAO creation flow to stop failed transactions

- [#510](https://github.com/aragon/app/pull/510) [`019aeea`](https://github.com/aragon/app/commit/019aeeac07753e308553877972fd5791f90528dc) Thanks [@shan8851](https://github.com/shan8851)! - Update create DAO form to place Sepolia as first item and add help text recommending Sepolia for first time use

- [#498](https://github.com/aragon/app/pull/498) [`b6ec741`](https://github.com/aragon/app/commit/b6ec7416865ccb90e1ff0412dc0b02b42f392853) Thanks [@thekidnamedkd](https://github.com/thekidnamedkd)! - Fix sizes of AdminManage and AdminUninstall dialogs

- [#491](https://github.com/aragon/app/pull/491) [`c8cd33b`](https://github.com/aragon/app/commit/c8cd33b1184d16f4e05c8bcc1f7b499429f0ccbc) Thanks [@shan8851](https://github.com/shan8851)! - Adjust CSP to allow for vercel comments outside of production

- [#531](https://github.com/aragon/app/pull/531) [`873c0b5`](https://github.com/aragon/app/commit/873c0b5cc24823f88e43b4e223f64e24866dbd06) Thanks [@milosh86](https://github.com/milosh86)! - Fix validation bug when creating simple governance processes

- [#532](https://github.com/aragon/app/pull/532) [`24d49b1`](https://github.com/aragon/app/commit/24d49b14f3b6cde0970cb5697344a56a1371be73) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump base-x from 5.0.0 to 5.0.1

- [#528](https://github.com/aragon/app/pull/528) [`62e9b1f`](https://github.com/aragon/app/commit/62e9b1f8bf655f4b923c786d69c975f89503208d) Thanks [@thekidnamedkd](https://github.com/thekidnamedkd)! - Fix ENS resolution on DAO members page

- [#538](https://github.com/aragon/app/pull/538) [`6cff6b9`](https://github.com/aragon/app/commit/6cff6b9bf49b76fde6c532bea90cf22685699488) Thanks [@evanaronson](https://github.com/evanaronson)! - Update strings across app to adhere to style guide

- [#511](https://github.com/aragon/app/pull/511) [`9fdce56`](https://github.com/aragon/app/commit/9fdce560b3e2ffe45150a37c21b76c713001937f) Thanks [@milosh86](https://github.com/milosh86)! - Fix referential stability issue with useRouter

- [#496](https://github.com/aragon/app/pull/496) [`d281ddb`](https://github.com/aragon/app/commit/d281ddb38f5bd1ca71cbe4e5670929d5bba04ff2) Thanks [@evanaronson](https://github.com/evanaronson)! - Update strings across app to adhere to style guide

- [#497](https://github.com/aragon/app/pull/497) [`8536fd3`](https://github.com/aragon/app/commit/8536fd352a300084b40dce1f4fe191f3ff440eca) Thanks [@milosh86](https://github.com/milosh86)! - Add permission check to process creation flow via new useProposalPermissionCheckGuard hook

- [#533](https://github.com/aragon/app/pull/533) [`8a69dd8`](https://github.com/aragon/app/commit/8a69dd8ee38470a1072f66985f639a7ebb36514f) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Update backend URL on all environments

- [#525](https://github.com/aragon/app/pull/525) [`6724f78`](https://github.com/aragon/app/commit/6724f7876675bcf53b0f4dd695a9d02ce4367ea0) Thanks [@milosh86](https://github.com/milosh86)! - Update member DAOs sorting to be sorted by the blockTimestamp

- [#526](https://github.com/aragon/app/pull/526) [`8a38815`](https://github.com/aragon/app/commit/8a38815e32e4345229ad38535f85e2c35faed7eb) Thanks [@shan8851](https://github.com/shan8851)! - Implement shared GovernanceBodyInfo component and use on the process creation flow

- [#535](https://github.com/aragon/app/pull/535) [`75e0d68`](https://github.com/aragon/app/commit/75e0d683da3bc5552e3b270873397d6b4665cb02) Thanks [@shan8851](https://github.com/shan8851)! - Fix labels and help text on the create new token flow

- [#499](https://github.com/aragon/app/pull/499) [`76accf0`](https://github.com/aragon/app/commit/76accf0b9fc3a0c9068466ddabc31c81f7770bf1) Thanks [@milosh86](https://github.com/milosh86)! - Update new process proposal labels and dialogs order

## 1.2.0

### Minor Changes

- [#493](https://github.com/aragon/app/pull/493) [`20dc0e9`](https://github.com/aragon/app/commit/20dc0e9668d5dcad39c7e600ee0862f896af8dd2) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Add beta support for Peaq network

- [#475](https://github.com/aragon/app/pull/475) [`1bdff2f`](https://github.com/aragon/app/commit/1bdff2f4e393d78f6b33e582fa27991de992fc62) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Batch multiple plugin preparation transactions into one using the global executor

- [#484](https://github.com/aragon/app/pull/484) [`7b5c204`](https://github.com/aragon/app/commit/7b5c204373e9554ecdbb9e43429e4b193e2ecf3b) Thanks [@shan8851](https://github.com/shan8851)! - Refactor publish proposal, remove publishProcess and manageAdminsDialog and use publish proposal instead

- [#480](https://github.com/aragon/app/pull/480) [`d3e1bde`](https://github.com/aragon/app/commit/d3e1bde2adc5c41f53f0ad69289b073f4dcc96b3) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update minor and patch NPM dependencies

- [#435](https://github.com/aragon/app/pull/435) [`2fa3666`](https://github.com/aragon/app/commit/2fa36660f967a6692a34978d8233516b40f4325e) Thanks [@thekidnamedkd](https://github.com/thekidnamedkd)! - Add indexing step to transaction dialog

### Patch Changes

- [#486](https://github.com/aragon/app/pull/486) [`71b4fe9`](https://github.com/aragon/app/commit/71b4fe998ecb6db93b07062112da6bfaa24c7c42) Thanks [@shan8851](https://github.com/shan8851)! - Update indexing step timing and disable proceed anyway button after succesful response

- [#482](https://github.com/aragon/app/pull/482) [`dc5c0a1`](https://github.com/aragon/app/commit/dc5c0a18001387ee9fb9c99fbb50b7ba2857b92e) Thanks [@shan8851](https://github.com/shan8851)! - Correctly implement enabled step property transaction status query when indexing

- [#483](https://github.com/aragon/app/pull/483) [`e203ecb`](https://github.com/aragon/app/commit/e203ecbc4cef01b0a73670bb9c2d6e3161bc0c34) Thanks [@thekidnamedkd](https://github.com/thekidnamedkd)! - Fix token and multisig normalise action functions

- [#488](https://github.com/aragon/app/pull/488) [`dd18098`](https://github.com/aragon/app/commit/dd180987a58d09f8a21b079af5e710dbd899910f) Thanks [@shan8851](https://github.com/shan8851)! - Fix issue where links are still clickable when disabled

## 1.1.0

### Minor Changes

- [#442](https://github.com/aragon/app/pull/442) [`d9c7078`](https://github.com/aragon/app/commit/d9c70780248fb7c418fe7afeb5a96860d1baba87) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Update configs to use Node v22

- [#462](https://github.com/aragon/app/pull/462) [`249f12a`](https://github.com/aragon/app/commit/249f12ac92b23c2c9283cac1ba7dda512d820653) Thanks [@milosh86](https://github.com/milosh86)! - Implement token compatibility checks for token importing

- [#427](https://github.com/aragon/app/pull/427) [`61ccad4`](https://github.com/aragon/app/commit/61ccad42899170d711ccbab1b4826ebdbd7f51bd) Thanks [@evanaronson](https://github.com/evanaronson)! - Implement a theme system that supports DAO UI customizations at specified slots

- [#443](https://github.com/aragon/app/pull/443) [`0671a49`](https://github.com/aragon/app/commit/0671a49d7f9b2caea263cc534880014d8c70ec05) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update minor and patch NPM dependencies

- [#445](https://github.com/aragon/app/pull/445) [`add889b`](https://github.com/aragon/app/commit/add889b96d820ae37a31dc34056262b8a1c1eee3) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update dependencies of Github actions

- [#474](https://github.com/aragon/app/pull/474) [`da80098`](https://github.com/aragon/app/commit/da800988f6d6346b02a9e59409766ccfea199509) Thanks [@shan8851](https://github.com/shan8851)! - Fix issue with focus and scrolling in wallet connect modal.

- [#451](https://github.com/aragon/app/pull/451) [`a3594f9`](https://github.com/aragon/app/commit/a3594f995dc11c7bd3e05e2a8ba43881a0e31849) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Refactor body-setup flow on governance designer

- [#460](https://github.com/aragon/app/pull/460) [`4803e9c`](https://github.com/aragon/app/commit/4803e9c1241db7169d6c6a5ec27b3f4c81d1d3e1) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update minor and patch NPM dependencies

- [#469](https://github.com/aragon/app/pull/469) [`e17903f`](https://github.com/aragon/app/commit/e17903faee2e7536aa427631144e7e6cc98e922f) Thanks [@evanaronson](https://github.com/evanaronson)! - Update strings across app to adhere to style guide

- [#459](https://github.com/aragon/app/pull/459) [`1d9c95a`](https://github.com/aragon/app/commit/1d9c95a0c6c9a82ea03a77071725431cd7a2b780) Thanks [@shan8851](https://github.com/shan8851)! - Support setup of simple-governance processes

### Patch Changes

- [`eb776f4`](https://github.com/aragon/app/commit/eb776f432bcd56a8c5ea57e990927774f2bfd94b) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Uses summary for shorter description on Proposal metadata

- [#464](https://github.com/aragon/app/pull/464) [`5af343e`](https://github.com/aragon/app/commit/5af343ed781c07998b57014adeabceacb55bbf3d) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Update gov-ui-kit library to fix calculation of support for token-voting plugin

- [#463](https://github.com/aragon/app/pull/463) [`31d6926`](https://github.com/aragon/app/commit/31d69263f54eea83542790a3b0c9881a4cfedf44) Thanks [@thekidnamedkd](https://github.com/thekidnamedkd)! - Implement XML sitemap and refactor metadata generation for SEO, specifically `Proposal` page

- [#444](https://github.com/aragon/app/pull/444) [`314c859`](https://github.com/aragon/app/commit/314c859e6b9e9586240098633ec8ad6db65d16ca) Thanks [@evanaronson](https://github.com/evanaronson)! - Update button strings for TransactionDialog when signing a transaction

- [#465](https://github.com/aragon/app/pull/465) [`0b0f51d`](https://github.com/aragon/app/commit/0b0f51df902c569fe763dcdac1e3ce29f3857189) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Fix validation of bodies of create process form

- [#446](https://github.com/aragon/app/pull/446) [`b99fde2`](https://github.com/aragon/app/commit/b99fde28df212552dfc7bf11ed2d35e54ee88405) Thanks [@thekidnamedkd](https://github.com/thekidnamedkd)! - Update heading spacing and layout on dashboard pages, fix title casing of strings, update number of items rendered on DAO pages

- [#440](https://github.com/aragon/app/pull/440) [`38d787e`](https://github.com/aragon/app/commit/38d787e84668c1a921097b405a506dc7d80f5213) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump next dependencies to 15.2.3

## 1.0.1

### Patch Changes

- [#439](https://github.com/aragon/app/pull/439) [`a88f690`](https://github.com/aragon/app/commit/a88f690dad88f373498f77b5bbc0f55c36713e61) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Open DAO links on a new page

- [#439](https://github.com/aragon/app/pull/439) [`a88f690`](https://github.com/aragon/app/commit/a88f690dad88f373498f77b5bbc0f55c36713e61) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Update gov-ui-kit library to fix bug when changing order of proposal actions

- [#439](https://github.com/aragon/app/pull/439) [`a88f690`](https://github.com/aragon/app/commit/a88f690dad88f373498f77b5bbc0f55c36713e61) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Reduce max image size of DAO avatar on create-dao form

## 1.0.0

### Major Changes

- [#406](https://github.com/aragon/app/pull/406) [`195eba1`](https://github.com/aragon/app/commit/195eba107564b52008db0bc7130310285c50b440) Thanks [@shan8851](https://github.com/shan8851)! - Update app branding and version display

### Minor Changes

- [#392](https://github.com/aragon/app/pull/392) [`8d80a64`](https://github.com/aragon/app/commit/8d80a641ef0a255f56755193ff217f0f5df4c34b) Thanks [@shan8851](https://github.com/shan8851)! - Implement manage admins flow and introduce new AddressesInput component

- [#379](https://github.com/aragon/app/pull/379) [`3caf174`](https://github.com/aragon/app/commit/3caf174330c4db739126f3bef0f57eee0aff3afb) Thanks [@evanaronson](https://github.com/evanaronson)! - Refactor of proposal status utility to fix an issue where active proposals were being marked as rejected

- [#416](https://github.com/aragon/app/pull/416) [`a87e931`](https://github.com/aragon/app/commit/a87e931031fba87a0e13d6cea5f98753c5157fc3) Thanks [@evanaronson](https://github.com/evanaronson)! - Add production Sepolia and Peaq OSx contract addresses and versions

- [#428](https://github.com/aragon/app/pull/428) [`b28abfa`](https://github.com/aragon/app/commit/b28abfa0637317b925d174d385092d9e8d26da2b) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Add contract addresses for Arbitrum mainnet

- [#422](https://github.com/aragon/app/pull/422) [`be5cba7`](https://github.com/aragon/app/commit/be5cba7a50f82086158920a24d29a1281ab8bb53) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Update workflows and configs to use production domains

- [#388](https://github.com/aragon/app/pull/388) [`e01ebb6`](https://github.com/aragon/app/commit/e01ebb6039bd70306f7f24fa53064c9e351fa1e2) Thanks [@milosh86](https://github.com/milosh86)! - Implement explore page new design with DAO search functionality

- [#395](https://github.com/aragon/app/pull/395) [`28e5cf0`](https://github.com/aragon/app/commit/28e5cf06a9f452f73616196204986867bb0d0f62) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Implement token wrap and unwrap feature

- [#433](https://github.com/aragon/app/pull/433) [`c09e6b3`](https://github.com/aragon/app/commit/c09e6b38168ac6a169d2ae29ef5053da1bcb4508) Thanks [@milosh86](https://github.com/milosh86)! - Disable unsupported networks and add "Soon" tag

- [#390](https://github.com/aragon/app/pull/390) [`f6c192d`](https://github.com/aragon/app/commit/f6c192de169a78e5ee8334dfba3569adb79c1abe) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Update integration of E2E tests

- [#426](https://github.com/aragon/app/pull/426) [`b38f03a`](https://github.com/aragon/app/commit/b38f03a5e17ac9904238056cdd417b29831fffab) Thanks [@evanaronson](https://github.com/evanaronson)! - Add ZKsync Sepolia OSx contract addresses

- [#410](https://github.com/aragon/app/pull/410) [`cfe2208`](https://github.com/aragon/app/commit/cfe2208f35e65542a7500ab24b6e049f37addac0) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @babel dependencies to fix Dependabot alerts

- [#430](https://github.com/aragon/app/pull/430) [`3e32c3d`](https://github.com/aragon/app/commit/3e32c3d69b2d7e01f031cbfa3a0d116ed68eaeea) Thanks [@thekidnamedkd](https://github.com/thekidnamedkd)! - Add contract addresses for remaining chains

- [#385](https://github.com/aragon/app/pull/385) [`c6c3f65`](https://github.com/aragon/app/commit/c6c3f6597b74eaea0af83002809e516ba2c69d39) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update minor and patch NPM dependencies

- [#411](https://github.com/aragon/app/pull/411) [`5e03398`](https://github.com/aragon/app/commit/5e033981ef0c42a093eda93743235f98a5bf8623) Thanks [@shan8851](https://github.com/shan8851)! - Implement EFP social graph info on member profiles

- [#399](https://github.com/aragon/app/pull/399) [`00089c6`](https://github.com/aragon/app/commit/00089c6f4a36ed63d2f5df0481d4c4838cbad7e2) Thanks [@milosh86](https://github.com/milosh86)! - Implement featured DAOs carousel on the Explore page

- [#387](https://github.com/aragon/app/pull/387) [`38952f8`](https://github.com/aragon/app/commit/38952f84bae3baf40959f78b94b7eca3410e187c) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update minor and patch Github action dependencies

- [#384](https://github.com/aragon/app/pull/384) [`b7b9856`](https://github.com/aragon/app/commit/b7b98563b53fda9838bb889e424ce72974963d1f) Thanks [@evanaronson](https://github.com/evanaronson)! - Update strings across whole app to match style guide

### Patch Changes

- [#393](https://github.com/aragon/app/pull/393) [`6fd1ea9`](https://github.com/aragon/app/commit/6fd1ea943fac474d67c85aa23ac0cbf111acd793) Thanks [@milosh86](https://github.com/milosh86)! - Fix crashes due to missing wallet connection guard

- [#420](https://github.com/aragon/app/pull/420) [`1ccce51`](https://github.com/aragon/app/commit/1ccce515b5c71aef4e3a4b9963939def10d8661d) Thanks [@milosh86](https://github.com/milosh86)! - Fix token delegation submit button disabled state transitions

- [#398](https://github.com/aragon/app/pull/398) [`cf4e8aa`](https://github.com/aragon/app/commit/cf4e8aaab35b213d5440e658b07596aace0c5ff2) Thanks [@milosh86](https://github.com/milosh86)! - Fix DAO filter double click crash and add showSearch flag to DaoList component

- [#396](https://github.com/aragon/app/pull/396) [`b0e1300`](https://github.com/aragon/app/commit/b0e13009d2bef03987d31a89f6d1af81fe9404ed) Thanks [@milosh86](https://github.com/milosh86)! - Fix onSuccess callback bug in useConnectedWalletGuard hook

- [#405](https://github.com/aragon/app/pull/405) [`c0fcfc5`](https://github.com/aragon/app/commit/c0fcfc57125144904729d47fbf37892638993026) Thanks [@thekidnamedkd](https://github.com/thekidnamedkd)! - Fix parameters for uninstalling the admin plugin

- [#407](https://github.com/aragon/app/pull/407) [`b6461bc`](https://github.com/aragon/app/commit/b6461bc4dbb4cb75f4035c2d5de1442123ea9fb2) Thanks [@thekidnamedkd](https://github.com/thekidnamedkd)! - Implement feature flag to disable token import with help text on production environment

- [#394](https://github.com/aragon/app/pull/394) [`67d996b`](https://github.com/aragon/app/commit/67d996b8e3cf409f272b559df47a0fe95fd28aa0) Thanks [@shan8851](https://github.com/shan8851)! - Add feedback link to explore page and legacy app and feedback links to dao pages.

- [#391](https://github.com/aragon/app/pull/391) [`80c140a`](https://github.com/aragon/app/commit/80c140a1e2a9f79c4aae34f0bd35b6302be9f4c6) Thanks [@thekidnamedkd](https://github.com/thekidnamedkd)! - Implement 'Remove all admins' flow with dialogs & guards

- [#434](https://github.com/aragon/app/pull/434) [`71d6c15`](https://github.com/aragon/app/commit/71d6c15e7a7adff783d51baf0ac65cc37d6b69c7) Thanks [@thekidnamedkd](https://github.com/thekidnamedkd)! - Implement NextTopLoader component to app layout

- [#402](https://github.com/aragon/app/pull/402) [`4e60a57`](https://github.com/aragon/app/commit/4e60a57e27b20da1a317bd311ef2a5c6f735e0ad) Thanks [@thekidnamedkd](https://github.com/thekidnamedkd)! - Implement external Octav link on FinanceDetailsList

- [#421](https://github.com/aragon/app/pull/421) [`e1c5192`](https://github.com/aragon/app/commit/e1c51924bf9260248220896d7c5b83c6626ea212) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Fix open/close state of Autocomplete input, always display "add contract address" item

- [#437](https://github.com/aragon/app/pull/437) [`ee9833b`](https://github.com/aragon/app/commit/ee9833b08cda475d68bb5296f93340310d5cb1b9) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Update order of networks on DAO creation

- [#412](https://github.com/aragon/app/pull/412) [`0e810ed`](https://github.com/aragon/app/commit/0e810ed199b269b6ebfe1177a6ab3cbd320e2e26) Thanks [@shan8851](https://github.com/shan8851)! - Add manage admins button to admin banner and update banner messaging

- [#400](https://github.com/aragon/app/pull/400) [`d830381`](https://github.com/aragon/app/commit/d830381707a6d908107b6f3234cff220209b27f6) Thanks [@thekidnamedkd](https://github.com/thekidnamedkd)! - Adjust additional localizations for launch overhaul

- [#401](https://github.com/aragon/app/pull/401) [`db5f123`](https://github.com/aragon/app/commit/db5f123284457f24353e7a607965022d8a5adaf3) Thanks [@shan8851](https://github.com/shan8851)! - Update Help link in footer to support and change url to the customer service form

- [#418](https://github.com/aragon/app/pull/418) [`62feea0`](https://github.com/aragon/app/commit/62feea0b08fac2635f9e32a2dc19c0ed1378d4da) Thanks [@shan8851](https://github.com/shan8851)! - Add terms and conditions agreement to wallet connect

- [#397](https://github.com/aragon/app/pull/397) [`296b536`](https://github.com/aragon/app/commit/296b536b1edfae9367de3a6789342f5e6c42c6fe) Thanks [@thekidnamedkd](https://github.com/thekidnamedkd)! - Allow unverified contracts to be added to action builder

## 0.3.0

### Minor Changes

- [#360](https://github.com/aragon/app/pull/360) [`e1f5dd9`](https://github.com/aragon/app/commit/e1f5dd9f1ba0aadb7b4762aa3efe128c487caefe) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Support Peaq network

- [#363](https://github.com/aragon/app/pull/363) [`3b46587`](https://github.com/aragon/app/commit/3b4658762d6ccd37a6ca44b8e1a8f41316e3ce47) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update minor and patch NPM dependencies

- [#382](https://github.com/aragon/app/pull/382) [`1261b5e`](https://github.com/aragon/app/commit/1261b5e95776f4e490299d0b29873cf37ec30cb1) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Disable postinstall scripts by default

- [#366](https://github.com/aragon/app/pull/366) [`f3f9f29`](https://github.com/aragon/app/commit/f3f9f293019edbdac20e95d90059c1f2ba3ffc80) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Implement token panel and delegation feature

- [#356](https://github.com/aragon/app/pull/356) [`1174610`](https://github.com/aragon/app/commit/11746101f8e67fbc9b61cff32f2b5139ee26ce38) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Rework wizard component to support dialog variant

- [#381](https://github.com/aragon/app/pull/381) [`acbc94a`](https://github.com/aragon/app/commit/acbc94a601af91e367877dfa3b0b7b69dccba994) Thanks [@evanaronson](https://github.com/evanaronson)! - Fix strings on governance designer flow

### Patch Changes

- [#368](https://github.com/aragon/app/pull/368) [`32d0165`](https://github.com/aragon/app/commit/32d01652b54103e508dcdb06666d864c594f2eb2) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Correctly update avatar field on DAO metadata form

- [#364](https://github.com/aragon/app/pull/364) [`ecce75a`](https://github.com/aragon/app/commit/ecce75ae8a052a70698d3033d580fe2fce871457) Thanks [@shan8851](https://github.com/shan8851)! - Implement admin card on settings page

- [#378](https://github.com/aragon/app/pull/378) [`765356a`](https://github.com/aragon/app/commit/765356a2ff278a24a83fc5a540dfceacb5ef0913) Thanks [@milosh86](https://github.com/milosh86)! - Force scroll to top when switching steps of a wizard

- [#376](https://github.com/aragon/app/pull/376) [`9df579c`](https://github.com/aragon/app/commit/9df579c929c78aecb8124c4ec1b2cc883fb77c42) Thanks [@shan8851](https://github.com/shan8851)! - Fix resource input item to accept urls with params and longer urls without crashing.

- [#369](https://github.com/aragon/app/pull/369) [`52a9818`](https://github.com/aragon/app/commit/52a9818870451c80e00e1d42f4cf8390289cae77) Thanks [@thekidnamedkd](https://github.com/thekidnamedkd)! - Fix bug preventing proposal creation on single plugins DAOs

- [#370](https://github.com/aragon/app/pull/370) [`4d0b3a0`](https://github.com/aragon/app/commit/4d0b3a004b26b0a95fb410ffc9340a8cad8e4c2f) Thanks [@shan8851](https://github.com/shan8851)! - Fix Aside card heading on the proposals page, allow `onChainId` to wrap rather than be truncated.

- [#361](https://github.com/aragon/app/pull/361) [`90c79e3`](https://github.com/aragon/app/commit/90c79e3a3047002576c5281152704195e94cd504) Thanks [@thekidnamedkd](https://github.com/thekidnamedkd)! - Refactor proposal creation requirements selection for plugin encapsulation

- [#362](https://github.com/aragon/app/pull/362) [`a6ed0c9`](https://github.com/aragon/app/commit/a6ed0c9dbd2a4f28325e6eb5c2e77e07ce787a07) Thanks [@shan8851](https://github.com/shan8851)! - Remove PageContext, introduce new Page component - PageAsideCard and move all aside content into cards and introduce tabs on the proposals and members page.

- [#357](https://github.com/aragon/app/pull/357) [`de5b9bc`](https://github.com/aragon/app/commit/de5b9bc555a971cccf2e58d2d753fc42fdd5385b) Thanks [@thekidnamedkd](https://github.com/thekidnamedkd)! - Align page layouts to latest specs for more content area

- [#380](https://github.com/aragon/app/pull/380) [`88d1e6a`](https://github.com/aragon/app/commit/88d1e6ae3da62aff89b662828a13bc7d878a5972) Thanks [@thekidnamedkd](https://github.com/thekidnamedkd)! - Improve expanded / collapsed states handling of actions on create proposal flow

- [#358](https://github.com/aragon/app/pull/358) [`7b1234a`](https://github.com/aragon/app/commit/7b1234a37456bdbfe8e2cd8b63d5ac82241d5558) Thanks [@thekidnamedkd](https://github.com/thekidnamedkd)! - Implement feature flag for production href in footer

## 0.2.0

### Minor Changes

- [#350](https://github.com/aragon/app/pull/350) [`9b57b74`](https://github.com/aragon/app/commit/9b57b74eac76ae53930a4ddbe95e0ec9722dd380) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump vercel to v41

- [#353](https://github.com/aragon/app/pull/353) [`706a549`](https://github.com/aragon/app/commit/706a549e105360a65dc8663649d47921682f0ee3) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update minor and patch NPM dependencies

- [#327](https://github.com/aragon/app/pull/327) [`47db370`](https://github.com/aragon/app/commit/47db37080ba1f9965bb3a63176edfc27acbc2c91) Thanks [@Barukimang](https://github.com/Barukimang)! - Implement workflow to trigger E2E tests

- [#352](https://github.com/aragon/app/pull/352) [`36dd6eb`](https://github.com/aragon/app/commit/36dd6eb111a47dcc528b1d912ad869016bcd1ee4) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @sentry/nextjs to v9

- [#344](https://github.com/aragon/app/pull/344) [`10fa242`](https://github.com/aragon/app/commit/10fa2424b7d6eb38df7fd2b5d807491c4ff524f1) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Integrate Sentry for application monitoring and error tracking

### Patch Changes

- [#336](https://github.com/aragon/app/pull/336) [`a0d7fdb`](https://github.com/aragon/app/commit/a0d7fdb1d3ec5746720c91a214ec59265dcd147d) Thanks [@thekidnamedkd](https://github.com/thekidnamedkd)! - Prevent early render of Execute button for SPP proposals

- [#342](https://github.com/aragon/app/pull/342) [`99f9d81`](https://github.com/aragon/app/commit/99f9d81c3ca48945a290eed98a8245ce4ecae036) Thanks [@thekidnamedkd](https://github.com/thekidnamedkd)! - Refactor prepare process utilities and add tests

- [#345](https://github.com/aragon/app/pull/345) [`2a4c711`](https://github.com/aragon/app/commit/2a4c7117f6e78507dde1cee2e4477c25c48c4a2d) Thanks [@shan8851](https://github.com/shan8851)! - Refactor publish process utilities and add tests

- [#344](https://github.com/aragon/app/pull/344) [`10fa242`](https://github.com/aragon/app/commit/10fa2424b7d6eb38df7fd2b5d807491c4ff524f1) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Fix DAO banner action when Governance Designer feature is disabled

- [#348](https://github.com/aragon/app/pull/348) [`bf65af6`](https://github.com/aragon/app/commit/bf65af6340875743e454b11981edb887830db10a) Thanks [@shan8851](https://github.com/shan8851)! - Refactor body process read component to use new create dao slot and plugin specific components

- [#355](https://github.com/aragon/app/pull/355) [`18a17f1`](https://github.com/aragon/app/commit/18a17f1e4049ee3de200470283aa0d8eea7aa765) Thanks [@shan8851](https://github.com/shan8851)! - Fix translation string value on TokenProcessBodyField component

- [#359](https://github.com/aragon/app/pull/359) [`731a92d`](https://github.com/aragon/app/commit/731a92d1c22d290cea6f168264f9085877a341da) Thanks [@evanaronson](https://github.com/evanaronson)! - Fix button label on publish proposal dialog

- [#347](https://github.com/aragon/app/pull/347) [`482c1b5`](https://github.com/aragon/app/commit/482c1b5c6eeffed9fa5a6908ea80ad6877e60b56) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Monitor transaction failed errors

## 0.1.0

### Minor Changes

- [`d4d4610`](https://github.com/aragon/app/commit/d4d46105ff9b708b60e9204f94ebfffb1e80bf4a) Thanks [@cgero-eth](https://github.com/cgero-eth)! - Initial release of app-next

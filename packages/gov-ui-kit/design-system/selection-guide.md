# GovKit selection guide

Which `@aragon/gov-ui-kit` export to choose for an intent, what to use instead, and the
contracts that matter when composing it. Generated from the component registry in
`packages/gov-ui-kit/design-system/component-registry/`; do not edit by hand. References:
`kit:` paths are in `packages/gov-ui-kit`, `app:` paths are App usages in `apps/app`.

## Components

### Accordion.Container

`import { Accordion } from '@aragon/gov-ui-kit';`

AccordionContainer: layout container for child items of the Accordion compound (Compound accordion).

**References**

- `kit:src/core/components/accordion/accordionContainer/accordionContainer.tsx:31`
- `kit:src/core/components/accordion/accordionContainer/accordionContainer.stories.tsx:1`
- `app:src/modules/createDao/components/createProcessForm/createProcessFormGovernance/fields/governanceBodyField/governanceBodyField.tsx:176`
- `app:src/modules/settings/components/daoHierarchy/daoHierarchy.tsx:161`
- `app:src/modules/settings/components/permissionsList/permissionsList.tsx:78`

### Accordion.Item

`import { Accordion } from '@aragon/gov-ui-kit';`

AccordionItem: individual item element of the Accordion compound (Compound accordion).

**References**

- `kit:src/core/components/accordion/accordionItem/accordionItem.tsx:16`
- `app:src/modules/createDao/components/createProcessForm/createProcessFormGovernance/fields/governanceBodyField/governanceBodyField.tsx:175`
- `app:src/modules/settings/components/daoHierarchy/daoHierarchy.tsx:162`
- `app:src/modules/settings/components/permissionsList/permissionsListRow.tsx:116`

### Accordion.ItemContent

`import { Accordion } from '@aragon/gov-ui-kit';`

AccordionItemContent: expandable item content region of the Accordion compound (Compound accordion).

**References**

- `kit:src/core/components/accordion/accordionItemContent/accordionItemContent.tsx:12`
- `app:src/modules/createDao/components/createProcessForm/createProcessFormGovernance/fields/governanceBodyField/governanceBodyField.tsx:119`
- `app:src/modules/settings/components/daoHierarchy/daoHierarchy.tsx:178`
- `app:src/modules/settings/components/permissionsList/permissionsListRow.tsx:135`

### Accordion.ItemHeader

`import { Accordion } from '@aragon/gov-ui-kit';`

AccordionItemHeader: clickable item header/trigger of the Accordion compound (Compound accordion).

**References**

- `kit:src/core/components/accordion/accordionItemHeader/accordionItemHeader.tsx:13`
- `app:src/modules/createDao/components/createProcessForm/createProcessFormGovernance/fields/governanceBodyField/governanceBodyField.tsx:118`
- `app:src/modules/settings/components/daoHierarchy/daoHierarchy.tsx:163`
- `app:src/modules/settings/components/permissionsList/permissionsListRow.tsx:117`

### ActionSimulation

`import { ActionSimulation } from '@aragon/gov-ui-kit';`

Renders a proposal-action simulation summary (status, total actions, last-simulation timestamp) as a DataList.Item with a simulate trigger.

**Use when**

- Showing simulation results for proposal actions
- Prompting/refreshing a simulation before execution

**Constraints**

- Displays caller-supplied results and invokes onSimulate; it does not execute the simulation itself.

**References**

- `kit:src/modules/components/action/actionSimulation/actionSimulation.tsx:16`
- `kit:src/modules/components/action/actionSimulation/actionSimulation.stories.tsx:1`
- `app:src/modules/governance/dialogs/simulateActionsDialog/simulateActionsDialog.tsx:133`
- `app:src/modules/governance/pages/daoProposalDetailsPage/daoProposalDetailsPageClient.tsx:331`

### AddressInput

`import { AddressInput } from '@aragon/gov-ui-kit';`

Text input that resolves wallet or contract addresses and ENS names.

**Usage notes**

- The ENS/address toggle and paste controls call `onChange` with the replacement string, while clear calls it with `undefined`; these updates are the controlled `value` channel, not `onAccept`.
- When an unfocused valid address resolves to an ENS name, the component switches to ENS mode and invokes `onChange` with that ENS name.
- `onAccept` is withheld while either ENS lookup is fetching and runs only after those lookups settle, rather than emitting a transient `undefined` during resolution.
- With `enforceChecksum` (the default), a typed all-lowercase or all-uppercase address comes back through `onChange` in checksum form. Only a mixed-case address with a wrong checksum shows the checksum alert, and `onAccept` then receives `undefined`.
- ENS names always resolve on mainnet, and only when the `GukModulesProvider` wagmi config includes mainnet with an ENS universal resolver; otherwise ENS input is unsupported. `chainId` only picks the block-explorer link.

**Use when**

- Capturing a wallet/contract address or ENS name in a form
- Flows needing checksummed address + normalized ENS output

**Instead**

- `AddressOutput`: Use AddressOutput for read-only address display.
- `InputText`: Use InputText for plain text without address/ENS resolution.

**Key props**

- `value`: Controlled current input text for an address or ENS name; defaults to an empty string.
- `onChange`: Receives edited input text; with enforceChecksum enabled, valid or all-uppercase addresses are normalized to checksum form, and surrounding whitespace is trimmed on blur. Clearing emits undefined.
- `onAccept`: After debounce and ENS/address resolution, receives { address, name } with a checksum address and normalized ENS name, or undefined when input is invalid or fails checksum enforcement.
- `chainId`: Selects the block-explorer network; ENS resolution remains on mainnet.
- `enforceChecksum`: Defaults true; rejects mixed-case addresses that fail strict EIP-55 validation while accepted output remains checksum formatted.
- `hideControls`: Hides ENS/address toggle, block-explorer link, copy, clear and paste controls.

**Constraints**

- Uses wagmi hooks and useQueryClient, so it must render under Wagmi and React-Query providers (GukModulesProvider supplies these)
- onChange represents edited input state and may normalize a valid address to checksum form or trim surrounding whitespace on blur; it is separate from accepted output
- onAccept is debounced by 300ms and emits a resolved checksum address plus normalized ENS name, or undefined for invalid input/checksum errors
- chainId selects the explorer network while ENS resolution always uses mainnet

**Composition**

- Wraps InputContainer and renders MemberAvatar plus optional ENS/address toggle, explorer, copy, clear and paste controls.
- App AddressesInputItem keeps local raw text state and writes accepted {address,name} into form state for duplicate/custom validation.

**References**

- `kit:src/modules/components/addressInput/addressInput.tsx:82`
- `kit:src/modules/components/addressInput/addressInput.stories.tsx:1`
- `app:src/modules/finance/components/transferAssetForm/transferAssetForm.tsx:83`
- `app:src/shared/components/forms/addressesInput/addressesInputItem/addressesInputItem.tsx:60`
- `app:src/actions/core/permissionManager/components/permissionAddressInput.tsx:92`

### AddressOutput

`import { AddressOutput } from '@aragon/gov-ui-kit';`

Displays an address or hash with an optional caller-supplied label or link, copy control and reveal tooltip. Valid addresses are checksummed for copy/reveal; other values are preserved.

**Use when**

- Rendering a wallet/contract address read-only
- Showing an address inside cards, rows or the Wallet component

**Key props**

- `address`: Display address value; pair with AddressInput when the value is read-only.
- `chainId`: Builds the explorer link for the displayed address.

**Constraints**

- showCompleteAddress is ignored when label is set
- A truthy href makes the component link-like (a tap navigates and the copy control turns primary); the URL is whatever the caller supplies
- Under an interactive ancestor (hasInteractiveAncestor set or inherited via InteractiveAncestorContext) copy defaults off and the reveal trigger becomes passive; callers can still force copy on

**References**

- `kit:src/core/components/addressOutput/addressOutput.tsx:61`
- `kit:src/core/components/addressOutput/addressOutput.stories.tsx:1`
- `app:src/modules/application/components/navigations/navigationDao/navigationDaoHome.tsx:35`
- `app:src/actions/gaugeRegistrar/components/gaugeRegistrarGaugeListItem/gaugeRegistrarGaugeListItem.tsx:58`
- `app:src/actions/gaugeVoter/components/gaugeVoterGaugeListItem/gaugeVoterGaugeListItem.tsx:58`

### AlertCard

`import { AlertCard } from '@aragon/gov-ui-kit';`

Card-style alert with message and variant (info/success/warning/critical).

**Use when**

- Standalone, high-emphasis message needing a container

**References**

- `kit:src/core/components/alerts/alertCard/alertCard.tsx:43`
- `kit:src/core/components/alerts/alertCard/alertCard.stories.tsx:1`
- `app:src/actions/gaugeRegistrar/components/gaugeRegistrarActiveVotingAlert/gaugeRegistrarActiveVotingAlert.tsx:17`
- `app:src/modules/application/dialogs/aragonProfileDialog/aragonProfileDialog.tsx:352`
- `app:src/modules/application/dialogs/aragonProfileRenameDialog/aragonProfileRenameDialog.tsx:152`

### AlertInline

`import { AlertInline } from '@aragon/gov-ui-kit';`

Compact inline alert with message and variant.

**Use when**

- Inline/field-level status or validation messages

**References**

- `kit:src/core/components/alerts/alertInline/alertInline.tsx:33`
- `kit:src/core/components/alerts/alertInline/alertInline.stories.tsx:1`
- `app:src/actions/capitalDistributor/components/capitalDistributorEndCampaignActionCreate/capitalDistributorEndCampaignActionCreate.tsx:152`
- `app:src/actions/capitalDistributor/components/capitalDistributorPauseCampaignActionCreate/capitalDistributorPauseCampaignActionCreate.tsx:152`
- `app:src/actions/capitalDistributor/components/capitalDistributorResumeCampaignActionCreate/capitalDistributorResumeCampaignActionCreate.tsx:152`

### AssetDataListItem.Skeleton

`import { AssetDataListItem } from '@aragon/gov-ui-kit';`

AssetDataListItemSkeleton: loading placeholder for one item of the AssetDataListItem compound (DataList item structure for an asset/token holding).

**References**

- `kit:src/modules/components/asset/assetDataListItem/assetDataListItemSkeleton/assetDataListItemSkeleton.tsx:9`
- `kit:src/modules/components/asset/assetDataListItem/assetDataListItemSkeleton/assetDataListItemSkeleton.stories.tsx:1`
- `app:src/modules/finance/components/assetAddressSelect/assetAddressSelect.tsx:159`
- `app:src/modules/finance/components/assetAddressSelect/assetAddressSelectAddAddressView.tsx:117`
- `app:src/modules/finance/components/assetList/assetListDefault.tsx:97`

### AssetDataListItem.Structure

`import { AssetDataListItem } from '@aragon/gov-ui-kit';`

AssetDataListItemStructure: presentational item structure driven by props of the AssetDataListItem compound (DataList item structure for an asset/token holding).

**References**

- `kit:src/modules/components/asset/assetDataListItem/assetDataListItemStructure/assetDataListItemStructure.tsx:33`
- `kit:src/modules/components/asset/assetDataListItem/assetDataListItemStructure/assetDataListItemStructure.stories.tsx:1`
- `app:src/modules/finance/components/assetAddressSelect/assetAddressSelectItem.tsx:39`
- `app:src/modules/finance/components/assetList/assetListItem.tsx:37`
- `app:src/plugins/gaugeVoterPlugin/dialogs/gaugeVoterLockUnlockDialog/gaugeVoterLockUnlockDialog.tsx:197`

### AssetTransfer

`import { AssetTransfer } from '@aragon/gov-ui-kit';`

Displays an asset transfer (sender, recipient, amount, symbol, fiat value).

**Usage notes**

- For a non-native transfer, the asset row uses the token's block-explorer URL and opens it in a new tab; `assetAddress` set to the zero address marks a native transfer and leaves the row unlinked.
- The fiat value line is visually blank when the optional `assetFiatPrice` is absent; when supplied, it is calculated as `assetAmount × assetFiatPrice`.
- `assetAmount` uses signed formatting, so positive transfers receive a leading `+` (negative values retain their `-` sign).

**Use when**

- Rendering a token transfer summary

**References**

- `kit:src/modules/components/asset/assetTransfer/assetTransfer.tsx:54`
- `kit:src/modules/components/asset/assetTransfer/assetTransfer.stories.tsx:1`
- `app:src/actions/core/withdrawToken/withdrawTokenActionDetails.tsx:30`

### Avatar

`import { Avatar } from '@aragon/gov-ui-kit';`

Generic image avatar with size variants and a fallback.

**Use when**

- Displaying a user/entity image where no domain avatar applies

**References**

- `kit:src/core/components/avatars/avatar/avatar.tsx:78`
- `kit:src/core/components/avatars/avatar/avatar.stories.tsx:1`
- `app:src/actions/capitalDistributor/components/capitalDistributorCreateCampaignActionDetails/capitalDistributorCreateCampaignActionDetails.tsx:166`
- `app:src/actions/crossChainController/components/crossChainControllerForwardMessageDetails/crossChainControllerForwardMessageDetails.tsx:121`
- `app:src/actions/gaugeRegistrar/components/gaugeRegistrarGaugeListItem/gaugeRegistrarGaugeListItem.tsx:50`

### AvatarBase

`import { AvatarBase } from '@aragon/gov-ui-kit';`

Low-level ref-forwarding avatar image primitive used to build higher-level avatars.

**Use when**

- Building a custom avatar variant

**References**

- `kit:src/core/components/avatars/avatarBase/avatarBase.tsx:6`
- `kit:src/core/components/avatars/avatarBase/avatarBase.stories.tsx:1`

### AvatarIcon

`import { AvatarIcon } from '@aragon/gov-ui-kit';`

Avatar-shaped frame rendering an Icon with variant styling.

**Use when**

- Representing an entity/state as an icon in avatar form

**References**

- `kit:src/core/components/avatars/avatarIcon/avatarIcon.tsx:83`
- `kit:src/core/components/avatars/avatarIcon/avatarIcon.stories.tsx:1`
- `app:src/modules/application/dialogs/connectWalletDialog/connectWalletDialog.tsx:118`
- `app:src/modules/capitalFlow/components/dispatchPanel/dispatchPanel.tsx:67`
- `app:src/modules/capitalFlow/dialogs/routerSelectorDialog/routerSelectorDialog.tsx:148`

### Breadcrumbs

`import { Breadcrumbs } from '@aragon/gov-ui-kit';`

Breadcrumb navigation trail built from a list of links.

**Use when**

- Showing hierarchical page location/navigation

**References**

- `kit:src/core/components/breadcrumbs/breadcrumbs.tsx:30`
- `kit:src/core/components/breadcrumbs/breadcrumbs.stories.tsx:1`
- `app:src/shared/components/page/pageHeader/pageHeader.tsx:67`

### Button

`import { Button } from '@aragon/gov-ui-kit';`

Polymorphic button that renders as a native <button> or, when given href, as an <a>, with variant/size/icon/loading states.

**Usage notes**

- `isLoading` keeps the text label rendered and only replaces `iconLeft`/`iconRight` with a spinner — the label does not disappear.
- In the link form (`href` set), `disabled` is not forwarded as a native attribute: it sets `aria-disabled` and calls `preventDefault()` on click, so navigation is blocked while still rendering an `<a>` (the same guard applies while `isLoading`).

**Use when**

- Primary interactive action trigger
- Icon-only actions (omit children)
- A link styled as a button (pass href)

**Instead**

- `Link`: Use Link for text-styled navigation; Button is an emphasized action affordance.

**Key props**

- `href`: Renders LinkBase/<a> when present; otherwise renders a native <button> with type defaulting to button.
- `variant`: Visual intent: primary, secondary, tertiary, ghost, success, warning or critical; defaults to primary.
- `size/responsiveSize`: Size is lg/md/sm (default lg); responsiveSize maps breakpoint-specific sizes.
- `iconLeft/iconRight`: Left/right IconType adornments; iconRight is hidden for icon-only buttons.
- `isLoading/disabled`: Either state disables interaction; loading swaps icons/content emphasis for a spinner.

**Constraints**

- href renders the anchor form; the button-typed branch forbids link-only attrs (target/rel/download/hrefLang/media/ping/referrerPolicy)
- with no children it renders as an only-icon button using iconLeft

**References**

- `kit:src/core/components/button/button.tsx:188`
- `kit:src/core/components/button/button.stories.tsx:1`
- `app:src/actions/capitalDistributor/components/capitalDistributorCampaignListItem/capitalDistributorCampaignListItem.tsx:52`
- `app:src/actions/capitalDistributor/components/capitalDistributorCreateCampaignActionCreate/capitalDistributorCreateCampaignActionCreateForm.tsx:306`
- `app:src/actions/core/permissionManager/components/permissionChangesCreate.tsx:238`

### Card

`import { Card } from '@aragon/gov-ui-kit';`

Basic surface container (border/padding) for grouping content.

**Usage notes**

- `Card` styles only its surface (rounding, neutral background, shadow): it adds no padding and no border. Add spacing through `className` or the content inside.

**Use when**

- Grouping related content on a surface

**References**

- `kit:src/core/components/cards/card/card.tsx:12`
- `kit:src/core/components/cards/card/card.stories.tsx:1`
- `app:src/actions/capitalDistributor/components/capitalDistributorCreateCampaignActionCreate/capitalDistributorCreateCampaignActionCreateForm.tsx:272`
- `app:src/daos/alchemix/components/alchemixSubmitVote/alchemixSubmitVote.tsx:331`
- `app:src/daos/alchemix/components/alchemixSubmitVote/components/alchemixObjectionVote.tsx:173`

### CardCollapsible

`import { CardCollapsible } from '@aragon/gov-ui-kit';`

Card whose body collapses/expands, with an optional exact collapsed pixel height.

**Use when**

- Long card content that should be collapsible

**References**

- `kit:src/core/components/cards/cardCollapsible/cardCollapsible.tsx:19`
- `kit:src/core/components/cards/cardCollapsible/cardCollapsible.stories.tsx:1`
- `app:src/modules/governance/pages/daoProposalDetailsPage/daoProposalDetailsPageClient.tsx:294`

### CardEmptyState

`import { CardEmptyState } from '@aragon/gov-ui-kit';`

Card wrapper around EmptyState for empty/zero-data surfaces (props mirror EmptyState).

**Usage notes**

- `CardEmptyState` forwards EmptyState props, so `primaryButton` is available in both stacked and horizontal layouts; `isStacked` changes layout and button sizing only.
- `className` applies to the outer full-width Card wrapper; the inner EmptyState supplies its own padding, while the Card surface itself does not add padding.

**Use when**

- Empty list/section presented on a card surface

**References**

- `kit:src/core/components/cards/cardEmptyState/cardEmptyState.tsx:13`
- `kit:src/core/components/cards/cardEmptyState/cardEmptyState.stories.tsx:1`
- `app:src/actions/capitalDistributor/components/capitalDistributorEndCampaignActionCreate/capitalDistributorEndCampaignActionCreate.tsx:133`
- `app:src/actions/capitalDistributor/components/capitalDistributorPauseCampaignActionCreate/capitalDistributorPauseCampaignActionCreate.tsx:133`
- `app:src/actions/capitalDistributor/components/capitalDistributorResumeCampaignActionCreate/capitalDistributorResumeCampaignActionCreate.tsx:133`

### CardSummary

`import { CardSummary } from '@aragon/gov-ui-kit';`

Card presenting a labelled value/description with an optional action and icon.

**Use when**

- Dashboard/summary stat tiles

**References**

- `kit:src/core/components/cards/cardSummary/cardSummary.tsx:8`
- `kit:src/core/components/cards/cardSummary/cardSummary.stories.tsx:1`

### Checkbox

`import { Checkbox } from '@aragon/gov-ui-kit';`

Single checkbox control with label, position and checked/onCheckedChange state.

**Usage notes**

- `checked` and `onCheckedChange` are tri-state: use a boolean or `'indeterminate'`, not only `true`/`false`; the indeterminate state renders the mixed-state icon.
- Use `CheckboxGroup` only for shared label/help/alert chrome; each `Checkbox` keeps its own `checked` and `onCheckedChange` state.

**Use when**

- Boolean opt-in within a form

**References**

- `kit:src/core/components/forms/checkbox/checkbox.tsx:45`
- `kit:src/core/components/forms/checkbox/checkbox.stories.tsx:1`
- `app:src/plugins/capitalDistributorPlugin/dialogs/capitalDistributorClaimDialog/capitalDistributorClaimDialogDetails/capitalDistributorClaimDialogDetails.tsx:154`

### CheckboxCard

`import { CheckboxCard } from '@aragon/gov-ui-kit';`

Card-styled selectable checkbox with avatar/label/description/tag.

**Usage notes**

- `CheckboxCard` is independently controlled with tri-state `checked`/`onCheckedChange`; it uses a checkbox root directly and does not require a group.
- `children` render only when the card is checked, not when it is `'indeterminate'`.

**Use when**

- Selectable option cards (multi-select)

**References**

- `kit:src/core/components/forms/checkboxCard/checkboxCard.tsx:56`
- `kit:src/core/components/forms/checkboxCard/checkboxCard.stories.tsx:1`
- `app:src/modules/createDao/components/createProcessForm/createProcessFormProposalCreation/proposalCreationSettingsDefault.tsx:47`
- `app:src/plugins/multisigPlugin/components/multisigProposalCreationSettings/multisigProposalCreationSettings.tsx:60`
- `app:src/plugins/tokenPlugin/components/tokenProposalCreationSettings/tokenProposalCreationSettings.tsx:102`

### CheckboxGroup

`import { CheckboxGroup } from '@aragon/gov-ui-kit';`

Presentational wrapper adding shared label/helpText/alert chrome around independent Checkbox children; it holds no selection state (each Checkbox owns its own checked/onCheckedChange).

**Use when**

- Multi-select groups of options

**References**

- `kit:src/core/components/forms/checkboxGroup/checkboxGroup.tsx:18`
- `kit:src/core/components/forms/checkboxGroup/checkboxGroup.stories.tsx:1`

### Clipboard

`import { Clipboard } from '@aragon/gov-ui-kit';`

Copy-to-clipboard affordance wrapping content, copying copyValue.

**Use when**

- Adding copy behavior to text/values

**References**

- `kit:src/core/components/clipboard/clipboard.tsx:36`
- `kit:src/core/components/clipboard/clipboard.stories.tsx:1`

### Collapsible

`import { Collapsible } from '@aragon/gov-ui-kit';`

Wraps arbitrary content and visually collapses it with a gradient overlay and toggle; controlled or uncontrolled.

**Usage notes**

- The expand/collapse trigger is rendered only when measured content is taller than the collapsed height (`collapsedPixels` or the calculated `collapsedLines` height); content that fits has no trigger.
- With `showOverlay`, the gradient is shown only while overflowing content is closed, and the overlay-mode trigger is a tertiary `Button`; without it, the trigger is a native button.

**Use when**

- Truncating long text/description blocks with show-more/less

**Constraints**

- collapsedPixels overrides collapsedLines
- controlled via isOpen or uncontrolled via defaultOpen

**References**

- `kit:src/core/components/collapsible/collapsible.tsx:40`
- `kit:src/core/components/collapsible/collapsible.stories.tsx:1`
- `app:src/actions/core/createProposal/createProposalActionDetails.tsx:102`
- `app:src/modules/finance/components/daoInfoAside/daoInfoAside.tsx:48`
- `app:src/modules/governance/components/delegationStatementCard/delegationStatementCard.tsx:101`

### DaoAvatar

`import { DaoAvatar } from '@aragon/gov-ui-kit';`

Avatar specialized for a DAO (name + image with fallback).

**Usage notes**

- Without a usable `src`, the avatar shows a primary-colored initials fallback instead of an empty image.
- The fallback initials are uppercase: a short name is kept whole, a longer single word uses its first two characters, and a multi-word name uses the first character of its first two words.

**Use when**

- Displaying a DAO identity image

**References**

- `kit:src/modules/components/dao/daoAvatar/daoAvatar.tsx:81`
- `kit:src/modules/components/dao/daoAvatar/daoAvatar.stories.tsx:1`
- `app:src/modules/application/components/navigations/navigationDao/navigationDao.tsx:149`
- `app:src/modules/application/components/navigations/navigationDao/navigationDaoHome.tsx:36`
- `app:src/modules/application/components/navigations/navigationWizard/navigationWizard.tsx:138`

### DaoDataListItem.Skeleton

`import { DaoDataListItem } from '@aragon/gov-ui-kit';`

DaoDataListItemSkeleton: loading placeholder for one item of the DaoDataListItem compound (DataList item structure for a DAO).

**References**

- `kit:src/modules/components/dao/daoDataListItem/daoDataListItemSkeleton/daoDataListItemSkeleton.tsx:7`
- `kit:src/modules/components/dao/daoDataListItem/daoDataListItemSkeleton/daoDataListItemSkeleton.stories.tsx:1`
- `app:src/modules/explore/components/daoList/daoList.tsx:131`

### DaoDataListItem.Structure

`import { DaoDataListItem } from '@aragon/gov-ui-kit';`

DaoDataListItemStructure: presentational item structure driven by props of the DaoDataListItem compound (DataList item structure for a DAO).

**References**

- `kit:src/modules/components/dao/daoDataListItem/daoDataListItemStructure/daoDataListItemStructure.tsx:45`
- `kit:src/modules/components/dao/daoDataListItem/daoDataListItemStructure/daoDataListItemStructure.stories.tsx:1`
- `app:src/modules/createDao/dialogs/publishDaoDialog/publishDaoDialog.tsx:190`
- `app:src/modules/explore/components/daoCarouselCard/daoCarouselCard.tsx:25`
- `app:src/modules/explore/components/daoList/daoList.tsx:134`

### DataList.ActionItem

`import { DataList } from '@aragon/gov-ui-kit';`

DataListActionItem: clickable action row of the DataList compound (Compound list UI).

**References**

- `kit:src/core/components/dataList/dataListActionItem/dataListActionItem.tsx:38`
- `kit:src/core/components/dataList/dataListActionItem/dataListActionItem.stories.tsx:1`
- `app:src/modules/finance/components/assetAddressSelect/assetAddressSelectAddButton.tsx:14`
- `app:src/modules/finance/components/assetAddressSelect/assetAddressSelectBackButton.tsx:14`

### DataList.Container

`import { DataList } from '@aragon/gov-ui-kit';`

DataListContainer: layout container for child items of the DataList compound (Compound list UI).

**References**

- `kit:src/core/components/dataList/dataListContainer/dataListContainer.tsx:38`
- `kit:src/core/components/dataList/dataListContainer/dataListContainer.stories.tsx:1`
- `app:src/modules/explore/components/daoList/daoList.tsx:125`
- `app:src/modules/finance/components/assetAddressSelect/assetAddressSelect.tsx:156`
- `app:src/modules/finance/components/assetList/assetListDefault.tsx:106`

### DataList.Filter

`import { DataList } from '@aragon/gov-ui-kit';`

DataListFilter: filter/search bar of the DataList compound (Compound list UI).

**References**

- `kit:src/core/components/dataList/dataListFilter/dataListFilter.tsx:62`
- `kit:src/core/components/dataList/dataListFilter/dataListFilter.stories.tsx:1`
- `app:src/modules/explore/components/daoList/daoList.tsx:119`
- `app:src/modules/finance/components/assetAddressSelect/assetAddressSelect.tsx:145`
- `app:src/modules/finance/components/assetAddressSelect/assetAddressSelectAddAddressView.tsx:109`

### DataList.Item

`import { DataList } from '@aragon/gov-ui-kit';`

DataListItem: individual item element of the DataList compound (Compound list UI).

**References**

- `kit:src/core/components/dataList/dataListItem/dataListItem.tsx:22`
- `kit:src/core/components/dataList/dataListItem/dataListItem.stories.tsx:1`
- `app:src/actions/capitalDistributor/components/capitalDistributorCampaignListItem/capitalDistributorCampaignListItem.tsx:31`
- `app:src/actions/capitalDistributor/components/capitalDistributorCampaignListItem/capitalDistributorCampaignListItemSkeleton.tsx:17`
- `app:src/actions/gaugeRegistrar/components/gaugeRegistrarGaugeListItem/gaugeRegistrarGaugeListItem.tsx:41`

### DataList.Pagination

`import { DataList } from '@aragon/gov-ui-kit';`

DataListPagination: load-more / pagination control of the DataList compound (Compound list UI).

**References**

- `kit:src/core/components/dataList/dataListPagination/dataListPagination.tsx:11`
- `kit:src/core/components/dataList/dataListPagination/dataListPagination.stories.tsx:1`
- `app:src/modules/explore/components/daoList/daoList.tsx:146`
- `app:src/modules/finance/components/assetAddressSelect/assetAddressSelect.tsx:169`
- `app:src/modules/finance/components/assetList/assetListDefault.tsx:107`

### DataList.Root

`import { DataList } from '@aragon/gov-ui-kit';`

DataListRoot: compound root owning shared state/config of the DataList compound (Compound list UI).

**References**

- `kit:src/core/components/dataList/dataListRoot/dataListRoot.tsx:41`
- `kit:src/core/components/dataList/dataListRoot/dataListRoot.stories.tsx:1`
- `app:src/actions/capitalDistributor/dialogs/capitalDistributorSelectCampaignDialog/capitalDistributorSelectCampaignDialog.tsx:107`
- `app:src/actions/gaugeRegistrar/dialogs/gaugeRegistrarSelectGaugeDialog/gaugeRegistrarSelectGaugeDialog.tsx:101`
- `app:src/actions/gaugeVoter/dialogs/gaugeVoterSelectGaugeDialog/gaugeVoterSelectGaugeDialog.tsx:100`

### DefinitionList.Container

`import { DefinitionList } from '@aragon/gov-ui-kit';`

DefinitionListContainer: layout container for child items of the DefinitionList compound (Compound term/description list).

**References**

- `kit:src/core/components/definitionList/definitionListContainer/definitionListContainer.tsx:6`
- `kit:src/core/components/definitionList/definitionListContainer/definitionListContainer.stories.tsx:1`
- `app:src/actions/capitalDistributor/components/capitalDistributorCreateCampaignActionCreate/capitalDistributorCreateCampaignActionCreateForm.tsx:273`
- `app:src/actions/capitalDistributor/components/capitalDistributorCreateCampaignActionDetails/capitalDistributorCreateCampaignActionDetails.tsx:122`
- `app:src/actions/core/createProposal/createProposalActionDetails.tsx:140`

### DefinitionList.Item

`import { DefinitionList } from '@aragon/gov-ui-kit';`

DefinitionListItem: individual item element of the DefinitionList compound (Compound term/description list).

**References**

- `kit:src/core/components/definitionList/definitionListItem/definitionListItem.tsx:25`
- `kit:src/core/components/definitionList/definitionListItem/definitionListItem.stories.tsx:1`
- `app:src/actions/capitalDistributor/components/capitalDistributorCreateCampaignActionCreate/capitalDistributorCreateCampaignActionCreateForm.tsx:274`
- `app:src/actions/capitalDistributor/components/capitalDistributorCreateCampaignActionDetails/capitalDistributorCreateCampaignActionDetails.tsx:124`
- `app:src/actions/core/createProposal/createProposalActionDetails.tsx:103`

### DialogAlert.Content

`import { DialogAlert } from '@aragon/gov-ui-kit';`

DialogAlertContent: scrollable content region of the DialogAlert compound (Compound alert/confirmation modal).

**References**

- `kit:src/core/components/dialogs/dialogAlert/dialogAlertContent/dialogAlertContent.tsx:13`
- `kit:src/core/components/dialogs/dialogAlert/dialogAlertContent/dialogAlertContent.stories.tsx:1`
- `app:src/modules/application/dialogs/aragonProfileReleaseAlertDialog/aragonProfileReleaseAlertDialog.tsx:45`
- `app:src/modules/application/dialogs/retryTransactionAlertDialog/retryTransactionAlertDialog.tsx:30`
- `app:src/modules/governance/dialogs/duplicateProposalAlertDialog/duplicateProposalAlertDialog.tsx:42`

### DialogAlert.Footer

`import { DialogAlert } from '@aragon/gov-ui-kit';`

DialogAlertFooter: footer/actions region of the DialogAlert compound (Compound alert/confirmation modal).

**References**

- `kit:src/core/components/dialogs/dialogAlert/dialogAlertFooter/dialogAlertFooter.tsx:25`
- `kit:src/core/components/dialogs/dialogAlert/dialogAlertFooter/dialogAlertFooter.stories.tsx:1`
- `app:src/modules/application/dialogs/aragonProfileReleaseAlertDialog/aragonProfileReleaseAlertDialog.tsx:53`
- `app:src/modules/application/dialogs/retryTransactionAlertDialog/retryTransactionAlertDialog.tsx:36`
- `app:src/modules/governance/dialogs/duplicateProposalAlertDialog/duplicateProposalAlertDialog.tsx:48`

### DialogAlert.Header

`import { DialogAlert } from '@aragon/gov-ui-kit';`

DialogAlertHeader: header region of the DialogAlert compound (Compound alert/confirmation modal).

**References**

- `kit:src/core/components/dialogs/dialogAlert/dialogAlertHeader/dialogAlertHeader.tsx:30`
- `kit:src/core/components/dialogs/dialogAlert/dialogAlertHeader/dialogAlertHeader.stories.tsx:1`
- `app:src/modules/application/dialogs/aragonProfileReleaseAlertDialog/aragonProfileReleaseAlertDialog.tsx:40`
- `app:src/modules/application/dialogs/retryTransactionAlertDialog/retryTransactionAlertDialog.tsx:29`
- `app:src/modules/governance/dialogs/duplicateProposalAlertDialog/duplicateProposalAlertDialog.tsx:41`

### DialogAlert.Root

`import { DialogAlert } from '@aragon/gov-ui-kit';`

DialogAlertRoot: compound root owning shared state/config of the DialogAlert compound (Compound alert/confirmation modal).

**References**

- `kit:src/core/components/dialogs/dialogAlert/dialogAlertRoot/dialogAlertRoot.tsx:18`
- `kit:src/core/components/dialogs/dialogAlert/dialogAlertRoot/dialogAlertRoot.stories.tsx:1`
- `app:src/shared/components/dialogRoot/dialogRoot.tsx:101`

### Dialog.Content

`import { Dialog } from '@aragon/gov-ui-kit';`

DialogContent: scrollable content region of the Dialog compound (Compound modal dialog).

**References**

- `kit:src/core/components/dialogs/dialog/dialogContent/dialogContent.tsx:19`
- `kit:src/core/components/dialogs/dialog/dialogContent/dialogContent.stories.tsx:1`
- `app:src/actions/capitalDistributor/dialogs/capitalDistributorCampaignUploadDialog/capitalDistributorCampaignUploadDialog.tsx:203`
- `app:src/actions/capitalDistributor/dialogs/capitalDistributorSelectCampaignDialog/capitalDistributorSelectCampaignDialog.tsx:138`
- `app:src/actions/gaugeRegistrar/dialogs/gaugeRegistrarSelectGaugeDialog/gaugeRegistrarSelectGaugeDialog.tsx:127`

### Dialog.Footer

`import { Dialog } from '@aragon/gov-ui-kit';`

DialogFooter: footer/actions region of the Dialog compound (Compound modal dialog).

**References**

- `kit:src/core/components/dialogs/dialog/dialogFooter/dialogFooter.tsx:32`
- `kit:src/core/components/dialogs/dialog/dialogFooter/dialogFooter.stories.tsx:1`
- `app:src/actions/capitalDistributor/dialogs/capitalDistributorCampaignUploadDialog/capitalDistributorCampaignUploadDialog.tsx:212`
- `app:src/actions/capitalDistributor/dialogs/capitalDistributorSelectCampaignDialog/capitalDistributorSelectCampaignDialog.tsx:139`
- `app:src/actions/gaugeRegistrar/dialogs/gaugeRegistrarSelectGaugeDialog/gaugeRegistrarSelectGaugeDialog.tsx:128`

### Dialog.Header

`import { Dialog } from '@aragon/gov-ui-kit';`

DialogHeader: header region of the Dialog compound (Compound modal dialog).

**References**

- `kit:src/core/components/dialogs/dialog/dialogHeader/dialogHeader.tsx:23`
- `kit:src/core/components/dialogs/dialog/dialogHeader/dialogHeader.stories.tsx:1`
- `app:src/actions/capitalDistributor/dialogs/capitalDistributorCampaignUploadDialog/capitalDistributorCampaignUploadDialog.tsx:195`
- `app:src/actions/capitalDistributor/dialogs/capitalDistributorSelectCampaignDialog/capitalDistributorSelectCampaignDialog.tsx:86`
- `app:src/actions/gaugeRegistrar/dialogs/gaugeRegistrarSelectGaugeDialog/gaugeRegistrarSelectGaugeDialog.tsx:77`

### Dialog.Root

`import { Dialog } from '@aragon/gov-ui-kit';`

DialogRoot: compound root owning shared state/config of the Dialog compound (Compound modal dialog).

**Key props**

- `open/onOpenChange`: Controlled Radix root state; content portal is mounted only when open is true.
- `hiddenTitle/hiddenDescription`: Accessible fallback labels for dialogs without visible title or description.
- `useFocusTrap`: Defaults true; disable only when the caller owns focus management.

**References**

- `kit:src/core/components/dialogs/dialog/dialogRoot/dialogRoot.tsx:16`
- `kit:src/core/components/dialogs/dialog/dialogRoot/dialogRoot.stories.tsx:1`
- `app:src/shared/components/dialogRoot/dialogRoot.tsx:98`
- `app:src/shared/components/navigation/navigationDialog/navigationDialog.tsx:20`

### DocumentParser

`import { DocumentParser } from '@aragon/gov-ui-kit';`

Renders parsed document/rich content from a document prop.

**Usage notes**

- `document` accepts Markdown or HTML, and the parser sanitizes the content before rendering; an image `src` using a `data:` URI is stripped (the image element itself is not necessarily removed).
- Rendering is driven by the `document` prop; any `children` passed to `DocumentParser` are discarded.

**Use when**

- Displaying rich parsed document content read-only

**References**

- `kit:src/core/components/documentParser/documentParser.tsx:41`
- `kit:src/core/components/documentParser/documentParser.stories.tsx:1`
- `app:src/shared/components/SafeDocumentParser.tsx:13`

### Dropdown.Container

`import { Dropdown } from '@aragon/gov-ui-kit';`

DropdownContainer: layout container for child items of the Dropdown compound (Compound dropdown menu).

**References**

- `kit:src/core/components/dropdown/dropdownContainer/dropdownContainer.tsx:72`
- `kit:src/core/components/dropdown/dropdownContainer/dropdownContainer.stories.tsx:1`
- `app:src/daos/gaugeDistributions/dialogs/gaugeDistributionsMembersFileDownloadDialog/gaugeDistributionsMembersFileDownloadDialog.tsx:213`
- `app:src/daos/katana/dialogs/capitalDistributorTestMembersFileDownloadDialog/capitalDistributorTestMembersFileDownloadDialog.tsx:211`
- `app:src/modules/capitalFlow/components/createPolicyForm/createPolicyFormConfigure/createPolicyStrategyDetails.tsx:166`

### Dropdown.Item

`import { Dropdown } from '@aragon/gov-ui-kit';`

DropdownItem: individual item element of the Dropdown compound (Compound dropdown menu).

**References**

- `kit:src/core/components/dropdown/dropdownItem/dropdownItem.tsx:47`
- `kit:src/core/components/dropdown/dropdownItem/dropdownItem.stories.tsx:1`
- `app:src/daos/gaugeDistributions/dialogs/gaugeDistributionsMembersFileDownloadDialog/gaugeDistributionsMembersFileDownloadDialog.tsx:220`
- `app:src/daos/katana/dialogs/capitalDistributorTestMembersFileDownloadDialog/capitalDistributorTestMembersFileDownloadDialog.tsx:218`
- `app:src/modules/capitalFlow/components/createPolicyForm/createPolicyFormConfigure/createPolicyStrategyDetails.tsx:182`

### EmptyState

`import { EmptyState } from '@aragon/gov-ui-kit';`

Empty/zero-data state with an illustration, heading, description and up to two action buttons.

**Usage notes**

- `primaryButton` renders in both stacked and horizontal layouts; `isStacked` changes the surrounding layout and button sizes, not whether the action exists.
- Choose the mutually exclusive `humanIllustration` (with required `body`/`expression`) or `objectIllustration` (with `object`) shape; these values use exported TypeScript literal unions, not runtime enum objects.

**Use when**

- Communicating no-data / empty-list / error states

**Constraints**

- Illustration is either humanIllustration or objectIllustration

**References**

- `kit:src/core/components/states/emptyState/emptyState.tsx:14`
- `kit:src/core/components/states/emptyState/emptyState.stories.tsx:1`
- `app:src/actions/gaugeRegistrar/components/gaugeRegistrarUnregisterGaugeActionDetails/gaugeRegistrarUnregisterGaugeActionDetails.tsx:115`
- `app:src/actions/gaugeVoter/components/gaugeVoterActivateGaugeActionDetails/gaugeVoterActivateGaugeActionDetails.tsx:68`
- `app:src/actions/gaugeVoter/components/gaugeVoterDeactivateGaugeActionDetails/gaugeVoterDeactivateGaugeActionDetails.tsx:68`

### GukCoreProvider

`import { GukCoreProvider } from '@aragon/gov-ui-kit';`

Context provider supplying core config: Img/Link component overrides and copy, via values.

**Use when**

- Root-level setup for kit core components (custom Img/Link, copy)

**Key props**

- `values.Img`: Overrides the image primitive used by core components; defaults to 'img'.
- `values.Link`: Overrides the link primitive used by core components; defaults to 'a'.
- `values.copy`: Overrides core component copy; unspecified values use coreCopy defaults.

**References**

- `kit:src/core/components/gukCoreProvider/gukCoreProvider.tsx:40`

### GukModulesProvider

`import { GukModulesProvider } from '@aragon/gov-ui-kit';`

Bundles WagmiProvider + QueryClientProvider (default chains/query client) and GukCoreProvider, and supplies module copy defaults.

**Use when**

- Root-level setup for kit modules (web3) components

**Key props**

- `wagmiConfig/wagmiInitialState`: Forwarded to WagmiProvider; defaults include Ethereum, Base, Polygon, Arbitrum and testnets over HTTP transports.
- `queryClient`: Forwarded to QueryClientProvider; default client uses 2 minute staleTime and 5 minute gcTime.
- `coreProviderValues`: Forwarded to GukCoreProvider values.
- `values.copy`: Overrides modules component copy; unspecified values use modulesCopy defaults.

**Constraints**

- Module copy has defaults, so copy-only consumers work without this provider
- Bundles Wagmi and React-Query providers (default chains) plus GukCoreProvider

**Composition**

- Wrap module components needing wagmi, TanStack Query, module copy or core Img/Link overrides.
- Nests WagmiProvider, QueryClientProvider and GukCoreProvider under the modules context.

**References**

- `kit:src/modules/components/gukModulesProvider/gukModulesProvider.tsx:68`
- `app:src/modules/application/components/providers/providers.tsx:114`

### Heading

`import { Heading } from '@aragon/gov-ui-kit';`

Semantic heading with size and rendered element (as h1..h5).

**Use when**

- Section/page titles

**References**

- `kit:src/core/components/heading/heading.tsx:28`
- `kit:src/core/components/heading/heading.stories.tsx:1`
- `app:src/actions/core/permissionManager/components/permissionChangeCard.tsx:46`
- `app:src/modules/application/components/debugPanel/debugPanel.tsx:106`
- `app:src/modules/dashboard/components/dashboardOnboarding/adminOnboarding.tsx:26`

### Icon

`import { Icon } from '@aragon/gov-ui-kit';`

Renders a kit glyph selected by IconType with size variants.

**Use when**

- Inline iconography

**References**

- `kit:src/core/components/icon/icon.tsx:53`
- `kit:src/core/components/icon/icon.stories.tsx:1`
- `app:src/daos/boundless/components/boundlessPageHeader/boundlessAvatarIcon.tsx:22`
- `app:src/daos/cryptex/components/cryptexPageHeader/cryptexAvatarIcon.tsx:38`
- `app:src/modules/application/components/navigations/navigationWizard/navigationWizard.tsx:124`

### IllustrationHuman

`import { IllustrationHuman } from '@aragon/gov-ui-kit';`

Composable human illustration (body/expression/hairs/accessory/object parts).

**Usage notes**

- The root gets an inline `width: 100%` by default, but an explicit `style.width` overrides it; size the illustration with that style or a wrapper.
- Body, expression, hair, sunglasses, accessory and object choices use exported TypeScript string-union types, not runtime enum objects.

**Use when**

- Human-themed empty-state/marketing illustrations

**References**

- `kit:src/core/components/illustrations/illustrationHuman/illustrationHuman.tsx:60`
- `kit:src/core/components/illustrations/illustrationHuman/illustrationHuman.stories.tsx:1`

### IllustrationObject

`import { IllustrationObject } from '@aragon/gov-ui-kit';`

Object illustration selected by object type.

**Usage notes**

- `IllustrationObject` returns the selected SVG directly and does not add a wrapper or default `width: 100%`; size it through the forwarded SVG props such as `style`, `className` or `width`.
- `object` must use the exported `IllustrationObjectType` string-union values, which are compile-time types rather than runtime enum objects.

**Use when**

- Empty-state/decorative object illustrations

**References**

- `kit:src/core/components/illustrations/illustrationObject/illustrationObject.tsx:20`
- `kit:src/core/components/illustrations/illustrationObject/illustrationObject.stories.tsx:1`
- `app:src/modules/createDao/components/createProcessForm/createProcessFormGovernance/fields/governanceStagesField/governanceStagesField.tsx:73`
- `app:src/shared/components/ctaCard/ctaCard.tsx:108`
- `app:src/shared/components/wizardDetailsDialog/wizardDetailsDialog.tsx:58`

### InputContainer

`import { InputContainer } from '@aragon/gov-ui-kit';`

Shared label/helpText/alert/length chrome for input components; wraps a custom or built-in control.

**Use when**

- Building a custom input matching kit input chrome

**References**

- `kit:src/core/components/forms/inputContainer/inputContainer.tsx:35`
- `kit:src/core/components/forms/inputContainer/inputContainer.stories.tsx:1`
- `app:src/actions/capitalDistributor/components/capitalDistributorCreateCampaignActionCreate/capitalDistributorCampaignPayoutField.tsx:117`
- `app:src/actions/capitalDistributor/components/capitalDistributorCreateCampaignActionCreate/capitalDistributorCreateCampaignActionCreateForm.tsx:223`
- `app:src/actions/core/createProposal/createProposalActionDetails.tsx:141`

### InputDate

`import { InputDate } from '@aragon/gov-ui-kit';`

Date input field.

**Use when**

- Capturing a calendar date

**References**

- `kit:src/core/components/forms/inputDate/inputDate.tsx:11`
- `kit:src/core/components/forms/inputDate/inputDate.stories.tsx:1`
- `app:src/daos/cryptex/dialogs/cryptexMembersFileDownloadDialog/cryptexMembersFileDownloadDialog.tsx:119`
- `app:src/shared/components/forms/advancedDateInput/advancedDateInputFixed.tsx:81`

### InputFileAvatar

`import { InputFileAvatar } from '@aragon/gov-ui-kit';`

Avatar image file input with preview, accepted types, size and dimension validation.

**Use when**

- Uploading/selecting an avatar image

**Constraints**

- Validates the selected file against acceptedFileTypes, maxFileSize, min/maxDimension and onlySquare

**References**

- `kit:src/core/components/forms/inputFileAvatar/inputFileAvatar.tsx:42`
- `kit:src/core/components/forms/inputFileAvatar/inputFileAvatar.stories.tsx:1`
- `app:src/shared/components/forms/avatarInput/avatarInput.tsx:59`

### InputNumber

`import { InputNumber } from '@aragon/gov-ui-kit';`

Numeric input with min/max/step and optional prefix/suffix.

**Usage notes**

- `min` and `max` are enforced by the numeric mask and clamp values to the boundary; they do not produce an out-of-range alert, so pass `alert` when that state needs to be shown.
- `prefix` and `suffix` are escaped into the numeric mask and render as literal text, not as mask syntax or markup.

**Use when**

- Capturing a numeric amount

**References**

- `kit:src/core/components/forms/inputNumber/inputNumber.tsx:51`
- `kit:src/core/components/forms/inputNumber/inputNumber.stories.tsx:1`
- `app:src/daos/cryptex/dialogs/cryptexMembersFileDownloadDialog/cryptexMembersFileDownloadDialog.tsx:129`
- `app:src/daos/gaugeDistributions/dialogs/gaugeDistributionsMembersFileDownloadDialog/gaugeDistributionsMembersFileDownloadDialog.tsx:236`
- `app:src/daos/katana/dialogs/capitalDistributorTestMembersFileDownloadDialog/capitalDistributorTestMembersFileDownloadDialog.tsx:234`

### InputNumberMax

`import { InputNumberMax } from '@aragon/gov-ui-kit';`

Numeric input variant exposing a max-value affordance.

**Usage notes**

- `max` is required, clamps values through the numeric mask, and also supplies the value used by the max-value button; it does not produce an out-of-range alert, so pass `alert` for that state.
- `InputNumberMax` does not expose `prefix` or `suffix`; use `InputNumber` when literal numeric affixes are needed.

**Use when**

- Amount fields offering a max button (e.g. token amounts)

**References**

- `kit:src/core/components/forms/inputNumberMax/inputNumberMax.tsx:27`
- `kit:src/core/components/forms/inputNumberMax/inputNumberMax.stories.tsx:1`

### InputSearch

`import { InputSearch } from '@aragon/gov-ui-kit';`

Search input with a search affordance and loading state.

**Use when**

- Filtering/searching a list or dataset

**References**

- `kit:src/core/components/forms/inputSearch/inputSearch.tsx:16`
- `kit:src/core/components/forms/inputSearch/inputSearch.stories.tsx:1`

### InputText

`import { InputText } from '@aragon/gov-ui-kit';`

Single-line text input built on InputContainer, with optional addon and icons.

**Usage notes**

- When `maxLength` is set, an uncontrolled `defaultValue` does not initialize the character counter: it starts at `0` and updates after an input change; controlled `value` changes synchronize it immediately.
- `addon` renders only when its string is non-empty after trimming, and is displayed as literal text rather than parsed markup.

**Use when**

- Capturing free-form single-line text

**References**

- `kit:src/core/components/forms/inputText/inputText.tsx:30`
- `kit:src/core/components/forms/inputText/inputText.stories.tsx:1`
- `app:src/actions/capitalDistributor/components/capitalDistributorCreateCampaignActionCreate/capitalDistributorCreateCampaignActionCreateForm.tsx:199`
- `app:src/actions/gaugeRegistrar/components/gaugeRegistrarRegisterGaugeActionCreate/gaugeRegistrarRegisterGaugeActionCreateForm.tsx:167`
- `app:src/actions/gaugeVoter/components/gaugeVoterCreateGaugeActionCreate/gaugeVoterCreateGaugeActionCreateForm.tsx:124`

### InputTime

`import { InputTime } from '@aragon/gov-ui-kit';`

Time-of-day input field.

**Use when**

- Capturing a time value

**References**

- `kit:src/core/components/forms/inputTime/inputTime.tsx:11`
- `kit:src/core/components/forms/inputTime/inputTime.stories.tsx:1`
- `app:src/shared/components/forms/advancedDateInput/advancedDateInputFixed.tsx:89`

### Link

`import { Link } from '@aragon/gov-ui-kit';`

Text link with variant styling built on LinkBase; can show the URL and mark external.

**Use when**

- Inline navigation to another page/resource

**References**

- `kit:src/core/components/link/link/link.tsx:22`
- `kit:src/core/components/link/link/link.stories.tsx:1`
- `app:src/modules/application/dialogs/aragonProfileDialog/aragonProfileDialog.tsx:364`
- `app:src/modules/application/dialogs/connectWalletDialog/connectWalletDialog.tsx:147`
- `app:src/modules/governance/components/memberLinksCard/memberLinksCard.tsx:171`

### LinkBase

`import { LinkBase } from '@aragon/gov-ui-kit';`

Low-level ref-forwarding anchor primitive underlying Link.

**Use when**

- Building a custom link variant

**References**

- `kit:src/core/components/link/linkBase/linkBase.tsx:6`
- `kit:src/core/components/link/linkBase/linkBase.stories.tsx:1`

### MemberAvatar

`import { MemberAvatar } from '@aragon/gov-ui-kit';`

Avatar for a member/address that resolves the ENS avatar via web3.

**Usage notes**

- Render it inside `GukModulesProvider`: its three wagmi ENS hooks are always mounted and need the provider's wagmi and React Query context. Passing `avatarSrc` disables every ENS query but does not remove that requirement.
- If the image is unavailable after lookup, its fallback is a deterministic blockies identicon seeded from the resolved address, generated only client-side (not during SSR).

**Use when**

- Displaying a member/wallet identity image

**Key props**

- `address/ensName`: Resolves address, ENS name and ENS avatar through wagmi when avatarSrc is not supplied.
- `avatarSrc`: Direct image URL override; skips ENS lookup for avatar source.
- `chainId/wagmiConfig`: Forwarded to wagmi ENS hooks; chainId defaults to mainnet.

**Constraints**

- avatarSrc suppresses ENS queries; otherwise the supplied ensName/address is resolved using chainId (default mainnet).

**References**

- `kit:src/modules/components/member/memberAvatar/memberAvatar.tsx:35`
- `kit:src/modules/components/member/memberAvatar/memberAvatar.stories.tsx:1`
- `app:src/daos/alchemix/components/alchemixSubmitVote/alchemixSubmitVote.tsx:288`
- `app:src/modules/application/components/aragonProfilePreviewCard/aragonProfilePreviewCard.tsx:29`
- `app:src/modules/application/dialogs/userDialog/userDialog.tsx:98`

### MemberDataListItem.Skeleton

`import { MemberDataListItem } from '@aragon/gov-ui-kit';`

MemberDataListItemSkeleton: loading placeholder for one item of the MemberDataListItem compound (DataList item structure for a member).

**References**

- `kit:src/modules/components/member/memberDataListItem/memberDataListItemSkeleton/memberDataListItemSkeleton.tsx:6`
- `kit:src/modules/components/member/memberDataListItem/memberDataListItemSkeleton/memberDataListItemSkeleton.stories.tsx:1`
- `app:src/modules/governance/components/daoMemberList/daoMemberListDefault.tsx:178`
- `app:src/plugins/tokenPlugin/components/tokenMemberList/tokenMemberListBase.tsx:163`

### MemberDataListItem.Structure

`import { MemberDataListItem } from '@aragon/gov-ui-kit';`

MemberDataListItemStructure: presentational item structure driven by props of the MemberDataListItem compound (DataList item structure for a member).

**References**

- `kit:src/modules/components/member/memberDataListItem/memberDataListItemStructure/memberDataListItemStructure.tsx:52`
- `kit:src/modules/components/member/memberDataListItem/memberDataListItemStructure/memberDataListItemStructure.stories.tsx:1`
- `app:src/modules/governance/components/daoMemberList/daoMemberListDefault.tsx:216`
- `app:src/plugins/tokenPlugin/components/tokenMemberList/components/tokenMemberListItem.tsx:47`
- `app:src/plugins/tokenPlugin/dialogs/tokenDelegationDialog/tokenDelegationDialog.tsx:105`

### Progress

`import { Progress } from '@aragon/gov-ui-kit';`

Linear progress bar with value, size/variant and an optional threshold indicator.

**Usage notes**

- The progress track is wrapped in `w-full`, so it fills the containing block by default; the component's `className` targets the inner progress root.
- `value` and `indicator` are clamped to `1`–`100`, not `0`–`100`; a value of `0` still renders the minimum 1% indicator.

**Use when**

- Showing measured completion/threshold progress (e.g. voting)

**References**

- `kit:src/core/components/progress/progress.tsx:60`
- `kit:src/core/components/progress/progress.stories.tsx:1`
- `app:src/plugins/lockToVotePlugin/components/lockToVoteProposalVotingSummary/lockToVoteProposalVotingSummary.tsx:118`
- `app:src/plugins/multisigPlugin/components/multisigProposalVotingSummary/multisigProposalVotingSummary.tsx:113`
- `app:src/plugins/tokenPlugin/components/tokenProposalVotingSummary/tokenProposalVotingSummary.tsx:116`

### ProposalActionChangeMembers

`import { ProposalActionChangeMembers } from '@aragon/gov-ui-kit';`

ProposalActionChangeMembers: change-members action view of the ProposalActions compound (Compound decoded proposal-actions list).

**References**

- `kit:src/modules/components/proposal/proposalActions/proposalActionsList/proposalActionChangeMembers/proposalActionChangeMembers.tsx:8`
- `kit:src/modules/components/proposal/proposalActions/proposalActionsList/proposalActionChangeMembers/proposalActionChangeMembers.stories.tsx:1`

### ProposalActionChangeSettings

`import { ProposalActionChangeSettings } from '@aragon/gov-ui-kit';`

ProposalActionChangeSettings: change-settings action view of the ProposalActions compound (Compound decoded proposal-actions list).

**References**

- `kit:src/modules/components/proposal/proposalActions/proposalActionsList/proposalActionChangeSettings/proposalActionChangeSettings.tsx:6`
- `kit:src/modules/components/proposal/proposalActions/proposalActionsList/proposalActionChangeSettings/proposalActionChangeSettings.stories.tsx:1`

### ProposalActions.Container

`import { ProposalActions } from '@aragon/gov-ui-kit';`

ProposalActionsContainer: layout container for child items of the ProposalActions compound (Compound decoded proposal-actions list).

**References**

- `kit:src/modules/components/proposal/proposalActions/proposalActionsContainer/proposalActionsContainer.tsx:15`
- `kit:src/modules/components/proposal/proposalActions/proposalActionsContainer/proposalActionsContainer.stories.tsx:1`
- `app:src/actions/crossChainController/components/crossChainControllerNestedActionsList/crossChainControllerNestedActionsList.tsx:107`
- `app:src/modules/finance/dialogs/transactionDetailDialog/transactionDetailDialog.tsx:161`
- `app:src/modules/governance/components/nestedActionsList/nestedActionsList.tsx:65`

### ProposalActions.Footer

`import { ProposalActions } from '@aragon/gov-ui-kit';`

ProposalActionsFooter: footer/actions region of the ProposalActions compound (Compound decoded proposal-actions list).

**References**

- `kit:src/modules/components/proposal/proposalActions/proposalActionsFooter/proposalActionsFooter.tsx:39`
- `kit:src/modules/components/proposal/proposalActions/proposalActionsFooter/proposalActionsFooter.stories.tsx:1`
- `app:src/modules/finance/dialogs/transactionDetailDialog/transactionDetailDialog.tsx:171`
- `app:src/modules/governance/pages/daoProposalDetailsPage/daoProposalDetailsPageClient.tsx:361`

### ProposalActions.Item

`import { ProposalActions } from '@aragon/gov-ui-kit';`

ProposalActionsItem: individual item element of the ProposalActions compound (Compound decoded proposal-actions list).

**References**

- `kit:src/modules/components/proposal/proposalActions/proposalActionsItem/proposalActionsItem.tsx:46`
- `kit:src/modules/components/proposal/proposalActions/proposalActionsItem/proposalActionsItem.stories.tsx:1`
- `app:src/actions/crossChainController/components/crossChainControllerNestedActionsList/crossChainControllerNestedActionsList.tsx:96`
- `app:src/modules/governance/components/proposalActionsEditList/proposalActionsEditList.tsx:62`
- `app:src/modules/governance/components/proposalActionsItem/proposalActionsItem.tsx:43`

### ProposalActions.ItemSkeleton

`import { ProposalActions } from '@aragon/gov-ui-kit';`

ProposalActionsItemSkeleton: loading placeholder for one item of the ProposalActions compound (Compound decoded proposal-actions list).

**References**

- `kit:src/modules/components/proposal/proposalActions/proposalActionsItemSkeleton/proposalActionsItemSkeleton.tsx:4`
- `kit:src/modules/components/proposal/proposalActions/proposalActionsItemSkeleton/proposalActionsItemSkeleton.stories.tsx:1`

### ProposalActions.Root

`import { ProposalActions } from '@aragon/gov-ui-kit';`

ProposalActionsRoot: compound root owning shared state/config of the ProposalActions compound (Compound decoded proposal-actions list).

**References**

- `kit:src/modules/components/proposal/proposalActions/proposalActionsRoot/proposalActionsRoot.tsx:36`
- `kit:src/modules/components/proposal/proposalActions/proposalActionsRoot/proposalActionsRoot.stories.tsx:1`
- `app:src/actions/crossChainController/components/crossChainControllerNestedActionsList/crossChainControllerNestedActionsList.tsx:108`
- `app:src/modules/finance/dialogs/transactionDetailDialog/transactionDetailDialog.tsx:154`
- `app:src/modules/governance/components/nestedActionsList/nestedActionsList.tsx:64`

### ProposalActionTokenMint

`import { ProposalActionTokenMint } from '@aragon/gov-ui-kit';`

ProposalActionTokenMint: token-mint action view of the ProposalActions compound (Compound decoded proposal-actions list).

**References**

- `kit:src/modules/components/proposal/proposalActions/proposalActionsList/proposalActionTokenMint/proposalActionTokenMint.tsx:5`
- `kit:src/modules/components/proposal/proposalActions/proposalActionsList/proposalActionTokenMint/proposalActionTokenMint.stories.tsx:1`

### ProposalActionUpdateMetadata

`import { ProposalActionUpdateMetadata } from '@aragon/gov-ui-kit';`

ProposalActionUpdateMetadata: update-metadata action view of the ProposalActions compound (Compound decoded proposal-actions list).

**References**

- `kit:src/modules/components/proposal/proposalActions/proposalActionsList/proposalActionUpdateMetadata/proposalActionUpdateMetadata.tsx:7`
- `kit:src/modules/components/proposal/proposalActions/proposalActionsList/proposalActionUpdateMetadata/proposalActionUpdateMetadata.stories.tsx:1`

### ProposalDataListItem.Skeleton

`import { ProposalDataListItem } from '@aragon/gov-ui-kit';`

ProposalDataListItemSkeleton: loading placeholder for one item of the ProposalDataListItem compound (DataList item structure for a proposal, linking to the proposal via link).

**References**

- `kit:src/modules/components/proposal/proposalDataListItem/proposalDataListItemSkeleton/proposalDataListItemSkeleton.tsx:7`
- `kit:src/modules/components/proposal/proposalDataListItem/proposalDataListItemSkeleton/proposalDataListItemSkeleton.stories.tsx:1`
- `app:src/modules/governance/components/daoProposalList/daoProposalListDefault.tsx:97`
- `app:src/plugins/gaugeVoterPlugin/components/gaugeVoterLockList/gaugeVoterLockList.tsx:100`

### ProposalDataListItem.Structure

`import { ProposalDataListItem } from '@aragon/gov-ui-kit';`

ProposalDataListItemStructure: presentational item structure driven by props of the ProposalDataListItem compound (DataList item structure for a proposal, linking to the proposal via link).

**References**

- `kit:src/modules/components/proposal/proposalDataListItem/proposalDataListItemStructure/proposalDataListItemStructure.tsx:26`
- `kit:src/modules/components/proposal/proposalDataListItem/proposalDataListItemStructure/proposalDataListItemStructure.stories.tsx:1`
- `app:src/modules/governance/components/daoProposalList/daoProposalListDefaultItem.tsx:64`
- `app:src/modules/governance/dialogs/executeDialog/executeDialog.tsx:109`
- `app:src/modules/governance/dialogs/publishProposalDialog/publishProposalDialog.tsx:209`

### ProposalVoting.BodyContent

`import { ProposalVoting } from '@aragon/gov-ui-kit';`

ProposalVotingBodyContent: body content block of the ProposalVoting compound (Compound proposal voting UI).

**References**

- `kit:src/modules/components/proposal/proposalVoting/proposalVotingBodyContent/proposalVotingBodyContent.tsx:31`
- `app:src/modules/governance/components/proposalVotingTerminal/proposalVotingTerminal.tsx:108`
- `app:src/plugins/sppPlugin/components/sppVotingTerminal/components/sppVotingTerminalStageBodyContent.tsx:52`

### ProposalVoting.BodySummary

`import { ProposalVoting } from '@aragon/gov-ui-kit';`

ProposalVotingBodySummary: body-summary block of the ProposalVoting compound (Compound proposal voting UI).

**References**

- `kit:src/modules/components/proposal/proposalVoting/proposalVotingBodySummary/proposalVotingBodySummary.tsx:7`
- `app:src/plugins/sppPlugin/components/sppVotingTerminal/components/sppVotingTerminalStage.tsx:134`

### ProposalVoting.BodySummaryList

`import { ProposalVoting } from '@aragon/gov-ui-kit';`

ProposalVotingBodySummaryList: body-summary list of the ProposalVoting compound (Compound proposal voting UI).

**References**

- `kit:src/modules/components/proposal/proposalVoting/proposalVotingBodySummaryList/proposalVotingBodySummaryList.tsx:6`
- `app:src/plugins/sppPlugin/components/sppVotingTerminal/components/sppVotingTerminalStage.tsx:122`

### ProposalVoting.BodySummaryListItem

`import { ProposalVoting } from '@aragon/gov-ui-kit';`

ProposalVotingBodySummaryListItem: body-summary list item of the ProposalVoting compound (Compound proposal voting UI).

**References**

- `kit:src/modules/components/proposal/proposalVoting/proposalVotingBodySummaryListItem/proposalVotingBodySummaryListItem.tsx:22`
- `app:src/plugins/sppPlugin/components/sppVotingTerminal/components/sppVotingTerminalStage.tsx:120`

### ProposalVoting.BreakdownMultisig

`import { ProposalVoting } from '@aragon/gov-ui-kit';`

ProposalVotingBreakdownMultisig: multisig vote breakdown of the ProposalVoting compound (Compound proposal voting UI).

**References**

- `kit:src/modules/components/proposal/proposalVoting/proposalVotingBreakdownMultisig/proposalVotingBreakdownMultisig.tsx:26`
- `kit:src/modules/components/proposal/proposalVoting/proposalVotingBreakdownMultisig/proposalVotingBreakdownMultisig.stories.tsx:1`
- `app:src/plugins/multisigPlugin/components/multisigProposalVotingBreakdown/multisigProposalVotingBreakdown.tsx:28`

### ProposalVoting.BreakdownToken

`import { ProposalVoting } from '@aragon/gov-ui-kit';`

ProposalVotingBreakdownToken: token vote breakdown of the ProposalVoting compound (Compound proposal voting UI).

**References**

- `kit:src/modules/components/proposal/proposalVoting/proposalVotingBreakdownToken/proposalVotingBreakdownToken.tsx:43`
- `kit:src/modules/components/proposal/proposalVoting/proposalVotingBreakdownToken/proposalVotingBreakdownToken.stories.tsx:1`
- `app:src/plugins/lockToVotePlugin/components/lockToVoteProposalVotingBreakdown/lockToVoteProposalVotingBreakdown.tsx:68`
- `app:src/plugins/tokenPlugin/components/tokenProposalVotingBreakdown/tokenProposalVotingBreakdown.tsx:66`

### ProposalVoting.Container

`import { ProposalVoting } from '@aragon/gov-ui-kit';`

ProposalVotingContainer: layout container for child items of the ProposalVoting compound (Compound proposal voting UI).

**References**

- `kit:src/modules/components/proposal/proposalVoting/proposalVotingContainer/proposalVotingContainer.tsx:21`
- `app:src/modules/governance/components/proposalVotingTerminal/proposalVotingTerminal.tsx:109`

### ProposalVoting.Details

`import { ProposalVoting } from '@aragon/gov-ui-kit';`

ProposalVotingDetails: voting details block of the ProposalVoting compound (Compound proposal voting UI).

**References**

- `kit:src/modules/components/proposal/proposalVoting/proposalVotingDetails/proposalVotingDetails.tsx:12`
- `kit:src/modules/components/proposal/proposalVoting/proposalVotingDetails/proposalVotingDetails.stories.tsx:1`
- `app:src/modules/governance/components/proposalVotingTerminal/proposalVotingTerminal.tsx:107`
- `app:src/plugins/sppPlugin/components/sppVotingTerminal/components/sppVotingTerminalBodyContent.tsx:175`

### ProposalVotingProgress.Container

`import { ProposalVotingProgress } from '@aragon/gov-ui-kit';`

ProposalVotingProgressContainer: progress indicator container of the ProposalVoting compound (Compound proposal voting UI).

**References**

- `kit:src/modules/components/proposal/proposalVoting/proposalVotingProgress/proposalVotingProgressContainer.tsx:13`

### ProposalVotingProgress.Item

`import { ProposalVotingProgress } from '@aragon/gov-ui-kit';`

ProposalVotingProgressItem: progress indicator item of the ProposalVoting compound (Compound proposal voting UI).

**References**

- `kit:src/modules/components/proposal/proposalVoting/proposalVotingProgress/proposalVotingProgressItem.tsx:60`

### ProposalVoting.Stage

`import { ProposalVoting } from '@aragon/gov-ui-kit';`

ProposalVotingStage: single voting stage of the ProposalVoting compound (Compound proposal voting UI).

**References**

- `kit:src/modules/components/proposal/proposalVoting/proposalVotingStage/proposalVotingStage.tsx:41`
- `kit:src/modules/components/proposal/proposalVoting/proposalVotingStage/proposalVotingStage.stories.tsx:1`
- `app:src/plugins/sppPlugin/components/sppVotingTerminal/components/sppVotingTerminalStage.tsx:145`

### ProposalVoting.StageContainer

`import { ProposalVoting } from '@aragon/gov-ui-kit';`

ProposalVotingStageContainer: container sequencing voting stages of the ProposalVoting compound (Compound proposal voting UI).

**References**

- `kit:src/modules/components/proposal/proposalVoting/proposalVotingStageContainer/proposalVotingStageContainer.tsx:16`
- `app:src/plugins/sppPlugin/components/sppVotingTerminal/sppVotingTerminal.tsx:33`

### ProposalVoting.Votes

`import { ProposalVoting } from '@aragon/gov-ui-kit';`

ProposalVotingVotes: votes list block of the ProposalVoting compound (Compound proposal voting UI).

**References**

- `kit:src/modules/components/proposal/proposalVoting/proposalVotingVotes/proposalVotingVotes.tsx:6`
- `kit:src/modules/components/proposal/proposalVoting/proposalVotingVotes/proposalVotingVotes.stories.tsx:1`
- `app:src/modules/governance/components/proposalVotingTerminal/proposalVotingTerminal.tsx:100`
- `app:src/plugins/sppPlugin/components/sppVotingTerminal/components/sppVotingTerminalBodyContent.tsx:164`

### Radio

`import { Radio } from '@aragon/gov-ui-kit';`

Single radio control with label/value.

**Use when**

- One option within a single-select group

**Constraints**

- Documented to be used inside a RadioGroup, which supplies selection state

**References**

- `kit:src/core/components/forms/radio/radio.tsx:27`
- `kit:src/core/components/forms/radio/radio.stories.tsx:1`

### RadioCard

`import { RadioCard } from '@aragon/gov-ui-kit';`

Card-styled radio option with avatar/label/description/tag.

**Usage notes**

- Render `RadioCard` inside a `RadioGroup`: it is a Radix radio item that reads its selected state from the group and carries only a `value`, not a checked prop.
- `children` render only while the card is selected, so use them for detail that should appear once the option is chosen.

**Use when**

- Single-select option cards

**References**

- `kit:src/core/components/forms/radioCard/radioCard.tsx:48`
- `kit:src/core/components/forms/radioCard/radioCard.stories.tsx:1`
- `app:src/actions/capitalDistributor/components/capitalDistributorCreateCampaignActionCreate/capitalDistributorCampaignPayoutField.tsx:107`
- `app:src/actions/capitalDistributor/components/capitalDistributorCreateCampaignActionCreate/capitalDistributorCampaignScheduleField.tsx:89`
- `app:src/actions/gaugeRegistrar/components/gaugeRegistrarRegisterGaugeActionCreate/gaugeRegistrarRegisterGaugeActionCreateForm.tsx:215`

### RadioGroup

`import { RadioGroup } from '@aragon/gov-ui-kit';`

Coordinates a group of radios enforcing single selection (controlled via value/onValueChange).

**Use when**

- Single-select groups of options

**References**

- `kit:src/core/components/forms/radioGroup/radioGroup.tsx:43`
- `kit:src/core/components/forms/radioGroup/radioGroup.stories.tsx:1`
- `app:src/actions/capitalDistributor/components/capitalDistributorCreateCampaignActionCreate/capitalDistributorCampaignPayoutField.tsx:116`
- `app:src/actions/capitalDistributor/components/capitalDistributorCreateCampaignActionCreate/capitalDistributorCampaignScheduleField.tsx:107`
- `app:src/actions/gaugeRegistrar/components/gaugeRegistrarRegisterGaugeActionCreate/gaugeRegistrarRegisterGaugeActionCreateForm.tsx:204`

### Rerender

`import { Rerender } from '@aragon/gov-ui-kit';`

Re-renders its child function on an interval, passing the current time.

**Use when**

- Live-updating time-sensitive content (countdowns, relative times)

**Constraints**

- Re-renders its child on an interval set by intervalDuration

**References**

- `kit:src/core/components/rerender/rerender.tsx:22`
- `kit:src/core/components/rerender/rerender.stories.tsx:1`
- `app:src/plugins/gaugeVoterPlugin/components/gaugeVoterLockList/gaugeVoterLockListItem.tsx:321`

### SmartContractFunctionDataListItem.Skeleton

`import { SmartContractFunctionDataListItem } from '@aragon/gov-ui-kit';`

SmartContractFunctionDataListItemSkeleton: loading placeholder for one item of the SmartContractFunctionDataListItem compound (DataList item structure for a smart-contract function call).

**References**

- `kit:src/modules/components/smartContract/smartContractFunctionDataListItem/smartContractFunctionDataListItemSkeleton/smartContractFunctionDataListItemSkeleton.tsx:11`
- `kit:src/modules/components/smartContract/smartContractFunctionDataListItem/smartContractFunctionDataListItemSkeleton/smartContractFunctionDataListItemSkeleton.stories.tsx:1`
- `app:src/modules/settings/components/daoProccessAllowedActions/daoProcessAllowedActions.tsx:80`

### SmartContractFunctionDataListItem.Structure

`import { SmartContractFunctionDataListItem } from '@aragon/gov-ui-kit';`

SmartContractFunctionDataListItemStructure: presentational item structure driven by props of the SmartContractFunctionDataListItem compound (DataList item structure for a smart-contract function call).

**References**

- `kit:src/modules/components/smartContract/smartContractFunctionDataListItem/smartContractFunctionDataListItemStructure/smartContractFunctionDataListItemStructure.tsx:53`
- `kit:src/modules/components/smartContract/smartContractFunctionDataListItem/smartContractFunctionDataListItemStructure/smartContractFunctionDataListItemStructure.stories.tsx:1`
- `app:src/modules/createDao/components/createProcessForm/createProcessFormPermissions/createProcessFormPermissions.tsx:165`
- `app:src/modules/settings/components/daoProccessAllowedActions/daoProcessAllowedActions.tsx:83`

### Spinner

`import { Spinner } from '@aragon/gov-ui-kit';`

Indeterminate loading spinner with size/variant.

**Use when**

- Indicating in-flight/loading state

**References**

- `kit:src/core/components/spinner/spinner.tsx:87`
- `kit:src/core/components/spinner/spinner.stories.tsx:1`
- `app:src/modules/application/dialogs/aragonProfileRenameDialog/aragonProfileRenameDialog.tsx:149`
- `app:src/modules/capitalFlow/dialogs/dispatchDialog/dispatchSimulationDialog.tsx:164`
- `app:src/modules/governance/dialogs/selectPluginDialog/selectPluginDialog.tsx:135`

### StatePingAnimation

`import { StatePingAnimation } from '@aragon/gov-ui-kit';`

Animated ping/pulse indicator with a variant.

**Use when**

- Signaling a live or active status

**References**

- `kit:src/core/components/states/statePingAnimation/statePingAnimation.tsx:23`
- `kit:src/core/components/states/statePingAnimation/statePingAnimations.stories.tsx:1`

### StateSkeletonBar

`import { StateSkeletonBar } from '@aragon/gov-ui-kit';`

Rectangular skeleton placeholder (ref-forwarding) with configurable width/size.

**Usage notes**

- The component renders an inline `<span>` without a display utility, so its width/height need a flex/grid parent or an explicit `block`/`inline-block` class; a block parent alone does not change the span's display.
- Defaults are `width={160}` and `size="md"` (`h-4`); `style.width` takes precedence over the `width` prop.

**Use when**

- Loading placeholder for text/bar content

**References**

- `kit:src/core/components/states/stateSkeletonBar/stateSkeletonBar.tsx:47`
- `kit:src/core/components/states/stateSkeletonBar/stateSkeletonBar.stories.tsx:1`
- `app:src/actions/capitalDistributor/components/capitalDistributorCampaignListItem/capitalDistributorCampaignListItemSkeleton.tsx:13`
- `app:src/actions/gaugeRegistrar/components/gaugeRegistrarGaugeListItem/gaugeRegistrarGaugeListItemSkeleton.tsx:16`
- `app:src/actions/gaugeVoter/components/gaugeVoterGaugeListItem/gaugeVoterGaugeListItemSkeleton.tsx:18`

### StateSkeletonCircular

`import { StateSkeletonCircular } from '@aragon/gov-ui-kit';`

Circular skeleton placeholder for avatar/icon loading.

**Usage notes**

- The component renders an inline `<span>` without a display utility, so its size needs a flex/grid parent or an explicit `block`/`inline-block` class; a block parent alone does not change the span's display.
- The default is `size="md"` (`size-8`); all size choices use the exported `StateSkeletonCircularSize` union.

**Use when**

- Loading placeholder for avatars/circular media

**References**

- `kit:src/core/components/states/stateSkeletonCircular/stateSkeletonCircular.tsx:70`
- `kit:src/core/components/states/stateSkeletonCircular/stateSkeletonCircular.stories.tsx:1`
- `app:src/actions/gaugeRegistrar/components/gaugeRegistrarGaugeListItem/gaugeRegistrarGaugeListItemSkeleton.tsx:14`
- `app:src/actions/gaugeVoter/components/gaugeVoterGaugeListItem/gaugeVoterGaugeListItemSkeleton.tsx:16`
- `app:src/modules/settings/components/permissionsList/permissionsListSkeleton.tsx:28`

### Switch

`import { Switch } from '@aragon/gov-ui-kit';`

Toggle switch for on/off state with optional inline label.

**Use when**

- Instant boolean settings/preferences

**References**

- `kit:src/core/components/forms/switch/switch.tsx:44`
- `kit:src/core/components/forms/switch/switch.stories.tsx:1`
- `app:src/daos/alchemix/components/alchemixSubmitVote/alchemixSubmitVote.tsx:437`
- `app:src/modules/application/components/debugPanel/debugPanelControl/debugPanelControl.tsx:28`
- `app:src/modules/createDao/dialogs/setupStageSettingsDialog/fields/setupStageEarlyAdvanceField/setupStageEarlyAdvanceField.tsx:29`

### Tabs.Content

`import { Tabs } from '@aragon/gov-ui-kit';`

TabsContent: scrollable content region of the Tabs compound (Compound tabs).

**References**

- `kit:src/core/components/tabs/tabsContent/tabsContent.tsx:15`
- `app:src/plugins/gaugeVoterPlugin/pages/gaugeVoterGaugesPage/gaugeVoterGaugesPageContent.tsx:382`
- `app:src/plugins/lockToVotePlugin/components/lockToVoteProposalVotingBreakdown/lockToVoteProposalVotingBreakdown.tsx:56`
- `app:src/plugins/sppPlugin/components/sppVotingTerminal/components/sppVotingTerminalBodyBreakdownDefault.tsx:60`

### Tabs.List

`import { Tabs } from '@aragon/gov-ui-kit';`

TabsList: list region of the Tabs compound (Compound tabs).

**References**

- `kit:src/core/components/tabs/tabsList/tabsList.tsx:8`
- `app:src/plugins/gaugeVoterPlugin/pages/gaugeVoterGaugesPage/gaugeVoterGaugesPageContent.tsx:371`
- `app:src/plugins/tokenPlugin/components/tokenMemberPanel/tokenMemberPanel.tsx:84`

### Tabs.Root

`import { Tabs } from '@aragon/gov-ui-kit';`

TabsRoot: compound root owning shared state/config of the Tabs compound (Compound tabs).

**References**

- `kit:src/core/components/tabs/tabsRoot/tabsRoot.tsx:32`
- `kit:src/core/components/tabs/tabsRoot/tabsRoot.stories.tsx:1`
- `app:src/plugins/gaugeVoterPlugin/pages/gaugeVoterGaugesPage/gaugeVoterGaugesPageContent.tsx:367`
- `app:src/plugins/tokenPlugin/components/tokenMemberPanel/tokenMemberPanel.tsx:117`

### Tabs.Trigger

`import { Tabs } from '@aragon/gov-ui-kit';`

TabsTrigger: tab trigger of the Tabs compound (Compound tabs).

**References**

- `kit:src/core/components/tabs/tabsTrigger/tabsTrigger.tsx:22`
- `kit:src/core/components/tabs/tabsTrigger/tabsTrigger.stories.tsx:1`
- `app:src/plugins/gaugeVoterPlugin/pages/gaugeVoterGaugesPage/gaugeVoterGaugesPageContent.tsx:373`
- `app:src/plugins/tokenPlugin/components/tokenMemberPanel/tokenMemberPanel.tsx:86`

### Tag

`import { Tag } from '@aragon/gov-ui-kit';`

Small labelled tag/badge with a variant.

**Use when**

- Status/category labels and chips

**References**

- `kit:src/core/components/tag/tag.tsx:30`
- `kit:src/core/components/tag/tag.stories.tsx:1`
- `app:src/daos/alchemix/components/alchemixSubmitVote/alchemixSubmitVote.tsx:304`
- `app:src/modules/application/components/aragonProfilePreviewCard/aragonProfilePreviewCard.tsx:36`
- `app:src/modules/application/components/footer/footer.tsx:54`

### TextArea

`import { TextArea } from '@aragon/gov-ui-kit';`

Multi-line text input (ref-forwarding).

**Usage notes**

- When `maxLength` is set, an uncontrolled `defaultValue` does not initialize the character counter: it starts at `0` and updates after an input change; controlled `value` changes synchronize it immediately.
- The field wrapper is configured to grow and scroll, while the `<textarea>` starts with a `min-h-40` minimum height; size the surrounding layout rather than assuming a fixed-height field.

**Use when**

- Capturing free-form multi-line text

**References**

- `kit:src/core/components/forms/textArea/textArea.tsx:16`
- `kit:src/core/components/forms/textArea/textArea.stories.tsx:1`
- `app:src/actions/capitalDistributor/components/capitalDistributorCreateCampaignActionCreate/capitalDistributorCreateCampaignActionCreateForm.tsx:205`
- `app:src/actions/gaugeRegistrar/components/gaugeRegistrarRegisterGaugeActionCreate/gaugeRegistrarRegisterGaugeActionCreateForm.tsx:176`
- `app:src/actions/gaugeVoter/components/gaugeVoterCreateGaugeActionCreate/gaugeVoterCreateGaugeActionCreateForm.tsx:133`

### TextAreaRichText

`import { TextAreaRichText } from '@aragon/gov-ui-kit';`

Rich-text editor textarea emitting formatted output (valueFormat).

**Use when**

- Composing formatted content (e.g. proposal descriptions)

**References**

- `kit:src/core/components/forms/textAreaRichText/textAreaRichText.tsx:53`
- `kit:src/core/components/forms/textAreaRichText/textAreaRichText.stories.tsx:1`
- `app:src/modules/governance/components/createProposalForm/createProposalFormMetadata/createProposalFormMetadata.tsx:64`
- `app:src/modules/governance/dialogs/delegateStatementDialog/delegateStatementDialog.tsx:101`

### Toggle

`import { Toggle } from '@aragon/gov-ui-kit';`

Button representing a value within a ToggleGroup.

**Use when**

- A segment in a segmented toggle control

**Constraints**

- Documented to require rendering inside a ToggleGroup to function

**References**

- `kit:src/core/components/toggles/toggle/toggle.tsx:21`
- `kit:src/core/components/toggles/toggle/toggle.stories.tsx:1`
- `app:src/actions/core/permissionManager/components/permissionChangesCreate.tsx:228`
- `app:src/modules/capitalFlow/dialogs/routerSelectorDialog/routerSelectorDialog.tsx:100`
- `app:src/modules/explore/components/exploreDaos/exploreDaos.tsx:69`

### ToggleGroup

`import { ToggleGroup } from '@aragon/gov-ui-kit';`

Coordinates a group of Toggle buttons (single or multi-select, orientation).

**Usage notes**

- `isMultiSelect` is required: with `false`, `value`/`defaultValue`/`onChange` use `string | undefined`; with `true`, they use `string[] | undefined`.
- Selection is controlled by the group; each `Toggle` child contributes a `value`, while the group owns `value`/`defaultValue` and `onChange`.

**Use when**

- Segmented controls / filter toggles

**Constraints**

- isMultiSelect allows multiple selected toggles

**References**

- `kit:src/core/components/toggles/toggleGroup/toggleGroup.tsx:47`
- `kit:src/core/components/toggles/toggleGroup/toggleGroup.stories.tsx:1`
- `app:src/actions/core/permissionManager/components/permissionChangesCreate.tsx:210`
- `app:src/modules/capitalFlow/dialogs/routerSelectorDialog/routerSelectorDialog.tsx:112`
- `app:src/modules/explore/components/exploreDaos/exploreDaos.tsx:63`

### Tooltip

`import { Tooltip } from '@aragon/gov-ui-kit';`

Hover/focus tooltip (Radix) with content and variant.

**Use when**

- Supplemental hint on hover/focus

**References**

- `kit:src/core/components/tooltip/tooltip.tsx:70`
- `kit:src/core/components/tooltip/tooltip.stories.tsx:1`
- `app:src/actions/core/permissionManager/components/permissionIdItem.tsx:40`
- `app:src/modules/settings/components/permissionInfoTooltip/permissionInfoTooltip.tsx:29`

### TransactionDataListItem.Skeleton

`import { TransactionDataListItem } from '@aragon/gov-ui-kit';`

TransactionDataListItemSkeleton: loading placeholder for one item of the TransactionDataListItem compound (DataList item structure for a transaction).

**References**

- `kit:src/modules/components/transaction/transactionDataListItem/transactionDataListItemSkeleton/transactionDataListItemSkeleton.tsx:6`
- `kit:src/modules/components/transaction/transactionDataListItem/transactionDataListItemSkeleton/transactionDataListItemSkeleton.stories.tsx:1`
- `app:src/modules/finance/components/transactionList/transactionListDefault.tsx:280`

### TransactionDataListItem.Structure

`import { TransactionDataListItem } from '@aragon/gov-ui-kit';`

TransactionDataListItemStructure: presentational item structure driven by props of the TransactionDataListItem compound (DataList item structure for a transaction).

**References**

- `kit:src/modules/components/transaction/transactionDataListItem/transactionDataListItemStructure/transactionDataListItemStructure.tsx:36`
- `kit:src/modules/components/transaction/transactionDataListItem/transactionDataListItemStructure/transactionDataListItemStructure.stories.tsx:1`
- `app:src/modules/finance/components/transactionList/transactionListItem.tsx:121`

### TransactionDetail.Root

`import { TransactionDetail } from '@aragon/gov-ui-kit';`

TransactionDetailRoot: compound root owning shared state/config of the TransactionDetail compound (Compound execution-detail view).

**References**

- `kit:src/modules/components/transaction/transactionDetail/transactionDetailRoot/transactionDetailRoot.tsx:22`
- `app:src/modules/finance/dialogs/transactionDetailDialog/transactionDetailDialog.tsx:136`

### TransactionDetailSummary

`import { TransactionDetailSummary } from '@aragon/gov-ui-kit';`

Renders the executed-by/summary rows of an execution detail; label/address/href/helptext combinations map to the design states.

**Use when**

- Summary block inside a TransactionDetail

**Constraints**

- label/address/href/executedBy combinations map to the distinct executed-by states

**References**

- `kit:src/modules/components/transaction/transactionDetailSummary/transactionDetailSummary.tsx:7`
- `kit:src/modules/components/transaction/transactionDetailSummary/transactionDetailSummary.stories.tsx:1`
- `app:src/modules/finance/dialogs/transactionDetailDialog/transactionDetailDialog.tsx:137`

### VoteDataListItem.Skeleton

`import { VoteDataListItem } from '@aragon/gov-ui-kit';`

VoteDataListItemSkeleton: loading placeholder for one item of the VoteDataListItem compound (DataList item structure for a single vote).

**References**

- `kit:src/modules/components/vote/voteDataListItem/voteDataListItemSkeleton/voteDataListItemSkeleton.tsx:5`
- `kit:src/modules/components/vote/voteDataListItem/voteDataListItemSkeleton/voteDataListItemSkeleton.stories.tsx:1`
- `app:src/plugins/multisigPlugin/components/multisigVoteList/multisigVoteList.tsx:60`
- `app:src/plugins/tokenPlugin/components/tokenVoteList/tokenVoteList.tsx:65`

### VoteDataListItem.Structure

`import { VoteDataListItem } from '@aragon/gov-ui-kit';`

VoteDataListItemStructure: presentational item structure driven by props of the VoteDataListItem compound (DataList item structure for a single vote).

**References**

- `kit:src/modules/components/vote/voteDataListItem/voteDataListItemStructure/voteDataListItemStructure.tsx:50`
- `kit:src/modules/components/vote/voteDataListItem/voteDataListItemStructure/voteDataListItemStructure.stories.tsx:1`
- `app:src/plugins/multisigPlugin/components/multisigVoteList/multisigVoteList.tsx:101`
- `app:src/plugins/tokenPlugin/components/tokenVoteList/tokenVoteList.tsx:125`

### VoteProposalDataListItem.Skeleton

`import { VoteProposalDataListItem } from '@aragon/gov-ui-kit';`

VoteProposalDataListItemSkeleton: loading placeholder for one item of the VoteProposalDataListItem compound (DataList item structure showing a proposal with the viewing member's vote).

**References**

- `kit:src/modules/components/vote/voteProposalDataListItem/voteProposalDataListItemSkeleton/voteProposalDataListItemSkeleton.tsx:5`
- `kit:src/modules/components/vote/voteProposalDataListItem/voteProposalDataListItemSkeleton/voteProposalDataListItemSkeleton.stories.tsx:1`
- `app:src/plugins/multisigPlugin/components/multisigVoteList/multisigVoteList.tsx:59`
- `app:src/plugins/tokenPlugin/components/tokenVoteList/tokenVoteList.tsx:64`

### VoteProposalDataListItem.Structure

`import { VoteProposalDataListItem } from '@aragon/gov-ui-kit';`

VoteProposalDataListItemStructure: presentational item structure driven by props of the VoteProposalDataListItem compound (DataList item structure showing a proposal with the viewing member's vote).

**References**

- `kit:src/modules/components/vote/voteProposalDataListItem/voteProposalDataListItemStructure/voteProposalDataListItemStructure.tsx:33`
- `kit:src/modules/components/vote/voteProposalDataListItem/voteProposalDataListItemStructure/voteProposalDataListItemStructure.stories.tsx:1`
- `app:src/modules/governance/components/voteList/voteProposalListItem.tsx:40`
- `app:src/modules/governance/dialogs/voteDialog/voteDialog.tsx:161`
- `app:src/plugins/sppPlugin/dialogs/sppReportProposalResultDialog/sppReportProposalResultDialog.tsx:111`

### Wallet

`import { Wallet } from '@aragon/gov-ui-kit';`

Wallet connect/identity button: shows connect copy when disconnected, or MemberAvatar + resolved handle (name/ENS/truncated address) when connected.

**Usage notes**

- The connected handle (name / ENS / truncated address) is hidden below the `md` breakpoint, leaving only the avatar.
- Render it inside `GukModulesProvider`, even when no user is connected: its wagmi ENS-name hook is always mounted and only disabled, so it needs the provider's wagmi and React Query context. The ENS lookup runs only for a connected `user` without `name`.

**Use when**

- Header wallet connect/identity control

**Constraints**

- ENS name resolved via wagmi useEnsName on the chain from the chainId prop (default mainnet), and skipped when user.name is provided
- Displays caller-supplied user state; wallet connection behavior must be supplied through button handlers.

**References**

- `kit:src/modules/components/wallet/wallet.tsx:30`
- `kit:src/modules/components/wallet/wallet.stories.tsx:1`
- `app:src/modules/application/components/navigations/navigationDao/navigationDao.tsx:132`
- `app:src/modules/application/components/navigations/navigationWizard/navigationWizard.tsx:147`
- `app:src/modules/explore/components/exploreNav/exploreNav.tsx:85`

## Compound components

### Accordion

`import { Accordion } from '@aragon/gov-ui-kit';`

Compound accordion (Accordion.Container/Item/ItemHeader/ItemContent) for expand/collapse titled sections.

**Use when**

- Grouping content into collapsible titled sections

**Constraints**

- isMulti switches between single and multiple open sections

**Composition**

- Compound export with members: Accordion.Container, Accordion.Item, Accordion.ItemContent, Accordion.ItemHeader.

**References**

- `kit:src/core/components/accordion/index.ts:10`
- `app:src/modules/createDao/components/createProcessForm/createProcessFormGovernance/fields/governanceBodyField/governanceBodyField.tsx:118`
- `app:src/modules/settings/components/daoHierarchy/daoHierarchy.tsx:161`
- `app:src/modules/settings/components/permissionsList/permissionsList.tsx:78`

### AssetDataListItem

`import { AssetDataListItem } from '@aragon/gov-ui-kit';`

DataList item structure for an asset/token holding (name, symbol, amount, fiat value).

**Use when**

- Rows in a token/asset holdings list

**Composition**

- Compound export with members: AssetDataListItem.Skeleton, AssetDataListItem.Structure.

**References**

- `kit:src/modules/components/asset/assetDataListItem/index.ts:8`
- `app:src/modules/finance/components/assetAddressSelect/assetAddressSelect.tsx:159`
- `app:src/modules/finance/components/assetAddressSelect/assetAddressSelectAddAddressView.tsx:117`
- `app:src/modules/finance/components/assetAddressSelect/assetAddressSelectItem.tsx:39`

### DaoDataListItem

`import { DaoDataListItem } from '@aragon/gov-ui-kit';`

DataList item structure for a DAO (name, logo, description, address/ens, network).

**Use when**

- Rows in a DAO directory/list

**Composition**

- Compound export with members: DaoDataListItem.Skeleton, DaoDataListItem.Structure.

**References**

- `kit:src/modules/components/dao/daoDataListItem/index.ts:8`
- `app:src/modules/createDao/dialogs/publishDaoDialog/publishDaoDialog.tsx:190`
- `app:src/modules/explore/components/daoCarouselCard/daoCarouselCard.tsx:25`
- `app:src/modules/explore/components/daoList/daoList.tsx:131`

### DataList

`import { DataList } from '@aragon/gov-ui-kit';`

Compound list presentation with filter controls and pagination; the caller supplies items and loading/error/filter state.

**Usage notes**

- `DataList.Filter` renders the filter action only when `onFilterClick` is supplied; its reset action additionally requires `state="filtered"` and `onResetFiltersClick`, while sort controls render from non-empty `sortItems` even without `onSortChange`.
- Pagination is click-driven “load more,” not infinite scroll: the button calls `onLoadMore` for the next page, and the list displays children only through the current page-size slice.

**Use when**

- Rendering paginated lists of entities (proposals, members, assets, transactions)
- Hosting domain *DataListItem structures

**Constraints**

- Root shares pagination/state context and calls onLoadMore; it does not fetch or filter data.

**Composition**

- Compound export with members: DataList.ActionItem, DataList.Container, DataList.Filter, DataList.Item, DataList.Pagination, DataList.Root.

**References**

- `kit:src/core/components/dataList/index.ts:17`
- `app:src/actions/capitalDistributor/components/capitalDistributorCampaignListItem/capitalDistributorCampaignListItem.tsx:31`
- `app:src/actions/capitalDistributor/components/capitalDistributorCampaignListItem/capitalDistributorCampaignListItemSkeleton.tsx:17`
- `app:src/actions/capitalDistributor/dialogs/capitalDistributorSelectCampaignDialog/capitalDistributorSelectCampaignDialog.tsx:107`

### DefinitionList

`import { DefinitionList } from '@aragon/gov-ui-kit';`

Compound term/description list (DefinitionList.Container/Item).

**Use when**

- Showing key-value metadata (settings, proposal/transaction details)

**Constraints**

- Compose DefinitionList.Container > DefinitionList.Item

**Composition**

- Compound export with members: DefinitionList.Container, DefinitionList.Item.

**References**

- `kit:src/core/components/definitionList/index.ts:8`
- `app:src/actions/capitalDistributor/components/capitalDistributorCreateCampaignActionCreate/capitalDistributorCreateCampaignActionCreateForm.tsx:273`
- `app:src/actions/capitalDistributor/components/capitalDistributorCreateCampaignActionDetails/capitalDistributorCreateCampaignActionDetails.tsx:122`
- `app:src/actions/core/createProposal/createProposalActionDetails.tsx:103`

### Dialog

`import { Dialog } from '@aragon/gov-ui-kit';`

Compound modal dialog (Dialog.Root/Header/Content/Footer) built on Radix.

**Usage notes**

- `Dialog.Header` accepts a string `title` and optional string `description`; neither prop accepts arbitrary React elements.
- `Dialog.Content` adds horizontal inset padding by default; pass `noInset` when the content needs to reach the dialog edges.

**Use when**

- Modal flows: forms, confirmations, multi-step wizards
- Overlays needing header/scrollable-content/footer layout

**Instead**

- `DialogAlert`: Use DialogAlert for a simpler alert or confirmation modal.

**Key props**

- `Dialog.Root open/onOpenChange`: Controls Radix dialog open state and renders the portal only while open.
- `Dialog.Root size`: Constrains modal width with sm/md/lg/xl; defaults to md.
- `Dialog.Root hiddenTitle/hiddenDescription`: Provide accessible hidden labels when omitting visible header/content description.
- `Dialog.Root useFocusTrap`: Defaults true and traps focus inside the dialog content.

**Constraints**

- Caller supplies controlled open; Root renders the modal portal when open

**Composition**

- Compose Dialog.Root with Dialog.Header, Dialog.Content and Dialog.Footer.
- Dialog.Root provides Radix portal/overlay/content and focus scope; Header/Content/Footer provide the visible regions.
- Compound export with members: Dialog.Content, Dialog.Footer, Dialog.Header, Dialog.Root.

**References**

- `kit:src/core/components/dialogs/dialog/index.ts:14`
- `app:src/shared/components/dialogRoot/dialogRoot.tsx:98`
- `app:src/actions/capitalDistributor/dialogs/capitalDistributorCampaignUploadDialog/capitalDistributorCampaignUploadDialog.tsx:195`
- `app:src/actions/capitalDistributor/dialogs/capitalDistributorSelectCampaignDialog/capitalDistributorSelectCampaignDialog.tsx:138`

### DialogAlert

`import { DialogAlert } from '@aragon/gov-ui-kit';`

Compound alert/confirmation modal (DialogAlert.Root/Header/Content/Footer) with a variant.

**Usage notes**

- `DialogAlert.Header` and `DialogAlert.Footer` require the `DialogAlert.Root` provider; using either outside the matching Root throws, while `DialogAlert.Content` does not consume that custom context.
- `DialogAlert.Header` accepts a string `title`, not an arbitrary React element; use the component's other regions for custom content.

**Use when**

- Confirm/cancel destructive or blocking decisions

**Constraints**

- Caller supplies controlled open; Root renders the modal portal when open

**Composition**

- Compound export with members: DialogAlert.Content, DialogAlert.Footer, DialogAlert.Header, DialogAlert.Root.

**References**

- `kit:src/core/components/dialogs/dialogAlert/index.ts:14`
- `app:src/modules/application/dialogs/aragonProfileReleaseAlertDialog/aragonProfileReleaseAlertDialog.tsx:40`
- `app:src/modules/application/dialogs/retryTransactionAlertDialog/retryTransactionAlertDialog.tsx:29`
- `app:src/modules/governance/dialogs/duplicateProposalAlertDialog/duplicateProposalAlertDialog.tsx:41`

### Dropdown

`import { Dropdown } from '@aragon/gov-ui-kit';`

Compound dropdown menu (Dropdown.Container/Item) with a trigger and menu.

**Use when**

- Contextual action menus / overflow menus

**Composition**

- Compound export with members: Dropdown.Container, Dropdown.Item.

**References**

- `kit:src/core/components/dropdown/index.ts:7`
- `app:src/daos/gaugeDistributions/dialogs/gaugeDistributionsMembersFileDownloadDialog/gaugeDistributionsMembersFileDownloadDialog.tsx:213`
- `app:src/daos/katana/dialogs/capitalDistributorTestMembersFileDownloadDialog/capitalDistributorTestMembersFileDownloadDialog.tsx:211`
- `app:src/modules/capitalFlow/components/createPolicyForm/createPolicyFormConfigure/createPolicyStrategyDetails.tsx:166`

### MemberDataListItem

`import { MemberDataListItem } from '@aragon/gov-ui-kit';`

DataList item structure for a member (avatar, address/ENS, delegate/token-voting stats).

**Use when**

- Rows in a member/voter/delegate list

**Composition**

- Compound export with members: MemberDataListItem.Skeleton, MemberDataListItem.Structure.

**References**

- `kit:src/modules/components/member/memberDataListItem/index.ts:8`
- `app:src/modules/governance/components/daoMemberList/daoMemberListDefault.tsx:178`
- `app:src/plugins/tokenPlugin/components/tokenMemberList/components/tokenMemberListItem.tsx:47`
- `app:src/plugins/tokenPlugin/components/tokenMemberList/tokenMemberListBase.tsx:163`

### ProposalActions

`import { ProposalActions } from '@aragon/gov-ui-kit';`

Compound decoded proposal-actions list (ProposalActions.Root/Container/Item/ItemSkeleton/Footer) for reviewing and composing on-chain actions; typed action views (ProposalActionWithdrawToken/TokenMint/ChangeMembers/ChangeSettings/UpdateMetadata) are standalone exports.

**Usage notes**

- Each `ProposalActions.Item` action must include `from`, `to`, `data`, `value`, `type`, and nullable `inputData`; use the exported `ProposalActionType` enum for action types with a basic view.
- Render `ProposalActions.Item` as a child of `ProposalActions.Container`: the container injects each item's zero-based `index`, and an item rendered without it throws.
- `editMode` requires a `react-hook-form` `FormProvider`; set `readOnly` when an item must render outside a provider without watching form values.

**Use when**

- Reviewing decoded proposal actions
- Composing/editing proposal action sets in create flows

**Key props**

- `Root.actionsCount`: Server-side count hint; Container also calculates and sets the number of actions at runtime.
- `Root.expandedActions/onExpandedActionsChange`: Controls expanded action ids; omit callback for internal state.
- `Root.editMode`: Shows index badges, movement controls and remove buttons; expand all actions separately when needed.
- `Root.isLoading`: Propagates loading state through ProposalActions context.

**Constraints**

- Root controls expanded state (expandedActions/onExpandedActionsChange) and editMode

**Composition**

- Compose ProposalActions.Root with Container, Item/ItemSkeleton and Footer.
- Root owns expanded action ids, loading state and edit-mode context for descendants.
- Compound export with members: ProposalActions.Container, ProposalActions.Footer, ProposalActions.Item, ProposalActions.ItemSkeleton, ProposalActions.Root.

**References**

- `kit:src/modules/components/proposal/proposalActions/index.ts:17`
- `app:src/actions/crossChainController/components/crossChainControllerNestedActionsList/crossChainControllerNestedActionsList.tsx:107`
- `app:src/modules/finance/dialogs/transactionDetailDialog/transactionDetailDialog.tsx:154`
- `app:src/modules/governance/components/nestedActionsList/nestedActionsList.tsx:64`

### ProposalDataListItem

`import { ProposalDataListItem } from '@aragon/gov-ui-kit';`

DataList item structure for a proposal, linking to the proposal via link.

**Usage notes**

- Status tags map `ACTIVE`, `ADVANCEABLE`, and `EXECUTABLE` to `info`; `ACCEPTED` and `EXECUTED` to `success`; `FAILED`, `EXPIRED`, `REJECTED`, and `VETOED` to `critical`; and `DRAFT`, `PENDING`, and `UNREACHED` to `neutral`.
- `statusContext` is shown only for `ACTIVE` and `ADVANCEABLE`; metadata is hidden for `DRAFT`.

**Use when**

- Rows in a proposal list

**Composition**

- Compound export with members: ProposalDataListItem.Skeleton, ProposalDataListItem.Structure.

**References**

- `kit:src/modules/components/proposal/proposalDataListItem/index.ts:12`
- `app:src/modules/governance/components/daoProposalList/daoProposalListDefault.tsx:97`
- `app:src/modules/governance/components/daoProposalList/daoProposalListDefaultItem.tsx:64`
- `app:src/modules/governance/dialogs/executeDialog/executeDialog.tsx:109`

### ProposalVoting

`import { ProposalVoting } from '@aragon/gov-ui-kit';`

Compound proposal voting UI (ProposalVoting.Container/Stage/StageContainer/Details/Votes/BreakdownToken/BreakdownMultisig/BodySummary/BodySummaryList/BodySummaryListItem/BodyContent/Progress) for displaying multi-stage voting with token or multisig breakdowns.

**Usage notes**

- For multi-stage voting, `StageContainer.activeStage` is the single-open accordion value: each `Stage` receives a zero-based index and uses its string form (`'0'`, `'1'`, etc.), so leaving `activeStage` undefined leaves every stage collapsed.
- Place body members such as `BodyContent` and `BodySummary` inside `Container` or `Stage`; those wrappers provide the `ProposalVoting` context that the members consume.
- `BodyContent` initially selects Details for `PENDING`/`UNREACHED` statuses and Breakdown for other statuses.

**Use when**

- Rendering a proposal voting section with stages and breakdowns
- Showing token or multisig vote breakdowns

**Key props**

- `Container.status`: Required proposal status shown by ProposalVotingStatus.
- `Container.endDate`: Optional timestamp or ISO date forwarded to ProposalVotingStatus.
- `Container.bodyList`: Provides voting body context to body summary/content descendants.

**Composition**

- Compose ProposalVoting.Container with status/detail, breakdown, votes, stages, body summary/content and progress members.
- Container provides bodyList context and renders ProposalVotingStatus before children.
- Compound export with members: ProposalVoting.BodyContent, ProposalVoting.BodySummary, ProposalVoting.BodySummaryList, ProposalVoting.BodySummaryListItem, ProposalVoting.BreakdownMultisig, ProposalVoting.BreakdownToken, ProposalVoting.Container, ProposalVoting.Details, ProposalVoting.Progress, ProposalVoting.Stage, ProposalVoting.StageContainer, ProposalVoting.Votes.

**References**

- `kit:src/modules/components/proposal/proposalVoting/index.ts:24`
- `kit:src/modules/components/proposal/proposalVoting/proposalVoting.stories.tsx:1`
- `app:src/modules/governance/components/proposalVotingTerminal/proposalVotingTerminal.tsx:100`
- `app:src/plugins/lockToVotePlugin/components/lockToVoteProposalVotingBreakdown/lockToVoteProposalVotingBreakdown.tsx:68`
- `app:src/plugins/multisigPlugin/components/multisigProposalVotingBreakdown/multisigProposalVotingBreakdown.tsx:28`

### ProposalVoting.Progress

`import { ProposalVoting } from '@aragon/gov-ui-kit';`

ProposalVotingProgress: progress-indicator sub-compound (ProposalVotingProgress.Container/Item) of the ProposalVoting compound, namespaced as ProposalVoting.Progress.

**Composition**

- Compound export with members: ProposalVotingProgress.Container, ProposalVotingProgress.Item.

**References**

- `kit:src/modules/components/proposal/proposalVoting/proposalVotingProgress/index.ts:8`
- `kit:src/modules/components/proposal/proposalVoting/proposalVotingProgress/proposalVotingProgress.stories.tsx:1`

### SmartContractFunctionDataListItem

`import { SmartContractFunctionDataListItem } from '@aragon/gov-ui-kit';`

DataList item structure for a smart-contract function call (name, contract, selector, params).

**Use when**

- Rows listing decoded/available contract functions

**Composition**

- Compound export with members: SmartContractFunctionDataListItem.Skeleton, SmartContractFunctionDataListItem.Structure.

**References**

- `kit:src/modules/components/smartContract/smartContractFunctionDataListItem/index.ts:8`
- `app:src/modules/createDao/components/createProcessForm/createProcessFormPermissions/createProcessFormPermissions.tsx:165`
- `app:src/modules/settings/components/daoProccessAllowedActions/daoProcessAllowedActions.tsx:80`

### Tabs

`import { Tabs } from '@aragon/gov-ui-kit';`

Compound tabs (Tabs.Root/List/Trigger/Content) built on Radix.

**Usage notes**

- `Tabs.List` returns nothing when it has exactly one direct React child; its guard counts direct children and does not require them to be `Tabs.Trigger` elements.
- `Tabs.Root` always passes `orientation="horizontal"` to the underlying tabs primitive; vertical orientation is not available through this component.

**Use when**

- Switching between sibling views/panels

**Composition**

- Compound export with members: Tabs.Content, Tabs.List, Tabs.Root, Tabs.Trigger.

**References**

- `kit:src/core/components/tabs/index.ts:14`
- `app:src/plugins/gaugeVoterPlugin/pages/gaugeVoterGaugesPage/gaugeVoterGaugesPageContent.tsx:367`
- `app:src/plugins/lockToVotePlugin/components/lockToVoteProposalVotingBreakdown/lockToVoteProposalVotingBreakdown.tsx:56`
- `app:src/plugins/sppPlugin/components/sppVotingTerminal/components/sppVotingTerminalBodyBreakdownDefault.tsx:60`

### TransactionDataListItem

`import { TransactionDataListItem } from '@aragon/gov-ui-kit';`

DataList item structure for a transaction (type, status, chain, amount, date, hash).

**Use when**

- Rows in a transaction history list

**Composition**

- Compound export with members: TransactionDataListItem.Skeleton, TransactionDataListItem.Structure.

**References**

- `kit:src/modules/components/transaction/transactionDataListItem/index.ts:8`
- `app:src/modules/finance/components/transactionList/transactionListDefault.tsx:280`
- `app:src/modules/finance/components/transactionList/transactionListItem.tsx:121`

### TransactionDetail

`import { TransactionDetail } from '@aragon/gov-ui-kit';`

Compound execution-detail view (TransactionDetail.Root) rendering a dialog header + scrollable shell for an execution detail dialog.

**Use when**

- Detailed execution/transaction dialog content

**Constraints**

- Documented to render inside a Dialog.Root, composed with TransactionDetailSummary and an action-list component

**Composition**

- Compound export with members: TransactionDetail.Root.

**References**

- `kit:src/modules/components/transaction/transactionDetail/index.ts:3`
- `kit:src/modules/components/transaction/transactionDetail/transactionDetail.stories.tsx:1`
- `app:src/modules/finance/dialogs/transactionDetailDialog/transactionDetailDialog.tsx:136`

### VoteDataListItem

`import { VoteDataListItem } from '@aragon/gov-ui-kit';`

DataList item structure for a single vote (voter, choice indicator, power).

**Use when**

- Rows in a votes-cast list

**Composition**

- Compound export with members: VoteDataListItem.Skeleton, VoteDataListItem.Structure.

**References**

- `kit:src/modules/components/vote/voteDataListItem/index.ts:8`
- `app:src/plugins/multisigPlugin/components/multisigVoteList/multisigVoteList.tsx:101`
- `app:src/plugins/tokenPlugin/components/tokenVoteList/tokenVoteList.tsx:125`

### VoteProposalDataListItem

`import { VoteProposalDataListItem } from '@aragon/gov-ui-kit';`

DataList item structure showing a proposal with the viewing member's vote.

**Use when**

- Member profile / voting-history proposal rows

**Composition**

- Compound export with members: VoteProposalDataListItem.Skeleton, VoteProposalDataListItem.Structure.

**References**

- `kit:src/modules/components/vote/voteProposalDataListItem/index.ts:8`
- `app:src/modules/governance/components/voteList/voteProposalListItem.tsx:40`
- `app:src/modules/governance/dialogs/voteDialog/voteDialog.tsx:161`
- `app:src/plugins/multisigPlugin/components/multisigVoteList/multisigVoteList.tsx:59`

## Utilities

### addressUtils

`import { addressUtils } from '@aragon/gov-ui-kit';`

Ethereum address and hash validation, truncation, checksum and equality helpers.

**Use when**

- Validating or displaying wallet and contract addresses
- Comparing or shortening transaction, block or Merkle hashes

**Methods**

- `isAddress`: Returns viem address validation with optional options forwarded; the default options use strict:false.
- `truncateAddress`: Returns a shortened valid address or the original input when invalid.
- `truncateHash`: Returns a shortened valid 32-byte hash or the original input when invalid.
- `getChecksum`: Returns an address in checksum format.
- `isAddressEqual`: Returns true only when both valid addresses match case-insensitively.

**Constraints**

- isAddress defaults to strict:false and forwards supplied options to viem
- truncateAddress shows the first 6 and last 4 characters; truncateHash shows the first 10 and last 8 characters

**References**

- `kit:src/core/utils/addressUtils/addressUtils.ts:56`
- `app:src/actions/capitalDistributor/components/capitalDistributorCreateCampaignActionDetails/capitalDistributorCreateCampaignActionDetails.tsx:83`
- `app:src/actions/capitalDistributor/index.ts:30`
- `app:src/actions/capitalDistributor/utils/capitalDistributorActionParser/capitalDistributorActionParser.ts:34`

### clipboardUtils

`import { clipboardUtils } from '@aragon/gov-ui-kit';`

Async browser clipboard copy and paste helpers with optional error callbacks.

**Use when**

- Copying user-visible values to the clipboard
- Reading pasted text into an input flow

**Methods**

- `copy`: Writes a string to the clipboard and resolves void; optional onError receives failures.
- `paste`: Reads clipboard text and returns an empty string after a handled read failure; optional onError receives failures.

**Constraints**

- Uses navigator.clipboard and reports browser permission/read/write failures through onError

**References**

- `kit:src/core/utils/clipboardUtils/clipboardUtils.ts:33`

### ensUtils

`import { ensUtils } from '@aragon/gov-ui-kit';`

ENS name validation and compact display helpers.

**Use when**

- Checking whether text is an ENS .eth name
- Displaying long ENS names in a compact form

**Methods**

- `isEnsName`: Returns true for a valid .eth name and false for nullish, short or malformed values.
- `truncateEns`: Shortens valid ENS names longer than 9 characters to a five-character prefix plus the suffix.

**Constraints**

- Names must match the utility .eth pattern; invalid values are returned unchanged by truncateEns

**References**

- `kit:src/modules/utils/ensUtils/ensUtils.ts:24`

### formatterUtils

`import { formatterUtils } from '@aragon/gov-ui-kit';`

Shared number and date formatting utility with configurable locales and predefined governance formats.

**Use when**

- Formatting token, currency and percentage values consistently
- Formatting timestamps, relative dates and durations

**Methods**

- `formatNumber`: Accepts number, numeric string or nullish input; applies NumberFormat presets or INumberFormat overrides, including base symbols, currency, ratio percentages, signs and fallback/displayFallback handling.
- `formatDate`: Accepts Luxon DateTime, millisecond timestamp, ISO string or undefined; applies DateFormat presets for absolute, relative-calendar, relative-date or duration output and returns null for nullish input.

**Constraints**

- formatNumber parses numeric strings; percentage formatting multiplies the ratio by 100 and appends a percent sign
- formatNumber returns the configured fallback (null by default) for NaN or when the displayFallback predicate returns true for the parsed value
- formatDate converts numeric input with DateTime.fromMillis and string input with DateTime.fromISO
- formatDate DURATION reports an absolute humanized difference from now; RELATIVE preserves signed relative wording

**References**

- `kit:src/core/utils/formatterUtils/formatterUtils.ts:196`
- `app:src/actions/capitalDistributor/components/capitalDistributorCreateCampaignActionDetails/capitalDistributorCreateCampaignActionDetails.tsx:104`
- `app:src/actions/core/createProposal/createProposalActionDetails.tsx:51`
- `app:src/actions/crossChainController/components/crossChainControllerForwardMessageDetails/crossChainControllerForwardMessageDetails.tsx:94`

### responsiveUtils

`import { responsiveUtils } from '@aragon/gov-ui-kit';`

Responsive class-name helper for size maps and breakpoint-specific overrides.

**Use when**

- Building class names for responsive component sizes
- Applying default plus sm/md/lg/xl/2xl breakpoint classes

**Methods**

- `generateClassNames`: Combines the selected default size class with classes for configured sm, md, lg, xl and 2xl responsive sizes.

**Constraints**

- The classes map must contain the selected size and responsive variants; responsive overrides are optional

**References**

- `kit:src/core/utils/responsiveUtils/responsiveUtils.ts:24`

### ssrUtils

`import { ssrUtils } from '@aragon/gov-ui-kit';`

Server-rendering environment detection helper.

**Use when**

- Guarding browser-only work during server rendering
- Choosing a deterministic fallback before window exists

**Methods**

- `isServer`: Returns true when window is undefined.

**Constraints**

- isServer is based solely on whether global window is undefined

**References**

- `kit:src/core/utils/ssrUtils/ssrUtils.ts:8`

### urlUtils

`import { urlUtils } from '@aragon/gov-ui-kit';`

External URL normalization helper that adds a safe default protocol for host-like values.

**Use when**

- Normalizing external links before rendering or navigation
- Handling protocol-relative and host-only user input

**Methods**

- `normalizeExternalHref`: Trims a URL, returns undefined for empty input, prefixes protocol-relative values with https and host-like values with https://.

**Constraints**

- Nullish or empty input returns undefined; existing protocols are preserved; protocol-relative values use https

**References**

- `kit:src/core/utils/urlUtils/urlUtils.ts:46`
- `app:src/shared/security/sanitizeExternalUrl.ts:8`

## Allowed values

Enum props take a member (`icon={IconType.PLUS}`); string-union props take the quoted value (`object="ACTION"`).

### AlertVariant

`'critical'`, `'info'`, `'success'`, `'warning'`

### AvatarIconSize

`'sm'`, `'md'`, `'lg'`

### AvatarIconVariant

`'neutral'`, `'primary'`, `'info'`, `'success'`, `'warning'`, `'critical'`

### AvatarSize

`'xs'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'2xl'`

### Breakpoint

`'default'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'2xl'`

### ButtonContext

`'default'`, `'onlyIcon'`

### ButtonSize

`'lg'`, `'md'`, `'sm'`

### ButtonVariant

`'primary'`, `'secondary'`, `'tertiary'`, `'ghost'`, `'success'`, `'warning'`, `'critical'`

### ChainEntityType

`ADDRESS`, `TRANSACTION`, `TOKEN`

### ClipboardVariant

`'button'`, `'avatar'`, `'avatar-neutral'`

### DataListActionItemVariant

`'primary'`, `'neutral'`

### DataListState

`'initialLoading'`, `'loading'`, `'error'`, `'fetchingNextPage'`, `'idle'`, `'filtered'`

### DateFormat

`YEAR_MONTH_DAY_TIME`, `YEAR_MONTH_DAY`, `YEAR_MONTH`, `DURATION`, `RELATIVE`

### DialogAlertVariant

`'critical'`, `'info'`, `'success'`, `'warning'`

### DialogSize

`'sm'`, `'md'`, `'lg'`, `'xl'`

### HeadingSize

`'h1'`, `'h2'`, `'h3'`, `'h4'`, `'h5'`

### IconSize

`'sm'`, `'md'`, `'lg'`

### IconType

`APP_ASSETS`, `APP_DASHBOARD`, `APP_EXPLORE`, `APP_GAUGE`, `APP_MEMBERS`, `APP_PERMISSIONS`, `APP_PROPOSALS`, `APP_TRANSACTIONS`, `BLOCKCHAIN_BLOCK`, `BLOCKCHAIN_BLOCKCHAIN`, `BLOCKCHAIN_GASFEE`, `BLOCKCHAIN_SMARTCONTRACT`, `BLOCKCHAIN_WALLET`, `BURN_ASSETS`, `BLOCKCHAIN_WALLETCONNECT`, `CALENDAR`, `CHECKBOX`, `CHECKBOX_INDETERMINATE`, `CHECKBOX_SELECTED`, `CHECKMARK`, `CHEVRON_DOWN`, `CHEVRON_LEFT`, `CHEVRON_RIGHT`, `CHEVRON_UP`, `CLOCK`, `CLOSE`, `COPY`, `CRITICAL`, `DEPOSIT`, `DOTS_HORIZONTAL`, `DOTS_VERTICAL`, `EXPAND`, `FAVORITE`, `FAVORITE_SELECTED`, `FEEDBACK`, `FILTER`, `FLAG`, `HELP`, `HOME`, `INFO`, `LINK_EXTERNAL`, `LOGOUT`, `MENU`, `MINUS`, `PEN`, `PERSON`, `PLUS`, `RADIO`, `RADIO_SELECTED`, `RELOAD`, `REMOVE`, `REWARDS`, `RICHTEXT_BOLD`, `RICHTEXT_HEADING`, `RICHTEXT_ITALIC`, `RICHTEXT_LINK_ADD`, `RICHTEXT_LINK_REMOVE`, `RICHTEXT_LIST_ORDERED`, `RICHTEXT_LIST_UNORDERED`, `SEARCH`, `SETTINGS`, `SHRINK`, `SLASH`, `SORT_ASC`, `SORT_DESC`, `SUCCESS`, `WARNING`, `WITHDRAW`, `SOCIAL_X`, `SOCIAL_DISCORD`, `SOCIAL_GITHUB`, `SOCIAL_TELEGRAM`, `SOCIAL_EMAIL`, `SOCIAL_WEBSITE`

### IllustrationHumanAccessory

`'BUDDHA'`, `'EARRINGS_CIRCLE'`, `'EARRINGS_HOOPS'`, `'EARRINGS_RHOMBUS'`, `'EARRINGS_SKULL'`, `'EARRINGS_THUNDER'`, `'EXPRESSION'`, `'FLUSHED'`, `'HEAD_FLOWER'`, `'PIERCINGS_TATTOO'`, `'PIERCINGS'`

### IllustrationHumanBody

`'ARAGON'`, `'BLOCKS'`, `'CHART'`, `'COMPUTER_CORRECT'`, `'COMPUTER'`, `'CORRECT'`, `'DOUBLE_CORRECT'`, `'ELEVATING'`, `'RELAXED'`, `'SENDING_LOVE'`, `'VOTING'`

### IllustrationHumanExpression

`'ANGRY'`, `'CASUAL'`, `'CRYING'`, `'DECIDED'`, `'EXCITED'`, `'SAD_LEFT'`, `'SAD_RIGHT'`, `'SMILE_WINK'`, `'SMILE'`, `'SURPRISED'`, `'SUSPECTING'`

### IllustrationHumanHairs

`'AFRO'`, `'BALD'`, `'BUN'`, `'COOL'`, `'CURLY_BANGS'`, `'CURLY'`, `'INFORMAL'`, `'LONG'`, `'MIDDLE'`, `'OLDSCHOOL'`, `'PUNK'`, `'SHORT'`

### IllustrationHumanSunglasses

`'BIG_ROUNDED'`, `'BIG_SEMIROUNDED'`, `'LARGE_STYLIZED_XL'`, `'LARGE_STYLIZED'`, `'PIRATE'`, `'SMALL_INTELLECTUAL'`, `'SMALL_SYMPATHETIC'`, `'SMALL_WEIRD_ONE'`, `'SMALL_WEIRD_TWO'`, `'THUGLIFE_ROUNDED'`, `'THUGLIFE'`

### IllustrationObjectType

`'ACTION'`, `'APP'`, `'ARCHIVE'`, `'BOOK'`, `'BUILD'`, `'CHAIN'`, `'DATABASE'`, `'ERROR'`, `'EXPLORE'`, `'GAS'`, `'GOAL'`, `'LABELS'`, `'LIGHTBULB'`, `'MAGNIFYING_GLASS'`, `'NOT_FOUND'`, `'SECURITY'`, `'SETTINGS'`, `'SMART_CONTRACT'`, `'SUCCESS'`, `'TIMELOCK'`, `'USERS'`, `'WAGMI'`, `'WALLET'`, `'WARNING'`

### InputFileAvatarError

`SQUARE_ONLY`, `WRONG_DIMENSION`, `UNKNOWN_ERROR`, `FILE_INVALID_TYPE`, `TOO_MANY_FILES`, `FILE_TOO_LARGE`

### InputVariant

`'default'`, `'warning'`, `'critical'`

### LinkVariant

`'primary'`, `'neutral'`

### NumberFormat

`GENERIC_SHORT`, `GENERIC_LONG`, `FIAT_TOTAL_SHORT`, `FIAT_TOTAL_LONG`, `TOKEN_AMOUNT_SHORT`, `TOKEN_AMOUNT_LONG`, `TOKEN_PRICE`, `PERCENTAGE_SHORT`, `PERCENTAGE_LONG`

### ProgressSize

`'sm'`, `'md'`

### ProgressVariant

`'primary'`, `'neutral'`, `'success'`, `'critical'`

### ProposalActionType

`ADD_MEMBERS`, `REMOVE_MEMBERS`, `UPDATE_METADATA`, `TOKEN_MINT`, `CHANGE_SETTINGS_MULTISIG`, `CHANGE_SETTINGS_TOKENVOTE`, `UPDATE_PLUGIN_METADATA`

### ProposalActionTypeNoBasicView

`RAW_CALLDATA`

### ProposalStatus

`ACCEPTED`, `ACTIVE`, `ADVANCEABLE`, `DRAFT`, `EXECUTED`, `EXPIRED`, `FAILED`, `PENDING`, `EXECUTABLE`, `REJECTED`, `VETOED`, `UNREACHED`

### ProposalVotingTab

`BREAKDOWN`, `VOTES`, `DETAILS`

### SpinnerSize

`'sm'`, `'md'`, `'lg'`, `'xl'`

### SpinnerVariant

`'neutral'`, `'primary'`, `'primaryInverted'`, `'success'`, `'warning'`, `'critical'`

### StatePingAnimationVariant

`'primary'`, `'info'`, `'success'`, `'warning'`, `'critical'`

### StateSkeletonBarSize

`'sm'`, `'md'`, `'lg'`, `'xl'`, `'2xl'`

### StateSkeletonCircularSize

`'sm'`, `'md'`, `'lg'`, `'xl'`, `'2xl'`

### TagVariant

`'neutral'`, `'info'`, `'warning'`, `'critical'`, `'success'`, `'primary'`

### TooltipVariant

`'neutral'`, `'info'`, `'warning'`, `'critical'`, `'success'`

### TransactionStatus

`PENDING`, `SUCCESS`, `FAILED`

### TransactionType

`DEPOSIT`, `WITHDRAW`, `ACTION`, `EXECUTION`

### VoteIndicator

`'yes'`, `'no'`, `'abstain'`, `'approve'`, `'veto'`

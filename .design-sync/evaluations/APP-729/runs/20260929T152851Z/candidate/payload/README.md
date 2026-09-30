# Aragon App Design System — usage conventions

This is the maintained usage guide for the App design-sync surface. It connects
the generated GovKit selection view to the source contracts, Storybook stories,
tests and App examples. It is not a second component catalog.

## Find the right source

- This candidate consumes APP-726's generated selection view from
  `guidelines/context/selection-guide.json`; the matching
  `registry.json` remains authoritative for intent, evidence and source
  references. Both were refreshed together: 143 UI entries, 7 utility entries
  and 418 registry records.
- This is a candidate assembled from unmerged PRs, not an accepted baseline:
  App PRs
  [#1400](https://github.com/aragon/app/pull/1400),
  [#1412](https://github.com/aragon/app/pull/1412),
  [#1411](https://github.com/aragon/app/pull/1411),
  [#1410](https://github.com/aragon/app/pull/1410) and
  [#1413](https://github.com/aragon/app/pull/1413), plus GovKit PR
  [#793](https://github.com/aragon/gov-ui-kit/pull/793).
- The App base and GovKit source revisions this bundle was generated from are
  recorded in `guidelines/context/index.md`, which is generated from the same
  provenance the registry uses. Read them there rather than from this header;
  a revision written here by hand goes stale on the next refresh. The App
  `dirty` list covers only changed files under the scanned source paths, not
  the whole candidate. Source-to-published-package equivalence is recorded in
  the registry; do not present this candidate as accepted code.
- The kit owns public component props, stories, tests and reusable governance
  semantics. The App owns product composition, provider wiring, form policy,
  translations and application/domain side effects. The registry records these
  source references; it does not invent named team ownership.
- For kit behavior, use the GovKit source at the revision recorded in
  `guidelines/context/index.md`, and its co-located APIs, stories and tests,
  rather than assuming the published Storybook matches the App's installed
  version. At the time of writing that is
  [`64b517f5`](https://github.com/aragon/gov-ui-kit/tree/64b517f5b90052797ecaced5f15ab616b5733f30/src),
  the commit `@aragon/gov-ui-kit` 2.11.4 was published from; on a kit bump this
  link goes stale and the generated context does not. App behavior checks follow
  [the App testing guidance](guidelines/context/source-index.md#configured-component-sources).

### Citation format

Every claim-bearing reference must identify a checkable target. Cite
`path → exported symbol`, `path → Markdown heading`, or `path:Lx-Ly`; never cite
a bare path. Generated JavaScript (`_ds_bundle.js` and `_preview/*.js`) must use
an exported symbol, never a line range because rebuilds move generated lines.
Examples: `components/forms/AddressesInput/AddressesInput.d.ts →
AddressesInputContainerProps`, `_ds_bundle.js → WizardPageContainer`,
`README.md → Select and compose`, and `guidelines/index.md → Authority`.

Two layers are exposed in one bundle: **`@aragon/gov-ui-kit`** (groups `general`,
all kit components) and **the Aragon App's shared components** (groups `shared`,
`wizards`, `forms` — Wizard, WizardPage, WizardDialog, Page, StatCard, CtaCard,
Banner and App form inputs). Font: **Manrope** (bundled).

## Select and compose

- Prefer a kit primitive or compound component when its contract matches the
  interaction. Compound namespaces and their direct exports are aliases of the
  same implementation: compose `Dialog.Root/Header/Content/Footer`,
  `DataList.Root/Container/Filter/Pagination`,
  `Accordion.Container/Item/ItemHeader/ItemContent` and
  `Tabs.Root/List/Trigger/Content` rather than treating every member as a
  standalone alternative.
- Core components use default kit context, but compound children can still
  require their parent's context; follow the component's story.
- For web3 consumers such as `AddressInput` and `Wallet`, use
  `<GukModulesProvider>` to supply wagmi and query context. Module membership
  alone does not imply that a component throws without this wrapper:
  copy-only consumers use default module copy. Check the component's hooks
  and story before choosing a provider stack.
- App components that show text need
  `<DebugContextProvider><TranslationsProvider translations={enTranslations}>…`.
  Wizard exit-confirmation needs `<BlockNavigationContextProvider>`; omitting it
  no-ops the dirty-exit guard rather than throwing, and it is not required by
  `AddressesInput`.
- App form inputs (`AddressesInput`, `ResourcesInput`, `AdvancedDateInput`,
  `AvatarInput`, `NumberProgressInput`) read react-hook-form context.
  Standalone, wrap them in the exported `<FormWrapper defaultValues={{…}}>`;
  `AddressesInput` rows hydrate from the form default values.
- Inside a wizard, do not add `FormWrapper`: the wizard already owns the form
  context. `Wizard.Root` calls `useForm` and renders `FormProvider`, and
  `WizardPage.Container` / `WizardDialog.Container` compose `Wizard.Root` with
  `Wizard.Form`. A nested `FormWrapper` creates a second, separate form: the
  inputs then write to a context the wizard never reads, so its validation gates
  and submit payload silently lose those fields. Seed values through the wizard
  container's own `defaultValues` instead.
- Dialogs open through the controlled `open` prop on `Dialog.Root` or
  `DialogAlert.Root`; `defaultOpen` is not a substitute in this bundle. In the
  [App dialog provider](guidelines/context/source-index.md#configured-component-sources),
  call `close(dialogId)` to return from a child without closing its parent;
  bare `close()` dismisses the entire stack.

## Interaction and domain contracts

- `AddressInput.onChange` is the editable string channel, not a guarantee of
  untouched input: typing can checksum addresses, blur trims whitespace, and
  controls can replace or clear the string. `onAccept` reports the resolved
  `{ address, name }` or `undefined` after validation; it does not emit while ENS
  requests are loading. Do not treat the last accepted value as current while
  an edit is unresolved. The default enforces EIP-55 checksums; ENS resolution is on mainnet, while
  `chainId` controls explorer links. The App's `AddressesInput` owns required,
  duplicate and form-level validation — do not replace that policy with a
  single-input callback.
- `Button` renders a native button unless `href` is supplied, then renders a
  link. `isLoading` disables interaction and replaces icons with a spinner;
  `disabled` on a link uses `aria-disabled` and prevents navigation.
- `ActionSimulation` displays caller-supplied simulation state and calls
  `onSimulate`; it does not execute a simulation. Keep execution and transaction
  lifecycle handling in the App.
- Use the exported proposal status vocabulary and its mapping deliberately:
  `ACTIVE`, `ADVANCEABLE` and `EXECUTABLE` are actionable/info states;
  `ACCEPTED` and `EXECUTED` are success states; `FAILED`, `EXPIRED`,
  `REJECTED` and `VETOED` are critical states; `DRAFT`, `PENDING` and
  `UNREACHED` are neutral. Do not collapse these into a generic “complete”.

## Accessibility and copy

- Preserve Radix labeling, focus order, keyboard interaction and visible focus
  rings when composing. Do not nest interactive controls: set
  `AddressOutput.hasInteractiveAncestor` for clickable rows/links so it becomes
  passive and does not add a competing tab stop. Test through roles, labels and
  visible text, not classes or internal DOM structure.
- App copy comes from [the English locale](guidelines/context/source-index.md#configured-component-sources)
  through `TranslationsProvider`/`useTranslations`; GovKit shared copy lives in
  `src/core/assets/copy/coreCopy.ts` and `src/modules/assets/copy/modulesCopy.ts`.
  Reuse translation keys and existing domain terms for labels, loading, empty, error
  and transaction states. Keep protocol facts and action consequences explicit;
  do not turn a discussion question or a preview example into product policy.

## Building screens and flows

- Full-page wizard (create-DAO-style flows):
  `WizardPage.Container` with `initialSteps`, `submitLabel`, `finalStep` and
  `onSubmit`, containing `WizardPage.Step`.
- Dialog wizard: `WizardDialog.Container`/`WizardDialog.Step` inside the kit
  `Dialog.Root` and `DialogProvider`.
- Page scaffolding: `Page.Main` + `Page.Aside` with `Page.Header`,
  `Page.Content`, `Page.MainSection` and `Page.AsideCard`. Do not use
  `Page.Container` without the App query client; use a plain wrapper.
- Stat/CTA surfaces: `StatCard`, `CtaCard`, `Banner` and `Carousel`.
  Transaction step progress uses `AppTransactionStatus.Container`/`.Step`.

## Styling idiom

Use token-backed layout utilities and component variants rather than inventing
visual values. A CSS token does not prove its utility was emitted by the
bundle's source scan. The table below was verified against the candidate's
Tailwind 4.3.3 output after consuming APP-727's token baseline and APP-736's
generated-token integration. `rounded-2xl`, `rounded-3xl` and
`shadow-neutral-lg`, which were absent from the historical 2.10.0 bundle, are
emitted by this candidate.

| Family | Candidate utilities |
|---|---|
| Colors | `primary-{50…900}`, `neutral-{0,50,100,200,300,400,500,600,800,900}`, `info/success/warning/critical-{100…900}` as `bg-*`, `text-*` or `border-*` |
| Radius | `rounded-none/sm/md/lg/xl/2xl/3xl/full` plus side/corner variants; `rounded-xl` is the 12px card radius |
| Spacing | Standard Tailwind scale (`p-4`, `gap-3`, `space-y-2`…) |
| Type | `text-xs/sm/base/lg/xl/2xl/3xl`, `font-normal/semibold`; headings via `Heading` |
| Shadows | `shadow-none`, `shadow-sm`, `shadow-neutral{,-sm,-md,-lg}`, `shadow-primary{,-sm,-lg,-xl}`, `shadow-info{,-md}`, `shadow-success{,-sm,-md}`, `shadow-warning{,-sm,-md}`, `shadow-critical{,-sm,-md}` |

Component look is controlled by props, not classes: `variant` (for example
Button `primary|secondary|tertiary|ghost|success|warning|critical`; alerts
`info|success|warning|critical`), `size` (`sm|md|lg`) and state props
(`disabled`, `isLoading`). Selection state flows through group parents
(`RadioGroup`/`ToggleGroup` `defaultValue`), not per-item `checked`.

## Detailed source references

- `styles.css` imports `_ds_bundle.css`: token custom properties are
  `--color-*`, `--radius-*` and `--guk-*`.
- In the generated bundle, per-component contracts are under
  `components/general/<Name>/<Name>.d.ts` and `<Name>.prompt.md`. In source,
  follow the registry's `kit:`/`app:` references to the implementation,
  co-located story and test.
- Icons use `<Icon icon={IconType.PLUS} />`; `IconType` is exported and icons
  inherit `currentColor`.

## Example

```tsx
import { Button, Card, Heading, IconType, Progress, Tag } from '@aragon/gov-ui-kit';

const ProposalCard = () => (
    <Card className="flex w-full flex-col gap-4 p-6">
        <div className="flex items-center justify-between">
            <Heading size="h3">Increase treasury allocation</Heading>
            <Tag label="Active" variant="info" />
        </div>
        <p className="text-neutral-500">Allocate 50,000 USDC to the grants program for Q3.</p>
        <Progress value={64} variant="primary" />
        <div className="flex gap-3">
            <Button variant="primary" size="md">Vote now</Button>
            <Button variant="tertiary" size="md" iconRight={IconType.LINK_EXTERNAL}>View details</Button>
        </div>
    </Card>
);
```

# GovUiKit (@aragon/gov-ui-kit@2.11.4)

This design system is the published @aragon/gov-ui-kit React library, bundled as a single
browser global. All 114 components are the real upstream code.

## Where things are

- `_ds_bundle.js` — the whole-DS bundle at the project root; loads every component to `window.GovUiKit`. First line is a `/* @ds-bundle: … */` metadata header.
- `styles.css` — the single stylesheet entry: it `@import`s the tokens, fonts, and component styles (`_ds_bundle.css`). Link this one file.
- `components/<group>/<Name>/<Name>.prompt.md` (example JSX + variants), `<Name>.d.ts` (types), `<Name>.html` (variant grid).
- `tokens/*.css` — CSS custom properties, names verbatim from upstream.
- `fonts/` — `@font-face` files + `fonts.css` (when the package ships fonts).
- `guidelines/` — the design system's own usage guidance (4 doc(s), see `guidelines/index.md`). Read these before composing larger layouts.

For a specific component, `read_file("components/<group>/<Name>/<Name>.prompt.md")`.

## Loading

Add these two lines to your page once (React must be on the page first):

```html
<link rel="stylesheet" href="styles.css">
<script src="_ds_bundle.js"></script>
```

Components are then available at `window.GovUiKit.*`. Mount into a dedicated child node (e.g. `<div id="ds-root">`), not the host page's own React root, so the two trees don't collide:

```jsx
const { Accordion } = window.GovUiKit;
ReactDOM.createRoot(document.getElementById('ds-root')).render(<Accordion />);
```

## Tokens

283 CSS custom properties from @aragon/gov-ui-kit. Names are
preserved verbatim from upstream. They are declared inside `_ds_bundle.css` (this DS ships one compiled stylesheet rather than separate token files).

- **color** (95): `--text-xs`, `--text-xs--line-height`, `--text-sm`, …
- **spacing** (6): `--tw-space-y-reverse`, `--tw-space-x-reverse`, `--tw-inset-shadow`, …
- **typography** (10): `--font-weight-normal`, `--font-weight-medium`, `--font-weight-semibold`, …
- **radius** (8): `--radius-md`, `--radius-lg`, `--radius-xl`, …
- **shadow** (47): `--drop-shadow-2xl`, `--shadow-neutral-sm`, `--shadow-neutral`, …
- **other** (117): `--spacing`, `--container-xs`, `--container-md`, …

## Components

### general
- `Accordion` (compound: `Accordion.Container`, `Accordion.Item`, `Accordion.ItemHeader`, `Accordion.ItemContent`)
- `ActionSimulation`
- `AddressInput`
- `AddressOutput`
- `AlertCard`
- `AlertInline`
- `AssetDataListItem` (compound: `AssetDataListItem.Structure`, `AssetDataListItem.Skeleton`)
- `AssetTransfer`
- `Avatar`
- `AvatarBase`
- `AvatarIcon`
- `Breadcrumbs`
- `Button`
- `Card`
- `CardCollapsible`
- `CardEmptyState`
- `CardSummary`
- `Checkbox`
- `CheckboxCard`
- `CheckboxGroup`
- `Clipboard`
- `Collapsible` — Collapsible component that can wrap any content and visually collapse it for space-saving purposes.
- `DaoAvatar`
- `DaoDataListItem` (compound: `DaoDataListItem.Structure`, `DaoDataListItem.Skeleton`)
- `DataList` (compound: `DataList.Root`, `DataList.Filter`, `DataList.Container`, `DataList.Item`, `DataList.ActionItem`, `DataList.Pagination`)
- `DefinitionList` (compound: `DefinitionList.Container`, `DefinitionList.Item`)
- `Dialog` (compound: `Dialog.Content`, `Dialog.Footer`, `Dialog.Header`, `Dialog.Root`)
- `DialogAlert` (compound: `DialogAlert.Content`, `DialogAlert.Footer`, `DialogAlert.Header`, `DialogAlert.Root`)
- `DocumentParser`
- `Dropdown` (compound: `Dropdown.Container`, `Dropdown.Item`)
- `EmptyState`
- `GukCoreProvider`
- `GukModulesProvider`
- `Heading`
- `Icon`
- `IllustrationHuman`
- `IllustrationObject`
- `InputContainer` — The InputContainer component provides a consistent and shared styling foundation for various input components, such
- `InputDate`
- `InputFileAvatar`
- `InputNumber`
- `InputNumberMax`
- `InputSearch`
- `InputText`
- `InputTime`
- `Link`
- `LinkBase`
- `MemberAvatar`
- `MemberDataListItem` (compound: `MemberDataListItem.Structure`, `MemberDataListItem.Skeleton`)
- `Progress`
- `ProposalActionChangeMembers`
- `ProposalActionChangeSettings`
- `ProposalActions` (compound: `ProposalActions.Root`, `ProposalActions.Container`, `ProposalActions.Item`, `ProposalActions.ItemSkeleton`, `ProposalActions.Footer`)
- `ProposalActionTokenMint`
- `ProposalActionUpdateMetadata`
- `ProposalActionWithdrawToken`
- `ProposalDataListItem` (compound: `ProposalDataListItem.Skeleton`, `ProposalDataListItem.Structure`)
- `ProposalVoting` (compound: `ProposalVoting.BreakdownMultisig`, `ProposalVoting.BreakdownToken`, `ProposalVoting.Container`, `ProposalVoting.Details`, `ProposalVoting.StageContainer`, `ProposalVoting.Stage`, …)
- `ProposalVotingProgress` (compound: `ProposalVotingProgress.Item`, `ProposalVotingProgress.Container`)
- `Radio`
- `RadioCard`
- `RadioGroup`
- `Rerender` — Rerender component
- `SmartContractFunctionDataListItem` (compound: `SmartContractFunctionDataListItem.Skeleton`, `SmartContractFunctionDataListItem.Structure`)
- `Spinner` — Spinner UI component
- `StatePingAnimation`
- `StateSkeletonBar`
- `StateSkeletonCircular`
- `Switch`
- `Tabs` (compound: `Tabs.Root`, `Tabs.List`, `Tabs.Trigger`, `Tabs.Content`)
- `Tag`
- `TextArea`
- `TextAreaRichText`
- `Toggle` — The Toggle component is a button that handles the on and off states.
- `ToggleGroup`
- `Tooltip`
- `TransactionDataListItem` (compound: `TransactionDataListItem.Structure`, `TransactionDataListItem.Skeleton`)
- `TransactionDetail` (compound: `TransactionDetail.Root`)
- `TransactionDetailSummary`
- `VoteDataListItem` (compound: `VoteDataListItem.Structure`, `VoteDataListItem.Skeleton`)
- `VoteProposalDataListItem` (compound: `VoteProposalDataListItem.Structure`, `VoteProposalDataListItem.Skeleton`)
- `Wallet`

### forms
- `AddressesInput` (compound: `AddressesInput.Container`, `AddressesInput.Item`)
- `AdvancedDateInput`
- `AutocompleteInput`
- `AvatarInput`
- `NumberProgressInput`
- `ResourcesInput`

### design-sync
- `AppTransactionStatus` (compound: `AppTransactionStatus.Container`, `AppTransactionStatus.Step`)
- `FormWrapper`
- `Page` (compound: `Page.Container`, `Page.Header`, `Page.Content`, `Page.Main`, `Page.Aside`, `Page.MainSection`, …)

### shared
- `AragonLogo`
- `Banner`
- `Carousel`
- `Container`
- `CtaCard`
- `DaoTargetIndicator`
- `DaoTypeTag`
- `DialogProvider`
- `ErrorFeedback`
- `FooterInfo`
- `KeyboardShortcut`
- `NetworkSwitchAlert`
- `ResourceLink`
- `SafeDocumentParser`
- `SafeHtml`
- `StatCard`
- `TranslationsProvider`
- `WizardDetailsDialog`

### blocknavigationcontext
- `BlockNavigationContextProvider`

### debugprovider
- `DebugContextProvider`

### wizards
- `Wizard` (compound: `Wizard.Form`, `Wizard.Root`, `Wizard.Step`)
- `WizardDialog` (compound: `WizardDialog.Container`, `WizardDialog.Step`)
- `WizardPage` (compound: `WizardPage.Container`, `WizardPage.Step`)

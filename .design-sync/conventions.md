# Aragon App Design System — usage conventions

Two layers in one bundle: **`@aragon/gov-ui-kit`** (Aragon's Governance UI Kit — groups `general`, all kit components) and the **Aragon App's own shared components** (groups `shared`, `wizards`, `forms` — Wizard, WizardPage, WizardDialog, Page, StatCard, CtaCard, Banner, app form inputs…). Font: **Manrope** (bundled).

## Setup & wrapping

- **Kit core components need no provider** — Button, Card, DataList, Dialog, forms, etc. work bare.
- **Module components** (`ProposalDataListItem`, `ProposalVoting`, `ProposalActions`, `VoteDataListItem`, `DaoDataListItem`, `MemberDataListItem`, `AssetDataListItem`, `TransactionDataListItem`, `Wallet`, `AddressInput`, `ActionSimulation`) read web3 context: wrap them in `<GukModulesProvider>` (bundles its own react-query + wagmi defaults; no props required). Without it they throw at render.
- Dialogs open via controlled `open` prop on `Dialog.Root` / `DialogAlert.Root` (`defaultOpen` renders nothing).
- **App components** (groups `shared`/`wizards`/`forms`) that show text need the app provider stack:
  `<DebugContextProvider><TranslationsProvider translations={enTranslations}>…` — `enTranslations` (the app's real strings) is exported from the bundle. Wizards additionally need `<BlockNavigationContextProvider>`.
- **App form inputs** (`AddressesInput`, `ResourcesInput`, `AdvancedDateInput`, `AvatarInput`, `NumberProgressInput`, `AutocompleteInput`) read react-hook-form context: wrap them in the exported `<FormWrapper defaultValues={{…}}>`. Array-backed lists (addresses, resources) hydrate ONLY from `FormWrapper defaultValues`.

## Building screens & flows (the app's own patterns)

- **Full-page wizard** (create-DAO-style flows): `WizardPage.Container` (props `initialSteps=[{id, order, meta:{name}}…]`, `submitLabel`, `finalStep`, `onSubmit`) containing `WizardPage.Step` (props `id`, `order`, `meta`, `title`, `description`) — renders progress bar, step chrome, and footer automatically. Form fields inside steps get their form context from the wizard.
- **Dialog wizard** (short in-context flows): `WizardDialog.Container`/`WizardDialog.Step` inside the kit `Dialog.Root` + `DialogProvider`.
- **Page scaffolding**: `Page.Main` + `Page.Aside` with `Page.Header`, `Page.Content`, `Page.MainSection`, `Page.AsideCard`. Do NOT use `Page.Container` (needs the app's QueryClient — not in this bundle) — use a plain wrapper div.
- **Stat/CTA surfaces**: `StatCard`, `CtaCard`, `Banner`, `Carousel`; transaction step progress via `AppTransactionStatus.Container`/`.Step`.

## Styling idiom

Tailwind v4 utilities backed by the kit's design tokens. Style layout glue with utility classes; never write custom CSS files or invent class names outside these families:

| Family | Real values |
|---|---|
| Colors | `primary-{50…900}`, `neutral-{0,50,100,200,300,400,500,600,800,900}`, `info/success/warning/critical-{100…900}` — used as `bg-*`, `text-*`, `border-*` (e.g. `bg-neutral-0`, `text-neutral-500`, `border-primary-400`) |
| Radius | `rounded-md/lg/xl/2xl/3xl/full` (12px = `rounded-xl` is the kit's card radius) |
| Spacing | standard Tailwind scale (`p-4`, `gap-3`, `space-y-2`…) |
| Type | `text-xs/sm/base/lg/xl/2xl/3xl`, `font-normal/semibold`; headings via the `Heading` component, not raw classes |
| Shadows | `shadow-neutral-sm/md/lg`, `shadow-primary`, `shadow-info` … |

Component look is controlled by **props, not classes**: `variant` (e.g. Button `primary|secondary|tertiary|ghost|success|warning|critical`; alerts `info|success|warning|critical`; Tag adds `neutral|primary`), `size` (`sm|md|lg`), state props (`disabled`, `isLoading`). Selection state flows through group parents (`RadioGroup`/`ToggleGroup` `defaultValue`), not per-item `checked`.

## Where the truth lives

- `styles.css` → imports `_ds_bundle.css`: all tokens as CSS custom properties (`--color-*`, `--radius-*`, `--guk-*`) — read it before styling.
- Per component: `components/general/<Name>/<Name>.d.ts` (the exact props contract) and `<Name>.prompt.md` (usage guidance). Compound components are namespaces: `Dialog.Root/Header/Content/Footer`, `DataList.Root/Container/Filter/Pagination`, `Accordion.Container/Item/ItemHeader/ItemContent`, `Tabs.Root/List/Trigger/Content`.
- Icons: `<Icon icon={IconType.PLUS} />` — `IconType` enum is exported; icons inherit `currentColor`.

## Idiomatic example

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

# Create workspace (v1)

Implementation plan for the workspace creation flow. Written to be picked up cold — every decision, file and
deviation is recorded here.

Background on the wider workspaces effort (Safe accounts, aggregated pages, registry options) lives in
`workspaces.md` on the `app-1096-outstanding-aragon-workspaces-questions` branch. That branch already ships a
`workspace` module with assets/transactions/members pages against a mocked registry. **This work branches off
`main` instead and builds the module from scratch**, so the two will need reconciling — see
[Relationship to branch 1096](#relationship-to-branch-1096).

## Scope

In scope:

- A `workspace` module under `src/modules/workspace/`.
- A `/create/workspace` wizard page modelled on `/create/dao`: workspace metadata, a list of targets, a list of
  accounts (each account with optional metadata).
- A mocked, `localStorage`-backed workspace registry.
- A minimal `/workspace/{workspaceId}` read page so creation is demonstrable end to end.
- A CTA on the explore page.
- The whole feature behind the `workspaces` feature flag.

Out of scope (deliberate, deferred to follow-ups):

- Safe accounts and the account `type` picker.
- Target-based account discovery.
- Editing and deleting workspaces.
- Per-account `links` / `nickname` metadata.
- A real registry (on-chain or off-chain authenticated) and any backend API.
- Server-side prefetching of workspaces.

## Data model

Domain types live in `src/modules/workspace/api/workspaceService/domain/`. They are deliberately kept
byte-compatible with branch 1096 apart from the two additions called out below.

```ts
// workspace.ts
interface IWorkspace {
    id: string;                     // `workspaceId` URL parameter, slug of the name
    name: string;
    description: string;
    avatar: string | null;          // ipfs:// URI or null
    links: IResource[];             // `IResource` from @/shared/api/daoService
    owner: string;                  // address that created the workspace   (NEW vs 1096)
    accounts: IWorkspaceAccount[];
    targets: IWorkspaceTarget[];    //                                       (NEW vs 1096)
}

// workspaceAccount.ts
interface IWorkspaceAccount {
    id: string;                     // `${network}-${checksummedAddress}` — equals the backend daoId
    type: WorkspaceAccountType;     // always DAO in v1 (no UI field)
    address: string;
    network: Network;
    metadata?: {                    // omitted entirely when the user adds none
        name: string;
        description?: string;
        avatar?: string;            // ipfs:// URI
    };
}

// workspaceTarget.ts
interface IWorkspaceTarget {
    address: string;
    network: Network;
}

// enum/workspaceAccountType.ts
enum WorkspaceAccountType {
    DAO = 'DAO',
}
```

`type` is written on every account even though the form has no field for it, so stored objects satisfy
`IWorkspaceAccount` and 1096's pages can consume them unchanged.

A target is an **opaque `{ network, address }` pair in v1** — no derived behaviour, no validation beyond address
format. The next phase is expected to scan targets for permissions/access control and offer the discovered
accounts for the user to add, which is why Targets is entered *before* Accounts in the wizard.

## Wizard

Route `/create/workspace`, three steps:

| Order | Step id    | Content                                                        |
| ----- | ---------- | -------------------------------------------------------------- |
| 0     | `METADATA` | name, avatar, description, resources                           |
| 1     | `TARGETS`  | repeatable `{ network, address }` rows, may be empty            |
| 2     | `ACCOUNTS` | repeatable `{ network, address, metadata? }` rows, at least one |

Mechanics are identical to `createDaoPage`: `createWorkspacePageDefinitions.ts` exports a
`CreateWorkspaceWizardStep` enum plus a `createWorkspaceWizardSteps: IWizardStepperStep[]` array whose
`meta.name` values are untranslated i18n keys; the page client translates them into `processedSteps` and spreads
each step onto a `WizardPage.Step` inside a `WizardPage.Container`.

Metadata is step 0 because naming the thing first reads as a creation flow and leaves the first screen as a text
field rather than an address row. Targets precede Accounts for the discovery reason above.

### Form data

`src/modules/workspace/components/createWorkspaceForm/createWorkspaceFormDefinitions.ts`:

```ts
interface ICreateWorkspaceFormMetadataData {
    name: string;
    avatar?: IInputFileAvatarValue;
    description: string;
    resources: IResourcesInputResource[];
}

interface ICreateWorkspaceFormNetworkAddress {
    network: Network;
    address: string;
}

interface ICreateWorkspaceFormAccountMetadata {
    name: string;
    description: string;
    avatar?: IInputFileAvatarValue;
}

interface ICreateWorkspaceFormAccount extends ICreateWorkspaceFormNetworkAddress {
    metadata?: ICreateWorkspaceFormAccountMetadata;
}

interface ICreateWorkspaceFormData extends ICreateWorkspaceFormMetadataData {
    targets: ICreateWorkspaceFormNetworkAddress[];
    accounts: ICreateWorkspaceFormAccount[];
}
```

The metadata step is `createDaoFormMetadata` **minus the `ens` field** — a DAO has an ENS subdomain because it
registers one on-chain; a workspace has no contract and nothing to register. Everything else (`name` max 128,
`description` max 480 with `sanitizeMode: 'multiline'`, `AvatarInput`, `ResourcesInput`) is the same.

### Rows

Rows are a `useFieldArray` + `Card`-per-row structure modelled on `resourcesInput` / `resourcesInputItem`:
an "Add" button under the list, an overflow `Dropdown` per row with a remove action.

`AddressesInput` is intentionally **not** reused. It is typed to `ICompositeAddress[]` and its dedupe
(`addressesListUtils.checkIsAlreadyInList`) compares addresses only, which would wrongly reject the same address
on two different networks — a case the seed data itself contains.

Each row has:

- `NetworkInput` — the new shared network dropdown (below).
- gov-ui-kit `AddressInput`, with `chainId={networkDefinitions[row.network].id}` so ENS resolution and the
  explorer link follow the row's own network.

Account rows additionally have a **collapsible metadata block** toggled by a button inside the card, revealing
`AvatarInput`, name and description. Local `useState` per row drives the toggle; collapsing clears the block via
`setValue(metadataFieldName, undefined)` so an untouched or cleared block stores no `metadata` key at all.
When any metadata field is filled, `metadata.name` is required (1096 types `name` as non-optional inside the
block).

### Validation

- Addresses: **format only** — `addressUtils.isAddress`, plus `AddressInput`'s ENS resolution. There is no
  `daoService.getDao` existence check, so a valid-but-wrong address is accepted and only surfaces as empty
  workspace pages later. Deliberate call; revisit if it bites.
- Duplicates: rejected on the `(network, address)` pair **within** a list. The same pair may appear as both a
  target and an account (the seed data does this). Same address on different networks is legal.
- Changing a row's network re-triggers validation of that row's address field (`useFormContext().trigger`),
  otherwise a duplicate created by switching networks would slip through `mode: 'onTouched'`.
- Accounts require at least one row; Targets may be empty and start empty.
- New rows default to `Network.ETHEREUM_SEPOLIA`, matching `createDaoFormNetwork`'s default.

## Shared `NetworkInput`

`src/shared/components/forms/networkInput/` — new peer of `avatarInput` / `resourcesInput` / `addressesInput`.

gov-ui-kit has **no** `Select`/`Combobox` component (form primitives are inputText/inputNumber/radio/checkbox/
textArea/inputFileAvatar + a `Dropdown` menu), so the dropdown is composed:

- `InputContainer` with `useCustomWrapper` for the label/helpText/alert, fed from `useFormField`.
- `Dropdown.Container` with a `customTrigger` button showing the selected network's logo, name and testnet/beta
  tag plus a chevron.
- One `Dropdown.Item` per network, `selected` on the active one.

Options are `networkUtils.getSupportedNetworks()` filtered by `!networkDefinitions[network].disabled` and sorted
by `networkDefinitions[network].order`. Testnets are included and tagged, because the seed workspace uses
`ETHEREUM_SEPOLIA` and excluding testnets would make it unreproducible through the form. No network sets
`disabled: true` today, so the filter is currently a no-op guard.

`onValueChange` is exposed so a consumer can re-trigger sibling validation.

## Submit

`createWorkspacePageClient.handleFormSubmit` runs `useConnectedWalletGuard().check`, tracks
`wizard_submit` with `plausibleAnalyticsUtils`, then opens `WorkspaceDialogId.PUBLISH_WORKSPACE` with the form
values. The dialog is registered with `requiresWallet: true` — it reads the connected address to set
`workspace.owner`, so `DialogRoot` must unmount it if the wallet disconnects.

A wallet is required even though nothing is signed or paid for: it establishes the owner, rehearsing the
off-chain authenticated registry (wallet-signature auth) the real implementation is expected to use.

`publishWorkspaceDialog` is **not** a `TransactionDialog` — there is no transaction. It is a plain gov-ui-kit
`Dialog.Header` / `Dialog.Content` / `Dialog.Footer` with local `status` state (`idle | pending | error |
success`), a summary of what is about to be created, an `AlertCard` + retry on error, and a link to the created
workspace on success.

Submit sequence:

1. Pin the workspace avatar file, if any, via `usePinFile` → CID.
2. Pin each account metadata avatar file, if any, via `usePinFile` → CIDs. This is why the flow lives in a
   dialog: it is N+1 pin calls, each of which can fail.
3. `publishWorkspaceDialogUtils.buildWorkspace()` maps form values to `Omit<IWorkspace, 'id'>` —
   `resources` → `links` (same rename `publishDaoDialogUtils.prepareMetadata` does), avatar files → `ipfs://`
   URIs via `ipfsUtils.cidToUri`, account ids via `workspaceUtils.buildAccountId`, `type: DAO`, `owner` from the
   connected address.
4. `useCreateWorkspace` → `workspaceService.createWorkspace`, which assigns the id and persists.
5. Success state links to `/workspace/{id}`.

Pinning works from the client because `usePinFile` wraps `pinFileAction`, a `'use server'` server action —
`NEXT_SECRET_IPFS_JWT` never reaches the browser.

## Registry

`workspaceService` is shaped like a normal service (async, rejects with `AragonBackendServiceError`) so swapping
the mock for real requests is a single-method change:

- `getWorkspace({ urlParams: { id } })` → stored workspaces merged over `workspaceMocks`; rejects with
  `notFoundCode` / 404 when absent.
- `createWorkspace({ body })` where `body` is `Omit<IWorkspace, 'id'>` → assigns
  `workspaceUtils.buildWorkspaceId(name, existingIds)`, writes to `localStorage`, resolves with the full
  `IWorkspace`.

Storage key `aragon-workspaces`, value a `Record<string, IWorkspace>`. Both methods reject when called
server-side (`typeof window === 'undefined'`) rather than silently returning nothing.

`workspaceMocks` ships the `demo` workspace ported from 1096, extended with `targets` and `owner`, so there is
something to open without filling the form.

Ids are slugs: `workspaceUtils.buildWorkspaceId('Demo Workspace')` → `demo-workspace`, `demo-workspace-2` if
taken. Falls back to `workspace` when the name slugifies to nothing.

### Consequence: no server prefetch

`localStorage` is client-only, so `/workspace/[workspaceId]/page.tsx` is a thin `Page.Container` shell with
**no** `prefetchQuery`; the client component calls `useWorkspace`. This diverges from the prefetch-then-hydrate
pattern in `dataFetching.md` and is the one shape that can work with a client-side registry. It reverts to the
normal pattern when a real registry lands. Do not add a server prefetch to this page while the registry is
`localStorage`-backed — it will always miss and can produce hydration mismatches.

## Routes and layouts

`src/app/create/layout.tsx` currently applies `LayoutWizardCreateDao` to everything under `/create`, and that
component hardcodes `name="app.governance.layoutWizardCreateDao.name"` → **"Create DAO"**. Reusing it as-is
would put "Create DAO" in the workspace wizard header, and a nested layout would double-wrap `LayoutWizard`.

So the layout moves down one level, one thin wrapper per flow:

- **delete** `src/app/create/layout.tsx`
- **add** `src/app/create/dao/layout.tsx` → existing `LayoutWizardCreateDao`
- **add** `src/app/create/workspace/layout.tsx` → new `LayoutWizardCreateWorkspace`
  (`src/modules/workspace/components/layoutWizardCreateWorkspace/`, same body as `LayoutWizardCreateDao` with
  `name="app.workspace.layoutWizardCreateWorkspace.name"`)
- **add** `src/app/create/workspace/page.tsx` → `CreateWorkspacePage`
- **add** `src/app/workspace/[workspaceId]/page.tsx` → `WorkspaceDetailsPage`

No `src/app/workspace/[workspaceId]/layout.tsx` is added, deliberately: branch 1096 adds that exact file, so
skipping it keeps the collision surface to nothing.

`LayoutWizard` is an async server component that resolves a DAO from `params` when present; with no params it
just renders `NavigationWizard` with no DAO, which is what both create flows want.

## Feature flag

The whole feature sits behind the `workspaces` flag (`src/shared/featureFlags/featureFlags.constants.ts`, key
added to `FeatureFlagKey` in `featureFlags.api.ts`). Enabled in `local`, `development` and `preview`; `false`
by default, so staging and production are off — the registry is a `localStorage` mock, so it must not ship on.

Three gates, one per entry point:

| Entry point | Gate |
| --- | --- |
| `/create/workspace` | `createWorkspacePage` (server) — `await featureFlags.isEnabled('workspaces')`, else `notFound()` |
| `/workspace/{workspaceId}` | `workspaceDetailsPage` (server) — same |
| Explore CTA | `exploreDaosPageClient` (client) — `useFeatureFlags().isEnabled('workspaces')` |

Notes:

- `notFound()` must be imported from **`next/navigation-original`**, not `next/navigation`: the latter is aliased
  to the client-hooks wrapper (`src/shared/lib/nextNavigation`), which cannot re-export server functions. See the
  comment in `src/shared/utils/notFoundUtils/notFoundUtils.ts`.
- The route gates are server-side, so a disabled feature is not reachable by typing the URL.
- `/create/workspace` keeps its wizard layout around the 404 (the layout is a separate segment and still renders),
  which leaves the user an exit button. Gate the layout too if that is not wanted.
- `workspaceDialogsDefinitions` stays registered in `providersDialogs` unconditionally. The publish dialog can
  only be opened from the create wizard, which is itself gated, so registration alone exposes nothing.

## Wiring

- `src/modules/application/components/providers/providersDialogs.ts` — spread `workspaceDialogsDefinitions`.
- `src/modules/explore/pages/exploreDaosPageClient.tsx` — a fourth `CtaCard` in the CTA row. It must use
  `onClick: () => router.push('/create/workspace')`, **not** `href`: `CtaCard` forces `target="_blank"` plus an
  external-link icon whenever `href` is set.
- `src/shared/types/workspacePageParams.ts` — `IWorkspacePageParams { workspaceId: string }`, exported from
  `src/shared/types/index.ts` (ported verbatim from 1096).
- `src/assets/locales/en.json` — `app.workspace.*` (new top-level module namespace),
  `app.shared.networkInput.*`, and one new explore CTA block.

## File inventory

New:

```
src/shared/components/forms/networkInput/{networkInput.tsx,networkInput.api.ts,networkInput.test.tsx,index.ts}
src/shared/types/workspacePageParams.ts

src/modules/workspace/
├── api/workspaceService/
│   ├── domain/{workspace.ts,workspaceAccount.ts,workspaceTarget.ts,index.ts}
│   ├── domain/enum/{workspaceAccountType.ts,index.ts}
│   ├── queries/useWorkspace/{useWorkspace.ts,index.ts}
│   ├── queries/index.ts
│   ├── mutations/useCreateWorkspace/{useCreateWorkspace.ts,index.ts}
│   ├── mutations/index.ts
│   ├── {workspaceService.ts,workspaceService.api.ts,workspaceServiceKeys.ts,workspaceService.test.ts,index.ts}
├── components/createWorkspaceForm/
│   ├── createWorkspaceFormDefinitions.ts
│   ├── createWorkspaceFormMetadata/{createWorkspaceFormMetadata.tsx,index.ts}
│   ├── createWorkspaceFormTargets/{createWorkspaceFormTargets.tsx,createWorkspaceFormTargetsItem.tsx,index.ts}
│   ├── createWorkspaceFormAccounts/{createWorkspaceFormAccounts.tsx,createWorkspaceFormAccountsItem.tsx,index.ts}
│   └── index.ts
├── components/layoutWizardCreateWorkspace/{layoutWizardCreateWorkspace.tsx,index.ts}
├── constants/{workspaceMocks.ts,workspaceDialogId.ts,workspaceDialogsDefinitions.ts}
├── dialogs/publishWorkspaceDialog/{publishWorkspaceDialog.tsx,publishWorkspaceDialogUtils.ts,index.ts}
├── pages/createWorkspacePage/{createWorkspacePage.tsx,createWorkspacePageClient.tsx,createWorkspacePageDefinitions.ts,index.ts}
├── pages/workspaceDetailsPage/{workspaceDetailsPage.tsx,workspaceDetailsPageClient.tsx,index.ts}
├── utils/workspaceUtils/{workspaceUtils.ts,workspaceUtils.test.ts,index.ts}
└── index.ts

src/app/create/dao/layout.tsx
src/app/create/workspace/{page.tsx,layout.tsx}
src/app/workspace/[workspaceId]/page.tsx
```

Modified: `providersDialogs.ts`, `exploreDaosPageClient.tsx`, `src/shared/types/index.ts`, `en.json`,
`src/shared/featureFlags/{featureFlags.constants.ts,featureFlags.api.ts}`, `src/shared/testUtils/formWrapper.tsx`
(gained an optional `defaultValues` prop).
Deleted: `src/app/create/layout.tsx`.

## Relationship to branch 1096

`app-1096-outstanding-aragon-workspaces-questions` already contains `src/modules/workspace/` with
`IWorkspace`, `IWorkspaceAccount`, `WorkspaceAccountType`, a mocked `workspaceService`, `workspaceMocks`,
assets/transactions/members pages, `layoutWorkspace` and `navigationWorkspace`. This work reimplements the
overlapping pieces on `main`.

Whichever branch lands second must reconcile:

| File | Conflict |
| --- | --- |
| `api/workspaceService/domain/workspace.ts` | this branch adds `owner` and `targets` |
| `api/workspaceService/domain/workspaceAccount.ts` | identical — should merge clean |
| `api/workspaceService/domain/enum/workspaceAccountType.ts` | identical |
| `api/workspaceService/workspaceService.ts` | 1096 is read-only from mocks; this adds localStorage + create |
| `constants/workspaceMocks.ts` | this branch's `demo` gains `targets` + `owner` |
| `index.ts` | both export from the module root — additive |
| `src/app/workspace/[workspaceId]/` | 1096 adds `layout.tsx` + 3 sub-pages, this adds `page.tsx` |

Paths, type names and file layout were chosen to match 1096 exactly so the merge is additive wherever possible.
Keep it that way when extending this.

## Known gaps

- A created workspace referencing a DAO the backend doesn't index renders empty pages with no warning
  (format-only validation).
- `/workspace/{id}` is a minimal read page; 1096 replaces it with the real page set.
- Nothing lists workspaces — the seed `demo` and anything created are reachable only by URL or the success link.
- No editing, so a typo means creating a new workspace.

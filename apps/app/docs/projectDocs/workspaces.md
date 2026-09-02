# Workspaces

## Intro context

I want to make a significant architectural change and I'm researching available options to do it. I need to explore all available, but viable options.

I want to introduce the concept of Workspace. So right now everything is under a "DAO". DAO is the main top level entity. Workspace should be a higher level box. Workspace can contain multiple DAOs and other "accounts", like Safe.

We will treat DAO as one of (potentially) many account types. SafeWallet is another type of an account we want to add in this phase.

There should be a way to create and edit a workspace. Workspace should contain the list of accounts, workspace metadata, and optional account metadata which could be useful for Safe accounts. DAO accounts already have its own metadata. Workspace metadata should serve the similar purpose like DAO metadata currently. It should have a name, description, links/resources, avatar, same as DAO metadata.

Workspace page should look exactly like the existing DAO page, but it should show data for all accounts in the workspace. Some data is displayed for an account, some data for a body, and some data for a process. DAO is an account. DAO plugin could be a body, a process or both. Safe account is obviously an account, but also a body, and a process. Let's take some pages as examples:

Assets page in the workspace should show one of the following depending on filter set:
- All assets for all accounts in the workspace
- Assets for selected account (either DAO or Safe)

Transactions page is the same as assets page (handling data per account + aggregate for all accounts)

Members page now deals with bodies. It should show filter for each body of each DAO in the workspace plus filter for each Safe account which is also a body.

Proposals page deals with processes. It should show filter for each process of each DAO in the workspace plus filter for each Safe account which is also a process. Additionally, it should show "All proposals" filter which aggregates and shows paginated list of all proposals from all processes. We need to implement proposals abstraction for Safe accounts, which are basically pending safe transactions on which users can sign approvals (similar to DAO multisig).

Safe account should be another first-class type of an account in our system, in addition to the existing DAO account type. We should index Safe configuration and owners. Also:
- figure out how to attach metadata potentially
    - metadata in the workspace config?
- index Safe configuration and owners
    - align format with our multisig?
- index Safe's assets
- index Safe's transactions
- implement API for returning Safe "proposals"
    - this has to be from Safe Transactions API, we cannot index safe "pending" transactions
- implement actions decoding for Safe transactions and proposals
- implement members API for safe accounts
- implement all other relevant APIs which are needed (mirrored from the DAO APIs)

## Creating a workspace

### Config file
- Workspace is a collection of accounts and targets (on multiple networks)
- Workspace config/definition file contains
  - list of accounts
  - list of targets
  - metadata for the workspace (name, description, avatar, resources)
  - optional metadata for accounts, i.e. DAOs have its own metadata, but safe accounts don't
- Multichain - address wildcard

### Account discovery
- If an account is explicitly noted in the config file, it is always a part of a workspace
- There could be also a multiple ways to automatically discover relevant accounts based on target address, i.e. based on permissions and access control implementation

### Persisting and managing a workspace
- Owner/manager of a workspace should be able to create/edit/delete a workspace
- There are different available approaches:
  - Manual entry in App CMS
    - might be good only for initial version
  - On-chain registry
    - PRO: same approach we already use, easy to index
    - CONS: new contract dev, support for multiple chains
  - Off-chain authenticated registry (backend collection + authed writes)
    - Auth based on wallet signatures (we already have some draft of this)

### Open questions
- if we go with on-chain registry, how to naturally support multiple chains in one workspace?
- how to support WORKSPACE_MANAGER role to avoid having a single workspace owner? ... or is it ok to have 1 owner?

## Transactions page
- Transaction is an abstraction we can easily unify/reuse for all account types
- We need to index safe transacions in the same way as we do for DAOs (same table)
  - Pay attention to executions, we need to decode actions!
- We need a new API to get transactions per account or for all accounts in the workspace
  - API could even stay the same, but we add `workspaceId`, `daoId`, `safeId` params

## Assets page
- Asset is an abstraction we can easily unify/reuse for all account types
- Right now assets are indexed per DAO, so we need to update the structure to index per account (network-address)
- We need to index assets on safe account
- We need a new API to get assets per account or for all accounts in the workspace

## Members page
- members are fetched by "body"
  - Safe accounts are bodies too!
- New API is needed for safe account type and members need to be indexed and saved to Member collection
- Everything else from the existing DAO members page could be reused, we only need to route Safe body requests to another API
  - it might even be possible to keep the same API and add additional params

## Member details page
- In the first version it could stay the same, we just extend the API to return for all DAOs in a workspace
  - it already works for all linked DAOs
- We can later add sections related to other account types

## Proposals page
- Proposals are fetched by "process"
  - Safe accounts are processes too
- We need to normalize Safe pending transaction into a proposal abstraction, so that all appear as proposals in a single list

## Account abstraction
- Do we have top-level account abstraction with a discriminator, something like `type: 'dao' | 'safe'`, or, we have DAO entity as it is now, and then we add Safe as a separate entity?

## Single account pages - Virtual workspace
- Once we have a workspace page, i.e. members, proposals, which supports multiple accounts, then we can reuse that page for a single account page (either DAO or Safe)
  - We just pass in a synthetic workspace with one account inside

## Implementation status

The Assets and Transactions pages are built for workspaces of multiple **DAO** accounts (Safe accounts still out of
scope), on the existing backend with no API changes: `/workspace/{workspaceId}/assets` and
`/workspace/{workspaceId}/transactions`, against a mocked workspace registry.

Implementation notes, the verified backend constraints and the full decision log:
[`workspaceFinancePages.md`](./workspaceFinancePages.md).

# Workspace routing v2

Decision record for taking the workspace and the account selection out of the URL path, so that account pages have
their own URLs, independent of any workspace.

- **Status:** proposed 2026-11-17. Supersedes [workspaceRouting.md](./workspaceRouting.md) once accepted.

## Context

A workspace is a set of accounts (DAOs, Safes) that a user groups and customizes. It does not own them: an account
exists without any workspace, and it needs a direct, shareable URL that works for anyone.

Today every page sits under `/workspace/{workspaceId}/{accountId | all}/{section}`. That shape has three problems:

1. **One segment, two jobs.** `{accountId}` is both the account selector's value and the account the page belongs
   to. An account page (a proposal, a member) therefore cannot be shown while "All accounts" is selected: opening it
   switches the selector, which surprises users.
2. **Account links need a workspace.** A shared link carries the sender's workspace ID. The registry is
   `localStorage`, so the reader almost never has that workspace and gets a "pick a workspace" prompt first.
3. **The path suggests ownership.** `/workspace/account/page` reads as parent → child, but the workspace is an
   aggregation layer next to the accounts, not above them.

## Terms

| Term | Meaning |
| --- | --- |
| Workspace (`ws`) | The workspace whose navigation, accounts and customizations frame the page. Default: "My workspace" |
| Scope (`scope`) | The account selector's value: one account ID (`{network}-{address}`), or none for "All accounts" |
| Page account | The account an entity page shows (proposal, member, settings). Always in the path (same as any other required page param)|

**Rule:** changing the scope never changes the page account, and opening an account page never changes the scope.

## URL shape (same for all options)

| Page | URL |
| --- | --- |
| Section, aggregated over the scope | `/proposals`, `/assets`, `/members`, `/transactions`, `/overview`, `/todos` |
| Account page | `/dao/{network}/{address}/proposals/{pluginAddress}/{proposalSlug}`, `/safe/{network}/{address}/members` |
| Workspace page | `/workspace/{workspaceId}/settings` (the workspace is the subject, so it stays in the path) |

- A page account that is not in the workspace renders normally; the banner offers to add it (as external accounts
  do today).

The options below differ only in **where `ws` and `scope` live**.

## Options

### A. Query params

`/proposals?ws={workspaceId}&scope={accountId}`. Missing params mean "My workspace" and "All accounts".

- The URL is the full state: shareable, bookmarkable, back/forward restores the selection, each tab is independent.
- The server sees `scope` (if the selector navigates through the router, not `history.replaceState`).
- Every internal link must carry both params. A link that forgets them (e.g. a shared DAO component building
  `/dao/…` URLs) silently resets the selection. This is the reason `?account=` was rejected in v1. Mitigation: build
  every link through one helper.

### B. `localStorage` only

`/proposals`. The last used workspace and scope are stored on the device.

- No link can lose the selection, and URLs stay clean.
- The selection cannot be shared or bookmarked, back/forward does not restore it, and tabs overwrite each other.
- The server never sees the scope, so nothing scope-dependent can be prefetched.

### C. Query params, stored fallback

As A, but missing params fall back to the last used selection (from `localStorage`), then to the defaults. The page
then writes the resolved params into the URL (`router.replace`).

- Everything A gives, and a forgotten param falls back to the last selection instead of resetting it.
- A URL without params can open differently for different users. It only happens before the params are written in.
- Two places to read the selection from, but `localStorage` is only read when the URL has no params, never synced.
- Variation of this approach would be to extend workspace data model to define default workspace and account/scope

### Comparison

| | A | B | C |
| --- | --- | --- | --- |
| Shareable / bookmarkable selection | yes | no | yes |
| Back/forward restores selection | yes | no | yes |
| Independent tabs | yes | no | yes |
| A link without params | resets to defaults | keeps the selection | keeps the last selection |
| Server sees the scope | yes | no | after params are written in |


## Open questions

1. **Account type in account URLs.** Keep `/dao/…` and `/safe/…`, or use one `/{network}/{address}/…`?
   - Keep: existing `/dao/…` links and SEO keep working, and the route picks the layout without a lookup.
     A `/safe/…` URL with a DAO address must be redirected or rejected.
   - Drop: one route tree. The type comes from `POST /v2/workspaces/query/accounts` (one request per server render,
     already paid today by `LayoutWorkspaceAccount`); `/dao/…` redirects.
2. **Existing DAO pages.** `/dao/{network}/{address}/…` is also the current DAO page. Does the workspace layout
   replace it, or is the layout picked by the workspace feature flag?
3. **Scope values.** One account, or several (`scope=a,b`)?
4. **ENS** in account URLs (carried over from v1).

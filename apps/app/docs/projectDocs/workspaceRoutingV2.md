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
| Scope (`scope`) | The account selector's value: one account ID (`{network}-{address}`), or none for "All accounts". It may name an account outside `ws`: the selector shows it as an external option and the banner offers to add it |
| Page account | The account an entity page shows (proposal, member, settings). Always in the path (same as any other required page param)|

**Rule:** changing the scope never changes the page account, and opening an account page never changes the scope.

## URL shape (same for all options)

| Page | URL |
| --- | --- |
| Section, aggregated over the scope | `/proposals`, `/assets`, `/members`, `/transactions`, `/overview`, `/todos` |
| Account page | `/account/{network}/{address}/proposals/{pluginAddress}/{proposalSlug}`, `/account/{network}/{address}/settings` |
| Account section (redirect only) | `/account/{network}/{address}/proposals` → `/proposals?scope={network}-{address}`, `/account/{network}/{address}` → `/overview?scope=…` |
| Workspace page | `/workspace/{workspaceId}/settings` (the workspace is the subject, so it stays in the path) |

- **Note:** legacy routes (`/`, `/dao/…`, `/safe/…`) must stay unchanged for now. Account routes are prefixed with
  `/account/` (see open question 6); section routes are static names no legacy route uses, so they stay at the root.
- The current `/workspace/{workspaceId}/…` routes are removed without redirects. They sit behind the workspace
  feature flag, which has never been on in production.
- A page account that is not in the workspace renders normally; the banner offers to add it (as external accounts
  do today).

The options below differ only in **where `ws` and `scope` live**.

## Options

### A. Query params (chosen)

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
- Variation of this approach would be to extend workspace data model to define default workspace and account/scope.

### Comparison

| | A | B | C |
| --- | --- | --- | --- |
| Shareable / bookmarkable selection | yes | no | yes |
| Back/forward restores selection | yes | no | yes |
| Independent tabs | yes | no | yes, with the per-tab fallback below |
| A link without params | resets to defaults | keeps the selection | keeps the last selection |
| Server sees the scope | yes | no | after params are written in |

### Multiple tabs

- **A.** Each tab keeps its selection in its URL. Changing it in one tab never affects another. A new tab opened
  without params starts at the defaults.
- **B.** All tabs share one value; the last write wins. Read on load: other tabs jump to that selection on their next
  navigation. Synced via the `storage` event: all tabs switch together, even mid-wizard. `sessionStorage` instead:
  tabs are independent, but a new tab starts at the defaults.
- **C.** Open tabs behave like A. A URL without params reads `localStorage`, i.e. the selection of whichever tab
  wrote last, so a link that forgets the params can move a tab to another tab's selection. Fix: fall back to the
  tab's own selection first (`sessionStorage`), then to the device's last selection (`localStorage`), then to the
  defaults.
- **Default workspace and scope in the workspace data** (C's variation): no per-tab state, behaves like A's defaults.

## Decision

**Option A (query params).** `ws` and `scope` live in the URL only; missing or invalid params mean "My workspace" and
"All accounts". All internal links are built through one helper so they carry both params.

## Open questions

1. **Account type in account URLs.** Keep `/dao/…` and `/safe/…`, or use one `/{network}/{address}/…`?
   - Keep: the route picks the layout without a lookup, and mirrors the legacy `/dao/…` shape.
     A `/safe/…` URL with a DAO address must be redirected or rejected.
   - Drop: one route tree. The type comes from `POST /v2/workspaces/query/accounts` (one request per server render,
     already paid today by `LayoutWorkspaceAccount`).
   - DECISION: Drop the account type, long term we want to abstract away account-type specifics. Each page would need to resolve account type and to validate it, and to decide if given page is supported for the given type.
2. **ENS** in account URLs (carried over from v1).
   - DECISION: we won't consider it for now, not needed for the first version.
3. What if given param, `ws` or `scope` is not valid?
   - Invalid means either malformed or "not found"
   - For `scope`, "not found" means the account does not exist. An account outside `ws` is valid (external option).
   - DECISION: we should remove such a param so that it falls back to default case
4. What happens if someone opens an account-specific page link with a different account filter in the query param?
   - User would see an account-specific page and the account selector would still show account specified by the `scope` param
   - This could happen only if someone manually constructs the URL, so we don't care too much about this corner case
5. Do we even need `scope` query param? (if you want to see specific accounts then you have the page route with accounts in it)
   - See **One segment, two jobs.** section from the Context section above (we wouldn't be able to see an account specific page with "All accounts" selected)
6. A `/{network}/{address}/…` route at the root catches everything. Static routes like `/proposals` still win, but any unknown path would hit that route, which then has to check the network and return a 404. The legacy-prefix note already says the routes need a prefix. Something like `/account/{network}/{address}/…` would solve both problems.
   - DECISION: `/account/{network}/{address}/…`.
7. `/members?scope=A` and `/account/{network}/{address}/members` show the same data.
   - Say when each one is used, e.g. the selector only sets scope and never navigates to account pages.
   - Removing `scope` (the selector navigates to account routes) was considered and rejected: the selector would be
     read from the path, which brings back **One segment, two jobs.** and closes the door to a multi-account scope.
   - DECISION: one canonical URL per view. Account section URLs only redirect:
     - `/account/{network}/{address}/{section}` → `/{section}?scope={network}-{address}`, and
       `/account/{network}/{address}` → `/overview?scope=…`. The section page renders the account-specific view when
       `scope` is set (e.g. plugin members).
     - Real account pages are only entity pages (proposal, member) and account-only pages (settings, permissions).
     - Internal links are built canonical by the link helper and never hit the redirect; it serves typed, shared and
       external links only.
     - An incoming `ws` is carried over; without one, none is added ("My workspace").
     - An invalid account in the path is a 404, not a fallback (unlike the `ws` and `scope` params in Q3): the page
       account is a required path param.
     - Temporary redirect (307, Next.js `redirect()`), so the canonical form can still change.

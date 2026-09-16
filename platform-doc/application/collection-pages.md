---
type: reference
title: Collection pages
tags: [presentation, cross-cutting]
status: draft
source: product-owner briefing, 2026-07-28 (transactions and datalist pages) + codebase verification at app@122f1bd1 (2026-08-06, see log.md) + product-owner ruling (2026-08-07, see log.md) + app source verification (2026-08-05, app@122f1bd1; see log.md) + @aragon/app@1.39.0 tagged-source reconciliation (2026-09-10, see log.md); user-facing behavior split from design/datalist-page.md, design/alert-severity.md, and design/reach-out-to-the-team.md in the product/internal content separation (2026-09-10, see log.md); consolidated source provenance in log.md (page-overlap consolidation, 2026-09-13)
---

# Collection pages

An [account](../accounts/account.md)'s Proposals, Members, Transactions, and Assets pages are its collection pages: each uses the shared datalist pattern to browse one collection while keeping related context in view. Below the site navigation, every one of them places the list on the left and a contextual aside on the right for details and controls that belong to the list; for a token-based body, the [token panel](../governance/token-panel.md) sits in the Members aside.

## Tabs

Each page defines its own tabs for the distinctions that matter to its collection:

- [Transactions](../treasury/transactions.md) separates all activity, executions, deposits, and withdrawals.
- [Proposals](../governance/proposal.md) separates proposals by governance process.
- Members separates members by [body](../governance/body.md).
- [Assets](../treasury/assets.md) separates holdings by account when [linked accounts](../accounts/linked-account.md) are present.

A tab control with nothing to choose between disappears. A page's tabs are a toggle-style switcher or a chip row: a switcher with one option shows its content bare, and a chip row appears only when there are at least two real options, an always-present **All** chip not counting toward that. In an aside panel, a set that would hold exactly one tab collapses and that tab's label becomes the card's title; a set with no options removes the panel entirely.

### Selection in the URL

Selecting a tab, chip, or switcher option writes the selection into the page's URL at once, so reloading the page or opening a shared link reproduces it. The app uses the same mechanism to hand a selection from one page to another: a link out of the [dashboard](../accounts/dashboard.md) arrives at the collection page with the same governance body already selected. The selection replaces the current address instead of adding a history entry, so **Back** leaves the page rather than stepping back through selections, and the app clears the selection when the user navigates away, so returning starts from the page's default. An unrecognized value falls back to the first valid option.

## Loading

Three loading states are kept apart. On a first load, before anything has arrived, the list region shows placeholder rows. When a settled list is fetched again, the rows already on screen stay put. When the next batch of results is on its way, the list shows that it is loading more, and this takes precedence over the other two: a list fetching more is never presented as loading from scratch.

Lists grow by loading more, never by numbered pages: the next batch is appended to what is already on screen. Each page has its own batch size, which is also the number of placeholder rows its first load shows. Proposals load ten at a time, members eighteen, and transactions and assets twenty each.

## Empty results and filters

A list is empty when it is settled and rendered no rows. Narrowing by tab or chip is a view of the collection rather than a search, so a selection that matches nothing shows the collection's ordinary empty copy: a filtered-to-nothing result looks the same as a genuinely empty collection, and the visible selection supplies the context the copy leaves out.

## Sorting and search

None of the four pages offers a sort control: each collection arrives in one fixed order the page does not offer to change. The [Members page](../governance/body.md#member-list-order) orders its list by voting power with contextual pins. None of the four pages offers a search box either. Search exists on two other surfaces: the asset-selection picker used when composing a transfer, and the [Explore page](./explore-page.md)'s account search. Both absences are deliberate product choices. Free-text search on the surfaces that offer it lives only while that surface is on screen.

## Failures

A failure and an empty result differ in scope. When a page, or a piece of data the page requires, cannot load, the app's failure surface replaces the whole page. When a list is validly empty, only the list region is replaced; the page title, the tabs, the aside, and any create control stay in place and the page still behaves like itself.

A page failure draws one distinction. **Not found** means the thing asked for is gone: a genuinely missing record, or a stale link to an account whose [plugin](../governance/plugin.md) has since been removed. Everything else, server and network failures included, is **generic**. A generic failure offers a way out of the page and a **Report issue** action that leads to Aragon's support portal; a not-found offers only the way out. Neither offers an in-place retry, and the app does not retry failed reads automatically, so a transient failure becomes visible on the first attempt. A failed list stays within the list region and draws no distinction at all: it shows a heading and a description and nothing else. In-place retry exists only when [submitting a transaction](./submitting-a-transaction.md).

For help beyond a failed page, see [Getting help](./getting-help.md).

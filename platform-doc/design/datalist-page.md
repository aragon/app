---
type: pattern
title: Datalist page
tags: [design, interaction, data]
status: draft
source: product-owner briefing, 2026-07-28 (transactions and datalist pages) + codebase verification at app@122f1bd1 (2026-08-06, see log.md) + product-owner ruling (2026-08-07, see log.md)
---

# Datalist page

A datalist page is the platform's reusable page type for browsing a collection while keeping related context in view. The proposals, members, transactions, and assets pages are all datalist pages.

The page sits below the site's navigation and uses the same overall structure:

- the datalist on the left;
- a contextual aside on the right — also referred to as the right-hand aside or side panel — for details and additional components relevant to the list.

## Page-defined tabs

Each datalist page defines an opinionated set of tabs for the distinctions that matter to that collection. The tabs are part of the page's product model, not one universal partition copied across every datalist:

- [Transactions](../treasury/transactions.md) separates all activity, executions, deposits, and withdrawals.
- [Proposals](../governance/proposal.md) separates proposals by governance process.
- [Assets](../treasury/assets.md) can separate holdings by account when linked accounts are present.

## The states a list passes through

The component library owns the vocabulary of list states and what each one renders; the app decides which state a list is in by reading the status of the request behind it. Three of those states are about loading, and the product keeps them apart:

- **First load** — nothing has arrived yet, so the list region shows placeholder rows in place of content.
- **Refreshing** — a settled list is being fetched again, and the rows already on screen stay put.
- **Loading more** — the next page is on its way. This takes precedence over the other two, so a list fetching more is never presented as loading from scratch.

The remaining states are settled and failed. Two distinctions a reader might expect are not drawn:

- **Empty is not a state.** A list is empty when it is settled and rendered no rows — the component library derives emptiness from the state plus the number of items, so an empty collection and a populated one are in the same state.
- **A filter that excludes everything reads as having no data.** Narrowing by tab or chip leaves a list in its ordinary settled state, so a filter that matches nothing shows the collection's ordinary empty copy, and a filtered-to-nothing result is indistinguishable from a genuinely empty collection. The product owner confirmed this presentation as intended: tab and chip narrowing is a view of the collection rather than a search, and the visible selection supplies the context the copy leaves out. The component library's separate filtered-to-nothing state, with its own copy and illustration, is opinionated toward search-style filtering — which no datalist page offers — so it stays deliberately unconnected until real search reaches these pages.

## Failure and the empty list

A failed read gets exactly one distinction, and the app draws it on page surfaces: **not found** or **generic**. Not found means the thing being asked for is gone — a genuinely missing record, or a stale link to an account whose [plugin](../governance/plugin.md) has since been removed. Everything else, a server or network failure included, is generic. A failed list draws no such distinction: whatever the cause, the list region shows one failed presentation.

What separates a failure from an empty result is scope. A page failure, or a required piece of data that cannot be loaded, **replaces the page** with the app's failure surface: the user is left with the failure and its way out. A valid empty result **replaces only the list region** — a component-library presentation — so the page title, the tabs, the aside, and any create control all remain and the page still behaves like itself.

Recovery on these read surfaces is leaving the page or contacting support: a generic failure offers both, a not-found offers only the way out, and neither offers a retry. A failed list is the least actionable state in the set — the component library provides action slots on it and the app leaves them empty, so a failed list is a heading and a description and nothing else. The app also switches the data layer's automatic retries off across the product; three automatic retries is that layer's own default, so this is the app's decision rather than something inherited. A transient failure becomes a visible failure state on the first attempt instead of being quietly re-attempted. In-place retry belongs to [submitting a transaction](./transaction-submission.md), not to reading a collection.

## Ordering and search

The component library ships a working sort control and a search input. The four collection pages wire neither, and that is a standing product choice rather than an absent feature. The two declines are not equally absolute:

- **Sort is declined outright.** No surface in the product renders the sort control, so ordering is never the user's choice: each collection arrives in one order the page does not offer to change. The one collection whose fixed order is worth stating is the members list, and [token panel](../governance/token-panel.md) owns it.
- **Search is declined on the pages.** None of the four collection pages offers a search box. The decline speaks only for these pages: the app enables the library's search input inside the asset-selection picker, and the [explore page](../accounts/explore-page.md) has an account search of its own — neither is a datalist page.

## Loading more

Lists grow by loading more, never by numbered pages — appending the next page to what is already on screen is the only pagination the component library offers. Each page chooses its own batch size, and that number is at once the batch the page requests, the number of placeholder rows the first load shows, and the step by which the list grows. Proposals load ten at a time, members eighteen, and transactions and assets twenty each.

## Tab chrome

Tabs disappear when there is nothing to choose between. The component library collapses a tab bar that would hold exactly one tab: the bar is not rendered, and its content shows bare. The threshold is exactly one, so a set that comes out with no tabs at all is not that rule's case — the app handles it separately. Three nearby rules look like that collapse and are the app's own:

- **No options at all removes the surface.** A panel whose tab set comes out empty is not rendered, rather than left as an empty bar.
- **A lone tab's label becomes the card title.** The collapsed tab's identity is not lost; it moves into the header of the card that held the tabs, in place of what that header would otherwise say.
- **The controls that actually carry a datalist page's tabs collapse on the app's own threshold.** A datalist page's tabs are always a toggle-style switcher or a chip row — the true tab bar appears only in aside panels, which is where the two rules above apply. A switcher with one option renders its content bare, and a chip row appears only when there are at least two real options to choose between — an always-present "all" chip does not count toward that.

## What a tab or filter selection persists

A tab, chip, or switcher selection is part of the page's address. Choosing one updates the URL at once, so reloading the page or opening a shared link reproduces it; the app relies on this to hand a selection from one page to another, so a link out of an [account's overview](../accounts/dashboard.md) arrives at the collection page with the same governance body already selected. Two limits follow:

- **It is not history.** The selection is written over the current address rather than pushed onto it, so Back leaves the page instead of stepping back through selections.
- **It does not survive leaving.** The app clears the parameter when the user navigates away, so returning starts from the page's default. A selection that is not really a choice — a switcher collapsed to one option — writes nothing at all, and an unrecognized value falls back to the first valid option rather than failing.

Free-text search, on the surfaces that offer it, is never persisted: it lives only while the surface is on screen. None of this belongs to the component library, whose controls have no notion of the URL; the persistence, the clearing, and the fallback are all the app's.

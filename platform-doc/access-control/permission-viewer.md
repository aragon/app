---
type: capability
title: Permission Viewer
tags: [access-control, permissions]
status: draft
source: product-owner Permission Viewer launch briefing (2026-08-28, see log.md) + app@16d34dc3 + app-backend@107103b4 + @aragon/app@1.38.0 tagged-source reconciliation (2026-09-09, see log.md) + @aragon/app@1.39.0 tagged-source reconciliation (2026-09-10, see log.md) + live application-page coverage at app@adad67873c8f9dd75e3ed340b70df3e985ae3557 (2026-09-13, see log.md)
---

# Permission Viewer

Permission Viewer is a read-only page, available for every Aragon account supported in the app, that displays the OSx permission records the platform index currently returns as active for the selected account. It lets anyone inspect who holds each permission, where it applies, and whether a condition is attached and, when recognized, how it is configured, without changing the account's permission configuration.

## One account's indexed permission table

An Aragon [account's](../accounts/account.md) `DAO` contract is its shared OSx permission manager. The underlying [OSx permission system](../protocol-doc/core/permissions.md) resolves one `(where, who, permissionId)` query at a time; it does not expose one query that enumerates every stored permission. The platform backend makes the table enumerable for the app by indexing the account's `Granted` and `Revoked` events. For each indexed tuple, the API returns a row only when its latest indexed event is `Granted`; a latest `Revoked` event suppresses the row. The viewer does not expose the underlying event history.

The page shows one selected account at a time. When the app exposes [linked accounts](../accounts/linked-account.md) alongside it, an account selector changes which permission table the page displays; it does not merge their records. Within the selected table, an address remains visible even when the app does not recognize it as a known [plugin](../governance/plugin.md) or other named entity.

Here, **all permissions** means the records the platform index currently returns as active for that account. It does not include roles the account or another address may hold in external contracts. Permission IDs name capabilities; a grant becomes target-selector-scoped only when a condition such as the [execute selector condition](../protocol-doc/helpers/condition-library/execute-selector-condition.md) supplies that restriction. The general [permission-condition](../protocol-doc/common/permission-conditions.md) model supports other runtime rules.

## Permissions page

The viewer is available from the account navigation, dashboard, and Settings. In the account navigation, **Permissions** sits below **Transactions** and above **Settings**. The default URL state opens in the list view; URL parameters can preserve another view and filter state.

- **List** — every filtered row shows the permission holder (`who`), the contract where it applies (`where`), the resolved permission name or a truncated ID when the name is unknown, and the condition. Desktop details expand to expose addresses, the full permission ID, and recognized-condition configuration; mobile cards show permission details inline and offer a Condition tab. An unrecognized condition remains visible by its address.
- **Graph** — entity nodes represent actors and targets, while permission pills between them represent individual records. Selecting a node or permission pill opens its details, and the canvas supports pan, zoom, fit-to-view, and full-screen inspection. Account actors enriched by the backend remain account nodes instead of degrading to unknown addresses. The graph omits records whose `who` or `where` the app identifies as a condition contract; attached conditions remain visible on permission pills, so the list remains the complete filtered view. The graph can make relationships between actors, [governance processes](../governance/process.md), and the account easier to trace without changing their underlying meaning.

The default URL state enables **Hide permissions granted to DAO** and **Hide subplugin permissions**. The first hides records whose `who` is the selected account; the second hides records whose `where` the app identifies as a subplugin. Each filter removes its own category without changing the fetched permission set, and a record that matches both remains hidden until both filters are off. When every fetched record matches both categories, both switches are disabled in the default state, so the views can appear empty even though indexed records exist.

## Condition details

The viewer selects a detail presenter from the condition type the app recognizes:

- **Voting power** shows the token and minimum voting power.
- **Execute selector** shows allowed contract targets and functions, retaining an unknown-contract fallback when the target has no friendly identity.
- **Membership** shows whether [membership](../governance/member.md#membership-and-participation) in a correlated Aragon Multisig is required and the minimum approvals when the condition supplies one. The current backend only assigns this friendly type after matching the condition to an indexed Multisig plugin; a standalone Safe-owner condition falls back to the unrecognized-condition address view.
- **SPP rule** first tries to correlate the condition with a known staged process and, when it can, reuses the friendly proposal-creation eligibility list. Otherwise it shows normalized rules, including the rule type, operator, and value; nested rules can expose a permission ID, condition address, or rule indexes as appropriate.
- An unrecognized condition remains inspectable by address, while an unconditional grant has no condition configuration to present.

These are readable views of indexed configuration. They do not evaluate the condition for a proposed call.

## Inspection jobs

A counterparty performing due diligence can use the viewer to inspect the selected account's indexed OSx grants and attached conditions. Members and security researchers can review the same records when evaluating that account's configured authority.

Builders and operators can use it as a self-audit after configuring or changing an account. The account-wide view complements the process-specific authorized-action view described by [scoped authority](./scoped-authority.md), while [OSx authorization paths](./osx-authorization-paths.md) provides the model for tracing a particular call.

## Interpretation boundary

Permission Viewer is a neutral visualization. It does not label a configuration safe or unsafe, issue warnings, or certify that the intended separation of powers holds. It also cannot determine whether an arbitrary call would succeed: a condition may evaluate the caller, call data, and current contract state, and downstream contracts apply their own authorization rules.

The permission table is fetched from the platform backend's event-derived view and does not call `hasPermission` on initial load. Some recognized condition details can perform ancillary read or simulation calls, but those calls neither change nor define the indexed record. Indexing is asynchronous, so the view can lag the chain and exposes no indexed block or finality marker. It reports indexed configuration for an app-supported account, not a block-specific authorization verdict. Granting, revoking, or conditioning permissions remains a governed configuration action outside the viewer.

When the selected account is a linked account on another network, some detail presenters retain the primary account's DAO or network context. The indexed permission rows still come from the selected account, but an explorer link or recognized-condition read can use the wrong context. Verify those details directly against the selected account's network.

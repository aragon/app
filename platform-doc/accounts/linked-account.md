---
type: concept
title: Linked account
tags: [accounts, semantics]
status: draft
source: product-owner linked-accounts briefing (2026-07-21, see log.md) + product-owner marketing-briefs drop and app/app-backend verification (2026-08-03, see log.md) + data-view verification at app@adad67873c8f9dd75e3ed340b70df3e985ae3557 and app-backend@107103b4cc9d8f778c78e09c7265f9a4ead89d6e (2026-09-13, backend source snapshot; API-version limits in log.md); consolidated source provenance in log.md (page-overlap consolidation, 2026-09-13)
---

# Linked account

A **linked account** is an [account](./account.md) presented alongside a **primary account** in one account instance in the app. An organization can link any number of accounts, for example to present accounts it runs as sub-DAOs. There is no native onchain concept of a linked account; the app recognizes the relationship from onchain [signals](#establishing-the-relationship) and renders it.

The hierarchy is **one level and flat**: a primary account can have any number of linked accounts, but the app does not represent further nesting, so the visible hierarchy never goes deeper than primary → linked.

Purpose-specific accounts let an organization **earmark funds in its onchain financial state** instead of maintaining the distinction only through off-chain accounting. Moving assets into an operations, rewards, grants, or other purpose-specific account makes their intended use legible from where they live, while linking preserves one governance and treasury experience. That explicit allocation simplifies downstream onchain and off-chain processes.

Linking is presentation only: the relationship confers no control over a linked account ([linking does not imply control](#linking-does-not-imply-control)).

## Linking does not imply control

The term "linked" is deliberate: it describes a display relationship without prescribing a parent–child control hierarchy or other onchain behavior. The [acknowledgement signal](#establishing-the-relationship) carries no authority.

The product is flexible about *rendering* valid setups but does not *prescribe* a hierarchy. Control between accounts is an OSx [permission](../protocol-doc/core/permissions.md) configuration — highly opinionated and project-specific — so baking control into the act of linking would impose one project's choice on everyone and make unsafe or broken configurations easy to create. The app instead renders whatever valid permission setup exists and leaves the choice of control to the project.

### Configuring actual control (separately)

A project that wants control configures OSx permissions directly. A grant answers one concrete question about one guarded function and caller; causing a final state transition can require several successful calls and checks ([authorization and execution model](../access-control/authorization-and-execution.md)).

- **Execute** — granting a linked account's [Execute permission](../protocol-doc/core/execution.md) to the primary lets the primary execute on the linked account (e.g. withdraw its assets). This runs as **nested execution**: the primary account calls the linked account's `execute`, which authorizes the primary as its caller; the linked account then calls the inner action targets as itself. [`execute` cannot re-enter itself](../protocol-doc/core/execution.md#the-execute-function). This is the route [executing on a linked account](./executing-on-a-linked-account.md) relies on.
- **Root, for true ownership.** Execute alone is not ownership: [Root](../protocol-doc/core/permissions.md#root-the-permission-to-manage-permissions) controls permission changes, so a linked account that keeps Root could simply revoke the primary's Execute. True ownership therefore also grants Root to the primary and revokes it from the linked account.

### Inspecting control permissions

Use [Permission Viewer](../access-control/permission-viewer.md) to inspect a selected linked account’s indexed OSx grants and attached conditions. Its table can show an Execute grant to the primary account, independently of the display relationship. The viewer reports indexed configuration; it does not determine whether a particular call will succeed. For a linked account on another network, verify detail links and condition reads against that network because some presenters retain the primary account’s context.

## How linked-account data surfaces

The app folds linked accounts into the primary's experience rather than giving them a separate hierarchy. It takes three shapes, chosen by what a surface is already organized around:

- **Aggregated.** The [default dashboard header](./dashboard.md#header) combines the primary and linked accounts' treasury values. Its proposal and member counts remain scoped to the primary account.
- **Merged into an existing partition, flat.** Where a list is already partitioned some other way, linked-account items are added into it without a new hierarchy level:
  - The [proposals](../governance/proposal.md) list has an aggregate view across active processes on the primary and linked accounts, then stays partitioned by proposal type (per [process](../governance/process.md)); a linked-account process gets a process tab like any other.
  - The [**members** list](../governance/body.md#members-page) stays partitioned by [body](../governance/body.md). Bodies on linked accounts join that same flat set of body tabs, and selecting one reads that linked account's members.
- **Selectable by account.** [Assets](../treasury/assets.md) and [Transactions](../treasury/transactions.md) start with a combined view and offer account selection to inspect the primary or a linked account individually.

When proposal creation uses a process installed on a linked account, the app resolves that account as the target and applies the normal [authorized-actions filtering](../application/action-builder.md#filtering-to-allowed-actions). Linking introduces no separate action-filtering mechanism.

Two further surfaces:

- The **settings page** lists the account hierarchy using each linked account's own name and description from its account metadata; the relationship has no separate alias or description.
- [Processes](../governance/process.md) and [bodies](../governance/body.md) show an **indicator** when they belong to a linked account.

## Establishing the relationship

There is currently no in-app flow for creating the relationship. Teams can configure it themselves by using governance proposals to grant the two acknowledgement permissions, but the setup is mildly technical and an incorrect configuration could be unsafe or broken. Current product onboarding is therefore team-assisted: contact Aragon to get a linked-account relationship set up.

The app uses chain state as the source of truth: the relationship is recorded onchain — keeping it out of [App CMS](../application/app-cms.md) is deliberate — and the app reads it back as a **signal**.

The relationship is established by **two [permission](../protocol-doc/core/permissions.md) grants, one in each direction** between the primary DAO and the linked DAO. They are **mutual acknowledgement**: the primary acknowledges the linked account, and the linked account acknowledges the primary. Requiring both sides prevents an unsolicited association claim — neither account can make itself appear in another account's hierarchy on its own. The app indexes those grant events and renders the accounts as linked.

The implementation assigns a distinct permission ID to each acknowledgement direction. The 64-digit digests below take the conventional `0x` prefix in their runtime hex representation:

- **Parent to sub-DAO:** `PARENT_TO_SUB_DAO_ACKNOWLEDGEMENT_PERMISSION_ID` = `8f767fcd3e8467cff6f203f5f950919a5f5a609eed15fd2968945d1c8bcfc238`
- **Sub-DAO to parent:** `SUB_DAO_TO_PARENT_ACKNOWLEDGEMENT_PERMISSION_ID` = `2e04e7111254c4c89c4e585e940a0238d7765c35f8c13549c8abf2614e9d2083`

**Both grants must be active before the relationship can surface.** A lone grant remains pending. Once the counterpart is active and the pair passes the backend's account-existence and flat-hierarchy constraints, the backend writes the linked account onto the parent and the parent onto the linked account. Revoking either acknowledgement removes both sides of that indexed relationship. When the linked-account feature is enabled, the frontend does not inspect the permission IDs itself — it renders from the relationship returned by the backend.

### Permissions repurposed as signals

Ordinarily a DAO's permissions authorize callers — a plugin gates a function with the [`auth`](../protocol-doc/common/auth.md) modifier, which resolves against the DAO's [permission manager](../protocol-doc/core/permissions.md). The two linking permissions are different: **no guarded function checks them.** A state-changing acknowledgement grant emits the onchain event the app indexes; redundantly granting an already-active permission is a silent no-op. The permission database is a public, queryable fact, and here that fact is repurposed as a signal rather than an authorization rule. No governor approves an action and no account executes because of either acknowledgement grant ([authorization and execution model](../access-control/authorization-and-execution.md)).

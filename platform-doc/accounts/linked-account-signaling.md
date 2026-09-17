---
type: concept
title: Linked-account signaling
tags: [accounts, access-control, semantics]
status: draft
source: product-owner linked-accounts briefing (2026-07-21, see log.md) + product-owner principles review (2026-07-29, see log.md) + product-owner briefings and app-backend linking-path verification (2026-08-03, see log.md) + product-owner authorization-model review (2026-08-04, see log.md)
---

# Linked-account signaling

How a [linked-account](./linked-account.md) relationship exists on-chain. The app [serves the chain](../principles.md): the relationship is recorded on-chain — keeping it out of [App CMS](../app-cms.md) is deliberate — and the app reads it back as a **signal**.

The relationship is established by **two [permission](../protocol-doc/core/permissions.md) grants, one in each direction** between the primary DAO and the linked DAO. They are **mutual acknowledgement**: the primary acknowledges the linked account, and the linked account acknowledges the primary. Requiring both sides prevents an unsolicited association claim — neither account can make itself appear in another account's hierarchy on its own. The app indexes those grant events and renders the accounts as linked.

The implementation assigns a distinct permission ID to each acknowledgement direction. These are the 64-digit digests supplied by the owner; their runtime hex representation carries the conventional `0x` prefix:

- **Parent to sub-DAO:** `PARENT_TO_SUB_DAO_ACKNOWLEDGEMENT_PERMISSION_ID` = `8f767fcd3e8467cff6f203f5f950919a5f5a609eed15fd2968945d1c8bcfc238`
- **Sub-DAO to parent:** `SUB_DAO_TO_PARENT_ACKNOWLEDGEMENT_PERMISSION_ID` = `2e04e7111254c4c89c4e585e940a0238d7765c35f8c13549c8abf2614e9d2083`

**Both grants must be active before the relationship can surface.** A lone grant remains pending. Once the counterpart is active and the pair passes the backend's account-existence and flat-hierarchy constraints, the backend writes the linked account onto the parent and the parent onto the linked account. Revoking either acknowledgement removes both sides of that indexed relationship. When the linked-account feature is enabled, the frontend does not inspect the permission IDs itself — it renders from the relationship returned by the backend.

## Permissions repurposed as signals

Ordinarily a DAO's permissions authorize callers — a plugin gates a function with the [`auth`](../protocol-doc/common/auth.md) modifier, which resolves against the DAO's [permission manager](../protocol-doc/core/permissions.md). The two linking permissions are different: **no guarded function checks them.** A state-changing acknowledgement grant emits the onchain event the app indexes; redundantly granting an already-active permission is a silent no-op. The permission database is a public, queryable fact, and here that fact is repurposed as a signal rather than an authorization rule. No governor approves an action and no account executes because of either acknowledgement grant ([authorization and execution model](../access-control/authorization-and-execution.md)).

This is why linking implies nothing on its own: the signal is an acknowledgement, and any actual control is a separate configuration ([linking does not imply control](./linking-does-not-imply-control.md)).

## No product UI to establish it

There is currently no in-app flow for creating the relationship. Teams can configure it themselves by using governance proposals to grant the two acknowledgement permissions, but the setup is mildly technical and an incorrect configuration could be unsafe or broken. Current product onboarding is therefore team-assisted: contact Aragon to get a linked-account relationship set up.

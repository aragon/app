---
type: capability
title: Aragon Notifications
tags: [governance, proposals, notifications]
status: draft
source: product-owner briefing (2026-08-28) + app source verification at @aragon/app@1.38.0 (2026-09-08) + tagged frontend and backend-source reconciliation + product-owner answers (2026-09-09, see log.md)
---

# Aragon Notifications

**Aragon Notifications** is the product's opt-in Telegram service for following proposal activity on an [account](../accounts/account.md). It gives participants a route from the app into a bot operated by the Aragon team, where they manage subscriptions and receive proposal alerts.

## Subscribing from an account

The [dashboard](../accounts/dashboard.md) and the account's [proposal](./proposal.md) list each offer an Aragon Notifications card. Its action opens Telegram with that account's network-and-address identifier already attached. Subscription management happens in the bot.

A person can subscribe to up to 50 accounts on chains supported by the app and indexed by Aragon. An account can also be supplied to the bot by pasting its network and address. The bot's `/help` command and menu explain the available interactions.

## Proposal alerts

A subscription sends three proposal alerts:

- **Proposal created.** A new proposal is available.
- **Proposal ending soon.** The proposal ends in 24 hours. This timing is the same across governance processes and subscriptions.
- **Proposal executed.** The proposal has executed.

Each account's alerts can be muted and unmuted without removing the subscription.

Timely discovery matters most when inaction has consequences. In [optimistic governance](./optimistic-governance.md), veto holders must learn about a proposal, understand it, and act within the objection window. Notifications reduce the chance that the discovery step depends entirely on repeatedly checking the app; they do not replace review of the proposal, its deadline, or its [actions](../application/action-builder.md).

## Data controls

The service stores only the person's Telegram user ID, the accounts they subscribe to, and whether each subscription is muted. Subscriptions persist until the person removes them. When they unsubscribe from their last account, the service automatically removes their stored record.

The bot also lets a person inspect their stored data and delete all of it. These controls live in Telegram with the rest of the subscription workflow.

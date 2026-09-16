---
type: capability
title: Wallet connection
tags: [accounts, wallet]
status: draft
source: product-owner briefing and app source verification (2026-08-04, app@122f1bd1; see log.md) + gov-ui-kit and app source verification (2026-08-04, see log.md) + interrupted-flows pass at app@122f1bd1 (2026-08-05, see log.md) + codebase verification at app@122f1bd1 (2026-08-06, see log.md); split from accounts/account-creation.md, design/dialog-taxonomy.md, and design/alert-severity.md in the product/internal content separation (2026-09-10, see log.md) + classification verification at app@adad67873c8f9dd75e3ed340b70df3e985ae3557 (2026-09-13, see log.md) + Safe connection verification at app@adad67873c8f9dd75e3ed340b70df3e985ae3557 and locked connector packages (2026-09-13, see log.md) + product-owner editorial feedback (2026-09-13, see log.md)
---

# Wallet connection

Connecting a wallet establishes the address acting in the Aragon app. The app uses that address to show its profile, check its participation rights, and request approval for transactions. What the address can do depends on its membership and permissions in the account being viewed; connecting alone grants no authority over that account.

Browsing [accounts](./explore-page.md) needs no wallet. Connect when you want to create an account, propose, vote, or submit another transaction. A [Safe can also connect](./connecting-a-safe.md), allowing it to act under its own address and approval rules.

## The connection dialog

Choose a wallet through the connection dialog and approve the connection in that wallet. The dialog presents the Terms of Service and Privacy Policy and requires acceptance for connections started there. An embedded Safe App connection can select the Safe automatically without this dialog.

Connection identifies the acting address. Each subsequent transaction still needs approval through the connected wallet's signing flow.

## Dialogs that need a wallet

Transaction dialogs close when the wallet disconnects, because the app no longer has an address available to authorize the action. During automatic reconnection or a connector switch, they are temporarily hidden and resume once an address is connected.

## Connected to the wrong chain

An account's transactions belong to its deployment chain. If the connected wallet is on another chain, the transaction flow requests a switch before signing ([submitting a transaction](./submitting-a-transaction.md#connected-to-the-wrong-chain)).

## Prompts on connection

Connecting deliberately on an account page can reveal participation steps for that address, such as delegating or locking tokens. These help the user put their membership into use; reconnecting silently on page load does not repeat them ([token panel](../governance/token-panel.md#participation-nudges)).

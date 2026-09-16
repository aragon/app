---
type: capability
title: Connecting a Safe
tags: [accounts, transactions]
status: draft
source: product-owner briefing on multisig-gated advancement into Token Voting (2026-07-28, see log.md) + app source verification (2026-08-05, app@122f1bd1; see log.md) + product-owner briefings (2026-09-11, see log.md) + Safe connection verification at app@adad67873c8f9dd75e3ed340b70df3e985ae3557 with locked Reown 1.8.23, wagmi connectors 8.1.0, Safe Apps SDK 9.1.0 and provider 0.18.6; official Safe guidance and public HTTP checks (2026-09-13, see log.md)
---

# Connecting a Safe

Connecting a [Safe](../accounts/safe.md) lets its owners operate the Aragon app **as the Safe**, with the Safe itself as the connected actor.

## How it works

The Safe can connect through either of two routes:

- **Inside Safe:** select the Safe on the required network, then add [Aragon](https://app.aragon.org) through **Apps → Add Custom App**. Safe opens Aragon inside an **iframe**. When Aragon detects that Safe environment, it connects automatically through the Safe Apps connector, which exchanges wallet requests with the surrounding Safe interface. This route needs no WalletConnect pairing code. See Safe's [custom-app instructions](https://help.safe.global/articles/1436723729-add-a-custom-safe-app) and [Safe Apps integration](https://help.safe.global/articles/6872363437-145503-how-to-create-a-safe-app-with-safe-apps-sdk-and-list-it).
- **Through WalletConnect:** open Aragon directly and choose **Connect wallet → WalletConnect**. Copy its pairing code into Safe's WalletConnect control and approve the connection for the selected Safe. The network must be supported by both sides. See Safe's [WalletConnect instructions](https://help.safe.global/articles/6643739210-how-to-connect-a-safe-to-a-dapp-using-walletconnect) and Aragon's [wallet-connection dialog](./wallet-connection.md#the-connection-dialog).

If the embedded app does not connect automatically, use the WalletConnect route from Aragon opened directly. Before submitting an operation, check that the connected address is the intended Safe and that its network matches the operation. Signing requests then follow the Safe's approval flow; connecting does not grant the Safe a role or permission it does not already hold.

## When it's used

Connecting as the Safe is what lets the Safe itself — the account, [not an Aragon multisig](../guides/safe-vs-aragon-multisig.md) — act in Aragon wherever it has a role to play:

- Approving its stage of a staged proposal when the Safe is a governing [body](../governance/body.md) — see [Safe as a body](../governance/safe-as-a-body.md).
- Creating a proposal on a process the Safe holds a direct proposal-creation permission for — see [direct creation grant to a Safe](../governance/multisig-gates.md#direct-creation-grant-to-a-safe).
- Acting as the connected actor on an account the Safe holds Execute permission on — see [executing on a linked account](../accounts/executing-on-a-linked-account.md).

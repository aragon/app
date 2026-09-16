---
type: concept
title: Safe
tags: [accounts, governance, semantics]
source: product-owner briefing on multisig-gated advancement into Token Voting (2026-07-28, see log.md) + product-owner authorization-model review (2026-08-04, see log.md) + product-owner semantic-anchor review + https://docs.safe.global/advanced/smart-account-overview + https://docs.safe.global/advanced/smart-account-concepts (2026-09-10, see log.md)
---

# Safe

A **Safe** is an off-the-shelf smart contract [account](./account.md) with built-in multisignature governance. It is a **governor/account monolith**: one contract performs both [roles](./account.md#account-and-governor-are-distinct-capabilities), checking signer approvals and executing approved transactions.

Its signer set and m-of-n threshold determine when a transaction has enough approvals. Its arbitrary-call entry point then executes the approved transaction as the Safe.

The signers and threshold can change without replacing the Safe's address. This lets the signer group or approval requirement change without moving the Safe's assets or reassigning permissions held by that address.

[Modules can add alternative authorization paths](https://docs.safe.global/advanced/smart-account-overview).

Because a Safe is an account, it can hold permissions on an Aragon account like any other address ([scoped authority](../access-control/scoped-authority.md)). It can also serve as a governing [body](../governance/body.md) in an Aragon process ([Safe as a body](../governance/safe-as-a-body.md)).

To operate the Aragon app as the Safe itself, rather than as one individual signer, see [connecting a Safe](../application/connecting-a-safe.md).

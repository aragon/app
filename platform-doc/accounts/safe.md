---
type: concept
title: Safe
tags: [accounts, governance, semantics]
status: draft
source: product-owner briefing on multisig-gated advancement into Token Voting (2026-07-28, see log.md) + product-owner authorization-model review (2026-08-04, see log.md)
---

# Safe

A **Safe** is an off-the-shelf smart contract [account](./account.md) with multisignature governance built into the same contract. Its signer set and m-of-n threshold resolve the signers' approvals, and its arbitrary-call entry point executes the approved transaction as the Safe. The Safe is therefore both **governor and account**, at one stable address; its signers and threshold can change without replacing that address.

Because a Safe is an account, it can hold permissions on an Aragon account like any other address ([scoped authority](../access-control/scoped-authority.md)). It can also serve as a governing [body](../governance/body.md) in an Aragon process ([Safe as a body](../governance/safe-as-a-body.md)). To operate the Aragon app as the Safe itself, rather than as one individual signer, see [connecting a Safe](./connecting-a-safe.md).

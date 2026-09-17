---
type: capability
title: Connecting a Safe
tags: [accounts, transactions]
status: draft
source: product-owner briefing on multisig-gated advancement into Token Voting (2026-07-28, see log.md) + app source verification (2026-08-05, app@122f1bd1; see log.md)
---

# Connecting a Safe

**User promise:** operate the Aragon app **as a Safe** — so the Safe itself, not just an individual signer, is the connected actor in Aragon.

## How it works

Safe provides an Apps section where its owners add the Aragon app's URL; from there the Safe connects to and uses the Aragon app as the Safe account. The connection uses WalletConnect.

## When it's used

Connecting as the Safe is what lets the Safe itself — the account, [not an Aragon multisig](../guides/safe-vs-aragon-multisig.md) — act in Aragon wherever it has a role to play:

- Approving its stage of a staged proposal when the Safe is a governing [body](../governance/body.md) — see [Safe as a body](../governance/safe-as-a-body.md).
- Creating a proposal on a process the Safe holds a direct proposal-creation permission for — see [stages over direct permission grants](../governance/stages-over-direct-permissions.md).
- Acting as the connected actor on an account the Safe holds Execute permission on — see [executing on a linked account](./executing-on-a-linked-account.md).

## How the product recognizes a Safe

Recognizing an address as a Safe is a separate concern from connecting as one, and it fires elsewhere: in the [governance designer](../governance/governance-designer.md)'s add-body **any address** option, where any address can be registered as an external [body](../governance/body.md). The product does not probe the contract's interface. It fetches the contract's name from a backend contract-metadata lookup, lowercases it, and tests whether it contains any of four fixed substrings — `Safe`, `GnosisSafe`, `Gnosis Safe`, `SafeProxy` (the comparison is case-insensitive on both sides). That is a naming heuristic standing in for a Safe-specific check, so it is fallible in both directions — an [honest-abstraction](../principles/honest-abstraction.md) gap between the product's "is this a Safe" model and on-chain reality.

A genuine Safe deployed under a contract name that doesn't contain any of those substrings goes unrecognized: the add-body field reports "Address type detected" instead of "Safe contract detected," the body gets none of the Safe branding described in [Safe as a body](../governance/safe-as-a-body.md#how-the-app-presents-it), and — concretely — it drops out of the proposal-creation step's list of bodies eligible for create-proposal permission entirely, with no [`SafeOwnerCondition`](../protocol-doc/helpers/condition-library/safe-owner-condition.md) offered for it; there is nothing to toggle even if that was meant to be the Safe's role. Conversely, a non-Safe contract whose name happens to contain one of those substrings (e.g. a vault contract named `SafeVault`) is treated as a Safe: it gets the Safe logo and branding, and becomes eligible for the `SafeOwnerCondition`-gated proposal-creation toggle. Whether that wiring can be published then turns on the contract rather than its name: the condition binds only to a target that answers `isOwner` ([the shape check, not an identity proof](../protocol-doc/helpers/condition-library/safe-owner-condition.md)).

## Open questions

- [ ] What the exact embedded-app mechanism is beyond WalletConnect (an iframe, or something else).

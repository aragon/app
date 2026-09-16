---
type: concept
title: Member
tags: [governance, semantics, membership]
status: draft
source: product-owner Member-page commission and proposal/process–member/body model (2026-09-10, see log.md) + Profiles marketing brief and member-identity verification (2026-08-03–04, previously in accounts/aragon-profiles.md) + app@adad6787 member-details and delegation-section verification (2026-09-10, see log.md) + protocol membership and voting-power references + product-owner Member review (2026-09-10, see log.md) + classification verification at app@adad67873c8f9dd75e3ed340b70df3e985ae3557 (2026-09-13, see log.md) with locked gov-ui-kit@2.11.4 and @tiptap/extension-link@3.30.3 + live application-page coverage at app@adad67873c8f9dd75e3ed340b70df3e985ae3557 (2026-09-13, see log.md)
---

# Member

A **member** is a participant in a [body](./body.md), identified by an address. The body defines the membership rules and how its members' preferences contribute to decisions.

The same address can be a member of several bodies. Its membership and voting power are determined within each body, so it can participate under different rules in each one.

## Membership and participation

An address qualifies as a member according to the body's rules, such as inclusion in a member list, token ownership, or staking. Membership changes as those conditions change. For an Aragon multisig, authorized [membership actions](../application/basic-action-views.md#multisig-membership-and-rules) add or remove addresses from the list.

The body's governance method determines how members express their preferences and how those preferences are counted. A multisig member supplies an approval; a token-voting member casts a vote weighted by the voting power available to that address. Depending on the token, participation can require wrapping, locking, or delegation through the [token panel](./token-panel.md).

Eligibility for a particular decision follows the governance method's timing rules. For example, an Aragon multisig checks approval eligibility against the proposal's membership snapshot, so removing a member affects later proposals while that member can still approve proposals created before removal. [Multisig membership](../protocol-doc/plugins/multisig-plugin/membership.md#two-speed-eligibility) and [token voting power](../protocol-doc/plugins/token-voting-plugin/voting-power.md) describe these rules.

Permission to [create a proposal](./proposal-creation.md) or [execute an approved proposal](./proposal.md#proposal-details-page) follows the process's configuration. It can depend on membership or on a separate authorization rule.

## Identifying a member

The member's address identifies the participant in the body. [Aragon Profiles](../application/aragon-profiles.md) adds the primary ENS name, avatar, description, and links associated with that address. Profile links can include a website, GitHub, Twitter, email, Discord, and Telegram. The same identity can appear across several bodies and accounts, while each body's participation rules remain specific to that membership.

A token-specific [delegate statement](./delegate-profile-record.md) extends Aragon Profiles with context for delegation. A readable statement appears for the relevant token, and the connected holder of the member address can create or edit it. Inline links display the statement author’s chosen text. The app provides no destination preview on focus or tap; inspecting those destinations before navigation depends on the browser’s link controls. General profile records are managed through [profile editing](../application/aragon-profiles.md#editing).

## Member page

The **Member page** brings together a participant's identity and governance activity in an account. The [Members page](./body.md#members-page) provides the list of members grouped by body; an individual member's page shows their participation and profile.

The Member page supplements that profile with voting power, token balance, and the number of delegations received, grouped by visible token bodies that support delegation, including bodies from linked accounts. When Ethereum Follow Protocol returns data, it adds follower and following counts and a link to the participant's EFP profile.

The page includes voting activity, proposals created by the address, and other accounts where it is a member. Its details show the address, resolved ENS identity, and first and latest recorded activity when available.

For a body with delegation support and the required token information, the page offers delegation to this member. On the connected holder's own page, or when that holder already delegates to the member, **Manage delegation** opens the delegation flow without preselecting a new recipient. These controls use the selected body's token; [the token panel](./token-panel.md#available-controls) explains delegation and its effect on voting power.

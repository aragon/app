---
type: concept
title: Body
tags: [governance, semantics]
status: draft
source: aragon-knowledge-base/product/concepts/process-vs-body.md (product-owner Q&A, 2026-07-06) + product-owner briefing (2026-07-28, multisig gates) + product-owner principles review (2026-07-29, see log.md) + product-owner release-notes briefing (2026-08-03, see log.md) + product-owner briefings (2026-08-04, see log.md) + product-owner structural-review preparation (2026-09-10, see log.md) + product-owner Body review (2026-09-10, see log.md) + live application-page coverage at app@adad67873c8f9dd75e3ed340b70df3e985ae3557 (2026-09-13, see log.md); relocated section provenance in log.md (section-audit observations, 2026-09-13) (2026-09-13; no fresh source verification)
---

# Body

A **body** is a set of [members](./member.md) who supply preferences to a governance decision. Its [governor](../access-control/authorization-and-execution.md) records those preferences and applies the voting or approval method.

## Membership

Membership can be defined in different ways, such as an explicit list of member addresses, token ownership, or staking. The body's membership rules determine who can participate.

### Members page

In the app, the **members list is partitioned by body**. The Members page presents the members of the selected body. Bodies from [linked accounts](../accounts/linked-account.md) join the same set of body tabs, with an indicator showing which account they belong to; selecting a body displays its members.

An individual [Member page](./member.md#member-page) shows the participant's identity and governance activity.

The aside describes the selected body and its governance settings. For a token-based body, its available [token-panel controls](./token-panel.md#available-controls) let a connected holder prepare voting power or manage delegation while browsing members.

[Featured delegates](../application/app-cms.md#five-established-uses) help users discover participants. When a non-empty featured-delegate configuration matches a Token Voting body, the Members page adds the featured list as its first, default tab, and the dashboard replaces its ordinary Members section with that list.

A Safe serving as a governing body appears in the process and proposal experience. The Safe body is omitted from the Members page ([Safe presentation](./safe-as-a-body.md#how-the-app-presents-it)).

#### Member-list order

The member API defaults to voting power in descending order, with record ID as the descending tiebreaker. The Members page supplies no alternative sort or sort control, so this is the fixed order for that surface before client-side pinning. The rendered list then makes two contextual exceptions:

1. The connected wallet is first when its individually fetched member record has positive voting power.
2. A distinct, nonzero delegate is next when delegation is enabled for the token.

The client de-duplicates those addresses case-insensitively and preserves the backend order for every remaining member. If a live single-member read finds a pinned participant before that participant reaches the paginated index, the list keeps every indexed row and expands its displayed count rather than evicting someone from the page.

### Token-based participation

For a token-based body, the [token panel](./token-panel.md) provides the available wrapping, locking, and delegation controls. [veLocker](./velocker.md) supports voting-escrow positions and dynamic delegation where configured.

## Participating in a process

A body expresses its preferences to a [governance process](./process.md). In staged governance, each [stage](./stage.md) determines how the decisions of its participating bodies combine.

A governance [plugin](./plugin.md#governance-semantics-of-plugins), such as Multisig or Token Voting, can act as both a body and a process when it carries proposals through decision to account execution. In staged governance, the plugin represents a body whose decision state is managed by the Staged Proposal Processor.

Any other address can be registered as a governing body, including another smart contract or an EOA. For example, a [Safe](./safe-as-a-body.md) can report its owners' decision, while an EOA controlled through an MPC signing setup can submit the outcome of an offchain decision process. The registered address expresses the body's approval or veto to the process. The app provides additional recognition and signing support for Safe bodies.

Who may [create a proposal](./proposal-creation.md) and who may execute it follow the process's permission configuration and [execution route](./target.md). Those permissions determine how the body and its members can act beyond supplying a decision.

## Bodies that span multiple processes

One installed plugin can serve as a body in more than one governance process. Every process using that body shares its governance settings. Minimum-duration configurations must be set carefully to work with the timing rules of every process that uses the body. Configure shared bodies with caution, and [reach out to the Aragon team](../application/getting-help.md#when-the-app-needs-the-aragon-team) to check that the setup is safe across those processes.

In contrast, separate plugin instances can represent the same membership while using different governance settings. Each instance is a distinct body, allowing those settings to vary independently.

## Identifying a body

A plugin body's name, description, and resources come from its [plugin metadata](../application/metadata-input.md#plugin-metadata-follows-the-plugin). When one plugin acts as both a process and a body, that single identity appears in both contexts.

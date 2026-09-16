# Governance

The governance model describes decision-making independently of any single contract. Start with [Aragon OSx and the platform](../osx-and-the-platform.md#what-is-osx-and-what-does-the-platform-add) for how accounts, governance processes, and bodies relate to the contracts. For the underlying mechanisms, see [governance plugins](../protocol-doc/plugins/index.md) and the OSx [plugin model](../protocol-doc/framework/plugins.md).

## Governance model

- [Governance process](./process.md) — the rules and flow that take proposals from creation through decision to account execution.
- [Body](./body.md) — the members whose preferences contribute to a governance decision.
- [Member](./member.md) — a participant within a body, with body-specific membership and participation rules.
- [Plugin](./plugin.md) — a contract installed to add a capability to an account, and its roles in governance.
- [Target](./target.md) — where a process's plugin sends its approved actions, and what that says about whether it is a process or a body.
- [Action](./action.md) — one onchain call, combined with other actions in an ordered array for execution.
- [Proposal](./proposal.md) — an ordered action array and explanatory metadata submitted through a governance process.

## Configure governance

- [Admin flow](./admin-flow.md) — temporary governance, why it is installed by default, admin management, and handover.
- [Removing a governance process](./process-removal.md) — where removal starts, what the app requires before it, publishing the removal proposal, and the rule for the last recognized process.

- [Governance designer](./governance-designer.md) — the flow for designing and installing governance in the app, and what can be edited afterwards.
- [Plugin compatibility](../application/plugin-compatibility.md) — levels of app support and what makes an installed plugin usable.
- [Aragon-deployed plugins](../application/aragon-deployed-plugins.md) — supported capabilities deployed through an arrangement with the team.

## Participate

- [Token panel](./token-panel.md) — the Members-page controls for wrapping, voting-escrow locking, and delegation, together with their onboarding re-entry points. The [Members page](./body.md#member-list-order) owns list ordering.
- [veLocker](./velocker.md) — the Members-page vote-escrow experience, time-varying voting power, dynamic delegation, and deployment boundary.
- [Gauge voting](./gauge-voting.md) — non-proposal, epoch-based allocation of voting power across gauges, with its dedicated installed-plugin page and management actions.
- [BENQI lending-market gauges](./benqi-lending-market-gauges.md) — the BENQI-specific integration for registering market incentives in Gauge voting.
- [Delegate profile record](./delegate-profile-record.md) — the network-and-token-scoped ENS record that points to a delegate statement on IPFS.
- [Aragon Notifications](./aragon-notifications.md) — opt-in Telegram alerts for proposal creation, approaching deadlines, and execution.

## Prepare and inspect proposals

The shared [Action builder](../application/action-builder.md), [Basic action views](../application/basic-action-views.md), and [simulation](../application/action-simulation.md) prepare and inspect actions for both proposals and direct transactions.

- [Proposal creation](./proposal-creation.md) — selecting a process, applying creation eligibility, composing the proposal, and submitting it.
- [Cross-chain execution](./cross-chain-execution.md) — composing a source-chain message whose nested action batch executes through a configured destination account.
- [Proposal status](./proposal-status.md) — the single status every proposal displays, derived in the app from onchain state.
- [Proposal identifiers](./proposal-identifiers.md) — the onchain proposal ID and the app's friendly slug, built from the process key.

## Compose staged governance

- [Stage](./stage.md) — the semantic layer of a single stage: timing, per-body approval or veto roles, independent thresholds, and bodyless timelocks.
- [Staged proposals](./proposal.md#staged-proposals) — how one proposal progresses through its stages, from body decisions to advancement and execution.
- [Optimistic governance](./optimistic-governance.md) — the accept-unless-challenged decision pattern: why it reduces affirmative-participation overhead, how roles remain configurable, and why passive veto rights still demand active monitoring.
- [Multisig gates](./multisig-gates.md) — a multisig governing a stage that gates a staged process, before or after a token vote, and why a visible stage is preferred over a direct permission grant.
- [Safe as a body](./safe-as-a-body.md) — a Safe serving as a stage's governing body, rather than a plugin.

For distributions that use gauge outcomes, see [Capital Distributor](../treasury/capital-distributor.md#gauge-informed-rewards). Its [Rewards page](../treasury/capital-distributor.md#rewards-page) lets recipients inspect and claim allocations.

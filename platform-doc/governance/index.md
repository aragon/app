# Governance

The platform's governance semantic layer: how the product thinks about decision-making, independent of any single contract. The protocol supplies the mechanisms — [governance plugins](../protocol-doc/plugins/index.md), the [plugin model](../protocol-doc/framework/plugins.md) — and these pages define what they *mean* in the product.

Start with the central distinction:

- [Governance process](./process.md) — a decision-making flow that can act on the DAO on its own: the *how* of a decision.
- [Body](./body.md) — a decision-making unit that participates in governance but cannot act alone.
- [Action](./action.md) — the on-chain transactions an account executes: the *what* of a decision.
- [Proposal](./proposal.md) — the decision-making object a process produces, carrying metadata, optional actions, identity, and lifecycle state.
- [Plugin](./plugin.md) — the protocol primitive the others abstract over, and the app's partial view of it (known vs unknown plugins).
- [Target](./target.md) — where a process's plugin sends its approved actions, and what that says about whether it is a process or a body.

Then how governance is installed and surfaced:

- [Governance designer](./governance-designer.md) — the flow for designing and installing governance in the app, and what can be edited afterwards.
- [Token panel](./token-panel.md) — the Members-page controls for wrapping, voting-escrow locking, and delegation, together with their onboarding re-entry points and member-list ordering.
- [veLocker](./velocker.md) — the Members-page vote-escrow experience, time-varying voting power, dynamic delegation, and deployment boundary.
- [Gauge voting](./gauge-voting.md) — non-proposal, epoch-based allocation of voting power across gauges, with its dedicated installed-plugin page and management actions.
- [Capital Distributor](./capital-distributor.md) — Merkle-based reward campaigns, claiming, campaign management actions, and the bounded handoff from gauge outcomes.
- [Delegate profile record](./delegate-profile-record.md) — the network-and-token-scoped ENS record that points to a delegate statement on IPFS.
- [Proposal creation](./proposal-creation.md) — selecting a process, applying creation eligibility, composing the proposal, and submitting it.
- [Proposal status](./proposal-status.md) — the single status every proposal displays, derived in the app from on-chain state.
- [Proposal identifiers](./proposal-identifiers.md) — the on-chain proposal ID and the app's friendly slug, built from the process key.
- [Staged proposals](./staged-proposals.md) — how a proposal traverses a multi-stage process: one consolidated proposal, sub-proposals per stage.
- [Stage](./stage.md) — the semantic layer of a single stage: timing, per-body approval or veto roles, independent thresholds, and bodyless timelocks.
- [Optimistic governance](./optimistic-governance.md) — the accept-unless-challenged decision pattern: why it reduces affirmative-participation overhead, how roles remain configurable, and why passive veto rights still demand active monitoring.
- [Multisig gates](./multisig-gates.md) — a multisig governing a stage that gates a staged process, before or after a token vote.
- [Safe as a body](./safe-as-a-body.md) — a Safe serving as a stage's governing body, rather than a plugin.
- [Action builder](./action-builder.md) — composing and understanding action batches for proposals and direct account execution.
- [Action simulation](./action-simulation.md) — testing a prepared action batch through its intended execution route, whether reached through a proposal or direct execution.
- [Stages over direct permission grants](./stages-over-direct-permissions.md) — the rule for representing a gating multisig as a visible stage rather than a direct permission grant.

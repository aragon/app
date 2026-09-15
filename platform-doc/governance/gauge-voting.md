---
type: capability
title: Gauge voting
tags: [governance, voting, plugins]
status: draft
source: product-owner release-notes braindump, "Gauge voting" category (1.15, 1.16, 1.21 as editorially normalized from the dictated version, 1.25, and 1.27; 2026-08-03) + app, app-backend, and aragon/ve-governance verification (2026-08-04, see log.md) + product-owner briefings (2026-08-04, see log.md) + codebase business-logic audit at app@122f1bd1 (2026-08-05, see log.md)
---

# Gauge voting

**Gauge voting** is a non-proposal governance capability for signaling how voting power should be distributed among a set of destinations. Its Gauge Voter plugin does not create [`IProposal` proposals](./proposal.md): during an epoch's voting window, eligible holders allocate their voting power across one or more active gauge addresses. The result is non-binding within the plugin by default, and Gauge Voter does not itself execute DAO actions. The release notes name separately arranged Capital Distributor reward distribution as one use of Gauge vote outcomes.

## Gauges and their administration

Each gauge is identified by an address and may carry a metadata URI. The app applies its standard [metadata input](../design/metadata-input.md) shape — name, description, and resources — with an optional gauge avatar; the address remains outside the metadata as the thing those fields describe. In the current contract and app, the permission is literally `GAUGE_ADMIN`. Its Action Builder group exposes purpose-built create and detail views for four management actions:

- **Create** a gauge from its address and metadata URI.
- **Deactivate** an existing gauge so it cannot receive new votes.
- **Reactivate** a deactivated gauge.
- **Update metadata** for an existing gauge.

The older release-note shorthand described add/remove/activate/deactivate. The current contract and app instead expose the create/deactivate/activate/update-metadata set above. A created gauge remains in the enumerable list; there is no current remove/delete function, so deactivation is the current way to retire one. These actions use the same [action-builder](./action-builder.md) composition and reading surfaces as other on-chain actions. They are the Gauge management views the app exposes, not an exhaustive list of every contract call protected by `GAUGE_ADMIN`. Holding that role authorizes the calls; it does not turn Gauge Voter into a proposal-producing process.

### Lending-market gauge registration

Registering a gauge for a lending market is a separate mechanism from the create/deactivate/reactivate/update-metadata lifecycle above, exposed through its own Gauge Registrar contract and action group:

- **Register** a gauge for a lending market from its qiToken address, an incentive type (Supply or Borrow), and that market's reward-controller address — identifying the gauge by that triple rather than by a bare address — plus the same name/description/resources/avatar metadata shape used elsewhere on this page.
- **Unregister** an existing lending-market gauge.

In the current contract and app, the permission is literally `GAUGE_REGISTRAR_ROLE`, distinct from `GAUGE_ADMIN` above; holding it authorizes both calls, composed through the same [action-builder](./action-builder.md) surfaces as the gauge lifecycle actions. Current code demonstrates that a registered gauge's address matches an entry in Gauge Voter's own gauge list — how the app merges qiToken, incentive type, and reward-controller detail into gauge display — and both actions warn that execution reverts while gauge voting is active, though the proposal can still be created and executed once the window ends. Like the rest of Gauge voting, lending-market gauge registration rides the same [partially supported](../partially-supported-plugins.md) footing: client-arranged rather than self-service, but live, not gated.

## Allocating voting power

During the configured voting window, a voter selects active gauges and enters a relative weight for each. The contract normalizes every submitted weight against the total and allocates the voter's available power proportionally. For a nonzero allocation, the app displays the resulting percentages to two decimal places, using largest-remainder rounding so the displayed set totals 100%; that presentation rounding is not a second voting rule. Submitting another allocation replaces the voter's previous set in the current write epoch or persistent state.

Epoch behavior depends on the installed contract's update-hook setting:

- **Persistent mode** stores the allocation in the contract's epoch-zero state, so votes carry across epochs. With a compatible escrow hook, a persistent allocation can be recalculated downward after reported voting power falls; increased power is not added automatically and requires a manual vote during a voting window.
- **Epoch-scoped mode** stores votes against the current epoch and uses voting power snapshotted at the epoch start. The voter must allocate again in a later epoch.

The dedicated Gauge page shows the gauge list, per-gauge details in a dialog, epoch timing and totals, the connected holder's voting power and usage, and an update-vote flow. Its sticky `GaugeVoterVotingTerminal` is an epoch-allocation control on that page, not the proposal-page [Voting Terminal](../design/voting-terminal.md): there is no proposal lifecycle or proposal status to render.

## Page and participation boundary

An installed Gauge Voter gets one **Gauges** page at `/gauges` and one navbar entry, not a route for each gauge. [App CMS](../app-cms.md) can hide that navigation entry; a direct visit then redirects to the account dashboard. The current page selects only the first installed Gauge Voter instance, so multiple instances on one account are not supported by this interface.

The page assembles a Gauge-specific Lock form and the shared Delegate form described by the [Token panel](./token-panel.md), but it does not mount the Members-page panel itself. For a recognized Aragon voting escrow, its aside offers both forms. For a third-party escrow, the current app has no native escrow settings and omits both the Lock form and the connection-time Lock/Wrap prompt; locking happens outside this interface. This is a current UI boundary, not a claim about the external escrow's capabilities or support status.

The current Gauge aside mounts Delegate without applying the token panel's indexed `hasDelegate` capability gate. This observed exception does not establish whether every third-party adapter supports delegation; the shared Token panel applies that gate before offering Delegate.

## Availability and related capabilities

Gauge voting is a [partially supported plugin](../partially-supported-plugins.md): the app supports an installed instance, but Governance Designer has no self-service setup definition or non-zero current-network repository address for it. The public [`ve-governance` source suite](../repositories.md) contains the Gauge Voter, epoch clock, voting-escrow adapter, and deployment machinery; those mechanisms remain source material rather than a self-deployment support promise.

[veLocker](./velocker.md) is related because its adapter can supply time-varying voting power, but locking positions and allocating that power to gauges are separate capabilities. Current code demonstrates a configured Gauge-reward path that calculates pro-rata allocations and exports campaign-preparation input for [Capital Distributor](./capital-distributor.md); that page owns claiming and campaign mechanics. This bounded handoff does not mean Gauge Voter automatically creates or pays a campaign, or that the demo is a generic self-service integration.

## Open questions

- [ ] For a third-party Gauge Voter escrow with no indexed `hasDelegate` capability, is always rendering Delegate intentional? If not, should the page hide it, disable it, or determine capability another way?

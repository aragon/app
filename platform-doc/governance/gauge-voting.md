---
type: capability
title: Gauge voting
tags: [governance, voting, plugins]
status: draft
source: product-owner release-notes braindump, "Gauge voting" category (1.15, 1.16, 1.21 as editorially normalized from the dictated version, 1.25, and 1.27; 2026-08-03) + app, app-backend, and aragon/ve-governance verification (2026-08-04, see log.md) + product-owner briefings (2026-08-04, see log.md) + codebase business-logic audit at app@122f1bd1 (2026-08-05, see log.md) + basic-action-view audit (2026-09-10, app@f8bf9e87 + installed @aragon/gov-ui-kit@2.11.2; see log.md) + product-owner briefings (2026-09-11, see log.md) + classification verification at app@adad67873c8f9dd75e3ed340b70df3e985ae3557 (2026-09-13, see log.md) + product-owner BENQI scope clarification (2026-09-13, see log.md) + Gauge refusal comparison (2026-09-13, app@adad67873c8f9dd75e3ed340b70df3e985ae3557 + published gov-ui-kit@2.11.4; see log.md) + live application-page coverage at app@adad67873c8f9dd75e3ed340b70df3e985ae3557 (2026-09-13, see log.md) + consequential drill-down verification at app@adad67873c8f9dd75e3ed340b70df3e985ae3557 and published gov-ui-kit@2.11.4 (2026-09-13, see log.md) + product-owner services and OSx answer-routing briefing (2026-09-14, see log.md)
---

# Gauge voting

**Gauge voting** is a non-proposal governance capability for signaling how voting power should be distributed among a set of destinations. Its Gauge Voter plugin does not create [`IProposal` proposals](./proposal.md): during an epoch's voting window, eligible holders allocate their voting power across one or more active gauge addresses. The result is non-binding within the plugin by default, and Gauge Voter does not itself execute DAO actions. One use of Gauge vote outcomes is separately arranged reward distribution through [Capital Distributor](../treasury/capital-distributor.md).

## Availability and related capabilities

Gauge voting uses an [Aragon-deployed plugin](../application/aragon-deployed-plugins.md). The app supports the installed instance; the team handles deployment because the Governance Designer has no self-service setup for it. [Contact the Aragon team](../application/getting-help.md#working-with-the-aragon-team) to arrange a Gauge Voter deployment.

[veLocker](./velocker.md) is related because its adapter can supply time-varying voting power, but locking positions and allocating that power to gauges are separate capabilities. A configured Gauge-reward path calculates pro-rata allocations and exports campaign-preparation input for [Capital Distributor](../treasury/capital-distributor.md). This demonstration is not a generic self-service integration: Gauge Voter does not automatically create or pay a campaign.

## Allocating voting power

During the configured voting window, a voter selects active gauges and enters a relative weight for each. The contract normalizes every submitted weight against the total and allocates the voter's available power proportionally. For a nonzero allocation, the app displays the resulting percentages to two decimal places, using largest-remainder rounding so the displayed set totals 100%; that presentation rounding is not a second voting rule. Submitting another allocation replaces the voter's previous set in the current write epoch or persistent state.

Epoch behavior depends on the installed contract's update-hook setting:

- **Persistent mode** stores the allocation in the contract's epoch-zero state, so votes carry across epochs. With a compatible escrow hook, a persistent allocation can be recalculated downward after reported voting power falls; increased power is not added automatically and requires a manual vote during a voting window.
- **Epoch-scoped mode** stores votes against the current epoch and uses voting power snapshotted at the epoch start. The voter must allocate again in a later epoch.

## Gauges page

The **Gauges page** shows the gauge list, per-gauge details in a dialog, epoch timing and totals, the connected holder's voting power and usage, and an update-vote flow. Holders select gauges and use the allocation control to submit or replace their votes during the voting window. Gauge details expose the destination's name, address, description, resources, and participation so a holder can inspect it before allocating power. The contract link opens the gauge address in its network's block explorer. Resource links display their labels and open their destinations without an app URL preview.

An installed Gauge Voter gets one **Gauges** page at `/gauges` and one navbar entry, not a route for each gauge. [App CMS](../application/app-cms.md) can hide that navigation entry; a direct visit then redirects to the account dashboard. The current page selects only the first installed Gauge Voter instance, so multiple instances on one account are not supported by this interface.

The page offers a Gauge-specific Lock form and the same Delegate form described by the [Token panel](./token-panel.md). For a recognized Aragon voting escrow, its aside offers both forms. For a third-party escrow, the current app has no native escrow settings and omits both the Lock form and the connection-time Lock/Wrap prompt; locking happens outside this interface. This is a current UI boundary, not a claim about the external escrow's capabilities or support status.

Third-party voting-escrow integrations require Aragon to assess the specific contracts for compatibility.

## Gauges and their administration

Each gauge is identified by an address and may carry a metadata URI. Its metadata holds a name, description, and resources, with an optional gauge avatar. In the current contract and app, the permission is literally `GAUGE_ADMIN`. Its Action Builder group exposes purpose-built create and detail views for four management actions:

- **Create** a gauge from its address and metadata URI.
- **Deactivate** an existing gauge so it cannot receive new votes.
- **Reactivate** a deactivated gauge.
- **Update metadata** for an existing gauge.

A created gauge remains in the enumerable list; deactivation retires it from receiving votes, and reactivation restores that eligibility. Metadata updates describe the same gauge address. These actions use the [action builder](../application/action-builder.md); the [gauge action catalogue](../application/basic-action-views.md#gauges-and-lending-markets) summarizes when to choose each one. Holding `GAUGE_ADMIN` authorizes gauge management; Gauge Voter retains its role as a non-proposal governance plugin.

[BENQI lending-market gauges](./benqi-lending-market-gauges.md) use a separate, BENQI-specific registration integration alongside the shared Gauge Voter.

### Management-form validation

Create requires a valid gauge address, a name of up to 128 characters, and a description of up to 480 characters. Update metadata requires an existing gauge and the same name and description fields. Both forms use the shared [resource and avatar inputs](../application/metadata-input.md). Deactivate selects from active gauges; Reactivate selects from inactive gauges. Metadata updates can select either state.

Address-format validation does not check whether a gauge address is zero or already exists. Use a nonzero, unused address when creating a gauge. A selected gauge's state can also change before execution; the selection filter does not guarantee that the proposed lifecycle change will still be valid. Review the action against the target instance and use [simulation](../application/action-simulation.md) when available.

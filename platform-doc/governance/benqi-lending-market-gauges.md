---
type: capability
title: BENQI lending-market gauges
tags: [governance, voting, plugins]
scope: client-specific
client: benqi
status: draft
source: Gauge Registrar owner/source pass (2026-08-05, see log.md) + basic-action-view audit (2026-09-10, app@f8bf9e87; see log.md) + classification verification at app@adad67873c8f9dd75e3ed340b70df3e985ae3557 (2026-09-13, see log.md) + product-owner BENQI scope clarification (2026-09-13, see log.md) + Gauge refusal comparison (2026-09-13, app@adad67873c8f9dd75e3ed340b70df3e985ae3557 + published gov-ui-kit@2.11.4; see log.md)
---

# BENQI lending-market gauges

**BENQI lending-market gauges** are a client-specific integration that represents BENQI market incentives in [Gauge voting](./gauge-voting.md). Gauge Registrar supplies registration and removal actions for BENQI; the shared Gauge Voter supplies the gauge list and allocation-voting experience.

## Registering and removing market incentives

Gauge Registrar exposes two [action-builder](../application/action-builder.md) actions:

- **Register** a lending-market gauge using its qiToken address, incentive type (Supply or Borrow), and reward-controller address. Together, those three values identify the market incentive. Registration also supplies metadata with a name, description, resources, and optional avatar.
- **Unregister** an existing lending-market gauge.

Registration requires valid qiToken and reward-controller addresses, a Supply or Borrow choice, a name of up to 128 characters, and a description of up to 480 characters. The address checks validate format; they do not verify that the contracts implement the intended BENQI market and reward controller, or that the registration is new. Confirm those details before proposing. Unregister requires selecting an existing registered gauge.

The permission is `GAUGE_REGISTRAR_ROLE`, which authorizes both calls. General [gauge lifecycle management](./gauge-voting.md#gauges-and-their-administration) uses the separate `GAUGE_ADMIN` permission. A registered gauge's address matches an entry in Gauge Voter's gauge list.

Both forms display an informational notice that execution reverts while gauge voting is active. The notice is always shown and does not check the current voting window or block proposal creation. A proposal can be created during that window and executed once it ends. For action selection and review, see the [BENQI lending-market actions](../application/basic-action-views.md#benqi-lending-market-actions).

## Identifying a market gauge in the app

The **Gauges** list identifies a registered BENQI lending-market gauge by its metadata name, avatar, and gauge address, alongside total votes and the connected holder's votes. Its details dialog adds the description, contract-address link, resources, and whether the holder has voted for it. Neither surface displays separate qiToken, Supply/Borrow, or reward-controller fields.

Those three fields appear in the **Register gauge** action's Basic details, with explorer links for both addresses. The **Unregister gauge** selector and Basic details show the resolved gauge's name, avatar, and gauge address. When reviewing a published unregister proposal, inspect **Decoded** to verify the qiToken, incentive, and reward controller.

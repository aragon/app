---
type: opportunity
title: Pre-empt configurations the protocol will reject
tags: [governance, validation, plugins]
status: candidate
source: app source verification (2026-08-04, app@122f1bd1; see log.md) + product-owner briefings (2026-09-11, see log.md) + Gauge refusal comparison (2026-09-13, app@adad67873c8f9dd75e3ed340b70df3e985ae3557 + published gov-ui-kit@2.11.4; see log.md) + ve-governance@408ad144cf33c016b9ef1a2a6118f394a7ff439c + product-owner editorial feedback (2026-09-13, see log.md)
---

# Pre-empt configurations the protocol will reject

## User story

As a person configuring governance, I want the form to identify settings that violate known protocol constraints before submission, so that I can correct them before attempting a transaction the protocol will reject.

## Context + benefit

The app uses [invariant validation](../design/invariant-validation.md), but some protocol constraints have no corresponding form check. This candidate covers advanced stage configuration, standalone token-based voting duration, and Gauge creation. Advanced governance creation is [available through the team](../../governance/governance-designer.md#the-advanced-flow); its configuration gaps concern that arrangement.

The known gaps are:

- **Zero-length stage expiration.** Turning expiration on and clearing its inputs makes the maximum advance time equal to the stage's voting duration. The [stage rules](../../protocol-doc/plugins/spp-plugin/stages-and-bodies.md) require it to be greater; disabling early advance also breaks the minimum-advance inequality in this configuration. Expiration defaults to seven days, and leaving it switched off is valid.
- **A repeated body address in one stage.** The form accepts a duplicate that the protocol rejects.
- **A voting duration above 365 days.** Standalone Token Voting and Lock-to-Vote forms enforce the one-hour minimum but omit the [365-day maximum](../../protocol-doc/plugins/majority-voting.md). That maximum applies to those plugins; it does not establish an upper bound for an SPP stage.
- **A zero or already-created Gauge address.** The [Gauge creation form](../../governance/gauge-voting.md#management-form-validation) accepts addresses that the referenced contract rejects. This mismatch is established from source; a failure on a deployed account has not been reproduced. An existence check would need the target instance and preceding actions, since state can change before execution.

The candidate would explain these conflicts where the settings are entered, helping authors correct the configuration earlier. Form checks would supplement contract validation and simulation; they would not guarantee a later execution succeeds.

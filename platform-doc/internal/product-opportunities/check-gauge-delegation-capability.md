---
type: opportunity
title: Check delegation support before offering Delegate in Gauge voting
tags: [governance, gauge-voting, delegation, bug]
status: candidate
source: Gauge voting audit at app@122f1bd1 (2026-08-05, see log.md) + product-owner briefing (2026-09-11, see log.md)
---

# Check delegation support before offering Delegate in Gauge voting

## User story

As a token holder participating in Gauge voting, I want the Delegate action to reflect my voting integration's actual delegation support, so that I am offered a participation route I can use.

## Context + benefit

The [Gauge voting](../../governance/gauge-voting.md) panel offers **Delegate** without the capability check used by the shared [Token panel](../../governance/token-panel.md). This can offer an action the integrated voting escrow or adapter does not support.

The candidate would check the particular integration before deciding whether to show Delegate, using the Token panel's approach where it applies. Missing indexed data alone does not prove that delegation is unsupported. Establishing the capability would avoid inviting holders into an unavailable action.

Before ticketing, recheck the current implementation and analyze the specific contracts, including whether the Gauge Voter integration requires delegation. This is a bounded UI investigation; third-party voting-escrow compatibility still needs analysis for each integration.

---
type: opportunity
title: Explain unsupported cross-chain destinations
tags: [governance, cross-chain, validation]
status: candidate
source: @aragon/app@1.38.0 tagged-source reconciliation (2026-09-09, see log.md)
---

# Explain unsupported cross-chain destinations

## User story

As a proposal author choosing a cross-chain destination, I want to know when the app cannot compose actions for that network and what support is missing, so that I can decide how to proceed without encountering an unexplained disabled editor.

## Context + benefit

The destination selector in [cross-chain execution](../../governance/cross-chain-execution.md) includes the controller's configured routes. A route to a network the app does not recognize remains selectable, but its nested action composer is disabled without explanation. The author cannot tell whether the limitation comes from configuration, indexing, or application support.

The candidate would explain the unsupported network at selection, either by disabling the destination with a reason or by keeping it inspectable and offering an explanation and support route. This would give authors a useful next step. Adding a client network definition alone would not establish that the controller route is operational.

Before ticketing, reproduce a configured route to an unrecognized network and decide whether it should remain inspectable. Verify route and network-definition changes, including a previously composed destination becoming unsupported.

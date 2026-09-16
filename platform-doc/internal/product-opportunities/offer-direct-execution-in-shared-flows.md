---
type: opportunity
title: Offer direct execution in shared action flows
tags: [transactions, governance, access-control]
status: candidate
source: product-owner execution-route-selection briefing (2026-09-15) + shared selector and direct-execution evidence at app@adad67873c8f9dd75e3ed340b70df3e985ae3557 (see log.md)
---

# Offer direct execution in shared action flows

## User story

As an account operator with Execute permission, I want to choose direct execution in the same flows that offer governance processes, so that I can perform a supported change using my existing authority without rebuilding its actions elsewhere.

## Context + benefit

[Execution routing](../../application/execution-routing.md) currently offers installed governance processes. [Direct execution](../../treasury/create-transaction.md) has a separate entry point and composer. The owner suggested bringing that route into shared action flows as a possible future extension.

The candidate would let a flow retain its prepared actions while choosing between a governance proposal and a direct call by an authorized actor. This could apply to changes such as [contract upgrades](../../accounts/contract-upgrades.md) and [governance installation](../../governance/governance-designer.md#preparing-and-applying-an-installation). It is not a commitment to support every flow.

Investigation must establish which flows can use the route, how preparation is retained, and how the app checks the actor's Execute permission against the actual action batch, including conditioned grants. Linked-account identity, transaction review, and clear confirmation of immediate execution also need to be resolved. The onchain authorization checks remain authoritative.

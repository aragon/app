---
type: opportunity
title: Recognize Safe-owner conditions in Permission Viewer
tags: [access-control, permissions, conditions]
status: candidate
source: product-owner Permission Viewer briefing + @aragon/app@1.38.0 and app-backend@107103b4 reconciliation (2026-09-09, see log.md)
---

# Recognize Safe-owner conditions in Permission Viewer

## User story

As a person reviewing account permissions, I want a recognized Safe-owner condition to explain its ownership requirement in readable terms, so that I can understand who may use the permission without interpreting an unfamiliar contract address alone.

## Context + benefit

[Permission Viewer](../../access-control/permission-viewer.md) receives a friendly membership classification only when the backend associates a condition with an indexed Aragon Multisig plugin. A standalone Safe-owner condition currently appears as an unknown condition identified by its address.

The candidate would recognize supported Safe-owner conditions and show the configuration needed to understand their restriction. Unknown contracts would retain the address fallback. Showing a condition's configuration would help explain the permission; it would not establish whether a particular proposed call passes that condition.

Before ticketing, verify standalone conditions and conditions associated with staged processes against the deployed indexer schema. Establish reliable identification and decoded fields for supported contract versions, then cover list, mobile, and graph details, linked-account networks, and unknown conditions.

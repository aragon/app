---
type: opportunity
title: Inspect labeled-link destinations before navigation
tags: [design, interaction, links]
status: candidate
source: classification verification at app@adad67873c8f9dd75e3ed340b70df3e985ae3557 with locked gov-ui-kit@2.11.4 and @tiptap/extension-link@3.30.3 (2026-09-13, see log.md) + consequential drill-down verification at app@adad67873c8f9dd75e3ed340b70df3e985ae3557 and published gov-ui-kit@2.11.4 (2026-09-13, see log.md)
---

# Inspect labeled-link destinations before navigation

## User story

As a reader using a keyboard, touch, or a pointer, I want to inspect a labeled link's full destination before opening it, so that I can decide whether to visit the address behind the label.

## Context + benefit

[Proposal descriptions](../../governance/proposal.md#proposal-details-page), [delegate statements](../../governance/member.md#identifying-a-member), and [gauge resource lists](../../governance/gauge-voting.md#gauges-page) use ordinary links and rely on browser controls for destination inspection. They provide no app preview on focus or tap, leaving the [inspectable-destination rule](../design/inspectable-link-destinations.md) unmet at the application level.

The candidate would provide a deliberate action to reveal the URL while preserving the surrounding text, with a separate action to open it. Readers could inspect the destination before deciding to navigate. Ordinary resource cards already display their URLs and do not need the same additional control.

Before ticketing, verify keyboard focus, touch activation, and screen-reader labels with the app's current rich-text renderer. Destination inspection and link sanitization remain separate requirements.

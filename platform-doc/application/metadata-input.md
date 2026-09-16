---
type: pattern
title: Metadata input
tags: [design, metadata, forms, wizards, ipfs]
status: draft
source: product-owner briefing (2026-08-04, app metadata input; see log.md) + app source verification (2026-08-04, app@122f1bd1; see log.md) + protocol-doc/framework/plugin-metadata.md + product-owner editorial feedback (2026-09-13, see log.md) + product-owner proposal metadata example and application filing (2026-09-14, see log.md)
---

# Metadata input

Metadata gives an object a recognizable identity and explains what it is for. The user supplies meaningful fields; the app stores them and prepares the reference needed by the transaction. This keeps storage mechanics out of the definition work.

## The common shape

Names, descriptions, and resource links give people enough context to recognize an object and understand its purpose. A resource needs a URL and may have a display label. Individual objects add fields that describe their identity, such as an account logo or a process key for [proposal identifiers](../governance/proposal-identifiers.md).

The common shape appears in [account creation](../accounts/account-creation.md), the [governance designer](../governance/governance-designer.md), [proposal creation](../governance/proposal-creation.md), [campaigns](../treasury/capital-distributor.md#campaign-actions), and [gauges](../governance/gauge-voting.md#gauges-and-their-administration). Each object owns its field requirements. Operational settings, such as voting thresholds or campaign payouts, stay separate from its description.

## Plugin metadata follows the plugin

A plugin has one identity even when it serves as both a [process](../governance/process.md) and a [body](../governance/body.md). Its name, description, and resources can appear in both the proposals and members experiences. Editing that metadata changes the shared identity; it does not create a separate description for each role.

The app preserves unedited metadata when applying an update. It stores the revised description through the plugin's [metadata mechanism](../protocol-doc/framework/plugin-metadata.md#instance-metadata-metadataextension).

## Proposal metadata example

A [proposal](../governance/proposal.md#description-and-resources) carries a title, a short summary, a full description, and resource links. The summary appears at the top of the proposal details page and in the proposal list. The full description appears on the details page and can contain rich text represented as HTML.

```json
{
  "title": "Example proposal",
  "summary": "This is shown at the top of the proposal page and on the proposal list so anyone can quickly understand what it's about.",
  "description": "<p>This is the full proposal text that is viewable only on the proposal details page.<br><br>It can also have <strong><em><u>rich text</u></em></strong>.</p>",
  "resources": [
    {
      "name": "Optional link label",
      "url": "https://www.aragon.org"
    }
  ]
}
```

Each resource supplies its destination in `url`; `name` is the optional display label. The metadata provides the proposal's human-readable context. Its [actions](../governance/action.md) carry the calls submitted for approval.

## Placement in a wizard

Metadata is the first definition step, before governance, membership, actions, permissions, or other operational configuration. The user first defines the thing they are creating, then decides how it works. A prerequisite may come first when it determines the available choices: account creation selects a network before offering an ENS subname, and body creation selects a plugin before asking for its configuration.

The [wizard](./wizard.md) keeps each step focused on one idea. Once the definition is complete, [transaction submission](./submitting-a-transaction.md) handles storage preparation and signing.

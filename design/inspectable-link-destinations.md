---
type: pattern
title: Make user-supplied link destinations inspectable
tags: [design, interaction, content, links]
status: draft
source: app interaction-principles inventory against app@122f1bd1 + product-owner review + gov-ui-kit v2.9.0 verification (2026-08-05, see log.md)
---

# Make user-supplied link destinations inspectable

Let a reader inspect where a user-supplied link goes before opening it. A friendly label may explain the destination, but it must not be the only information available when the product does not control the link.

## Match the treatment to the surface

A standalone resource has room for both pieces of information. Show its supplied name as the link label and the resolved URL or destination underneath. Proposal resources, plugin metadata, and member-profile links use this treatment: a label such as **Website** or **Budget breakdown** remains readable while the destination stays visible.

Inline rich text has a different constraint. Proposal descriptions and delegate statements allow an author to select text and attach a URL. Repeating the raw URL inside every paragraph would make the content harder to read, so keep the contextual link text and provide another way to inspect the destination before navigation, including for keyboard and touch interaction. The destination may appear on focus, in link details, or at another deliberate inspection boundary; a pointer-only browser status display is not the whole interaction.

This rule applies to links supplied by account members, proposal authors, plugin metadata, profiles, or other external content. Product-owned navigation can use its normal label because the product controls both the route and its meaning.

Destination disclosure and link safety are separate responsibilities. The rendering boundary still rejects unsafe markup and URL schemes; showing a destination does not make it safe, and sanitizing it does not make a hidden destination understandable.

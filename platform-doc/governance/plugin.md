---
type: concept
title: Plugin
tags: [governance, accounts, semantics]
status: draft
source: product-owner briefing (2026-07-14) + product-owner briefings (2026-07-28, see log.md) + product-owner principles review (2026-07-29, see log.md) + app and app-backend source verification + product-owner briefings (2026-08-04, see log.md) + app source verification (2026-08-05, app@122f1bd1; see log.md)
---

# Plugin

A **plugin** is the protocol's unit of installed capability on a DAO: a contract granted permissions on the [account](../accounts/account.md), free to do whatever those permissions allow. The mechanism is OSx's — see the [plugin model](../protocol-doc/framework/plugins.md) and the [plugin catalogue](../protocol-doc/plugins/index.md) in the protocol docs; this page holds what plugins *mean* in the product.

## The product abstractions sit on top

[Process](./process.md) and [body](./body.md) — the vocabulary the app organizes governance around — are not protocol facts; they are product abstractions **on top of the plugin concept**. In reality an account just has plugins with permissions; the app interprets the ones it understands as processes and bodies so it can offer coherent flows over them. The app's own code mirrors that boundary: each plugin keeps its own utilities and components, while generic flows stay reusable and plugin-specific logic remains partitioned in [plugin slots](../design/plugin-slots.md) ([principles](../principles.md)).

The plugin's user-facing identity follows the app's [metadata input](../design/metadata-input.md) pattern. One installed plugin owns one metadata record even when the product interprets it as both a process and a body, so the same name, description, and resources may surface in both product contexts.

A governance plugin that records actors' preferences and applies a voting or approval method can also be a **governor** ([authorization and execution model](../access-control/authorization-and-execution.md)). Not every plugin is one: governor names what the component does in governance, while plugin names how the capability is installed on and authorized by an OSx DAO.

## Known and unknown plugins

The app is a layer over the account for handling the main flows — not the account's gatekeeper — and its view of an account's plugins is partial by design:

- A **known plugin** is one the app recognizes as an interface it understands and can offer purpose-built flows for. Those flows may include interpreting it as a [process](./process.md) or [body](./body.md), surfacing its proposals, or managing its capability; recognition does not imply that every flow, including installation and uninstallation, is available for every known interface.
- An **unknown plugin** is anything else installed on the DAO: the app cannot interpret or manage it, but it is a full citizen of the account — possibly intentional, possibly holding permissions, possibly the account's real governance.

The [governance designer](./governance-designer.md)'s self-service setup-picker set is deliberately narrow: multisig, token voting, and — on networks where its repository is deployed — lock to vote. Admin is also a known, registered interface, but it is a built-in [bootstrap exception](../accounts/admin-flow.md#its-place-in-the-plugin-model): the account-creation factory installs it, and it has no picker setup definition. Gauge and Capital Distributor have registered installed-instance surfaces but lack the setup data and a non-zero repository address for the current network that the picker requires; this confirms their absence from that picker, not the absence of every possible technical deployment route. Recognition is broader and mechanical. The backend resolves proxy implementations and matches required function selectors in their bytecode to an interface type; the frontend uses that type to route installed instances into registered plugin modules and [slots](../design/plugin-slots.md). A variant with different internal logic can therefore reuse a surface when it still satisfies the interface's expected methods, data, and behavior, but selector matching is not a universal compatibility guarantee. This does not imply multi-instance support: the Gauge and Capital Distributor pages currently select the first matching plugin, and Gauge explicitly documents that multiple instances are not supported. Updates remain repository-specific: the app matches them by repository subdomain rather than treating every plugin with the same interface type as interchangeable.

This recognition axis is separate from the product's [partially supported plugin](../partially-supported-plugins.md) category: an installed plugin can be recognized and operable even when its deployment is arranged directly with Aragon rather than offered through a self-service setup flow. The curation sits in which interfaces and flows the app builds and supports, not in a bar every account plugin must clear — Aragon deliberately curates what it merges, hosts, and supports at the product's current stage ([principles](../principles.md)).

A known plugin's depth of integration also varies. Most known plugins reach into governance and settings, and the three self-service ones into the governance designer as well; Gauge and Capital Distributor sit at the floor, where recognition contributes a single stand-alone page and nothing else — no participation in proposals, no settings surface, and no presence in the governance designer. In the interface, this is what the delivery posture described above looks like: known and reachable through a page of their own, but integrated no further.

Unknown plugins aren't hidden from the account: they're listed in the account's settings, and may surface in certain other places too. Unknown behavior is to be expected; anyone wanting specific support for a plugin should follow the [reach-out-to-the-team pattern](../design/reach-out-to-the-team.md). This handoff is about unknown code the app cannot support, not about the abstraction-depth boundary used for advanced governance.

The consequence: the app must never reason as if its view were complete. An account whose last *known* process is removed may still be perfectly governed by plugins the app doesn't understand — which is one reason [removing the last known process warns rather than blocks](../accounts/last-process-removal.md), and an instance of [accounts being autonomous](../principles.md).

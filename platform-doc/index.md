---
okf_version: "0.1"
---

# Aragon Platform

The product knowledge base for the **Aragon platform**: a vertically integrated, full-stack solution for governing treasuries and protocols on EVM-compatible blockchains. The platform application sits on top of the [Aragon OSx protocol](./protocol-doc/index.md), and these docs cover the layer the contracts don't: the **business logic and semantics of the product** — the concepts, rules, and design principles that platform features must share to stay consistent, coherent, and scalable.

**Scope boundary:** protocol mechanics (the DAO contract, permissions, plugin framework, governance plugins) are documented in the [protocol docs](./protocol-doc/index.md) and are never restated here — pages link to them for the mechanism and add the product meaning on top. If a fact is true of the contracts verbatim, it belongs there; if it is a product abstraction, rule, or principle, it belongs here.

**Three-layer model:** *protocol mechanism → product capability → interaction pattern*. The layers use their own vocabulary and answer their own questions: protocol docs define mechanisms, this base defines product meaning and capability, and design patterns define how that meaning is presented. A clean correspondence is useful when it exists, not a requirement.

**Pinned upstream snapshot:** the `protocol-doc/` submodule is at [`aragon/protocol-doc@800da8d9b347200dda8362e7b68cfe74c08c79a5`](https://github.com/aragon/protocol-doc/commit/800da8d9b347200dda8362e7b68cfe74c08c79a5), committed 2026-08-07 and verified as the latest `main` commit on 2026-08-11. Platform-doc extends that snapshot and links into it; protocol-doc remains the upstream source of protocol truth.

## Use Aragon

[Guides](./guides/index.md) help people accomplish concrete tasks in the Aragon platform. Start by [choosing a voting-power mechanism for token governance](./guides/choose-token-voting-power-mechanism.md), [choosing between a Safe and an Aragon multisig](./guides/safe-vs-aragon-multisig.md), [adding a multisig gate to an advanced governance process](./guides/multisigs-in-advanced-governance.md), or [hardening token governance against governance attacks](./guides/harden-token-governance-against-attacks.md).

## Understand or change the platform

Start with the [value proposition](./value-proposition.md) for what the platform promises and the [platform design principles](./principles.md) for the cross-cutting rules every feature follows. [Honest abstraction](./principles/honest-abstraction.md) explains how those rules balance a human-level product model with on-chain reality.

If you are about to build or change a platform feature, use this reading order:

1. [Platform design principles](./principles.md) — the rules that apply to every feature.
2. [Account](./accounts/account.md) — what the deployed entity is, and why the product says "account" where the protocol says "DAO".
3. [Governance process](./governance/process.md) and [body](./governance/body.md) — the central semantic distinction behind the governance surface.
4. [Scoped authority](./access-control/scoped-authority.md) — how the account's effective authority is divided among governance processes.
5. The area your feature touches — [accounts](./accounts/index.md), [governance](./governance/index.md), [treasury](./treasury/index.md), [access control](./access-control/index.md), or [design](./design/index.md) — following links from there for related concepts.

Before building, use the product vocabulary defined here. If a feature needs a term these docs do not define, define it before the feature ships. If a feature cannot follow a rule in the [principles](./principles.md), record the exception rather than silently diverging.

## Browse by area

- **[Accounts](./accounts/index.md)** — the entity users deploy and govern, plus participant identity: [account vs DAO](./accounts/account.md), [creation](./accounts/account-creation.md), [linked accounts](./accounts/linked-account.md), and [Aragon Names](./accounts/aragon-names.md).
- **[Governance](./governance/index.md)** — the platform's governance semantics: [processes](./governance/process.md), [bodies](./governance/body.md), [proposals](./governance/proposal.md), the [governance designer](./governance/governance-designer.md), and staged governance patterns like [multisig gates](./governance/multisig-gates.md).
- **[Treasury](./treasury/index.md)** — what the account holds and how the app shows it: the account as [vault](./treasury/vault.md), [assets](./treasury/assets.md), and [transactions](./treasury/transactions.md).
- **[Access control](./access-control/index.md)** — how decisions become authorized calls and how people inspect that configuration: the [authorization and execution model](./access-control/authorization-and-execution.md), concrete [OSx authorization paths](./access-control/osx-authorization-paths.md), the [Permission Viewer](./access-control/permission-viewer.md), and [scoped authority](./access-control/scoped-authority.md), layered over the protocol's [permission system](./protocol-doc/core/permissions.md).
- **[Design](./design/index.md)** — the interaction, component, and content patterns — like the [full-screen wizard](./design/full-screen-wizard.md) and [plugin slots](./design/plugin-slots.md) — that keep features feeling like one product.

General reference: [Partially supported plugins](./partially-supported-plugins.md) separates interface recognition from self-service deployment; [App CMS](./app-cms.md) describes the platform's off-chain curation and visibility mechanism; [source repositories](./repositories.md) maps the codebases behind the platform.

---

_Operated with the `wiki` CLI: [AGENTS.md](./AGENTS.md) is how to drive it, [WORKFLOW.md](./WORKFLOW.md) is this base's conventions. Documentation work awaiting review lives in the [documentation backlog](./backlog.md); candidate improvements live in [Product opportunities](./product-opportunities.md). These are for maintaining and extending the base and product, not for learning the platform._

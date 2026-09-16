# Design

[Internal documentation](../index.md) · [Product documentation](../../index.md)

The platform's design patterns: the reusable interaction, component, and content rules that keep features feeling like one product. Use the shared pattern that fits the interaction; develop a reusable pattern when a feature needs a different one. Cross-cutting patterns live here. A feature’s specific behavior and design rationale live together in its canonical entry; the links below include those reusable application surfaces.

## Before building or changing a feature

Read in this order:

1. [Platform design principles](./principles.md) — the rules that apply to every feature; [honest abstraction](./principles/honest-abstraction.md) carries the calibration behind them.
2. [Account](../../accounts/account.md) — what the deployed entity is, and why the product says "account" where the protocol says "DAO".
3. [Governance process](../../governance/process.md) and [body](../../governance/body.md) — the central semantic distinction behind the governance surface.
4. [Scoped authority](../../access-control/scoped-authority.md) — how the account's effective authority is divided among governance processes.
5. The area your feature touches — [accounts](../../accounts/index.md), [governance](../../governance/index.md), [treasury](../../treasury/index.md), or [access control](../../access-control/index.md) — following links from there for related concepts, then the patterns below.

Use the product vocabulary those pages define. If a feature needs a term these docs do not define, define it before the feature ships. If a feature cannot follow a rule in the [principles](./principles.md), record the exception rather than silently diverging. [Source repositories](../maintenance/repositories.md) orients a reader in the codebases behind the platform.

## Interface principles and patterns

- [Every element makes a claim](./principles/every-element-makes-a-claim.md) — how user expectations, product meaning, and semantic minimalism determine what belongs in an interface.
- [Control availability](./control-availability.md) — when to hide, disable, guard, or warn around an actionable control.
- [Refuse unsatisfiable configuration](./invariant-validation.md) — the narrow invalid-input boundary that does not restrict valid actions.

## Interaction patterns

- [Normalize input without changing its meaning](./input-normalization.md) — remove harmless representation differences without guessing or changing the entered value's meaning.
- [Show validation when it can help](./validation-timing.md) — choose field, step, and submission feedback from the earliest useful repair point.
- [Address input](../../application/address-input.md) and [Address display](../../application/address-display.md) — editing and validating an identifier versus inspecting a rendered address.
- [Collection pages](../../application/collection-pages.md) — the shared datalist layout, states, controls, and navigation rules.
- [Wizard](../../application/wizard.md) — the shared input, nesting, submission, and unsaved-work behavior that guided flows preserve.
- [Metadata input](../../application/metadata-input.md) — object fields, shared plugin identity, and proposal metadata, including their order in a wizard.
- [Submitting a transaction](../../application/submitting-a-transaction.md) — the shared stepper lifecycle, retry safety, and resumption rules.
- [Dialog taxonomy](./dialog-taxonomy.md) — choosing wizard containers, general dialogs, and alert dialogs, with their relationship to wallet readiness.
- [Preserve task context across dialogs](./dialog-continuity.md) — stack child decisions, replace superseded tasks, and queue unrelated prompts deliberately.
- [Make user-supplied link destinations inspectable](./inspectable-link-destinations.md) — let readers check standalone and inline destinations before opening them.
- [Use primary actions sparingly](./primary-action-hierarchy.md) — show one lead action when a decision has a recommended next step, and name its result.
- [Abstract, then offer a drill-down](./principles/honest-abstraction.md#abstract-then-offer-a-drill-down) — present the product model first and offer the authoritative fact on demand.
- [Getting help](../../application/getting-help.md) — ordinary support, boundary handoffs, and their current routes.

## Component patterns

- [Plugin slots](./plugin-slots.md) — how plugin-specific business logic lives inside generic flows, and what every plugin and action integration owes.
- [DAO slots](./dao-slots.md) — how client-specific branding and one-off functionality inject into account-scoped pages.
- [Voting Terminal design reference](./voting-terminal-reference.md) — the component variants and visual specification for building the proposal's decision surface.

## Content patterns

- [Alert severity](./alert-severity.md) — choosing severity, interruption, and placement to fit the person's decision; [Alerts and advisories](../../application/alerts.md) explains the resulting app behavior.

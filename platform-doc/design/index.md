# Design

The platform's design patterns: the reusable interaction, component, and content rules that keep features feeling like one product. Each pattern says when to use it, not just what it is — a feature that needs an interaction these pages don't cover is a signal to extend the pattern library, not to improvise.

**Foundational patterns**

- [Every element makes a claim](./every-element-makes-a-claim.md) — how user expectations, product meaning, and semantic minimalism determine what belongs in an interface.
- [Control availability](./control-availability.md) — when to hide, disable, guard, or warn around an actionable control.
- [Refuse unsatisfiable configuration](./invariant-validation.md) — the narrow invalid-input boundary that does not restrict valid actions.

**Interaction patterns**

- [Normalize input without changing its meaning](./input-normalization.md) — remove harmless representation differences without guessing or changing the entered value's meaning.
- [Show validation when it can help](./validation-timing.md) — choose field, step, and submission feedback from the earliest useful repair point.
- [Address input](./address-input.md) — checksum validation, ENS resolution, explorer handoff, and copy controls for account and contract identifiers.
- [Datalist page](./datalist-page.md) — the shared list-and-aside structure and its page-defined tabs.
- [Wizard](./wizard.md) — when transaction input needs a guided flow, how the containers differ, and how wizards nest.
- [Metadata input](./metadata-input.md) — the common definition fields, IPFS abstraction, surface-specific extensions, and first-definition-step rule.
- [Full-screen wizard](./full-screen-wizard.md) — the dedicated-destination pattern for focused, multi-step transaction flows.
- [Transaction submission stepper](./transaction-submission.md) — the reusable prepare, sign, confirm, and index sequence after a transaction has been composed.
- [Dialog taxonomy](./dialog-taxonomy.md) — dialog wizards, general dialogs, alert dialogs, and where full-screen wizards sit apart.
- [Preserve task context across dialogs](./dialog-continuity.md) — stack child decisions, replace superseded tasks, and queue unrelated prompts deliberately.
- [Make user-supplied link destinations inspectable](./inspectable-link-destinations.md) — let readers check standalone and inline destinations before opening them.
- [Use primary actions sparingly](./primary-action-hierarchy.md) — show one lead action when a decision has a recommended next step, and name its result.
- [Abstract, then offer a drill-down](./abstract-then-drill-down.md) — present the product model first and offer the authoritative fact on demand.
- [Reach out when the abstraction cannot stay honest](./reach-out-to-the-team.md) — hand off edge cases the app cannot represent faithfully.

**Component patterns**

- [Plugin slots](./plugin-slots.md) — how plugin-specific business logic lives inside generic flows.
- [DAO slots](./dao-slots.md) — how client-specific branding and one-off functionality inject into account-scoped pages.
- [Voting Terminal](./voting-terminal.md) — the proposal-page surface that presents a staged process's stages in one place.

**Content patterns**

- [Alert severity](./alert-severity.md) — the warning vs critical distinction, used beyond dialogs.

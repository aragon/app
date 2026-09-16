---
type: note
title: Documentation backlog
tags: [maintenance, cross-cutting]
---

# Documentation backlog

**The one place to go to find documentation work.** It is organized by **who moves next**, not by what kind of record sits underneath:

- **[Ready for your input](#ready-for-your-input)** — work the product owner can do now: a bounded answer, briefing, walkthrough, go-ahead, or review. Nothing actionable for you lives anywhere else: not in an agent's closing message, not in a session note.
- **[Ready to run](#ready-to-run)** — documentation work an agent can execute right now, sources in hand, in the order given.
- **[Not yet ready](#not-yet-ready)** — work that cannot usefully move at all, each row naming the state that would change that. If you or an agent could clear a blocker today, the row is in one of the sections above instead.
- **[Inventories](#inventories)** — supporting release state, drafts, task-owned questions, and unwritten pages. Every unfinished documentation action has a task in the action sections above.

Every row explains who acts next, what they do, and what it affects. **Ready for your input and Ready to run are not blocked sections:** their work is actionable now; only Not yet ready contains blocked work. Both actionable sections are deliberately ordered — the first row is the strongest next move for that actor — and there is no second priority scheme layered on top: position *is* the priority. Each item appears exactly once, in the section of whoever moves next.

Product pages carry review state in `status: draft`; the [draft inventory](#drafts-awaiting-review) mirrors it. Every unfinished documentation action — question, verification, review, ruling, missing content, or source request — belongs in a finite `tasks/` entry that owns `status` and `next_actor`; this board gives it one row and its place in the order. `status: ready` means the named actor can act now; `status: blocked` means an external prerequisite prevents either actor from moving. Knowledge gaps use source-acquisition tasks. Candidate product improvements follow [Product opportunities](../product-opportunities/backlog.md). Questions are plain work bullets in tasks, with context, evidence, and affected-page links. Conventions: [WORKFLOW.md](../../WORKFLOW.md#product-content-and-documentation-operations).

## Ready for your input

Ordered by how much each unblocks.

1. **[Review the remaining drafts](./tasks/review-remaining-drafts.md)** — **your review; ready now.** The eight-page foundational cohort is complete; its settled pages are cleared from draft. Review the remaining inventory, including Governance process, Execution routing, and Proposal creation. Optimistic governance remains with the safeguards review below; consume that outcome without duplicating it. The [post-merge recheck](./section-fit-and-location.md#post-merge-section-recheck) records the structural baseline.

## Ready to run

1. **[Transfer the 25 product opportunities to Linear or close them](./tasks/transfer-product-opportunities-to-linear.md)** — one item has been transferred and retired; 24 user stories remain. Resume relevance and duplicate checks, transfer useful work to Linear or record why it is irrelevant, then retire each local entry so the product board stays temporary intake.

2. **[Triage shared direct execution](./tasks/triage-shared-direct-execution.md)** — assess the owner's new candidate for offering direct execution in shared action flows, then transfer it to Linear or record a closure. This single-item intake is outside the existing batch of 25.

3. **[Review governance safeguards page boundaries](./tasks/review-governance-safeguards-page-boundaries.md)** — agent analysis of Optimistic governance, Multisig gates, Safe as a body, and the multisig and token-governance hardening guides. This task also owns the outstanding Optimistic governance review transferred from the completed foundational cohort. The Stages over direct permission grants merger into Multisig gates is applied; assess the resulting page as the baseline, then recommend which pages should remain distinct and where each section belongs. The later guide-portfolio review consumes this focused result.

## Not yet ready

Each row names the state that changes it. These tasks depend on the owner-review cycle and a sufficiently stable first version.

- **[Run the first post-review consistency sweep](./tasks/run-the-first-post-review-consistency-sweep.md)** — *blocked until the drafts inventory is empty, or you declare the first review cycle done.* One aggregate pass over the cycle's corrections: terminology drift between pages that never linked to each other, `source:` style, and the declared-but-unused `risk`/`example` type call. Structurally last, after the current owner-review cycle.
- **[Rethink the guide layer around platform use cases](./tasks/rethink-the-guide-layer.md)** — *blocked until v1 of the base is nearly complete.* A guide portfolio can only be derived from a stable capability and user-outcome surface, and the current owner review still settles that surface. It already carries three named candidates (a guardian-DAO setup guide — guardian DAOs being decentralized autonomous organizations governed by liquidity-provider tokens — composing proposal actions through an external dApp with WalletConnect, and the disposition of the existing multisig-gate guide).

## Inventories

Supporting lists, kept discoverable rather than in the action flow. Each mirrors state the graph owns — reconcile against the query, never hand-maintain a second copy.

### Page purpose and repository topology

[Page purpose and repository topology](./page-purpose-and-topology.md) records every durable platform page, every indexed upstream entry, operating-document roles, and the applied filing/type decisions. The completed [section audit](./section-fit-and-location.md) preserves the original 162 page assessments and 756 section units, plus the post-merge recheck of 16 pages and 89 sections with their final page-purpose verdicts; [maintenance navigation](./index.md) links the related evidence sets.

### App release documentation state

[App release documentation state](./app-release-state.md) is authoritative for the newest official stable app release observed, the release this base has been fully reconciled through, and the date that comparison was last checked. When the observed release moves ahead, change-space preparation queues one finite task under **Ready for your input** for the owner's release-by-release business context; the same task moves to **Ready to run** after that briefing is preserved. Version details stay on the state entry so this board does not become a second copy that drifts.

### Action-view evidence

[Basic action view audit](./basic-action-views.md) preserves the completed create/edit and details inventories, rendering paths, source snapshot and documentation structure decision. It distinguishes verified support in the inspected app and installed UI-kit from generic fallbacks, conditional availability and unverified deployment behavior.

### Application-page coverage

[Live application-page coverage](./application-page-coverage.md) maps all 17 live page families in app 1.39.0 to their canonical homes, with source revisions, information/actions, supported additions and exclusions. It preserves audience separately from rollout and deployment. The completed section audit retains all 17 page-family anchors and adds precise subsection links without repeating the route census.

### Consequential drill-down coverage

[Consequential drill-down coverage](./consequential-drill-down-coverage.md) accounts for all 17 live page families and reuses the 22 action identities. It records inspection routes and input methods, exact source revisions, canonical additions, adequate alternatives, and product candidates. Its findings use the settled page homes and were consumed by the completed section audit.

### Gauge configuration refusals

[Gauge configuration refusal comparison](./gauge-configuration-refusals.md) records the six live management forms, the three selectable plugin setups, Admin and SPP scope dispositions, exact source revisions, and the distinction between form checks and contract rejection. These findings underpin the designer's configuration cautions.

### Recovery without Execute

[Recovery verification](./recovery-without-execute.md) preserves the pinned permission, execution, factory, and upgrade evidence, including independently usable authority and the limits of self-held ROOT. These findings inform the completed Admin-alert verification.

### Product and internal classification

[Product/internal classification audit](./product-knowledge-audit.md) preserves the historical classification and source checks, with the current [user-facing exclusions](./product-knowledge-audit.md#user-facing-content-exclusions) and the applied reader-boundary refinements.

### Client-specific integrations

[Client-specific integrations](./client-specific-integrations.md) records named-client scope, documentation homes, and coverage limits for BENQI and Alchemix. Use it alongside product scope exclusions when interpreting source findings; a shared deployment method does not establish general availability.

### OSx orientation design

[OSx orientation design](./osx-orientation.md) and its [coverage map](./osx-orientation/coverage-map.md) preserve the owner decisions, the authorized summary boundary, the verified grant/revoke, indexing, audit and asset-scale evidence, the entry page's home, type, outline and navigation, and the contextual-edit plan applied to the four existing pages.

### Drafts awaiting review

`wiki --root . list --where status=draft` is authoritative — currently the 71 pages below, and nothing else. The owner's private `research/` workspace is deliberately outside both the index and this board, so its material never appears here whatever status it carries.

The owner completed the nine semantic anchors and the Member companion on 2026-09-10. Their corrections and the agent's cross-page consistency check were completed, and those ten pages were cleared of draft status at that review. They provide the semantic input for the structural audits; subsequent substantive changes return an affected page to draft.

The owner completed the eight-page foundational cohort on 2026-09-15 after transferring Optimistic governance to the safeguards review. Plugin compatibility, Aragon-deployed plugins, Contract upgrades, Target, Safe, Stage, Proposal, and Proposal status are reviewed and absent from this inventory. The [draft review assessment](./draft-review-priorities.md) preserves the original selection and graph snapshot; [log.md](./log.md) records completion. The remaining review follows the live draft query, including later additions and pages returned to draft by substantive changes. Optimistic governance remains draft under its dedicated review task.

**Governance** — [Admin flow](../../governance/admin-flow.md), [Aragon Notifications](../../governance/aragon-notifications.md), [BENQI lending-market gauges](../../governance/benqi-lending-market-gauges.md), [Body](../../governance/body.md), [Cross-chain execution](../../governance/cross-chain-execution.md), [Delegate profile record](../../governance/delegate-profile-record.md), [Gauge voting](../../governance/gauge-voting.md), [Governance designer](../../governance/governance-designer.md), [Removing a governance process](../../governance/process-removal.md), [Member](../../governance/member.md), [Multisig gates](../../governance/multisig-gates.md), [Optimistic governance](../../governance/optimistic-governance.md), [Plugin](../../governance/plugin.md), [Governance process](../../governance/process.md), [Proposal creation](../../governance/proposal-creation.md), [Proposal identifiers](../../governance/proposal-identifiers.md), [Safe as a body](../../governance/safe-as-a-body.md), [Token panel](../../governance/token-panel.md), [veLocker](../../governance/velocker.md).

**Accounts** — [Account creation](../../accounts/account-creation.md), [Dashboard](../../accounts/dashboard.md), [Executing on a linked account](../../accounts/executing-on-a-linked-account.md), [Linked account](../../accounts/linked-account.md), [Settings](../../accounts/settings.md).

**Treasury** — [Assets](../../treasury/assets.md), [Capital Distributor](../../treasury/capital-distributor.md), [Create transaction](../../treasury/create-transaction.md), [Transactions](../../treasury/transactions.md), [Vault](../../treasury/vault.md).

**Access control** — [Authorization and execution model](../../access-control/authorization-and-execution.md), [Permission Viewer](../../access-control/permission-viewer.md), [Scoped authority](../../access-control/scoped-authority.md).

**Design** — [Voting Terminal design reference](../design/voting-terminal-reference.md), [Alert severity](../design/alert-severity.md), [Control availability](../design/control-availability.md), [DAO slots](../design/dao-slots.md), [Preserve task context across dialogs](../design/dialog-continuity.md), [Dialog taxonomy](../design/dialog-taxonomy.md), [Normalize input without changing its meaning](../design/input-normalization.md), [Make user-supplied link destinations inspectable](../design/inspectable-link-destinations.md), [Refuse unsatisfiable configuration](../design/invariant-validation.md), [Plugin slots](../design/plugin-slots.md), [Use primary actions sparingly](../design/primary-action-hierarchy.md), [Show validation when it can help](../design/validation-timing.md).

**General** — [Aragon OSx and the platform](../../osx-and-the-platform.md), [Every element makes a claim](../design/principles/every-element-makes-a-claim.md), [Honest abstraction](../design/principles/honest-abstraction.md).

**Maintenance** — [Source repositories](./repositories.md).

**Application** — [Execution routing](../../application/execution-routing.md), [Alerts and advisories](../../application/alerts.md), [Metadata input](../../application/metadata-input.md), [Wizard](../../application/wizard.md), [Action builder](../../application/action-builder.md), [Action simulation](../../application/action-simulation.md), [Address display](../../application/address-display.md), [Address input](../../application/address-input.md), [App CMS](../../application/app-cms.md), [Aragon Names](../../application/aragon-names.md), [Aragon Profiles](../../application/aragon-profiles.md), [Basic action views](../../application/basic-action-views.md), [Collection pages](../../application/collection-pages.md), [Connecting a Safe](../../application/connecting-a-safe.md), [Explore page](../../application/explore-page.md), [Getting help](../../application/getting-help.md), [Submitting a transaction](../../application/submitting-a-transaction.md), [Supported chains](../../application/supported-chains.md), [Wallet connection](../../application/wallet-connection.md).

**Guides** — [Choose a voting-power mechanism for token governance](../../guides/choose-token-voting-power-mechanism.md), [Harden token governance against governance attacks](../../guides/harden-token-governance-against-attacks.md), [Add a multisig gate to an advanced governance process](../../guides/multisigs-in-advanced-governance.md), [Choose between a Safe and an Aragon multisig](../../guides/safe-vs-aragon-multisig.md).

### Documentation questions

Unresolved questions live in the finite tasks above. Query `wiki --root . list --where type=task --where next_actor=owner` for owner work and `wiki --root . list --where type=task --where next_actor=agent` for agent work; `wiki --root . backlinks <page>` finds the tasks affecting a page. There are no remaining platform documentation-question checkboxes. `wiki --root . checkboxes` reports procedural checklists, including the read-only upstream deployment checklist.

### Unwritten pages (promised by links)

`wiki --root . unresolved` is authoritative; currently empty.

### Product scope exclusions

[Product scope exclusions](./product-scope-exclusions.md) is the source of truth for implemented source surfaces deliberately left out of current product documentation until they are live. Its **Product opportunity** column links any distinct candidate improvement without turning the exclusion itself into a roadmap item.

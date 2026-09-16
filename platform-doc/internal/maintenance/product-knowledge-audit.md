---
type: reference
title: Product/internal classification audit
tags: [maintenance, cross-cutting, design]
source: product/internal content separation pass over every canonical platform page (2026-09-10, see log.md) + product-owner briefings (2026-09-11, see log.md) + classification verification at app@adad67873c8f9dd75e3ed340b70df3e985ae3557 (2026-09-13, see log.md), app-backend@107103b4cc9d8f778c78e09c7265f9a4ead89d6e, gov-ui-kit@2.11.4, and @tiptap/extension-link@3.30.3 + product-owner BENQI scope clarification (2026-09-13, see log.md) + product-owner reader-boundary review and proposal metadata example (2026-09-14, see log.md)
---

# Product/internal classification audit

**Current reader selection:** The [user-facing exclusions](#user-facing-content-exclusions) and [applied refinements](#reader-boundary-refinements-2026-09-14) reflect the owner's 2026-09-14 decisions. They supersede earlier audience and filing descriptions.

**Historical structure:** The [page-overlap and location follow-up](./section-fit-and-location.md#page-overlap-and-location-follow-up) supersedes this pass’s separate behavior/design homes and affected filing decisions. Tables below retain the dated audit baseline; links follow surviving canonical homes.

Working inventory for the completed `separate-product-knowledge-from-internal-guidance` task. Every canonical platform page (concept, capability, pattern, decision, principle, reference, guide) and every index was read and classified by what its content does, independently of folder, type, and review status, against the owner's test: **product knowledge** explains what Aragon is, what users can do, how features behave, and their limits; **internal guidance** tells designers or engineers how to build, name, structure, or implement features, including design principles and their rationale; **mixed** pages contain both. The protocol-doc submodule, assistant instructions, and indexing configuration were outside the task.

## Result

| Classification before the pass | Pages | After the pass |
| --- | --- | --- |
| Product | 48 | Kept; link retargets only where a design page was the link target for behavior. |
| Internal | 10 | Kept in place; each product fact they cite already has a product home. |
| Mixed | 28 | 14 product pages trimmed of builder-directed passages; 14 design pages reduced to rules with their behavior moved to product homes. |
| Documentation operations | 7 | Out of scope (release state, scope exclusions, maintenance references). |

Five new product pages received behavior previously reachable only through design pages: [Submitting a transaction](../../application/submitting-a-transaction.md), [Collection pages](../../application/collection-pages.md), [Getting help](../../application/getting-help.md), [Wallet connection](../../application/wallet-connection.md), and [Address input](../../application/address-input.md). At this classification snapshot they inherited `type: pattern` and `status: draft`. The completed [purpose and topology audit](./page-purpose-and-topology.md) settles their current types and homes: three capabilities and two references, with shared behavior under Application and wallet identity under Accounts. All remain draft. The tables below preserve this classification pass's historical types and counts; links follow current homes.

## Pages intended for the assistant

Use [the workflow's reader boundary](../../WORKFLOW.md#user-facing-content-and-existing-metadata) to select established app behavior, constraints, and user choices from the platform graph. This includes the product root, canonical entries in Accounts, Governance, Treasury, Access control and Application, and user guides with their navigation. Tasks and opportunities now live under the same internal boundary as the other contributor material.

Client-specific behavior remains product knowledge for that client. Preserve named-client and deployment qualifications; the [client scope register](./client-specific-integrations.md) records the owner rulings. Review status does not establish deployment or audience.

## User-facing content exclusions

**Exclude `internal/` from user-facing content selected from the wiki index.** This one boundary covers design guidance and principles, documentation operations and tasks, history, and product opportunities. [Internal navigation](../index.md) keeps all of it available to contributors.

The material remains in the wiki index and its link checks. Ignored operating/source files are already outside that index; `protocol-doc/` remains a separate, optional source of deeper explanation rather than part of the default platform corpus.

Types describe entries and tags describe topics. Neither determines the audience: product patterns, decisions, references, and pages tagged `design` or `repositories` remain included outside `internal/`. Keep review status and client/deployment qualifications independent. Reserved indexes and logs use their normal frontmatter convention, with only `okf_version` on the product root.

## Reader boundary refinements (2026-09-14)

The owner subsequently chose one physical audience boundary. All 71 existing internal entries moved under `internal/`, including the principle collection, documentation tasks, and the 24 remaining opportunities with their board. The earlier content separation below remains intact; reserved-file tags were removed. No type, review state, task state, opportunity disposition, or product behavior changed in this relocation.

| Subject | Applied disposition and distinct purpose |
| --- | --- |
| [Source repositories](./repositories.md) | Now under `internal/maintenance/`, retaining `type: reference` and its existing topic tags. Updated the operating skills' lookup path. |
| [Metadata input](../../application/metadata-input.md) | Moved intact into Application; added the owner's proposal JSON example, preserving the title, summary, HTML description, and optional resource label with a plain URL. |
| [Wizard](../../application/wizard.md) | Rehomed in Application with retained input, nesting, submission and exit warnings together. Container choices moved to [Dialog taxonomy](../design/dialog-taxonomy.md#choosing-a-wizard-container), and footer placement to [Primary-action hierarchy](../design/primary-action-hierarchy.md#keep-hierarchy-separate-from-availability-and-severity). No second wizard behavior page remains. |
| [Alerts and advisories](../../application/alerts.md) / [Alert severity](../design/alert-severity.md) | Application explains the notices a person encounters and their lifetime; Design explains how to choose severity, interruption and placement across features. Their openings and links make the two questions explicit. |
| [Proposal](../../governance/proposal.md) / [Voting Terminal design reference](../design/voting-terminal-reference.md) | Proposal retains voting behavior. The separate builder lookup preserves component, Storybook and Figma references. |
| Navigation and metadata | The product root retains user routes; `internal/index.md` provides contributor navigation. The unchanged protocol snapshot remains in maintenance. Typed pages retain tags; reserved indexes and the log have no frontmatter, except the product root's `okf_version`. |
| Reading dependencies | Checked links from every included page into excluded local material. Retargeted useful behavior references, removed builder-only navigation while retaining product explanations, and kept the protocol repository map as optional audit lookup. |

The remaining inventory records the historical classification pass, not the current page count or an audience allowlist.

## Inventory

Type and status are the page's own; classification is the reading before the pass; the disposition is what was done.

### Root

| Page | Type | Status | Classification | Reason | Disposition |
| --- | --- | --- | --- | --- | --- |
| [Value proposition](../../value-proposition.md) | concept | draft | Product | Promise and differentiating capabilities. | Kept. One example added to review-semantic-anchors as a bounded question. |
| [Platform design principles](../design/principles.md) | concept | draft | Internal | Design principles and their rationale, addressed to feature builders. | Kept at root: voice.md and WORKFLOW.md pin the path. Every product fact it states has a product home except the backend-indexing sentence placed here by owner ruling (question added to review-semantic-anchors). |
| [Honest abstraction](../design/principles/honest-abstraction.md) | principle | draft | Internal | Calibration rationale directing exposure depth. | Kept. Its advanced-designer availability sentence is owner ruling 1. |
| [Aragon-deployed plugins](../../application/aragon-deployed-plugins.md) | concept | draft | Product (one imperative) | Delivery category and its limits. | Restated the `isSupported` imperative as a fact; added the Add-voting-body picker's missing contact entry point. |
| [Supported chains](../../application/supported-chains.md) | reference | draft | Product | Availability reference; partly generated by a skill. | Kept. |
| [App CMS](../../application/app-cms.md) | reference | draft | Product | Curation mechanism and its limits. | Trimmed the checkout-status clause; retargeted the datalist link to Collection pages. |
| [Source repositories](./repositories.md) | reference | draft | Internal | Engineering orientation into checkouts. | Kept at root: two skills reference the path. Not fed to the assistant. |
| [Submitting a transaction](../../application/submitting-a-transaction.md) | pattern | draft | Product (new) | Transaction dialog, exit guard, wrong chain, retries, resumption. | Split from design/transaction-submission.md and design/wizard.md. |
| [Collection pages](../../application/collection-pages.md) | pattern | draft | Product (new) | The four list pages' tabs, loading, empty and failed states, ordering, batch sizes, URL persistence, support routes on failure. | Split from design/datalist-page.md, design/alert-severity.md, and design/reach-out-to-the-team.md. |
| [Getting help](../../application/getting-help.md) | pattern | draft | Product (new) | Support link, Report issue, the three Get-in-touch surfaces, limits stated without a way through. | Split from design/reach-out-to-the-team.md. |
| [App release documentation state](./app-release-state.md), [Product scope exclusions](./product-scope-exclusions.md) | reference | — | Documentation operations | Release checkpoint; publication-scope rulings. | Out of scope. |
| [Basic action view audit](./basic-action-views.md) and its four parts | reference | — | Documentation operations | Source evidence for a completed mining task. | Out of scope. |

### Accounts

| Page | Type | Status | Classification | Reason | Disposition |
| --- | --- | --- | --- | --- | --- |
| [Account](../../accounts/account.md) | concept | draft | Mixed | Product vocabulary and presentation; three clauses instruct writers which word to use. | Kept unchanged: voice.md names this page as the copy rule's owner. Owner ruling 12. |
| [Account creation](../../accounts/account-creation.md) | capability | draft | Product | Entry points, wizard, deployment. | Moved the general wallet-connection precondition to Wallet connection; retargeted links to Getting help and Submitting a transaction. |
| [Admin flow](../../governance/admin-flow.md) | concept | draft | Mixed | Bootstrap state; two passages restated slot-registration mechanics. | Trimmed both to the product fact; completed the onboarding cards' titles, tag, and order from the reach-out page. |
| [Admin management](../../governance/admin-flow.md#admin-controls) | capability | draft | Product | Controls and guards. | Kept. |
| [Install admin plugin by default](../../governance/admin-flow.md#starting-with-admin) | decision | draft | Product | Rationale for current behavior. | Kept. |
| [Aragon Names](../../application/aragon-names.md), [Aragon Profiles](../../application/aragon-profiles.md), [Claiming an Aragon Name](../../application/aragon-names.md#claiming), [ENS as the profile layer](../../application/aragon-profiles.md#ens-as-the-profile-layer) | capability / decision | draft | Product | Identity cluster behavior and its decision. | Kept. |
| [Connecting a Safe](../../application/connecting-a-safe.md), [Safe](../../accounts/safe.md) | capability / concept | draft | Product | Connection route and definition. | Kept. |
| [Contract upgrades](../../accounts/contract-upgrades.md) | capability | draft | Product | Governed upgrade path. | Kept. |
| [Dashboard](../../accounts/dashboard.md) | capability | draft | Mixed (minor) | Header described in slot-registry vocabulary. | Reframed the header as behavior; added that bespoke content ships with a release with no runtime configuration; retargeted the datalist link. |
| [Explore page](../../application/explore-page.md) | capability | draft | Product | Landing surface. | Completed the getting-started cards' labels, tag, order, and unconditional display. |
| [Executing on a linked account](../../accounts/executing-on-a-linked-account.md) | capability | draft | Product | Flow and nested-action reading. | Removed a pattern-conformance sentence. |
| [Removing the last governance process](../../governance/process-removal.md) | decision | — | Product | Warn-never-block rule. | Kept. |
| [Linked account](../../accounts/linked-account.md), [Linked-account signaling](../../accounts/linked-account.md#establishing-the-relationship), [Linking does not imply control](../../accounts/linked-account.md#linking-does-not-imply-control) | concept / decision | draft | Product | Abstraction, signal, and rule. | Kept. |
| [Wallet connection](../../application/wallet-connection.md) | pattern | draft | Product (new) | Connection precondition, connection dialog, wallet-requiring dialogs. | Split from accounts/account-creation.md, design/dialog-taxonomy.md, and design/alert-severity.md. |
| [Address input](../../application/address-input.md) | pattern | draft | Product (new) | Checksum, ENS resolution, controls, address displays. | Split from design/address-input.md and design/abstract-then-drill-down.md. |

### Governance

| Page | Type | Status | Classification | Reason | Disposition |
| --- | --- | --- | --- | --- | --- |
| [Governance process](../../governance/process.md) | concept | draft | Mixed | One clause told feature builders to agree on vocabulary. | Rewritten as the behavior it described. Its linked-account feature-flag sentence is owner ruling 8. |
| [Body](../../governance/body.md) | concept | draft | Mixed | One sentence directed UI, permissions, and analytics implementation. | Deleted; added that a multisig body has no participation panel; retargeted the metadata link to Plugin and the reach-out link to Getting help. |
| [Plugin](../../governance/plugin.md) | concept | draft | Mixed | A code-partitioning description and an "app must never reason" directive. | Deleted both, keeping the facts; added that the staged proposal processor never appears in the picker. |
| [Target](../../governance/target.md) | concept | draft | Product | Execution endpoint semantics. | Kept. |
| [Action](../../governance/action.md) | concept | draft | Mixed | A signing obligation and an integration-standards heading. | Obligation reworded as behavior; the prepare/show contract moved to design/plugin-slots.md; section renamed *Actions are validated one at a time*. |
| [Proposal](../../governance/proposal.md) | concept | draft | Product | Unified proposal model. | Added *The proposal page* (decision surface, tabs, disabled states, admin notice, resource display) from design/voting-terminal.md and design/inspectable-link-destinations.md. |
| [Proposal creation](../../governance/proposal-creation.md) | capability | draft | Product (one fragment) | One sentence restated design rationale. | Deleted it; added the at-least-one-proposer refusal, the resource shape, the title trim, and the validation example; retargeted links. |
| [Proposal status](../../governance/proposal-status.md) | concept | draft | Product (one fragment) | "Latent defect in the code" characterization. | Trimmed; retargeted two links. |
| [Proposal identifiers](../../governance/proposal-identifiers.md) | concept | draft | Product (one fragment) | Indexer-triage clause. | Trimmed the triage clause, kept the hedge (owner ruling 9); dropped the pattern link. |
| [Staged proposals](../../governance/proposal.md#staged-proposals) | concept | draft | Product | Consolidated proposal and advancement. | Added *On the proposal page* (stage accordion, advance countdowns and control). |
| [Stage](../../governance/stage.md) | concept | draft | Product | Stage abstractions and SPP disposition. | Added the body-threshold refusal and *How the proposal page presents a stage* (approving and vetoing roles, mixed stages, manual bodies, timelock states). |
| [Optimistic governance](../../governance/optimistic-governance.md) | concept | draft | Product | Decision pattern and attention risk. | Retargeted the Voting Terminal link to Stage. |
| [Multisig gates](../../governance/multisig-gates.md) | concept | draft | Product (audience flag) | Configuration guidance for organizations. | Retargeted the Voting Terminal link. Owner ruling 14. |
| [Safe as a body](../../governance/safe-as-a-body.md) | capability | draft | Product (one fragment) | "Revisitable later" aside. | Removed the aside; merged the Safe's proposal-page rendering and single-object rationale from design/voting-terminal.md. |
| [Stages over direct permission grants](../../governance/multisig-gates.md#stages-over-direct-permission-grants) | decision | draft | Product | Configuration rule with behavioral consequences. | Retargeted three Voting Terminal links. |
| [Governance designer](../../governance/governance-designer.md) | capability | — | Mixed | Five clauses restated design-library rules or named internal components. | Trimmed all five; added the Advanced-on-request panel, the read-only process page's missing edit and contact controls, the support-threshold and participation bounds, the minority advisory, the multisig threshold bound, and the add-body form gating. |
| [Token panel](../../governance/token-panel.md) | capability | draft | Mixed | Three conformance and component-mounting clauses. | Deleted or reworded; the hidden-delegation instance moved to design/control-availability.md; retargeted links to Collection pages and Address fields. |
| [veLocker](../../governance/velocker.md), [Delegate profile record](../../governance/delegate-profile-record.md), [Basic action views](../../application/basic-action-views.md), [Cross-chain execution](../../governance/cross-chain-execution.md), [Action simulation](../../application/action-simulation.md) | various | draft / — | Product | Behavior, limits, and catalogue. | Kept; Basic action views gained the metadata-update preservation facts and a renamed anchor. |
| [Gauge voting](../../governance/gauge-voting.md) | capability | draft | Mixed | A code identifier, a metadata-modelling rule, and component-mounting detail. | Trimmed to the user-visible facts. Its em-dashed display clause is owner ruling 10. |
| [Capital Distributor](../../treasury/capital-distributor.md) | capability | draft | Product | Campaigns and claiming. | Reworded the metadata-pattern sentence as the form's fields. |
| [Aragon Notifications](../../governance/aragon-notifications.md) | capability | draft | Mixed (one clause) | Named the maintaining codebase. | Deleted the clause. |
| [Action builder](../../application/action-builder.md) | capability | draft | Mixed | A quality-bar clause and a conformance clause. | Deleted the conformance clause; the opening's quality bar is owner ruling 11 and shared with clean-up-authoring-labels-in-product-prose. |

### Treasury and access control

| Page | Type | Status | Classification | Reason | Disposition |
| --- | --- | --- | --- | --- | --- |
| [Vault](../../treasury/vault.md) | concept | draft | Product | Why the account is the treasury. | Kept. |
| [Assets](../../treasury/assets.md), [Transactions](../../treasury/transactions.md) | capability | draft | Product | Coverage, indexing, tabs, dialogs. | Retargeted datalist and reach-out links. |
| [Create transaction](../../treasury/create-transaction.md) | capability | draft | Mixed | One paragraph audited rounding against the pattern library. | Deleted the audit sentences (the opportunity page owns the comparison); kept the rounding behavior; added the exit-guard release rule. |
| [Authorization and execution model](../../access-control/authorization-and-execution.md) | concept | — | Mixed | Closing sentence assigned "the design task". | Reframed as a statement. |
| [Gradual permission handover](../../access-control/gradual-permission-handover.md) | pattern | — | Product | Addresses organizations, not builders. | Kept in access-control. Owner ruling 13. |
| [OSx authorization paths](../../access-control/osx-authorization-paths.md), [Permission Viewer](../../access-control/permission-viewer.md), [Scoped authority](../../access-control/scoped-authority.md) | reference / capability / concept | — / draft / — | Product | Analyst-facing procedure, capability, and rule. | Kept. |

### Design

| Page | Type | Status | Classification | Reason | Disposition |
| --- | --- | --- | --- | --- | --- |
| [Every element makes a claim](../design/principles/every-element-makes-a-claim.md) | principle | draft | Internal | Builder test and prohibitions. | Kept; its one example is homed on Proposal creation. |
| [Control availability](../design/control-availability.md) | pattern | draft | Internal | Treatment table and decision sequence. | Kept; gained the hidden-delegation worked instance. |
| [Refuse unsatisfiable configuration](../design/invariant-validation.md) | decision | draft | Mixed | Boundary rule plus the designer's concrete refusals. | Refusals moved to Governance designer, Proposal creation, and Stage; the page keeps the rule and links. |
| [Normalize input without changing its meaning](../design/input-normalization.md) | pattern | draft | Internal | Decision table for builders. | Kept; the title-trim example is homed on Proposal creation. |
| [Show validation when it can help](../design/validation-timing.md) | pattern | draft | Internal | Prescribes message timing. | Kept; the Create Proposal example is homed on Proposal creation; the moving-back claim is owner ruling 3. |
| [Address input](../../application/address-input.md) | pattern | draft | Mixed (product-dominant) | Only the opening instructed builders. | Rewritten as the reuse rule; behavior on Address fields. |
| [Datalist page](../../application/collection-pages.md) | pattern | draft | Mixed (product-dominant) | Mostly user-visible collection behavior. | Rewritten as design rules; behavior on Collection pages. |
| [Wizard](../../application/wizard.md) | pattern | draft | Mixed | Container rules plus the exit guard's behavior. | Exit-guard section reduced to its design choices; behavior on Submitting a transaction. |
| [Metadata input](../../application/metadata-input.md) | pattern | draft | Mixed | Common shape and IPFS abstraction plus placement rule. | Residual facts homed (resource shape on Proposal creation; update preservation on Basic action views); pointer sentence to the product homes added. |
| [Full-screen wizard](../../application/wizard.md#full-screen-wizard) | pattern | draft | Internal | Container-choice rule with an instance list already homed. | Kept. |
| [Transaction submission stepper](../../application/submitting-a-transaction.md) | pattern | draft | Mixed (product-dominant) | Almost entirely dialog behavior. | Rewritten as design rules and ownership; behavior on Submitting a transaction. |
| [Dialog taxonomy](../design/dialog-taxonomy.md) | pattern | draft | Mixed | Taxonomy and component mapping plus wallet-readiness behavior. | Wallet-readiness reduced to the rule; behavior on Wallet connection. Stacked-dialog sentence is owner ruling 5. |
| [Preserve task context across dialogs](../design/dialog-continuity.md) | pattern | draft | Internal | Directives on stacking, replacing, queuing. | Kept; examples now link to their homes and the onboarding-prompt rule links to its opportunity. Restoration claim is owner ruling 4. |
| [Make user-supplied link destinations inspectable](../design/inspectable-link-destinations.md) | pattern | draft | Mixed | Presentation rule asserting current treatment. | Standalone-resource treatment homed on Proposal; inline case is owner ruling 2. |
| [Use primary actions sparingly](../design/primary-action-hierarchy.md) | pattern | draft | Internal | Directive throughout. | Kept; label examples are owner ruling 7. |
| [Abstract, then offer a drill-down](../design/principles/honest-abstraction.md#abstract-then-offer-a-drill-down) | pattern | draft | Mixed | Instances list; one fact only here. | Address-display fact moved to Address fields; the instance stays as a link. |
| [Reach out when the abstraction cannot stay honest](../../application/getting-help.md#when-the-app-needs-the-aragon-team) | pattern | draft | Mixed (product-dominant) | Entry points and support routes. | Rewritten as the boundary rule with links; routes on Getting help, surfaces on Governance designer, Admin flow, Explore page, Partially supported plugins. |
| [Plugin slots](../design/plugin-slots.md) | pattern | draft | Mixed (internal-dominant) | Architecture plus picker-selectability facts. | Facts homed on Plugin, Body, Governance designer; gained the action-integration contract from Action. |
| [DAO slots](../design/dao-slots.md) | pattern | draft | Mixed (internal-dominant) | Mechanism plus the release-only limit. | Limit homed on Dashboard. |
| [Voting Terminal](../../governance/proposal.md#voting) | pattern | draft | Mixed (product-dominant) | Mostly what the proposal page shows. | Rewritten as hierarchy, stories, assembly rules, implementation scope; behavior on Proposal, Staged proposals, Stage, Safe as a body. Acceptance case is owner ruling 6. |
| [Alert severity](../design/alert-severity.md) | pattern | draft | Mixed | Severity rule plus surface facts. | SDK-notice fact homed on Wallet connection; failure summary links Collection pages. The severity vocabulary itself stays internal as presentation guidance. |

### Guides and indexes

| Page | Classification | Disposition |
| --- | --- | --- |
| The four guides | Product | Kept; the advanced-governance guide lost its pattern label and both guides citing the Voting Terminal now cite the proposal page. |
| Root [index](../../index.md) | Mixed | Product front door kept; the feature-building reading order, vocabulary instructions, and Design bullet moved into a fenced *Build or change the platform* section and the [design index](../design/index.md); the scope-boundary filing rule reduced to a reader sentence (WORKFLOW.md owns the rule). |
| [Design index](../design/index.md) | Internal | Now opens with the reading order and carries pointers from each reduced pattern to its product home. |
| Accounts, governance, treasury, access-control, guides indexes | Product | Accounts gained the two new pages and lost the slot vocabulary; the others were unchanged. |

## Classification follow-up

Nine of the original fourteen passages are settled:

- Advanced governance creation requires Aragon; current pages and guides use the On request route.
- Validation and nested-dialog continuity remain concise design guidance, without blanket claims about focus, scroll, or every existing flow.
- Primary-action labels are naming examples, not an inventory of current UI labels.
- The reviewed Governance process page already establishes linked-account process visibility; the stale feature-flag question is closed.
- The completed action-builder cleanup already removed the comparative claim; it does not need a second approval.
- The reviewed Account page retains the product vocabulary and its copy rule, consistent with voice.md.
- Gradual permission handover is an optional product pattern Aragon sometimes recommends when appropriate.
- Multisig guidance retains the explicit-stage recommendation and direct-grant tradeoffs; commentary about a customer's motives is removed.

The five source checks were resolved on 2026-09-13 in `rule-on-product-internal-classification-ambiguities`. Their dispositions below supplement the original inventory; the source pass does not approve existing drafts or repeat the nine settled rulings.

## Verified source dispositions

Evidence baseline: released [app 1.39.0](https://github.com/aragon/app/tree/adad67873c8f9dd75e3ed340b70df3e985ae3557), the published `@aragon/gov-ui-kit@2.11.4` and `@tiptap/extension-link@3.30.3` packages locked by that release, and the clean local [app-backend snapshot](https://github.com/aragon/app-backend/tree/107103b4cc9d8f778c78e09c7265f9a4ead89d6e). The backend revision is source evidence, not an assertion about its deployed revision. These are code-path findings; no production browser session or cross-browser keyboard/touch test was performed.

| Question | Disposition | Product home and follow-through |
|---|---|---|
| Inline-link destination inspection | The app renders ordinary anchors without an app-provided destination preview or inspection action on focus or tap. Browser inspection varies by browser and input method. The design requirement remains distinct from this behavior. | Added the limit to [Proposal](../../governance/proposal.md#proposal-details-page) and [Member](../../governance/member.md#identifying-a-member). Candidate `inspect-inline-link-destinations` is on the product-opportunities board. |
| Nested-dialog wallet readiness | The transaction retry warning is wallet-gated and closes with its parent. A separate reachable profile-introduction path leaves the child open when the connected-wallet menu closes on disconnect. | Updated [Wallet connection](../../application/wallet-connection.md#dialogs-that-need-a-wallet) and generalized the [build rule](../design/dialog-taxonomy.md#wallet-readiness) to include parents that handle disconnect themselves. Candidate `close-profile-introduction-on-disconnect` is on the product-opportunities board. |
| Veto after approval | Confirmed for the current mixed stage, including `ADVANCEABLE` and final-stage `ACCEPTED`: the veto requirement and body controls remain while the veto window is open. Body-specific vote eligibility still applies. | Clarified [Stage](../../governance/stage.md#how-the-proposal-page-presents-a-stage); [Voting Terminal](../../governance/proposal.md#voting) retains its supported assembly rule. Removed the stale unresolved-question directions from the foundational review task and assessment. |
| Proposal-slug uniqueness and stability | The key is reserved per account/network; the number is assigned per plugin/network from stored history. Normal replay preserves existing records. Allocation and storage do not establish a concurrent-writer or rebuild guarantee; key updates also change existing proposals' slugs. The details route uses the current slug, not a bare onchain ID. | Replaced the expectation with the bounded behavior and durable-reference guidance in [Proposal identifiers](../../governance/proposal-identifiers.md#the-slug). No new product guarantee or owner ruling is inferred. |
| BENQI lending-market gauge display | Voting list and details use gauge metadata and address, without separate registration-triple fields. Register action Basic details show all three fields; the unregister selector and Basic details use the resolved gauge's name/avatar/address. The owner subsequently clarified that this integration is BENQI-specific. | Retained the verified behavior in [BENQI lending-market gauges](../../governance/benqi-lending-market-gauges.md) and scoped the [action catalogue subsection](../../application/basic-action-views.md#benqi-lending-market-actions) to BENQI. Removed the general deployment implication; shared Gauge voting retains its existing scope. Source verification established presentation, not the supported client audience. |

### Evidence and limits

- **Links:** app `daoProposalDetailsPageClient.tsx` and `delegationStatementCard.tsx` both mount `SafeDocumentParser`, which sanitizes content and passes it to the locked UI kit's `DocumentParser`. The published bundle configures a non-editable Tiptap editor with `StarterKit.configure({link: {openOnClick: false}})`, Image, and Markdown; it adds no destination-preview UI. The locked link extension's `renderHTML` produces an anchor; its click handler returns without handling a non-editable view. Disabling the editor's click handler therefore does not disable native anchor navigation. Neither the callers nor these extensions add focus/touch inspection. This establishes the absence of an app preview, not the absence of browser status, context-menu, long-press, or assistive-technology facilities. The UI-kit tarball's SHA-512 matches the release lockfile (`sha512-wgc9uXzNPONh4w/+0wI72C6LqOuJXOhAe/AbaQ2bb/1n8OipKcKff0S3Gy4a+OmmQ1QSX18FgXLqafA9GdIi+w==`).
- **Wallet dialogs:** app `dialogProvider.tsx` stacks only when `stack: true` and `close(id)` removes only that ID. `dialogRoot.tsx` removes wallet-gated components from rendering when the address is absent and closes their locations only after connecting/reconnecting settles. It does not recursively close descendants. `transactionDialog.tsx` stacks `RETRY_TRANSACTION_WARNING`, and `applicationDialogsDefinitions.ts` marks that warning `requiresWallet: true`. Separately, `userDialog.tsx` stacks `ARAGON_PROFILE_INTRO` and closes itself on address loss; the intro registration has no wallet flag and `aragonProfileIntroDialog.tsx` has no disconnect guard. Its Cancel action remains available. Scanning the stack call sites distinguishes these from action selectors opened over wallet-independent composition forms and from the excluded Capital Flow surfaces. Temporary wallet settling retains dialog locations but unmounts wallet-dependent components; it does not prove preservation of their local form state.
- **Mixed stages:** app `sppStageUtils.ts` implements `canBodyVote` and `isVetoWindowOpen`: beyond `ACTIVE`, only veto bodies in `ADVANCEABLE` or `ACCEPTED` qualify, requiring the current stage, an unmet positive veto threshold, and a future end time. `sppVotingTerminalBodyContent.tsx` uses that verdict to render the body's submit-vote slot; the Token Voting, Multisig, Lock to Vote, and manual-body controls retain their own participant checks. `sppVotingTerminalBodySummaryFooter.tsx` keeps the veto requirement beside the stage status while that window remains open. Existing source regression cases cover advanceable/final accepted stages, elapsed windows, past stages, approving bodies, and reached veto thresholds; they were inspected, not executed in this documentation pass.
- **Identifiers:** backend `proposalHandler.ts:proposalCreated` skips an existing transaction/plugin/onchain-ID record before assignment, then calls `Proposal.getNextIncrementalId` and creates the record in separate operations. `models/schema/proposal.ts` reads max `incrementalId` plus one within plugin/network and has no unique constraint on that tuple. `logProcessingEngine.ts:sortLogs` sorts by block, transaction, and log position; that ordering does not make the separate allocation atomic or establish invariant replay after rebuilding history. `models/schema/pluginSlug.ts` does enforce account/key/network uniqueness, and `helpers/pluginSlug.ts` retries conflicting keys with suffixes. `metadataHandler.ts` updates the reserved key from metadata. `proposalUtils.ts` in the app builds slugs from that current key and routes linked-account proposals to their owning account. `DaoProposalDetailsPage` calls `getProposalBySlug`; backend `ProposalController.getProposalBySlug` splits a key-number pair and looks up the plugin and stored incremental number. Its separate database-ID endpoint is not an onchain-ID fallback for the page. No production collision, renumbering incident, or deployed-backend revision was established.
- **Gauges:** app `gaugeVoterGaugeListItemStructure.tsx`, `gaugeVoterGaugeDetailsDialog.tsx`, and `gaugeVoterGaugeDetailsDialogContent.tsx` render name/avatar/address, votes, description, resources, and holder participation without reading qiToken/incentive/controller fields. `gaugeRegistrarRegisterGaugeActionDetails.tsx` renders those decoded registration inputs and the two explorer links. `gaugeRegistrarUnregisterGaugeActionDetails.tsx` resolves `getGaugeAddress(qiToken, incentive, rewardController)` and supplies the joined record to `GaugeRegistrarGaugeListItem`, whose rendered fields are name, avatar, and gauge address. Carrying the triple in that record does not make it visible in the selector or Basic details. During composition, the unregister form sets `gaugeToRemove`; its deferred preparation callback encodes the triple, while the catalog initially supplies blank `inputData.parameters` values. The locked UI kit’s Decoded view reads those parameters directly, so the guidance to inspect Decoded applies to a published proposal, not to the unprepared selection.

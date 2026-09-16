---
type: reference
title: Page and section inventory
tags: [maintenance, cross-cutting]
source: section audit of the 2026-09-13 platform worktree after the completed purpose/topology pass; owner-requested post-merge section recheck (2026-09-13); existing source provenance retained
---

# Page and section inventory

The [decision record](../section-fit-and-location.md#post-merge-section-recheck) owns scope and final page-purpose verdicts. The current table set accounts for **89 starting section units across 16 scoped pages after consolidation**; it is separate from the preserved original 162-page, 756-section baseline below. H1 includes the opening; a parent with no direct prose owns its group. New headings are named in the disposition of the section that supplied their content.

## Post-merge section dispositions

**2026-09-15 foundational review complete:** The owner transferred Optimistic governance to `review-governance-safeguards-page-boundaries` and closed the remaining eight-page cohort. Plugin compatibility, Aragon-deployed plugins, Contract upgrades, Target, Safe, Stage, Proposal, and Proposal status are reviewed. This supersedes the pending-review statements in the dated dispositions below. Process now owns staged configuration options; Proposal retains the staged lifecycle. The close-out is recorded in [log.md](../log.md).

**2026-09-15 Stage/Proposal merger:** The owner accepted the Proposal-merge argument from the three-agent comparison and instructed implementation. The [applied section map](../section-fit-and-location.md#applied-section-map) supersedes the Stage, Staged proposals, and Proposal dispositions in the earlier tables below. [Stage](../../../governance/stage.md) retains individual-stage configuration and presentation; [Proposal](../../../governance/proposal.md#staged-proposals) absorbs staged lifecycle, reporting, advancement, final execution, and configuration limits, with stage sequence and advance controls under its details page. The Staged proposals entry is retired. Incoming links retain direct access to each subject, and the nine-page foundational review now includes Proposal in the retired page's place. Both survivors remain draft.

**2026-09-15 Execution routing review:** Renamed the shared pattern from Execution route selection to [Execution routing](../../../application/execution-routing.md). Its opening starts with an address holding Execute permission and calling `DAO.execute`. **Direct execution** precedes **Execution through governance**, which explains the plugin's proposal lifecycle and contains **Choosing a process** and **Creation requirements**. **Preparing and submitting actions** covers manual composition and use case-specific flows that assemble the necessary contract calls for the user. Retain the page under Application for shared interaction behavior. [Action](../../../governance/action.md#action-arrays-and-execution) already owns the foundational execution/proposal explanation; link to it with a short summary here. Authorization and execution retains the generic call/authority model. The selector still offers process plugins only, and direct execution keeps its separate current entry point. Rename backlinks and current records; preserve draft state and the existing review assignment.

**2026-09-15 Target review:** The owner's review supersedes Target's baseline purpose and sections below. [Target](../../../governance/target.md) remains a Governance concept explaining call destinations in account and plugin execution. Its opening defines a target and introduces the general call/authorization model before summarizing the two governance call stages. **Action targets** now comes first: it explains destination, calldata, ERC-20 and protocol-parameter examples, calls to the account itself, and the account's identity at a protected target. **Plugin targets** then combines executor selection with the two supported process/body configurations, Execute permission, and the setup caution. The linked-account example leaves Target; [Executing on a linked account](../../../accounts/executing-on-a-linked-account.md) explains the primary's Execute permission and the linked account's identity at inner targets, with the display relationship distinguished from authority. Removed the repeated route comparison and the abstract claim that approved actions classify a plugin's role. [Plugin](../../../governance/plugin.md#execution-configuration) links to the configuration explanation without repeating the call modes, and Governance designer identifies the body sub-proposal's reporting action. Both revised pages retain their existing draft state and review assignments.

**2026-09-15 Contract upgrades review and shared selection:** Keep [Contract upgrades](../../../accounts/contract-upgrades.md) as an Accounts capability. Its opening includes the optional-upgrade decision; **Available upgrades** owns eligibility; **Performing an upgrade** explains review, update preparation, fixed proposal content, and application. The owner's follow-up removes the separate choice section and moves process selection and creation checks into the new [Execution routing](../../../application/execution-routing.md) pattern under Application. That page explains the shared process selector and the separate current direct-execution route; the possible integration of direct execution is a product candidate. [Proposal creation](../../../governance/proposal-creation.md) keeps its eligibility-configuration rules and creation wizard, while its selector behavior moves to the new page. Settings, Process details, Governance designer, Admin removal, Proposal, Action builder, and Create transaction link to the shared pattern. Target remains the contract-level destination concept. The new page is draft in the remaining review; Contract upgrades stays in the existing nine-page foundational review.

**2026-09-15 support-page recheck:** The foundational review supersedes the baseline Plugin compatibility, Plugin, and Aragon-deployed plugins dispositions below. [Plugin compatibility](../../../application/plugin-compatibility.md) remains a separate concept under Application because it owns cross-capability support categories and the relationship between backend indexing, the app experience, and compatible modifications. Its opening and support comparison replace the old available-flows catalogue; proxy/selector mechanics leave product prose, while ABI compatibility and visibility remain. On the owner’s follow-up, plugin-update eligibility moves into [Contract upgrades](../../../accounts/contract-upgrades.md#available-upgrades), whose availability section owns it. Repeated support categories and the unknown-plugin explanation move out of [Plugin](../../../governance/plugin.md), which keeps installed-capability meaning, governance roles, identity, and configured visibility. [Aragon-deployed plugins](../../../application/aragon-deployed-plugins.md) stays separate and moves to Application: it owns the deployment catalogue and deployment/support through Aragon. The owner’s follow-up groups veLocker in the same table, retains neutral voice, adds SPP support/advisory, and replaces the Custom integrations section with a short services note under the catalogue. BENQI remains on its own page; Alchemix’s limited example and behavior remain in DAO slots and the client-scope register. Gauge and Capital Distributor retain their own multiple-plugin limits. The [purpose inventory](../page-purpose-and-topology/platform-pages.md) records the final keep/narrow/refile verdicts; none of these changes approves a draft.

**2026-09-15 Stages/Multisig gates consolidation:** The owner accepted the two-agent assessment's merger. [Multisig gates](../../../governance/multisig-gates.md#stages-over-direct-permission-grants) receives the comparison of visible stages and direct permission grants under a section of that name, with subsections for the direct creation grant to a Safe, the direct execution grant to a Safe, and an Aragon multisig outside a stage. Its former **The recommended experience** section opens the new section. The Stages over direct permission grants entry is retired, and its baseline disposition below is superseded. Incoming links reach the subsection that owns their subject. Multisig gates remains draft in the remaining review; the merger approves nothing.

**2026-09-15 Process removal reframe:** The owner chose to reframe the last `decision` page as [Removing a governance process](../../../governance/process-removal.md), a Governance `capability`. It receives the **Uninstall process** sentences from Governance designer's lifecycle section and keeps the last-process rule, its rationale, and the recovery limit as its final section; the existing text is reordered, with no new material. Admin flow keeps the Admin-specific boundary. The former Warn rather than block page's baseline disposition below is superseded; the page remains draft. With no entry typed `decision`, the type is retired from the vocabulary and authoring guidance.

### Address input

[Current page](../../../application/address-input.md) — Normalize, resolve and validate an address supplied to a form.

| Section at start of this pass | Final disposition and contribution |
| --- | --- |
| Address input (H1) | Keep the form-input definition and shared normalization rule; display behavior is elsewhere. |
| Validation and ENS resolution (H2) | Keep checksum, ENS resolution, accepted forms and validation timing: these determine whether input can be used. |
| Controls (H2) | Keep the input affordances and default-sizing rule with the field they operate. |

### Address display

[Current page](../../../application/address-display.md) — Display and inspect a supplied address without changing its value.

| Section at start of this pass | Final disposition and contribution |
| --- | --- |
| Address display (H1) | Keep all four paragraphs together: supplied value and exact copy, compact reveal, hover/focus/tap and interactive ancestors, and the no-authorization boundary. No heading split is needed. |

### Collection pages

[Current page](../../../application/collection-pages.md) — Explain the shared layout and states of the four account collections.

| Section at start of this pass | Final disposition and contribution |
| --- | --- |
| Collection pages (H1) | Keep the four-page scope, list/aside layout and token-panel example as the shared-pattern definition. |
| Tabs (H2) | Keep page-specific tabs and control collapse; nest URL persistence under Selection in the URL. Move transient free-text search state to Sorting and search. |
| Loading (H2) | Keep the three loading states, precedence, append behavior, placeholder counts and 10/18/20 batch sizes. |
| Empty results and filters (H2) | Keep settled emptiness and ordinary empty copy after tab/chip filtering; this is a collection state. |
| Sorting and search (H2) | Keep the deliberate absence of sort/search and the two search-capable surfaces; receive the free-text lifetime rule from Tabs. |
| Failures (H2) | Keep page/list failure scope, missing/generic distinction, controls and retry limits; these complete the collection-state model. |

### Submitting a transaction

[Current page](../../../application/submitting-a-transaction.md) — Carry a composed transaction through submission and recovery.

| Section at start of this pass | Final disposition and contribution |
| --- | --- |
| Submitting a transaction (H1) | Narrow the opening to the shared dialog rather than claiming every send uses it; retain the direct two-step exception and input-to-submission handoff. |
| The four phases (H2) | Keep all four phases and inline-transaction exception; receive success/background guard release and direct-send release/re-arm behavior. |
| Leaving an unfinished flow (H2) | Split by responsibility: move arming, challenged exits and bounded-child dismissal to Wizard / Leaving an unfinished wizard; move release states to The four phases. Remove this heading and retarget its links. |
| Connected to the wrong chain (H2) | Keep chain disclosure, switch-before-signing, refusal, retry and in-flight-chain rules with submission. |
| Uncertain results and safe retries (H2) | Keep the hash/explorer route, 90-second warning, duplicate-action example and indexing distinction with retry safety. |
| Resuming an interrupted submission (H2) | Keep identity, edit/schedule distinction and stale-attempt rules. Lead with the direct-send exclusion; group session/reload/clock behavior under What survives a reload and stale cleanup under Discarding stale attempts. |

### Getting help

[Current page](../../../application/getting-help.md) — Find ordinary support or arrange a team-assisted configuration.

| Section at start of this pass | Final disposition and contribution |
| --- | --- |
| Getting help (H1) | Keep the distinction between unconditional product support and configuration handoff. |
| Product support (H2) | Keep the footer Support and error-state Report issue routes; both answer ordinary support needs. |
| When the app needs the Aragon team (H2) | Move unknown-code recognition to Plugin / Unsupported plugins. Keep abstraction limits and configuration handoff; receive preferred team setup and the deployed-plugin examples from Working with the Aragon team. |
| Working with the Aragon team (H2) | Keep all three contact surfaces and shared-form/configuration continuity. Move setup examples above; nest both missing-contact cases and direct-contact fallback under When no contact control is offered. |

### Admin flow

[Current page](../../../governance/admin-flow.md) — Explain temporary governance from account creation through handover.

| Section at start of this pass | Final disposition and contribution |
| --- | --- |
| Admin flow (H1) | Keep temporary-governance definition and the immediate authority supplied by Admin. |
| Starting with Admin (H2) | Keep initial admin, immediate proposals, common history/presentation and reinstall limits; absorb installation-permission rationale from Why Admin is installed by default. |
| Why Admin is installed by default (H2) | Collapse into Starting with Admin. Preserve installation authority there; common presentation and separate removal already have homes in Starting and Handing over governance. |
| Admin controls (H2) | Keep member management, immediate authority, retained proposals and minimum-one rule; place after onboarding and before handover. |
| Onboarding dashboard (H2) | Move before Admin controls so the bootstrap entry experience precedes its operations. Preserve admin and visitor routes. |
| Handing over governance (H2) | Keep prepare/apply and the distinction between installing governance and ending Admin; make Removal boundary its child. |
| Removal boundary (H2) | Demote to H3 under Handing over governance; preserve removal effects, same-account unrestricted replacement, linked-account exclusion and critical confirmation. |

### Aragon Names

[Current page](../../../application/aragon-names.md) — Explain an Aragon Name, how to claim one, and its custody and lifecycle.

| Section at start of this pass | Final disposition and contribution |
| --- | --- |
| Aragon Names (H1) | Keep definition, free fallback and ENS portability rationale; replace the mini-navigation with contextual Profile/delegate links under Name lifecycle. Move the registry-mechanism pointer to Constraints. |
| Where the flow appears (H2) | Keep watcher, user-menu entry, independent primary-name behavior and existing-registration recovery; place after Constraints. |
| Claiming (H2) | Keep both mainnet transactions, zero native value versus fees, and the mainnet scope of later operations. |
| Name lifecycle (H2) | Keep profile/delegate context at the parent level; separate Renaming and Releasing a name as H3s, preserving record-migration limits and clean handover. |
| Constraints (H2) | Move before entry points and claiming. Retain all five custody, eligibility, validation, audit and eviction/upgrade limits; receive the registry reference from the opening. |

### Aragon Profiles

[Current page](../../../application/aragon-profiles.md) — Resolve, display and edit a participant’s ENS-backed profile.

| Section at start of this pass | Final disposition and contribution |
| --- | --- |
| Aragon Profiles (H1) | Keep participant identity and its Member-page/app-wide context. |
| ENS as the profile layer (H2) | Move after Resolution and display. Keep ENS authority, custody, portability, delivery services, mainnet/IPFS storage and cross-chain consequences. |
| Resolution and display (H2) | Move before the architectural rationale. Keep all supported fields, shared cache, avatar fallback, shortened-name behavior and delegate extension. |
| Editing (H2) | Keep feature gate, user-menu entry, signature/write authority and avatar pinning. Link to the complete field list under Resolution and display instead of repeating it. |

### Linked account

[Current page](../../../accounts/linked-account.md) — Explain the linked-account display relationship, its signals and separate control.

| Section at start of this pass | Final disposition and contribution |
| --- | --- |
| Linked account (H1) | Keep definition, flat hierarchy, earmarking rationale and the short no-control boundary. |
| How linked-account data surfaces (H2) | Keep aggregation, existing partitions, account selection, action-target filtering, settings metadata and indicators; place after the control boundary. |
| Establishing the relationship (H2) | Lead with the absent in-app setup and team-assisted route. Keep mutual grants, exact IDs, both-active/backend constraints and revocation behavior. |
| Permissions repurposed as signals (H3) | Keep auth versus acknowledgement, event/no-op behavior and no guarded consumer with the establishment mechanism. |
| No product UI to establish it (H3) | Move the entire setup paragraph into Establishing the relationship; remove this redundant child heading and retarget its link. |
| Linking does not imply control (H2) | Move immediately after the opening. Collapse repeated rule/why framing while retaining the rendering-versus-prescribed-control rationale. |
| Configuring actual control (separately) (H3) | Keep Execute, nested execution/re-entrancy and Root ownership requirements as children of the control boundary. |
| Inspecting control permissions (H3) | Keep indexed-grant/condition inspection, inability to predict success and cross-network caution with the separate control configuration. |

### Honest abstraction

[Current page](../../design/principles/honest-abstraction.md) — Make onchain consequences understandable and verifiable.

| Section at start of this pass | Final disposition and contribution |
| --- | --- |
| Honest abstraction (H1) | Keep the trust, consequence and signature-accountability definition. |
| The calibration (H2) | Keep over/under-abstraction and bounded technical transparency as the criterion for the pattern. |
| Where the abstraction reaches its limit (H2) | Move after the positive drill-down pattern. Move the opaque batched-wallet-call example into that pattern; retain both team-handoff limits here. |
| Abstract, then offer a drill-down (H2) | Move before limits and receive the batched-call consequence. Retain authoritative-record access, contextual affordance and the rule against exhaustive first-view detail. |
| Instances (H3) | Keep all eight examples as children of the drill-down rule; each shows a distinct route to a consequential fact. |

### Proposal

[Current page](../../../governance/proposal.md) — Explain a proposal and how its description, actions and decisions appear.

| Section at start of this pass | Final disposition and contribution |
| --- | --- |
| Proposal (H1) | Keep ordered actions, metadata, process ownership and approval as the proposal definition. |
| Identifying a proposal (H2) | Keep onchain ID versus friendly slug and the identifier reference. |
| Proposal lifecycle (H2) | Keep creation, participation, derived state, signaling and immediate Admin execution. |
| Proposals page (H2) | Keep process tabs, linked-account aggregation, notifications, creation entry and aside/navigation behavior. |
| Proposal details page (H2) | Keep the integrated details-page definition. Order its children as description/resources, actions/execution, then voting/stage decisions. |
| Actions and execution (H3) | Keep action inspection/export, simulation availability/cache and execution eligibility; place after Description and resources. |
| Voting and stage decisions (H3) | Lead with the legible-process rationale. Keep process/body/detail hierarchy and all body-tab, state and Admin rules; move component identity into the reference section. |
| Voting Terminal design reference (H4) | Promote to H2 at the end, after the reader-facing details. Keep ProposalVoting identity, exact story/variants and Figma lookup together. |
| Description and resources (H3) | Move to the first details subsection; keep visible resource destinations and inline-link inspection limitations. |
| Missing and non-standard metadata (H4) | Move with Description and resources as its H4; preserve both warning classifications, title fallback, card exceptions and safety boundary. |

### Wizard

[Current page](../../../application/wizard.md) — Collect, retain and deliberately discard guided transaction input.

| Section at start of this pass | Final disposition and contribution |
| --- | --- |
| Wizard (H1) | Keep the definition and single-input voting counterexample. Move step/metadata ordering out of the opening into Structuring the input. |
| Choosing the container (H2) | Keep task-context criteria and the two variant headings; they classify containers for the same guided-input job. |
| Full-screen wizard (H3) | Keep dedicated-destination behavior, single-screen possibility and all four flow examples. |
| Dialog wizard (H3) | Keep bounded surrounding context, examples, footer/control placement and ownership of steps/validation/state. |
| Nesting and retained input (H2) | Keep allowed nesting, retained parent input and Add voting body example; these explain input continuity. |
| Submitting the collected input (H2) | Keep the transaction-dialog handoff, direct two-step exception and governance installation approval link. |
| Leaving an unfinished wizard (H2) | Receive guard arming, challenged exits and native prompts from submission; combine the duplicate bounded-dialog dismissal rule and retain the taxonomy boundary. Link guard release to submission phases. |

### Stage

[Current page](../../../governance/stage.md) — Define one configured stage and its body/timing rules.

| Section at start of this pass | Final disposition and contribution |
| --- | --- |
| Stage (H1) | Keep one-step definition, stage/body cardinalities and setup/traversal references. |
| The stage abstractions (H2) | Keep timing, expiry, early advance, mixed roles, thresholds, timelocks and external-body reporting: these configure a stage. |
| How the proposal page presents a stage (H2) | Keep approval/veto copy and treatment, mixed-stage requirements, manual-report authority and bodyless timelock states. |
| Fixed behavior in app-created stages (H2) | Keep cancellation/editing limits and best-effort same-transaction advance; link exceptional configurations to the staged-process boundary. |

### Staged proposals

[Current page](../../../governance/proposal.md#staged-proposals) — Explain a proposal’s progression across configured stages.

| Section at start of this pass | Final disposition and contribution |
| --- | --- |
| Staged proposals (H1) | Keep the traversal definition and team-arranged installation route. |
| When the model reaches an edge case (H2) | Move to the end, after the supported progression. Preserve condition/sub-plugin limits and the team route. |
| One proposal, one page (H2) | Keep one proposal, per-body sub-proposals and end-to-end visibility before advancement mechanics. |
| Advancing through stages (H2) | Keep timing/threshold conditions, who advances, reporting differences, optimistic/timelock behavior and multisig example. |
| On the proposal page (H2) | Keep accordion/following-stage behavior, stage context, 90-day display bound and non-final/final control distinction. |
| Execution is separate from advancement (H2) | Keep final-stage call and permission distinction, execution eligibility links and the final-multisig boundary before edge cases. |

### Plugin

[Current page](../../../governance/plugin.md) — Explain installed plugin capabilities, roles, identity and app support.

| Section at start of this pass | Final disposition and contribution |
| --- | --- |
| Plugin (H1) | Keep installed capability, permissions and code/configuration definition. |
| Governance semantics of plugins (H2) | Keep governance plugin, IProposal, standalone/staged roles and gauge participation semantics. |
| Execution configuration (H2) | Keep TargetConfig, Call/DelegateCall and executor/caller distinctions with plugin execution configuration. |
| Deployment and support (H2) | Keep the installation/framework introduction and support groups. |
| Self-service governance plugins (H3) | Keep offered methods, network availability, staged reuse and Admin bootstrap exception. |
| Aragon-deployed plugins (H3) | Keep team-deployed examples, veLocker relationship and setup route. |
| Unsupported plugins (H3) | Receive unknown-code recognition versus understanding from Getting help; keep it beside the existing inability to present or operate unsupported plugins. |
| Identifying a plugin (H2) | Keep address/network identity, metadata fields and shared process/body identity. |
| Plugins in the app (H2) | Keep CMS visibility and the compatibility lookup; they explain how an installed plugin appears. |

### Metadata input

[Current page](../../../application/metadata-input.md) — Define the shared descriptive fields used when creating or editing objects.

| Section at start of this pass | Final disposition and contribution |
| --- | --- |
| Metadata input (H1) | Keep identity/purpose and storage-preparation boundary. |
| The common shape (H2) | Keep common fields, object-specific additions, five creation contexts and separation from operational settings. |
| Plugin metadata follows the plugin (H2) | Keep one plugin identity across process/body roles and preservation of unedited metadata. |
| Placement in a wizard (H2) | Make first-definition ordering explicit; receive the governance/membership/actions/permissions examples from Wizard. Retain both prerequisite examples and the submission handoff. |

### Stages over direct permission grants

[Former page](../../../governance/multisig-gates.md#stages-over-direct-permission-grants) — Explain preferring visible multisig stages over invisible permission gates. Retired 2026-09-15; the linked section is the surviving home.

| Section at start of this pass | Final disposition and contribution |
| --- | --- |
| Stages over direct permission grants (H1) | Multisig gates → Stages over direct permission grants. Keep the preference, the validity of a deliberate direct grant, and the invisible-role consequence. |
| Context (H2) | Same section opening. Keep the two ways to gate, the equal outcomes, and the modeling difference with the authorization-model link. |
| Chosen direction (H2) | Same section. Replace the shortcut foil with the concrete cost: fewer configured parts, but no stage on the proposal page. |
| Direct creation grant to a Safe — how it would work (H3) | Multisig gates → Direct creation grant to a Safe. Put the Safe-only constraint first; keep the designer gap, the Admin route, Safe connection, and the account explanation. |
| Why it is discouraged: nested-action review (H3) | Same subsection, second paragraph. Keep the nested `Create Proposal` calldata, raw Safe presentation, the Safe-side simulation limit, and the action-simulation contrast. |
| Direct execution grant to a Safe (H3) | Multisig gates → Direct execution grant to a Safe. Keep the arrangement, its transparency cost without the review problem, and execution on the process versus direct DAO execution. |
| Never for an Aragon multisig (H3) | Multisig gates → An Aragon multisig outside a stage. Keep plugin versus account, the own-process indirection, the `DelegateCall` path, and the SPP comparison; link the plugin execution path on Target. |
| Consequences (H2) | Folded into the section opening and the Aragon-multisig subsection; no separate list. |

### Multisig gates

[Current page](../../../governance/multisig-gates.md) — Explain using a multisig at a checkpoint in staged governance and why a visible stage is preferred over a direct grant.

| Section at start of this pass | Final disposition and contribution |
| --- | --- |
| Multisig gates (H1) through Changing an installed gate (H2) | Keep unchanged. |
| The recommended experience (H2) | Replaced by Stages over direct permission grants; its end-to-end visibility sentence opens the new section's recommendation paragraph. |
| Worked recommendations (H2) | Keep unchanged, after the new section. |

### Removing a governance process

[Current page](../../../governance/process-removal.md) — Explain how a governance process is removed, what the app requires, and the rule for the last recognized process. Former Warn rather than block removal of the last governance process, reframed 2026-09-15.

| Section at start of this pass | Final disposition and contribution |
| --- | --- |
| Warn rather than block removal of the last governance process (H1) | Removing the last recognized process. Keep the rule and the account's retained authority; the opening now defines removal and its entry point. |
| Why (H2) | Removing the last recognized process. Keep the recognized-process versus usable-authority distinction, the route loss, and the recovery limit unchanged. |
| Current removal flow (H2) | Split. What the app requires receives the count requirement, linked-account counting, and the create-governance redirect, with a link to the Admin variant; Removing the last recognized process keeps the statement that the warn-and-continue route is not yet offered. |
| Governance designer — Editing across the lifecycle, Uninstall process sentences | Opening. Keep preparation, submission through the selected process, and authority loss on execution, unchanged. |

### Governance designer

[Current page](../../../governance/governance-designer.md) — Explain configuring and installing governance in the app.

| Section at start of this pass | Final disposition and contribution |
| --- | --- |
| Editing across the lifecycle (H2) | Keep the proposal-based editing rules and the advanced-configuration boundary. Move the Uninstall process sentences and the count requirement to Removing a governance process; link there. |

## Original section-audit baseline

These 162 page records and 756 section units preserve the original content tested. Their labels, excerpts and earlier verdicts are historical; the post-merge tables above supersede affected section decisions. The earlier page-overlap and location follow-up remains in the [decision record](../section-fit-and-location.md#page-overlap-and-location-follow-up).

### access-control/align-permission-viewer-details-with-selected-account.md

[Align Permission Viewer details with the selected account](../../product-opportunities/align-permission-viewer-details-with-selected-account.md) — Evaluate consistent account and network context in permission details.

Unique responsibility: Cross-network presenter mismatch. Reader: Product planners.

**Final page verdict:** Keep. This candidate still owns its specific proposed product outcome; section relocation did not implement, duplicate or supersede it.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Align Permission Viewer details with the selected account (H1) | This candidate addresses a context mismatch in Permission Viewer when someone inspects a cross-network linked account. It is not a roadmap commitment. | Keep. |
| Opportunity (H2) | Selecting another account changes the permission query to that account's address and network. The detail presenters receive a mixture of contexts: list details use the selected network but retain the… | Keep. |
| Before ticketing (H2) | Reproduce the mismatch with a linked account on another network in list and graph views, including a recognized condition. | Keep. |

### access-control/authorization-and-execution.md

[Authorization and execution model](../../../access-control/authorization-and-execution.md) — Explain how governance decisions, authorization checks, and execution combine.

Unique responsibility: Shared actor and protected-call model, including the governor role. Reader: Participants/operators.

**Final page verdict:** Keep with the shared-authority/custody comparison. That comparison elaborates the existing actor, caller, policy and execution model. Scoped authority still supplies the product division-of-responsibility rule, and OSx paths still supplies the concrete checks.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Authorization and execution model (H1) | Access control is the policy and set of guards that determine which callers may cause protected effects and who may change those rules. Authorization is one guard's decision about an attempted call.… | Keep semantic opening; add the cross-framework Shared authority and execution custody section. |
| From an intended action to an onchain call (H2) | An actor may call a contract directly, or a governance process may resolve actors' preferences into approved actions. An action specifies an intended call: its target address, native-token value, and… | Keep. |
| What authorization decides (H2) | A guarded target can base its authorization decision on: | Keep. |
| How authority composes across layers (H2) | Authority can first bundle at one target: if one role permits two functions, every caller with that role may use both. | Keep. |
| Administer access control (H2) | Grants, revocations, role assignments, and selector mappings are authorization configuration. An authorized administrator or governed account performs those configuration actions, and the resulting… | Keep. |

Applied section and dependency changes:

- Shared authority and execution custody — receive cross-framework composition comparison from Scoped authority.

Final sections added or renamed:

| Final section | Contribution at the retained home | Disposition |
| --- | --- | --- |
| Shared authority and execution custody (H2) | OpenZeppelin AccessManager is also shared access control. Its core policy assigns caller roles to target-function selectors, with optional delays and a schedule/execute route. An AccessManaged target… | Keep at this home after the applied move or split above. |

### access-control/gradual-permission-handover.md

[Gradual permission handover](../../../access-control/gradual-permission-handover.md) — Explain transferring selected action scopes between governance processes over time.

Unique responsibility: Optional governance-transition pattern. Reader: Participants/operators.

**Final page verdict:** Keep. The stated unique responsibility remains supported by the retained sections. No content was removed from this page and no section destination takes over that object, capability, rule or user outcome.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Gradual permission handover (H1) | Gradual permission handover is an optional pattern for transferring explicit action scopes between governance processes over time. Aragon recommends it when it fits the organization's needs. It applies… | Keep. |
| Transfer scopes independently (H2) | The organization first identifies the action scopes that carry distinct responsibility: for example, routine treasury operations, a protocol parameter, or emergency intervention. It assigns each scope… | Keep. |
| Adapt the pattern to risk and readiness (H2) | Each organization chooses the direction and timing for every scope. A scope can remain concentrated, move to an optimistic or token-holder process, or return to an operational process as its risks and… | Keep. |

### access-control/index.md

[Access control](../../../access-control/index.md) — Route readers from the authority model to inspection and scoped governance.

Unique responsibility: Access-control collection navigation. Reader: Participants/operators.

**Final page verdict:** Keep. The retained collection still contains independently meaningful entries and needs its navigation surface.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Access control (H1) | An intended action becomes an authorized call through a sequence of execution paths and permission checks. Inspect an account’s permissions, limit each process’s scope, or transfer those scopes as… | Keep. |

### access-control/let-overlapping-permission-filters-be-cleared.md

[Let overlapping Permission Viewer filters be cleared](../../product-opportunities/let-overlapping-permission-filters-be-cleared.md) — Evaluate clearing hide filters that jointly conceal every permission.

Unique responsibility: Mutually disabling permission filters. Reader: Product planners.

**Final page verdict:** Keep. This candidate still owns its specific proposed product outcome; section relocation did not implement, duplicate or supersede it.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Let overlapping Permission Viewer filters be cleared (H1) | This candidate addresses an empty-state trap in Permission Viewer when every indexed record matches both default hide filters. It is not a roadmap commitment. | Keep. |
| Opportunity (H2) | The page initially hides records granted to the selected account and records targeting an identified subplugin. Each switch is disabled when the records remaining under the other active filter contain… | Keep. |
| Before ticketing (H2) | Reproduce the state with a permission set in which every row has the selected account as who and an identified subplugin as where. | Keep. |

### access-control/osx-authorization-paths.md

[OSx authorization paths](../../../access-control/osx-authorization-paths.md) — Trace the callers and guards in concrete OSx execution routes.

Unique responsibility: Applied path comparison; upstream owns permission algorithms. Reader: Participants/operators.

**Final page verdict:** Keep. The stated unique responsibility remains supported by the retained sections. No content was removed from this page and no section destination takes over that object, capability, rule or user outcome.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| OSx authorization paths (H1) | An OSx authorization path is the sequence of callers and permission checks from a governance plugin, through the DAO (the organization's account), to a protected function. Within one organization, the… | Keep. |
| Trace a standard plugin execution (H2) | Start with the exact plugin, DAO, action target, and calldata (including its selector when present). Whether an approved action can run depends on authorization at DAO.execute and, if the action target… | Keep. |
| Guarding plugin functions with the DAO's authority (H2) | For a guarded plugin function, DaoAuthorizable stores the DAO reference and has its auth modifier call: | Keep. |
| ROOT administers the DAO permission table (H2) | ROOTPERMISSIONID gates grant, grantWithCondition, revoke, and the batch permission functions. It controls the DAO's permission table; it is not a runtime bypass for EXECUTEPERMISSIONID or any other… | Keep. |
| SPP callback through GlobalExecutor (H2) | For an automatic SPP body, executing the body's sub-proposal can call reportProposalResult. SPP accepts reports from any address, but it tallies a report only for an address registered as a body. When… | Keep. |

### access-control/permission-viewer.md

[Permission Viewer](../../../access-control/permission-viewer.md) — Explain inspecting an account's indexed permission configuration.

Unique responsibility: Permissions page, list/graph views, and interpretation limits. Reader: Participants/operators.

**Final page verdict:** Keep. The stated unique responsibility remains supported by the retained sections. No content was removed from this page and no section destination takes over that object, capability, rule or user outcome.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Permission Viewer (H1) | Permission Viewer is a read-only page, available for every Aragon account supported in the app, that displays the OSx permission records the platform index currently returns as active for the selected… | Keep. |
| One account's indexed permission table (H2) | An Aragon account's DAO contract is its shared OSx permission manager. The underlying OSx permission system resolves one (where, who, permissionId) query at a time; it does not expose one query that… | Keep. |
| Permissions page (H2) | The viewer is available from the account navigation, dashboard, and Settings. In the account navigation, Permissions sits below Transactions and above Settings. The default URL state opens in the list… | Keep. |
| Condition details (H2) | The viewer selects a detail presenter from the condition type the app recognizes: | Keep. |
| Inspection jobs (H2) | A counterparty performing due diligence can use the viewer to inspect the selected account's indexed OSx grants and attached conditions. Members and security researchers can review the same records… | Keep. |
| Interpretation boundary (H2) | Permission Viewer is a neutral visualization. It does not label a configuration safe or unsafe, issue warnings, or certify that the intended separation of powers holds. It also cannot determine whether… | Keep. |

### access-control/recognize-safe-owner-conditions.md

[Recognize Safe-owner conditions in Permission Viewer](../../product-opportunities/recognize-safe-owner-conditions.md) — Evaluate recognizing Safe-owner eligibility conditions in permission details.

Unique responsibility: Condition recognition beyond indexed Aragon Multisig membership. Reader: Product planners.

**Final page verdict:** Keep. This candidate still owns its specific proposed product outcome; section relocation did not implement, duplicate or supersede it.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Recognize Safe-owner conditions in Permission Viewer (H1) | This candidate addresses the gap between the intended friendly Safe-owner presentation and the condition types Permission Viewer currently receives. It is not a roadmap commitment. | Keep. |
| Opportunity (H2) | The backend classifies a condition as membership only when it correlates the condition with an indexed Aragon Multisig plugin. A standalone Safe-owner condition therefore reaches the app as an unknown… | Keep. |
| Before ticketing (H2) | Reproduce standalone and staged-process-correlated Safe-owner conditions against the deployed indexer schema. | Keep. |

### access-control/scoped-authority.md

[Scoped authority](../../../access-control/scoped-authority.md) — Explain allocating an account's authority to bounded governance processes.

Unique responsibility: Product meaning of execution scope and responsibility. Reader: Participants/operators.

**Final page verdict:** Keep, narrowed to the division-of-powers rule. Explicit call scope, argument/value limits and reassigning authority through a stable account remain distinct from the general authorization model and the concrete OSx caller paths.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Scoped authority (H1) | Scoped authority limits a governance process at an account's execution boundary to an explicit set of calls and, when supported, constraints on their arguments or native-token value. This lets an… | Keep. |
| The execution-boundary premise (H2) | In the usual Aragon path, a process approves a batch of actions, calls DAO.execute, and the DAO account calls each action target as itself. Each target therefore applies its access-control rules to the… | Keep. |
| Prevent executor collapse (H2) | A bare EXECUTEPERMISSIONID grant places no target or calldata restriction at the DAO boundary. When its holder calls DAO.execute, downstream guards see the DAO as caller; those guards, balances, and… | Keep. |
| Set an explicit scope (H2) | A selector allowlist names the target contract and function selector a process may use. It can start empty, making the conditioned grant a default-deny grant until an allowed pair is added. Removing a… | Keep. |
| Separate responsibilities without changing the account (H2) | Each organization can assign independent scopes to its processes: treasury operations to one, protocol parameters to another, and permission configuration to another. The onchain grants and conditions… | Move AccessManager and custody comparison to Authorization and execution; retain scoped-process behavior and link the comparison. |
| Change authority through configuration (H2) | Granting, revoking, and conditioning permission entries, or changing an execute-condition allowlist, are permission and configuration actions. They change authority configuration and condition state;… | Keep. |

Applied section and dependency changes:

- Separate responsibilities without changing the account — move the cross-framework AccessManager/custody comparison to Authorization and execution; retain scoped-process application and link the comparison.

### accounts/account-creation.md

[Account creation](../../../accounts/account-creation.md) — Explain deploying an account through the app and reaching governance setup.

Unique responsibility: Create account page and self-service deployment outcome. Reader: Participants/operators.

**Final page verdict:** Keep. The stated unique responsibility remains supported by the retained sections. No content was removed from this page and no section destination takes over that object, capability, rule or user outcome.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Account creation (H1) | Account creation deploys a new onchain account through the Aragon app on the chosen network, ready for governance to be installed afterwards through the governance designer. | Keep. |
| Entry points (H2) | Reach out to the Aragon team — the preferred route. Setting up an onchain governance system is hard in general, and the team has the context to help when the supported abstraction cannot stay honest… | Keep. |
| Create account page (H2) | Groups the following sections under Create account page. | Keep. |
| Self-serve creation (H3) | The flow is a two-step, no-code full-screen wizard, deliberately decoupled from governance design: the account publishes onchain before any governance detail is decided. | Keep. |

### accounts/account.md

[Account](../../../accounts/account.md) — Define an address's capacity to act and the platform's account terminology.

Unique responsibility: Account versus governor and DAO; durable acting identity. Reader: Participants/operators.

**Final page verdict:** Keep. The stated unique responsibility remains supported by the retained sections. No content was removed from this page and no section destination takes over that object, capability, rule or user outcome.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Account (H1) | An account is an address that can act: given a target, a value, and calldata, it makes that call as itself, so the target sees the account as its caller. That general-purpose execution capability lets… | Keep. |
| Account versus DAO (H2) | Account is the product term for the entity people deploy and govern through the app. DAO names its Aragon OSx contract, and can also describe a decentralized autonomous organization governed through… | Keep. |
| Account and governor are distinct capabilities (H2) | An account acts; a governor resolves actors' preferences over proposed actions. A governor is an entity or component, commonly a contract with an address and state, that implements a voting or decision… | Keep. |
| Identifying an account (H2) | An account is first identified by its Ethereum address on its deployment network. Metadata and an optional ENS subname make that identity more readable. | Keep. |

### accounts/admin-flow.md

[Admin flow](../../../governance/admin-flow.md) — Explain the temporary admin-led setup phase of an account.

Unique responsibility: Bootstrap lifecycle and onboarding dashboard state. Reader: Participants/operators.

**Final page verdict:** Move the consolidated temporary-governance topic to /governance/admin-flow.md. Preserve every unique claim; the original file does not survive as a separate topic. (Page-overlap/location follow-up, 2026-09-13.)

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Admin flow (H1) | The admin flow is the temporary setup phase of a new Aragon account. Its Admin plugin lets the initial admin act immediately so they can install the governance the organization will use. | Keep. |
| Starting with Admin (H2) | Account creation installs Admin with the connected wallet as the initial admin. An admin can add other admins, configure the account, and install governance without waiting for a vote. Each action… | Keep. |
| Onboarding dashboard (H2) | When Admin is the account's only visible governance process, its dashboard guides the transition into governance. An admin can use the governance designer where available or work with Aragon on a… | Keep. |
| Moving into governance (H2) | The admin installs the chosen governance through the designer's prepare-and-apply flow. Admin executes the installation proposal immediately. | Keep. |

### accounts/admin-management.md

[Admin management](../../../governance/admin-flow.md#admin-controls) — Explain sharing admin authority and handing it over to governance.

Unique responsibility: Admin membership controls and removal entry. Reader: Participants/operators.

**Final page verdict:** Merge this original page into /governance/admin-flow.md#admin-controls. Preserve every unique claim; the original file does not survive as a separate topic. (Page-overlap/location follow-up, 2026-09-13.)

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Admin management (H1) | Admin management lets the current admins share responsibility for setting up an account, then hand control to its chosen governance. Each admin can act immediately, so changing the admin list changes… | Keep. |
| Admin controls (H2) | Account settings shows the installed Admin plugin and its members. Manage admins lets an existing admin add or remove members. The change executes in one transaction, with a proposal retained in the… | Keep. |
| Removal boundary (H2) | Remove all admins uninstalls the Admin plugin. This ends the bootstrap: the former admins lose the authority that plugin gave them, and the account depends on its remaining governance. | Keep. |

### accounts/admin-plugin-by-default.md

[Install admin plugin by default](../../../governance/admin-flow.md#starting-with-admin) — Explain why account creation installs Admin by default.

Unique responsibility: Bootstrap product decision, distinct from managing admins. Reader: Participants/operators.

**Final page verdict:** Merge this original page into /governance/admin-flow.md#why-admin-is-installed-by-default. Preserve every unique claim; the original file does not survive as a separate topic. (Page-overlap/location follow-up, 2026-09-13.)

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Install admin plugin by default (H1) | Every account created through the app is deployed with the admin plugin installed by default. | Keep. |
| Context (H2) | A freshly created account still needs its real governance installed, and installing plugins requires permissions on the DAO. With the admin plugin, anything created as a proposal executes instantly in… | Keep. |
| Chosen direction (H2) | Install the admin plugin at account creation. Because admin proposals execute instantly, at the end of the governance designer the user holds the permissions to fully install their chosen governance —… | Keep. |
| Consequences (H2) | Admins can set up governance immediately, with a dedicated management experience. | Keep. |

### accounts/allow-last-process-removal-with-warning.md

[Allow last-process removal with a warning](../../product-opportunities/allow-last-process-removal-with-warning.md) — Evaluate a warn-and-continue route for last-process removal.

Unique responsibility: Gap between the chosen removal rule and the current count gate. Reader: Product planners.

**Final page verdict:** Move to /governance/allow-last-process-removal-with-warning.md. Candidate implementing the governance-removal rule. (Page-overlap/location follow-up, 2026-09-13.)

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Allow last-process removal with a warning (H1) | The ordinary Uninstall process control requires more than one app-listed full-execute process before opening confirmation. With zero or one, it offers Create governance process and no removal… | Keep. |
| Investigation (H2) | Define the ordinary removal route when the target process must publish its own uninstallation proposal, including preparation, execution, and post-removal navigation. | Keep. |

### accounts/aragon-names.md

[Aragon Names](../../../application/aragon-names.md) — Define the ENS-based Aragon Name and connect it to participant identity.

Unique responsibility: Name concept; claiming and profile editing have separate capabilities. Reader: Participants/operators.

**Final page verdict:** Move to /application/aragon-names.md. Participant naming works across accounts and networks. (Page-overlap/location follow-up, 2026-09-13.)

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Aragon Names (H1) | An Aragon Name is an ENS-based name such as username.aragon.eth that provides an open, non-proprietary identity in the Aragon platform UI. | Keep. |

### accounts/aragon-profiles.md

[Aragon Profiles](../../../application/aragon-profiles.md) — Explain resolving and editing a participant's ENS-backed profile.

Unique responsibility: Profile display and editing, distinct from name custody. Reader: Participants/operators.

**Final page verdict:** Move to /application/aragon-profiles.md. The connected participant profile is a shared application identity. (Page-overlap/location follow-up, 2026-09-13.)

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Aragon Profiles (H1) | Aragon Profiles makes a governance participant recognizable through the primary ENS identity they control. That identity appears on the Member page and across the app. | Keep. |
| Resolution and display (H2) | The app resolves the wallet's primary ENS name, avatar, and profile records from Ethereum mainnet. It works with an independently owned ENS name as well as a claimed Aragon Name. On member-facing… | Keep. |
| Editing (H2) | When the aragonProfiles feature is enabled, the connected wallet can open its profile editor from the user menu. It edits description, website, GitHub, Twitter, email, Discord, and Telegram text… | Keep. |

### accounts/claiming-an-aragon-eth-name.md

[Claiming an Aragon Name](../../../application/aragon-names.md#claiming) — Explain obtaining, renaming, and releasing an Aragon Name in the app.

Unique responsibility: Eligibility and name lifecycle; registry mechanics stay upstream. Reader: Participants/operators.

**Final page verdict:** Merge this original page into /application/aragon-names.md#claiming. Preserve every unique claim; the original file does not survive as a separate topic. (Page-overlap/location follow-up, 2026-09-13.)

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Claiming an Aragon Name (H1) | A wallet without a primary ENS name can claim a free name.aragon.eth fallback in the app, then use it as the wallet's primary ENS name and Aragon Profile. | Keep. |
| Where the flow appears (H2) | The app checks a newly connected wallet through its profile-onboarding watcher while the user is viewing a specific account and offers profile creation when no primary ENS name resolves. This is user… | Keep. |
| Claiming (H2) | The user chooses an available label, then approves two Ethereum-mainnet transactions: | Keep. |
| Name lifecycle (H2) | An Aragon Name can be changed from the profile editor. Before calling the registry's move, the app enumerates the current text records through its indexer and reads the live address and contenthash… | Keep. |
| Constraints (H2) | An Aragon Name is a subname under the registry-managed aragon.eth parent, not an independently owned ENS name. The member controls its resolver records through the approval model documented upstream. | Keep. |

### accounts/close-profile-introduction-on-disconnect.md

[Close the profile introduction on wallet disconnect](../../product-opportunities/close-profile-introduction-on-disconnect.md) — Evaluate closing an identity-dependent introduction on wallet disconnect.

Unique responsibility: Profile onboarding's missing disconnect handling. Reader: Product planners.

**Final page verdict:** Move to /application/close-profile-introduction-on-disconnect.md. Candidate for the shared profile and wallet-connection flow. (Page-overlap/location follow-up, 2026-09-13.)

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Close the profile introduction on wallet disconnect (H1) | Candidate: close the profile introduction when its connected wallet disconnects, so the create or edit prompt does not remain after the connected-wallet menu beneath it has closed. | Keep. |

### accounts/connecting-a-safe.md

[Connecting a Safe](../../../application/connecting-a-safe.md) — Explain connecting a Safe so it becomes the actor in Aragon.

Unique responsibility: Safe Apps and WalletConnect connection routes. Reader: Participants/operators.

**Final page verdict:** Move to /application/connecting-a-safe.md. A wallet connection route usable across accounts and governance roles. (Page-overlap/location follow-up, 2026-09-13.)

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Connecting a Safe (H1) | Connecting a Safe lets its owners operate the Aragon app as the Safe, with the Safe itself as the connected actor. | Keep. |
| How it works (H2) | The Safe can connect through either of two routes: | Keep. |
| When it's used (H2) | Connecting as the Safe is what lets the Safe itself — the account, not an Aragon multisig — act in Aragon wherever it has a role to play: | Keep. |
| How the product recognizes a Safe (H2) | Recognizing an address as a Safe is a separate concern from connecting as one, and it fires elsewhere: in the Aragon team's advanced-governance setup, through the add-body any address option, where any… | Move: product recognition/eligibility to Safe as a body; exact heuristic and examples to dated log evidence. |

Applied section and dependency changes:

- How the product recognizes a Safe — move product behavior to Safe as a body / Recognizing a Safe body; retain exact detection strings and examples in dated log evidence.

### accounts/contract-upgrades.md

[Contract upgrades](../../../accounts/contract-upgrades.md) — Explain opting into supported account and plugin upgrades through governance.

Unique responsibility: App upgrade availability and governed update flow. Reader: Participants/operators.

**Final page verdict:** Keep. The stated unique responsibility remains supported by the retained sections. No content was removed from this page and no section destination takes over that object, capability, rule or user outcome.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Contract upgrades (H1) | Contract upgrades let an account opt into available OSx DAO and compatible installed-plugin contract updates through a governed proposal. | Keep. |
| What can be upgraded (H2) | When this capability is enabled for an eligible account, the app surfaces an update entry in settings if an OSx DAO update or a compatible plugin update is available. Availability is selective: the… | Keep. |
| Governed flow (H2) | Open the contract-update entry in account settings and review the changes and contract addresses for the available OSx and compatible plugin updates. | Keep. |
| Deliberately opt-in (H2) | Upgrades are offered, never pushed as routine maintenance. An upgrade changes executable code and can introduce risk, while many releases only add features an account does not need. The account opts in… | Keep. |

### accounts/dashboard.md

[Dashboard](../../../accounts/dashboard.md) — Explain the overview of a selected account and its data scopes.

Unique responsibility: Dashboard page, previews, and contextual navigation. Reader: Participants/operators.

**Final page verdict:** Keep. Overview metrics, visibility, onboarding replacement, previews and account details remain one account overview. Splitting the aside into its own section does not turn it into a separate Settings or collection page.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Dashboard (H1) | The Dashboard is the overview a visitor reaches for one specific account: a header, a fixed set of data sections beside a persistent aside column, and links out to each section's full collection. It is… | Keep. |
| Fixed section order (H2) | Outside the onboarding state below, the dashboard shows a header followed by three main-column sections in one fixed order — Proposals, then Members, then Assets. The order is the same for every… | Split the persistent aside into Account details. |
| Visibility gate (H2) | Proposals and Members share a single visibility condition: both render only if the account has at least one supported, app-recognized plugin. The plugin support filter excludes unresolved interfaces… | Keep. |
| Onboarding (H2) | While the account is in its admin bootstrap, a page-level state replaces the header and the main-column sections — the aside column remains; see admin flow for what a visitor sees instead. | Keep. |
| Header (H2) | The default header shows three metrics: | Keep. |
| Preview sections (H2) | Each visible section shows a small, fixed-size preview — three proposals, six members, three assets — and ends in a link to that section's full collection page, where collection pages own browsing,… | Keep. |

Applied section and dependency changes:

- Fixed section order — split aside identity, permissions and notification routes into Account details.

Final sections added or renamed:

| Final section | Contribution at the retained home | Disposition |
| --- | --- | --- |
| Account details (H2) | Beside those sections, an account-details card is always present: the account's chain, its address with a route to the explorer, its optional ENS name, and its launch date linking to the creation… | Keep at this home after the applied move or split above. |

### accounts/ens-as-the-profile-layer.md

[ENS as the profile layer](../../../application/aragon-profiles.md#ens-as-the-profile-layer) — Explain the choice of ENS as the authoritative profile layer.

Unique responsibility: Identity portability decision and its consequences. Reader: Participants/operators.

**Final page verdict:** Merge this original page into /application/aragon-profiles.md#ens-as-the-profile-layer. Preserve every unique claim; the original file does not survive as a separate topic. (Page-overlap/location follow-up, 2026-09-13.)

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| ENS as the profile layer (H1) | Aragon uses a participant's primary ENS name and its records as the authoritative profile layer instead of creating an Aragon-owned profile database. Aragon Profiles reads those records from Ethereum… | Keep. |
| Decision (H2) | Identity remains user-controlled. A participant manages the resolver records attached to their ENS name. The free subname fallback uses the Member Registry’s distinct custody model. | Keep. |

### accounts/executing-on-a-linked-account.md

[Executing on a linked account](../../../accounts/executing-on-a-linked-account.md) — Explain preparing linked-account calls for execution through primary governance.

Unique responsibility: Nested execution and WalletConnect handoff between accounts. Reader: Participants/operators.

**Final page verdict:** Keep. The stated unique responsibility remains supported by the retained sections. No content was removed from this page and no section destination takes over that object, capability, rule or user outcome.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Executing on a linked account (H1) | When the primary account can execute on a linked account, its own proposal flow can carry actions built in the linked account's UI. Voters can inspect exactly what will run before the primary account… | Keep. |
| The flow (H2) | The primary's action builder receives transaction requests from the linked account's Aragon view over WalletConnect. Keep the primary's WalletConnect dialog open while using the linked-account view,… | Keep. |
| Reading nested actions (H2) | Because one account is telling another to execute, the calldata contains an inner action array. The Execute action's Basic details show that array and check its decoded children against the encoded… | Keep. |

### accounts/explore-page.md

[Explore page](../../../application/explore-page.md) — Explain discovering accounts and entering creation from the app landing page.

Unique responsibility: Global Explore page, separate from an account dashboard. Reader: Participants/operators.

**Final page verdict:** Move to /application/explore-page.md. Global discovery and getting-started surface, outside a selected account. (Page-overlap/location follow-up, 2026-09-13.)

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Explore page (H1) | The Explore page lets any visitor, wallet connected or not, browse and find accounts. It is also the self-serve entry point into account creation. | Keep. |
| Surface (H2) | The current page is one continuous discovery and getting-started surface: | Keep. |
| Account onboarding (H2) | An individual account's onboarding dashboard guides its admins through setup. Explore provides the global landing page for discovering accounts and choosing a getting-started route. | Keep. |

### accounts/index.md

[Accounts](../../../accounts/index.md) — Route readers through accounts, their lifecycle, and participant identity.

Unique responsibility: Accounts collection navigation and links to related areas. Reader: Participants/operators.

**Final page verdict:** Keep. The retained collection still contains independently meaningful entries and needs its navigation surface.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Accounts (H1) | The entity a user deploys and governs through the app is distinct from the ENS-backed identity of a participant acting around it. The deployed entity is called an account in product language and a DAO… | Keep. |
| Governed accounts (H2) | The onboarding arc: create an account → it starts in the admin flow (a transitional, admin-run state) → install real governance via the governance designer → leave the admin flow via admin management. | Keep. |
| Participant identity (H2) | Aragon Names — the overview of the ENS-backed participant-identity cluster. | Keep. |

### accounts/last-process-removal.md

[Warn rather than block removal of the last governance process](../../../governance/process-removal.md) — Explain the warn-only removal rule and the current app restriction.

Unique responsibility: Removal decision and consequence; candidate implementation stays separate. Reader: Participants/operators.

**Final page verdict:** Move to /governance/last-process-removal.md. Removal of governance authority, including the intended rule and current refusal. (Page-overlap/location follow-up, 2026-09-13.)

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Warn rather than block removal of the last governance process (H1) | The product rule is to warn about removing the last recognized governance process while preserving the account's choice. This follows account autonomy. | Keep. |
| Why (H2) | The app recognizes a supported set of governance plugins. An account may also have authority through other plugins or direct permissions, so the absence of a recognized process does not establish that… | Keep. |
| Current removal flow (H2) | The current app does not yet offer this warn-and-continue route for the last process. Ordinary removal requires more than one app-listed process with unrestricted execution, counting linked-account… | Keep. |

### accounts/linked-account-signaling.md

[Linked-account signaling](../../../accounts/linked-account.md#establishing-the-relationship) — Explain the onchain acknowledgement interpreted as a linked-account relationship.

Unique responsibility: Application interpretation of two signals; no authorization grant implied. Reader: Participants/operators.

**Final page verdict:** Merge this original page into /accounts/linked-account.md#establishing-the-relationship. Preserve every unique claim; the original file does not survive as a separate topic. (Page-overlap/location follow-up, 2026-09-13.)

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Linked-account signaling (H1) | Linked-account signaling records the mutual acknowledgement that lets the app present two accounts as linked. The app uses chain state as the source of truth: the relationship is recorded onchain —… | Keep. |
| Permissions repurposed as signals (H2) | Ordinarily a DAO's permissions authorize callers — a plugin gates a function with the auth modifier, which resolves against the DAO's permission manager. The two linking permissions are different: no… | Keep. |
| No product UI to establish it (H2) | There is currently no in-app flow for creating the relationship. Teams can configure it themselves by using governance proposals to grant the two acknowledgement permissions, but the setup is mildly… | Keep. |

### accounts/linked-account.md

[Linked account](../../../accounts/linked-account.md) — Define presenting related accounts together in one app instance.

Unique responsibility: Flat display hierarchy and per-surface account aggregation. Reader: Participants/operators.

**Final page verdict:** Keep as the consolidated canonical home for this topic, including the former companion page’s unique behavior and rationale. See the overlap follow-up for the incoming content and final purpose. (Page-overlap/location follow-up, 2026-09-13.)

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Linked account (H1) | A linked account is an account presented alongside a primary account in one account instance in the app. An organization can link any number of accounts, for example to present accounts it runs as… | Keep. |
| How linked-account data surfaces (H2) | The app folds linked accounts into the primary's experience rather than giving them a separate hierarchy. It takes three shapes, chosen by what a surface is already organized around: | Keep. |

### accounts/linking-does-not-imply-control.md

[Linking does not imply control](../../../accounts/linked-account.md#linking-does-not-imply-control) — Explain why display relationships confer no account authority.

Unique responsibility: Product decision separating association from control. Reader: Participants/operators.

**Final page verdict:** Merge this original page into /accounts/linked-account.md#linking-does-not-imply-control. Preserve every unique claim; the original file does not survive as a separate topic. (Page-overlap/location follow-up, 2026-09-13.)

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Linking does not imply control (H1) | The rule. A linked-account relationship is a display relationship only. It does not give the primary account any control over a linked account, nor imply any other onchain behavior. The term "linked"… | Keep. |
| Configuring actual control (separately) (H2) | A project that wants control configures OSx permissions directly. A grant answers one concrete question about one guarded function and caller; causing a final state transition can require several… | Keep. |
| Inspecting control permissions (H2) | Use Permission Viewer to inspect a selected linked account’s indexed OSx grants and attached conditions. Its table can show an Execute grant to the primary account, independently of the display… | Keep. |

### accounts/retire-or-wire-linked-account-display-helper.md

[Retire or wire the unused linked-account display helper](https://linear.app/aragon/issue/APP-1159/retire-or-wire-the-unused-linked-account-display-helper) — Evaluate retiring an unused display helper or connecting a verified missing behavior.

Unique responsibility: Dead-code disposition without inventing a live naming defect. Reader: Product planners.

**Final page verdict at audit:** Keep. This candidate still owned its specific proposed product outcome; section relocation did not implement, duplicate or supersede it.

**Transfer follow-up (2026-09-14):** Retired locally after verified transfer to APP-1159. Linear now owns the technical task; the original section assessment below is retained as history.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Retire or wire the unused linked-account display helper (H1) | Candidate: remove the unused linked-account display helper, or connect it to a verified missing display behavior. Linked accounts are live; the unused helper alone does not establish a user-facing bug. | Keep. |
| Opportunity (H2) | Confirm that the current app branch still has no production caller, then remove the helper, its export, and its dedicated tests. Wire it into a live surface only if verification first identifies a… | Keep. |
| Before ticketing (H2) | Compare the live linked-account selectors with the helper's fallback cases and name any observable gap. | Keep. |

### accounts/safe.md

[Safe](../../../accounts/safe.md) — Define a Safe as an account with built-in multisignature governance.

Unique responsibility: Safe's combined account/governor shape. Reader: Participants/operators.

**Final page verdict:** Keep. The stated unique responsibility remains supported by the retained sections. No content was removed from this page and no section destination takes over that object, capability, rule or user outcome.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Safe (H1) | A Safe is an off-the-shelf smart contract account with multisignature governance built into the same contract. Its signer set and m-of-n threshold resolve the signers' approvals, and its arbitrary-call… | Keep. |

### accounts/settings.md

[Settings](../../../accounts/settings.md) — Explain inspecting an account's configuration and starting authorized changes.

Unique responsibility: Settings page as entry point; other capabilities own each change. Reader: Participants/operators.

**Final page verdict:** Keep. The stated unique responsibility remains supported by the retained sections. No content was removed from this page and no section destination takes over that object, capability, rule or user outcome.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Settings (H1) | The Settings page brings together an account's identity, governance processes, and contract versions. It helps participants inspect the account's configuration and start authorized changes through… | Keep. |
| Account information (H2) | The Account section shows the account's network, address or ENS name, description, and resource links. With linked accounts, it presents the primary and linked accounts separately so readers can… | Keep. |
| Governance (H2) | The Governance section lists the account's visible, supported processes, including processes from linked accounts. Selecting one opens its Process details page, where members can inspect the governance… | Keep. |
| Contracts (H2) | The Contracts panel identifies the account and installed plugins by address and version, with links to their contract records. Eligible accounts also receive an entry for available contract upgrades.… | Keep. |

### accounts/wallet-connection.md

[Wallet connection](../../../application/wallet-connection.md) — Explain establishing and maintaining the address acting in the app.

Unique responsibility: Connection, modal acceptance, and wallet-dependent dialogs. Reader: Participants/operators.

**Final page verdict:** Move to /application/wallet-connection.md. Establishes the connected actor across every app flow. (Page-overlap/location follow-up, 2026-09-13.)

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Wallet connection (H1) | Connecting a wallet establishes the address acting in the Aragon app. The app uses that address to show its profile, check its participation rights, and request approval for transactions. What the… | Keep. |
| The connection dialog (H2) | Choose a wallet through the connection dialog and approve the connection in that wallet. The dialog presents the Terms of Service and Privacy Policy and requires acceptance for connections started… | Keep. |
| Dialogs that need a wallet (H2) | Transaction dialogs close when the wallet disconnects, because the app no longer has an address available to authorize the action. During automatic reconnection or a connector switch, they are… | Keep. |
| Connected to the wrong chain (H2) | An account's transactions belong to its deployment chain. If the connected wallet is on another chain, the transaction flow requests a switch before signing (submitting a transaction). | Keep. |
| Prompts on connection (H2) | Connecting deliberately on an account page can reveal participation steps for that address, such as delegating or locking tokens. These help the user put their membership into use; reconnecting… | Keep. |

### app-release-state.md

[App release documentation state](../app-release-state.md) — Track the observed stable release and documentation reconciliation checkpoint.

Unique responsibility: Authoritative release fields; unchanged by this audit. Reader: Maintainers.

**Final page verdict:** Keep. The stated unique responsibility remains supported by the retained sections. No content was removed from this page and no section destination takes over that object, capability, rule or user outcome.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| App release documentation state (H1) | The canonical checkpoint between the official app release ledger and this documentation base. It separates what has most recently shipped from what has been fully mined, reconciled against application… | Keep. |
| How the state moves (H2) | The prepare-change-space skill refreshes the latest-official fields only when it creates or switches into a branch or worktree for mutating work. A read-only query, review, or audit does not edit this… | Keep. |

### application/address-fields.md

[Address input](../../../application/address-input.md) — Describe entering, resolving, validating, and inspecting addresses across the app.

Unique responsibility: Shared address behavior; design rules remain in Address input. Reader: Participants/operators.

**Final page verdict:** Consolidate its input behavior with Address input and separate Address display. The two current pages own editing/validation and read-only inspection respectively. (Page-overlap/location follow-up, 2026-09-13.)

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Address fields (H1) | Wherever the app asks for an account or contract address, such as a transfer recipient, a multisig member, a delegate, a contract to call, or a body's address, the field validates and resolves the… | Keep. |
| Validation and ENS resolution (H2) | The field accepts an all-lowercase, all-uppercase, or correctly checksummed address and normalizes it to its EIP-55 checksum form. An address whose mixed-case checksum is wrong is marked critical and… | Keep. |
| Controls (H2) | The controls sit beside the value: paste when the field is empty, clear while editing a non-empty value, switch between the ENS name and the address when both have resolved, open the address in the… | Keep. |
| Address displays (H2) | Addresses shown outside a form, on member cards and member details, identity surfaces, permission views, finance details, and transaction views, offer the same copy control when the surface supplies a… | Keep. |

### application/app-cms.md

[App CMS](../../../application/app-cms.md) — Describe offchain curation and visibility configuration used by the app.

Unique responsibility: Content/configuration lookup, distinct from onchain account facts. Reader: Participants/operators.

**Final page verdict:** Keep. The stated unique responsibility remains supported by the retained sections. No content was removed from this page and no section destination takes over that object, capability, rule or user outcome.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| App CMS (H1) | App CMS is the platform's off-chain source for selected content, curation, and presentation configuration. Its Git-backed data can reach the product independently of a main app release: the frontend… | Keep. |
| Five established uses (H2) | Featured accounts on Explore. The Aragon team chooses the accounts in the Explore page's featured carousel, and App CMS supplies that selection independently of an app deployment. | Keep. |
| Delivery boundary (H2) | The frontend currently reads the featured-account, featured-delegate, and per-account visibility files from the app-cms repository's current main branch, using cached reads that revalidate in the… | Keep. |
| Curation decisions (H2) | The app-cms repository is public, so anyone can propose a change. Only Aragon contributors can approve and merge changes; in practice, Aragon has authored and managed them. Aragon decides case by case,… | Keep. |

### application/collection-pages.md

[Collection pages](../../../application/collection-pages.md) — Describe shared browsing behavior of account collections.

Unique responsibility: Cross-collection states and controls; collection contents stay area-owned. Reader: Participants/operators.

**Final page verdict:** Keep as the consolidated canonical home for this topic, including the former companion page’s unique behavior and rationale. See the overlap follow-up for the incoming content and final purpose. (Page-overlap/location follow-up, 2026-09-13.)

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Collection pages (H1) | An account's Proposals, Members, Transactions, and Assets pages are its collection pages: each browses one collection while keeping related context in view. Below the site navigation, every one of them… | Keep. |
| Tabs (H2) | Each page defines its own tabs for the distinctions that matter to its collection: | Keep. |
| Loading (H2) | Three loading states are kept apart. On a first load, before anything has arrived, the list region shows placeholder rows. When a settled list is fetched again, the rows already on screen stay put.… | Keep. |
| Empty results and filters (H2) | A list is empty when it is settled and rendered no rows. Narrowing by tab or chip is a view of the collection rather than a search, so a selection that matches nothing shows the collection's ordinary… | Keep. |
| Sorting and search (H2) | None of the four pages offers a sort control: each collection arrives in one fixed order the page does not offer to change. The members list's order is described with the token panel. None of the four… | Keep. |
| Failures (H2) | A failure and an empty result differ in scope. When a page, or a piece of data the page requires, cannot load, the app's failure surface replaces the whole page. When a list is validly empty, only the… | Keep. |

Applied section and dependency changes:

- Inbound section links — retarget moved Safe recognition or member-list ordering to the final canonical home.

### application/getting-help.md

[Getting help](../../../application/getting-help.md) — Explain reaching product support or arranging assistance with Aragon.

Unique responsibility: Shared help destinations and team-assisted entry points. Reader: Participants/operators.

**Final page verdict:** Keep as the consolidated canonical home for this topic, including the former companion page’s unique behavior and rationale. See the overlap follow-up for the incoming content and final purpose. (Page-overlap/location follow-up, 2026-09-13.)

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Getting help (H1) | Two kinds of help are available from inside the app: ordinary product support, offered on every page, and a handoff to the Aragon team where the app cannot faithfully represent or configure what an… | Keep. |
| Product support (H2) | A Support link in the footer of every page and a Report issue action on error states both lead to Aragon's support portal. They are unconditional and answer "something is wrong" or "I have a question". | Keep. |
| Working with the Aragon team (H2) | Three surfaces offer Get in touch, and all three lead to the same external Aragon assistance form: | Keep. |

### application/index.md

[Application](../../../application/index.md) — Route readers through behavior shared across application surfaces.

Unique responsibility: New application collection navigation. Reader: Participants/operators.

**Final page verdict:** Keep. The retained collection still contains independently meaningful entries and needs its navigation surface.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Application (H1) | Shared behavior across the Aragon app: entering and inspecting addresses, browsing collections, submitting transactions, and finding help. | Keep. |

### application/submitting-a-transaction.md

[Submitting a transaction](../../../application/submitting-a-transaction.md) — Explain approving, confirming, and resuming app transactions.

Unique responsibility: Shared submission experience after action/input composition. Reader: Participants/operators.

**Final page verdict:** Keep as the consolidated canonical home for this topic, including the former companion page’s unique behavior and rationale. See the overlap follow-up for the incoming content and final purpose. (Page-overlap/location follow-up, 2026-09-13.)

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Submitting a transaction (H1) | Every change the app makes onchain passes through one shared transaction dialog. It carries a composed transaction to the connected wallet for a signature, watches the chain until the transaction… | Keep. |
| Leaving an unfinished flow (H2) | The flows that collect a transaction's inputs share one exit guard. It arms as soon as the form holds any change against its defaults, and it challenges the exits that would discard that input: the… | Move after The four phases so references to confirmation/indexing have their context. |
| The four phases (H2) | Prepare — the app constructs the transaction and finishes any prerequisites. When the transaction refers to off-chain metadata, this includes pinning the metadata to IPFS and placing its hash in the… | Keep. |
| Connected to the wrong chain (H2) | Every submission carries the chain its transaction belongs to: for a flow acting on an account, that account's network; for account creation, the network chosen in the wizard. When the connected wallet… | Keep. |
| Uncertain results and safe retries (H2) | Once a transaction has been broadcast, the app remembers it, so an interrupted or resumed confirmation reconciles the same request instead of starting over (resuming an interrupted submission). Once a… | Keep. |
| Resuming an interrupted submission (H2) | A submission is remembered against the identity of the action it carries. Reopening the same action reopens the same submission: the dialog returns at the phase the attempt had reached, with the… | Keep. |

Applied section and dependency changes:

- ## Leaving an unfinished flow — move earlier/later within the page, before ## Connected to the wrong chain

### application/supported-chains.md

[Supported chains](../../../application/supported-chains.md) — List networks and chain-specific creation and simulation availability.

Unique responsibility: Release-grounded network lookup and generated support matrix. Reader: Participants/operators.

**Final page verdict:** Keep. The stated unique responsibility remains supported by the retained sections. No content was removed from this page and no section destination takes over that object, capability, rule or user outcome.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Supported chains (H1) | Supported chains are the blockchain networks available in the Aragon platform. Each account belongs to one chain; account creation selects that deployment network before its metadata and governance are… | Keep. |

### backlog.md

[Documentation backlog](../backlog.md) — Order finite documentation work by next actor and maintain review inventories.

Unique responsibility: Only navigation owner for task entries and task ordering. Reader: Maintainers.

**Final page verdict:** Keep as the one current work board. The corrective close-out re-enables remaining owner review and removes the merged page from the draft inventory; historical status counts remain in dated records.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Documentation backlog (H1) | The one place to go to find documentation work. It is organized by who moves next, not by what kind of record sits underneath: | Keep. |
| Ready for your input (H2) | Ordered by how much each unblocks. | Reframe queue/inventory: retire the section audit, hand remaining review to owner, retain later triggers, and mirror all 89 current drafts. |
| Ready to run (H2) | The completed purpose and topology audit supplies the settled page roles and final homes. The section audit consumes that inventory, the application-page crosswalk, and the drill-down findings. Reuse… | Reframe queue/inventory: retire the section audit, hand remaining review to owner, retain later triggers, and mirror all 89 current drafts. |
| Not yet ready (H2) | Each row names the state that changes it. The eight-page foundational review is actionable above; consume its applied corrections without holding independent agent work for the whole cohort. Topology… | Reframe queue/inventory: retire the section audit, hand remaining review to owner, retain later triggers, and mirror all 89 current drafts. |
| Inventories (H2) | Supporting lists, kept discoverable rather than in the action flow. Each mirrors state the graph owns — reconcile against the query, never hand-maintain a second copy. | Keep. |
| Page purpose and repository topology (H3) | Page purpose and repository topology records every durable platform page, every indexed upstream entry, operating-document roles, and the applied filing/type decisions. Its platform inventory is the… | Reframe queue/inventory: retire the section audit, hand remaining review to owner, retain later triggers, and mirror all 89 current drafts. |
| App release documentation state (H3) | App release documentation state is authoritative for the newest official stable app release observed, the release this base has been fully reconciled through, and the date that comparison was last… | Keep. |
| Action-view evidence (H3) | Basic action view audit preserves the completed create/edit and details inventories, rendering paths, source snapshot and documentation structure decision. It distinguishes verified support in the… | Keep. |
| Application-page coverage (H3) | Live application-page coverage maps all 17 live page families in app 1.39.0 to their canonical homes, with source revisions, information/actions, supported additions and exclusions. It preserves… | Reframe queue/inventory: retire the section audit, hand remaining review to owner, retain later triggers, and mirror all 89 current drafts. |
| Consequential drill-down coverage (H3) | Consequential drill-down coverage accounts for all 17 live page families and reuses the 22 action identities. It records inspection routes and input methods, exact source revisions, canonical… | Reframe queue/inventory: retire the section audit, hand remaining review to owner, retain later triggers, and mirror all 89 current drafts. |
| Gauge configuration refusals (H3) | Gauge configuration refusal comparison records the six live management forms, the three selectable plugin setups, Admin and SPP scope dispositions, exact source revisions, and the distinction between… | Keep. |
| Recovery without Execute (H3) | Recovery verification preserves the pinned permission, execution, factory, and upgrade evidence, including independently usable authority and the limits of self-held ROOT. These findings inform the… | Keep. |
| Product and internal classification (H3) | Product/internal classification audit classifies every canonical platform page and index as product knowledge, internal guidance, or mixed, lists the pages intended for the assistant, and records the… | Keep. |
| Client-specific integrations (H3) | Client-specific integrations records named-client scope, documentation homes, and coverage limits for BENQI and Alchemix. Use it alongside product scope exclusions when interpreting source findings; a… | Keep. |
| OSx orientation design (H3) | OSx orientation design and its coverage map preserve the owner decisions, the authorized summary boundary, the verified grant/revoke, indexing, audit and asset-scale evidence, the entry page's home,… | Keep. |
| Drafts awaiting review (H3) | wiki --root . list --where status=draft is authoritative — currently the 86 pages below, and nothing else. The owner's private research/ workspace is deliberately outside both the index and this board,… | Reframe queue/inventory: retire the section audit, hand remaining review to owner, retain later triggers, and mirror all 89 current drafts. |
| Documentation questions (H3) | Unresolved questions live in the finite tasks above. Query wiki --root . list --where type=task --where nextactor=owner for owner work and wiki --root . list --where type=task --where nextactor=agent… | Keep. |
| Unwritten pages (promised by links) (H3) | wiki --root . unresolved is authoritative; currently empty. | Keep. |
| Product scope exclusions (H3) | Product scope exclusions is the source of truth for implemented source surfaces deliberately left out of current product documentation until they are live. Its Product opportunity column links any… | Keep. |

### design/abstract-then-drill-down.md

[Abstract, then offer a drill-down](../../design/principles/honest-abstraction.md#abstract-then-offer-a-drill-down) — Explain providing inspectable facts behind useful product abstractions.

Unique responsibility: Progressive inspection pattern, distinct from the principle's rationale. Reader: Product builders.

**Final page verdict:** Merge this original page into /principles/honest-abstraction.md#abstract-then-offer-a-drill-down. Preserve every unique claim; the original file does not survive as a separate topic. (Page-overlap/location follow-up, 2026-09-13.)

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Abstract, then offer a drill-down (H1) | Start with the product-level representation a person can understand and act on. When the onchain fact, encoded call, or source record behind it matters, offer a route to it without making that detail… | Keep. |
| Instances (H2) | The action builder moves from a basic view to decoded calldata and then raw calldata when each additional level is available. | Keep. |

### design/account-terminology-rollout.md

[Complete the account-terminology rollout](../../product-opportunities/account-terminology-rollout.md) — Evaluate applying the settled account terminology across product copy.

Unique responsibility: Product-copy delivery work, separate from documentation terminology policy. Reader: Product planners.

**Final page verdict:** Keep. This candidate still owns its specific proposed product outcome; section relocation did not implement, duplicate or supersede it.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Complete the account-terminology rollout (H1) | Candidate: apply the account terminology rule consistently across product copy. | Keep. |
| Opportunity (H2) | Apply the rule consistently across product copy: use account for the product entity, reserving DAO for the OSx contract, exact protocol identifiers, and explicitly token-governed use cases. The current… | Keep. |
| Before ticketing (H2) | Inventory user-facing DAO and account strings across the product. | Keep. |

### design/address-input.md

[Address input](../../../application/address-input.md) — Specify consistent resolution and validation of address inputs.

Unique responsibility: Reusable design rules; shared user behavior is in Address fields. Reader: Product builders.

**Final page verdict:** Merge this original page into /application/address-input.md. Preserve every unique claim; the original file does not survive as a separate topic. (Page-overlap/location follow-up, 2026-09-13.)

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Address input (H1) | Use the shared address input whenever a flow accepts an account or contract identifier. It gives every consumer one resolution and validation boundary, covering checksum enforcement, ENS resolution,… | Keep. |
| Design rules (H2) | Checksum enforcement is on by default. Lowercase and uppercase forms are normalized to EIP-55; a wrong mixed-case checksum is critical and never accepted (normalize input without changing its meaning). | Keep. |

### design/alert-severity.md

[Alert severity](../../design/alert-severity.md) — Specify how alerts communicate information, caution, and critical concerns.

Unique responsibility: Severity, separate from authorization and control availability. Reader: Product builders.

**Final page verdict:** Keep. The stated unique responsibility remains supported by the retained sections. No content was removed from this page and no section destination takes over that object, capability, rule or user outcome.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Alert severity (H1) | Alerts distinguish neutral information, a reason for caution, and an error or strong concern. Choose the treatment after control availability establishes that an alert is warranted. Severity… | Keep. |
| Alert dialogs (H2) | An alert dialog interrupts an action when its consequence needs acknowledgement. Explain what will change and why the decision matters, then let the user cancel or continue where continuation is… | Keep. |
| Non-dialog surfaces (H2) | An inline advisory keeps relevant context beside the work it affects. Field errors explain what must be corrected at the input. The app's advisories remain until the state that produced them changes,… | Keep. |
| Failure is not emptiness (H2) | A page failure means the app could not retrieve the requested information. An empty result means the retrieval succeeded and found nothing to show. Both need an explanation and an appropriate next step… | Keep. |

### design/control-availability.md

[Control availability](../../design/control-availability.md) — Specify when to hide, disable, guard, warn, or enable a control.

Unique responsibility: Control-presence decision model. Reader: Product builders.

**Final page verdict:** Keep. The stated unique responsibility remains supported by the retained sections. No content was removed from this page and no section destination takes over that object, capability, rule or user outcome.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Control availability (H1) | Hiding a control, showing it disabled, or showing it enabled and responding at activation are different product messages, not interchangeable implementation choices. Each treatment makes a different… | Keep. |
| Decision sequence (H2) | Would the user reasonably expect this control or need it for the current goal? If no, hide it. | Keep. |
| Keep the distinctions honest (H2) | Communication is not enforcement. Hidden and disabled controls only describe the interface's current understanding. Authorization must still be enforced by the authoritative backend or onchain… | Keep. |
| Worked instances (H2) | Hidden: the direct create-transaction control is absent without execute permission because the product defines no direct-control expectation for an actor outside that context. | Keep. |

### design/coordinate-colliding-onboarding-prompts.md

[Coordinate colliding onboarding prompts](../../product-opportunities/coordinate-colliding-onboarding-prompts.md) — Evaluate coordination of competing connection-time onboarding dialogs.

Unique responsibility: Shared prompt orchestration across participation flows. Reader: Product planners.

**Final page verdict:** Keep. This candidate still owns its specific proposed product outcome; section relocation did not implement, duplicate or supersede it.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Coordinate colliding onboarding prompts (H1) | Candidate: coordinate connection-time onboarding prompts so one does not silently replace another while a holder is deciding how to participate through the Token panel. | Keep. |
| Opportunity (H2) | The connection-time onboarding watchers open their dialogs independently, and the dialog surface replaces rather than stacks: when more than one prompt qualifies on the same deliberate connection,… | Keep. |
| Before ticketing (H2) | Decide the rule: sequence the prompts, queue them, or apply the Members-card priority order to the connection-time dialogs. | Keep. |

### design/dao-slots.md

[DAO slots](../../design/dao-slots.md) — Explain account-specific extension points in shared product flows.

Unique responsibility: Account-level customization; Alchemix remains a brief unlaunched example. Reader: Product builders.

**Final page verdict:** Keep. The stated unique responsibility remains supported by the retained sections. No content was removed from this page and no section destination takes over that object, capability, rule or user outcome.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| DAO slots (H1) | A DAO slot gives a particular account a custom part of the Aragon experience, such as branded presentation or a specialized governance interaction. It keeps that account's needs separate from the… | Keep. |
| DAO slots vs plugin slots (H2) | A plugin slot adapts the experience to a governance plugin. A DAO slot adapts it to the account being viewed. Both keep bespoke behavior within a defined boundary so the shared product journey remains… | Keep. |

### design/datalist-page.md

[Datalist page](../../../application/collection-pages.md) — Specify the reusable collection-page design pattern.

Unique responsibility: Collection layout and state design, separate from browsing behavior. Reader: Product builders.

**Final page verdict:** Merge this original page into /application/collection-pages.md. Preserve every unique claim; the original file does not survive as a separate topic. (Page-overlap/location follow-up, 2026-09-13.)

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Datalist page (H1) | A datalist page is the platform's reusable page type for browsing a collection while keeping related context in view: the datalist on the left, a contextual aside on the right. The proposals, members,… | Keep. |
| Design rules (H2) | Tabs are page-defined. Each page declares the distinctions that matter to its collection; there is no universal partition copied across every datalist. | Reframe as reusable browsing/state rules; move unused component controls, data-library defaults, and implementation ownership to dated log evidence. |

Applied section and dependency changes:

- Design rules — reframe as browsing and state-presentation rules; retain library defaults and unused controls as dated log evidence.

### design/dialog-continuity.md

[Preserve task context across dialogs](../../design/dialog-continuity.md) — Specify preserving context when dialogs stack, replace, or wait.

Unique responsibility: Relationships between dialogs, separate from dialog kinds. Reader: Product builders.

**Final page verdict:** Keep. The stated unique responsibility remains supported by the retained sections. No content was removed from this page and no section destination takes over that object, capability, rule or user outcome.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Preserve task context across dialogs (H1) | A dialog that opens another decision preserves the person's task when that decision belongs to the task. An unrelated prompt waits its turn. Opening a dialog must not silently discard work or replace a… | Keep. |
| Stack, replace, or queue deliberately (H2) | / Relationship / Treatment / Result / | Keep. |
| Preserve more than visibility (H2) | Preserve useful input when returning to the parent, and apply the child result to the part that requested it. If the new decision invalidates the parent, close or replace it explicitly and explain the… | Keep. |

### design/dialog-taxonomy.md

[Dialog taxonomy](../../design/dialog-taxonomy.md) — Distinguish the dialog kinds and when each container fits.

Unique responsibility: Container taxonomy and wallet-readiness rule. Reader: Product builders.

**Final page verdict:** Keep, with repeated wizard guidance replaced by a link. General versus alert dialogs, the form-input boundary and wallet readiness remain a distinct container-classification question. Wizard owns its two variants and nesting.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Dialog taxonomy (H1) | The product distinguishes three kinds of dialogs: | Keep. |
| Wallet readiness (H2) | A dialog that needs a connected address should remain tied to that connection. Closing it on disconnect prevents an action from continuing without an actor; temporarily hiding it during reconnection… | Keep. |

### design/full-screen-wizard.md

[Full-screen wizard](../../../application/wizard.md#full-screen-wizard) — Explain choosing a dedicated destination for guided input.

Unique responsibility: Full-screen container specialization of Wizard. Reader: Product builders.

**Final page verdict:** Merge into Wizard and delete this file. After the section moves, the remaining container-choice rule, retained-input example, transaction handoff and flow links repeat or specialize the same wizard pattern. They establish a variant, with no independent rule set requiring a second pattern entry. The full-screen term survives as Wizard / Full-screen wizard.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Full-screen wizard (H1) | A full-screen wizard is the dedicated-destination form of a wizard, used when creating something becomes the person's main task. Creating a proposal or transaction takes the full screen so that task… | Merge definition into Wizard / Full-screen wizard and submission handoff into Submitting the collected input. |
| When to use (H2) | Choose the container by the task's relationship to the surrounding context. A full-screen flow becomes the main context. A dialog keeps an action within the context the person is already using, which… | Collapse duplicate container-choice guidance into Wizard / Choosing the container and Dialog wizard. |
| Worked example: governance designer (H2) | Clicking "+ Governance" opens the governance designer as a full-screen wizard. The user configures governance across the wizard's steps — plugin-specific configuration renders through plugin slots —… | Merge the retained-parent/body example into Wizard / Nesting and retained input. |
| The full-screen wizards today (H2) | Create account — chain, then account metadata; the submission dialog deploys the account in one transaction. The entry point is on the Explore page above the account list. See account creation. | Merge the four capability links into Wizard / Full-screen wizard. |

Applied section and dependency changes:

- Worked example — focus on parent/child task context and link the current installation route; The full-screen wizards today — replace repeated sequences with linked use cases.

### design/index.md

[Design](../../design/index.md) — Route builders through reusable interaction and content patterns.

Unique responsibility: Internal design collection and reading order. Reader: Product builders.

**Final page verdict:** Keep as design navigation. Remove the duplicate full-screen pattern row; Wizard now exposes both variants. The remaining groups still route to independent interaction, component and content patterns.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Design (H1) | The platform's design patterns: the reusable interaction, component, and content rules that keep features feeling like one product. Use the shared pattern that fits the interaction; develop a reusable… | Keep. |
| Before building or changing a feature (H2) | Read in this order: | Keep. |
| Interface principles and patterns (bold group) | Every element makes a claim — how user expectations, product meaning, and semantic minimalism determine what belongs in an interface. | Reframe hierarchy: promote the bold group label to a peer level-2 navigation section. |
| Interaction patterns (bold group) | Normalize input without changing its meaning — remove harmless representation differences without guessing or changing the entered value's meaning. | Reframe hierarchy: promote the bold group label to a peer level-2 navigation section. |
| Component patterns (bold group) | Plugin slots — how plugin-specific business logic lives inside generic flows, and what every plugin and action integration owes. | Reframe hierarchy: promote the bold group label to a peer level-2 navigation section. |
| Content patterns (bold group) | Alert severity — the warning vs critical distinction, used beyond dialogs. | Reframe hierarchy: promote the bold group label to a peer level-2 navigation section. |

Applied section and dependency changes:

- Four bold library groups — promote to peer navigation headings outside Before building.

### design/input-normalization.md

[Normalize input without changing its meaning](../../design/input-normalization.md) — Specify conversions that preserve an entered value's meaning.

Unique responsibility: Normalization boundary, separate from validation timing. Reader: Product builders.

**Final page verdict:** Keep. The stated unique responsibility remains supported by the retained sections. No content was removed from this page and no section destination takes over that object, capability, rule or user outcome.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Normalize input without changing its meaning (H1) | Input normalization converts an entered value to a consistent form without changing what the person meant. Use it when the product can prove that two representations mean the same thing. If a change… | Keep. |
| Normalize by meaning, not by widget (H2) | Choose normalization from the field's product meaning. Two text inputs may need different treatment even when they use the same component. | Keep. |
| Use one visible boundary (H2) | Apply a field's normalization through one shared rule wherever that semantic field appears. Run it when the person finishes editing, before the value is validated for the next step or stored, and show… | Keep. |

### design/inspect-inline-link-destinations.md

[Inspect labeled-link destinations before navigation](../../product-opportunities/inspect-inline-link-destinations.md) — Evaluate inspecting labeled user-supplied destinations before navigation.

Unique responsibility: Missing preview affordances on text and resource links. Reader: Product planners.

**Final page verdict:** Keep. This candidate still owns its specific proposed product outcome; section relocation did not implement, duplicate or supersede it.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Inspect labeled-link destinations before navigation (H1) | Candidate: let readers inspect the destination of a labeled link in a proposal description, delegate statement, or gauge's resource list before opening it, using keyboard, touch, or a pointer. | Keep. |

### design/inspectable-link-destinations.md

[Make user-supplied link destinations inspectable](../../design/inspectable-link-destinations.md) — Specify inspecting user-supplied URLs before following them.

Unique responsibility: Link-destination interaction rule. Reader: Product builders.

**Final page verdict:** Keep. The stated unique responsibility remains supported by the retained sections. No content was removed from this page and no section destination takes over that object, capability, rule or user outcome.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Make user-supplied link destinations inspectable (H1) | Let a reader inspect where a user-supplied link goes before opening it. A friendly label may explain the destination, but it must not be the only information available when the product does not control… | Keep. |
| Match the treatment to the surface (H2) | A standalone resource has room for both pieces of information. Show its supplied name as the link label and the resolved URL or destination underneath. Proposal resources, plugin metadata, and… | Keep. |

### design/invariant-validation.md

[Refuse unsatisfiable configuration](../../design/invariant-validation.md) — Explain refusing unsatisfiable governance configuration while preserving valid choices.

Unique responsibility: Chosen hard-stop boundary, rather than all form validation. Reader: Product builders.

**Final page verdict:** Keep. The stated unique responsibility remains supported by the retained sections. No content was removed from this page and no section destination takes over that object, capability, rule or user outcome.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Refuse unsatisfiable configuration (H1) | Invariant validation rejects governance settings that cannot satisfy the rules they configure. Consequential but valid choices receive warnings and remain the account's decision. This is the design… | Keep. |
| Instances (H2) | The governance designer's numeric controls exclude 100% support while allowing 100% participation, reflecting the strict support comparison. Multisig approvals are capped at the member count, including… | Keep. |

### design/keep-the-wizard-exit-guard-armed.md

[Keep the wizard exit guard armed](../../product-opportunities/keep-the-wizard-exit-guard-armed.md) — Evaluate preserving unfinished-flow protection across nested wizard exits.

Unique responsibility: Parent guard disarming and history effects. Reader: Product planners.

**Final page verdict:** Keep. This candidate still owns its specific proposed product outcome; section relocation did not implement, duplicate or supersede it.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Keep the wizard exit guard armed (H1) | Candidate: keep an unfinished parent wizard protected when a nested dialog closes, and preserve the expected browser-Back behavior. | Keep. |
| Opportunity (H2) | The wizard exit guard is one shared mechanism, which is its strength — every flow inherits it — and also means one leak reaches every flow. Two leaks exist, established by code reading rather than a… | Keep. |
| Before ticketing (H2) | Reproduce the nested-flow disarm in a browser; the code path is unambiguous but the fix shape (re-arm on parent re-focus, or reference-count the flag) depends on how the flows compose in practice. | Keep. |

### design/metadata-input.md

[Metadata input](../../../application/metadata-input.md) — Specify how object identity is collected before operational configuration.

Unique responsibility: Shared metadata input and placement pattern. Reader: Product builders.

**Final page verdict:** Keep. The stated unique responsibility remains supported by the retained sections. No content was removed from this page and no section destination takes over that object, capability, rule or user outcome.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Metadata input (H1) | Metadata gives an object a recognizable identity and explains what it is for. The user supplies meaningful fields; the app stores them and prepares the reference needed by the transaction. This keeps… | Keep. |
| The common shape (H2) | Names, descriptions, and resource links give people enough context to recognize an object and understand its purpose. A resource needs a URL and may have a display label. Individual objects add fields… | Keep. |
| Plugin metadata follows the plugin (H2) | A plugin has one identity even when it serves as both a process and a body. Its name, description, and resources can appear in both the proposals and members experiences. Editing that metadata changes… | Keep. |
| Placement in a wizard (H2) | Metadata comes before operational configuration so the user first defines the thing they are creating, then decides how it works. A prerequisite may come first when it determines the available choices:… | Keep. |

### design/plugin-slots.md

[Plugin slots](../../design/plugin-slots.md) — Explain adapting shared flows to supported plugin behavior.

Unique responsibility: Plugin-level extension contract, distinct from account slots. Reader: Product builders.

**Final page verdict:** Keep. The stated unique responsibility remains supported by the retained sections. No content was removed from this page and no section destination takes over that object, capability, rule or user outcome.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Plugin slots (H1) | Plugin slots let a shared product flow adapt to the governance rules of a supported plugin. The governance designer, for example, keeps one setup journey while offering the configuration appropriate to… | Keep. |
| The slot contract (H2) | The shared flow owns navigation, composition, and submission. A plugin supplies the parts whose meaning depends on its governance model: configuration, eligibility, proposal behavior, and the… | Keep. |
| Validation (H3) | A plugin's configuration must satisfy its own rules before setup can continue. A multisig approval threshold, for example, cannot exceed the number of members. The shared journey enforces this at the… | Keep. |
| Transaction composition (H3) | Each integration translates its own configuration into the actions required to install, update, or remove that plugin. The shared flow combines those actions and handles their preparation and submission. | Keep. |
| Action integrations (H3) | An action integration must support both preparing an action and reviewing its meaning wherever the action batch appears. The action builder provides the shared experience. Validation remains local to… | Keep. |
| Worked example: adding a body (H2) | Adding a multisig body asks for members and an approval threshold. Adding Token Voting asks for token-based membership and voting rules. Both fit the same body-creation journey, but each exposes the… | Keep. |

### design/primary-action-hierarchy.md

[Use primary actions sparingly](../../design/primary-action-hierarchy.md) — Specify the recommended next action within one decision context.

Unique responsibility: Primary styling and action hierarchy. Reader: Product builders.

**Final page verdict:** Keep. The stated unique responsibility remains supported by the retained sections. No content was removed from this page and no section destination takes over that object, capability, rule or user outcome.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Use primary actions sparingly (H1) | A primary action tells the person which next step the product recommends in the current decision. Use primary styling only when that recommendation exists. Within one decision context, show at most one… | Keep. |
| One decision, one lead action (H2) | A dialog, wizard step, page section, or card is one decision context when its controls answer the same immediate question. Choose the action that advances or completes that decision and make… | Keep. |
| Say what the action does (H2) | Name the primary action after its immediate outcome or the boundary the person is about to cross. Naming examples: | Keep. |
| Keep hierarchy separate from availability and severity (H2) | Primary styling says which action leads. It does not say whether the actor is authorized, whether the action is dangerous, or whether the control is currently available. Use control availability for… | Keep. |

### design/reach-out-to-the-team.md

[Reach out when the abstraction cannot stay honest](../../../application/getting-help.md#when-the-app-needs-the-aragon-team) — Specify handing off when the app cannot represent a configuration faithfully.

Unique responsibility: Design boundary handoff; help routes have a product capability home. Reader: Product builders.

**Final page verdict:** Merge this original page into /application/getting-help.md#when-the-app-needs-the-aragon-team. Preserve every unique claim; the original file does not survive as a separate topic. (Page-overlap/location follow-up, 2026-09-13.)

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Reach out when the abstraction cannot stay honest (H1) | When an edge case cannot be represented faithfully by the app's supported abstraction, the app hands the person to the Aragon team rather than present a misleading self-serve flow. This is a boundary… | Keep. |
| Where the boundary applies (H2) | All advanced-governance creation and editing requires the Aragon team. Creation offers an On request handoff. Existing conditions and interactions between sub-plugins and the staged proposal processor… | Keep. |
| Design rules (H2) | Trigger the handoff from a specific state or limit, and carry the decision forward. Every handoff surface leads to the same external Aragon assistance form, so the configuration the person has already… | Keep. |

### design/transaction-submission.md

[Transaction submission stepper](../../../application/submitting-a-transaction.md) — Specify the reusable transaction lifecycle after inputs are collected.

Unique responsibility: Submission stepper design, separate from input wizards. Reader: Product builders.

**Final page verdict:** Merge this original page into /application/submitting-a-transaction.md. Preserve every unique claim; the original file does not survive as a separate topic. (Page-overlap/location follow-up, 2026-09-13.)

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Transaction submission stepper (H1) | The transaction submission stepper is the reusable dialog lifecycle that carries an intended transaction from the app to a wallet and then back into the app's indexed view of chain state, in four… | Keep. |
| Design rules (H2) | Separate confirmation from indexing. Chain confirmation says the transaction happened; indexing says the app's read model is ready to present what happened. Keeping them as two phases lets the success… | Keep. |
| Ownership (H2) | The chain rule, the attempt memory, and the retry guard are the app's own logic; gov-ui-kit supplies the dialog container and no transaction lifecycle. | Move to dated log evidence; app/library ownership is implementation context. |

Applied section and dependency changes:

- Ownership — move source-library ownership to dated log evidence; retain lifecycle design rules.

### design/use-revealable-address-output-consistently.md

[Use revealable address output consistently](../../product-opportunities/use-revealable-address-output-consistently.md) — Evaluate consistent full-address inspection in dense interactive surfaces.

Unique responsibility: Remaining address affordances, with existing alternatives retained. Reader: Product planners.

**Final page verdict:** Keep. This candidate still owns its specific proposed product outcome; section relocation did not implement, duplicate or supersede it.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Use revealable address output consistently (H1) | This candidate addresses the gap between the intended full-address inspection behavior and the tagged app's current address displays. It is adjacent to the existing Address input conventions, but… | Keep. |
| Opportunity (H2) | The app uses the shared AddressOutput component across visible address surfaces, including governance-body summaries, settings, and permission lists and graphs. It reveals the complete checksummed… | Keep. |
| Before ticketing (H2) | Classify which shortened addresses need reveal, copy, an explorer link, or a combination of those controls. | Keep. |

### design/validation-timing.md

[Show validation when it can help](../../design/validation-timing.md) — Specify when validation messages help a person repair input.

Unique responsibility: Feedback timing and repair locality. Reader: Product builders.

**Final page verdict:** Keep. The stated unique responsibility remains supported by the retained sections. No content was removed from this page and no section destination takes over that object, capability, rule or user outcome.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Show validation when it can help (H1) | Show a validation message at the earliest moment the person can understand and act on it. Do not show an error merely because the app can detect one, and do not wait until submission when the person… | Keep. |
| Match the message to the decision point (H2) | Before interaction: do not mark an untouched field as wrong. The person has not had a chance to provide a value. | Keep. |
| Keep repair local (H2) | Keep a failed check in the part of the flow where the person can repair it. Show the wizard step's blocking fields and preserve useful input while the person corrects them. | Keep. |

### design/voting-terminal.md

[Voting Terminal](../../../governance/proposal.md#voting) — Specify the hierarchy for presenting proposal decision evidence and actions.

Unique responsibility: Proposal voting pattern; gauge allocation is a different surface. Reader: Product builders.

**Final page verdict:** Merge this original page into /governance/proposal.md#voting. Preserve every unique claim; the original file does not survive as a separate topic. (Page-overlap/location follow-up, 2026-09-13.)

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Voting Terminal (H1) | The Voting Terminal is the proposal page's decision surface, built on gov-ui-kit's ProposalVoting pattern: it shows the proposal or current stage, its status and timing, the bodies involved, the… | Keep. |
| Why it matters (H2) | The terminal makes the decision process legible instead of hiding it behind contract state. In a staged flow, participants in every stage, including a Safe acting as a governing body, use the same… | Keep. |
| Hierarchy (H2) | The pattern has a stable order: process status first, body selection second, decision detail third. ProposalVoting supplies the tab shell for Breakdown, Votes, and Settings; the app assembly supplies… | Reframe as presentation rules with canonical product links; move reference-story and source-assembly mechanics to dated log evidence. |
| Assembly rules (H2) | Approval and veto are body roles. Render each body's role and result treatment independently, show both thresholds in a mixed stage, and keep a veto body actionable until its window closes even after… | Reframe as presentation rules with canonical product links; move reference-story and source-assembly mechanics to dated log evidence. |
| Implementation scope (H2) | These assembly identifiers ground the pattern in current source; they are not part of its public design-system API. | Move to dated log evidence; component assembly inventory is maintenance/source context. |
| Design-system reference (H2) | For the compound component's API and variants, use gov-ui-kit's Modules/Components/Proposal/ProposalVoting story, especially SimpleGovernance, SingleStage, MultiStage, and MultiBody. The corresponding… | Keep. |

Applied section and dependency changes:

- Hierarchy and Assembly rules — reframe as reusable presentation rules; move story/assembly inventory and component mechanics to dated log evidence; retain Design-system reference for lookup.

### design/wizard.md

[Wizard](../../../application/wizard.md) — Define guided collection of transaction inputs and its composition rules.

Unique responsibility: Input-flow pattern, independent of container and submission lifecycle. Reader: Product builders.

**Final page verdict:** Keep and consolidate the full-screen variant here. The single pattern now owns when guided input is needed, the two container choices, nesting, retained input and the submission handoff. It does not absorb the transaction lifecycle or the general/alert dialog taxonomy.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Wizard (H1) | A wizard is a transaction-input flow: it holds the information a user provides while the product collects what it needs to produce a transaction. The pattern is for a flow with enough input or state to… | Keep. |
| Choosing the container (H2) | A dialog wizard keeps an action within its surrounding context, such as adding a body within the governance designer. | Reframe as interaction/state rules; link shared behavior; move component API, default and source-ownership details to dated log evidence. |
| Leaving an unfinished wizard (H2) | Every wizard inherits one exit guard from the shared wizard root, so the behavior is the same in a full-screen wizard and in a dialog wizard; what it challenges and when it releases is documented on… | Reframe as interaction/state rules; link shared behavior; move component API, default and source-ownership details to dated log evidence. |

Applied section and dependency changes:

- Choosing the container and Leaving an unfinished wizard — retain interaction rules and link shared behavior; move component API/default/ownership details to dated log evidence.


Final closure sections: **Full-screen wizard** and **Dialog wizard** own the two container variants; **Nesting and retained input** owns their permitted relationship and the governance-designer example; **Submitting the collected input** owns the handoff to the separately defined lifecycle. Keep these under the single wizard pattern.

### governance/action-builder.md

[Action builder](../../../application/action-builder.md) — Explain composing and inspecting ordered account calls.

Unique responsibility: Shared composition and viewing modes; action catalogue stays separate. Reader: Participants/operators.

**Final page verdict:** Move to /application/action-builder.md. Shared action composition and inspection in proposal and direct-transaction flows. (Page-overlap/location follow-up, 2026-09-13.)

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Action builder (H1) | The Action builder lets users compose ordered actions and inspect what each action will do. It provides familiar forms for common tasks, contract-function inputs for other calls, and access to the… | Keep. |
| Adding actions (H2) | During proposal creation, the Action builder starts with an empty list. + Action opens a searchable action catalog grouped by contract. Each group shows the contract's name and address; each item… | Replace repeated permission guidance with the Direct execution and permission changes link. |
| Adding a contract (H3) | To call a function outside the catalog, paste a contract address into the search or choose Add contract address. The app checks whether the address is a proxy, resolves its implementation, and… | Merge: receive explorer/ABI support from Assets. |
| Transferring assets (H3) | Transfer asks for the asset, amount, and recipient. In the unrestricted catalog, you choose the asset without first selecting its contract. When Transfer comes from an allowed-actions list, the asset… | Merge: receive token selection/balance rules from Assets and precision rules from Create transaction. |
| Adding through WalletConnect (H3) | WalletConnect connects the account to another dApp so you can collect that dApp's transaction requests as actions. Copy the dApp's WalletConnect URI, commonly available through its QR-code flow, into… | Keep. |
| Reusing action sets as JSON (H3) | Upload adds a saved JSON action array. You can download an action array while composing a proposal, from an existing proposal's details page, or from an execution's detail dialog on the Transactions page. | Keep. |
| Viewing actions (H2) | Each action can be viewed as Basic, Decoded, or Raw, depending on the available information. These views are available while editing an action and when reading already-proposed actions on the Proposal… | Keep. |
| Composing and validating one action (H3) | Decoded forms expose a field for each function parameter, labeled with its Solidity type and its NatSpec notice when available. They support nested tuples and arrays, validate values against their… | Move within page: promote to level 2 before Viewing actions. |
| Filtering to allowed actions (H2) | During proposal creation, when the selected process's Execute permission is scoped by an execute selector condition, Only show allowed actions starts enabled. It filters + Action to the permitted… | Keep scope; retain the generic permission-function catalogue exception moved from Adding actions. |
| Permissions in the action catalog (H3) | Registered plugin actions can declare a required permission ID. The catalog includes such an action when the indexed active grants match that permission ID, the action target as where, and the account… | Keep. |
| Nested action arrays (H2) | An action can contain another action array, such as a call asking another account to execute a batch or asking a plugin to create a proposal. Recognized Execute and Create Proposal calls have Basic… | Keep. |
| Direct execution and permission changes (H2) | An authorized wallet can also use the Action builder in the direct transaction flow. It composes an array for DAO.execute, and completed executions can be reviewed through the Transactions page. | Keep. |

Applied section and dependency changes:

- Adding actions — replace repeated permission-change guidance with a link; Adding a contract and Transferring assets — receive shared rules; Composing and validating one action — promote and place before Viewing actions.
- Filtering to allowed actions — preserve the generic permission-function route formerly repeated in Adding actions.

### governance/action-simulation.md

[Action simulation](../../../application/action-simulation.md) — Explain evaluating a prepared action batch through its intended execution route.

Unique responsibility: Simulation capability across proposal and direct-execution callers. Reader: Participants/operators.

**Final page verdict:** Move to /application/action-simulation.md. Tests an action execution path independently of proposal or voting lifecycle. (Page-overlap/location follow-up, 2026-09-13.)

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Action simulation (H1) | The app can simulate a prepared batch of actions before it is executed. The capability is defined by the action array and its intended execution route, not by a proposal: proposal creation and the… | Keep. |
| What it simulates (H2) | The simulation reduces the intended execution to an action array plus its caller and account context. In a governance-routed flow it simulates execute on the DAO with the process's plugin as caller —… | Keep. |
| Where it is available (H2) | During proposal creation, after the action builder has prepared the batch and before the proposal is submitted. The selected process supplies the execution context. The author can skip simulation or… | Replace proposal-specific cache and lifecycle rules with a link to Proposal / Actions and execution. |
| Why this is the meaningful question (H2) | An author, reviewer, voter, or signer needs to know whether the prepared actions will work through their intended execution route and what they will do. Simulating an earlier wrapper call is not… | Keep. |

Applied section and dependency changes:

- Where it is available — replace proposal lifecycle/cache details with a link to Proposal / Actions and execution.

### governance/action.md

[Action](../../../governance/action.md) — Define a proposed onchain call and its place in an ordered array.

Unique responsibility: Product action semantics, distinct from a proposal or transaction. Reader: Participants/operators.

**Final page verdict:** Keep. The stated unique responsibility remains supported by the retained sections. No content was removed from this page and no section destination takes over that object, capability, rule or user outcome.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Action (H1) | An action is one onchain call describing what an account is asked to do, such as transfer tokens, change governance settings, or interact with a protocol. | Keep. |
| Action arrays and execution (H2) | An action array is an ordered list of actions. Any address authorized by the account's Execute permission (EXECUTEPERMISSIONID) can pass an array to DAO.execute, subject to any conditions on that… | Keep. |
| Actions in proposals (H2) | Proposal-based governance plugins use proposals to let governing bodies decide which actions the account should execute. Creating a proposal submits its action array to the plugin. Members of the… | Keep. |
| Preparing and reviewing actions in the app (H2) | The action builder helps users compose an action array and understand each call. Its action catalog includes Basic actions, a subset with purpose-built forms or readable details, such as transfers,… | Keep. |
| Action targets and authorization (H2) | Account-native actions call functions governed by the account's permission manager. These include the account's own permission and metadata functions, as well as functions on plugins and other… | Keep. |
| Action order and failures (H2) | Each action is prepared independently. The builder validates individual inputs, but does not check how one action changes the conditions for another. During execution, actions run in array order, so a… | Keep. |

### governance/aragon-deployed-plugins.md

[Aragon-deployed plugins](../../../application/aragon-deployed-plugins.md) — Explain supported capabilities whose deployment is arranged with Aragon.

Unique responsibility: Deployment/support category, with client-qualified examples. Reader: Participants/operators.

**Final page verdict:** Keep. The stated unique responsibility remains supported by the retained sections. No content was removed from this page and no section destination takes over that object, capability, rule or user outcome.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Aragon-deployed plugins (H1) | Aragon-deployed plugins provide capabilities the app supports, with deployment carried out by the Aragon team. The app provides the experience for a compatible installed instance; setting it up… | Keep. |
| Arranging deployment (H2) | Contact the Aragon team to discuss the capability, its configuration, and deployment. The team advises on the setup and carries out the deployment. Commercial terms depend on the capability and engagement. | Keep. |
| Available capabilities (H2) | Gauge voting — Aragon deploys the Gauge Voter for clients, and the app provides the voting experience. | Keep. |
| Client-specific capabilities (H2) | BENQI lending-market gauges integrate BENQI market incentives with the shared Gauge voting experience. The lending-market registration and removal actions are specific to BENQI. | Keep. |

### governance/aragon-notifications.md

[Aragon Notifications](../../../governance/aragon-notifications.md) — Explain subscribing to account proposal activity through Telegram.

Unique responsibility: Notification service and subscription/data controls. Reader: Participants/operators.

**Final page verdict:** Keep. The stated unique responsibility remains supported by the retained sections. No content was removed from this page and no section destination takes over that object, capability, rule or user outcome.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Aragon Notifications (H1) | Aragon Notifications is the product's opt-in Telegram service for following proposal activity on an account. It gives participants a route from the app into a bot operated by the Aragon team, where… | Keep. |
| Subscribing from an account (H2) | The dashboard and the account's proposal list each offer an Aragon Notifications card. Its action opens Telegram with that account's network-and-address identifier already attached. Subscription… | Keep. |
| Proposal alerts (H2) | A subscription sends three proposal alerts: | Keep. |
| Data controls (H2) | The service stores only the person's Telegram user ID, the accounts they subscribe to, and whether each subscription is muted. Subscriptions persist until the person removes them. When they unsubscribe… | Keep. |

### governance/basic-action-views.md

[Basic action views](../../../application/basic-action-views.md) — List familiar actions and their supported forms and readable summaries.

Unique responsibility: Central action-purpose catalogue; feature pages own lifecycle rules. Reader: Participants/operators.

**Final page verdict:** Move to /application/basic-action-views.md. Catalogue of shared action forms and read-only representations across execution flows. (Page-overlap/location follow-up, 2026-09-13.)

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Basic action views (H1) | Basic action views explain familiar actions through purpose-built forms and readable summaries. They help an author choose what an account should do and help a reviewer understand the resulting change.… | Keep. |
| Preparing and reviewing (H2) | Most actions below have both a Basic form and a Basic details view on proposals and execution transactions. The important exceptions are: | Keep. |
| Assets and identity (H2) | / Action / Use and result / Before proposing or approving / | Keep. |
| Multisig membership and rules (H2) | These actions manage the membership and settings of an installed Aragon multisig. This is independent from changing the owners of an externally-managed Safe. | Keep. |
| Token governance (H2) | / Action / Use and result / Before proposing or approving / | Keep. |
| Calls containing other actions (H2) | / Action / Use and result / Before proposing or approving / | Keep. |
| Gauges and lending markets (H2) | These actions administer the destinations available to Gauge voting. They do not cast a holder's allocation vote or automatically distribute rewards. | Keep. |
| BENQI lending-market actions (H3) | The following actions belong to the BENQI-specific lending-market integration. They use Gauge Registrar's separate permission and market identity. | Keep. |
| Distribution campaigns (H2) | Capital Distributor turns a prepared allocation into token claims. Campaign management is available for client-arranged deployments with the required account authority. | Keep. |

### governance/benqi-lending-market-gauges.md

[BENQI lending-market gauges](../../../governance/benqi-lending-market-gauges.md) — Explain BENQI's lending-market registration and gauge presentation.

Unique responsibility: Client-specific qiToken/incentive/controller identity and actions. Reader: Participants/operators.

**Final page verdict:** Keep. The stated unique responsibility remains supported by the retained sections. No content was removed from this page and no section destination takes over that object, capability, rule or user outcome.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| BENQI lending-market gauges (H1) | BENQI lending-market gauges are a client-specific integration that represents BENQI market incentives in Gauge voting. Gauge Registrar supplies registration and removal actions for BENQI; the shared… | Keep. |
| Registering and removing market incentives (H2) | Gauge Registrar exposes two action-builder actions: | Keep. |
| Identifying a market gauge in the app (H2) | The Gauges list identifies a registered BENQI lending-market gauge by its metadata name, avatar, and gauge address, alongside total votes and the connected holder's votes. Its details dialog adds the… | Keep. |

### governance/body.md

[Body](../../../governance/body.md) — Define whose preferences contribute to a governance decision.

Unique responsibility: Membership context and Members page; governors apply decision methods. Reader: Participants/operators.

**Final page verdict:** Keep with the Members-page ordering section. Membership, participation and the list that presents a body’s members remain coherent. Token preparation stays on Token panel, while the individual participant remains Member.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Body (H1) | A body is a set of members who supply preferences to a governance decision. Its governor records those preferences and applies the voting or approval method. | Keep. |
| Membership (H2) | Membership can be defined in different ways, such as an explicit list of member addresses, token ownership, or staking. The body's membership rules determine who can participate. | Keep. |
| Members page (H3) | In the app, the members list is partitioned by body. The Members page presents the members of the selected body. Bodies from linked accounts join the same set of body tabs, with an indicator showing… | Merge: receive Member-list order as a child subsection. |
| Token-based participation (H3) | For a token-based body, the token panel provides the available wrapping, locking, and delegation controls. veLocker supports voting-escrow positions and dynamic delegation where configured. | Keep. |
| Participating in a process (H2) | A body expresses its preferences to a governance process. In staged governance, each stage determines how the decisions of its participating bodies combine. | Keep. |
| Bodies that span multiple processes (H2) | One installed plugin can serve as a body in more than one governance process. Every process using that body shares its governance settings. Minimum-duration configurations must be set carefully to work… | Keep. |
| Identifying a body (H2) | A plugin body's name, description, and resources come from its plugin metadata. When one plugin acts as both a process and a body, that single identity appears in both contexts. | Keep. |

Applied section and dependency changes:

- Members page — receive Member-list order from Token panel.

Final sections added or renamed:

| Final section | Contribution at the retained home | Disposition |
| --- | --- | --- |
| Member-list order (H4) | The member API defaults to voting power in descending order, with record ID as the descending tiebreaker. The Members page supplies no alternative sort or sort control, so this is the fixed order for… | Keep at this home after the applied move or split above. |

### governance/check-gauge-delegation-capability.md

[Check delegation support before offering Delegate in Gauge voting](../../product-opportunities/check-gauge-delegation-capability.md) — Evaluate checking integration support before offering gauge delegation.

Unique responsibility: Gauge-specific missing capability gate. Reader: Product planners.

**Final page verdict:** Keep. This candidate still owns its specific proposed product outcome; section relocation did not implement, duplicate or supersede it.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Check delegation support before offering Delegate in Gauge voting (H1) | The Gauge voting aside offers Delegate without the delegation-capability check used by the shared Token panel. This can offer an action the integrated escrow or adapter does not support. | Keep. |

### governance/cross-chain-execution.md

[Cross-chain execution](../../../governance/cross-chain-execution.md) — Explain composing calls for execution by an account on another chain.

Unique responsibility: Source message and destination action composition. Reader: Participants/operators.

**Final page verdict:** Keep. Deployment routes, message composition, destination gas and nested-action review all serve one cross-chain execution capability. Action builder supplies the enclosing composer, not this route’s distinct constraints.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Cross-chain execution (H1) | Cross-chain execution lets an account on one chain forward a nested action batch for execution by another account on a destination chain. The app supports composing and reading that message through a… | Keep. |
| Availability (H2) | Cross-chain execution uses a bespoke Aragon deployment for each account. Controllers, executors, adapters, and routes are configured for that deployment. The app supports composing and reading actions… | Keep. |
| Execution route (H2) | The source account calls forwardMessage on its Cross-Chain Controller. The controller passes the message to a Chainlink CCIP adapter. A corresponding controller on the destination chain receives the… | Keep. |
| Building and reading the action (H2) | When the Action builder detects a configured Cross-Chain Controller, it offers the Basic action Forward message. The author: | Keep. |
| Destination gas limit (H3) | The estimate comes from a backend simulation of the destination batch. The client adds a 30% safety margin, enforces a floor of 200,000, and caps the field at 3,000,000 gas: | Split inspection paragraphs into Reviewing destination actions; retain estimate/limits together. |

Applied section and dependency changes:

- Destination gas limit — split readable/nested-action inspection into Reviewing destination actions.

Final sections added or renamed:

| Final section | Contribution at the retained home | Disposition |
| --- | --- | --- |
| Reviewing destination actions (H3) | The action's readable view shows the destination chain, gas limit and nested actions. It cross-checks decoded children against the encoded message; if any child differs, the whole inner array is shown… | Keep at this home after the applied move or split above. |

### governance/delegate-profile-record.md

[Delegate profile record](../../../governance/delegate-profile-record.md) — Specify the token-specific ENS pointer and delegate statement format.

Unique responsibility: Delegation statement schema, separate from general ENS profiles. Reader: Participants/operators.

**Final page verdict:** Keep. The stated unique responsibility remains supported by the retained sections. No content was removed from this page and no section destination takes over that object, capability, rule or user outcome.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Delegate profile record (H1) | A delegate profile record attaches a token-specific statement to a participant's primary ENS name. It keeps the identity and pointer in the participant's ENS records while scoping the statement to the… | Keep. |
| ENS record (H2) | The text-record key is: | Keep. |
| Statement document (H2) | The CID resolves to the versioned JSON shape written by the current editor: | Keep. |

### governance/explain-unsupported-cross-chain-destinations.md

[Explain unsupported cross-chain destinations](../../product-opportunities/explain-unsupported-cross-chain-destinations.md) — Evaluate explaining an unavailable destination composer.

Unique responsibility: Unsupported-network dead end within a configured route. Reader: Product planners.

**Final page verdict:** Keep. This candidate still owns its specific proposed product outcome; section relocation did not implement, duplicate or supersede it.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Explain unsupported cross-chain destinations (H1) | This candidate addresses an unexplained dead end in cross-chain execution. It is not a roadmap commitment. | Keep. |
| Opportunity (H2) | The destination selector is built from the controller's configured routes. A route with a chain ID outside the app's recognized network definitions remains selectable, but the nested action composer is… | Keep. |
| Before ticketing (H2) | Reproduce with a configured route whose destination chain is absent from the app's network definitions. | Keep. |

### governance/gauge-voting.md

[Gauge voting](../../../governance/gauge-voting.md) — Explain allocating voting power among destinations during epochs.

Unique responsibility: Non-proposal allocation and shared gauge administration. Reader: Participants/operators.

**Final page verdict:** Keep. Reordering availability and administration leaves one epoch-allocation capability with its gauge-management context. It remains distinct from reward claims, escrow positions and BENQI’s client-specific registration.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Gauge voting (H1) | Gauge voting is a non-proposal governance capability for signaling how voting power should be distributed among a set of destinations. Its Gauge Voter plugin does not create IProposal proposals: during… | Keep. |
| Gauges and their administration (H2) | Each gauge is identified by an address and may carry a metadata URI. Its metadata holds a name, description, and resources, with an optional gauge avatar. In the current contract and app, the… | Move the administration cluster after participant allocation and Gauges page. |
| Management-form validation (H3) | Create requires a valid gauge address, a name of up to 128 characters, and a description of up to 480 characters. Update metadata requires an existing gauge and the same name and description fields.… | Move the administration cluster after participant allocation and Gauges page. |
| Allocating voting power (H2) | During the configured voting window, a voter selects active gauges and enters a relative weight for each. The contract normalizes every submitted weight against the total and allocates the voter's… | Keep. |
| Gauges page (H2) | The Gauges page shows the gauge list, per-gauge details in a dialog, epoch timing and totals, the connected holder's voting power and usage, and an update-vote flow. Holders select gauges and use the… | Keep. |
| Availability and related capabilities (H2) | Gauge voting uses an Aragon-deployed plugin. The app supports the installed instance; the team handles deployment because the Governance Designer has no self-service setup for it. The public… | Move before participation and administration. |

Applied section and dependency changes:

- ## Availability and related capabilities — move earlier/later within the page, before ## Gauges and their administration
- Gauges and their administration — place after allocation and the participant page.

### governance/governance-designer.md

[Governance designer](../../../governance/governance-designer.md) — Explain configuring and installing governance in the app.

Unique responsibility: Installation capability and editing boundaries, distinct from Process. Reader: Participants/operators.

**Final page verdict:** Keep. The reordered settings, body setup, publication checks and installation sequence still serve configuring and installing a process. Process describes the installed object; proposal creation and generic action editing do not replace setup.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Governance designer (H1) | The governance designer lets people configure governance in the app and install it on an account. Installation completes by the end of the flow when Admin applies it immediately, or after the selected… | Keep. |
| Wizard sequence (H2) | Creating a process changes the DAO, so the entry route first identifies the existing process that will carry the installation proposal. On a newly launched account that is normally Admin; selecting… | Keep. |
| The basic flow (H2) | In the basic view the user must add one body, represented by a single plugin. There is no orchestration — the staged proposal processor is not installed. Add voting body opens a dialog wizard nested… | Keep. |
| Configuring token-based governance (H3) | For Token Voting, the membership screen first chooses between creating a new token and importing an existing one: | Keep. |
| The advanced flow (H2) | Advanced governance uses the staged proposal processor and requires setup by the Aragon team. Users reach that team through Advanced — On request in the Governance step. The panel is headed "Governance… | Merge: receive stage-wide settings from Adding a body. |
| Adding a body (H3) | Aragon can add an external address as a body, including a Safe (Safe as a body). In the team's configuration flow, add body → any address requires a valid address and waits for the Safe-recognition… | Move stage-wide settings into The advanced flow; retarget Safe recognition to Safe as a body. |
| Choosing authorized actions (H2) | The Permissions step defines which actions the new process may make the account execute: | Split the general configuration check into Before publishing. |
| Preparing and applying an installation (H2) | Clicking Publish deliberately begins two transaction submissions. First, the designer uses the plugin setup processor to prepare the installation: one transaction deploys or configures the requested… | Keep. |
| Editing across the lifecycle (H2) | The designer prepares governance changes as proposals for the DAO to execute: | Keep. |
| Worked example: installing a multisig (H2) | Configure the plugin in its plugin slot — for a multisig, the members and the approval threshold. | Reorder creation rules before Permissions to match the page’s own wizard sequence. |

Applied section and dependency changes:

- Adding a body — move stage-wide configuration into The advanced flow; Choosing authorized actions — split the general pre-publication check into Before publishing; Worked example — put proposal-creation configuration before Permissions, matching Wizard sequence.
- Inbound section links — retarget moved Safe recognition or member-list ordering to the final canonical home.

Final sections added or renamed:

| Final section | Contribution at the retained home | Disposition |
| --- | --- | --- |
| Before publishing (H2) | Invariant validation aims to reject unsatisfiable settings; passing the form does not establish that every protocol constraint is satisfied or that thresholds, durations, allowlists or body composition… | Keep at this home after the applied move or split above. |

### governance/index.md

[Governance](../../../governance/index.md) — Route readers through governance concepts, configuration, and participation.

Unique responsibility: Governance collection navigation by product job. Reader: Participants/operators.

**Final page verdict:** Keep as governance navigation. Corrected links point to the actual control and member-order owners; the collection still contains independent governance concepts and capabilities.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Governance (H1) | The governance model describes decision-making independently of any single contract. Start with Aragon OSx and the platform for how accounts, governance processes, and bodies relate to the contracts.… | Keep. |
| Governance model (H2) | Governance process — the rules and flow that take proposals from creation through decision to account execution. | Keep. |
| Configure governance (H2) | Governance designer — the flow for designing and installing governance in the app, and what can be edited afterwards. | Keep. |
| Participate (H2) | Token panel — the Members-page controls for wrapping, voting-escrow locking, and delegation, together with their onboarding re-entry points and member-list ordering. | Keep. |
| Prepare and inspect proposals (H2) | Proposal creation — selecting a process, applying creation eligibility, composing the proposal, and submitting it. | Keep. |
| Compose staged governance (H2) | Stage — the semantic layer of a single stage: timing, per-body approval or veto roles, independent thresholds, and bodyless timelocks. | Keep. |

Applied section and dependency changes:

- Token panel navigation — correct the owning section for member ordering.

### governance/keep-destination-transfers-independent-of-source-account.md

[Keep destination transfers independent of the source account](../../product-opportunities/keep-destination-transfers-independent-of-source-account.md) — Evaluate composing allowed transfers with the destination account context.

Unique responsibility: Cross-chain transfer form's missing source-context assumption. Reader: Product planners.

**Final page verdict:** Keep. This candidate still owns its specific proposed product outcome; section relocation did not implement, duplicate or supersede it.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Keep destination transfers independent of the source account (H1) | Candidate: let a cross-chain destination batch include an allowed transfer without selecting a form that requires a source-account context the destination editor does not have. | Keep. |

### governance/match-uninstall-process-exclusions.md

[Match uninstall exclusions to process identifiers](../../product-opportunities/match-uninstall-process-exclusions.md) — Evaluate selecting and describing the correct remaining governance route.

Unique responsibility: Uninstall identifier mismatch and misleading summary. Reader: Product planners.

**Final page verdict:** Keep. This candidate still owns its specific proposed product outcome; section relocation did not implement, duplicate or supersede it.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Match uninstall exclusions to process identifiers (H1) | The uninstall flow asks the operator to select another process, but it can still offer the process being removed, including Admin. The generated proposal summary then says the selected process will… | Keep. |
| Investigation (H2) | Check selection and proposal summaries for distinct processes, processes with matching names on linked accounts, and any deliberately supported self-removal route. This is a product candidate, with no… | Keep. |

### governance/member.md

[Member](../../../governance/member.md) — Define an address's participation within a body.

Unique responsibility: Member identity, membership, and individual Member page. Reader: Participants/operators.

**Final page verdict:** Keep. Moving profile statistics into Member page preserves the distinction between participant identity and its app presentation; neither Body’s member list nor Token panel’s controls replaces the individual participant record.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Member (H1) | A member is a participant in a body, identified by an address. The body defines the membership rules and how its members' preferences contribute to decisions. | Keep. |
| Membership and participation (H2) | An address qualifies as a member according to the body's rules, such as inclusion in a member list, token ownership, or staking. Membership changes as those conditions change. For an Aragon multisig,… | Keep. |
| Identifying a member (H2) | The member's address identifies the participant in the body. Aragon Profiles adds the primary ENS name, avatar, description, and links associated with that address. Profile links can include a website,… | Move participation statistics and EFP presentation to Member page; retain identity and profile-statement semantics. |
| Member page (H2) | The Member page brings together a participant's identity and governance activity in an account. The Members page provides the list of members grouped by body; an individual member's page shows their… | Merge: receive the profile statistics and EFP presentation paragraph. |

Applied section and dependency changes:

- Identifying a member — move participation statistics and EFP presentation to Member page.

### governance/multisig-gates.md

[Multisig gates](../../../governance/multisig-gates.md) — Explain using a multisig at a checkpoint in staged governance.

Unique responsibility: Gate placement and rationale; Safe and multisig remain distinct entities. Reader: Participants/operators.

**Final page verdict:** Keep. Placement before, after or elsewhere in a staged process, plus maintaining an installed gate, explains a governance composition. Safe as a body supplies one implementation and the guide applies the configuration decisions.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Multisig gates (H1) | A multisig gate is a Safe or an Aragon multisig plugin (Safe vs Aragon multisig) serving as the governing body of a stage in a staged governance process, gating what comes before or after that stage.… | Keep. |
| Why gate at all (H2) | Governance that requires affirmative participation in routine decisions can create significant coordination and transaction overhead. A multisig approval stage adds a structured sign-off before or… | Keep. |
| Before Token Voting (H2) | A multisig can govern stage one, with Token Voting governing stage two: the multisig's threshold gates advancement into the token vote, and proposal creation can be restricted to the multisig's own… | Keep. |
| After Token Voting (H2) | A multisig can also govern a stage after Token Voting in either role. As an approval body, it creates a final approval gate before execution. As a vetoing body, it gives a security council or another… | Keep. |
| At any point in the process (H2) | An installed Aragon multisig body's roster and approval threshold can be changed through membership and settings actions. Review those changes together: removing members can require a preceding… | Split roster/threshold maintenance into Changing an installed gate; retain stage positioning here. |
| The recommended experience (H2) | Represent each multisig role explicitly as its own stage, so the proposal page shows the complete process end to end — where the proposal is, and what still has to happen. The alternative — granting… | Keep. |
| Worked recommendations (H2) | Safe: Safe as the sole body in stage one (Safe as a body), Token Voting in stage two, with Safe owners eligible to create the proposal. | Keep. |

Applied section and dependency changes:

- At any point in the process — move roster/threshold maintenance out of stage positioning into Changing an installed gate.

Final sections added or renamed:

| Final section | Contribution at the retained home | Disposition |
| --- | --- | --- |
| Changing an installed gate (H2) | An installed Aragon multisig body's roster and approval threshold can be changed through membership and settings actions. Review those changes together: removing members can require a preceding… | Keep at this home after the applied move or split above. |

### governance/optimistic-governance.md

[Optimistic governance](../../../governance/optimistic-governance.md) — Explain progression by default subject to an objection window.

Unique responsibility: Optimistic decision model and monitoring tradeoff. Reader: Participants/operators.

**Final page verdict:** Keep. The stated unique responsibility remains supported by the retained sections. No content was removed from this page and no section destination takes over that object, capability, rule or user outcome.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Optimistic governance (H1) | Optimistic governance is a family of decision processes in which a proposal becomes eligible to progress by default after a defined objection window. Authorized stakeholders can block it by reaching a… | Keep. |
| Why use it (H2) | Optimistic governance concentrates routine onchain work in proposal authorship and exception handling. Veto holders monitor proposals and submit a transaction when they object. For checkpoints with… | Keep. |
| Roles are configurable (H2) | Optimistic governance supports configurable institutions, roles, and stage order. One recurring configuration has a core team or multisig originate a proposal while token holders hold the veto role.… | Keep. |
| The attention risk (H2) | Safety depends on veto holders discovering a proposal, understanding its consequences, and acting before the window closes. Every optimistic process therefore needs a reliable path for veto holders to… | Keep. |

### governance/plugin-compatibility.md

[Plugin compatibility](../../../application/plugin-compatibility.md) — Describe which plugin interfaces, flows, and upgrades the app supports.

Unique responsibility: Recognition/compatibility lookup, separate from plugin meaning. Reader: Participants/operators.

**Final page verdict:** Keep. The stated unique responsibility remains supported by the retained sections. No content was removed from this page and no section destination takes over that object, capability, rule or user outcome.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Plugin compatibility (H1) | Plugin compatibility determines which installed plugins the app can recognize, present, configure, and update. An installed instance can have a supported interaction while other flows require a… | Keep. |
| Interface recognition (H2) | The backend resolves proxy implementations and matches required function selectors in their bytecode to an interface type. The frontend uses that type to route installed instances into registered… | Keep. |
| Available flows (H2) | The governance designer offers Multisig, Token Voting, and Lock to Vote where their installation is supported on the selected network. Admin has its own supported governance and settings experience,… | Keep. |
| Visibility filters (H2) | Default plugin-backed lists omit installed contracts whose interface is unresolved or whose backend record explicitly sets isSupported: false. An interface can be recognized while the instance is… | Keep. |
| Update compatibility (H2) | The app matches plugin updates by repository subdomain. A shared interface type does not make repositories interchangeable for updates. An unresolved or explicitly unsupported instance is not offered… | Keep. |

### governance/plugin.md

[Plugin](../../../governance/plugin.md) — Define an installed capability and its governance roles in the app.

Unique responsibility: Product plugin model, separate from framework APIs and deployment category. Reader: Participants/operators.

**Final page verdict:** Keep. The stated unique responsibility remains supported by the retained sections. No content was removed from this page and no section destination takes over that object, capability, rule or user outcome.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Plugin (H1) | A plugin is a smart contract installed to add a capability to an account, such as voting, capital distribution, or cross-chain execution. The account's permission system can authorize callers to use… | Keep. |
| Governance semantics of plugins (H2) | A governance plugin is a type of plugin that implements governance rules for an account. It can resolve participants' preferences as a governor, or manage the decision state of the bodies participating… | Keep. |
| Execution configuration (H2) | A governance plugin's TargetConfig selects an executor address and a call operation. With Call, the plugin asks that executor to run its approved actions. With DelegateCall, it uses the executor's code… | Keep. |
| Deployment and support (H2) | Installation configures a plugin and its permissions through the OSx plugin framework and permission system. The plugin catalogue lists concrete implementations. | Keep. |
| Self-service governance plugins (H3) | The governance designer offers Multisig, Token Voting, and Lock to Vote on networks where their repositories are deployed. The app provides setup and governance flows for these methods and reuses their… | Keep. |
| Aragon-deployed plugins (H3) | Aragon-deployed plugins have an app-supported experience, with deployment carried out by Aragon. This includes Gauge voting, Capital Distributor, and Cross-chain execution; the related veLocker… | Keep. |
| Unsupported plugins (H3) | An account can have plugins installed onchain that the app does not know how to present or operate. | Keep. |
| Identifying a plugin (H2) | An installed plugin is identified by its contract address on the account's network. The app's metadata input gives supported plugins a readable name, description, and resources. | Keep. |
| Plugins in the app (H2) | Plugin visibility is configured for an installed plugin. App CMS can hide that plugin from the relevant lists, including its presentation as a process or body. | Keep. |

### governance/pre-empt-protocol-rejected-configuration.md

[Pre-empt configurations the protocol will reject](../../product-opportunities/pre-empt-protocol-rejected-configuration.md) — Evaluate exposing unsatisfiable settings before contract rejection.

Unique responsibility: Missing governance-form checks, with scope limits retained. Reader: Product planners.

**Final page verdict:** Keep. This candidate still owns its specific proposed product outcome; section relocation did not implement, duplicate or supersede it.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Pre-empt configurations the protocol will reject (H1) | Candidate: identify unsatisfiable governance settings in the form before they reach a transaction the protocol will reject. | Keep. |

### governance/preserve-member-removal-in-basic-details.md

[Preserve member removal in Basic details](../../product-opportunities/preserve-member-removal-in-basic-details.md) — Evaluate correctly identifying removed members in Basic summaries.

Unique responsibility: Direction mismatch between summary and encoded membership action. Reader: Product planners.

**Final page verdict:** Move to /application/preserve-member-removal-in-basic-details.md. Candidate for shared Basic action rendering in proposal, execution and nested details. (Page-overlap/location follow-up, 2026-09-13.)

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Preserve member removal in Basic details (H1) | Candidate: make a multisig removal's Basic summary identify removed members correctly. A reviewer deciding whether to approve a roster change needs its direction to agree with the encoded call. | Keep. |

### governance/preserve-plugin-context-on-action-import.md

[Preserve plugin context on action import](../../product-opportunities/preserve-plugin-context-on-action-import.md) — Evaluate retaining plugin data needed to edit imported actions.

Unique responsibility: Import-context loss in specialized forms. Reader: Product planners.

**Final page verdict:** Move to /application/preserve-plugin-context-on-action-import.md. Candidate for imported actions in proposal and direct composition. (Page-overlap/location follow-up, 2026-09-13.)

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Preserve plugin context on action import (H1) | Candidate: keep recognized mint and settings actions usable when someone uploads an action set. Reusing a proposal should not select a Basic form whose required plugin data has been discarded. | Keep. |

### governance/process.md

[Governance process](../../../governance/process.md) — Define the governance route from a proposal to account execution.

Unique responsibility: End-to-end process semantics and Process details page. Reader: Participants/operators.

**Final page verdict:** Keep. The stated unique responsibility remains supported by the retained sections. No content was removed from this page and no section destination takes over that object, capability, rule or user outcome.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Governance process (H1) | A governance process can take a proposal from creation through decision to execution on an account, without necessarily depending on any other governance component. Its configuration determines who may… | Keep. |
| Processes in the app (H2) | For recognized plugins, the app partitions the proposals list by process. Each process appears as a proposal type, grouping the proposals that follow its decision-making flow. | Keep. |
| Process details page (H2) | The Process details page lets members inspect a process's execution scope and proposal-creation requirements, and access its removal action. | Keep. |

### governance/proposal-creation.md

[Proposal creation](../../../governance/proposal-creation.md) — Explain selecting a process and publishing an eligible proposal.

Unique responsibility: Creation capability and Create proposal page. Reader: Participants/operators.

**Final page verdict:** Keep. The stated unique responsibility remains supported by the retained sections. No content was removed from this page and no section destination takes over that object, capability, rule or user outcome.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Proposal creation (H1) | Proposal creation turns an author's intent into a proposal owned by a selected process. The author selects a process, meets its creation requirements, composes the proposal, and submits it through the… | Keep. |
| Entering creation and choosing a process (H2) | The Create Proposal action lives at the top of the Proposals page. With one available process it goes directly to that process's creation wizard; with several it first opens the process selector and… | Keep. |
| Creation eligibility (H2) | Who can create a proposal is configured per process: users set it during Basic setup in the governance designer, and Aragon configures it for an advanced process. This is separate from who decides —… | Keep. |
| The supported pattern: open to all, narrowed by conditions (H3) | During Aragon-assisted setup of a staged process, the configuration opens proposal creation to all addresses and narrows it with conditions, rather than listing eligible addresses directly. The gate is… | Keep. |
| Existing conditions: composing an already-deployed condition (H3) | For an Aragon-assisted advanced setup, the team's configuration flow has an existing conditions field: the address of any already-deployed condition contract can be pasted in and composed into the rule… | Keep. |
| The SafeOwnerCondition: a Safe's owners as eligible creators (H3) | A SafeOwnerCondition is one such condition. Whenever a Safe serves as a governing body in a governance process, the app deploys this condition in the background — via the protocol's ConditionFactory —… | Keep. |
| Eligibility is independent per body (H3) | A staged process can allow creation through one body's members and not another's — e.g. a multisig's members but not a Token Voting body's token holders (see multisig gates for this pattern worked… | Keep. |
| Editing eligibility on a live process (H3) | Advanced processes are not editable in the app at all, so there is no designer flow for creation eligibility on a live advanced process. Narrowing the composed rules themselves means updating the rule… | Keep. |
| Create proposal page (H2) | Groups the following sections under Create proposal page. | Keep. |
| Creating a proposal (H3) | The full-screen wizard collects: | Keep. |

### governance/proposal-identifiers.md

[Proposal identifiers](../../../governance/proposal-identifiers.md) — Explain the relationship between a proposal's onchain ID and friendly slug.

Unique responsibility: Identity model and the route to a durable reference. Reader: Participants/operators.

**Final page verdict:** Keep. The stated unique responsibility remains supported by the retained sections. No content was removed from this page and no section destination takes over that object, capability, rule or user outcome.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Proposal identifiers (H1) | A proposal carries two identifiers: an onchain one the protocol works with, and a friendly one the app displays. | Keep. |
| The onchain proposal ID (H2) | This is what the plugins actually know. When a body sends a result for a proposal — a Safe included — it sends it against this ID; results are reported and checked against it. It is a long, unfriendly… | Keep. |
| The slug (H2) | The slug combines a process key with an offchain proposal number, for example PIP-3. At process creation, the governance designer collects the key in the process’s IPFS metadata. The indexer reserves a… | Keep. |

### governance/proposal-status.md

[Proposal status](../../../governance/proposal-status.md) — Explain the app's derived proposal status and its relation to stage states.

Unique responsibility: Product status vocabulary; protocol lifecycle remains upstream. Reader: Participants/operators.

**Final page verdict:** Keep, focused on observable derived states. The ordered proposal tree, Admin exception and separate stage tree remain unique reference meaning; an unused implementation identifier was not its justification.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Proposal status (H1) | Every proposal — in the Proposals collection page and on the proposal page — carries a status: active, executable, rejected, and so on. Nothing on chain stores this status. The app computes it, per… | Keep. |
| Two layers (H2) | Layer 1 — per-process-type inputs. Each process type (token voting, multisig, lock to vote, a staged process) derives its own set of inputs from its own onchain state: whether its governance parameters… | Keep. |
| Admin proposals are the exception (H2) | Admin proposals bypass this tree entirely: they always read EXECUTED, consistent with executing instantly in a single transaction rather than going through a deliberation step. | Keep. |
| The vocabulary (H2) | The app's shared status vocabulary defines 12 named statuses. The tree above produces 9 of them: EXECUTED, VETOED, PENDING, ADVANCEABLE, EXPIRED, REJECTED, ACCEPTED, ACTIVE, EXECUTABLE. Two more appear… | Reframe around visible statuses; move unused FAILED identifier evidence to maintenance. |
| Per-type consequences (H2) | The shared tree is the same for every process type, but which branches a given type can ever reach depends on the inputs that type derives: | Keep. |
| Stage-level status (H2) | A staged process's sub-proposals — the ones shown per stage on the proposal page — carry their own status, derived by a separate decision tree evaluated in this order: vetoed, unreached, pending,… | Keep. |

Applied section and dependency changes:

- The vocabulary — keep visible proposal/stage statuses; move the unused FAILED identifier to implementation evidence.

### governance/proposal.md

[Proposal](../../../governance/proposal.md) — Define an action array submitted through governance and its presentation.

Unique responsibility: Proposal object, lifecycle overview, Proposals and Proposal details pages. Reader: Participants/operators.

**Final page verdict:** Keep as the consolidated canonical home for this topic, including the former companion page’s unique behavior and rationale. See the overlap follow-up for the incoming content and final purpose. (Page-overlap/location follow-up, 2026-09-13.)

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Proposal (H1) | A proposal submits an ordered array of actions for approval through a governance process. Its human-readable metadata describes the proposed actions and the reasons for them. Each proposal belongs to… | Keep. |
| Identifying a proposal (H2) | A proposal has an onchain proposal ID, the numeric identifier its plugin uses for votes, reported results, and execution, and a friendly proposal slug (for example, PIP-3). The slug combines the… | Keep. |
| Proposal lifecycle (H2) | Proposal creation selects the process, checks who may propose, and collects the actions, metadata, and process-specific settings. Members of the participating bodies then vote or approve according to… | Keep. |
| Proposals page (H2) | The Proposals page lists proposals from supported processes. Each visible process has its own tab, labeled in the app as a proposal type. When several processes are available, All proposals is the… | Keep. |
| Proposal details page (H2) | The Proposal details page brings together the proposal's description, actions, status, and participation controls. Members vote or approve directly on the page. In staged governance, the Voting… | Split within page into Actions and execution, Voting and stage decisions, and Description and resources; receive simulation/cache behavior. |
| Missing and non-standard metadata (H3) | The app expects a proposal's onchain metadata value to point to the human-readable proposal content it can resolve. A proposal receives a metadata warning only when both its title and description are… | Move within hierarchy: nest under Description and resources; preserve the anchor and full rules. |

Applied section and dependency changes:

- Proposal details page — split Actions and execution, Voting and stage decisions, and Description and resources; receive simulation availability/cache rules; nest metadata exceptions under description.

Final sections added or renamed:

| Final section | Contribution at the retained home | Disposition |
| --- | --- | --- |
| Actions and execution (H3) | The ordered action list offers the available Basic, Decoded, and Raw views and JSON download for inspection and reuse. The details also identify the creator and creation transaction, with links to… | Keep at this home after the applied move or split above. |
| Voting and stage decisions (H3) | A proposal's decision surface opens with its status. A non-staged process shows one voting card; a staged process shows its stages in an accordion (staged proposals). A stage with one body opens that… | Keep at this home after the applied move or split above. |
| Description and resources (H3) | Proposal resources appear with their label and the destination beneath it, so a reader can check where a link goes before opening it. Inline links in the description display the author’s chosen text.… | Keep at this home after the applied move or split above. |

### governance/publish-a-process-with-no-selected-actions.md

[Publish a process without touching the actions list](../../product-opportunities/publish-a-process-with-no-selected-actions.md) — Evaluate publishing valid permissions without opening the actions list.

Unique responsibility: Designer state-dependency defect, including an intentionally empty allowlist. Reader: Product planners.

**Final page verdict:** Keep. This candidate still owns its specific proposed product outcome; section relocation did not implement, duplicate or supersede it.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Publish a process without touching the actions list (H1) | Candidate: let an author publish a valid Permissions-step configuration in the governance designer without first opening the actions list. | Keep. |

### governance/reveal-all-write-functions-for-known-contracts.md

[Reveal all write functions for known contracts](../../product-opportunities/reveal-all-write-functions-for-known-contracts.md) — Evaluate expanding a known contract to its remaining verified write functions.

Unique responsibility: Action-picker discoverability beyond the curated default group. Reader: Product planners.

**Final page verdict:** Move to /application/reveal-all-write-functions-for-known-contracts.md. Candidate for the shared action picker and ABI composition route. (Page-overlap/location follow-up, 2026-09-13.)

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Reveal all write functions for known contracts (H1) | Candidate: let an author expand a known contract in the Action picker to its remaining verified write functions without entering the same address again. | Keep. |
| Opportunity (H2) | The + Action picker deliberately shows a curated set of registered functions for contracts the app already knows. The same verified contract may expose further write functions that are valid proposal… | Keep. |
| Before ticketing (H2) | Confirm which known contract groups may expand and whether ABI availability alone is sufficient. | Keep. |

### governance/safe-as-a-body.md

[Safe as a body](../../../governance/safe-as-a-body.md) — Explain a Safe supplying a staged governance decision.

Unique responsibility: External-body participation; Safe connection remains its own capability. Reader: Participants/operators.

**Final page verdict:** Keep with recognition now attached to external-body setup. Registration, owner eligibility, approval reporting and Safe-specific presentation form one participation capability; connection mechanics remain in Connecting a Safe.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Safe as a body (H1) | A Safe can serve as a stage's governing body — an account, not a plugin, standing in as the decision-maker for that stage. Use Choose between a Safe and an Aragon multisig for why only a Safe (not an… | Keep opening and role; add Recognizing a Safe body before presentation. |
| In the staged process (H2) | Aragon adds a Safe as a stage's body during advanced-governance setup. The team's add-body any address option registers it, and the SPP's install transaction writes it into the stage's stage config —… | Keep. |
| Reaching its threshold (H2) | The Safe must then reach its required signer threshold and approve before the proposal can advance to stage two: | Keep. |
| How the app presents it (H2) | When the app recognizes the body as a Safe, it adds Safe-specific branding and a Safe logo. The logo also identifies the Safe beside the body on the process details page. On the proposal page the Safe… | Keep. |
| Not on the members list (H2) | The members list does not show the Safe body at all, a deliberate product choice. On the proposal page the Safe is a single object with no owner- or member-level granularity: a Safe typically collects… | Keep. |
| What this buys (H2) | The state is legible to everyone: the proposal already exists in Aragon, and the token vote visibly has not begun until the Safe stage passes, as the proposal page's stage accordion shows (staged… | Keep. |

Applied section and dependency changes:

- Recognizing a Safe body — receive setup recognition and its eligibility limits from Connecting a Safe.

Final sections added or renamed:

| Final section | Contribution at the retained home | Disposition |
| --- | --- | --- |
| Recognizing a Safe body (H2) | The advanced-governance setup recognizes a Safe by its contract name from backend metadata. It does not establish Safe identity by checking the contract interface. A Safe with an unrecognized name… | Keep at this home after the applied move or split above. |

### governance/stage.md

[Stage](../../../governance/stage.md) — Define a checkpoint's bodies, timing, and decision roles.

Unique responsibility: One stage's product semantics, distinct from proposal traversal. Reader: Participants/operators.

**Final page verdict:** Keep, clarified as the stage abstraction. Duration, expiration, roles, thresholds and bodyless delays remain load-bearing governance meaning. Staged proposals owns traversal; removing the field ledger strengthens that boundary.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Stage (H1) | A stage is one step of a multi-stage governance process. A process built on the staged proposal processor has one or more stages, and every stage has zero or more bodies. The Aragon team configures… | Keep. |
| The stage abstractions (H2) | Stage duration — the period the stage gives its bodies to decide. When any body can veto, the full duration is a protected objection window: the stage cannot advance before it ends. | Keep. |
| How the proposal page presents a stage (H2) | On the proposal page, approval and veto appear as each body's role rather than as a mode of the stage, so one stage can show both: | Keep. |
| SPP field disposition (H2) | The app's semantic layer does not mirror the lower-level structs one for one: some values are user-facing concepts, some are derived from those concepts, and some are fixed implementation choices.… | Split: move the field/encoding ledger to dated log evidence; retain unique product limits in Fixed behavior in app-created stages. |

Applied section and dependency changes:

- SPP field disposition — move field/encoding ledger to dated log evidence; retain cancellation, editing and report behavior under Fixed behavior in app-created stages.

Final sections added or renamed:

| Final section | Contribution at the retained home | Disposition |
| --- | --- | --- |
| Fixed behavior in app-created stages (H2) | App-created stages do not enable SPP proposal cancellation or action editing. A body report requests a same-transaction advance, which remains best-effort and subject to the process's state and… | Keep at this home after the applied move or split above. |

### governance/staged-proposals.md

[Staged proposals](../../../governance/proposal.md#staged-proposals) — Explain a proposal's movement through a staged process.

Unique responsibility: Consolidated proposal experience and advancement. Reader: Participants/operators.

**Final page verdict:** Keep. The stated unique responsibility remains supported by the retained sections. No content was removed from this page and no section destination takes over that object, capability, rule or user outcome.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Staged proposals (H1) | A staged proposal moves through the stages of a multi-stage process. The protocol’s staged proposal processor orchestrates the participating plugins into one pipeline. Arrange installation of a staged… | Keep. |
| When the model reaches an edge case (H2) | The staged model makes the ordinary pipeline legible, but it does not turn every low-level configuration into a broadly self-serve concept. Existing conditions and unusual interactions between a… | Keep. |
| One proposal, one page (H2) | A staged process presents as a single consolidated proposal, not a series of disconnected votes: | Keep. |
| Advancing through stages (H2) | When a stage meets its thresholds and timing floor within its deadline, the proposal becomes advanceable; advancing it creates the sub-proposals of the following stage. What governs a single stage —… | Keep. |
| On the proposal page (H2) | The proposal page shows every configured stage in an accordion that keeps one stage open at a time. Each stage header carries the stage name, its status or timing, and its position as Stage N; the open… | Keep. |
| Execution is separate from advancement (H2) | Advancing between stages is not the execution step: on the final stage, the same advance call is what executes the proposal, under its own permission (SPP lifecycle) — which is why a final stage… | Keep. |

### governance/stages-over-direct-permissions.md

[Stages over direct permission grants](../../../governance/multisig-gates.md#stages-over-direct-permission-grants) — Explain preferring visible multisig stages over invisible permission gates.

Unique responsibility: Governance representation decision and direct-grant exceptions. Reader: Participants/operators.

**Final page verdict:** Keep. The stated unique responsibility remains supported by the retained sections. No content was removed from this page and no section destination takes over that object, capability, rule or user outcome.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Stages over direct permission grants (H1) | When a multisig should gate a governance process — approving before or after a token vote — represent it as an explicit stage of the process (see multisig gates). Granting proposal-creation or… | Keep. |
| Context (H2) | A multisig can gate a process two ways: as a body inside a stage (visible on the proposal page), or by being the caller authorized for the process's creation or execution function directly, with no… | Keep. |
| Chosen direction (H2) | Prefer the staged form. The direct-grant form exists and works, but is a deliberate opt-out of transparency, not a shortcut. | Keep. |
| Direct creation grant to a Safe — how it would work (H3) | The governance designer does not express this directly — it is the pattern closest to a literal "let the multisig create but not vote" request, and it takes an admin route instead. Install the process… | Keep. |
| Why it is discouraged: nested-action review (H3) | The Safe transaction that creates the proposal is itself a Create Proposal call, with the proposal's real actions nested inside that call's own action array — even though the actions are the proposal's… | Keep. |
| Direct execution grant to a Safe (H3) | The same shape applies to execution: grant execute on the process to the Safe and revoke it from everyone else. The UI supports this arrangement (proposal covers what ineligible users see). It carries… | Keep. |
| Never for an Aragon multisig (H3) | An Aragon multisig is a governance plugin, not an account — it has no independent entry point for holding and acting on an isolated permission the way a Safe does. For it to perform one isolated action… | Keep. |
| Consequences (H2) | Direct grants keep a multisig's role out of the proposal page's stage view entirely — the role is real but invisible in the governance UI. | Keep. |

### governance/surface-unlock-eligibility-upfront.md

[Surface unlock eligibility before the attempt](../../product-opportunities/surface-unlock-eligibility-upfront.md) — Evaluate explaining unlock eligibility before a holder attempts it.

Unique responsibility: Lock to Vote feedback timing and cause attribution. Reader: Product planners.

**Final page verdict:** Keep. This candidate still owns its specific proposed product outcome; section relocation did not implement, duplicate or supersede it.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Surface unlock eligibility before the attempt (H1) | Candidate: show unlock eligibility before a holder attempts to unlock. For current participation rules, see Choose a voting-power mechanism. | Keep. |
| Opportunity (H2) | For a Lock to Vote body, the app already computes whether an unlock would succeed as soon as the member panel loads: it simulates the withdrawal before the holder does anything. The verdict is then… | Keep. |
| Before ticketing (H2) | Decide the surface: a disabled Unlock button with a reason, an inline notice on the member panel, or both. | Keep. |

### governance/target.md

[Target](../../../governance/target.md) — Define the execution endpoint and operation of a governance plugin.

Unique responsibility: Process target versus each action's target. Reader: Participants/operators.

**Final page verdict:** Keep. The stated unique responsibility remains supported by the retained sections. No content was removed from this page and no section destination takes over that object, capability, rule or user outcome.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Target (H1) | A governance plugin has a configured execution endpoint and operation for its approved actions. In protocol terms this is its TargetConfig: a target address plus Call or DelegateCall. The product calls… | Keep. |
| How a plugin's approved actions shape process and body (H2) | The two product configurations are: | Keep. |
| Process target vs action target (H2) | The process target above is distinct from an individual action's target, the Action.to address of one call: | Keep. |

### governance/token-panel.md

[Token panel](../../../governance/token-panel.md) — Explain participation controls for a selected token-based body.

Unique responsibility: Wrap/lock/delegate surface and participation nudges. Reader: Participants/operators.

**Final page verdict:** Keep, narrowed to participation controls. Wrapping, locking, delegation eligibility and onboarding/re-entry rules remain the shared preparation surface; Body owns browsing the member list, and veLocker owns escrow-position semantics.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Token panel (H1) | The token panel is the actionable participation surface for a token-based body. On the Members page it occupies the collection page aside for the selected body; the Member page shows participant… | Keep. |
| Available controls (H2) | The panel derives its controls from the selected token body's indexed settings: | Keep participation controls; receive the delegate address-field link. |
| Participation nudges (H2) | The app reuses the panel's forms in three ways so a holder can resume an incomplete participation setup. Connection-time watchers select the first eligible body of each kind and respond to a manual… | Keep. |
| Member-list order (H2) | The member API defaults to voting power in descending order, with record ID as the descending tiebreaker. The Members page supplies no alternative sort or sort control, so this is the fixed order for… | Move to Body / Members page; move the final address-entry sentence into Delegate under Available controls. |

Applied section and dependency changes:

- Member-list order — move to Body / Members page; retain address entry with Delegate.

### governance/velocker.md

[veLocker](../../../governance/velocker.md) — Explain vote-escrow participation and time-varying voting power in the app.

Unique responsibility: Recognized token adapter experience, distinct from Lock to Vote. Reader: Participants/operators.

**Final page verdict:** Keep. Escrow positions, voting-power/delegation effects and withdrawal state remain the capability’s own semantics. Availability now precedes participation; general token controls and gauge allocation remain linked neighbours.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| veLocker (H1) | A veLocker lets a holder lock an underlying token into independent vote-escrow positions whose voting power changes with time. In the app it is a participation capability of a token-based body, not a… | Keep. |
| Participation through the Token panel (H2) | For a Token Voting body backed by a recognized veLocker, the Members-page Token panel exposes Lock when indexed voting-escrow settings exist and Delegate when the token advertises delegate(address).… | Keep journey; retarget ordering detail to Body / Member-list order. |
| Voting power and dynamic delegation (H2) | The adapter presents an IVotes interface for governance. The supported app pairing is Token Voting, which can also serve as a body in a staged process. Another governance plugin can consume the adapter… | Keep. |
| Withdrawal fees and position state (H2) | A deployment may charge a dynamic fee for early withdrawal. The client configures the fee policy, and the fee is paid to the account. The lock list and withdrawal dialog show the applicable position… | Keep. |
| Availability and deployment boundary (H2) | veLocker uses the Aragon deployment model: the team deploys the setup, and the app supports participation in the compatible installed instance. The Governance Designer has no self-service veLocker… | Move before Participation through the Token panel. |
| Different from Lock to Vote (H2) | Both capabilities involve locking tokens, but they feed governance differently. A veLocker escrows positions, derives time-weighted power, and exposes that power through IVotes to Token Voting. Lock to… | Keep. |
| Scope: gauges are separate (H2) | Gauges are sometimes grouped with veLockers under "ve-governance," but they are not part of the veLocker capability. For gauge selection, epochs, and allocation, see Gauge voting. | Keep. |

Applied section and dependency changes:

- ## Availability and deployment boundary — move earlier/later within the page, before ## Participation through the Token panel
- Participation through the Token panel — point list ordering to Body.

### guides/choose-token-voting-power-mechanism.md

[Choose a voting-power mechanism for token governance](../../../guides/choose-token-voting-power-mechanism.md) — Help an operator choose a voting claim and custody mechanism.

Unique responsibility: Decision sequence across Token Voting, wrapping, locking, and escrow. Reader: Participants/operators.

**Final page verdict:** Keep. The stated unique responsibility remains supported by the retained sections. No content was removed from this page and no section destination takes over that object, capability, rule or user outcome.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Choose a voting-power mechanism for token governance (H1) | Choose the route that lets a governance process count each holder's economic claim once per proposal. Start by identifying the exact unit that grants voting power and where the economically valuable… | Keep. |
| Prevent reusing the same claim (H2) | Token governance must prevent a holder from voting with an economic claim, moving or reusing that claim, and voting again on the same proposal. Token Voting prevents this with a historical checkpoint:… | Keep. |
| Routes by voting claim and custody (H2) | Groups the following sections under Routes by voting claim and custody. | Keep. |
| A wallet-held IVotes token: use Token Voting directly (H3) | Use Token Voting directly when the token that represents the voting claim is already IVotes / ERC20Votes compatible and holders normally keep that unit in their wallets. The compatible token remains… | Keep. |
| A non-voting ERC-20: use Token Voting through its wrapper when that is the intended voting claim (H3) | When the desired voting claim is an existing ERC-20 that does not support historical voting power, Token Voting can deploy a GovernanceWrappedERC20. A holder deposits the underlying token to receive… | Keep. |
| An idle wallet token with reactive participation: use Lock to Vote (H3) | Use Lock to Vote when participants normally keep a well-behaved ERC-20 idle in their wallets and should be able to commit it only after a proposal is created. A holder can lock after the proposal… | Keep. |
| Value held in another position: identify the actual voting unit first (H3) | An underlying asset that is staked, supplied to DeFi, deposited in a vault, or used in an LP position is not itself enough to select a route. Identify the receipt token, vault share, LP token, or other… | Keep. |
| A veLocker voting token: use Token Voting after manual staking (H3) | Manual staking into Aragon's veLocker is another route when the desired voting unit is the locker output. The veLocker adapter exposes an IVotes-compatible token, so Token Voting can use it as the… | Keep. |
| Configure the selected route (H2) | After you select Token Voting, its import flow checks the token's ERC-20 interface and its current and historical voting-power interfaces. Those checks decide whether the selected token is used… | Keep. |

### guides/harden-token-governance-against-attacks.md

[Harden token governance against governance attacks](../../../guides/harden-token-governance-against-attacks.md) — Help an operator configure defenses against governance capture.

Unique responsibility: Ordered application of voting-power, threshold, timing, and execution safeguards. Reader: Participants/operators.

**Final page verdict:** Keep. The stated unique responsibility remains supported by the retained sections. No content was removed from this page and no section destination takes over that object, capability, rule or user outcome.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Harden token governance against governance attacks (H1) | Configure a token-governance process so that capturing it costs an attacker more than the attack could gain. A governance attack here means using the process itself against the organization: acquiring… | Keep. |
| 1. Make voting power expensive to acquire and reuse (H2) | Work through Choose a voting-power mechanism for token governance first — it decides which economic claim counts and how the mechanism prevents voting with the same claim twice. Two of its consequences… | Keep. |
| 2. Decide who may create proposals (H2) | A governance attack starts as an ordinary proposal, so creation eligibility is the first gate. It is configured independently from who decides (proposal creation): narrowing creation does not narrow… | Keep. |
| 3. Set thresholds with the denominator in mind (H2) | The three thresholds decide what a proposal must earn. The participation threshold is the one that stands against low-turnout capture: it sets how much of the total voting power must take part before a… | Keep. |
| 4. Give every decision enough time (H2) | Attacks profit from speed; every window below is reaction time for defenders. | Keep. |
| 5. Put safeguards between the vote and execution (H2) | Work with Aragon to express each safeguard as its own stage of one staged proposal pipeline. Add a multisig gate to an advanced governance process helps prepare the multisig configuration for that setup. | Keep. |
| 6. Keep every safeguard visible (H2) | Prefer a stage over a direct permission grant. Granting creation or execution directly to a Safe works, but it keeps that role out of the proposal page's stage view — real, yet invisible to the people… | Keep. |
| 7. Review what each proposal actually executes (H2) | Design-time safeguards still depend on reviewers reading the proposal in front of them. The action builder makes the exact actions legible, and action simulation tests the permission and… | Keep. |
| Done state (H2) | The configuration is done when the mechanism choice prices in snapshot-and-exit acquisition, creation eligibility names its authors deliberately rather than by default, the participation threshold is… | Keep. |

### guides/index.md

[Guides](../../../guides/index.md) — Route users to guides by the governance outcome they want.

Unique responsibility: User-goal guide navigation, independent of conceptual areas. Reader: Participants/operators.

**Final page verdict:** Keep. The retained collection still contains independently meaningful entries and needs its navigation surface.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Guides (H1) | Choose a governance setup, prepare an advanced process with Aragon, or protect token governance against attacks. | Keep. |
| Choose a governance setup (H2) | Choose a voting-power mechanism for token governance — identify the voting claim and choose direct Token Voting, wrapping, Lock to Vote, or veLocker. | Keep. |
| Prepare advanced governance with Aragon (H2) | Add a multisig gate to an advanced governance process — choose between a Safe and an Aragon multisig, place its approval before or after a token vote, and prepare the staged setup with Aragon. | Keep. |
| Protect a governance process (H2) | Harden token governance against governance attacks — make temporary voting power, quiet malicious proposals, and instant execution harder through custody, creation eligibility, thresholds, timing, and… | Keep. |

### guides/multisigs-in-advanced-governance.md

[Add a multisig gate to an advanced governance process](../../../guides/multisigs-in-advanced-governance.md) — Help an operator prepare a multisig checkpoint for team-assisted setup.

Unique responsibility: Applied gate-selection and configuration handoff sequence. Reader: Participants/operators.

**Final page verdict:** Keep. The corrected entry label leaves a user decision-and-briefing sequence for arranging a gate. It applies the concepts to an outcome; portfolio selection remains the separately scoped guide task.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Add a multisig gate to an advanced governance process (H1) | Add a Safe or an Aragon multisig to protect a defined point in an advanced governance process — before or after Token Voting, or elsewhere in a longer process. By the end, you will have chosen the… | Keep. |
| 1. Decide what the multisig should protect and how (H2) | Choose where the safeguard belongs in the process and whether the multisig should approve or veto at that point: | Keep. |
| 2. Choose the kind of multisig (H2) | Resolve what "multisig" means for this account before configuring the process (Safe vs Aragon multisig): | Keep. |
| 3. Arrange the staged setup with Aragon (H2) | Open + Governance from the account's settings page or onboarding dashboard, choose Advanced — On request, and select Get in touch (getting help). | Reframe the entry instruction to match Process in Settings and the onboarding setup action. |
| 4. Check the participant experience (H2) | The proposal page shows the whole staged pipeline, so a Safe or multisig stage is as visible as any other. | Keep. |
| 5. Avoid the direct-permission shortcut unless invisibility is intentional (H2) | A Safe can instead receive proposal-creation or execution permission directly, outside the staged process. That role will not appear in the Voting Terminal, and an Aragon multisig cannot use an… | Keep. |
| Done when (H2) | You are ready to brief Aragon when you have specified the multisig kind, its address or member configuration, its position and body role, and who may create proposals. Setup is complete when the… | Keep. |

Applied section and dependency changes:

- 3. Arrange the staged setup with Aragon — align the entry route with Governance designer while retaining the guide sequence.

### guides/safe-vs-aragon-multisig.md

[Choose between a Safe and an Aragon multisig](../../../guides/safe-vs-aragon-multisig.md) — Help an operator choose the multisig shape for a governance role.

Unique responsibility: Decision guide comparing existing concepts rather than redefining them. Reader: Participants/operators.

**Final page verdict:** Keep. The stated unique responsibility remains supported by the retained sections. No content was removed from this page and no section destination takes over that object, capability, rule or user outcome.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Choose between a Safe and an Aragon multisig (H1) | Choose the multisig shape that fits the role you need in Aragon: an existing Safe account or an Aragon multisig plugin installed on the account. Governance discussions often call both "a multisig," but… | Keep. |
| 1. Choose the role (H2) | Choose a Safe when the multisig must be an account. A Safe can hold a permission grant directly and act on it itself. It can also serve as a governing body in a staged process (Safe as a body). | Keep. |
| 2. Place it in the governance process (H2) | When the multisig should gate a governance process, represent its decision as an explicit stage wherever possible. This keeps the multisig's role visible in the process whether the stage uses a Safe or… | Keep. |
| Continue with the selected route (H2) | You have completed this choice when you know whether the governance design uses a Safe account or an installed Aragon multisig plugin, and whether it participates as a visible stage. To use a Safe, see… | Keep. |

### index.md

[Aragon Platform](../../../index.md) — Orient readers to the product, user guides, conceptual areas, and maintenance.

Unique responsibility: Repository front door with separate user, builder, and maintenance routes. Reader: Participants/operators.

**Final page verdict:** Keep as the repository front door. Removing the repeated upstream pin leaves one complete snapshot statement and separate product, builder and maintenance entry routes.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Aragon Platform (H1) | The Aragon platform is a vertically integrated, full-stack solution for governing treasuries and protocols on EVM-compatible blockchains. The application builds on Aragon OSx, with shared product… | Keep. |
| Use Aragon (H2) | Guides help people accomplish concrete tasks in the Aragon platform. Start by choosing a voting-power mechanism for token governance, choosing between a Safe and an Aragon multisig, adding a multisig… | Keep. |
| Understand the platform (H2) | Read Aragon OSx and the platform for how the app relates to the contracts behind accounts, governance, and permissions, with links to the protocol documentation when a question needs more depth. | Keep. |
| Browse by area (H2) | Accounts — the entity users deploy and govern, plus participant identity and how a person acts in the app: account vs DAO, creation, linked accounts, Aragon Names, and wallet connection. | Keep. |
| Build or change the platform (H2) | Internal design and engineering guidance is kept apart from the product knowledge above. The platform design principles are the cross-cutting rules every feature follows, honest abstraction explains… | Keep builder and maintenance navigation; retire the repeated pinned-source footer because the complete statement remains in the opening. |

Applied section and dependency changes:

- Opening and footer — retain the complete pinned-upstream statement once in the opening; retire its duplicate footer.

### maintenance/application-page-coverage.md

[Live application-page coverage](../application-page-coverage.md) — Map released application pages to canonical documentation homes.

Unique responsibility: 17-page census and coverage decisions at app 1.39.0. Reader: Maintainers.

**Final page verdict:** Keep as the release-scoped 17-page-family crosswalk. Section and wizard links follow surviving homes; this audit answers route coverage rather than page-purpose or design-pattern selection.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Live application-page coverage (H1) | Release-scoped crosswalk produced by audit-live-application-page-coverage. It accounts for 17 live page families: 15 explicit application routes and two plugin pages. Seven already had sufficient… | Reframe handoff to record final section anchors; retain all 17 original page-family anchors and source scope. |
| Evidence baseline (H2) | / Source / Exact revision and use / | Keep. |
| Census and consolidation (H2) | The released route tree contains 18 page.tsx files: 15 explicit live routes, two excluded policy routes, and one plugin catch-all. The catch-all resolves exactly two registered page families, Gauges… | Keep. |
| Live page crosswalk (H2) | Page-name links point to the R1 implementation; documentation-home links point to the canonical explanation. Scope codes are resolved separately below so audience, rollout and deployment are not conflated. | Keep. |
| Audience, rollout and deployment (H2) | / Scope / Rows and supported audience / Established rollout / Deployment / availability condition / | Keep. |
| Excluded and non-page surfaces (H2) | / ID / released surface / Scope evidence and disposition / | Keep. |
| Addition evidence and close-out (H2) | The source links above establish the page callers. The additions also trace the following immediate R1 components, under apps/app/src/: | Keep. |

Applied section and dependency changes:

- Opening/crosswalk — record final section anchors while preserving all 17 page-family homes and evidence scope.

### maintenance/basic-action-views.md

[Basic action view audit](../basic-action-views.md) — Preserve the completed Basic-action evidence set and its boundaries.

Unique responsibility: Load-bearing audit reference for four Markdown parts and a text excerpt. Reader: Maintainers.

**Final page verdict:** Keep. Its recorded source scope or coverage dataset remains distinct from page-purpose and section-placement judgments; section relocation did not remove that evidence responsibility.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Basic action view audit (H1) | Evidence for the completed mine-and-document-basic-action-views task. The observed app and installed dependency expose 22 action identities: 20 selectable specialized create/edit forms and 19… | Keep. |
| Source snapshot (H2) | / Source / Observed state / | Keep. |
| Completeness and limits (H2) | The source census followed all 13 action-view descriptors, the four core map keys (three identities), all five GOVERNANCEPLUGINACTIONS providers, all three plugin normalization providers, all eight DAO… | Keep. |

### maintenance/basic-action-views/content-map.md

[Basic action documentation content map](../basic-action-views/content-map.md) — Record the canonical-home decision for the 22 action identities.

Unique responsibility: Action catalogue versus feature-page responsibility map. Reader: Maintainers.

**Final page verdict:** Keep. Its recorded source scope or coverage dataset remains distinct from page-purpose and section-placement judgments; section relocation did not remove that evidence responsibility.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Basic action documentation content map (H1) | Structure decision for the basic-action audit. The inventory contains 22 action identities distributed across existing feature homes, with material differences between editing, reading, importing and… | Keep. |
| Structure comparison (H2) | / Option / Assessment / Decision / | Keep. |
| Page and section map (H2) | / Home and type / Purpose and outline / Unique facts / identities / Inbound navigation and contextual links / | Keep. |
| Publication and uncertainty dispositions (H2) | The 22 action identities include client-specific integrations. The 2026-09-13 owner clarification identifies Gauge Registrar's A17–A18 as BENQI-specific; it corrects the audience of the existing… | Keep. |

### maintenance/basic-action-views/create-edit.md

[Basic action create and edit inventory](../basic-action-views/create-edit.md) — Record specialized action authoring support and prerequisites.

Unique responsibility: Create/edit dispatch, imports, and entry paths at the source snapshot. Reader: Maintainers.

**Final page verdict:** Keep. Its recorded source scope or coverage dataset remains distinct from page-purpose and section-placement judgments; section relocation did not remove that evidence responsibility.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Basic action create and edit inventory (H1) | Scope clarification (owner, 2026-09-13): A17–A18 belong to the BENQI-specific Gauge Registrar integration. The client scope register governs product coverage independently of the technical dispatch… | Keep. |
| Other entry paths (H2) | WalletConnect sends the backend's decoded action directly to the editor, sets daoId, and clears meta; it does not call the JSON-import rehydrator. Successful specialized editing therefore requires the… | Keep. |

### maintenance/basic-action-views/details.md

[Basic action details inventory](../basic-action-views/details.md) — Record specialized action-reading support and fallback behavior.

Unique responsibility: Details dispatch and nested rendering at the same source snapshot. Reader: Maintainers.

**Final page verdict:** Keep. Its recorded source scope or coverage dataset remains distinct from page-purpose and section-placement judgments; section relocation did not remove that evidence responsibility.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Basic action details inventory (H1) | Scope clarification (owner, 2026-09-13): A17–A18 belong to the BENQI-specific Gauge Registrar integration. The client scope register governs product coverage independently of the technical dispatch… | Keep. |
| UI-kit built-ins independently verified (H2) | The packaged Basic dispatch has five branches covering eight enum spellings. These are actual component selections, verified in installed implementation excerpts, not inferred from declarations. | Keep. |

### maintenance/basic-action-views/rendering-paths.md

[Basic action rendering paths and normalization](../basic-action-views/rendering-paths.md) — Trace the shared registration, normalization, and rendering mechanisms.

Unique responsibility: Evidence used by both action inventories, avoiding duplicate tracing. Reader: Maintainers.

**Final page verdict:** Keep. Its recorded source scope or coverage dataset remains distinct from page-purpose and section-placement judgments; section relocation did not remove that evidence responsibility.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Basic action rendering paths and normalization (H1) | Shared evidence for the audit, create/edit inventory and details inventory. App source links below all pin the inspected commit. | Keep. |
| Initialization and registration closure (H2) | Server layout and client providers initialize the action aggregator. Its order is core CreateProposal, core Execute, CrossChainExecute, Gauge Registrar, Gauge Voter, Capital Distributor. The plugin… | Keep. |
| Production rendering call sites (H2) | Repository-wide searches covered imports, aliases, ProposalActions, ProposalActions.Item, CustomComponent, wrapper names, component maps and registration helpers, excluding tests/stories as production… | Keep. |
| Modes and fallback implementation (H2) | The installed Item support checks and Basic dispatcher establish: | Keep. |
| Normalization and identity (H2) | Default and plugin normalization invokes all registered normalization functions, not just installed plugin interfaces. Registration order is Multisig → Token Voting → Lock to Vote, followed by default… | Keep. |
| Entry paths and defaults (H2) | Fresh picker selection attaches defaults, daoId and plugin meta. useProposalActionsField merges watched values with stable field IDs and does no type conversion. | Keep. |
| Picker, permission and client conditions (H2) | ActionComposerUtils excludes linked-account plugin offerings for the selected target, filters items declaring requiredPermissionId against the account-as-who/target-as-where tuple, and separately… | Keep. |

### maintenance/client-specific-integrations.md

[Client-specific integrations](../client-specific-integrations.md) — Preserve owner-established audiences and coverage boundaries.

Unique responsibility: BENQI and Alchemix scope rulings, independent of shared implementation. Reader: Maintainers.

**Final page verdict:** Keep. Its recorded source scope or coverage dataset remains distinct from page-purpose and section-placement judgments; section relocation did not remove that evidence responsibility.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Client-specific integrations (H1) | This register records owner-established client scope and the documentation homes that must preserve it. WORKFLOW.md defines the handling rule. Audience, rollout, deployment method, and documentation… | Keep. |

### maintenance/consequential-drill-down-coverage.md

[Consequential drill-down coverage](../consequential-drill-down-coverage.md) — Record routes to inspect consequential displayed facts.

Unique responsibility: Affordance inventory, alternatives, and candidate dispositions. Reader: Maintainers.

**Final page verdict:** Keep as the inspection/evidence assessment. Final home changes do not replace its input-method findings, scoped source register or adequate-alternative dispositions.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Consequential drill-down coverage (H1) | Completed audit of the 17 live page families in Application-page coverage and the 22 identities in the Basic action view audit. This record preserves inspection routes, canonical homes, adequate… | Keep. |
| Evidence boundary (H2) | R1: released @aragon/app@1.39.0, commit adad67873c8f9dd75e3ed340b70df3e985ae3557. All application links below pin R1; page-level entry points and audience limits come from the crosswalk at that same… | Keep. |
| Page accounting (H2) | Page IDs retain the crosswalk's meaning. D numbers identify the representation assessments below. “Inspected” means the selected consequential representations were traced; it does not certify every… | Keep. |
| Representation assessments (H2) | “Sufficient” means a route exists for the stated inspection job, sometimes through another page or an explorer. It does not assert data freshness, complete decoding, or authorization. Where an existing… | Keep. |
| Action and dependency reconciliation (H2) | The earlier inventory remains authoritative for A01–A22, its 20 create/edit and 19 details Basic identities, and the canonical content map. Its app revision is f8bf9e87260190aefd7d8a0eb59f72844e6e4502,… | Keep. |
| Source route register (H2) | Each S entry is R1. U1 above supplies the shared control semantics. The crosswalk supplies route assembly and additional page callers; these links isolate the inspection decisions added by this audit. | Keep. |
| Applied dispositions and rejected candidates (H2) | Five canonical homes received supported additions: Proposal identifiers, Assets, Process, Gauge voting and Capital Distributor. The design pattern now links the concrete inspection jobs. All were… | Keep. |

Applied section and dependency changes:

- Opening — record completed reuse by both structural audits.

### maintenance/draft-review-priorities.md

[Draft review priorities after the semantic-anchor review](../draft-review-priorities.md) — Record the evidence for selecting the next foundational owner review.

Unique responsibility: Dated 76-draft comparison, distinct from the live draft inventory. Reader: Maintainers.

**Final page verdict:** Keep as the dated review-selection assessment. Its graph snapshot and cohort reasoning remain historical evidence, while the backlog owns live draft state.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Draft review priorities after the semantic-anchor review (H1) | The next bounded owner review covers eight extensions of the already reviewed account, plugin, process, body, action, and proposal model. The inventory contained 76 drafts when this snapshot was taken… | Keep. |
| Completed review check (H2) | The 2026-09-10 close-out in log.md records nine semantic anchors plus the Member companion. All ten have no status: draft, and all ten are absent from the backlog's draft inventory. No status repair… | Reframe present-tense status as the dated snapshot; link current review state. |
| Method (H2) | Establish eligibility. Take the composite root's wiki --root . list --where status=draft --format json as the complete candidate set. Check completed review history before treating a page as new owner… | Keep. |
| Next review: eight pages (H2) | The cohort is ordered from plugin support and execution roles into staged-governance behavior. These are product concepts and one supporting reference; their meaning can be reviewed before the broader… | Keep. |
| Other highly connected drafts (H2) | / Page or group / Why it matters / Why it follows this cohort / | Keep. |
| Complete draft snapshot (H2) | All 76 drafts are listed once below, sorted by distinct referring pages, then source-area breadth, then path. This table is the audit trail for the selection, not the review order. “Cohort” identifies… | Keep. |

Applied section and dependency changes:

- Opening and Completed review check — distinguish the dated review snapshot from current draft state and completed structural work.

### maintenance/gauge-configuration-refusals.md

[Gauge configuration refusal comparison](../gauge-configuration-refusals.md) — Compare management-form checks with protocol rejection boundaries.

Unique responsibility: Gauge forms and setup-scope verification. Reader: Maintainers.

**Final page verdict:** Keep as the source comparison between forms and contract constraints. The completed-use link replaces a stale task instruction; the comparison remains independently reusable evidence.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Gauge configuration refusal comparison (H1) | Completed comparison for verify-gauge-configuration-refusals. The live Gauge surfaces are four shared Gauge Voter management forms and two BENQI-specific Gauge Registrar forms. There is no self-service… | Keep. |
| Scope and evidence (H2) | App: official release @aragon/app@1.39.0, published 2026-09-09, resolved to adad67873c8f9dd75e3ed340b70df3e985ae3557. All app paths below are relative to apps/app/src/ at this revision. | Keep. |
| Resolve the setup comparison (H2) | The older phrase “four governance-plugin setup dialogs” does not describe the current picker. The comparison explicitly covers Multisig, Token Voting, Lock to Vote, and Admin, with SPP stage… | Keep. |
| Gauge management forms (H2) | / Form / Required input or selection restriction / Coverage limit and comparison / | Keep. |
| Designer and plugin comparison (H2) | / Surface / Observed constraint / Difference from Gauge and evidence / | Keep. |
| Applied outcome and reuse (H2) | Gauge voting and BENQI lending-market gauges hold the management constraints and useful reader cautions. | Reframe the obsolete contextual-edit task direction as its completed canonical outcome. |

Applied section and dependency changes:

- Applied outcome and reuse — replace a closed-task instruction with its completed canonical outcome.

### maintenance/index.md

[Documentation maintenance](../index.md) — Route maintainers through durable audits, evidence, and scope records.

Unique responsibility: New maintenance collection navigation, separate from active task ordering. Reader: Maintainers.

**Final page verdict:** Keep as navigation across distinct completed audits. Link this audit’s final record and its one complete inventory; do not maintain a second decision log here.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Documentation maintenance (H1) | Completed audits, source inventories, and scope registers support the product graph. The documentation backlog owns active work and review order; these references preserve the evidence and decisions… | Keep. |
| Structure and coverage (H2) | Page purpose and repository topology — settled page roles, filing, taxonomy, and complete platform/upstream accounting. | Merge navigation to the new completed section audit and evidence. |
| Scope, evidence, and review (H2) | Client-specific integrations and Product scope exclusions — audience and publication rulings. | Keep. |

Applied section and dependency changes:

- Structure and coverage — link the completed section inventory and evidence.

### maintenance/osx-orientation.md

[OSx orientation design](../osx-orientation.md) — Preserve the design and evidence for the OSx entry page.

Unique responsibility: Load-bearing orientation plan and completed contextual-edit rationale. Reader: Maintainers.

**Final page verdict:** Keep as the bounded orientation’s owner-ruling and evidence record. Replacing obsolete coordination tasks with completed outcomes does not remove those unique authoring constraints.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| OSx orientation design (H1) | Design artifact for the completed design-platform-osx-orientation task: one platform entry page explaining the application's relationship with Aragon OSx and routing readers into the protocol… | Keep. |
| Owner decisions carried into authoring (H2) | / Decision / Ruling (2026-09-10) / Consequence for the page / | Keep. |
| Verification evidence (H2) | Groups the following sections under Verification evidence. | Keep. |
| Default action list and Basic views: no grant or revoke (H3) | Checked at the documented-through release @aragon/app@1.39.0 (adad6787). | Keep. |
| Indexed data sources (H3) | Checked at app-backend@107103b4 (commit), the checkout the existing platform pages cite; it establishes the source pattern, not the production event list at the app tag. | Keep. |
| Audit statement (H3) | Retrieved 2026-09-10 from each repository's main branch README. | Keep. |
| Asset-scale statement (H3) | aragon.org (retrieved 2026-09-10) shows $35B under "Assets governed" and 10K under "Projects launched", and describes the stack as "Audited, battle-tested, and trusted with $35B+". The figure is… | Keep. |
| Page plan (H2) | / Attribute / Decision / Rationale / | Keep. |
| Outline (H3) | Each section answers one question in two to five sentences of platform-level explanation, then closes with the upstream destination and the reason to read it. The coverage map supplies the answer… | Keep. |
| Compact index decision (H3) | / Option / Assessment / Decision / | Keep. |
| Inbound navigation (H3) | Root index: link the page from the introduction's OSx sentence and from Understand or change the platform before the reading order; keep the protocol front-door link beside it; add it to the… | Keep. |
| Contextual edits (H2) | Bounded edits to existing pages, each a sentence or short paragraph, each linking to the entry page's relevant section and then upstream. A page that already carries status: draft keeps it; Governance… | Keep. |
| Distinctions the prose must keep (H2) | Signing versus execution: a signature submits a transaction; a proposal's actions execute later, when the proposal passes and is executed; a direct transaction executes at once. | Keep. |
| Coordination (H2) | The completed purpose and topology audit retains the root orientation page and its cross-layer navigation. | Reframe closed-task directions as completed outcomes and current backlog handoff. |
| Unresolved evidence (H2) | None blocks authoring. The exact asset figure remains an attributed, dated citation rather than documentation truth, and the backend event pattern is verified at an older checkout than the app tag, so… | Reframe as Evidence limits; retain the bounded asset/source statements, with no outstanding ask. |

Applied section and dependency changes:

- Coordination — replace closed-task directions with applied outcomes and the review handoff; Unresolved evidence — reframe as persistent evidence limits.

Final sections added or renamed:

| Final section | Contribution at the retained home | Disposition |
| --- | --- | --- |
| Evidence limits (H2) | None blocks authoring. The exact asset figure remains an attributed, dated citation rather than documentation truth, and the backend event pattern is verified at an older checkout than the app tag, so… | Keep at this home after the applied move or split above. |

### maintenance/osx-orientation/coverage-map.md

[OSx orientation coverage map](../osx-orientation/coverage-map.md) — Map representative OSx questions to bounded platform answers and next links.

Unique responsibility: Question-level contract for the orientation page. Reader: Maintainers.

**Final page verdict:** Keep. Its recorded source scope or coverage dataset remains distinct from page-purpose and section-placement judgments; section relocation did not remove that evidence responsibility.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| OSx orientation coverage map (H1) | The question set for the OSx orientation design: for each representative question, the short answer the entry page must support on its own, where the platform answer stops, the precise next link with… | Keep. |
| Summary (H2) | / # / Question / Platform-only short answer / Stop here / Next link (reason) / Home / | Keep. |
| Source passages to summarize (H2) | Under the authorized summary boundary, these upstream passages may be paraphrased at orientation depth; nothing below them (parameters, signatures, procedures) moves into the platform page. | Keep. |
| Existing coverage reused (H2) | The root index already names OSx as the foundation and links the protocol front door; the entry page becomes the platform-side explanation that sentence points to. | Keep. |

### maintenance/page-purpose-and-topology.md

[Page purpose and repository topology](../page-purpose-and-topology.md) — Record the completed purpose audit and aggregate structural decisions.

Unique responsibility: Load-bearing audit reference for platform and upstream inventories. Reader: Maintainers.

**Final page verdict:** Keep as the initial purpose/topology snapshot and filing decisions. Mark its Full-screen/Wizard boundary as superseded by this feedback pass; it does not claim the original page set must survive.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Page purpose and repository topology (H1) | Completed purpose and information-architecture audit of the platform repository and its indexed upstream context. The platform inventory states each durable page's purpose, reader, unique… | Keep. |
| Scope and accounting (H2) | The baseline was a clean development checkout at d78f613199c0ace0658193313efb906952359ce1, current after a fast-forward-only pull. The composite inventory contained 342 entries: 153 platform and 189… | Keep. |
| Applied topology and taxonomy (H2) | / Decision / Result and reason / | Keep. |
| Boundaries retained (H2) | No product page is merged, split, or retired. The candidate comparisons below explain why related names still need distinct homes. Section-level repetition or implementation detail within a retained… | Keep. |
| Openings and review state (H2) | Retained product openings were confirmed as definitions, outcomes, rules, useful navigation, or explicit candidate outcomes. Reframed the fragment openings on Dashboard, Explore, Linked account,… | Keep. |
| Operating documents (H2) | These eleven tracked Markdown files are outside the indexed product graph. Their role and reader are operational; each retains its unique policy or entry-point responsibility. | Keep. |
| Transient task class and handoff (H2) | Task paths are plain text here so the backlog remains their only inbound navigation. Each task has a finite outcome and one board row in the section for its next actor. None needs a product-page type… | Keep. |
| Validation (H2) | The final graph has no broken links or orphans. All 104 canonical entries and indexes are reachable from the root without traversing maintenance, task, log, or planning records. The 152 platform… | Keep. |

Applied section and dependency changes:

- Opening and page-boundary result — link the completed section audit; retain historical topology counts and decisions.
- Task handoff — distinguish the dated table from the subsequently completed section work.

### maintenance/page-purpose-and-topology/platform-pages.md

[Platform page-purpose inventory](../page-purpose-and-topology/platform-pages.md) — Account for every durable platform page's purpose and disposition.

Unique responsibility: Per-page platform roles consumed by the section audit. Reader: Maintainers.

**Final page verdict:** Keep as the initial page-role inventory. The Full-screen row now points to its surviving variant and records the later merge; initial purpose is evidence to compare, not a veto on change.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Platform page-purpose inventory (H1) | The 152 durable platform pages retained or added by the purpose audit, using final paths and types. Each row records a page-level responsibility; section fit remains the next audit. Task and… | Keep. |
| Root (H2) | / Path and final type/role / Purpose / Intended reader / Unique responsibility / Disposition / | Keep. |
| access-control (H2) | / Path and final type/role / Purpose / Intended reader / Unique responsibility / Disposition / | Keep. |
| accounts (H2) | / Path and final type/role / Purpose / Intended reader / Unique responsibility / Disposition / | Keep. |
| application (H2) | / Path and final type/role / Purpose / Intended reader / Unique responsibility / Disposition / | Keep. |
| design (H2) | / Path and final type/role / Purpose / Intended reader / Unique responsibility / Disposition / | Keep. |
| governance (H2) | / Path and final type/role / Purpose / Intended reader / Unique responsibility / Disposition / | Keep. |
| guides (H2) | / Path and final type/role / Purpose / Intended reader / Unique responsibility / Disposition / | Keep. |
| maintenance (H2) | / Path and final type/role / Purpose / Intended reader / Unique responsibility / Disposition / | Keep. |
| principles (H2) | / Path and final type/role / Purpose / Intended reader / Unique responsibility / Disposition / | Keep. |
| treasury (H2) | / Path and final type/role / Purpose / Intended reader / Unique responsibility / Disposition / | Keep. |

Applied section and dependency changes:

- Opening — identify a dated page-role snapshot consumed by the completed section audit.

### maintenance/page-purpose-and-topology/upstream-pages.md

[Upstream page-purpose inventory](../page-purpose-and-topology/upstream-pages.md) — Account for every indexed upstream page as read-only context.

Unique responsibility: Per-entry upstream roles and overlapping mechanism boundaries. Reader: Maintainers.

**Final page verdict:** Keep. Its recorded source scope or coverage dataset remains distinct from page-purpose and section-placement judgments; section relocation did not remove that evidence responsibility.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Upstream page-purpose inventory (H1) | All 189 indexed upstream entries are retained read-only. This is an overlap and responsibility inventory for the platform purpose audit, not a second factual review or an instruction to rewrite… | Keep. |
| Layer and topic dispositions (H2) | / Topic comparison / Retained boundary / | Keep. |
| Root (H2) | / Path and type/role / Purpose / Intended reader / Unique responsibility / graph context / Disposition / | Keep. |
| abi/admin-plugin (H2) | / Path and type/role / Purpose / Intended reader / Unique responsibility / graph context / Disposition / | Keep. |
| abi/conditions (H2) | / Path and type/role / Purpose / Intended reader / Unique responsibility / graph context / Disposition / | Keep. |
| abi/overview (H2) | / Path and type/role / Purpose / Intended reader / Unique responsibility / graph context / Disposition / | Keep. |
| abi/lock-to-vote-plugin (H2) | / Path and type/role / Purpose / Intended reader / Unique responsibility / graph context / Disposition / | Keep. |
| abi/multisig-plugin (H2) | / Path and type/role / Purpose / Intended reader / Unique responsibility / graph context / Disposition / | Keep. |
| abi/osx (H2) | / Path and type/role / Purpose / Intended reader / Unique responsibility / graph context / Disposition / | Keep. |
| abi/staged-proposal-processor-plugin (H2) | / Path and type/role / Purpose / Intended reader / Unique responsibility / graph context / Disposition / | Keep. |
| abi/token-voting-plugin (H2) | / Path and type/role / Purpose / Intended reader / Unique responsibility / graph context / Disposition / | Keep. |
| common (H2) | / Path and type/role / Purpose / Intended reader / Unique responsibility / graph context / Disposition / | Keep. |
| core (H2) | / Path and type/role / Purpose / Intended reader / Unique responsibility / graph context / Disposition / | Keep. |
| deployment (H2) | / Path and type/role / Purpose / Intended reader / Unique responsibility / graph context / Disposition / | Keep. |
| framework (H2) | / Path and type/role / Purpose / Intended reader / Unique responsibility / graph context / Disposition / | Keep. |
| guides (H2) | / Path and type/role / Purpose / Intended reader / Unique responsibility / graph context / Disposition / | Keep. |
| helpers (H2) | / Path and type/role / Purpose / Intended reader / Unique responsibility / graph context / Disposition / | Keep. |
| plugins (H2) | / Path and type/role / Purpose / Intended reader / Unique responsibility / graph context / Disposition / | Keep. |
| tooling (H2) | / Path and type/role / Purpose / Intended reader / Unique responsibility / graph context / Disposition / | Keep. |

### maintenance/product-knowledge-audit.md

[Product/internal classification audit](../product-knowledge-audit.md) — Preserve the product/internal separation inventory and source dispositions.

Unique responsibility: Classification history; current roles are settled by this purpose audit. Reader: Maintainers.

**Final page verdict:** Keep as the historical audience/classification and source-ruling record. Current retrieval guidance follows final homes; it does not duplicate the section inventory’s structural verdicts.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Product/internal classification audit (H1) | Working inventory for the completed separate-product-knowledge-from-internal-guidance task. Every canonical platform page (concept, capability, pattern, decision, principle, reference, guide) and every… | Keep. |
| Result (H2) | / Classification before the pass / Pages / After the pass / | Keep. |
| Pages intended for the assistant (H2) | Every page below is product knowledge after the pass and contains no design or engineering instruction. wiki --root . list --format json filtered to these paths is the feed. | Reframe current retrieval scope around final page homes; keep the classification tables explicitly historical. |
| Inventory (H2) | Type and status are the page's own; classification is the reading before the pass; the disposition is what was done. | Keep. |
| Root (H3) | / Page / Type / Status / Classification / Reason / Disposition / | Keep. |
| Accounts (H3) | / Page / Type / Status / Classification / Reason / Disposition / | Keep. |
| Governance (H3) | / Page / Type / Status / Classification / Reason / Disposition / | Keep. |
| Treasury and access control (H3) | / Page / Type / Status / Classification / Reason / Disposition / | Keep. |
| Design (H3) | / Page / Type / Status / Classification / Reason / Disposition / | Keep. |
| Guides and indexes (H3) | / Page / Classification / Disposition / | Keep. |
| Classification follow-up (H2) | Nine of the original fourteen passages are settled: | Keep. |
| Verified source dispositions (H2) | Evidence baseline: released app 1.39.0, the published @aragon/gov-ui-kit@2.11.4 and @tiptap/extension-link@3.30.3 packages locked by that release, and the clean local app-backend snapshot. The backend… | Keep. |
| Evidence and limits (H3) | Links: app daoProposalDetailsPageClient.tsx and delegationStatementCard.tsx both mount SafeDocumentParser, which sanitizes content and passes it to the locked UI kit's DocumentParser. The published… | Keep. |

Applied section and dependency changes:

- Pages intended for the assistant — update the retrieval map to final homes; separate current audience rules from the historical classification table.

### maintenance/recovery-without-execute.md

[Recovery without Execute verification](../recovery-without-execute.md) — Preserve evidence about independently usable recovery authority.

Unique responsibility: Recovery/source limits, distinct from current removal UX. Reader: Maintainers.

**Final page verdict:** Keep. Its recorded source scope or coverage dataset remains distinct from page-purpose and section-placement judgments; section relocation did not remove that evidence responsibility.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Recovery without Execute verification (H1) | Evidence retained from the completed verify-recovery-without-execute-permission and verify-admin-removal-alert tasks. The bounded product consequence is in Removing the last governance process; the… | Keep. |
| Source boundary (H2) | The read-only protocol bundle at 800da8d9b347200dda8362e7b68cfe74c08c79a5 cites OSx commit 4100bcf0bc0cefecdedac2ca292f6b32b4796c49, committed 2026-07-07, in its repository register. Retrieved the… | Keep. |
| Dispositions (H2) | / State or proposed route / Verified disposition / Evidence / | Keep. |
| Exact code evidence (H2) | / ID / Source / Relevant check / | Keep. |
| Interpretation limits and handoff (H2) | The pinned DAO prose about losing ROOT calls the permission table permanently frozen. That conclusion needs a fixed-implementation or unavailable-upgrade qualification: E4–E5 permit replacement logic… | Keep. |

### osx-and-the-platform.md

[Aragon OSx and the platform](../../../osx-and-the-platform.md) — Explain the protocol's relationship to the app and route deeper questions.

Unique responsibility: Cross-layer orientation with bounded platform answers. Reader: Participants/operators.

**Final page verdict:** Keep. The stated unique responsibility remains supported by the retained sections. No content was removed from this page and no section destination takes over that object, capability, rule or user outcome.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Aragon OSx and the platform (H1) | Aragon OSx is the protocol underlying the Aragon platform: a framework for building organizations around a smart contract that holds assets, executes actions, and manages permissions. Plugins extend… | Keep. |
| What is OSx, and what does the platform add? (H2) | An Aragon account is an OSx DAO contract with its own assets, execution capability, and permission table. Installed plugins add capabilities; the platform interprets their governance roles as… | Keep. |
| Where does the app's information come from? (H2) | The platform backend builds an index from onchain events, primarily those emitted by OSx accounts, framework contracts, and installed plugins. Features also use token events, balance reads, ENS… | Keep. |
| What does signing a transaction do? (H2) | Account and governance transactions interact with OSx contracts: creating a proposal calls its process's plugin, creating an account calls a factory, and installing governance involves the plugin setup… | Keep. |
| How do governance settings change? (H2) | Governance settings live in the installed plugins and change through authorized calls to those contracts. For example, Update Token Voting settings prepares an action for a proposal on a process… | Keep. |
| How do permissions and conditions work? (H2) | An OSx permission records who may perform an operation on a particular contract, in the permission table held by the account's DAO contract. A condition makes a grant depend on a rule evaluated at call… | Keep. |
| Why can an action be visible without being executable? (H2) | The action builder can discover a function through a verified contract's ABI, the description of its callable interface, without establishing permission to use it. A Basic form likewise helps an author… | Keep. |
| Which configurations remain your responsibility? (H2) | OSx permits configurations beyond those the app offers, and the app's validation rule rejects settings that can never hold without judging whether a viable configuration suits an organization. A… | Keep. |
| What do audits establish, and where are the reports? (H2) | The OSx core and framework contracts, together with the governance plugins the app installs, have been audited by several firms across releases. Each contract repository links its audit reports from… | Keep. |

### principles.md

[Platform design principles](../../design/principles.md) — Define the authoritative set of platform design principles.

Unique responsibility: Load-bearing overview for the specific expanded principles collection. Reader: Product builders.

**Final page verdict:** Keep. The stated unique responsibility remains supported by the retained sections. No content was removed from this page and no section destination takes over that object, capability, rule or user outcome.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Platform design principles (H1) | The platform design principles guide how Aragon enforces governance, represents it to people, and supports different use cases through reusable software. Every feature follows these rules; an exception… | Keep. |
| Onchain foundations (H2) | Enforce governance onchain. Aragon implements governance and permission rules in the account, its plugins, and their conditions. These contracts determine whether configured requirements for an action… | Keep. |
| Product model and interface (H2) | Define the product in its own terms. The protocol describes state and state transitions; the product describes the objects and interactions people use to understand and operate it. Concepts such as… | Keep. |
| Reusable implementation (H2) | Generalize around shared product meaning. Reuse components when they represent the same semantic object or interaction across use cases. The shared definitions of account, process, body, and action… | Keep. |

### principles/every-element-makes-a-claim.md

[Every element makes a claim](../../design/principles/every-element-makes-a-claim.md) — Explain why each visible element must support a relevant user decision.

Unique responsibility: Interface relevance principle; control treatments remain design patterns. Reader: Product builders.

**Final page verdict:** Keep. The stated unique responsibility remains supported by the retained sections. No content was removed from this page and no section destination takes over that object, capability, rule or user outcome.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Every element makes a claim (H1) | Every visible interface element tells the user that something exists, matters in this context, or can be acted on. A control, notice, label, navigation item, empty state, or explanation must therefore… | Keep. |
| The test (H2) | Before adding an element, answer: | Keep. |
| Architecture is not user meaning (H2) | Architecture determines what the product can do, but it does not determine what the interface should say. The interface is not an inventory of system capabilities or an explanation of how they were… | Keep. |
| Availability is communication (H2) | An unavailable control is not automatically an exception to this rule. Sometimes showing it resolves a real expectation mismatch; sometimes showing it creates the expectation only to frustrate it. The… | Keep. |

### principles/honest-abstraction.md

[Honest abstraction](../../design/principles/honest-abstraction.md) — Explain preserving consequential facts through product abstraction.

Unique responsibility: Cross-cutting rationale behind inspectable interaction patterns. Reader: Product builders.

**Final page verdict:** Keep as the consolidated canonical home for this topic, including the former companion page’s unique behavior and rationale. See the overlap follow-up for the incoming content and final purpose. (Page-overlap/location follow-up, 2026-09-13.)

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Honest abstraction (H1) | Honest abstraction is the platform design principle that governs how the app makes onchain reality understandable. Users trust Aragon to curate that human-level model, so the abstraction must preserve… | Keep. |
| The calibration (H2) | Over-abstraction hides relevant reality and becomes dishonest. Under-abstraction exposes detail without giving people a workable model. Product concepts such as a governance process and a body are… | Keep. |
| Where the abstraction reaches its limit (H2) | Creating advanced governance requires working with the Aragon team. The app provides an On request handoff for that setup. | Keep. |
| Abstract, then offer a drill-down (H2) | Do not front-load exhaustive technical detail. Abstract, then offer a drill-down to the authoritative fact when people need it: a decoded call, raw calldata, or a block-explorer link. A drill-down is… | Keep. |

### product-opportunities.md

[Product opportunities](../../product-opportunities/backlog.md) — Organize candidate improvements and their ticketing status.

Unique responsibility: Planning navigation, separate from canonical truth and documentation work. Reader: Product planners.

**Final page verdict:** Keep. The stated unique responsibility remains supported by the retained sections. No content was removed from this page and no section destination takes over that object, capability, rule or user outcome.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Product opportunities (H1) | The product-planning intake for ideas surfaced while documenting current behavior. A type: opportunity entry listed here is the explicit flag for a product improvement. These are candidates for… | Keep. |
| Candidates (H2) | Groups the following sections under Candidates. | Keep. |
| Accounts (bold group) | Allow last-process removal with a warning — the ordinary removal control stops at a process-count gate despite the warn-only product rule. | Keep. |
| Access control (bold group) | Align Permission Viewer details with the selected account — switching to a linked account changes the permission query, but detail presenters retain some primary-account context, so cross-network… | Keep. |
| Treasury (bold group) | Inspect the reward token and exact amount before claiming — claim details show a symbol and shortened amount without an exact-amount or token-address inspection route before submission. | Keep. |
| Governance (bold group) | Match uninstall exclusions to process identifiers — the target's slug does not match the selector's address-plus-slug IDs, so the removal target can remain selectable and its proposal summary can… | Keep. |
| Design (bold group) | Coordinate colliding onboarding prompts — when two connection-time prompts qualify at once, a combined test confirms one silently replaces the other with no priority rule, mid-interaction and… | Keep. |

### product-scope-exclusions.md

[Product scope exclusions](../product-scope-exclusions.md) — Record implemented surfaces excluded from current documentation.

Unique responsibility: Owner-established publication boundary and reopening triggers. Reader: Maintainers.

**Final page verdict:** Keep. The stated unique responsibility remains supported by the retained sections. No content was removed from this page and no section destination takes over that object, capability, rule or user outcome.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Product scope exclusions (H1) | This table is the source of truth for implemented source surfaces that are explicitly outside current product documentation because they are not live. It records present scope, not a roadmap or a… | Keep. |

### repositories.md

[Source repositories](../repositories.md) — Map the source repositories and entry points behind the platform.

Unique responsibility: Builder/source lookup spanning app and protocol dependencies. Reader: Product builders.

**Final page verdict:** Keep. The stated unique responsibility remains supported by the retained sections. No content was removed from this page and no section destination takes over that object, capability, rule or user outcome.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Source repositories (H1) | The codebases the platform is built from. Local paths assume the standard sibling checkout under c:\dev\, except for the pinned protocol-doc/ submodule inside this repository. | Keep. |
| What each entry point owns (H2) | app → apps/app/src/plugins/index.ts. Names every plugin the app supports and initializes each one's registration, so it is the shortest route to where governance behavior actually lives (see plugin… | Keep. |

### treasury/assets.md

[Assets](../../../treasury/assets.md) — Explain inspecting holdings, balances, and treasury values.

Unique responsibility: Assets page and balance interpretation across account scopes. Reader: Participants/operators.

**Final page verdict:** Keep, narrowed to holdings. Coverage, linked-account aggregation, pricing, spam filtering and explorer drill-down remain a distinct read surface. Moving transfer input rules does not remove the treasury-inspection job.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Assets (H1) | The app shows what an account holds on its dedicated Assets page, summarizes the treasury total on the dashboard, and makes balances available when composing a proposal. | Keep. |
| How the app knows (H2) | The backend reconciles each account's holdings against chain data through the provider configured for that network: it reads native and token balances, removes stale holdings, and persists positive… | Split: retain holdings/indexing; move explorer/ABI support to Action builder / Adding a contract. |
| Asset coverage (H2) | Native assets and ERC-20 tokens held by the account: shown. | Keep. |
| Spam filtering (H2) | The backend applies an automated, deliberately imperfect heuristic to likely spam tokens and excludes matches from the default holdings view. A reported-address list delivered through App CMS is a… | Keep. |
| Where the knowledge surfaces (H2) | Because holdings are indexed, the app uses them beyond the Assets page: | Replace with link: retain dashboard and transfer summaries; move picker, balance and Max rules to Action builder / Transferring assets. |

Applied section and dependency changes:

- How the app knows — move explorer/ABI support to Action builder / Adding a contract; Where the knowledge surfaces — replace transfer rules with a link to Action builder / Transferring assets.

### treasury/capital-distributor.md

[Capital Distributor](../../../treasury/capital-distributor.md) — Explain making treasury tokens claimable through distribution campaigns.

Unique responsibility: Rewards page, recipient claims, and campaign lifecycle. Reader: Participants/operators.

**Final page verdict:** Keep. Client/deployment limits now precede the reward and claiming experience. Merkle eligibility, claims and campaign actions still form one distribution capability; Gauge voting only supplies an optional input.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Capital Distributor (H1) | Capital Distributor is a capability provided by an installed plugin for making tokens in a DAO's vault claimable by eligible recipients. A campaign defines who can claim and how the payout is made;… | Keep. |
| Rewards page (H2) | The Rewards page shows campaigns for the connected wallet on an account with Capital Distributor installed. Without a connected wallet, it prompts the visitor to connect. Claimable lists available… | Keep. |
| Merkle eligibility and claiming (H2) | The current Aragon claim flow uses a Merkle allocation strategy. An off-chain backend turns the campaign's allocation data into a Merkle tree and root, and serves each claimant the proof for their… | Keep. |
| Claiming access and external integrations (H2) | Aragon's claiming UI applies an OFAC-list gate. Aragon can also add country restrictions to a client's claiming interface when requested. Those controls apply to that interface; they do not change the… | Move before Rewards page and claiming steps; preserve all audience and availability limits. |
| Campaign actions (H2) | Creating a campaign fixes an allocation, payout token, payout behavior and claim schedule. Use it to open a new distribution after those choices are settled. The create-campaign form asks for a title,… | Keep. |
| Gauge-informed rewards (H2) | A client-arranged campaign can use Gauge voting outcomes as input to its off-chain reward calculation. The resulting allocation data then becomes campaign-preparation input for Capital Distributor.… | Keep. |
| Delivery posture and client context (H2) | Capital Distributor is an Aragon-deployed plugin: the team deploys it for clients, and the app supports the installed experience. Deployment is not offered as a free self-service flow. | Move before Rewards page and claiming steps; preserve all audience and availability limits. |

Applied section and dependency changes:

- ## Delivery posture and client context — move earlier/later within the page, before ## Rewards page
- ## Claiming access and external integrations — move earlier/later within the page, before ## Rewards page

### treasury/create-transaction.md

[Create transaction](../../../treasury/create-transaction.md) — Explain directly executing prepared account calls when authorized.

Unique responsibility: Execute transaction page, separate from proposals and shared submission. Reader: Participants/operators.

**Final page verdict:** Keep, narrowed to the direct execution route. Actor eligibility, conditioned-permission limits, atomic submission and the two-step send remain distinct from composing an action or creating a proposal.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Create transaction (H1) | The Create transaction flow lets a connected actor with execute permission on the DAO itself execute directly on the account, bypassing that account's governance processes. | Keep. |
| Execute transaction page (H2) | Groups the following sections under Execute transaction page. | Keep. |
| Mechanics (H3) | The Transactions page shows an Execution button when the connected actor — a wallet, a Safe, or another account acting over WalletConnect — passes the account's Execute-permission check. The check… | Split: keep eligibility here; place composition/submission under its own heading; move rounding rules to Action builder. |
| Who reaches for it (H2) | The specialized action catalogue applies to direct composition as well as proposals. | Keep. |

Applied section and dependency changes:

- Mechanics — keep eligibility together; split Composing and submitting; move precision rules to Action builder / Transferring assets.

Final sections added or renamed:

| Final section | Contribution at the retained home | Disposition |
| --- | --- | --- |
| Composing and submitting (H3) | Clicking Execution opens a one-step full-screen wizard around the shared action builder. There is no metadata or settings step because direct execution creates no proposal; it calls the DAO's own… | Keep at this home after the applied move or split above. |

### treasury/index.md

[Treasury](../../../treasury/index.md) — Route readers through holdings, activity, execution, and distributions.

Unique responsibility: Treasury collection navigation including recipient claims. Reader: Participants/operators.

**Final page verdict:** Keep. The retained collection still contains independently meaningful entries and needs its navigation surface.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Treasury (H1) | Inspect an account's holdings and activity, prepare a direct transaction when authorized, or claim a reward allocation. The account itself is the vault: assets live on the DAO contract, whose execution… | Keep. |

### treasury/inspect-reward-token-and-exact-amount.md

[Inspect the reward token and exact amount before claiming](../../product-opportunities/inspect-reward-token-and-exact-amount.md) — Evaluate inspecting a claim's token and precise allocation before submission.

Unique responsibility: Reward-claim inspection gap, separate from account asset browsing. Reader: Product planners.

**Final page verdict:** Keep. This candidate still owns its specific proposed product outcome; section relocation did not implement, duplicate or supersede it.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Inspect the reward token and exact amount before claiming (H1) | Candidate: give a claimant a way to verify the payout token and exact allocation before submitting a Capital Distributor claim. A token symbol and shortened amount do not identify the token contract or… | Keep. |
| Before ticketing (H2) | Reproduce with an allocation whose amount loses precision in the compact display and with tokens that share a symbol. | Keep. |

### treasury/preserve-account-scope-in-transaction-categories.md

[Preserve account scope in transaction categories](../../product-opportunities/preserve-account-scope-in-transaction-categories.md) — Evaluate retaining selected account scope when changing transaction categories.

Unique responsibility: Linked-history category filter mismatch. Reader: Product planners.

**Final page verdict:** Keep. This candidate still owns its specific proposed product outcome; section relocation did not implement, duplicate or supersede it.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Preserve account scope in transaction categories (H1) | Candidate: preserve All accounts when changing categories on Transactions. Narrowing the history to executions, deposits, or withdrawals should retain the primary and linked accounts in the selected scope. | Keep. |

### treasury/preserve-or-reject-over-precise-amounts.md

[Preserve or reject amounts the token cannot express](../../product-opportunities/preserve-or-reject-over-precise-amounts.md) — Evaluate preserving or explaining token amounts beyond supported precision.

Unique responsibility: Transfer amount normalization candidate. Reader: Product planners.

**Final page verdict:** Keep as a distinct candidate. The source of current rounding behavior moved, but the proposed input-precision outcome and candidate status did not change.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Preserve or reject amounts the token cannot express (H1) | Candidate: align the transfer amount field with the pattern library's normalization rule. Input normalization counts an amount's precision among what a conversion may change, so an amount is preserved… | Keep. |

Applied section and dependency changes:

- Opening — retarget the rounding rule to its shared composition home.

### treasury/rebasing-token-balance-freshness.md

[Rebasing-token balance freshness](../../product-opportunities/rebasing-token-balance-freshness.md) — Evaluate keeping displayed rebasing-token balances current.

Unique responsibility: Balance changes without Transfer events. Reader: Product planners.

**Final page verdict:** Keep. This candidate still owns its specific proposed product outcome; section relocation did not implement, duplicate or supersede it.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Rebasing-token balance freshness (H1) | Candidate: improve balance freshness for rebasing tokens. For current holdings coverage, see Assets. | Keep. |
| Opportunity (H2) | Assets refreshes a held token's balance when the indexer observes an ERC-20 Transfer involving the account. Some balances, including rebasing-token balances, can change without such an event. Explore… | Keep. |
| Before ticketing (H2) | Establish whether this produces material user-facing inaccuracies. | Keep. |

### treasury/transactions.md

[Transactions](../../../treasury/transactions.md) — Explain inspecting transfers and executed actions for an account.

Unique responsibility: Transactions page, category filters, and execution details. Reader: Participants/operators.

**Final page verdict:** Keep. The stated unique responsibility remains supported by the retained sections. No content was removed from this page and no section destination takes over that object, capability, rule or user outcome.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Transactions (H1) | The Transactions page provides a full record of value moving through the account and of what the account has done. Reached from the nav bar, this collection page defines four tabs: | Keep. |
| Opening a transaction (H2) | Selecting an execution opens a dialog with its execution timestamp, total action count, transaction hash, and action list. The action list reuses the Basic, Decoded and Raw modes; the action catalogue… | Keep. |

### treasury/vault.md

[Vault](../../../treasury/vault.md) — Explain the account itself holding and deploying treasury assets.

Unique responsibility: Treasury role of an account, distinct from general account semantics. Reader: Participants/operators.

**Final page verdict:** Keep. The stated unique responsibility remains supported by the retained sections. No content was removed from this page and no section destination takes over that object, capability, rule or user outcome.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Vault (H1) | The account is the treasury: assets are held by the DAO contract itself, not by any auxiliary vault contract. This works because of what the DAO is at the protocol layer — an account that executes… | Keep. |

### value-proposition.md

[Value proposition](../../../value-proposition.md) — Explain what organizations can achieve with the Aragon platform.

Unique responsibility: Cross-cutting product promise grounded in supported capabilities. Reader: Participants/operators.

**Final page verdict:** Keep. The stated unique responsibility remains supported by the retained sections. No content was removed from this page and no section destination takes over that object, capability, rule or user outcome.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Value proposition (H1) | The Aragon platform lets organizations, teams, and onchain operators securely execute actions to manage treasuries and operate protocols. Different kinds of actions can have their own governance… | Keep. |
| Key benefits (H2) | Choice of governance methods — organizations can choose multisig approval for council-based decision-making, token voting for token-holder decisions, or combine methods in a staged process. The Aragon… | Keep. |


### AGENTS.md

[Operating this knowledge base](../../../AGENTS.md) — Define the wiki data model, safe graph operations, and repository-wide agent responsibilities.

**Final page verdict:** Keep. Its policy, canonical skill, template or compatibility-entry responsibility remains distinct; the content and delegated authority were not displaced by the section moves.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Operating this knowledge base (H1) | This folder is an agentic wiki bundle: plain Markdown (someone's notes, documents, datasets, and tasks) that you operate with the wiki CLI. The goal is knowledge that stays plain and human-readable… | Keep. |
| The model (H2) | Three orthogonal axes classify every entry (keep them separate and the base stays friction-free): | Keep. |
| Get oriented (H2) | On a base you don't already know, look around first, and the fastest way to learn its shape, vocabulary, and health: | Keep. |
| Division of labor (H2) | You read, write, and edit Markdown directly: create entries, compose frontmatter, draft content, add links. This is the judgment work wiki can't do. | Keep. |
| Recipes: a need, and the command that meets it (H2) | Groups the following sections under Recipes: a need, and the command that meets it. | Keep. |
| Find and recall (H3) | wiki search "docker networking" # every word by default (AND), case-insensitive, over frontmatter + body | Keep. |
| Follow the graph (what grep can't do) (H3) | wiki links /index.md # what it points to | Keep. |
| Capture → refine → promote (H3) | Knowledge often arrives rough and matures in place. You write the file; wiki only queries it. | Keep. |
| Reshape safely (H3) | wiki move --dry-run /a.md /archive/a.md # preview the link rewrites | Keep. |
| Track work (H3) | Two things wear a checkbox-ish shape; the model separates them by who owns the state: | Keep. |
| Keep it healthy (H2) | After any batch of edits, run wiki check before you're done. It's the gate: | Keep. |
| Git and safety (H2) | Git is optional but highly recommended: it is the undo for a base an agent edits. When the base is at the root of a repo: pull before editing (otherwise ask the user), and after wiki check passes,… | Keep. |
| Conventions (H2) | Every entry has a type (reserved index.md/log.md); slug filenames (lowercase, hyphenated, no spaces); shallow folders (2–3 levels). | Keep. |

### CLAUDE.md

[CLAUDE.md](../../../CLAUDE.md) — Redirect Claude to the shared AGENTS.md instructions without duplicating policy.

**Final page verdict:** Keep. Its policy, canonical skill, template or compatibility-entry responsibility remains distinct; the content and delegated authority were not displaced by the section moves.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Whole entry | See AGENTS.md. | Keep. |

### WORKFLOW.md

[How these docs work](../../../WORKFLOW.md) — Own product scope, page types, authoring boundaries, review/task state, and repository conventions.

**Final page verdict:** Keep as repository policy. Add the explicit purpose → sections → residual-purpose loop so structural passes cannot stop at section relocation. Update the illustrative design filename to Wizard.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| How these docs work (H1) | This is the workflow layer for the Aragon platform product docs: the conventions on top of what AGENTS.md and the wiki tool define. voice.md is the narrower prose layer: it governs how reader-facing… | Keep. |
| What this base is (and is not) (H2) | One product: the Aragon platform, the full-stack application for governing treasuries and protocols on EVM chains, built on the Aragon OSx protocol. This base documents the business logic and semantic… | Keep. |
| Voice: reader-facing prose (H2) | The active voice policy applies to canonical platform entries, guides, reader-facing indexes, and product-opportunity prose. It is an operating document rather than a wiki entry: wiki.toml ignores it,… | Keep. |
| Product content and documentation operations (H3) | Product prose contains established product knowledge and useful reader guidance; documentation operations have separate homes. This boundary applies to draft and reviewed canonical entries, guides,… | Keep. |
| Protocol-doc: read-only upstream and one composite graph (H2) | The parent repository pins one exact protocol-doc commit even though .gitmodules records main as the update branch. The pin named in index.md is the protocol baseline for every platform page. The… | Keep. |
| Types (H2) | The composite vocabulary is enforced in wiki.toml and is the union of both bundles. Platform types in use are concept (an idea and why), capability (something a user can do in the app: its purpose and… | Keep. |
| Publication boundary: live product only (H3) | Release notes are inputs to the wiki, never the framing of a product article. Keep release-note citations, version-by-version audit narration, and disputes between source snapshots in source: metadata… | Keep. |
| Client-specific integrations (H3) | Classify audience, rollout, and deployment separately. Work commissioned for a named client stays scoped to that client even when it reuses a general capability, ships in the shared app, or uses Aragon… | Keep. |
| Structure (H2) | A product's canonical pages live in two physical layers: graph pages (concept/capability/pattern/decision/principle/risk/reference) filed by area, and the user-facing guides/ layer beside them.… | Reframe the task example to the surviving review-remaining-drafts entry. |
| The entry point (index.md) (H2) | A reader (or an agent) lands on index.md. Make it the front door, hand-curated, not a dump of everything: | Keep. |
| Concepts: the graph (H2) | Each concept is one atomic idea, defined once, and linked to what it relates to: | Keep. |
| Authoring and revising pages (H2) | Let the reader's product question determine what the page explains. Establish its contribution to the graph: what the reader should understand, decide, look up, or accomplish here, and which related… | Reframe: require the purpose → sections → residual-purpose feedback loop and a final page verdict after structural changes. |
| Application-page coverage (H2) | Every live application page needs one clear documentation home: a named section in the concept or capability it presents, or a dedicated entry when its purpose and behavior warrant one. Use the… | Keep. |
| Guides: accomplishing tasks in Aragon (H2) | A guide (type: guide) helps someone who does not yet know how to accomplish a concrete outcome in the Aragon platform. It starts from the user's goal — not the documentation's structure — and walks… | Keep. |
| Multiple products (H2) | When products coexist (a folder each, see Structure), a concept shared by two products still has a single home, the product that owns it, or a top-level shared/, and the other product links to it,… | Keep. |
| Ingesting from source (H2) | Docs are usually distilled from source material: source code, specs, tickets, existing docs, a subject-matter expert. That material is the input, not the wiki; your job is to turn it into atomic,… | Keep. |
| The inbox (H2) | inbox/ is the holding area for cleaned but unstructured or incorrectly structured ideas: valid, readable content that isn't yet shaped into entries. It differs from raw/ on both axes — it is committed… | Keep. |
| Personal research (H2) | research/ is the product owner's private, local research workspace. It deliberately lives beside the bundle for convenience, but it is not part of the portable knowledge base: both Git and wiki.toml… | Keep. |
| Degraded mode: no wiki CLI (H2) | Before changing anything in the base, check that the wiki CLI is available (wiki --version). If it is not — not installed, and not installable in the session — do not create, edit, move, or merge… | Keep. |
| Documentation review: the backlog and open questions (H2) | The product owner needs one place to go to find documentation work waiting on them: backlog.md at the root. It is an authored board (agents keep it current, wiki never edits it), organized by who moves… | Keep. |
| Tasks (H3) | A task is finite documentation work for one named next actor: the owner may review a ledger or settle a bounded ruling, while an agent may analyze a codebase, compare a page against a repo, build an… | Keep. |
| Knowledge gaps (H3) | A knowledge gap is a missing structural understanding: a whole topic, subsystem, or flow cannot be documented because the necessary source material is absent. A page-local question refines existing… | Keep. |
| The loop, and the agent duties in it (H3) | Creating or changing a page → reconcile its review status with the drafts inventory and put every unresolved documentation question or unfinished action in a finite task with one board row. Once the… | Keep. |
| Product opportunities (H2) | Documentation sometimes exposes a possible product improvement rather than an unknown about how the product works. Those ideas live on product-opportunities.md, not in a capability's ## Open questions… | Keep. |
| Grooming (H2) | Groom to make the base more findable. Don't restructure, rename, or re-file just because you can; only do it when it's needed. | Keep. |
| Answering everyday questions (H2) | The graph is only as good as its linking, so index well: every concept linked from where it is relevant, wiki orphans empty, wiki unresolved worked down. Bad indexing shows up as unfindable pages. | Keep. |
| Make it yours (H2) | Nothing here is fixed beyond "every entry has a type." One product or many, reference split out or folded in, guides or none: reshape this file and the folders to fit. | Keep. |

Applied section and dependency changes:

- Structure — update the example task to the surviving review task.

### voice.md

[Voice](../../../voice.md) — Specify prose constraints, audience modulation, protected terminology, and the authoring preflight.

**Final page verdict:** Keep. Its policy, canonical skill, template or compatibility-entry responsibility remains distinct; the content and delegated authority were not displaced by the section moves.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Voice (H1) | For prose work, read the contract, operational summary, rules, and preflight. Consult the relevant surface, terminology, examples, and references as the subject requires; reuse guidance already loaded… | Keep. |
| 1. Contract (H2) | Groups the following sections under 1. Contract. | Keep. |
| Applies to (H3) | Reader-facing prose in canonical platform entries: concepts, capabilities, patterns, decisions, principles, risks, and references. | Keep. |
| Does not govern (H3) | Product facts, protocol behavior, API behavior, or code correctness. | Keep. |
| Precedence (H3) | Preserve factual and technical accuracy; never invent product behavior or turn a candidate into a commitment. | Keep. |
| Normative language (H3) | MUST / MUST NOT: requirement. A violation blocks completion of the affected prose; many requirements need semantic judgment rather than an automated check. | Keep. |
| Activation and fallback (H3) | Only a policy with status: active is normative. A draft voice file is advisory and its review is tracked as documentation work, not as a canonical-page draft. | Keep. |
| 2. Operational summary (H2) | Explain the Aragon platform through product meaning, purpose, and consequences. Answer the reader's central question directly, then build the explanation with enough context to understand it. State… | Keep. |
| 3. Core dimensions (H2) | / ID / Dimension / Aim / Boundary / Observable signals / | Keep. |
| 4. Rules (H2) | Use one observable instruction per row. Hard constraints stay separate from preferences. Check expressions are optional review aids; wiki check does not execute them. | Keep. |
| 5. Surface map (H2) | Create a separate surface only when it changes the default voice or adds a hard constraint. | Keep. |
| 6. Terminology (H2) | Voice policy routes terminology to its authoritative product entry; it does not replace those definitions. | Keep. |
| Protected terms (H3) | / Canonical form / Forbidden variants / First-use rule / Notes / | Keep. |
| Preferred and avoided choices (H3) | / Use / Avoid / When / Reason / Exceptions / | Keep. |
| Forbidden phrases (H3) | / Phrase / Reason / Exceptions / | Keep. |
| 7. Calibration examples (H2) | Each pair isolates named rules; examples calibrate structure and tone, not product facts to copy elsewhere. | Keep. |
| V-E01: Define the product object before its mechanism (H3) | Surface: canonical | Keep. |
| V-E02: Put availability before guide actions (H3) | Surface: guide | Keep. |
| V-E03: Name actor, action, and consequence (H3) | Surface: canonical | Keep. |
| V-E04: Route from an index without copying definitions (H3) | Surface: navigation | Keep. |
| V-E05: Keep a planning candidate distinct from a commitment (H3) | Surface: planning | Keep. |
| V-E06: Attach a foil only to a real misreading (H3) | Surface: canonical | Keep. |
| V-E07: State the product fact without narrating the documentation (H3) | Surface: canonical, guide, navigation, planning | Keep. |
| V-E08: Explain the benefit when removing editorial framing (H3) | Surface: canonical | Keep. |
| 8. Edge cases (H2) | / ID / Case / Required behavior / | Keep. |
| 9. References (H2) | / ID / Path / Load when / Required for default use? / | Keep. |
| 10. Preflight (H2) | Before finalizing reader-facing prose, verify: | Keep. |

### .agents/skills/wiki-cli/SKILL.md

[Wiki CLI compatibility shim](../../../.agents/skills/wiki-cli/SKILL.md) — Delegate skill loading to the canonical .claude skill while keeping one source of instructions.

**Final page verdict:** Keep. Its policy, canonical skill, template or compatibility-entry responsibility remains distinct; the content and delegated authority were not displaced by the section moves.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Wiki CLI compatibility shim (H1) | The canonical cross-agent instructions for this skill live in | Keep. |

### .agents/skills/prepare-change-space/SKILL.md

[Prepare a change space compatibility shim](../../../.agents/skills/prepare-change-space/SKILL.md) — Delegate skill loading to the canonical .claude skill while keeping one source of instructions.

**Final page verdict:** Keep. Its policy, canonical skill, template or compatibility-entry responsibility remains distinct; the content and delegated authority were not displaced by the section moves.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Prepare a change space compatibility shim (H1) | The canonical cross-agent instructions for this skill live in | Keep. |

### .agents/skills/reconcile-app-releases/SKILL.md

[Reconcile app releases compatibility shim](../../../.agents/skills/reconcile-app-releases/SKILL.md) — Delegate skill loading to the canonical .claude skill while keeping one source of instructions.

**Final page verdict:** Keep. Its policy, canonical skill, template or compatibility-entry responsibility remains distinct; the content and delegated authority were not displaced by the section moves.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Reconcile app releases compatibility shim (H1) | The canonical cross-agent instructions for this skill live in | Keep. |

### .claude/skills/wiki-cli/SKILL.md

[Operating the base with `wiki`](../../../.claude/skills/wiki-cli/SKILL.md) — Specify this repository’s CLI invocation, structural queries, safe moves, and composite verification gate.

**Final page verdict:** Keep. Its policy, canonical skill, template or compatibility-entry responsibility remains distinct; the content and delegated authority were not displaced by the section moves.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Operating the base with wiki (H1) | You are the librarian; wiki is the database engine. It answers structural questions | Keep. |
| Invocation (H2) | wiki --version # absent → capture-only mode (last section) | Keep. |
| Rule 1 — one root, always the parent (H2) | wiki finds its config by walking up to the nearest wiki.toml, and protocol-doc/ | Keep. |
| Rule 2 — translate the POSIX recipes (H2) | AGENTS.md and WORKFLOW.md write their recipes in POSIX; PowerShell is this machine's | Keep. |
| The palette, by need (H2) | Every command takes --format text / json / csv / tsv. Reach for these before ls, find, | Keep. |
| Orient on arrival (bold group) | wiki --root . status | Keep. |
| The gate — close every edit batch with check (H2) | For product prose, apply WORKFLOW.md's Verify from code; explain from product purpose rule. The source-link checker scans indexed platform product and opportunity bodies, excluding provenance metadata,… | Keep. |
| Reshaping — never by hand (H2) | wiki --root . move --dry-run /a.md /governance/a.md # preview the link rewrites | Keep. |
| Capture-only mode (no CLI) (H2) | If wiki --version fails and the CLI cannot be installed in the session, do not create, | Keep. |
| Antipatterns (H2) | Grepping for something the graph knows (backlinks, orphans, unresolved, links). | Keep. |

### .claude/skills/prepare-change-space/SKILL.md

[Prepare a change space](../../../.claude/skills/prepare-change-space/SKILL.md) — Prepare authorized development spaces and refresh the observed release checkpoint without reconciling release content.

**Final page verdict:** Keep. Its policy, canonical skill, template or compatibility-entry responsibility remains distinct; the content and delegated authority were not displaced by the section moves.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Prepare a change space (H1) | Prepare a safe Git change space and check whether the documentation has fallen behind the shipped app. Release reconciliation is queued here, never performed as a hidden side effect. | Keep. |
| Boundary (H2) | Use this workflow only when the task authorizes repository changes and calls for creating or switching to a development branch or worktree. | Keep. |
| Prepare Git first (H2) | Inspect the repository root, current branch, worktree status, remotes, and the pinned submodule. Do not move, discard, or absorb unrelated changes. | Keep. |
| Refresh the release checkpoint (H2) | Read App release documentation state and Source repositories. | Keep. |
| Gate (H2) | After any tracker or backlog change, run from the repository root: | Keep. |

### .claude/skills/reconcile-app-releases/SKILL.md

[Process and reconcile app release notes](../../../.claude/skills/reconcile-app-releases/SKILL.md) — Reconcile official app releases using owner context, tagged sources, ledgers, and scope-aware documentation checks.

**Final page verdict:** Keep. Its policy, canonical skill, template or compatibility-entry responsibility remains distinct; the content and delegated authority were not displaced by the section moves.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Process and reconcile app release notes (H1) | Turn a rough business-context dump plus official release evidence into documented product truth across the whole graph. The owner explains product intent first; tagged code then tests, sharpens, and… | Keep. |
| Required owner input (H2) | A messy brain dump is valid input; do not make the owner rewrite it into a template. The pass requires business context for every release in the interval: what the release was trying to change, why it… | Keep. |
| Preflight and interval (H2) | Load the wiki-cli skill for graph operations and entry edits. Follow WORKFLOW.md for source handling and task state; apply the relevant voice guidance and preflight when writing product prose. | Keep. |
| Normalize without losing meaning (H2) | Capture a direct owner briefing in inbox/ as readable source material, preserving every claim, caveat, and uncertainty without adding interpretation, as the inbox policy requires. Keep… | Keep. |
| Mine the full graph before writing (H2) | Build the ledger's coverage matrix before editing canonical prose. For each atomic claim: | Keep. |
| Reconcile application reality (H2) | For every release, diff its immutable aragon/app tag against the preceding release and inspect the product paths behind every ledger item. Follow the dependency and service boundary far enough to… | Keep. |
| Refresh supported chains (H3) | For every release in the briefed interval, check the chain inventory even when the release notes mention no network change. The owner's supported-chain commission authorizes deriving official platform… | Keep. |
| Give every release item one explicit disposition (H2) | Choose one primary disposition and record the reason: | Keep. |
| Put unresolved work in the right place (H3) | Put every unresolved documentation question in a finite task, including a question about one existing page. Preserve the missing answer, known evidence, and affected-page links there; keep any material… | Keep. |
| Reconcile the graph and close the interval (H2) | Verify that every owner claim, official note, code-only finding, and per-release supported-chain check has a final disposition and that every coverage-matrix surface was checked. Confirm the… | Keep. |

### .claude/skills/reconcile-app-releases/references/release-ledger.md

[Structured release ledger and coverage format](../../../.claude/skills/reconcile-app-releases/references/release-ledger.md) — Template a release-specific evidence and content-disposition ledger for reconciliation.

**Final page verdict:** Keep. Its policy, canonical skill, template or compatibility-entry responsibility remains distinct; the content and delegated authority were not displaced by the section moves.

| Baseline section | Contribution to the page’s purpose | Applied disposition |
| --- | --- | --- |
| Structured release ledger and coverage format (H1) | Use this temporary working format to turn an unstructured owner briefing and official release notes into a complete reconciliation plan. It is deliberately more explicit than the eventual canonical… | Keep. |
| What good structured release notes do (H2) | Good notes let a reader answer, without returning to the raw dump: | Keep. |
| Normalization rules (H2) | Give every atomic owner claim and official release item a stable ID such as 1.39.0-owner-01 or 1.39.0-gh-03. | Keep. |
| Working template (H2) | # App release working ledger | Keep. |

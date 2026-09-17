---
type: reference
title: Page purpose and repository topology
tags: [maintenance, cross-cutting]
source: audit-page-purpose-and-repository-topology at platform-doc@d78f613199c0ace0658193313efb906952359ce1; composite wiki 0.9.0 inventory and tracked Markdown; completed coverage and semantic reviews (2026-09-13, see log.md)
---

# Page purpose and repository topology

**Subsequent structure:** The [page-overlap and location follow-up](./section-fit-and-location.md#page-overlap-and-location-follow-up) supersedes this pass’s separate behavior/design homes and affected filing decisions. Tables below retain the dated audit baseline; links follow surviving canonical homes.

Completed purpose and information-architecture audit of the platform repository and its indexed upstream context. The [platform inventory](./page-purpose-and-topology/platform-pages.md) states each durable page's purpose, reader, unique responsibility, and disposition. The [upstream inventory](./page-purpose-and-topology/upstream-pages.md) accounts for every indexed protocol entry without changing it. These settled page roles were consumed by the completed [section audit](./section-fit-and-location.md). This page retains the dated topology snapshot; neither audit approves draft content.

## Scope and accounting

The baseline was a clean `development` checkout at `d78f613199c0ace0658193313efb906952359ce1`, current after a fast-forward-only pull. The composite inventory contained **342 entries: 153 platform and 189 upstream**. The tracked-file census contained **169 platform Markdown files: 153 indexed entries, 11 operating documents, and five excluded inbox files**. Tracked paths were enumerated without opening excluded captures.

| Class | Baseline | Disposition and final accounting |
| --- | ---: | --- |
| Durable indexed platform pages, including indexes, boards, and log | 147 | All retained; ten refiled, six retyped, selected openings reframed, and navigation corrected. Five new maintenance/navigation pages bring this class to 152. Each has a row in the platform inventory. |
| Transient platform tasks | 6 | Outcome/board fit checked as a separate class below. This audit retires; the section audit becomes ready for the agent. Five tasks remain. |
| Ignored operating Markdown | 11 | Individually accounted below. Policy and tools retain separate responsibilities. Only affected path references and topology descriptions change. |
| Indexed protocol context | 189 | All retained read-only: 112 ABI references, eight ABI indexes, and 69 other entries. Every path appears in the upstream inventory. |
| `inbox/` | 5 tracked files | Excluded capture class. No contents opened or processed. |
| `raw/`, `research/`, including any local or ignored material | Not enumerated internally | Excluded capture/private classes. No contents opened or processed; no knowledge or task inferred from them. |

After completion the composite graph contains **346 entries: 157 platform and the same 189 upstream**. The platform worktree accounts for 173 Markdown paths after applying the relocations, adding five files, and retiring one task. Counts describe this pass, not a standing inventory service.

The inspection used `wiki list`, `outline`, `links`, and `backlinks` for all 342 baseline entries, plus tracked Markdown for operating documents. Platform openings and page shapes were compared by responsibility. Upstream titles, types, outlines, and graph relationships were compared for linked and unlinked topic overlap; relevant mechanisms were read in detail. This was not another source-code, release, route, or factual audit. No branch was opened or switched and the release checkpoint was not refreshed.

## Applied topology and taxonomy

| Decision | Result and reason |
| --- | --- |
| Gather shared app behavior | Six pages move to [Application](../../application/index.md): App CMS, Supported chains, Submitting a transaction, Collection pages, Getting help, and Address fields. Their responsibility crosses account, governance, and treasury flows. The folder is a collection with an index, not a new product concept. Wallet connection stays in Accounts because it establishes the acting identity. |
| File deployment support with the plugin model | [Aragon-deployed plugins](../../application/aragon-deployed-plugins.md) moves from the root to Governance. It explains a deployment/support category; it does not own the behavior of every capability deployed this way. |
| File distributions by the outcome | [Capital Distributor](../../treasury/capital-distributor.md) and its reward-inspection candidate move to Treasury. Their outcome is allocating and claiming treasury tokens. [Gauge voting](../../governance/gauge-voting.md) stays in Governance because it allocates preferences; its optional reward handoff does not make both capabilities one thing. |
| File prompt orchestration with interaction design | The onboarding-collision candidate moves to Design. It concerns coordination between independent prompts across flows. Its board row moves with it. The design pattern no longer links into the candidate overlay; the candidate retains the concrete evidence and investigation. |
| Retype behavior inherited from design pages | Wallet connection, Submitting a transaction, and Getting help become `capability`. Address fields and Collection pages become `reference`, describing shared behavior readers look up. Their corresponding design patterns remain `pattern` and retain their implementation/design responsibility. |
| Retype the name definition | [Aragon Names](../../application/aragon-names.md) becomes `concept`: it defines the name and routes to the distinct claiming and profile capabilities. It does not become a second name-lifecycle page. |
| Retain the remaining vocabulary | Other used types fit their page jobs. Concepts may include the named application page that presents their object; that does not force them into `capability`. Governance handover remains a reusable `pattern`, and invariant validation remains a chosen `decision`. No new type is introduced. The declared-but-unused `risk`/`example` policy decision remains with the already commissioned consistency sweep. |
| Make collections navigable | Add Application and [maintenance navigation](./index.md); regroup Governance by reader job and add plugin compatibility/deployment links. Treasury includes claims. Root navigation separates product areas, builder guidance, and maintenance. The backlog's draft groupings and opportunity board follow the final areas. |
| Preserve load-bearing collections | `principles.md`, `maintenance/basic-action-views.md`, `maintenance/osx-orientation.md`, and this audit remain typed parents beside their parts folders. Their parts are aspects of one set or audit; no typeless index replaces the parent. `tasks/` retains only the backlog as its incoming navigation. |
| Keep operations distinct | Root release state, scope exclusions, source repositories, boards, and log retain their deliberate cross-cutting roles. The supported-chain extractor, its existing test, and ignored skill/voice links now target the relocated reference. No source capture or generated upstream file is relocated. |

Every move used `wiki move` after a dry run and backlink inspection. Historical Markdown links were retargeted by that operation; historical counts, evidence revisions, and plain-text source paths remain snapshots. The preceding [classification inventory](./product-knowledge-audit.md) records that its deferred topology calls are now settled here.

## Boundaries retained

At the initial purpose-audit close-out, no product page was merged, split, or retired. The subsequent [residual-purpose check](./section-fit-and-location.md#returning-from-sections-to-page-purpose) supersedes the Full-screen/Wizard retention decision: Full-screen wizard is now a variant within Wizard. The table below preserves the initial comparisons. The candidate comparisons below explain why related names still need distinct homes. Section-level repetition and misplaced implementation detail were subsequently dispositioned by the [section audit](./section-fit-and-location.md), using these retained roles.

| Adjacent pages | Distinct responsibilities retained |
| --- | --- |
| Account, Vault, Safe | General ability to act; the treasury role of an Aragon account; one concrete account/governor shape. The short Vault page is an entry point into treasury meaning, not a duplicate contract specification. |
| Admin flow, default-Admin decision, Admin management | Temporary lifecycle; why the app chooses that bootstrap; controls for membership and handover. |
| Aragon Names, Profiles, claiming, ENS decision, delegate record | Identity object; profile behavior; name lifecycle; portability rationale; token-specific statement schema. |
| Linked account, signaling, display/control decision, linked execution | App presentation; the signal it reads; the separation from authority; an authorized execution capability. The signaling explanation adds application interpretation to generic OSx grants. |
| Plugin, compatibility, deployment category, governance designer | Installed capability semantics; support lookup; team-arranged deployment; user configuration and installation. |
| Process, Body, Member, Stage, staged proposals | End-to-end governance; whose preferences count; one participant; a checkpoint; proposal traversal. Existing approved meanings and distinctions remain intact. |
| Action, Action builder, Basic action views, Proposal, proposal creation | Call semantics; composition/inspection; action catalogue; the governed object; publication flow. The 22-action content map remains authoritative for the catalogue/feature split. |
| Target, authorization model, OSx paths, scoped authority, Permission Viewer | Plugin execution endpoint; shared roles and checks; applied route comparison; product division of authority; indexed inspection capability. None replaces the upstream permission resolver. |
| Shared app behavior and corresponding design pages | Current user experience versus rules for building consistent interactions. The retyped pages do not absorb design policy. Wizard, its full-screen container, dialog taxonomy, and submission stepper also retain different responsibilities. |
| Multisig gates, Safe as a body, visible-stage decision, guides | Governance composition; one body's participation capability; representation rationale; ordered application to a user's setup. Guide portfolio redesign remains the later use-case task. |

The [application crosswalk](./application-page-coverage.md) retains **all 17 page families and their existing heading anchors**. Its Rewards home moves with Capital Distributor; the shared behavior references and the drill-down/action maps follow the other relocations. No new route or page family is inferred. Settings remains in Accounts; Proposals/Proposal details remain on Proposal, Members on Body, Member on Member, and Process details on Process. There was no unresolved placement or behavior-evidence item to route.

[Client scope](./client-specific-integrations.md) is unchanged: BENQI retains its named capability and action subsection, while general Gauge voting retains its shared scope. Alchemix remains unlaunched with only the authorized brief examples. Capital-flow and in-app-support exclusions remain excluded. Deployment method does not broaden audience.

## Openings and review state

Retained product openings were confirmed as definitions, outcomes, rules, useful navigation, or explicit candidate outcomes. Reframed the fragment openings on Dashboard, Explore, Linked account, Linked-account signaling, Proposal creation, Multisig gates, Full-screen wizard, and Transaction submission stepper. Replaced generic candidate disclaimers with the concrete candidate outcome on seven opportunities. Removed an editorial tail from Submitting a transaction. The inventory carries page-purpose statements; product prose does not acquire them.

These edits preserve existing claims, availability, and uncertainty. No approved semantic anchor receives a substantive meaning or boundary change. All **86 draft entries remain draft**, and the board mirrors their relocated homes. A move, type correction, or navigation repair does not constitute owner approval. The new navigation and maintenance records are not product drafts.

## Operating documents

These eleven tracked Markdown files are outside the indexed product graph. Their role and reader are operational; each retains its unique policy or entry-point responsibility.

| Path | Purpose and intended use | Unique responsibility | Disposition |
| --- | --- | --- | --- |
| [AGENTS.md](../../AGENTS.md) | Teach agents how to operate the wiki model safely. | Graph model and repository operating contract. | Keep. |
| [CLAUDE.md](../../CLAUDE.md) | Route Claude to the shared operating contract. | Agent entry-point shim; no duplicate policy. | Keep. |
| [WORKFLOW.md](../../WORKFLOW.md) | Define content scope, structure, publication, and board workflow for maintainers. | Repository-specific policy. | Reframe topology description to match final areas. |
| [voice.md](../../voice.md) | Define reader-facing prose rules for authors. | Voice policy, independent of factual and structural decisions. | Keep; repair the relocated plugin-category link. |
| `.agents/skills/wiki-cli/SKILL.md` | Make the canonical wiki skill discoverable to Codex. | Compatibility shim. | Keep. |
| `.agents/skills/prepare-change-space/SKILL.md` | Make change-space preparation discoverable to Codex. | Compatibility shim. | Keep. |
| `.agents/skills/reconcile-app-releases/SKILL.md` | Make release reconciliation discoverable to Codex. | Compatibility shim. | Keep. |
| `.claude/skills/wiki-cli/SKILL.md` | Teach agents the CLI invocation, queries, moves, and gate. | Canonical wiki mechanics. | Keep. |
| `.claude/skills/prepare-change-space/SKILL.md` | Define preparation of an authorized development space. | Git and release-checkpoint preparation. | Keep; not invoked by this audit. |
| `.claude/skills/reconcile-app-releases/SKILL.md` | Define owner-grounded reconciliation of a release interval. | Canonical release workflow. | Keep; repair the supported-chain path. |
| `.claude/skills/reconcile-app-releases/references/release-ledger.md` | Supply the temporary format for a complete release disposition. | Release-skill template, not a second release checkpoint. | Keep; repair the supported-chain path. |

## Transient task class and handoff

Task paths are plain text here so the backlog remains their only inbound navigation. Each task has a finite outcome and one board row in the section for its next actor. None needs a product-page type or an area home.

| Baseline path | Purpose / unique outcome | Disposition and next actor |
| --- | --- | --- |
| `tasks/audit-page-purpose-and-repository-topology.md` | Settle page roles and apply repository topology. | Retire after this inventory, log close-out, and board update. |
| `tasks/audit-section-fit-and-location.md` | Test each durable page's sections against the settled role. | Keep; trigger met, `ready`, `agent`. Consume this inventory and the updated crosswalk. |
| `review-next-foundational-drafts` (retired) | Completed owner review of eight foundational pages after Optimistic governance transferred to the safeguards review. | Completed and retired on 2026-09-15; the seven remaining draft markers were cleared and Safe was already reviewed. |
| `tasks/review-remaining-drafts.md` | Complete the remaining review against the live draft query. | Keep, `blocked`, `none`; section audit remains the prerequisite. |
| `tasks/run-the-first-post-review-consistency-sweep.md` | Consolidate terminology and source-style corrections after the review cycle. | Keep, `blocked`, `none`; review-cycle completion remains the prerequisite. |
| `tasks/rethink-the-guide-layer.md` | Settle the guide portfolio around a stable capability surface. | Keep, `blocked`, `none`; the nearly complete first version remains the prerequisite. |

There is no unresolved owner classification decision or new documentation evidence gap from this pass. The subsequent [section audit](./section-fit-and-location.md) completed that macro-structure work, including redundant detail in design, stage, and authorization pages. The task table above retains the purpose-audit handoff snapshot; the backlog owns current task state. Guide selection and correction-driven terminology/source-style work retain their existing tasks.

## Validation

The final graph has no broken links or orphans. All 104 canonical entries and indexes are reachable from the root without traversing maintenance, task, log, or planning records. The 152 platform inventory rows and 189 upstream rows match the indexed classes exactly; tracked and newly added Markdown accounting also reconciles. Every live task has only its one backlog backlink and sits in the correct actor section. The board mirrors all 86 drafts and all 25 opportunities, with the latter grouped by their final areas.

The source-link check passes on 128 product/opportunity entries. All eight existing supported-chain tests pass, and the relocated extractor's app 1.39.0 check reports no generated-content drift. The composite wiki check reports only the expected nested protocol-root frontmatter advisory. Git whitespace checks pass, the upstream submodule and release checkpoint are unchanged, and the owner-requested independent Git review found the branch current and no unrelated local edits. No runtime behavior or deployment was tested by this topology pass.

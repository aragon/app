---
type: reference
title: Draft review priorities after the semantic-anchor review
tags: [maintenance, cross-cutting]
source: product-owner review-prioritization request (2026-09-11) + composite Wiki CLI inventory and backlinks at platform-doc@5cb67e3738f90e669b5300415012e1fc0f5845e6 + Safe connection verification at app@adad67873c8f9dd75e3ed340b70df3e985ae3557 and locked connector packages (2026-09-13, see log.md)
---

# Draft review priorities after the semantic-anchor review

The original bounded owner review selected eight extensions of the already reviewed account, plugin, process, body, action, and proposal model. The inventory contained **76 drafts** when this snapshot was taken on 2026-09-11; [Aragon OSx and the platform](../../osx-and-the-platform.md), added the same day, is outside this assessment. This assessment selects review work; it does not approve those drafts or verify their product claims against code.

**2026-09-15 close-out:** Contract upgrades was added as the ninth page, and the Staged proposals merger substituted Proposal in the cohort. The owner subsequently transferred Optimistic governance to `review-governance-safeguards-page-boundaries` and authorized completion of the remaining eight-page review. Plugin compatibility, Aragon-deployed plugins, Contract upgrades, Target, Safe, Stage, Proposal, and Proposal status are reviewed. The close-out is recorded in [log.md](./log.md); `review-next-foundational-drafts` is retired. The selection tables and counts below preserve the original eight-page assessment.

The [purpose and topology audit](./page-purpose-and-topology.md) has since settled page filing and the inherited pattern types. Links below follow those final homes; graph counts and type columns remain the dated review-selection snapshot. The [section audit](./section-fit-and-location.md) is now complete; the broader remaining review is ready for the owner.

## Completed review check

The 2026-09-10 close-out in [log.md](./log.md) records nine semantic anchors plus the Member companion. At this assessment's 2026-09-11 snapshot, all ten had no `status: draft` and were absent from the backlog's draft inventory. Later substantive changes return affected pages to draft; the live query and backlog carry current state. No status repair was needed at that snapshot:

- [Value proposition](../../value-proposition.md)
- [Platform design principles](../design/principles.md)
- [Account](../../accounts/account.md)
- [Plugin](../../governance/plugin.md)
- [Governance process](../../governance/process.md)
- [Body](../../governance/body.md)
- [Action](../../governance/action.md)
- [Proposal](../../governance/proposal.md)
- [Action builder](../../application/action-builder.md)
- [Member](../../governance/member.md)

## Method

1. **Establish eligibility.** Take the composite root's `wiki --root . list --where status=draft --format json` as the complete candidate set. Check completed review history before treating a page as new owner work. Read the current page and existing tasks before choosing it.
2. **Measure distinct referring pages.** For every draft, run `wiki --root . backlinks /path.md --format json`. Count each distinct referring page once, ignoring self-links and repeated links or anchors from the same page. The referring set is indexed platform entries of type `concept`, `capability`, `pattern`, `principle`, `reference`, `guide`, `risk`, or `example`. Exclude `protocol-doc/`, `maintenance/`, `repositories.md`, `product-scope-exclusions.md`, and `app-release-state.md`; tasks, opportunities, boards, logs, operating files, and typeless indexes are also outside that set. There are 92 eligible referring pages at this snapshot. This removes navigation and documentation activity from the count while retaining product and internal-design dependencies.
3. **Check breadth and connection to the reviewed core.** Count distinct top-level source areas, treating root pages as one General area, and count referring pages among the ten reviewed anchors. These are evidence of reuse, not traffic estimates or proof that a link expresses a strict prerequisite.
4. **Judge conceptual and behavioral consequence.** Prefer definitions or rules reused by other pages, especially execution identity, authorization, stage timing, status, and support boundaries. Read lower-degree pages too: Target has four referring pages but resolves a consequential distinction used by three reviewed anchors. A guide with zero counted backlinks can still be important to users.
5. **Account for likely rework.** Inspect task backlinks and the known OSx contextual edits. Select a finite, coherent cohort whose product meaning can be reviewed now. Keep source verification, unfinished edits, and existing questions with their current tasks. Put foundational semantics before dependent workflows and presentation. Do not infer missing decision provenance or ask the owner to establish facts already recorded in the base.

There is no weighted score: the graph provides reproducible evidence, while the reading order reflects conceptual dependencies, consequence, and outstanding work. Recompute after substantive source or topology changes. Counts below are a dated snapshot, not a second live draft inventory; the backlog remains authoritative for current state.

## Original selection: eight pages

The cohort is ordered from plugin support and execution roles into staged-governance behavior. These are product concepts and one supporting reference; their meaning can be reviewed before the broader topology and section audits. Those audits still own filing, page boundaries, and section placement. A later material change returns an approved page to draft under the existing workflow.

| Read order | Page | Referring pages | Source areas | Reviewed anchors linking in | Review focus |
|---|---|---:|---:|---:|---|
| 1 | [Plugin compatibility](../../application/plugin-compatibility.md) | 5 | 3 | 2 | Recognition, supported flows, visibility, and update compatibility extend the reviewed Plugin definition. |
| 2 | [Aragon-deployed plugins](../../application/aragon-deployed-plugins.md) | 8 | 3 | 1 | The deployment and support boundary applies to Gauge, Capital Distributor, cross-chain execution, and veLocker. |
| 3 | [Target](../../governance/target.md) | 4 | 2 | 3 | Execution endpoint, action target, and caller identity determine how a process or body carries out a decision. |
| 4 | [Safe](../../accounts/safe.md) | 8 | 3 | 2 | The account, signer, permission-holder, and governing-body roles underpin the Safe integration pages. |
| 5 | [Stage](../../governance/stage.md) | 14 | 3 | 2 | Approval/veto roles, timing, and body thresholds define the unit on which staged governance depends. |
| 6 | [Staged proposals](../../governance/proposal.md#staged-proposals) | 16 | 4 | 4 | Advancement, reporting, and final execution connect individual stages into one proposal lifecycle. |
| 7 | [Proposal status](../../governance/proposal-status.md) | 6 | 4 | 3 | Derived status controls the meaning of accepted, advanceable, executable, and expired across process types. |
| 8 | [Optimistic governance](../../governance/optimistic-governance.md) | 8 | 4 | 1 | Veto windows, deliberate advancement, and monitoring responsibility underpin optimistic and guardian configurations. |

Stage’s mixed-stage presentation question was resolved by source verification on 2026-09-13; the [classification audit](./product-knowledge-audit.md#verified-source-dispositions) records the controls and their limits. The foundational review still owns the page’s overall product review. Source verification does not approve Stage or the other seven drafts.

## Other highly connected drafts

| Page or group | Why it matters | Why it follows this cohort |
|---|---|---|
| [Proposal creation](../../governance/proposal-creation.md) — 19 referring pages, six areas, five reviewed anchors | The most linked remaining draft; defines who can propose and the shared creation flow. | Existing tasks cover pending-transaction memory and validation behavior. Reconcile their outcomes before a whole-page review. |
| [Basic action views](../../application/basic-action-views.md) — 15 | Shared contract-call presentation and editing support. | `apply-osx-orientation-contextual-edits` has a known write to this page. Review the resulting page once that edit lands. |
| [Safe as a body](../../governance/safe-as-a-body.md) — 14; [Connecting a Safe](../../application/connecting-a-safe.md) — 9 | Apply the Safe and stage concepts to an actual governing participant. | Connection prerequisites were resolved by `verify-safe-app-connection-mechanism` on 2026-09-13: embedded Safe Apps messaging and standalone WalletConnect are separate routes. Review the resulting pages after the Safe and stage concepts; their draft states remain. |
| [Linked account](../../accounts/linked-account.md) — 11; [Transactions](../../treasury/transactions.md) — 8; [Assets](../../treasury/assets.md) — 5 | Cross-account identity and treasury interpretation affect several areas. | `verify-linked-account-data-views` resolved aggregation and default-view details on 2026-09-13; use its applied corrections and scoped category-filtering candidate when reviewing these drafts. |
| [Create transaction](../../treasury/create-transaction.md) — 11; [Execute on a linked account](../../accounts/executing-on-a-linked-account.md) — 7 | Execution eligibility and acting identity are consequential even with fewer references. | `verify-direct-and-linked-account-execution` resolved conditioned eligibility, direct filtering, and WalletConnect pairing on 2026-09-13. The log preserves the browser-session evidence limits; source verification does not approve these drafts. |
| [Admin flow](../../governance/admin-flow.md) — 11; [Account creation](../../accounts/account-creation.md) — 10 | Bootstrap and handover frame initial governance configuration. | Use the completed OSx contextual edits and Admin removal-alert findings when reviewing these pages; preserve the recorded recovery conditions and evidence limits. |
| [Gauge voting](../../governance/gauge-voting.md) — 11 | A substantial governance capability with its own participation model. | Configuration-refusal verification and delegation/display questions already have tasks. |
| [Explore page](../../application/explore-page.md) — 10; [Supported chains](../../application/supported-chains.md) — 8 | Widely referenced discovery and availability surfaces. | Good subsequent review candidates; they establish fewer shared governance definitions than this cohort. |
| [Control availability](../design/control-availability.md) — 8; [Collection pages](../../application/collection-pages.md) — 8; [Getting help](../../application/getting-help.md) — 9 | Broad reuse across interaction surfaces. | Review after the product concepts they present; the type and filing decisions from the product/internal split are now settled by the purpose audit. |
| [Harden token governance](../../guides/harden-token-governance-against-attacks.md) — zero counted referring pages | Security consequences make it significant despite its low graph degree; its index entry is deliberately excluded from the metric. | Review the framing after the staged, optimistic, and execution concepts are settled. The guide-layer task still owns portfolio changes. |

These are sequencing explanations, not new questions or new tasks. An existing task link is a signal to inspect its actual remaining work, not an automatic declaration that the whole page is blocked.

## Complete draft snapshot

All 76 drafts are listed once below, sorted by distinct referring pages, then source-area breadth, then path. This table is the audit trail for the original selection, not the current review order. “Cohort” identifies the original eight-page commission; Contract upgrades joined it under the scope update above.

| Draft page | Type | Referring pages | Source areas | Reviewed anchors linking in | Cohort |
|---|---|---:|---:|---:|---|
| [Proposal creation](../../governance/proposal-creation.md) | capability | 19 | 6 | 5 | — |
| [Staged proposals](../../governance/proposal.md#staged-proposals) | concept | 16 | 4 | 4 | Selected |
| [Basic action views](../../application/basic-action-views.md) | reference | 15 | 4 | 3 | — |
| [Safe as a body](../../governance/safe-as-a-body.md) | capability | 14 | 4 | 2 | — |
| [Stage](../../governance/stage.md) | concept | 14 | 3 | 2 | Selected |
| [Linked account](../../accounts/linked-account.md) | concept | 11 | 5 | 4 | — |
| [Create transaction](../../treasury/create-transaction.md) | capability | 11 | 5 | 2 | — |
| [Admin flow](../../governance/admin-flow.md) | concept | 11 | 4 | 1 | — |
| [Gauge voting](../../governance/gauge-voting.md) | capability | 11 | 3 | 2 | — |
| [Account creation](../../accounts/account-creation.md) | capability | 10 | 3 | 1 | — |
| [Explore page](../../application/explore-page.md) | capability | 10 | 3 | 0 | — |
| [Getting help](../../application/getting-help.md) | pattern | 9 | 6 | 0 | — |
| [Submitting a transaction](../../application/submitting-a-transaction.md) | pattern | 9 | 5 | 0 | — |
| [Connecting a Safe](../../application/connecting-a-safe.md) | capability | 9 | 4 | 0 | — |
| [Stages over direct permission grants](../../governance/multisig-gates.md#stages-over-direct-permission-grants) | decision | 9 | 4 | 1 | — |
| [Multisig gates](../../governance/multisig-gates.md) | concept | 9 | 2 | 0 | — |
| [Control availability](../design/control-availability.md) | pattern | 8 | 6 | 2 | — |
| [Collection pages](../../application/collection-pages.md) | pattern | 8 | 5 | 0 | — |
| [Transactions](../../treasury/transactions.md) | capability | 8 | 5 | 1 | — |
| [App CMS](../../application/app-cms.md) | reference | 8 | 4 | 3 | — |
| [Optimistic governance](../../governance/optimistic-governance.md) | concept | 8 | 4 | 1 | Selected |
| [Token panel](../../governance/token-panel.md) | capability | 8 | 4 | 2 | — |
| [Supported chains](../../application/supported-chains.md) | reference | 8 | 4 | 0 | — |
| [Safe](../../accounts/safe.md) | concept | 8 | 3 | 2 | Selected |
| [Aragon-deployed plugins](../../application/aragon-deployed-plugins.md) | concept | 8 | 3 | 1 | Selected |
| [Executing on a linked account](../../accounts/executing-on-a-linked-account.md) | capability | 7 | 4 | 1 | — |
| [veLocker](../../governance/velocker.md) | capability | 7 | 3 | 2 | — |
| [Permission Viewer](../../access-control/permission-viewer.md) | capability | 6 | 5 | 1 | — |
| [Full-screen wizard](../../application/wizard.md#full-screen-wizard) | pattern | 6 | 4 | 0 | — |
| [Proposal status](../../governance/proposal-status.md) | concept | 6 | 4 | 3 | Selected |
| [Refuse unsatisfiable configuration](../design/invariant-validation.md) | decision | 6 | 3 | 1 | — |
| [Plugin slots](../design/plugin-slots.md) | pattern | 6 | 3 | 2 | — |
| [Proposal identifiers](../../governance/proposal-identifiers.md) | concept | 6 | 2 | 1 | — |
| [Wizard](../../application/wizard.md) | pattern | 6 | 1 | 0 | — |
| [Abstract, then offer a drill-down](../design/principles/honest-abstraction.md#abstract-then-offer-a-drill-down) | pattern | 5 | 5 | 1 | — |
| [Honest abstraction](../design/principles/honest-abstraction.md) | principle | 5 | 4 | 2 | — |
| [Assets](../../treasury/assets.md) | capability | 5 | 4 | 0 | — |
| [ENS as the profile layer](../../application/aragon-profiles.md#ens-as-the-profile-layer) | decision | 5 | 3 | 0 | — |
| [Capital Distributor](../../treasury/capital-distributor.md) | capability | 5 | 3 | 1 | — |
| [Plugin compatibility](../../application/plugin-compatibility.md) | reference | 5 | 3 | 2 | Selected |
| [Choose between a Safe and an Aragon multisig](../../guides/safe-vs-aragon-multisig.md) | guide | 5 | 3 | 0 | — |
| [Cross-chain execution](../../governance/cross-chain-execution.md) | capability | 5 | 2 | 2 | — |
| [Choose a voting-power mechanism for token governance](../../guides/choose-token-voting-power-mechanism.md) | guide | 5 | 2 | 0 | — |
| [Dialog taxonomy](../design/dialog-taxonomy.md) | pattern | 5 | 1 | 0 | — |
| [Transaction submission stepper](../../application/submitting-a-transaction.md) | pattern | 5 | 1 | 0 | — |
| [Install admin plugin by default](../../governance/admin-flow.md#starting-with-admin) | decision | 4 | 3 | 0 | — |
| [Every element makes a claim](../design/principles/every-element-makes-a-claim.md) | principle | 4 | 3 | 1 | — |
| [Vault](../../treasury/vault.md) | concept | 4 | 3 | 0 | — |
| [Admin management](../../governance/admin-flow.md#admin-controls) | capability | 4 | 2 | 1 | — |
| [Aragon Profiles](../../application/aragon-profiles.md) | capability | 4 | 2 | 1 | — |
| [Delegate profile record](../../governance/delegate-profile-record.md) | reference | 4 | 2 | 1 | — |
| [Target](../../governance/target.md) | concept | 4 | 2 | 3 | Selected |
| [Alert severity](../design/alert-severity.md) | pattern | 4 | 1 | 0 | — |
| [DAO slots](../design/dao-slots.md) | pattern | 3 | 3 | 1 | — |
| [Source repositories](./repositories.md) | reference | 3 | 3 | 0 | — |
| [Address input](../../application/address-input.md) | pattern | 3 | 2 | 0 | — |
| [Linked-account signaling](../../accounts/linked-account.md#establishing-the-relationship) | concept | 3 | 2 | 0 | — |
| [Wallet connection](../../application/wallet-connection.md) | pattern | 3 | 2 | 0 | — |
| [Metadata input](../../application/metadata-input.md) | pattern | 3 | 2 | 2 | — |
| [Reach out when the abstraction cannot stay honest](../../application/getting-help.md#when-the-app-needs-the-aragon-team) | pattern | 3 | 2 | 2 | — |
| [Aragon Notifications](../../governance/aragon-notifications.md) | capability | 3 | 2 | 1 | — |
| [Add a multisig gate to an advanced governance process](../../guides/multisigs-in-advanced-governance.md) | guide | 3 | 2 | 0 | — |
| [Claiming an Aragon Name](../../application/aragon-names.md#claiming) | capability | 3 | 1 | 1 | — |
| [Linking does not imply control](../../accounts/linked-account.md#linking-does-not-imply-control) | decision | 3 | 1 | 0 | — |
| [Aragon Names](../../application/aragon-names.md) | capability | 2 | 2 | 1 | — |
| [Dashboard](../../accounts/dashboard.md) | capability | 2 | 2 | 0 | — |
| [Datalist page](../../application/collection-pages.md) | pattern | 2 | 2 | 0 | — |
| [Contract upgrades](../../accounts/contract-upgrades.md) | capability | 1 | 1 | 0 | — |
| [Address input](../../application/address-input.md) | pattern | 1 | 1 | 0 | — |
| [Preserve task context across dialogs](../design/dialog-continuity.md) | pattern | 1 | 1 | 0 | — |
| [Normalize input without changing its meaning](../design/input-normalization.md) | pattern | 1 | 1 | 0 | — |
| [Voting Terminal](../../governance/proposal.md#voting) | pattern | 1 | 1 | 1 | — |
| [Make user-supplied link destinations inspectable](../design/inspectable-link-destinations.md) | pattern | 0 | 0 | 0 | — |
| [Use primary actions sparingly](../design/primary-action-hierarchy.md) | pattern | 0 | 0 | 0 | — |
| [Show validation when it can help](../design/validation-timing.md) | pattern | 0 | 0 | 0 | — |
| [Harden token governance against governance attacks](../../guides/harden-token-governance-against-attacks.md) | guide | 0 | 0 | 0 | — |

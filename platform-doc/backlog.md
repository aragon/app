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
- **[Inventories](#inventories)** — the supporting lists (drafts, page questions, unwritten pages). Reference material, not the action flow.

Every row explains who acts next, what they do, and what it affects. **Ready for your input and Ready to run are not blocked sections:** their work is actionable now; only Not yet ready contains blocked work. Both actionable sections are deliberately ordered — the first row is the strongest next move for that actor — and there is no second priority scheme layered on top: position *is* the priority. Each item appears exactly once, in the section of whoever moves next.

The underlying state stays on the pages and entries, never here: a page awaiting review carries `status: draft` ([Inventories](#inventories) mirrors it), an open question is a `- [ ]` on the page it belongs to, and a task is an entry under `tasks/` that owns both `status` and `next_actor` — this board owns only the ordering and the reason. `status: ready` means the named actor can act now; `status: blocked` is reserved for work neither owner nor agent can move. The one exception is a **knowledge gap**: a topic no page can own yet, so it lives only here, as an input row, because only source material closes it. Candidate product improvements are kept separate on [Product opportunities](./product-opportunities.md), so capability pages do not read like support-gap inventories. Conventions: [WORKFLOW.md](./WORKFLOW.md).

## Ready for your input

Ordered by how much each unblocks.

1. **Review the nine semantic anchors** — **your review; ready now.** The terminology rulings are applied, so the cohort is stable: [Value proposition](./value-proposition.md), [Platform design principles](./principles.md), [Account](./accounts/account.md), [Plugin](./governance/plugin.md), [Governance process](./governance/process.md), [Body](./governance/body.md), [Action](./governance/action.md), [Proposal](./governance/proposal.md), and [Action builder](./governance/action-builder.md). Review their product meaning, defining vocabulary, scope, and relationships before the structural audits consume them as semantic input. The pass is done when every anchor is approved or corrected, consequential backlinks are reconciled, and each settled page no longer carries `status: draft`.

## Ready to run

1. **[Reconcile product releases since the 1.35 documentation pass](./tasks/reconcile-product-releases-since-1-35.md)** — **agent run; ready now.** Inventory every official app release after 1.35 through the newest release at run start, preserve the complete already-mined Permission Viewer launch disposition, and reconcile each product-facing change before the structural audits consume the graph.

## Not yet ready

Each row names the state that changes it. The review is deliberately staged so settled product meaning informs the structural audits, while pages those audits are likely to reshape wait until afterward.

- **[Audit every page's purpose and the repository topology](./tasks/audit-page-purpose-and-repository-topology.md)** — *blocked until the semantic-anchor review and reconcile-product-releases-since-1-35 are complete; the terminology review and Permission Viewer mining input are already complete.* The audit then states every page's purpose, tests the aggregate type and area taxonomy, applies supported split/merge/retype/refile decisions, and clarifies the opening of every retained platform page. A materially changed anchor returns to draft status rather than silently losing its approved meaning.
- **[Audit every section against its page's purpose](./tasks/audit-section-fit-and-location.md)** — *blocked until audit-page-purpose-and-repository-topology is complete and its structural decisions and owner calls have settled.* It then tests every section at macro level against the page's stated intent, moves or consolidates mislocated material, and removes structural redundancy before the remaining-draft review.
- **Review the remaining drafts.** *Blocked until audit-section-fit-and-location is complete.* Review whatever `wiki --root . list --where status=draft` returns at that point, including pages created or split by the audits and any previously approved anchor the audits substantively changed. This is a live query, not a frozen "65 pages" promise; the pass is done when the query is empty.
- **[Run the first post-review consistency sweep](./tasks/run-the-first-post-review-consistency-sweep.md)** — *blocked until the drafts inventory is empty, or you declare the first review cycle done.* One aggregate pass over the cycle's corrections: terminology drift between pages that never linked to each other, `source:` style, and the declared-but-unused `risk`/`example` type call. Structurally last — every row in *Ready to run* adds drafts.
- **[Rethink the guide layer around platform use cases](./tasks/rethink-the-guide-layer.md)** — *blocked until v1 of the base is nearly complete.* A guide portfolio can only be derived from a stable capability and user-outcome surface, and the remaining Ready-to-run work is still moving it; inventorying user journeys now would be inventorying a moving target. It already carries three named candidates (a guardian-DAO setup guide — guardian DAOs being decentralized autonomous organizations governed by liquidity-provider tokens — composing proposal actions through an external dApp with WalletConnect, and the disposition of the existing multisig-gate guide).

## Inventories

Supporting lists, kept discoverable rather than in the action flow. Each mirrors state the graph owns — reconcile against the query, never hand-maintain a second copy.

### Drafts awaiting review

`wiki --root . list --where status=draft` is authoritative — currently the 75 pages below, and nothing else. The owner's private `research/` workspace is deliberately outside both the index and this board, so its material never appears here whatever status it carries.

The owner review runs in two passes. The fixed nine-page semantic-anchor cohort is reviewed first, before the structural audits. Seven of those pages own shared concepts and sit unusually high in a filtered graph of distinct durable platform dependants; [Value proposition](./value-proposition.md) and [Platform design principles](./principles.md) are included because they supply the audit's product intent and governing rules, which inbound-link counts understate. Together, the nine anchors are directly depended on by 47 of the other 66 current drafts.

After both audits, the remaining review follows the authoritative draft query. It therefore includes pages created, split, or substantively changed by the audits rather than assuming the later workload is permanently "75 minus nine." The full current inventory remains below until the two passes retire pages from draft status.

**Governance** — [Governance process](./governance/process.md), [Body](./governance/body.md), [Plugin](./governance/plugin.md), [Target](./governance/target.md), [Optimistic governance](./governance/optimistic-governance.md), [Token panel](./governance/token-panel.md), [veLocker](./governance/velocker.md), [Gauge voting](./governance/gauge-voting.md), [Capital Distributor](./governance/capital-distributor.md), [Delegate profile record](./governance/delegate-profile-record.md), [Proposal](./governance/proposal.md), [Proposal status](./governance/proposal-status.md), [Proposal identifiers](./governance/proposal-identifiers.md), [Proposal creation](./governance/proposal-creation.md), [Staged proposals](./governance/staged-proposals.md), [Stage](./governance/stage.md), [Multisig gates](./governance/multisig-gates.md), [Safe as a body](./governance/safe-as-a-body.md), [Stages over direct permission grants](./governance/stages-over-direct-permissions.md), [Action](./governance/action.md), [Action builder](./governance/action-builder.md).

**Accounts** — [Account](./accounts/account.md), [Safe](./accounts/safe.md), [Dashboard](./accounts/dashboard.md), [Aragon Names](./accounts/aragon-names.md), [ENS as the profile layer](./accounts/ens-as-the-profile-layer.md), [Claiming an Aragon Name](./accounts/claiming-an-aragon-eth-name.md), [Aragon Profiles](./accounts/aragon-profiles.md), [Account creation](./accounts/account-creation.md), [Explore page](./accounts/explore-page.md), [Admin flow](./accounts/admin-flow.md), [Admin management](./accounts/admin-management.md), [Contract upgrades](./accounts/contract-upgrades.md), [Install admin plugin by default](./accounts/admin-plugin-by-default.md), [Connecting a Safe](./accounts/connecting-a-safe.md), [Linked account](./accounts/linked-account.md), [Linked-account signaling](./accounts/linked-account-signaling.md), [Linking does not imply control](./accounts/linking-does-not-imply-control.md), [Executing on a linked account](./accounts/executing-on-a-linked-account.md).

**Treasury** — [Vault](./treasury/vault.md), [Assets](./treasury/assets.md), [Transactions](./treasury/transactions.md), [Create transaction](./treasury/create-transaction.md).

**Access control** — [Permission Viewer](./access-control/permission-viewer.md).

**Design** — [Every element makes a claim](./design/every-element-makes-a-claim.md), [Control availability](./design/control-availability.md), [Refuse unsatisfiable configuration](./design/invariant-validation.md), [Normalize input without changing its meaning](./design/input-normalization.md), [Show validation when it can help](./design/validation-timing.md), [Address input](./design/address-input.md), [Wizard](./design/wizard.md), [Metadata input](./design/metadata-input.md), [Full-screen wizard](./design/full-screen-wizard.md), [Transaction submission stepper](./design/transaction-submission.md), [Dialog taxonomy](./design/dialog-taxonomy.md), [Preserve task context across dialogs](./design/dialog-continuity.md), [Make user-supplied link destinations inspectable](./design/inspectable-link-destinations.md), [Use primary actions sparingly](./design/primary-action-hierarchy.md), [Datalist page](./design/datalist-page.md), [Abstract, then offer a drill-down](./design/abstract-then-drill-down.md), [Reach out when the abstraction cannot stay honest](./design/reach-out-to-the-team.md), [Plugin slots](./design/plugin-slots.md), [DAO slots](./design/dao-slots.md), [Voting Terminal](./design/voting-terminal.md), [Alert severity](./design/alert-severity.md).

**General** — [Platform design principles](./principles.md), [Honest abstraction](./principles/honest-abstraction.md), [Value proposition](./value-proposition.md), [Partially supported plugins](./partially-supported-plugins.md), [App CMS](./app-cms.md), [Source repositories](./repositories.md).

**Guides** — [Choose between a Safe and an Aragon multisig](./guides/safe-vs-aragon-multisig.md), [Choose a voting-power mechanism for token governance](./guides/choose-token-voting-power-mechanism.md) (re-drafted for the participation-denominator addition), [Add a multisig gate to an advanced governance process](./guides/multisigs-in-advanced-governance.md), [Harden token governance against governance attacks](./guides/harden-token-governance-against-attacks.md) (synthesis of existing pages — review for framing, not new facts).

### Open questions on pages

Each lives on the page it belongs to, under `## Open questions`. `wiki --root . checkboxes` is the aggregate — read it minus the read-only `protocol-doc/` subtree, whose checklists are upstream procedural steps rather than questions. Currently 19 open across 16 platform pages (the base-wide count of 36 includes 17 upstream checklist steps). The ones that block most are promoted into *Ready for your input* above; the rest are answered as their pages come up for review.

### Unwritten pages (promised by links)

`wiki --root . unresolved` is authoritative; currently none.

### Product scope exclusions

[Product scope exclusions](./product-scope-exclusions.md) is the source of truth for implemented source surfaces deliberately left out of current product documentation until they are live. Its **Product opportunity** column links any distinct candidate improvement without turning the exclusion itself into a roadmap item.

---
name: reconcile-app-releases
description: Reconcile an interval of official aragon/app releases into platform documentation using owner context and tagged code. Use for release-documentation passes; require owner context for each release.
---

# Process and reconcile app release notes

Turn a rough business-context dump plus official release evidence into documented product truth across the whole graph. The owner explains product intent first; tagged code then tests, sharpens, and bounds that account. Neither release-note wording nor code presence alone proves that a surface is live.

After the owner input exists, treat this as a one-shot workflow: preserve it, normalize it, mine the graph, audit application reality, update every genuinely affected surface, place all remaining questions and tasks, and close the release interval. Do not stop for non-blocking clarifications that can be recorded in the right place.

## Required owner input

A messy brain dump is valid input; do not make the owner rewrite it into a template. The pass requires business context for every release in the interval: what the release was trying to change, why it matters, who it is for, what is live or intentionally limited, and any known caveats or non-product work. Missing details may remain explicit unknowns, but a GitHub changelog by itself is not the starting signal. GitHub notes alone may identify the interval and seed one consolidated, release-specific briefing request; they do not authorize code mining or canonical page updates.

If one or more releases lack that context, do not mine the releases or update canonical pages. Create or reuse the one interval task with `status: ready`, `next_actor: owner`, and `input_state: awaiting-owner-briefing`; put its single board row under **Ready for your input** and ask for one free-form dump covering the missing releases. This is actionable owner work, not `status: blocked`. When the briefing arrives, preserve it, set `input_state: ready-for-agent`, change `next_actor` to `agent`, and move the same row to **Ready to run**. Do not create a second task for the agent phase.

If the owner supplies the brain dump in the current request, capture it and continue immediately through the full workflow.

## Preflight and interval

1. Load the `wiki-cli` skill for graph operations and entry edits. Follow `WORKFLOW.md` for source handling and task state; apply the relevant voice guidance and preflight when writing product prose.
2. Read [App release documentation state](../../../internal/maintenance/app-release-state.md), [Source repositories](../../../internal/maintenance/repositories.md), the release task, and its backlog row.
3. Query the official `aragon/app` GitHub Releases ledger. Use published, non-draft, non-prerelease releases with tags matching `@aragon/app@<semver>`.
4. Lock the task interval as `(documented_through, observed_latest]`. Record every included tag, publication date, and exact tagged commit before mining. Do not silently widen it if another release appears during the pass.
5. Confirm that the preserved owner briefing covers every included release. If not, follow **Required owner input** and stop before canonical mutations.

## Normalize without losing meaning

Capture a direct owner briefing in `inbox/` as readable source material, preserving every claim, caveat, and uncertainty without adding interpretation, as [the inbox policy](../../../WORKFLOW.md#the-inbox) requires. Keep repository-derived extraction in `raw/`. When building the interval's temporary structured ledger in `raw/`, read [the release ledger and coverage format](references/release-ledger.md). Keep three evidence lanes visibly separate:

- **Owner context:** intent, audience, outcome, live boundary, rollout, and caveats.
- **Official release evidence:** tag, publication date, exact tagged commit, original note, and linked pull request or commit.
- **Code evidence:** observations from the immutable tag and its release-era dependencies and services, clearly distinguished from inference.

Split compound notes into atomic, stable claim IDs without dropping qualifications. Include the user-visible change, why it matters, affected area, availability or scope, unresolved ambiguity, evidence still needed, and provisional disposition. Add code-only findings as their own items so they cannot disappear merely because GitHub omitted them.

The ledger is a completeness and traceability device, not a canonical product page. Retire processed inbox and temporary material under the repository workflow only after every owner claim, official note, and code-only finding has a final disposition and its provenance is recorded. Retain unprocessed material.

## Mine the full graph before writing

Build the ledger's coverage matrix before editing canonical prose. For each atomic claim:

1. Search the composite base with terms that identify the affected behavior, including release wording, product vocabulary, UI labels, or implementation names as useful.
2. Read relevant candidate pages and use links and backlinks to find dependants. Include affected area indexes, neighboring concepts, guides, design patterns, tasks, product opportunities, product-scope exclusions, and pinned `protocol-doc/` evidence. Reuse searches and source reads across claims when they cover the same surfaces.
3. Name one canonical owning page, then list every dependent surface that restates the affected rule, exposes the workflow or navigation, relies on the vocabulary, or needs the relationship to remain discoverable.
4. Prefer an existing page whenever it can own the concept without losing focus. Create a new page only when the release establishes a distinct, durable product concept with a stable home and existing pages would otherwise conflate separate things.
5. Add links where they communicate a real semantic or navigational relationship. Be expansive about finding affected pages, not indiscriminate about link insertion: a link should help a reader follow meaning, not merely prove that a sweep occurred.
6. Apply the [product-content boundary](../../../WORKFLOW.md#product-content-and-documentation-operations) and voice rule `V-R018`: publish supported product behavior and useful links; route provenance, authoring history, and unfinished work to their defined homes. A coverage matrix or page-purpose note is working material, not an article opening.

The coverage matrix is the anti-omission control. Every item names the pages and dependants checked, even when the final action is “existing coverage is accurate” or “no documentation change.”

## Reconcile application reality

For every release, diff its immutable `aragon/app` tag against the preceding release and inspect the product paths behind every ledger item. Follow the dependency and service boundary far enough to understand the actual user path, conditions, fallbacks, failure states, persistence, flags, configured instances, and rollout evidence:

- inspect the exact `gov-ui-kit` version locked by that app tag, not whichever version a local checkout currently holds;
- inspect relevant release-era `app-backend`, App CMS, contract, or integration sources;
- pin every version-sensitive claim to a tag or commit and identify any missing matching release or deployment evidence;
- never substitute a repository's current default branch for release-era evidence without explicitly qualifying the inference.

Reconcile each code finding back into the structured ledger and coverage matrix. Code may confirm the owner account, add important operating detail, reveal edge cases, show that a release note overstates behavior, or surface an undocumented change. Apply findings that change product understanding, availability, or reader decisions. A code-only detail with no such consequence receives a reasoned “no documentation change” disposition; the ledger's completeness must not become a requirement to publish every observation. Follow the [product-content boundary](../../../WORKFLOW.md#product-content-and-documentation-operations) when turning evidence into prose.

Code presence, feature flags, configured addresses, endpoints, or indexed events do not by themselves establish publication. An owner statement that a surface is live crosses that boundary; checked-in flags that appear disabled then become deployment evidence to qualify or question, not grounds to silently overrule the owner. If code suggests a surface that the owner has not confirmed as live, route the publication decision to a finite owner task rather than writing it as canonical product truth.

### Refresh supported chains

For **every release in the briefed interval**, check the chain inventory even when the release notes mention no network change. The owner's supported-chain commission authorizes deriving official platform support from the released `networkDefinitions.ts`; it does not authorize publishing unreleased `main` changes. Run this check only during release mining/reconciliation (plus the initial inventory bootstrap), never as a side effect of wiki queries, unrelated edits, or change-space preparation. Keep the existing owner-context prerequisite for starting a release interval.

Use [the supported-chain extractor](scripts/supported-chains.mjs) from the platform-doc root. It reads immutable tags through Git without switching the app checkout, uses the exact `viem` version locked by that tag, and updates only the generated table and `chain_source`, `chain_release`, and `chain_viem` metadata in [Supported chains](../../../application/supported-chains.md). Reader prose, review status, and other provenance remain authored.

```powershell
# Preview this release against its immediate predecessor; retain the JSON in the working ledger.
node .claude/skills/reconcile-app-releases/scripts/supported-chains.mjs --app ../app --release '@aragon/app@<version>' --previous '@aragon/app@<previous-version>'
# After reconciling the result, update the actual reference, then check it.
node .claude/skills/reconcile-app-releases/scripts/supported-chains.mjs --app ../app --release '@aragon/app@<version>' --write
node .claude/skills/reconcile-app-releases/scripts/supported-chains.mjs --app ../app --release '@aragon/app@<version>' --check
```

Prerequisites: Node.js 22+, Git, local release tags, and the app's installed development dependencies (`typescript` and `yaml` resolvable from `apps/app`). The helper searches the app's installed packages and pnpm store for the exact locked `viem`, including older versions. If missing, install that version in an isolated temporary directory with `npm install --prefix <directory> --ignore-scripts viem@<locked-version>` and pass `--viem-dir <directory>/node_modules/viem`; do not update the working app's dependencies. A missing tag, dependency, unfamiliar source expression, invalid row, or malformed generated block stops the helper without changing the reference. Inspect and adapt the extraction when the source format changes; never substitute a newer installed dependency or a remembered list. `--check` exits 1 for page drift; source/schema errors exit 2.

The support set is the keys of `networkDefinitions`, also used by `networkUtils.getSupportedNetworks()`. Imported chain IDs, testnet flags, and explorer links come from locked `viem/chains`; app overrides win. A `disabled` flag disables account creation without removing the chain from the platform inventory, `beta` qualifies creation availability, and `tenderlySupport` independently controls simulation. Inspect release diffs for `shared/utils/networkUtils/networkUtils.ts`, `modules/createDao/components/createDaoForm/createDaoFormNetwork/createDaoFormNetwork.tsx`, and simulation consumers; if these selection semantics change, reconcile the helper and explanations before accepting its rows.

Record `<version>-chains` in the ledger with exact app commit, locked `viem`, and additions, removals, or changes (including names, IDs, classification, availability, and explorers), or explicit **no chain-data change**. A new source release can update provenance even when rows are unchanged. Follow the reference's backlinks and search for superseded claims across Account creation, Explore, simulation, cross-chain execution, and guides. Preserve account-specific route and feature limits. Process releases in order and leave the Markdown reference at the interval's final tag. Do not advance the documentation checkpoint while extraction or reference validation is incomplete.

## Give every release item one explicit disposition

Choose one primary disposition and record the reason:

- existing canonical coverage is accurate;
- update an existing canonical page;
- create a new draft page and link it into its area;
- create or update a distinct product opportunity;
- record a product-scope exclusion, but only with an owner ruling that the implemented surface is not live;
- create or reuse a finite owner or agent task for any unresolved documentation question, verification, decision, or other unfinished work, with links to the affected pages;
- no documentation change, with a concrete reason such as internal refactoring, dependency maintenance, or a regression repair that creates no new product promise.

When writing:

- Check every affected page named by the coverage matrix for contradictions. Put the full explanation in its canonical home; update dependants only where their own claims or useful navigation change. Checking a page does not require adding the same caveat to it.
- Give a new page one existing type and one stable home, mark reader-facing product content `status: draft`, provide a source boundary, link it from its area's navigation and related concepts, and add it to the live drafts inventory. Never create a page merely because a release note has a heading.
- Re-run backlinks after substantive edits and search for superseded language so dependants do not retain the old rule.

### Put unresolved work in the right place

- Put every unresolved documentation question in a finite task, including a question about one existing page. Preserve the missing answer, known evidence, and affected-page links there; keep any material factual limit in the product explanation. Follow WORKFLOW.md for grouping and actor selection, and do not add a page checkbox or a second copy of the question.
- Use an owner task for an answer, review, publication ruling, or source handoff the owner can provide. A question about whether a surface is live remains a task even when code for that surface exists; do not publish a speculative capability page.
- Use an agent task for bounded executable follow-up when sources are already available. Tasks carry `status`, `next_actor`, present-tense work, evidence, and `## Done when`, contain no checklist items or `## Open questions`, and have exactly one backlog row under the actor who can move.
- Reserve the term **knowledge gap** for missing structural understanding that prevents a topic's pages from being written; page-local questions still have task homes. Record a product opportunity when the finding is a possible improvement, missing UX, or suspected live-feature defect rather than an unknown about current truth.

Questions assigned to concrete tasks are valid final dispositions; they do not prevent the rest of a one-shot pass from completing. Merge only work with the same outcome and source set, and follow the rule that only the board links into tasks.

## Reconcile the graph and close the interval

1. Verify that every owner claim, official note, code-only finding, and per-release supported-chain check has a final disposition and that every coverage-matrix surface was checked. Confirm the supported-chain reference passes the extractor's `--check` against the interval's final tag. Resolve any duplicate page or overlapping-task decision explicitly.
2. Reconcile all affected area indexes, cross-links, opportunity inventory, task entries, live draft inventory, and the backlog. Run the voice preflight on every added or changed product paragraph, including the editorial-narration check; graph checks alone cannot validate it. Recompute task ownership and inventory queries rather than copying stale numbers.
3. Add a dated `internal/maintenance/log.md` entry with the interval, evidence boundary, release-by-release dispositions, code divergences, remaining questions or owner calls, retired temporary material, and an explicit **Board delta**.
4. Recheck the official release ledger. On a successful check, refresh the latest-official fields and `last_checked` even when the release is unchanged. Keep the completed interval fixed; if a newer release now exists, create or reuse its owner-briefing task rather than silently widening this pass.
5. After every included item is dispositioned and the gates pass, advance `documented_through` and `documented_through_commit` in `internal/maintenance/app-release-state.md`. “Documented through” means every release item is reflected, excluded, or explicitly routed to an opportunity or finite task; it does not claim that every owner question is already answered. Keep the human-readable table and current/behind statement consistent with frontmatter.
6. Close a finite reconciliation task only after its result is logged: remove its backlog row and retire its task entry. Temporary extraction material should be empty or explicitly retained with a reason.

Run the composite close-out from the repository root:

```powershell
wiki --root . check
wiki --root . unresolved
wiki --root . orphans
wiki --root . tidy
git diff --check
git submodule status protocol-doc
git -C protocol-doc status --short
```

Leave the batch uncommitted for owner review. Do not advance the documented-through marker if an interval item lacks a disposition, an affected graph surface was not checked, or a required gate remains incomplete.

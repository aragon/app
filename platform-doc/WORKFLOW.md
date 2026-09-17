# How these docs work

This is the **workflow** layer for the Aragon platform product docs: the conventions on top of what [AGENTS.md](./AGENTS.md) and the `wiki` tool define. [voice.md](./voice.md) is the narrower prose layer: it governs how reader-facing platform content is written after this file has settled what the content is, where it belongs, and how it moves through review.

**Invoke the `wiki-cli` skill before your first `wiki` command, and before creating, editing, moving, or deleting any entry.** It carries the CLI mechanics this file assumes: the composite-root invocation, the query palette with verified flags, the `wiki check` gate, how to translate the POSIX recipes for this machine's shell, and the capture-only fallback when the CLI is missing. This file stays the *policy* layer — what the conventions are and why; the skill is *how to operate the tool* without stranding a link or checking the wrong root.

Before adding or changing reader-facing prose, consult the active [voice policy](./voice.md) using its reading guidance and apply its preflight, including for small edits. Skip it for read-only questions, graph operations, path-only changes, and maintenance edits whose wording is already prescribed here.

## What this base is (and is not)

One product: the **Aragon platform**, the full-stack application for governing treasuries and protocols on EVM chains, built on the Aragon OSx protocol. This base documents the **business logic and semantic layer** — product concepts, rules, and design principles that don't exist verbatim in the contracts — so platform features (and the coding agents building them) stay consistent, coherent, and scalable.

**The dependency direction and scope boundary are hard:** [protocol-doc](./protocol-doc/index.md) is the pinned upstream protocol knowledge base, included here as the `protocol-doc/` git submodule; **platform-doc extends protocol-doc**. Protocol mechanics live upstream and are never restated here. If a fact is true of the contracts verbatim, it belongs there; if it is a product abstraction, rule, or principle, it belongs here. Platform pages link to the upstream mechanism and add the product meaning on top.

**Keep the three layers distinct:** *protocol mechanism → product capability → interaction pattern*. Each has its own vocabulary and questions: protocol docs define mechanisms, this base defines product meaning and capability, and design patterns define how that meaning is presented. A clean correspondence between layers is useful when it exists, but no layer is required to mirror another or smuggle in its concerns.

**A distinction in explanation does not require a second page.** Keep a topic's behavior, rationale, interaction rules, and lifecycle together when they describe the same thing. A separate design page must contribute a reusable choice across different topics, not summarize another page's behavior under “Design rules.” After merging sections, test whether each former page still owns independent knowledge; preserve unique claims, examples, limits, and provenance before retiring duplicates.

Shared interaction behavior belongs under `application/` even when its type is `pattern` or it carries a `design` tag. A separate builder page earns its place by explaining a reusable choice: [Alerts and advisories](./application/alerts.md) explains notices people encounter, while [Alert severity](./internal/design/alert-severity.md) explains how to choose severity, placement, and interruption. Make that distinction clear in the titles, openings, and links. Do not duplicate a feature's behavior under a second design heading.

**File by the subject that owns the rule.** Accounts holds account entities, creation, upgrades, account-specific views, and relationships. Governance holds processes, bodies, proposals, participation, and the installation or removal of governance authority, including temporary Admin governance. Application holds shared app identity, discovery, address handling, action composition and inspection, transaction submission, support, and delivery configuration. A flow's entry point or the presence of a governance transaction does not alone determine its folder. File opportunities under `internal/product-opportunities/`; use tags and links to identify the product areas they would improve.

**Cross-bundle referencing convention:** link to protocol entries through the local submodule with a relative Markdown link — `./protocol-doc/core/dao.md` from a root page, `../protocol-doc/core/dao.md` from an area page. A branch-floating GitHub `blob/main` URL is external to `wiki`, so it cannot be target-, anchor-, or backlink-checked and is not an entry link. The [OSx protocol reference](./osx-and-the-platform.md#protocol-reference) pairs local entry links with shareable GitHub counterparts; those external links supplement the graph and require separate verification. Exact upstream commit URLs in wiki entries are reserved for snapshot metadata such as the [protocol pin](./internal/maintenance/index.md#protocol-snapshot). [External answer links](#links-in-answers-outside-the-checkout) may use the pinned revision to cite exactly what was read.

**Source material:** the `../app` (frontend) and `../app-backend` repos, the `../osx` contracts, and briefings from the product owner. The older `../aragon-knowledge-base` bundle's first slice (2026-07-06) has been mined into this base (entries carry `source:` fields pointing back into it; passes are recorded in [log.md](./internal/maintenance/log.md)); its protocol/mechanism pages stay in protocol-doc, and its base-internal ontology is not carried over.

**The shape:** product knowledge lives in `accounts/`, `governance/`, `treasury/`, `access-control/`, `application/`, and `guides/`, with the [OSx orientation](./osx-and-the-platform.md) and [value proposition](./value-proposition.md) at the root. [Internal documentation](./internal/index.md) holds design guidance and principles, documentation operations and tasks, and temporary product opportunities. Add areas as real clusters appear.

This is **wiki-first product documentation**, in two layers:

- **Concepts, the graph.** Atomic `concept`, `reference`, and `example` entries, one idea per page, richly linked to each other. This is the substance, consumed *non-linearly*: you land on a page and follow links (`wiki links` / `backlinks`) to related ones.
- **Guides, the how-to layer.** `guide` entries help someone accomplish a concrete task in the Aragon platform when they do not yet know how. They start from the user's goal, walk through the decisions and actions in order, and **link into** concepts when deeper explanation is useful.

The concepts are the source of truth; guides apply them to user outcomes. Orientation for people reading or maintaining this knowledge base belongs in the root [index](./index.md) and the operating docs, not in a guide.

Product opportunities form a temporary planning collection under `internal/product-opportunities/`, gathered on its authored backlog. They link to canonical product context; verified shipped outcomes are folded into the relevant product pages.

## Voice: reader-facing prose

The active [voice policy](./voice.md) applies to canonical platform entries, guides, reader-facing indexes, and product-opportunity prose. It is an operating document rather than a wiki entry: `wiki.toml` ignores it, so its policy status, references, and preflight checklist do not enter the product graph, canonical draft inventory, orphan report, or owner-question aggregate.

The responsibility order is deliberate: [AGENTS.md](./AGENTS.md) governs the graph and safe operation; this file governs product scope, structure, source handling, and review state; `voice.md` governs wording. Voice never authorizes a semantic change, cannot turn an inference or candidate into current behavior, and yields to factual accuracy, explicit task constraints, and the structure defined here. Apply it after the page's claims are source-grounded and its page type and location are settled.

Do not apply house voice while capturing source material into `raw/` or `inbox/`: clean it only as those sections permit and preserve every claim. Apply voice when that material is deliberately promoted into a reader-facing entry. The policy also excludes exact quotations, code and identifiers, the read-only `protocol-doc/` submodule, and maintenance artifacts such as tasks, `internal/maintenance/backlog.md`, `internal/maintenance/log.md`, these operating docs, and skills; their own local rules control their wording. A `status: draft` voice policy is advisory rather than active and is reviewed through a task if needed, never through the canonical-page drafts inventory.

### Product content and documentation operations

**Product prose contains established product knowledge and useful reader guidance; documentation operations have separate homes.** This boundary applies to draft and reviewed canonical entries, guides, product-opportunity explanations, and the product-facing parts of indexes. [Voice rule V-R018](./voice.md#4-rules) prohibits editorial narration and supplies the wording test and examples. This section determines where the displaced material goes; skills and agent entry points link here rather than duplicating the policy.

| Material | Its home |
| --- | --- |
| Product behavior, rationale, availability, material limits, and reader actions | The canonical product entry, with useful navigation and references that help the reader understand or act. |
| Provenance and exact source revisions; investigation and review history | `source:` or a source reference for provenance; `internal/maintenance/log.md` for dated history. |
| Draft/review state | Frontmatter and the backlog's draft inventory. |
| Unfinished documentation: questions, verification, missing content, reviews, decisions, or source requests | A finite task under [Tasks](#tasks), linked once from the backlog. |
| A candidate product improvement and the investigation needed to define it | An opportunity under [Product opportunities](#product-opportunities); candidate status and product investigation belong together. |
| Repository or generated-file instructions; page-purpose and ownership inventories | Operating documents, skills, maintenance references/navigation, or the audit's working inventory. |

**Verify from code; explain from product purpose.** Code inspection establishes whether a claim is accurate; it does not determine how much belongs in the article. Lead with the actor's purpose, the product rule, and the consequence. Include a detail only when it changes understanding or a meaningful decision. Exact labels belong where someone needs to find an action. Component inventories, styling props, callbacks, selector wiring, and line-by-line proofs stay out of product prose, including design patterns and opportunities. Design pages explain reusable interaction choices and their rationale.

Do not link product prose to application source files or GitHub components as proof. Keep revision provenance in `source:` and necessary investigation evidence in its existing log or maintenance record. Prefer links to the concept that owns the explanation, relevant protocol documentation, or a service the reader can use. Do not create a permanent evidence page merely to preserve every observation. A completed verification can justify a shorter paragraph or no prose change.

A design-system reference may name the component API, Storybook variants, and visual specification needed to build an interaction, as in the [Voting Terminal design reference](./internal/design/voting-terminal-reference.md). Keep that lookup under `internal/design/`, linked from builder navigation and to its canonical behavior. It is excluded from user-facing content. Repository inspection instructions and source-code evidence remain under maintenance; moving implementation details into an otherwise product-facing article does not make them reader guidance.

Keep each rule's full explanation in one home. Check dependants for contradictions, but do not repeat a warning, recovery discussion, or edge case everywhere the feature is mentioned. Preserve material limits and uncertainty where they affect the reader's decision; source-level defects can stay in their scoped opportunity without becoming routine user instructions.

**Check relevance before asking or routing a question.** Identify what its answer would materially change in the product explanation, reader guidance, or a concrete documentation decision. An existing checkbox or task does not establish that the question is useful. Missing decision authorship or a historical date is not a documentation gap; pursue it only when the owner requests that history or it resolves a material product ambiguity. Retire irrelevant questions with a brief reason in the log. Ask the owner only for necessary context or judgments that the available sources cannot settle, and explain what the answer will resolve.

**Resolve before routing.** Check the relevant pages, task queries, backlinks, and recorded answers or scope rulings before treating an old note as open work. Apply an evidenced answer when available. For material unresolved work, follow [Tasks](#tasks) to reuse or extend an existing task, or create a bounded one, and assign its state and next actor. Preserve the question's meaning, known evidence, material uncertainty, and links to affected pages before deleting its old copy; rebase links when relocating it. A task closes only after its outcome reaches the affected docs or a recorded relevance or scope ruling closes the question.

**Uncertainty must survive relocation.** Removing “not verified” must not imply either support or lack of support. State only the bounded product fact and retain any uncertainty that affects a reader's decision. Move the missing answer into its task; do not leave undefined-category rows or a research checklist in the article. Source captures and read-only upstream material retain their existing handling rules.

**Finish against the diff.** Apply the [voice preflight](./voice.md#10-preflight) to every added or changed paragraph, including its surrounding claims, and verify every relocated item's destination. Wording cleanup does not approve a draft. Run `node .claude/skills/wiki-cli/scripts/check-product-links.mjs` to reject source-code proof links in product prose. That check and `wiki check` do not judge relevance, repetition, or explanatory quality; inspect the diff for those separately. Existing violations are cleanup work, not precedent.

**This bundle is git-managed.** Commits are its history and its undo; pull before editing and initialize the upstream with `git submodule update --init protocol-doc` after a fresh clone. **Agents do not commit unless asked to:** once the composite `wiki --root . check` passes, leave the batch uncommitted — the product owner reviews the diffs in their editor and commits themselves (or explicitly asks for a commit).

### User-facing content and existing metadata

**Exclude `internal/` from user-facing platform content.** Product knowledge explains what the app does, its constraints, and choices people can make. Builder guidance and principles live in `internal/design/`; documentation operations, history and tasks in `internal/maintenance/`; proposed product changes in `internal/product-opportunities/`. The [exclusion summary](./internal/maintenance/product-knowledge-audit.md#user-facing-content-exclusions) records this boundary.

Keep `internal/` indexed: wiki queries and link checks must still cover it. It is excluded from the reader view, not from the knowledge base. Ignored operating and source files remain outside the index. The read-only `protocol-doc/` submodule is a separate, optional source of deeper explanation, outside the default platform reading scope.

**Location establishes audience; types describe entries; tags describe topics.** Keep `task`, `opportunity`, `principle`, `pattern` and `reference` as ordinary types. A product page may carry a `design` or `repositories` tag without becoming internal. Do not add audience tags or maintain a page-by-page allowlist. Draft status remains editorial review state; preserve client and availability qualifications independently.

Typed local entries carry existing subject tags. Reserved `index.md` and `log.md` files carry no frontmatter; only the bundle-root index has `okf_version`. Their location identifies the collection or history they belong to, so tags on these reserved files add no audience information.

The [product root](./index.md) and its area indexes provide the user reading path. [Internal navigation](./internal/index.md) provides the contributor path. After moving or excluding content, verify that essential product explanations remain reachable from the product root without entering `internal/`. Keep useful protocol links as optional destinations; do not expand the reader corpus through every linked page.

## Protocol-doc: read-only upstream and one composite graph

The parent repository pins one exact protocol-doc commit even though `.gitmodules` records `main` as the update branch. The pin recorded under [Protocol snapshot](./internal/maintenance/index.md#protocol-snapshot) is the protocol baseline for every platform page. The dependency is intentionally one-way:

- Platform entries **link into** `/protocol-doc/**`; those links are dependencies the combined graph can verify.
- Protocol-doc remains upstream and read-only in this repository. Never add platform links to the submodule, edit its pages to manufacture backlinks, or treat the absence of protocol → platform links as an orphaning defect.
- A `wiki backlinks /protocol-doc/<path>.md` query run from the platform root may show platform dependants of an upstream page. That is expected; it does not create a reciprocal upstream obligation.

**Use the platform root as the authoritative wiki root.** `wiki` 0.8 does not compose nested `wiki.toml` files; it recursively indexes all Markdown under the chosen root and applies only that root's config. This repository's [wiki.toml](./wiki.toml) therefore holds the union type vocabulary and mirrors protocol-doc's ignored operating files and orphan exemptions with a `protocol-doc/` prefix. Run the final gate from this directory even when the work began inside the submodule:

```sh
git submodule status protocol-doc
wiki --root . check
wiki --root . unresolved
wiki --root . orphans
```

The `wiki-cli` skill covers how to read each line of that gate (which findings are errors you must fix, which are the to-write list, and the known upstream-root advisory). The submodule-status line must show the pinned SHA with a leading space; `-` means the upstream is uninitialized, `+` means it is checked out at a different commit, and `U` means it is conflicted. `wiki --root protocol-doc check` is a useful upstream-only diagnostic, but it never replaces the parent-root check: only the parent root verifies platform → protocol links and the combined vocabulary. The combined check emits one known advisory for `/protocol-doc/index.md` — `reserved file should carry no frontmatter` — because that file correctly carries `okf_version` as the upstream bundle root while the parent sees a nested index. Keep it indexed for its navigation edges; do not edit upstream or hide it from the composite config.

**Check upstream before writing overlapping material.** Search the whole graph, then narrow to the protocol subtree:

```sh
wiki search "<topic>"
wiki search "<topic>" --prefix protocol-doc/
wiki links /protocol-doc/<path>.md
wiki backlinks /protocol-doc/<path>.md
```

Read every relevant upstream hit before creating or changing the platform page. If protocol-doc already defines the mechanism, link to it and write only the product abstraction, rule, or consequence here. If both layers legitimately discuss the same term, make the platform page's added semantic layer explicit; do not leave two competing mechanism definitions.

Treat composite wiki queries and checks as read-only over upstream. Never run `wiki move` or a bulk mutator such as `wiki tidy --all` against `/protocol-doc/**`; after any parent-root mutation, confirm the submodule is still clean. When deliberately advancing the submodule pin, compare the new `protocol-doc/wiki.toml` with the parent config, merge any new types/ignores/orphan exemptions into the prefixed union, update the exact SHA and date under [Protocol snapshot](./internal/maintenance/index.md#protocol-snapshot), then run both the upstream-only diagnostic and the parent-root gate.

## Types

The composite vocabulary is enforced in [wiki.toml](./wiki.toml) and is the union of both bundles. Platform types in use are `concept` (an idea and why), `capability` (something a user can do in the app: its purpose and business logic), `pattern` (a reusable interaction behavior or design rule — interaction, component, or content), `principle` (a cross-cutting product rule with enough rationale or examples to stand on its own), `reference` (lookup material), `guide` (a user-facing walkthrough for accomplishing a concrete Aragon task), `opportunity` (a candidate product improvement, not a current promise or roadmap commitment), `task` (executable documentation work waiting to be run; one entry per task under `internal/maintenance/tasks/` — see *Tasks*), and `note` (an authored maintenance board such as the [documentation backlog](./internal/maintenance/backlog.md) or [Product opportunities](./internal/product-opportunities/backlog.md)). The union also declares `risk` (a known failure mode and its mitigations — currently no entries) and protocol-doc's `example` type. There is no separate type for a chosen product rule: the rationale for a rule belongs with its subject's entry, and a reusable rule that stands on its own earns a page under an ordinary type such as `concept` or `pattern`. Add a new kind deliberately to the parent vocabulary; when upstream adds one, mirror it as part of advancing the submodule pin.

**Canonical product pages speak in the product's present tense.** Concepts, capabilities, patterns, principles, risks, and references describe how the product works now and the design principle behind it, never how it got there: no prior behaviors, reversals, or retired framings in page prose. Product opportunities are the explicit planning exception: they describe a candidate improvement while making clear that it is neither current behavior nor a roadmap commitment. Git and [log.md](./internal/maintenance/log.md) hold the history; the `source:` field holds provenance. When an owner answer changes a canonical page, rewrite the page to the new present rather than narrating the correction. Draft pages carry `status: draft` in frontmatter until validated by the product owner; provenance goes in a `source:` frontmatter field pointing at the material the page was distilled from. When several same-day briefings touch one page, collapse their citations into one `+ product-owner briefings (<date>, see log.md)` tail rather than enumerating them — the log entry carries the detail.

### Publication boundary: live product only

**Release notes are inputs to the wiki, never the framing of a product article.** Keep release-note citations, version-by-version audit narration, and disputes between source snapshots in `source:` metadata and `internal/maintenance/log.md`. Canonical prose explains current behavior directly and links to the wiki pages that own related concepts. Describe the supported route and the constraints needed to use it; do not turn an article into an inventory of absent services, monitoring, or recovery support. Bespoke deployments do not require a shared address catalogue or an authoritative frozen revision to explain the capability.

Canonical product entries and guides document a feature only after the product owner confirms it is live. Code presence, tests, deployed infrastructure, a public endpoint, or local/preview reachability does not establish product availability; nor may a feature flag downgrade a feature the owner confirms is live. `status: draft` describes the review state of a documentation page, not the rollout state of the feature it covers. A live capability with an app-supported experience and deployment carried out by Aragon follows the Aragon-deployed plugin model; its supported audience must still be established separately under [Client-specific integrations](#client-specific-integrations). A partially implemented feature stays out of the product graph until launch.

In-development, partially implemented, dark-launched, and local/preview-only features stay outside canonical pages, guides, and documentation tasks until they launch. [Product scope exclusions](./internal/maintenance/product-scope-exclusions.md) is the source of truth for the current list: add a row when the owner rules a source surface not live, state the evidence-independent product state and the event that will reopen it, and remove the row when the owner confirms launch. Do not turn an exclusion into current product truth or a roadmap promise.

Unused, incomplete, or misleading code attached to a live feature is not automatically a scope exclusion. When it suggests a concrete product or implementation improvement, create a `type: opportunity` entry and list it on [Product opportunities](./internal/product-opportunities/backlog.md); if it also concerns an excluded surface, link the candidate from that surface's **Product opportunity** column. Code presence and product state remain separate decisions.

### Client-specific integrations

**Classify audience, rollout, and deployment separately.** Work commissioned for a named client stays scoped to that client even when it reuses a general capability, ships in the shared app, or uses Aragon deployment. Launch does not establish availability to other clients. Technical compatibility, a shared registry, and a renderer's presence cannot establish a general product offering.

[Client-specific integrations](./internal/maintenance/client-specific-integrations.md) records the owner-established audience, covered source surfaces, documentation homes, and any limits on coverage. Check it alongside [Product scope exclusions](./internal/maintenance/product-scope-exclusions.md) before source mining, release reconciliation, authoring, and review. Exclusions remain authoritative for not-live surfaces; a client scope ruling alone neither adds nor removes an exclusion. Record an explicit owner-authorized prelaunch example and its permitted depth without treating that exception as permission to expand it.

File substantive client-specific behavior in a named-client entry under its product area, linked to the shared capability. Keep the ordinary `type`, and add `scope: client-specific` and `client: <lowercase-client-slug>` so dedicated entries can be queried. Do not mark an entire shared page as client-specific because it contains one example: keep a brief example or catalogue subsection visibly named for the client and register that exact home. Shared pages explain shared behavior and link to client integrations; avoid duplicating the client's business rules there. Every client-specific page opening, catalogue subsection, guide prerequisite, and navigation label must retain the client scope when read independently. Assistant retrieval and summaries must preserve that scope too.

When reviewing a client integration, verify behavior and audience as distinct claims. Apply existing owner rulings without asking again; route only a material missing scope decision through a finite task. Broaden the documented supported audience only after the owner explicitly confirms that audience has expanded, then update the register and affected pages together. Documentation depth follows the publication boundary and any explicit coverage restriction; it can change while the supported audience stays the same. Keep review status independent: a source check or scope correction does not approve a draft.

## Structure

Product entries are filed by subject, with user guides beside them. Internal material has one separate home, organized by its purpose:

```text
platform-doc/
├── index.md                         # product front door
├── value-proposition.md
├── osx-and-the-platform.md
├── accounts/
├── application/
├── governance/
├── treasury/
├── access-control/
├── guides/
├── internal/
│   ├── index.md                     # contributor front door
│   ├── design/
│   │   ├── index.md
│   │   ├── principles.md           # typed overview
│   │   ├── principles/             # expanded principles
│   │   └── ...                     # patterns and design references
│   ├── maintenance/
│   │   ├── index.md
│   │   ├── backlog.md              # authored documentation board
│   │   ├── tasks/                  # finite documentation work
│   │   ├── log.md
│   │   ├── app-release-state.md
│   │   ├── product-scope-exclusions.md
│   │   └── ...                     # audits and source references
│   └── product-opportunities/
│       ├── backlog.md              # authored product-intake board
│       └── ...                     # temporary opportunity entries
├── protocol-doc/                    # read-only upstream
├── AGENTS.md, WORKFLOW.md, voice.md  # ignored operating documents
└── inbox/, raw/, research/          # excluded source/private workspaces
```

**File product knowledge by area.** An area mixes concepts, capabilities, patterns and references. Shared application behavior belongs in `application/`; domain-specific behavior stays with its subject. Product-area indexes provide navigation, and guides apply the same canonical knowledge to concrete user outcomes.

**Keep internal collections purposeful.** Design owns reusable builder choices and component references. Maintenance owns documentation operations, evidence, source orientation, review and tasks. Product opportunities are a temporary intake collection; use tags and links to retain their product context. Both backlogs stay authored boards with `type: note`, and their entries own their own state. A task collection needs no separate index because its backlog provides navigation.

**Preserve load-bearing overviews.** [Principles](./internal/design/principles.md) remains the typed overview beside its `principles/` folder. A multi-part audit likewise has a typed parent beside its parts folder. Collection indexes remain untyped. Keep these meaningful parts together; the `internal/` boundary adds one necessary level without creating extra topic hierarchies.

Use relative links across these homes and define each subject once. Add a new area only when a real cluster warrants it.

## The entry point (`index.md`)

A reader (or an agent) lands on `index.md`. Make it the front door, hand-curated, not a dump of everything:

- An introduction to the product.
- Links to the **guides** (if any), for people who arrive with a concrete task to accomplish in Aragon.
- Orientation and links to the **key concepts** for readers who want to understand the product (the handful of pages the rest of the graph hangs off).

Keep the two routes distinct: guides serve platform users pursuing an outcome; the index's orientation and concept links serve people navigating the product model. Keep `index.md` to the important product starting points. Builder and documentation routes start at [internal navigation](./internal/index.md), which preserves the full contributor route without mixing it into the product front door.

## Concepts: the graph

Each concept is **one atomic idea**, defined **once**, and linked to what it relates to:

- **Define once, link everywhere.** A term is explained on its own page; every other page that mentions it **links** to that page instead of re-explaining it (a link is a reference, not a copy). This one rule is what keeps docs consistent: the definition changes in a single place.
- **Distinct ideas stay distinct.** Closely related or similarly named things (a type and its factory, a resource and its setup/lifecycle) are still separate concepts: give each its own page and link them. Being adjacent is a reason to link, not to merge. Atomic cuts both ways, don't split one idea across pages, don't fold two into one. And grouping is not merging: two closely related concepts can share an area folder (see *Structure*) and stay two distinct pages, the folder is where a reader looks, the link is how they relate.
- **Link generously.** The value is the graph. `wiki backlinks /payments/idempotency.md` shows everything that depends on the concept; `wiki links` shows what it builds on.
- **concept vs reference**: a `concept` explains an idea ("what idempotency is, and why"); a `reference` is precise lookup material ("the `/charges` endpoint and its fields"). Same graph, different texture. Split them when readers want "understand" apart from "look up"; merge them if that is overkill.

`wiki unresolved` is your **to-write list**: a link to a concept you haven't written yet is not an error, it is a promise. Writing docs is largely turning `unresolved` into pages.

## Authoring and revising pages

Let the reader's product question determine what the page explains. Establish its contribution to the graph: what the reader should understand, decide, look up, or accomplish here, and which related entries already own the surrounding ideas. This guides the writing; it does not need an editorial statement in the page.

Choose an opening and structure that serve that question. A concept usually needs a direct definition and its relationships; a capability needs the purpose it serves and how it works; a principle needs the rule and its rationale; a reference needs lookup context; a guide needs an actionable route to an outcome. These are starting points, not a shared outline or a requirement to include every kind of explanation. Order and depth should follow the dependencies in the explanation. Group related claims under meaningful headings, and use a table when it makes real alternatives or properties easier to compare.

Explain supported benefits through what people can do and why it matters. Keep concrete examples when they make an abstraction, causal relationship, or material distinction understandable; brevity alone is not a reason to remove them. Apply the [product-content boundary](#product-content-and-documentation-operations) to decide which mechanics and limits belong. Removing an editorial label or vague praise should preserve the useful feature purpose beneath it. For a small edit, work within the existing purpose and structure unless the change exposes a problem there; do not reopen the whole page by default.

After moving, consolidating, or removing sections, close the structural loop: re-evaluate each affected page’s purpose against its remaining content and neighbouring homes. Record a final keep, narrow, merge, split, or retire verdict and apply it. An initial purpose is a hypothesis, not a reason to preserve a filename; a short page can still own a distinct concept, and a long page can still be redundant. Repeat the comparison for affected neighbours until the section homes and page purposes support one another. Keep these judgments in the audit inventory, not product prose.

## Application-page coverage

Every live application page needs one clear documentation home: a named section in the concept or capability it presents, or a dedicated entry when its purpose and behavior warrant one. Use the application's page name for that section or entry. Explain the page's user purpose, the information it presents, the actions it supports, and the context needed to interpret it. Link to the concepts and capabilities behind those actions rather than repeating their full definitions. Page coverage does not require a field-by-field catalogue, source-code walkthrough, or an entry for every route variant.

Keep product explanations in those canonical homes. A finite coverage audit maps the live application pages to their entries or heading anchors in a maintenance inventory, records exclusions using the established product-scope rules, and routes missing coverage through tasks. The page-to-document map and audit progress stay outside product prose.

## Guides: accomplishing tasks in Aragon

A **guide** (`type: guide`) helps someone who does not yet know how to accomplish a concrete outcome in the Aragon platform. It starts from the user's goal — not the documentation's structure — and walks through the required decisions, actions, and expected result. Orientation for reading or maintaining the knowledge base belongs in the root `index.md` or the operating docs instead.

A guide comes in two sizes:

- **A single page** for something short.
- **A sequence** for anything longer: one `type: guide` entry per step, each with a **next** and **previous** link so the user can complete the task in order. Give the sequence a **landing entry** (`guides/launch-governance.md`, `type: guide`: the outcome, prerequisites, and steps in order) and keep the steps beside it under `guides/launch-governance/` (`01-choose-process.md`, `02-configure-bodies.md`, …). The landing is a real typed guide, not a typeless `.../index.md`.

Rules either way:

- State the user's intended outcome, prerequisites or availability limits, actions and decisions, and a clear done state. The guide must carry the actionable sequence itself, not merely send the user on a tour of concept pages.
- A guide **references** concepts for background rather than duplicating their definitions. Include enough context to complete the task; move reusable product meaning into its own concept page and link it.
- **Order is explicit** because the user completes the task from start to finish: use numbered steps on one page, or next/previous links within a sequence. Organize `guides/index.md` by user goal; unrelated guides do not form one global reading order.
- Guides are entry points, so little links *to* the first page, that is fine; link it from `guides/index.md` and the product `index.md` so it is reachable and not an orphan. Within a sequence the prev/next links keep the middle steps linked, so none show up as orphans.

## Multiple products

When products coexist (a folder each, see *Structure*), a concept **shared** by two products still has a single home, the product that owns it, or a top-level `shared/`, and the other product **links** to it, never copies it (define-once-link-everywhere applies across products too). If most concepts turn out shared, that is the signal to switch to the single tagged graph instead (see *First run*).

## Ingesting from source

Docs are usually distilled from **source material**: source code, specs, tickets, existing docs, a subject-matter expert. That material is the *input*, not the wiki; your job is to turn it into atomic, linked concepts. Do it in two phases, and gradually, not one giant edit:

1. **Extract into `raw/`.** Pull the relevant facts out of an externally available source (code, specs, repositories, or documents) into rough notes in `raw/`, one per source or question, *before* shaping them. Delegate this to a separate extraction pass or agent if it helps: it can dump plain notes with no wiki conventions at all, since `raw/` is **git-ignored and excluded from the index** (nothing there is listed, searched, or checked). It is interim, regenerable scratch you mine into real entries, not the committed base, so losing it just means re-reading the source.

   **Direct product-owner briefings belong in `inbox/`, not `raw/`.** They are committed source material supplied by the owner and cannot be regenerated by re-reading a repository or document. Before saving one, clean up the wording and structure it into a coherent, readable capture while preserving every claim and its substance; do not put raw verbal notes or an unedited transcript in the bundle. Preserve the cleaned capture there until deliberately processed.
2. **Build incrementally, from `raw/`.** Promote the raw notes into concept/reference entries a few at a time: write one atomic page, **file it into its area folder** (see *Structure*) rather than leaving everything at the root, link it to what exists, `wiki check`, then **delete the raw note you just mined** (or the lines of it you used) and repeat. `raw/` is thus a shrinking worklist: an empty `raw/` means the batch is done. (A `- [ ]` checkbox inside a raw note would track this too, but `wiki checkboxes` can't see `raw/` since it is unindexed, so deleting is the clearer signal.) Small batches keep the graph consistent and reviewable, and let `wiki unresolved` guide you, each concept you write names others, and those names become your next to-write items. Prefer this over a single massive dump: a hundred pages landed at once are unlinked, unreviewed, and dumped flat at the root.

Keep **provenance** in a `source:` / `resource:` field or an appropriate source reference so a fact can be re-checked later. Unqualified `log.md` citations in existing source metadata refer to `internal/maintenance/log.md`; historical capture paths retain their original meaning. These references trace the evidence for a claim; they do not require a named decision maker or decision date to establish product behavior. Apply the product-content boundary when promoting material: publish the supported product explanation, retain the research history in provenance and the log, and route material unfinished work to tasks.

**Record each pass in `internal/maintenance/log.md`, dated and high-level.** One dated line per enrichment or sync pass (what source you covered, roughly what you added), not one per edit, git already holds the fine detail. On the next pass, read the last date and re-sync only what changed in the source since then, rather than re-deriving everything. For docs kept in step with a moving product, that dated, high-level trail is what makes incremental sync cheap.

Scale the ceremony to the job: a small, well-understood product can skip `raw/` and be written directly; a large or unfamiliar one benefits from the extract-then-iterate split. Either way, the unit is the **atomic concept**, never one monster page.

## The inbox

`inbox/` is the holding area for **cleaned but unstructured or incorrectly structured ideas**: valid, readable content that isn't yet shaped into entries. It differs from `raw/` on both axes — it is **committed to git** (its content is not regenerable: owner briefings, pasted notes, half-formed pages), and it is fed by the product owner rather than by an extraction pass (with one agent-fed exception: sessions without the `wiki` CLI park material here — see *Degraded mode* below). Raw verbal notes, unedited transcripts, and incoherent dumps do not belong here; clean them up first without changing their substance. Like `raw/`, it is excluded from the index (`wiki.toml` ignores `inbox/**`): nothing in it is listed, searched, linked, or checked.

Handling rules:

- **Everything in the inbox is a draft by definition** — unindexed, unreviewed, possibly contradictory or duplicating the wiki. Never treat inbox content as established fact, and never link wiki entries into `inbox/`.
- **Do not read, reference, or process the inbox unless the product owner explicitly requests it.** It can grow large, and processing it is deliberate, time-consuming work — a requested task of its own, never a side effect of answering a question or writing a page.
- **When asked to process it**, run the normal capture → refine → promote loop: mine an item into atomic entries (filed by area, linked in, `status: draft` until validated), `wiki check`, then **delete the mined material from the inbox** — like `raw/`, it is a shrinking worklist, and deletion is the "done" signal. Record the pass in `internal/maintenance/log.md`.

## Personal research

`research/` is the product owner's **private, local research workspace**. It deliberately lives beside the bundle for convenience, but it is not part of the portable knowledge base: both Git and `wiki.toml` ignore the whole subtree. Its files may use Markdown, frontmatter, and links for the owner's own organization without becoming indexed product truth.

- **Do not read, reference, or process `research/` unless the product owner explicitly requests it.** Personal research is not an ambient source for ordinary wiki work.
- **The boundary is one-way.** Private research may link outward to portable wiki entries for local navigation; committed entries, boards, tasks, and logs never link inward to private paths. Personal review work stays on `research/index.md`, not the documentation backlog.
- **Promote conclusions, never private paths.** When research produces durable platform knowledge, rewrite that conclusion into a product entry in its area or an opportunity under `internal/product-opportunities/`, and give it portable provenance. Do not cite a local `research/` path that other clones cannot resolve.
- Git cannot recover or synchronize ignored files. If the material starts needing history, backup, or sharing, move the research workspace into its own private repository rather than weakening this boundary.

## Degraded mode: no `wiki` CLI

Before changing anything in the base, check that the `wiki` CLI is available (`wiki --version`). If it is not — not installed, and not installable in the session — **do not create, edit, move, or merge entries, and do not touch the board.** Without the tool there is no `wiki check` gate, no computed graph (collision, orphan, and backlink queries), and no safe `wiki move`; hand-maintained structure is unverifiable, so structure waits.

What a tool-less session does instead is **capture-only**:

1. Take the incoming material (a verbal briefing, a rough dump) and clean up the wording only: fix the flow so it reads coherently, but change no logic, drop no claims, add no interpretation. The result is the source made readable — not a draft page, so no frontmatter, no filing, no links into the base.
2. Save it as a dated file in `inbox/` (e.g. `inbox/2026-07-16-treasury-briefing.md`) for the owner to commit — the inbox is committed but unindexed, which is exactly the point.
3. Tell the owner the material is parked and why, so a later session *with* the tool can run the normal capture → refine → promote loop over it (per *The inbox* handling rules).

Read-only work — answering questions from the base — stays fine without the tool; it is mutation that waits.

## Documentation review: the backlog and open questions

The product owner needs **one place to go** to find documentation work waiting on them: **[backlog.md](./internal/maintenance/backlog.md)** under maintenance. It is an authored board (agents keep it current, `wiki` never edits it), organized by **who moves next**: **Ready for your input** (owner tasks actionable now), **Ready to run** (agent tasks actionable now), **Not yet ready** (tasks with an external prerequisite), and **Inventories** (supporting release state, drafts, task-owned questions, and unwritten pages). Every unfinished documentation action has a task entry and one row in its actor's section. Product-improvement candidates follow [Product opportunities](./internal/product-opportunities/backlog.md).

**Two rules keep that model from decaying.** *One item, one row, one section* — the section mirrors `next_actor`, so owner-actionable work sits in *Ready for your input*, agent-actionable work sits in *Ready to run*, and `status: blocked` work sits in *Not yet ready*. A task awaiting an answer, review, approval, or walkthrough the owner can provide now is **ready owner work, not blocked work**. *Position is the priority* — both actionable sections are deliberately ordered, and no second scheme is layered on top: no Now/Next/Later bands, no priority field, no impact labels, no unexplained markers. Every row instead carries a sentence saying why it is there, what it produces, and which surfaces it affects; a truly blocked row names the external state that must change. If an ordering needs justifying, that sentence is where the justification goes.

**Anything the owner can move now has a task row in *Ready for your input*** — an answer, bounded review or ruling, or request for source material. An agent that creates an owner ask puts its task there before the pass ends; the session's closing message mirrors the board. `wiki list --where type=task --where status=ready --where next_actor=owner` finds actionable owner tasks; `status=blocked` is never a synonym for “waiting on the owner.” Reviews name a finite cohort or completion boundary, not an endless standing task.

The underlying state lives on the pages or task entries; the board owns navigation and ordering:

- **A page needing review** carries `status: draft` in frontmatter. The board's drafts inventory lists it with a plain link while that status holds; `wiki list --where status=draft` is the authoritative query that inventory must reconcile with, and it is exhaustive: material under an ignored path (the owner's private `research/` workspace) stays off the board entirely rather than being listed as an exception.
- **An unresolved documentation question** belongs in a finite task, even when it concerns one existing page. Follow [Resolve before routing](#product-content-and-documentation-operations) to preserve its context and avoid reviving answered questions or duplicating existing work. The task's `## Work` bullets hold the question; its `status` and `next_actor` identify who can move.
- **A task** is a first-class entry in `internal/maintenance/tasks/` that owns its state in frontmatter; the board gives it one row, which owns only the ordering and the reason (see *Tasks*).
- **A knowledge gap** is tracked by a finite task to obtain the missing structural understanding. Its task states what cannot yet be documented, what source material would close the gap, and who can supply or research it.

Use task queries to find documentation questions. `wiki checkboxes` inventories procedural steps; product pages and tasks do not carry documentation-question checkboxes or `## Open questions` sections.

### Tasks

A **task** is finite documentation work for one named next actor: the owner may review a ledger or settle a bounded ruling, while an agent may analyze a codebase, compare a page against a repo, build an inventory, or ground a taxonomy in a component library. Tasks are how both actors see **what they can do next**; knowledge gaps separately show what source material the owner can supply.

**One entry per task.** Each task is a first-class entry in `internal/maintenance/tasks/` (`type: task`) — AGENTS.md's native track-work model — so the work carries its full context instead of compressing into a board paragraph. Frontmatter: `title`, `tags` (area + cross-cutting, e.g. `maintenance`), `status` (`ready` | `in-progress` | `blocked`), `next_actor` (`owner` | `agent` | `none`), and `source` (the briefing, source revision, or investigation that established the work). No `priority` field, no impact rating, and no dates: the board's order is the priority, and git carries time. A task names a **concrete, finite outcome** — never a standing process; recurring work gets a fresh task per run. A task never sits on a page as an `## Open questions` checkbox; a checkbox that turns out to be a task in disguise ("ground X in the code", "compare Y against Z") becomes a task entry and leaves the page.

`status` and `next_actor` answer different questions and must never be collapsed:

- `status: ready` means the named `next_actor` can act now. Use `next_actor: owner` for an actionable review, answer, approval, walkthrough, or source handoff; use `next_actor: agent` for executable documentation work.
- `status: in-progress` means the named actor has started and can resume the work. When work hands from one actor to the other, change it to `status: ready` and name the new `next_actor`; preserve partial work in `## Progress` rather than pretending the handoff is a blocker.
- `status: blocked` means **neither owner nor agent can act yet**. It always carries `next_actor: none` and an explicit `**Trigger:**` naming the external event or prerequisite that will make an actor able to move. Never use `blocked` merely because the owner is the next actor.

**Anatomy.** The lead paragraph (the concrete outcome, why it matters, what the task does *not* cover) and the closing **Done when** criteria are required; every other section exists only when it earns multiple bullets or real prose — fold a short one into the lead or a bold inline label (`**Trigger:** …`). A two-line task file is a correct task file. The why lives in the lead and *What this unblocks*; the action sections stay imperative and scannable — a cold session must be able to answer "what do I do?" and "is it done?" in one read.

- `## What this unblocks` — the pages waiting on the work, as links, each with what it is waiting for. These task→page links are the graph payoff: `wiki backlinks <page>` shows the pending work against a page, and the links clean themselves up when the task completes.
- `**Next action — <actor>:**` (optional) — a one-line restatement of the immediately actionable step when the lead and `next_actor` do not make it obvious. It must match frontmatter and must not describe the actor as a blocker.
- `**Trigger:**` (blocked tasks only) — the external event or prerequisite that makes action possible. An action the owner can perform now belongs under `## Work` or `**Next action — owner:**`, never under `Trigger`. When a trigger fires, set `status: ready` and name the actor who can move; if the firing material completes the task, run the completion sequence instead.
- `## Work` — the remaining work as plain bullets, pruned as they complete. Lead with the action and its outcome. Include a question or decision as an explicit work item with its context and affected-page links. **Never checkboxes or an `## Open questions` section.** When a task exposes another question, keep it in that task if it shares the outcome and next actor; otherwise route it to a bounded task with its own board row. An answer the owner can supply now is actionable work, not a blocked trigger.
- `## Where to look` — repos, entry points, protocol-doc pages: the pointers that make the task runnable cold.
- `## Scope boundary` — explicit non-goals, when the task needs them.
- `## Done when` — the success criteria, one bullet per criterion, each answerable yes/no by a cold session against a named artifact (a page, a table row, a query result); the last criterion is always the completion sequence. A genuinely single-condition task may keep the inline `**Done when:** …` label instead.
- `## Progress` — dated one-liners, only when parking work across sessions. Writing its first bullet is what flips `status: in-progress`; a single-session run never touches status. An `in-progress` task found at session start is an interrupted or parked run: read its Progress section and git, then resume it. If the next step belongs to the other actor, flip it to `ready`, change `next_actor`, and move its one board row to that actor's section.

**One task per surface-and-source-set.** Two commissions that would mine *different sources into the same pages*, or the *same source into one page's same section*, are one task: merge them, keep every claim and pointer from each, and name the merge in the surviving entry's `source:` field. Splitting by source rather than by outcome is what produces tasks whose first instruction is "check whether the sibling task has already run" — a dependency that should have been a merge. Merging is not a licence to bundle: two tasks that happen to share an *area* but produce independent pages stay two tasks, and a merge that makes a session unreviewable is too big.

**The board owns ordering and reasons; entries own their state.** Each row is `**[<task>](./tasks/<slug>.md)** — <why it is here, what it produces, and the surfaces it affects>`. The section mirrors both fields: `next_actor: owner` with `status: ready` or `in-progress` sits in *Ready for your input*; `next_actor: agent` with `status: ready` or `in-progress` sits in *Ready to run*; `status: blocked` with `next_actor: none` sits in *Not yet ready*. The row states the actor and action plainly when either could be ambiguous; it never says “blocked on you” when the owner can act. Every row is a link to a task entry, never a prose item. Cite a task by its entry link — in prose or log.md, by its slug — never by row position: rows renumber.

**Order by rework avoided, not by size.** In *Ready to run*, put work that settles shared vocabulary, a shared mechanism, or an area's framing ahead of the work that would otherwise re-invent or contradict it; product semantics ahead of the presentation layer that renders them (the three-layer rule above); cheap passes that several later rows depend on early; and scattered small-fact passes last, once the pages that will host their facts exist. Where two rows write the same page's same section, their relative order *is* the write order — say so in the later row, and have it cite the earlier row's output rather than restate it. A forward link to a page a later row will create is a promise, not an error (`wiki unresolved` tracks it), so a dependency in that direction never forces a reorder.

**Cumulative knowledge leverage** means that completed work leaves verified facts, settled distinctions, and clear canonical homes that make later work faster and more reliable. Shared agent context can reduce setup effort, but durable reuse comes from the wiki: apply supported findings to their owning pages and affected dependants, preserve exact source revisions and evidence limits in provenance or a maintenance inventory, and record decisions and remaining uncertainty in the log and finite follow-up tasks. A later agent consumes those artifacts before repeating an investigation. An older app or UI-kit snapshot is reusable evidence, not proof of equivalent behavior in the selected release; verify the relevant difference before extending its claims. Keep independent outcomes separate even when adjacent execution lets them share source context, and state a required write order separately from a merely useful scheduling preference.

**Only the board links into `internal/maintenance/tasks/`.** Canonical pages, indexes, and log.md never do — they name a task by plain-text slug when they must refer to one (the same one-way discipline as `inbox/` and the opportunities board). This is what keeps both safety nets honest: a task nothing links to shows up in `wiki orphans` (a board omission — provided nothing else links it, which this rule guarantees), and deleting a completed task can never strand a link into `wiki check` warnings or the `wiki unresolved` to-write list.

**Completion is one sequence, log first:** (1) fold the close-out into the pass's dated log.md entry, naming the task by slug — what shipped, what diverged, what was deferred and to where (any `## Progress` bullets worth keeping fold in here); (2) remove its board row; (3) delete the task file; (4) the composite `wiki --root . check` gate. The log close-out is the commit point: a task file or board row that log.md already declares closed is an interrupted completion — finish the removal; it is never a board omission, and a broken board link into `internal/maintenance/tasks/` is never an unwritten page. A superseded task retires the same way, its close-out naming what replaced it. Git and log.md hold the history (the same retirement pattern as product opportunities); a deleted task's full framing stays reachable via `git log --diff-filter=D -- internal/maintenance/tasks/ tasks/`.

In degraded mode (no `wiki` CLI) a task commission parks as a dated `inbox/` capture like any other material — and the parking message must say the task is not yet on the board and will not surface until inbox processing is requested.

### Knowledge gaps

A **knowledge gap** is a missing *structural* understanding: a whole topic, subsystem, or flow cannot be documented because the necessary source material is absent. A page-local question refines existing knowledge; a gap prevents the pages from being written at all. Both have task homes. A gap task names the missing topic, the documentation it prevents, and the source handoff or research that would close it.

The bar is high, and the list is curated, not performed:

- **Structural understandings only, not minutiae.** A question about an existing claim is ordinary task work. Call it a knowledge gap only when the missing understanding prevents a topic's pages from being written.
- **Never invent gaps to appear thorough.** Add one only when writing or reading a page genuinely ran into a wall. An empty gap list is a fine state.
- Each gap task states the topic, what it prevents, the material needed, and the next actor. Link it once from the appropriate backlog section; no separate board-only ask owns a second copy of the work.

### The loop, and the agent duties in it

1. **Creating or changing a page** → reconcile its review status with the drafts inventory and put every unresolved documentation question or unfinished action in a finite task with one board row. Once the claims and structure are correct, apply `voice.md` and its preflight to every added or changed paragraph without changing the sourced meaning. Then evaluate whether a missing structural understanding needs a source task, or whether the new content answers or narrows an existing task.
2. **The owner reviews a draft** (says what's right or wrong) → apply the corrections, run the voice preflight on every added or changed reader-facing paragraph, remove `status: draft`, and remove it from the draft inventory when the review is settled. If a correction changes a fact, term, or link restated elsewhere, follow `wiki backlinks` as in step 3.
3. **A question gets answered** → apply the supported answer to its owning page and every affected dependant, following `wiki backlinks`; preserve provenance without narrating the answer history in product prose. Retire the task only when its completion criteria are met. Route any resulting product-improvement candidate to an opportunity.
4. **New source material lands** (inbox processing, briefing, research pass) → reconcile question and source tasks, closing what it answers and narrowing what it partially covers. Check the truly blocked tasks' triggers (`wiki list --where type=task --where status=blocked --where next_actor=none`): fire, flip, or complete each as the material warrants. Record the pass in `internal/maintenance/log.md`.
5. **After any pass**, reconcile: every `status: draft` entry in the drafts inventory, nothing else (bar a documented unindexed draft); every `internal/maintenance/tasks/` entry has exactly one board row and vice versa; every task has a valid `status`/`next_actor` pair and its row sits in that actor's section; every row is a link, never prose; every row still explains who acts and what they do, and every truly blocked task has `next_actor: none` plus a real external trigger; no slug a log.md close-out already declares closed still has a file or a row; an `in-progress` task the current pass didn't park is an interrupted run to investigate; owner-input rows whose action is complete are removed or handed to the agent explicitly; knowledge-gap rows still honest. Then end the pass's log.md entry with a **`Board delta:`** tail — tasks added, merged, retired, or handed off (by slug, with status and next actor), owner asks added or resolved, gaps opened, closed, or narrowed; `none` when the board is untouched — so what a pass added, what can move now, and who moves it reads from the top of the log rather than from the session that ran it.

## Product opportunities

Documentation sometimes exposes a possible product improvement rather than an unknown about how the product works. Those ideas enter the **[product opportunity backlog](./internal/product-opportunities/backlog.md)** as temporary intake. Each candidate must be transferred to Linear or closed with a concrete relevance ruling through a finite triage task on the documentation backlog. Linear owns ongoing product planning and delivery; opportunity entries are retired when their disposition is recorded.

`type: opportunity` is the explicit flag for a product improvement. A suspected bug, unused implementation, or missing route affecting a live feature belongs here when its disposition still needs investigation or ticketing; it does not become a product-scope exclusion merely because the source is incomplete or misleading.

- Each distinct candidate gets one `type: opportunity` entry with `status: candidate` under `internal/product-opportunities/`. Reuse topic tags and link to the product areas it affects; do not file candidates beside current product behavior.
- The opportunity links to the current concept, capability, or pattern that gives it context. The collection's backlog is its navigation surface; capability pages and product-area indexes do not link back, so canonical navigation stays present-tense product truth rather than an inventory of missing functionality.
- A capability may still state a relevant user-facing scope boundary. What moves out is speculative improvement work or an implementation gap whose main value is informing product planning.
- The product backlog uses plain links, grouped by product area. Documentation questions and unfinished documentation work are tracked separately through task entries and their documentation-backlog rows.
- `status: candidate` means the idea is awaiting disposition. For relevant work, create or reuse a Linear issue, preserve the story or technical task, context and benefit, constraints, provenance, and remaining investigation, and verify the transfer. Record the original opportunity path and Linear URL in `internal/maintenance/log.md`, then remove the board row, resolve remaining backlinks, and delete the opportunity file. Retire the local record at transfer; implementation continues in Linear.
- Close irrelevant work with a concrete reason and supporting evidence or owner ruling in `internal/maintenance/log.md`, then remove its board row and file after checking backlinks. Git and the log preserve the disposition. Low priority alone does not establish irrelevance.
- A `ticket:` URL or `status: ticketed` left by an interrupted transfer is a cue to verify the handoff and finish retirement, not a standing local delivery queue. When an improvement ships, reconcile the verified outcome into the canonical pages through the normal release/documentation workflow.
- Every intake batch has a finite backlog task with a fixed cohort and a transfer-or-close completion boundary. Add new candidates to an appropriate pending triage task or commission a new bounded batch; do not keep an open-ended standing task. Keep the product board available as intake when empty.
- Query unticketed candidates with `wiki list --where type=opportunity --where status=candidate`.

## Grooming

Groom to make the base more findable. Don't restructure, rename, or re-file just because you can; only do it when it's needed.

- `wiki check`, then `wiki unresolved` (the to-write list) and `wiki orphans` (a concept nothing links to is **undiscoverable**, link it in from a related concept or the product index).
- Reread the stalest pages (`wiki list --sort=timestamp --reverse`) as the product changes.
- Watch for a concept explained in two places: merge to one and link.
- Reconcile the tag vocabulary (`wiki tags --counts`): merge near-duplicates, retire tags that earn nothing.
- The area map is not frozen: when a cluster outgrows its home add an area (or split one that grew too big), and `wiki move` the pages into it (see *Structure*), which rewrites the links as it goes. If general-purpose pages have collected at the root and a real area has emerged among them, that is the signal to file them. Keep it reasonably shallow, and let the graph keep crossing folders.

## Answering everyday questions

The graph is only as good as its linking, so **index well**: every concept linked from where it is relevant, `wiki orphans` empty, `wiki unresolved` worked down. Bad indexing shows up as unfindable pages.

Beyond AGENTS.md's general palette (`search`, `backlinks`/`links`, `unresolved`/`orphans`), the filters you reach for most here are by type and by cross-cutting tag:

```sh
wiki list --where type=concept                             # concepts (swap for guide / reference / example)
wiki list --where tags=deprecated                          # by cross-cutting tag (status/version/audience), any area
wiki list --where type=reference --where tags=deprecated   # combine fields (repeat --where = AND)
wiki list --where type=task --where status=ready --where next_actor=agent  # runnable agent tasks
wiki list --where type=task --where status=ready --where next_actor=owner  # actionable owner tasks
wiki list --where type=task --where status=blocked --where next_actor=none # truly blocked tasks
wiki list --prefix checkout/                               # everything for one product (multi-product layout)
```

- **"What is an idempotency key?"**: `wiki search "idempotency key"`, then `wiki read` the concept (every word by default; `--any` broadens, `--exact` matches the phrase).
- **"What must I understand first?"**: `wiki links <page>` (its prerequisites) and `wiki backlinks <page>` (what builds on it).
- **"What's missing or unreachable?"**: `wiki unresolved` (unwritten) plus `wiki orphans` (unlinked).

### Routing product questions

Use [Getting help](./application/getting-help.md) as the canonical service and contact reference. The rules below apply to agents answering users; keep the product explanations in their existing reader-facing homes so retrieval does not depend on loading internal design guidance.

| Request | Answer route |
| --- | --- |
| A goal beyond the standard platform capabilities | Check the relevant capability and [Aragon-deployed catalogue](./application/aragon-deployed-plugins.md) first. If the requirement needs new work, explain that Aragon offers custom development and provide the contact link from Getting help. Describe it as work to discuss and scope, without promising support or delivery. A missing search result alone does not establish that a feature is absent. |
| An existing capability deployed by Aragon | Explain what is supported after deployment, state the absence of self-service setup in the app, and provide the contact link. Use the catalogue and capability page for the configuration boundary; preserve client-specific availability. Contract-level deployment instructions do not establish a supported app setup flow. |
| Governance advice, configuration choices, or deployment planning | Give the relevant documented explanation and offer Aragon's paid governance advisory, including workshops, with the contact link. Name the decision the team can help with. General explanations do not establish that a particular configuration is safe or suitable. |
| An OSx question | Start with [Aragon OSx and the platform](./osx-and-the-platform.md). Answer at that level where sufficient; for deeper mechanics, follow its [protocol reference](./osx-and-the-platform.md#protocol-reference), read the relevant upstream page or section, and link to that specific destination. A technical question alone does not require a services referral; add one when the request also involves custom work, team deployment, or advisory. |
| An app problem or ordinary product-support request | Use the support-portal route in Getting help. |

For a services referral, include the actual external contact URL and a short description of what to ask for, using the project's stated goal and any known account, chain, or configuration. The reader supplies that context in the form; opening a contact link does not submit a request or book a workshop. Keep the published contact destination in Getting help and retrieve it from there.

### Links in answers outside the checkout

The OSx page pairs graph-checked local topic links with public GitHub pages. Use those routes to select the subject, then follow to the most specific entry or heading that answers the question. Avoid returning only the whole protocol index when a more precise destination is known.

For an external answer grounded in the pinned protocol snapshot, resolve a local `protocol-doc/<path>.md#<heading>` target to `https://github.com/aragon/protocol-doc/blob/<pinned-sha>/<path>.md#<heading>`. Obtain the SHA from the submodule pin recorded in [Protocol snapshot](./internal/maintenance/index.md#protocol-snapshot); normalize the path relative to `protocol-doc/` and preserve a verified heading fragment. For example, the local permission-system heading `protocol-doc/core/permissions.md#how-a-decision-is-made` maps to the same file and fragment below that GitHub base. Verify that the repository and destination are accessible before presenting the link.

The shareable `main` links on the OSx page follow the public documentation branch. Check them separately from `wiki check`, including their correspondence to the pinned content when refreshing them. Keep local submodule links as the canonical graph edges. Once a developer portal publishes these references, verify its actual page and anchor mapping before replacing the external destinations; do not invent portal routes or assume that an existing documentation site serves this bundle. Change the public link mapping without restructuring or copying the protocol entries into platform-doc.

## Make it yours

Nothing here is fixed beyond "every entry has a `type`." One product or many, `reference` split out or folded in, guides or none: reshape this file and the folders to fit.

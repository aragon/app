# How these docs work

This is the **workflow** layer for the Aragon platform product docs: the conventions on top of what [AGENTS.md](./AGENTS.md) and the `wiki` tool define. [voice.md](./voice.md) is the narrower prose layer: it governs how reader-facing platform content is written after this file has settled what the content is, where it belongs, and how it moves through review.

**Invoke the `wiki-cli` skill before your first `wiki` command, and before creating, editing, moving, or deleting any entry.** It carries the CLI mechanics this file assumes: the composite-root invocation, the query palette with verified flags, the `wiki check` gate, how to translate the POSIX recipes for this machine's shell, and the capture-only fallback when the CLI is missing. This file stays the *policy* layer — what the conventions are and why; the skill is *how to operate the tool* without stranding a link or checking the wrong root.

Before creating or substantively rewriting reader-facing prose, read the active [voice policy](./voice.md) in full after this file. Skip it for read-only questions, graph operations, path-only changes, and maintenance edits whose wording is already prescribed here.

## What this base is (and is not)

One product: the **Aragon platform**, the full-stack application for governing treasuries and protocols on EVM chains, built on the Aragon OSx protocol. This base documents the **business logic and semantic layer** — product concepts, rules, and design principles that don't exist verbatim in the contracts — so platform features (and the coding agents building them) stay consistent, coherent, and scalable.

**The dependency direction and scope boundary are hard:** [protocol-doc](./protocol-doc/index.md) is the pinned upstream protocol knowledge base, included here as the `protocol-doc/` git submodule; **platform-doc extends protocol-doc**. Protocol mechanics live upstream and are never restated here. If a fact is true of the contracts verbatim, it belongs there; if it is a product abstraction, rule, or principle, it belongs here. Platform pages link to the upstream mechanism and add the product meaning on top.

**Keep the three layers distinct:** *protocol mechanism → product capability → interaction pattern*. Each has its own vocabulary and questions: protocol docs define mechanisms, this base defines product meaning and capability, and design patterns define how that meaning is presented. A clean correspondence between layers is useful when it exists, but no layer is required to mirror another or smuggle in its concerns.

**Cross-bundle referencing convention:** link to protocol entries through the local submodule with a relative Markdown link — `./protocol-doc/core/dao.md` from a root page, `../protocol-doc/core/dao.md` from an area page. A branch-floating GitHub `blob/main` URL is external to `wiki`, so it cannot be target-, anchor-, or backlink-checked and is not an entry link. Exact upstream commit URLs are reserved for snapshot metadata such as the pin in [index.md](./index.md).

**Source material:** the `../app` (frontend) and `../app-backend` repos, the `../osx` contracts, and briefings from the product owner. The older `../aragon-knowledge-base` bundle's first slice (2026-07-06) has been mined into this base (entries carry `source:` fields pointing back into it; passes are recorded in [log.md](./log.md)); its protocol/mechanism pages stay in protocol-doc, and its base-internal ontology is not carried over.

**The shape:** areas `accounts/`, `governance/`, `treasury/`, `access-control/`, and `design/`, a `guides/` layer, and at the root the general-purpose [principles](./principles.md), [value proposition](./value-proposition.md), [repositories](./repositories.md), and [product scope exclusions](./product-scope-exclusions.md) pages plus the documentation and product-planning boards (cross-cutting by nature, they belong to no area) and the task entries under `tasks/` that the documentation board orders. Add areas as real clusters appear, not before.

This is **wiki-first product documentation**, in two layers:

- **Concepts, the graph.** Atomic `concept`, `reference`, and `example` entries, one idea per page, richly linked to each other. This is the substance, consumed *non-linearly*: you land on a page and follow links (`wiki links` / `backlinks`) to related ones.
- **Guides, the how-to layer.** `guide` entries help someone accomplish a concrete task in the Aragon platform when they do not yet know how. They start from the user's goal, walk through the decisions and actions in order, and **link into** concepts when deeper explanation is useful.

The concepts are the source of truth; guides apply them to user outcomes. Orientation for people reading or maintaining this knowledge base belongs in the root [index](./index.md) and the operating docs, not in a guide.

Product opportunities form a separate planning overlay: their entries are area-filed for classification and gathered on one root board, but they are not part of the canonical product graph until an implemented outcome is folded into the relevant current-product pages.

## Voice: reader-facing prose

The active [voice policy](./voice.md) applies to canonical platform entries, guides, reader-facing indexes, and product-opportunity prose. It is an operating document rather than a wiki entry: `wiki.toml` ignores it, so its policy status, references, and preflight checklist do not enter the product graph, canonical draft inventory, orphan report, or owner-question aggregate.

The responsibility order is deliberate: [AGENTS.md](./AGENTS.md) governs the graph and safe operation; this file governs product scope, structure, source handling, and review state; `voice.md` governs wording. Voice never authorizes a semantic change, cannot turn an inference or candidate into current behavior, and yields to factual accuracy, explicit task constraints, and the structure defined here. Apply it after the page's claims are source-grounded and its page type and location are settled.

Do not apply house voice while capturing source material into `raw/` or `inbox/`: clean it only as those sections permit and preserve every claim. Apply voice when that material is deliberately promoted into a reader-facing entry. The policy also excludes exact quotations, code and identifiers, the read-only `protocol-doc/` submodule, and maintenance artifacts such as tasks, `backlog.md`, `log.md`, these operating docs, and skills; their own local rules control their wording. A `status: draft` voice policy is advisory rather than active and is reviewed through a task if needed, never through the canonical-page drafts inventory.

**This bundle is git-managed.** Commits are its history and its undo; pull before editing and initialize the upstream with `git submodule update --init protocol-doc` after a fresh clone. **Agents do not commit unless asked to:** once the composite `wiki --root . check` passes, leave the batch uncommitted — the product owner reviews the diffs in their editor and commits themselves (or explicitly asks for a commit).

## Protocol-doc: read-only upstream and one composite graph

The parent repository pins one exact protocol-doc commit even though `.gitmodules` records `main` as the update branch. The pin named in [index.md](./index.md) is the protocol baseline for every platform page. The dependency is intentionally one-way:

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

The `wiki-cli` skill covers how to read each line of that gate (which findings are errors you must fix, which are the to-write list, and the one advisory to ignore). The submodule-status line must show the pinned SHA with a leading space; `-` means the upstream is uninitialized, `+` means it is checked out at a different commit, and `U` means it is conflicted. `wiki --root protocol-doc check` is a useful upstream-only diagnostic, but it never replaces the parent-root check: only the parent root verifies platform → protocol links and the combined vocabulary. The combined check emits one known advisory for `/protocol-doc/index.md` — `reserved file should carry no frontmatter` — because that file correctly carries `okf_version` as the upstream bundle root while the parent sees a nested index. Keep it indexed for its navigation edges; do not edit upstream or hide it from the composite config.

**Check upstream before writing overlapping material.** Search the whole graph, then narrow to the protocol subtree:

```sh
wiki search "<topic>"
wiki search "<topic>" --prefix protocol-doc/
wiki links /protocol-doc/<path>.md
wiki backlinks /protocol-doc/<path>.md
```

Read every relevant upstream hit before creating or changing the platform page. If protocol-doc already defines the mechanism, link to it and write only the product abstraction, rule, or consequence here. If both layers legitimately discuss the same term, make the platform page's added semantic layer explicit; do not leave two competing mechanism definitions.

Treat composite wiki queries and checks as read-only over upstream. Never run `wiki move` or a bulk mutator such as `wiki tidy --all` against `/protocol-doc/**`; after any parent-root mutation, confirm the submodule is still clean. When deliberately advancing the submodule pin, compare the new `protocol-doc/wiki.toml` with the parent config, merge any new types/ignores/orphan exemptions into the prefixed union, update the exact SHA and date in [index.md](./index.md), then run both the upstream-only diagnostic and the parent-root gate.

## Types

The composite vocabulary is enforced in [wiki.toml](./wiki.toml) and is the union of both bundles. Platform types in use are `concept` (an idea and why), `capability` (something a user can do in the app: its user promise and business logic), `pattern` (a reusable design rule — interaction, component, or content), `decision` (a deliberately chosen product rule: the current rule and the rationale for it — why the product behaves this way and not otherwise), `principle` (a cross-cutting product rule with enough rationale or examples to stand on its own), `reference` (lookup material), `guide` (a user-facing walkthrough for accomplishing a concrete Aragon task), `opportunity` (a candidate product improvement, not a current promise or roadmap commitment), `task` (executable documentation work waiting to be run; one entry per task under `tasks/` — see *Tasks*), and `note` (an authored maintenance board such as the [documentation backlog](./backlog.md) or [Product opportunities](./product-opportunities.md)). The union also declares `risk` (a known failure mode and its mitigations — currently no entries) and protocol-doc's `example` type. Add a new kind deliberately to the parent vocabulary; when upstream adds one, mirror it as part of advancing the submodule pin.

**Canonical product pages speak in the product's present tense.** Concepts, capabilities, patterns, decisions, principles, risks, and references describe how the product works now and the design principle behind it, never how it got there: no prior behaviors, reversals, or retired framings in page prose. Product opportunities are the explicit planning exception: they describe a candidate improvement while making clear that it is neither current behavior nor a roadmap commitment. Git and [log.md](./log.md) hold the history; the `source:` field holds provenance. When an owner answer changes a canonical page, rewrite the page to the new present rather than narrating the correction. Draft pages carry `status: draft` in frontmatter until validated by the product owner; provenance goes in a `source:` frontmatter field pointing at the material the page was distilled from. When several same-day briefings touch one page, collapse their citations into one `+ product-owner briefings (<date>, see log.md)` tail rather than enumerating them — the log entry carries the detail.

### Publication boundary: live product only

Canonical product entries and guides document a feature only after the product owner confirms it is live. Code presence, tests, deployed infrastructure, a public endpoint, or local/preview reachability does not establish product availability; nor may a feature flag downgrade a feature the owner confirms is live. `status: draft` describes the review state of a documentation page, not the rollout state of the feature it covers. A live but team-assisted capability may be documented as partially supported; that is distinct from a partially implemented feature, which stays out of the product graph.

In-development, partially implemented, dark-launched, and local/preview-only features stay outside canonical pages, guides, and documentation tasks until they launch. [Product scope exclusions](./product-scope-exclusions.md) is the source of truth for the current list: add a row when the owner rules a source surface not live, state the evidence-independent product state and the event that will reopen it, and remove the row when the owner confirms launch. Do not turn an exclusion into current product truth or a roadmap promise.

Unused, incomplete, or misleading code attached to a live feature is not automatically a scope exclusion. When it suggests a concrete product or implementation improvement, create a `type: opportunity` entry and list it on [Product opportunities](./product-opportunities.md); if it also concerns an excluded surface, link the candidate from that surface's **Product opportunity** column. Code presence and product state remain separate decisions.

## Structure

A product's canonical pages live in two physical layers: **graph pages (concept/capability/pattern/decision/principle/risk/reference) filed by area**, and the **user-facing `guides/` layer** beside them. Opportunity entries are an area-filed planning overlay, navigated through their root board rather than the canonical area maps. Task entries live in `tasks/`, not in the areas: a task is transient documentation *work*, not product knowledge, and it is retired on completion. Each area is a folder with its own `index.md`; every new area-owned canonical page is filed into the area it belongs to. The load-bearing principle collection described below is the deliberate cross-cutting exception. The root is not a dumping ground: it carries the front-door `index.md`, the general-purpose [principles](./principles.md) overview and its expanded entries under `principles/`, the [value proposition](./value-proposition.md), [repositories](./repositories.md), and [product scope exclusions](./product-scope-exclusions.md) pages, the [documentation backlog](./backlog.md), [Product opportunities](./product-opportunities.md), `tasks/`, `inbox/`, `raw/`, `log.md`, and the read-only `protocol-doc/` upstream submodule. An owner-private `research/` workspace may also sit here locally, but it is outside the portable knowledge base.

```
platform-doc/
├── index.md                    # front door: intro + links to guides and each area's key pages
├── principles.md               (type: concept)   load-bearing overview of the platform's principle set
├── principles/                 # expanded entries from that specific principle set, not a generic type folder
│   └── honest-abstraction.md   (type: principle)
├── value-proposition.md        (type: concept)   general-purpose: what the product promises
├── repositories.md             (type: reference) general-purpose: the source repos
├── product-scope-exclusions.md (type: reference) current implemented surfaces excluded until live
├── backlog.md                  (type: note)      the authored documentation review board
├── product-opportunities.md    (type: note)      product-improvement intake and ticketing board
│
├── protocol-doc/               # read-only upstream submodule; indexed into the composite graph
│   ├── index.md                # upstream protocol front door
│   └── ...                     # protocol concepts, references, examples, and guides
│
├── tasks/                      # task entries (type: task), one file per task; ordered by the backlog's rows, no index.md of its own
│   └── compare-stage-against-spp.md   (type: task)
│
├── guides/                     # user-facing how-tos (type: guide): the only layer not area-filed
│   ├── index.md                # available guides, organized by user goal
│   └── multisigs-in-advanced-governance.md
│
├── accounts/                   # an AREA: what a reader looks under (never a type)
│   ├── index.md                # area map: what's here + where to start
│   ├── account.md              (type: concept)     one area mixes types:
│   ├── account-creation.md     (type: capability)  concepts, capabilities,
│   ├── admin-plugin-by-default.md  (type: decision)  decisions, risks
│   └── last-process-removal.md     (type: decision)
│
├── governance/                 # an AREA
│   ├── index.md
│   ├── process.md              (type: concept)     related but DISTINCT pages
│   ├── body.md                 (type: concept)     co-located and linked, never merged
│   ├── proposal.md             (type: concept)
│   └── governance-designer.md  (type: capability)
│
├── treasury/                   # an AREA
│   ├── index.md
│   ├── vault.md                (type: concept)
│   ├── assets.md               (type: capability)
│   └── transactions.md         (type: capability)
│
├── access-control/             # an AREA
│   ├── index.md
│   └── scoped-authority.md     (type: concept)
│
├── design/                     # an AREA: the pattern library
│   ├── index.md
│   ├── full-screen-wizard.md   (type: pattern)
│   └── dialog-taxonomy.md      (type: pattern)
│
├── inbox/                      # cleaned owner/source captures (committed, index-ignored; see The inbox)
├── raw/                        # raw source captures (git-ignored, not wiki entries; see Ingesting)
├── research/                   # owner-private local research (git-ignored and index-ignored)
└── log.md                      # dated record of enrichment / sync passes (see Ingesting)
```

**Principles are a load-bearing collection.** [principles.md](./principles.md) owns the authoritative set and the short statement of every platform principle. When one principle accumulates enough rationale, examples, or exceptions to need an atomic page, that page lives under `principles/` and links back to the overview. This is a folder for expanded parts of this specific set, not a generic folder for everything with `type: principle`; area-specific rules and patterns remain filed in their owning areas.

**File by area, from the first page.** Group by **area, not by `type`** (an area folder mixes concepts, capabilities, decisions, and risks; there is no `concepts/` folder), keep it **one level deep**, and give each area its own `index.md`. Add a new area when a real cluster appears, not before, and don't pre-build a taxonomy of empty folders past the two or three you started with. This is a browsing aid, not a boundary: pages link freely across areas (define-once-link-everywhere), and the graph, not the tree, carries the relationships. Only guides are exempt from area-filing; they live in the `guides/` layer. A genuinely tiny product (a handful of pages that won't grow) can stay flat, but the moment a second related page appears, that is its area asking to exist.

**Multiple products?** Add one folder level, a folder per product (`checkout/`, `billing/`), each repeating the shape above (its own areas + `guides/` + `index.md`); the root `index.md` then links to each product. Keep it shallow either way.

## The entry point (`index.md`)

A reader (or an agent) lands on `index.md`. Make it the front door, hand-curated, not a dump of everything:

- An introduction to the product.
- Links to the **guides** (if any), for people who arrive with a concrete task to accomplish in Aragon.
- Orientation and links to the **key concepts** for readers who want to understand or change the product (the handful of pages the rest of the graph hangs off).

Keep the two routes distinct: guides serve platform users pursuing an outcome; the index's orientation and concept links serve people navigating the product model. Keep `index.md` to the important starting points, not every page, that is what queries are for.

## Concepts: the graph

Each concept is **one atomic idea**, defined **once**, and linked to what it relates to:

- **Define once, link everywhere.** A term is explained on its own page; every other page that mentions it **links** to that page instead of re-explaining it (a link is a reference, not a copy). This one rule is what keeps docs consistent: the definition changes in a single place.
- **Distinct ideas stay distinct.** Closely related or similarly named things (a type and its factory, a resource and its setup/lifecycle) are still separate concepts: give each its own page and link them. Being adjacent is a reason to link, not to merge. Atomic cuts both ways, don't split one idea across pages, don't fold two into one. And grouping is not merging: two closely related concepts can share an area folder (see *Structure*) and stay two distinct pages, the folder is where a reader looks, the link is how they relate.
- **Link generously.** The value is the graph. `wiki backlinks /payments/idempotency.md` shows everything that depends on the concept; `wiki links` shows what it builds on.
- **concept vs reference**: a `concept` explains an idea ("what idempotency is, and why"); a `reference` is precise lookup material ("the `/charges` endpoint and its fields"). Same graph, different texture. Split them when readers want "understand" apart from "look up"; merge them if that is overkill.

`wiki unresolved` is your **to-write list**: a link to a concept you haven't written yet is not an error, it is a promise. Writing docs is largely turning `unresolved` into pages.

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

Keep **provenance**: link a concept back to where it came from (a `type: source` entry, or a `source:` / `resource:` field), so a fact can be re-checked against the source later.

**Record each pass in `log.md`, dated and high-level.** One dated line per enrichment or sync pass (what source you covered, roughly what you added), not one per edit, git already holds the fine detail. On the next pass, read the last date and re-sync only what changed in the source since then, rather than re-deriving everything. For docs kept in step with a moving product, that dated, high-level trail is what makes incremental sync cheap.

Scale the ceremony to the job: a small, well-understood product can skip `raw/` and be written directly; a large or unfamiliar one benefits from the extract-then-iterate split. Either way, the unit is the **atomic concept**, never one monster page.

## The inbox

`inbox/` is the holding area for **cleaned but unstructured or incorrectly structured ideas**: valid, readable content that isn't yet shaped into entries. It differs from `raw/` on both axes — it is **committed to git** (its content is not regenerable: owner briefings, pasted notes, half-formed pages), and it is fed by the product owner rather than by an extraction pass (with one agent-fed exception: sessions without the `wiki` CLI park material here — see *Degraded mode* below). Raw verbal notes, unedited transcripts, and incoherent dumps do not belong here; clean them up first without changing their substance. Like `raw/`, it is excluded from the index (`wiki.toml` ignores `inbox/**`): nothing in it is listed, searched, linked, or checked.

Handling rules:

- **Everything in the inbox is a draft by definition** — unindexed, unreviewed, possibly contradictory or duplicating the wiki. Never treat inbox content as established fact, and never link wiki entries into `inbox/`.
- **Do not read, reference, or process the inbox unless the product owner explicitly requests it.** It can grow large, and processing it is deliberate, time-consuming work — a requested task of its own, never a side effect of answering a question or writing a page.
- **When asked to process it**, run the normal capture → refine → promote loop: mine an item into atomic entries (filed by area, linked in, `status: draft` until validated), `wiki check`, then **delete the mined material from the inbox** — like `raw/`, it is a shrinking worklist, and deletion is the "done" signal. Record the pass in `log.md`.

## Personal research

`research/` is the product owner's **private, local research workspace**. It deliberately lives beside the bundle for convenience, but it is not part of the portable knowledge base: both Git and `wiki.toml` ignore the whole subtree. Its files may use Markdown, frontmatter, and links for the owner's own organization without becoming indexed product truth.

- **Do not read, reference, or process `research/` unless the product owner explicitly requests it.** Personal research is not an ambient source for ordinary wiki work.
- **The boundary is one-way.** Private research may link outward to portable wiki entries for local navigation; committed entries, boards, tasks, and logs never link inward to private paths. Personal review work stays on `research/index.md`, not the documentation backlog.
- **Promote conclusions, never private paths.** When research produces durable platform knowledge, rewrite that conclusion into the normal area-filed entry or opportunity and give it portable provenance. Do not cite a local `research/` path that other clones cannot resolve.
- Git cannot recover or synchronize ignored files. If the material starts needing history, backup, or sharing, move the research workspace into its own private repository rather than weakening this boundary.

## Degraded mode: no `wiki` CLI

Before changing anything in the base, check that the `wiki` CLI is available (`wiki --version`). If it is not — not installed, and not installable in the session — **do not create, edit, move, or merge entries, and do not touch the board.** Without the tool there is no `wiki check` gate, no computed graph (collision, orphan, and backlink queries), and no safe `wiki move`; hand-maintained structure is unverifiable, so structure waits.

What a tool-less session does instead is **capture-only**:

1. Take the incoming material (a verbal briefing, a rough dump) and clean up the wording only: fix the flow so it reads coherently, but change no logic, drop no claims, add no interpretation. The result is the source made readable — not a draft page, so no frontmatter, no filing, no links into the base.
2. Save it as a dated file in `inbox/` (e.g. `inbox/2026-07-16-treasury-briefing.md`) for the owner to commit — the inbox is committed but unindexed, which is exactly the point.
3. Tell the owner the material is parked and why, so a later session *with* the tool can run the normal capture → refine → promote loop over it (per *The inbox* handling rules).

Read-only work — answering questions from the base — stays fine without the tool; it is mutation that waits.

## Documentation review: the backlog and open questions

The product owner needs **one place to go** to find documentation work waiting on them: **[backlog.md](./backlog.md)** at the root. It is an authored board (agents keep it current, `wiki` never edits it), and it is organized by **who moves next** rather than by what kind of record sits underneath: **Ready for your input** (owner work that is actionable now), **Ready to run** (agent work that is actionable now), **Not yet ready** (truly blocked work that neither actor can move, each row naming the state that would change that), and **Inventories** (the supporting drafts, page-questions, and unwritten-pages lists, kept discoverable but out of the action flow). Product-improvement candidates are deliberately routed to [Product opportunities](./product-opportunities.md) instead.

**Two rules keep that model from decaying.** *One item, one row, one section* — the section mirrors `next_actor`, so owner-actionable work sits in *Ready for your input*, agent-actionable work sits in *Ready to run*, and `status: blocked` work sits in *Not yet ready*. A task awaiting an answer, review, approval, or walkthrough the owner can provide now is **ready owner work, not blocked work**. *Position is the priority* — both actionable sections are deliberately ordered, and no second scheme is layered on top: no Now/Next/Later bands, no priority field, no impact labels, no unexplained markers. Every row instead carries a sentence saying why it is there, what it produces, and which surfaces it affects; a truly blocked row names the external state that must change. If an ordering needs justifying, that sentence is where the justification goes.

**Anything the owner can move now is a row in *Ready for your input*** — an answer a page's open question needs, a task whose next action is an owner review or ruling, a knowledge gap's standing ask for source material, or the standing draft review. An agent that creates an owner ask during a pass puts it there before the pass ends; the session's closing message only mirrors the board and never carries an ask the board lacks. Reading that one section is therefore always sufficient — nothing actionable lives only in a conversation. The query for task-shaped owner work is `wiki list --where type=task --where status=ready --where next_actor=owner`; `status=blocked` is never a synonym for “waiting on the owner.”

The underlying state always lives on the pages (or the entries), never on the board — with one exception:

- **A page needing review** carries `status: draft` in frontmatter. The board's drafts inventory lists it with a plain link while that status holds; `wiki list --where status=draft` is the authoritative query that inventory must reconcile with, and it is exhaustive: material under an ignored path (the owner's private `research/` workspace) stays off the board entirely rather than being listed as an exception.
- **An open question** lives *on the page it belongs to*, under a `## Open questions` heading, as a `- [ ]` checkbox item — contextualized where a reader needs it, and aggregated across the base by `wiki checkboxes` — read that aggregate minus the read-only `protocol-doc/` subtree, whose upstream checklists are procedural steps, not owner questions (`--prefix` scopes in, not out, so the exclusion is by eye or by prefix-scoping the platform folders). The board never copies the full list; the handful that block most are promoted to input rows, and the rest are answered as their pages come up for review. **An open question is only ever a genuine question — something a person (the owner, a customer) must answer.** Work an agent could execute is a task, and never a page checkbox.
- **A task** is a first-class entry in `tasks/` that owns its state in frontmatter; the board gives it one row, which owns only the ordering and the reason (see *Tasks*).
- **A knowledge gap** is the one exception: it lives *only* on the board, as an input row — a gap has no page to live on, and only source material closes it, which is what makes the owner the next actor.

### Tasks

A **task** is finite documentation work for one named next actor: the owner may review a ledger or settle a bounded ruling, while an agent may analyze a codebase, compare a page against a repo, build an inventory, or ground a taxonomy in a component library. Tasks are how both actors see **what they can do next**; knowledge gaps separately show what source material the owner can supply.

**One entry per task.** Each task is a first-class entry in `tasks/` (`type: task`) — AGENTS.md's native track-work model — so the work carries its full context instead of compressing into a board paragraph. Frontmatter: `title`, `tags` (area + cross-cutting, e.g. `maintenance`), `status` (`ready` | `in-progress` | `blocked`), `next_actor` (`owner` | `agent` | `none`), and `source` (who commissioned it, when). No `priority` field, no impact rating, and no dates: the board's order is the priority, and git carries time. A task names a **concrete, finite outcome** — never a standing process; recurring work gets a fresh task per run. A task never sits on a page as an `## Open questions` checkbox; a checkbox that turns out to be a task in disguise ("ground X in the code", "compare Y against Z") becomes a task entry and leaves the page.

`status` and `next_actor` answer different questions and must never be collapsed:

- `status: ready` means the named `next_actor` can act now. Use `next_actor: owner` for an actionable review, answer, approval, walkthrough, or source handoff; use `next_actor: agent` for executable documentation work.
- `status: in-progress` means the named actor has started and can resume the work. When work hands from one actor to the other, change it to `status: ready` and name the new `next_actor`; preserve partial work in `## Progress` rather than pretending the handoff is a blocker.
- `status: blocked` means **neither owner nor agent can act yet**. It always carries `next_actor: none` and an explicit `**Trigger:**` naming the external event or prerequisite that will make an actor able to move. Never use `blocked` merely because the owner is the next actor.

**Anatomy.** The lead paragraph (the concrete outcome, why it matters, what the task does *not* cover) and the closing **Done when** criteria are required; every other section exists only when it earns multiple bullets or real prose — fold a short one into the lead or a bold inline label (`**Trigger:** …`). A two-line task file is a correct task file. The why lives in the lead and *What this unblocks*; the action sections stay imperative and scannable — a cold session must be able to answer "what do I do?" and "is it done?" in one read.

- `## What this unblocks` — the pages waiting on the work, as links, each with what it is waiting for. These task→page links are the graph payoff: `wiki backlinks <page>` shows the pending work against a page, and the links clean themselves up when the task completes.
- `**Next action — <actor>:**` (optional) — a one-line restatement of the immediately actionable step when the lead and `next_actor` do not make it obvious. It must match frontmatter and must not describe the actor as a blocker.
- `**Trigger:**` (blocked tasks only) — the external event or prerequisite that makes action possible. An action the owner can perform now belongs under `## Work` or `**Next action — owner:**`, never under `Trigger`. When a trigger fires, set `status: ready` and name the actor who can move; if the firing material completes the task, run the completion sequence instead.
- `## Work` — the remaining work as plain bullets, pruned as they complete (task files are present-tense like every entry). Each bullet is an **imperative action** — lead with the verb and the artifact it produces; keep rationale to a trailing clause. **Never checkboxes** — `wiki checkboxes` (minus `protocol-doc/`) is the owner-questions aggregate — and never an `## Open questions` section: a genuine question discovered while drafting a task belongs on the relevant page (or is the task's trigger).
- `## Where to look` — repos, entry points, protocol-doc pages: the pointers that make the task runnable cold.
- `## Scope boundary` — explicit non-goals, when the task needs them.
- `## Done when` — the success criteria, one bullet per criterion, each answerable yes/no by a cold session against a named artifact (a page, a table row, a query result); the last criterion is always the completion sequence. A genuinely single-condition task may keep the inline `**Done when:** …` label instead.
- `## Progress` — dated one-liners, only when parking work across sessions. Writing its first bullet is what flips `status: in-progress`; a single-session run never touches status. An `in-progress` task found at session start is an interrupted or parked run: read its Progress section and git, then resume it. If the next step belongs to the other actor, flip it to `ready`, change `next_actor`, and move its one board row to that actor's section.

**One task per surface-and-source-set.** Two commissions that would mine *different sources into the same pages*, or the *same source into one page's same section*, are one task: merge them, keep every claim and pointer from each, and name the merge in the surviving entry's `source:` field. Splitting by source rather than by outcome is what produces tasks whose first instruction is "check whether the sibling task has already run" — a dependency that should have been a merge. Merging is not a licence to bundle: two tasks that happen to share an *area* but produce independent pages stay two tasks, and a merge that makes a session unreviewable is too big.

**The board owns ordering and reasons; entries own their state.** Each row is `**[<task>](./tasks/<slug>.md)** — <why it is here, what it produces, and the surfaces it affects>`. The section mirrors both fields: `next_actor: owner` with `status: ready` or `in-progress` sits in *Ready for your input*; `next_actor: agent` with `status: ready` or `in-progress` sits in *Ready to run*; `status: blocked` with `next_actor: none` sits in *Not yet ready*. The row states the actor and action plainly when either could be ambiguous; it never says “blocked on you” when the owner can act. Every row is a link to a task entry, never a prose item. Cite a task by its entry link — in prose or log.md, by its slug — never by row position: rows renumber.

**Order by rework avoided, not by size.** In *Ready to run*, put work that settles shared vocabulary, a shared mechanism, or an area's framing ahead of the work that would otherwise re-invent or contradict it; product semantics ahead of the presentation layer that renders them (the three-layer rule above); cheap passes that several later rows depend on early; and scattered small-fact passes last, once the pages that will host their facts exist. Where two rows write the same page's same section, their relative order *is* the write order — say so in the later row, and have it cite the earlier row's output rather than restate it. A forward link to a page a later row will create is a promise, not an error (`wiki unresolved` tracks it), so a dependency in that direction never forces a reorder.

**Only the board links into `tasks/`.** Canonical pages, indexes, and log.md never do — they name a task by plain-text slug when they must refer to one (the same one-way discipline as `inbox/` and the opportunities board). This is what keeps both safety nets honest: a task nothing links to shows up in `wiki orphans` (a board omission — provided nothing else links it, which this rule guarantees), and deleting a completed task can never strand a link into `wiki check` warnings or the `wiki unresolved` to-write list.

**Completion is one sequence, log first:** (1) fold the close-out into the pass's dated log.md entry, naming the task by slug — what shipped, what diverged, what was deferred and to where (any `## Progress` bullets worth keeping fold in here); (2) remove its board row; (3) delete the task file; (4) the composite `wiki --root . check` gate. The log close-out is the commit point: a task file or board row that log.md already declares closed is an interrupted completion — finish the removal; it is never a board omission, and a broken board link into `tasks/` is never an unwritten page. A superseded task retires the same way, its close-out naming what replaced it. Git and log.md hold the history (the same retirement pattern as product opportunities); a deleted task's full framing stays reachable via `git log --diff-filter=D -- tasks/`.

In degraded mode (no `wiki` CLI) a task commission parks as a dated `inbox/` capture like any other material — and the parking message must say the task is not yet on the board and will not surface until inbox processing is requested.

### Knowledge gaps

A **knowledge gap** is a missing *structural* understanding: a whole topic, subsystem, or flow the base cannot speak about because no source material covers it. It is more than an open question — an open question refines a page that exists ("which networks are supported?"); a gap means the pages can't be written at all ("how the advanced governance flow works"). Gaps are how the owner sees **what source material to feed next** — by dumping material into `inbox/`, giving a briefing, or pointing an agent at a source to research.

The bar is high, and the list is curated, not performed:

- **Structural understandings only, not minutiae.** If it is a genuine question that could sit as a `- [ ]` on an existing page and end in a question mark, it is an open question; if it is work to execute, it is a task entry queued on the board; a gap means the pages can't be written at all.
- **Never invent gaps to appear thorough.** Add one only when writing or reading a page genuinely ran into a wall. An empty gap list is a fine state.
- Each gap states the topic, why it is structural (what it blocks), and what source material would close it.

### The loop, and the agent duties in it

1. **Creating or changing a page** → make sure it is linked from the backlog's drafts inventory, its genuine unknowns are `- [ ]` items under `## Open questions`, and any executable work it surfaces becomes a task entry with its own board row instead. Once the claims and structure are correct, apply `voice.md` to reader-facing prose and run its preflight without changing the sourced meaning. Then **evaluate for gaps, in both directions**: did writing this page hit a fundamental hole in understanding (add a gap, if it clears the bar), and does the new page's content answer or narrow an existing gap (prune or adjust it)?
2. **The owner reviews a draft** (says what's right or wrong) → apply the corrections, re-run the voice preflight on substantively rewritten reader-facing prose, remove `status: draft`, remove it from the board. If a correction changes a fact, term, or link restated elsewhere, follow `wiki backlinks` the same as step 3.
3. **A question gets answered** → fold the answer into the page body and delete the checkbox (an answered question is content, not a checked box). If the answer exposes a possible enhancement rather than more current-product truth, promote that idea to a product opportunity instead of leaving it as a capability-page question. If the answer changes other pages, follow `wiki backlinks`.
4. **New source material lands** (inbox processing, briefing, research pass) → after mining it, cross-reference the gap list — close what it covered, narrow what it partially covered — **and the truly blocked tasks' triggers** (`wiki list --where type=task --where status=blocked --where next_actor=none`): fire, flip, or complete each as the material warrants. Record the pass in `log.md`.
5. **After any pass**, reconcile: every `status: draft` entry in the drafts inventory, nothing else (bar a documented unindexed draft); every `tasks/` entry has exactly one board row and vice versa; every task has a valid `status`/`next_actor` pair and its row sits in that actor's section; every row is a link, never prose; every row still explains who acts and what they do, and every truly blocked task has `next_actor: none` plus a real external trigger; no slug a log.md close-out already declares closed still has a file or a row; an `in-progress` task the current pass didn't park is an interrupted run to investigate; owner-input rows whose action is complete are removed or handed to the agent explicitly; knowledge-gap rows still honest. Then end the pass's log.md entry with a **`Board delta:`** tail — tasks added, merged, retired, or handed off (by slug, with status and next actor), owner asks added or resolved, gaps opened, closed, or narrowed; `none` when the board is untouched — so what a pass added, what can move now, and who moves it reads from the top of the log rather than from the session that ran it.

## Product opportunities

Documentation sometimes exposes a possible product improvement rather than an unknown about how the product works. Those ideas live on **[product-opportunities.md](./product-opportunities.md)**, not in a capability's `## Open questions` list and not among documentation knowledge gaps.

`type: opportunity` is the explicit flag for a product improvement. A suspected bug, unused implementation, or missing route affecting a live feature belongs here when its disposition still needs investigation or ticketing; it does not become a product-scope exclusion merely because the source is incomplete or misleading.

- Each distinct candidate gets one area-filed `type: opportunity` entry with `status: candidate`; do not create an `opportunities/` folder, because the product area remains its stable home.
- The opportunity links to the current concept, capability, pattern, or decision that gives it context. The root board is its navigation surface; capability pages and area indexes do not link back, so canonical navigation stays present-tense product truth rather than an inventory of missing functionality.
- A capability may still state a relevant user-facing scope boundary. What moves out is speculative improvement work or an implementation gap whose main value is informing product planning.
- The root board uses plain links, grouped by area. It is not a checkbox list: `wiki checkboxes` remains the aggregate of documentation questions.
- `status: candidate` means the idea has not become delivery work. When a product-backlog ticket is created, add its URL in a `ticket:` field, change the opportunity to `status: ticketed`, and move its board link from **Candidates** to **Ticketed** (create that section when first needed); the external tracker owns implementation state. When the change ships, fold the outcome into the canonical pages, record it in `log.md`, and retire the opportunity entry — Git and the external ticket retain the planning history.
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

## Make it yours

Nothing here is fixed beyond "every entry has a `type`." One product or many, `reference` split out or folded in, guides or none: reshape this file and the folders to fit.

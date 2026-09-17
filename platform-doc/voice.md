---
schema_version: "1.0"
document_type: voice
voice_id: aragon-platform-doc
policy_version: "1.1.0"
scope: platform-doc
locales:
  - en-US
status: active
owner: Aragon product team
last_reviewed: "2026-08-05"
references:
  - ./WORKFLOW.md
  - ./principles.md
  - ./accounts/account.md
---

# Voice

## 1. Contract

### Applies to

- Reader-facing prose in canonical platform entries: concepts, capabilities, patterns, decisions, principles, risks, and references.
- Platform guides and the reader-facing parts of root, area, and guide indexes.
- Product-opportunity entries and their board copy, with the planning modulation below.
- Prose created when source material is promoted from `raw/`, `inbox/`, or requested research into a wiki entry.

### Does not govern

- Product facts, protocol behavior, API behavior, or code correctness.
- Documentation information architecture, page-type requirements, frontmatter, link structure, task state, or review workflow; [WORKFLOW.md](./WORKFLOW.md) governs those.
- The read-only `protocol-doc/` submodule, conversational agent responses, or content outside this repository.
- Verbatim quotations, code, identifiers, addresses, function signatures, or literal UI labels being reported as current product evidence.
- Source capture in `raw/` or `inbox/`, where fidelity to the source outranks house style.
- Operating and maintenance material such as `AGENTS.md`, `WORKFLOW.md`, skills, tasks, `backlog.md`, and `log.md`; their local instructions govern their wording and structure.
- Universal accessibility rules, legal requirements, security policy, or localization policy.

### Precedence

1. Preserve factual and technical accuracy; never invent product behavior or turn a candidate into a commitment.
2. Obey higher-priority system, safety, legal, accessibility, explicit task, [AGENTS.md](./AGENTS.md), and [WORKFLOW.md](./WORKFLOW.md) constraints.
3. Preserve the meaning of supplied material unless the task authorizes a semantic change and evidence supports it.
4. Apply the narrowest matching surface or audience rule.
5. Apply global **MUST** and **MUST NOT** rules.
6. Apply **SHOULD** preferences and examples as calibration, not as text to copy.

### Normative language

- **MUST / MUST NOT:** deterministic constraint. A violation blocks completion of the affected prose.
- **SHOULD / SHOULD NOT:** strong preference. Depart only when a more specific rule, source constraint, or explicit task requires it.
- **MAY:** optional behavior.

### Activation and fallback

Only a policy with `status: active` is normative. A draft voice file is advisory and its review is tracked as documentation work, not as a canonical-page draft.

When no surface rule matches, use the global rules. When equally specific rules conflict, choose the form that preserves accuracy, clarity, and the reader's ability to act; report a material unresolved conflict instead of silently inventing a new rule.

## 2. Operational summary

Explain the Aragon platform as a precise product model: define the thing, state what it enables or changes, and connect it to protocol mechanics only when those mechanics affect the reader's understanding. Write with calm confidence and high information density, without promotional inflation or assumed familiarity. Start from the reader's goal in guides and from the product object in canonical pages; make limits and consequences visible before they can surprise the reader.

## 3. Core dimensions

| ID | Dimension | Aim | Boundary | Observable signals |
|---|---|---|---|---|
| `V-D01` | Semantic precision | Give each product object one stable meaning and distinguish adjacent concepts. | Do not collapse product abstractions into protocol primitives or use near-synonyms casually. | Definition before elaboration; canonical terms; contrasts only where they resolve a real ambiguity; links to the owning concept. |
| `V-D02` | Honest abstraction | Expose the product-level model while preserving the route to relevant onchain facts. | Neither front-load implementation detail nor hide a detail that changes a decision, limit, or consequence. | Product meaning first; mechanism linked; limits and uncertainty stated where they matter. |
| `V-D03` | Calm utility | Help the reader understand or act without hype, pressure, or condescension. | Do not advertise, dramatize, or minimize the reader's work. | Direct verbs; neutral claims; unsupported praise absent; no “easy” or “obvious” framing. |
| `V-D04` | Deliberate structure | Make the page's purpose and the relationship between its claims visible on a scan. | Do not turn every sentence into a heading or every paragraph into a list. | Outcome- or definition-led opening; descriptive headings; one main claim per paragraph; lists only for real sets or sequences. |

## 4. Rules

Use one observable instruction per row. Hard constraints stay separate from preferences. Check expressions are optional review aids; `wiki check` does not execute them.

| ID | Level | Scope | Category | Instruction | Rationale | Deterministic check |
|---|---|---|---|---|---|---|
| `V-R001` | MUST | global | accuracy | State current behavior in the present tense and qualify any availability, support, or evidence limit at the point it affects the claim. | Readers must be able to distinguish product truth from a partial or conditional route. | `—` |
| `V-R002` | MUST | canonical | opening | Open with a direct definition of the page's object before its history, rationale, implementation, or examples. | A graph reader may land on the page without prior context. | `—` |
| `V-R003` | MUST | guide | task framing | Open with the outcome and place prerequisites or availability limits before the first action. | A user should know whether the guide fits before investing effort. | `—` |
| `V-R004` | MUST | global | terminology | Use the canonical product term for the layer being described and preserve exact technical names in code formatting. | Layer-aware vocabulary is part of the product model. | `—` |
| `V-R005` | MUST | global | causality | Name the relevant actor, action, and user-visible consequence when explaining a rule or state change. | Vague agency hides how governance and authorization work. | `—` |
| `V-R006` | MUST | global | literals | Reproduce quoted copy, identifiers, addresses, function names, and signatures exactly; put explanatory voice around them rather than rewriting them. | Evidence and executable details must remain verifiable. | `—` |
| `V-R007` | MUST NOT | global | accuracy | Present a candidate, aspiration, likely behavior, or incomplete inference as current behavior or a roadmap commitment. | Documentation is a source of current product truth. | `—` |
| `V-R008` | MUST NOT | global | tone | Describe a task, concept, or decision as easy, obvious, trivial, or something the reader can “just” do. | Minimizing language conceals prerequisites and patronizes readers who encounter friction. | `—` |
| `V-R009` | MUST NOT | global | tone | Use unsupported promotional superlatives or claims such as “best-in-class,” “revolutionary,” or “seamless.” | The docs explain the product; they do not manufacture evidence. | `—` |
| `V-R010` | MUST NOT | canonical | layers | Use a product abstraction and its protocol substrate interchangeably when the distinction affects meaning. | Product capability and protocol mechanism answer different questions. | `—` |
| `V-R011` | SHOULD | global | syntax | Prefer plain words, active constructions, and a concrete subject over formal or inflated phrasing. | Direct syntax makes dense product logic easier to follow. | `—` |
| `V-R012` | SHOULD | global | structure | Give each paragraph one main claim and use a list only for a genuine set, contrast, or sequence. | Structure should reveal relationships rather than decorate prose. | `—` |
| `V-R013` | SHOULD | global | constraints | Put a material constraint, exception, or irreversible consequence before the action or conclusion it changes. | Readers should not discover a decisive limit after acting. | `—` |
| `V-R014` | SHOULD | guide | address | Address the reader as “you” and write actions as direct imperatives. | Guides serve a person pursuing an outcome. | `—` |
| `V-R015` | SHOULD | canonical | stance | Keep explanations object-centered and neutral; use “you” only for a genuine reader decision or consequence. | Canonical pages define the model rather than simulate a walkthrough. | `—` |
| `V-R016` | SHOULD | global | terminology | Explain an unfamiliar product term at first use or link to the entry that owns its definition. | The graph should support readers arriving from any page. | `—` |
| `V-R017` | SHOULD NOT | global | syntax | Attach a negated foil to a claim — “X, not Y”, “this is X, not a Y”, a “Do not …” heading — unless a reader in this context would actually reach reading Y. When the misreading is real, show where it comes from or what it would break; when it is only conceivable, state X and stop. | A foil that answers no real confusion adds length without information, and a real confusion deserves the explanation itself. | grep for `, not ` and `rather than`; each hit must name a misreading the surrounding text gives the reader a reason to have. |

## 5. Surface map

Create a separate surface only when it changes the default voice or adds a hard constraint.

| Surface ID | Surface or user state | User goal | Modulation from default | Hard constraints | Rule refs | Example refs | Checks |
|---|---|---|---|---|---|---|---|
| `canonical` | Concept, capability, pattern, decision, principle, risk, or reference entry | Understand the current product model or a precise lookup fact. | Definition-led, object-centered, and explicit about the product/protocol boundary. | Current truth only; distinguish abstractions whose difference affects behavior. | `V-R001`, `V-R002`, `V-R004`, `V-R005`, `V-R010`, `V-R015` | `V-E01`, `V-E03` | `—` |
| `guide` | A person completing a concrete task in Aragon | Decide whether the route fits, perform it, and recognize completion. | Outcome-led, second person, imperative, and chronological. | State availability and prerequisites before actions; end with a done state. | `V-R001`, `V-R003`, `V-R013`, `V-R014` | `V-E02` | `—` |
| `navigation` | Root, area, or guides index | Choose a useful starting point or route through the graph. | Short, scannable, and organized by reader goal or product area. | Do not duplicate definitions or enumerate every entry. | `V-R011`, `V-R012`, `V-R016` | `V-E04` | `—` |
| `planning` | Product-opportunity entry or opportunity-board copy | Evaluate a candidate improvement without confusing it with current behavior. | Concrete about the present gap and proposed outcome; restrained about value. | Label candidate state; never imply delivery commitment or silently rewrite canonical truth. | `V-R001`, `V-R007`, `V-R009` | `V-E05` | `—` |

## 6. Terminology

Voice policy routes terminology to its authoritative product entry; it does not replace those definitions.

### Protected terms

| Canonical form | Forbidden variants | First-use rule | Notes |
|---|---|---|---|
| `account` | `DAO` in product or experience copy | Link to [Account](./accounts/account.md) when the distinction is material. | Use `DAO` for the OSx protocol entity, an exact protocol/code identifier, or an explicitly token-governed use case whose token context is visible in the passage; [Account](./accounts/account.md) owns the copy rule. A legacy UI label using `DAO` is a product-copy defect awaiting rollout, not target copy for these docs to mirror. |
| `governance process` | `body` when referring to the end-to-end decision-to-execution flow | Use `governance process` on first use, then `process`. | [Governance process](./governance/process.md) owns the definition. |
| `body` | `process` when referring to who supplies preferences to a decision | Link on first use when the process/body distinction matters. | [Body](./governance/body.md) owns the definition. |
| `action` | `transaction` when referring to one target/value/calldata call | Link when an action is first introduced in a technical explanation. | Several actions may travel in one transaction; [Action](./governance/action.md) owns the distinction. |
| `Aragon platform` | `Aragon App` when referring to the whole product model | Use the full form on first use. | Use `Aragon App` only for the application client or the formal product name in quoted positioning. |
| `OSx` | `OSX`; `Osx` | Expand as `Aragon OSx` when the audience may not know the protocol. | Preserve repository, package, and contract identifiers exactly. |

### Preferred and avoided choices

| Use | Avoid | When | Reason | Exceptions |
|---|---|---|---|---|
| `use` | `utilize` | General prose | Shorter and more direct. | A quoted source. |
| `can` | `is able to` | Describing capability | Keeps the actor and capability visible. | When ability must be contrasted with permission or availability. |
| `currently available only in …` | `unsupported` | A supported route exists in a limited environment or through the team. | Names the actual boundary without implying impossibility. | Use `unsupported` when the product deliberately offers no supported route. |
| `people`, `members`, `token holders`, or the named actor | `users` | The role affects the claim. | Governance behavior depends on who acts. | Use `users` when role distinctions do not matter. |
| `the app displays`, `the indexer derives`, or the named component | `the system knows` | Explaining behavior or state. | Concrete subjects make evidence and responsibility traceable. | Conversational examples where no component distinction matters. |

### Forbidden phrases

| Phrase | Reason | Exceptions |
|---|---|---|
| `simply` / `just` as minimizers | Hides prerequisites or effort. | Literal UI copy, quotation, or a non-minimizing time/quantity meaning such as “just before execution.” |
| `obviously` / `of course` | Treats missing context as a reader failure. | Verbatim quotation. |
| `seamless` / `frictionless` | Usually an untestable promise. | A sourced, explicitly bounded product claim. |
| `best-in-class` / `revolutionary` | Promotional rather than explanatory. | A clearly attributed quotation. |

## 7. Calibration examples

Each pair isolates named rules; examples calibrate structure and tone, not product facts to copy elsewhere.

### V-E01: Define the product object before its mechanism

- **Surface:** `canonical`
- **Do:** “A body describes who supplies preferences to a governance decision. A plugin may represent that body at the protocol layer.”
- **Do not:** “A body is a plugin contract that implements a voting interface.”
- **Why:** The first version preserves the product abstraction and then names a possible substrate.
- **Rules demonstrated:** `V-R002`, `V-R004`, `V-R010`

### V-E02: Put availability before guide actions

- **Surface:** `guide`
- **Do:** “This route is currently available only in the development environment. For a production account, prepare the configuration below and give it to the Aragon team.”
- **Do not:** “Open the advanced flow and configure the stages. Note that production accounts cannot open this flow.”
- **Why:** The reader learns the route's limit before beginning it.
- **Rules demonstrated:** `V-R001`, `V-R003`, `V-R013`, `V-R014`

### V-E03: Name actor, action, and consequence

- **Surface:** `canonical`
- **Do:** “When a plugin calls `DAO.execute`, the account calls each action target as itself, so the target sees the account as the caller.”
- **Do not:** “Actions are executed through the normal route.”
- **Why:** The concrete version exposes both agency and the user-relevant authorization consequence.
- **Rules demonstrated:** `V-R005`, `V-R006`

### V-E04: Route from an index without copying definitions

- **Surface:** `navigation`
- **Do:** “Start with [Governance process](./governance/process.md) to understand how proposals reach execution, then [Body](./governance/body.md) for who supplies each decision.”
- **Do not:** “Governance process: a full definition copied from its page. Body: another full definition copied from its page.”
- **Why:** An index should help the reader choose a route while the entries own their definitions.
- **Rules demonstrated:** `V-R012`, `V-R016`

### V-E05: Keep a planning candidate distinct from a commitment

- **Surface:** `planning`
- **Do:** “Candidate: expose verified write functions without requiring the author to add the same address again.”
- **Do not:** “Aragon will soon make every contract action seamless.”
- **Why:** The first version names the proposed outcome without a delivery promise or unsupported value claim.
- **Rules demonstrated:** `V-R007`, `V-R009`

### V-E06: Attach a foil only to a real misreading

- **Surface:** `canonical`
- **Do:** “A bodyless stage is a timelock, not an empty or failed voting state.”
- **Do not:** “Admin is meant as a transitional bootstrap, not an end state.”
- **Why:** The first excludes a reading the interface actively invites — a stage rendering no votes looks failed or empty — so the foil carries information. The second denies a reading nobody holds: “transitional” already excludes an end state, so the foil is dead weight.
- **Rules demonstrated:** `V-R011`, `V-R017`

## 8. Edge cases

| ID | Case | Required behavior |
|---|---|---|
| `V-X01` | No exact surface matches. | Apply the global rules and choose the nearest surface by the reader's goal, not by filename alone. |
| `V-X02` | Several equally specific rules conflict. | Preserve accuracy and clarity, then report a material unresolved policy conflict. |
| `V-X03` | A requested style conflicts with a hard voice rule. | Follow the higher-priority explicit constraint unless it would invent or obscure product truth; state the conflict when it materially affects the result. |
| `V-X04` | Applying voice would reduce clarity or technical accuracy. | Preserve clarity and accuracy, then apply as much voice as remains compatible. |
| `V-X05` | Existing prose conflicts with voice while receiving an unrelated factual edit. | Fix local violations touched by the edit; do not broaden the task into an unsolicited full-page rewrite. |
| `V-X06` | Source wording is uncertain, contradictory, or incomplete. | Preserve the uncertainty, seek or record the missing answer through the workflow, and do not smooth it into a stronger claim. |

## 9. References

| ID | Path | Load when | Required for default use? |
|---|---|---|---|
| `V-REF01` | `WORKFLOW.md` | Before any content mutation; it owns scope, structure, and review state. | yes |
| `V-REF02` | `principles.md` | When prose makes a cross-cutting product or abstraction claim. | no |
| `V-REF03` | `accounts/account.md` | When prose or quoted UI copy refers to an account or DAO. | no |

## 10. Preflight

Before finalizing reader-facing prose, verify:

- [ ] The requested surface and narrowest matching override were identified.
- [ ] Every applicable **MUST** and **MUST NOT** rule was satisfied.
- [ ] Protected terminology uses the canonical form for the layer being described.
- [ ] Meaning, technical accuracy, and explicit task constraints were preserved.
- [ ] Availability, evidence limits, and material consequences appear before they affect a decision.
- [ ] Relevant examples were used as calibration rather than copied as a template.
- [ ] Any unresolved conflict or missing rule was reported instead of silently invented.

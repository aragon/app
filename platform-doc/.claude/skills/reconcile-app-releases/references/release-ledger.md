# Structured release ledger and coverage format

Use this temporary working format to turn an unstructured owner briefing and official release notes into a complete reconciliation plan. It is deliberately more explicit than the eventual canonical pages: its job is to prevent dropped claims, blurred evidence, duplicate pages, and narrow feature-only updates.

## What good structured release notes do

Good notes let a reader answer, without returning to the raw dump:

- What changed for a user, operator, builder, or governed organization?
- Why was it changed, and what outcome does it support?
- Where does the change appear in the product journey?
- Is it live, gated, account-specific, network-specific, or only present in code?
- What is explicitly out of scope or still unknown?
- Which owner statement, official release item, and tagged-code observation support the claim?

Preserve the business meaning rather than polishing it away. Normalize names and split compound thoughts, but never merge distinct changes, drop caveats, upgrade guesses into facts, or rewrite code evidence as owner intent. Keep fact, inference, and question visibly different.

A brain dump need not answer every field. It covers a release when it provides the product intent for that release or explicitly says the release has no user-facing business context. Missing detail becomes an unknown; absent context for the whole release means the agent pass has not started.

## Normalization rules

- Give every atomic owner claim and official release item a stable ID such as `1.39.0-owner-01` or `1.39.0-gh-03`.
- Quote or closely preserve the source statement in its evidence lane, then add a separate clean explanation. Do not replace the source with the interpretation.
- Write the clean explanation in product language: actor, action or change, outcome, location in the journey, availability, and boundary.
- Classify the item as a capability, workflow, design pattern, availability or scope change, defect repair, or implementation/dependency change. Classification guides mining; it does not determine whether a new page exists.
- Keep one primary item per row. When one source sentence makes three promises, split it and retain the shared source pointer.
- Add code-only findings with their own IDs. They require a disposition, including “no documentation change” when the observation does not change product understanding or a reader decision. Completeness applies to the working ledger, not to the detail published in articles.
- Add one `<version>-chains` item for every included release, even if no note mentions chains. Use the skill's extractor against the previous and current immutable tags; preserve the app commits, locked viem versions, and its JSON delta. An empty delta means no chain-data change, not a skipped check.
- Record “no documentation change” only with a concrete reason.

## Working template

```markdown
# App release working ledger

Interval: (`@aragon/app@<documented-through>`, `@aragon/app@<observed-latest>`]
Owner briefing: <cleaned inbox source>
Official releases: <URLs>
Created: YYYY-MM-DD

## Release `@aragon/app@<version>`

Published: YYYY-MM-DD
Tagged commit: `<full SHA>`

### Owner context

- Intended change:
- Why it matters:
- Audience and user outcome:
- Live, rollout, and scope boundary:
- Known caveats or intentionally non-product work:
- Explicit unknowns:

### Structured release items

| ID | Kind | Clean product explanation | Product area and journey | Availability or boundary | Owner evidence | Official evidence | Code evidence needed | Provisional disposition |
|---|---|---|---|---|---|---|---|---|
| `<version>-owner-01` | capability | ... | ... | ... | source passage | linked release item or none | paths/behavior to inspect | existing page / update / new page / owner task / agent task / opportunity / exclusion / no change |

### Code-only findings

| ID | Observation pinned to tag/commit | Why it might affect product truth | Owner publication evidence | Disposition |
|---|---|---|---|---|
| `<version>-code-01` | ... | ... | confirmed / absent / conflicts | ... |

### Supported-chain check

- Item ID: `<version>-chains`
- Previous tag / exact commit / locked viem:
- Current tag / exact commit / locked viem:
- Extractor command and JSON result:
- Added / removed / changed chains, or explicit no chain-data change:
- Support-selection consumer diffs checked; any change to extraction semantics:
- Reference table/provenance updated and affected dependants reconciled:
- Final disposition and successful reference check:

## Coverage and disposition matrix

| Item ID | Canonical owner candidate | Existing pages searched and read | Links/backlinks and dependent surfaces checked | Canonical edits and cross-links | Task, opportunity, or exclusion | Final disposition and reason |
|---|---|---|---|---|---|---|
| ... | ... | ... | ... | ... | ... | ... |

## Completion record

- Source coverage: every owner claim, GitHub item, and code-only finding has an ID.
- Graph coverage: every ID names the existing pages and dependants checked.
- Evidence coverage: version-sensitive code claims are pinned to release-era tags or commits.
- Chain coverage: every included release has a supported-chain check and disposition, including unchanged releases; application/supported-chains.md passes the extractor's --check against the final tag.
- Publication boundary: live claims have owner evidence; code-only ambiguity is routed, not published.
- Disposition coverage: every ID has one final disposition and reason.
- Navigation coverage: new or changed relationships are discoverable without creating link noise.
- Queue coverage: every unfinished documentation item, including questions and source gaps, has a finite task and one board row; opportunities and draft status remain in their own inventories.
```

Do not carry this table or its editorial narration into reader-facing product documentation. Apply [the product-content boundary](../../../../WORKFLOW.md#product-content-and-documentation-operations): publish the supported facts, preserve provenance and history in their assigned homes, and put unfinished work in tasks before retiring processed working material.

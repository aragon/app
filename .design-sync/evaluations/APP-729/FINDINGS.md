# APP-729 — what the runs established

Nine graded/attempted runs under `runs/` — eight timestamped directories plus
`reachability-N5`. (`runs/candidate/` and `runs/old/` hold pre-protocol capture
material and are not runs.) Each records its own evidence; this file records what
each one settled so the conclusions survive the records.

Read with `PROTOCOL-v2.md` (method) and `RUN5-HANDOFF.md` (the comparison that
closed the series).

## The runs

| Dir | Shape | Outcome | What it settled |
|---|---|---|---|
| `20260925T133856Z` | two-arm A/B | `incomparable` | The comparative design cannot gate a merge. Both arms scored `required[6]` at 0.74–0.78; a null is the expected result even when the bundle is sound. Reframed as a single-arm acceptance gate. |
| `20260927T232116Z` | acceptance | FAIL | `required[6].4` — revisions did not match. Root cause was operator, not bundle: `GOVKIT_KIT_ROOT` pointed at an `aragon/app` worktree, so the payload emitted `aragon/gov-ui-kit` links to commits that repo never had. Produced APP-1235. |
| `20260928T004141Z` | acceptance | FAIL | `required[6].3` — `_preview/AddressesInput.js` L110-120 cited for a provider stack the lines do not contain. First instance of the recurring failure: the model cites a real file at a real line that does not carry the claim. |
| `20260928T083803Z` | acceptance | FAIL | Same class, fresh session and frozen key. Confirmed the citation defect reproduces across sessions and is not session noise. |
| `reachability-N5` | N=5 reachability | `invalid` | Methodological: a shared project retains the handoff file across draws. Draw 1 created it; 2 and 3 edited it; 4 returned the same path. No draw is independent. **Every run needs a new project and chat.** |
| `20260929T082320Z` | confirmation replicate | VOID | Design routed the probe into an automatic design-system issue-fixing flow instead of answering it. Operator hazard, not a bundle result. |
| `20260929T094027Z` | acceptance | FAIL | Classified `generated-output noncompliance`. `required[0..5]` clean; `required[6]` failed on props, defaults, revisions and unknowns together. |
| `20260929T125156Z` | acceptance, fixed key | `incorrect` | `required[6]` splits: props, defaults, revisions and marked-unknowns all satisfied; eight `_ds_bundle.js`/`_preview` line citations do not contain their claims. Isolated the defect to citation resolution alone. |
| `20260929T152851Z` | **Run 5**, two-arm | `EQUIVALENT` | Control and candidate each win one criterion. Candidate: better citation/provenance resolution (23/1/1 vs 20/3/1), worse composition — it claimed `.map()` collapses rows to one child. Control: correct composition, wrong editable/accepted-state description. Both usable with corrections. |

## What carried across the series

**The gate earned its cost.** The first acceptance run (`20260927T232116Z`)
caught a consumer-visible defect that three passing tests and 702 matching
hashes did not: emitted URLs pointing at commits absent from the repository
named in the link. Run 5 (`20260929T152851Z`) caught a
second: composition guidance inverted against the component's own shipped
example.

**Citation resolution was the persistent failure, not content.** Across
`004141Z`, `083803Z`, `094027Z` and `125156Z`, `required[0..5]` were satisfied
every time. The failures concentrated in one place: claims attributed to file
and line spans that do not carry them. Run 5's candidate improved this
measurably and it was the criterion the candidate won.

**Composition semantics were never represented as data.** Run 5's `.map()`
error was not a prose bug. Selection and composition knowledge for App-owned
components lived in prompts, previews, README text and post-processing
overrides, with no registry entry and nothing validating generated guidance
against a shipped example. That is APP-1243.

**Two exceptions were frozen before runs and applied after.** APP-1225 (absent
prop defaults is a bounded limitation) and audit-time revisions in
`registry-report.md` are not a second revision family. Neither was ever shown to
a grader.

## Operating rules the runs produced

Each was learned by losing a run to it.

1. New project **and** new chat per run. A retained handoff is a warm start.
2. Freeze the prompt, key and thresholds before the run; never adjudicate after
   seeing a result.
3. Grade blind, in a separate session — handoff plus key plus payload read
   access, no ticket numbers, no exception rules.
4. `GOVKIT_KIT_ROOT` is a **GovKit** checkout. An `aragon/app` worktree
   containing `packages/gov-ui-kit` produces links to commits that do not exist.
5. Capture the artifact from served bytes, not editor state.
6. Verify the upload after it lands: file count, `guidelines/` contents,
   re-read and hash critical files. Pre-upload hashes are not delivery.

## Open follow-ons

- **APP-1243** — registry-backed App composition. Fixes Run 5's losing criterion.
- **APP-1224** — nothing runs the staleness check. Two guards scoped; not built.
- **APP-1236** — `AddressesInput.Container` overrides caller field keys.
- **APP-1225** — prop defaults absent from emitted declarations.

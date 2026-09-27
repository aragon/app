# APP-1220 merge gate — bundle acceptance test

Status: prep. Supersedes the delta framing. The 2026-09-25/26 attempt is
**void** (see `runs/20260925T133856Z/`).

## 0. What this test is, and what gates the PRs

`PROTOCOL-v2` names two separate questions. Only the first can gate a
merge:

1. **Acceptance** — is the delivered bundle usable, revision-identifiable
   and complete enough for the workflow? Pass/fail. **This is the gate.**
2. **Incremental value** — do the added context pieces beat the old
   bundle? Comparative, needs many probes, and a null is the expected
   result even when everything works. **This cannot gate anything.**

The earlier prep specified question 2 (two arms, randomized order, delta
scoring) and called it the gate. That was the framing error: it made a
research instrument into a release blocker, and a null result would have
read as failure when it means nothing of the sort.

**Run one arm.** Push the rebuilt bundle to a fresh project, ask the
frozen probe, and check whether an agent can actually reach and use the
delivered context. No baseline arm, no randomization, no delta.

Gate verdict:

- **Pass** → APP-726/727/728/735/736/1208/1223 are clear to merge.
- **Fail** → the named reachability/coverage defect is the blocker; fix
  and re-run the single arm.

Keep the comparative question for a separately scheduled study. It is
not a merge prerequisite and must never be reported as one.

## 1. Why the last attempt does not count

| Fact | Evidence |
| --- | --- |
| Candidate arm had no payload tree | Project `c33d6b53-7057-4dd6-b5fb-9ea0a8d647ae` root is `handoffs/`, `uploads/_ds_bundle.js`, `_ds_manifest.json`, `_adherence.oxlintrc.json`. 574 of 575 payload files absent. |
| Wrong ingestion path | Created via the UI "Create design system → Create here → browse" wizard, which compiles the upload into a single `uploads/_ds_bundle.js` and discards the sources. The sanctioned path is the design-sync skill's MCP push, which lands files at project root. |
| Candidate arm was warm-started | An aborted earlier run in the same project had already written `handoffs/dao-wizard-member-step.md`; the graded run overwrote that same path. |
| Baseline was mutated | The production arm wrote `handoff/members-step-handoff.md` into `2f22a679…`, against `NOTES.md:202` ("Do not update the original Design baseline"). |

Per `PROTOCOL-v2.md` outcomes table: *"Arms differ outside the allowed
context delta → incomparable for causality; preserve outputs and repair
setup before any separately authorized rerun."*

## 2. What the delta actually is

The question is whether APP-726's registry/selection-guide and the
maintained guidance materially help. Neither existing project contains
them:

| Path | `2f22a679` baseline | `e6b58c10` 2.11.4 candidate | current `ds-bundle` |
| --- | --- | --- | --- |
| `components/` `_preview/` `_vendor/` `fonts/` | yes | yes | yes |
| `README.md` | yes | yes | yes |
| `_ds_sync.json` | yes | yes | n/a (emitted) |
| `guidelines/index.md` | no | no | **yes** |
| `guidelines/context/index.md` | no | no | **yes** |

`e6b58c10`'s README *names* `selection-guide.json` / `registry.json` but
those bytes were never delivered — the gap `README.md` already records
and commit `29d9a8a66` corrected in prose. So no pairing of the two
existing projects can answer the incremental-context question. A fresh
push of the current payload is a prerequisite, not an optimisation.

`remote-diff.mjs:43` ships `guidelines/**` + `README.md` as the `aux`
partition, so a normal push delivers them once they exist locally.

## 3. Artifacts — run 1 payload, superseded by APP-1235

**Do not rebuild with the kit root recorded here for run 1.** It is the
cause of the run 1 failure. See the corrected value below.

```sh
cd /Users/kd-m2air/.herdr/worktrees/app-next/app-1208   # APP-1223-closure @ 2b512b90d
GOVKIT_KIT_ROOT=/Users/kd-m2air/Local/gov-ui-kit node .design-sync/refresh.mjs
node --test .design-sync/refresh.test.mjs   # 3/3 pass
```

### `GOVKIT_KIT_ROOT` must be the standalone kit repo

`apps/app` consumes published `@aragon/gov-ui-kit@2.11.4` through the
catalog, and that package's metadata names `aragon/gov-ui-kit`. Source
references have to describe the revision that package was cut from, and
`REPOSITORIES.kit` in `overrides/docs.mjs` already names that repo.

Use `/Users/kd-m2air/Local/gov-ui-kit` at `64b517f5`, the *Publish
v2.11.4* commit. Its `package.json` reads `2.11.4`.

```sh
git -C "$GOVKIT_KIT_ROOT" rev-parse HEAD    # 64b517f5b90052797ecaced5f15ab616b5733f30
git -C "$GOVKIT_KIT_ROOT" show HEAD:package.json | grep '"version"'   # 2.11.4
```

Neither the installed package nor the npm registry records a `gitHead`
for 2.11.4, and the `v2.11.4` tag (`427794cf`) carries `package.json`
`2.11.3`, so the publish commit is the best-evidenced coordinate. If a
`gitHead` ever appears, prefer it.

**What went wrong in run 1.** The rebuild used
`/private/tmp/app-594-govkit-source/packages/gov-ui-kit`, a worktree of
`aragon/app`. That recorded kit commit `e06fbb8d`, which does not exist
in `aragon/gov-ui-kit` — `git cat-file -t` fails there. Combined with the
correct repository constant it emitted links to a sha that repo has never
had, and the gate failed on exactly that. The constant was never wrong.

`packages/gov-ui-kit` on `main` also reads `2.11.4`, so the canonical
coordinate flips to `aragon/app` + `packages/gov-ui-kit` once releases
cut from the monorepo. Until then the monorepo path produces dead links.
APP-1235 carries the guard that makes that transition fail loudly.

- Payload: `/Users/kd-m2air/.herdr/worktrees/app-next/app-1208/ds-bundle`
  - `.payload-manifest.json` sha256 `ff2d30437993b16e811c3f17f84dba74b3752c1ccb9dd7d2453dadd0984c257f`
  - `.ds-build-meta.json` sha256 `c4a11a165c53cc50785eceec83fb7e054c061aa76c11bd1cfbb29242b4173ac3`
  - `source.commit 8a3ea8c8`, `dirty: []`; kit `2.11.4` @ `e06fbb8d`
  - `payload.upload.files`: 575
  - superseded, do not cite: manifest `57f59808…`

  `source.commit` tracks the last commit touching *scanned app source*
  paths, so it stays at `8a3ea8c8` even though HEAD is `2b512b90d` — the
  APP-1223 commit only touched `.design-sync/`. Converter and guidance
  identity are fingerprinted separately (`converter.sourceSha256`,
  `guidance.*Sha256`). Not a defect; record HEAD alongside it.

**The delivery gap is closed.** `guidelines/` now ships 5 files in the
upload partition:

```
guidelines/index.md
guidelines/context/index.md
guidelines/context/registry-report.md
guidelines/context/selection-guide.json
guidelines/context/source-index.md
```

This is the material the audit recorded as missing from every previous
project — the registry report and selection guide are now delivered
bytes, not README references.

- Scope: APP-726, 727, 728, 735, 736, 1208, 1223. **Not** APP-1224, APP-1225.
  APP-1225 (prop defaults) is the sub-issue closest to the probe's
  `required[6]`; its absence bounds what this run can show.
- Frozen probe: `runs/20260925T133856Z/probe.json`
  - model `Opus 5`, effort `Medium`
  - `prompt` is the exact 829-char submitted message — reuse verbatim
  - the frozen `randomByteHex: ba` / "candidate first" order was drawn
    for a two-arm comparison and does not apply to a single-arm gate
- Answer key: `runs/20260925T133856Z/answer-key.json` (7 required, 4 incorrect)

## 4. The gate run — one arm

A **fresh disposable project** (`PROTOCOL-v2` §"Integrity and
accepted-code gate"). Never run in, or push to, `2f22a679…`.

- New empty Claude Design project.
- Push the rebuilt `ds-bundle` complete, including `guidelines/**`.
- One chat, zero prior turns, Opus 5 / Medium, the frozen prompt verbatim.

No second arm. Nothing is being compared: the question is whether an
agent handed this bundle can reach and correctly use the delivered
context.

### Pass conditions — frozen 2026-09-26, before the run

These thresholds are fixed now, ahead of any output. In the void run the
≥0.7 / <0.5 cutoffs were picked *after* seeing scores, which makes a
"gate" post-hoc judgement. Do not renegotiate these once a result
exists; if they prove wrong, record that and re-freeze for a later run.

**Who grades, and blind.** The grader is a session that has not seen
this prep, the bundle's provenance, or which revision produced the
output. It receives exactly: the produced handoff, `answer-key.json`,
and read access to the delivered payload for citation checking. It is
not told the bundle is a candidate, nor that PRs depend on the verdict.

**Per-criterion scoring.** For each of the 7 `required` and 4
`incorrect` entries, the grader returns satisfied / not satisfied with a
quoted span from the handoff as evidence. A criterion with no quotable
evidence is **not satisfied** — absence is not a pass.

**Thresholds.**

| Condition | Requirement |
| --- | --- |
| `required` 0–6 | all 7 satisfied |
| `incorrect` 0–3 | none committed |
| Cited paths | every source path or reference resolves in the delivered payload |
| Context reachability | the handoff demonstrably uses `guidelines/context/selection-guide.json` or `registry-report.md` for a component choice |

All four must hold. This is pass/fail, not a score.

**Citations are checked mechanically, not judged.** Resolve every cited
path and line range against the payload; a grader probability is not
evidence. In the void run `cand_bad3` came back 0.40 — meaningless until
the citations were resolved by hand, which showed no invention at all.

**Context reachability is the criterion that matters most here.** The
registry report and selection guide have never previously been delivered
to any project. If the handoff never consults them, the acceptance
question is answered "no" regardless of how good the prose is.

### The one pre-adjudicated exception

`required[6]` asks for exact required props and reachable
revision-matched references. APP-1225 records that the bundle carries 2
of 79 upstream prop `defaultValue`s. That deficiency is known, is
explicitly **not** gating, and is filed separately — so it must not be
able to fail this gate by the back door.

Decided now, before any result:

- `required[6]` failing **solely** because default values are absent →
  recorded as a bounded limitation against APP-1225. **Does not block
  the merge.** The other 6 required criteria and all 4 incorrect
  criteria still apply in full.
- `required[6]` failing for **any other reason** — wrong prop names,
  unreachable paths, unresolvable references, invented contracts → a
  genuine gate failure.

**This exception is never shown to the grader.** Telling it the rule
leaks that a bundle with a known defaults gap is under test, which
breaks the blindness the gate depends on. The split:

- **Grader** reports `required[6]` factually — which sub-claims hold,
  which fail, each with a quoted span. It is given no exception, no
  ticket numbers, and no hint that any deficiency is expected.
- **Evaluator** (not the grader) reads that factual report and applies
  the exception when computing the verdict.

If the grader's `required[6]` failure spans reference only missing
default values, the exception applies. If they reference anything else,
it does not. No other criterion has an exception.

### Verdict

- **Pass** → APP-726/727/728/735/736/1208/1223 are clear to merge.
- **Fail** → record the specific reachability or coverage defect. That
  defect is the blocker; fix it and re-run the single arm. A failure
  names a bug, it does not condemn the bundle wholesale.

### Not part of this gate

A comparative arm (old bundle, or this payload with `guidelines/**`
withheld) answers the incremental-value question. It is a separate,
separately-authorized study, it needs many probes to mean anything, and
a null result there is expected even when the bundle is perfect. Do not
make it a merge prerequisite.

## 5. Invocation

Per `NOTES.md:116`, absolute paths are required:

```sh
cd /Users/kd-m2air/.herdr/worktrees/app-next/app-1208
export GOVKIT_KIT_ROOT=/path/to/gov-ui-kit
node .ds-sync/resync.mjs \
  --config .design-sync/config.json \
  --node-modules "$PWD/apps/app/node_modules" \
  --entry "$PWD/apps/app/node_modules/@aragon/gov-ui-kit/dist/index.es.js" \
  --out ./ds-bundle \
  --remote .design-sync/.cache/remote-sync.json
```

Requirements and gotchas:

- Needs the **DesignSync MCP** connected — `lib/remote-diff.mjs:18` notes
  `get_file` "only it has auth". `resync.mjs` computes scope; the agent
  performs the writes.
- `config.json` hardcodes `projectId: 2f22a679-7abb-4283-9f39-e28a63dba83b`
  (the baseline). **Point it at the new Arm A project id before pushing**,
  or the push overwrites the baseline.
- A new project has no anchor: omit `--remote` (or let the fetch fail) →
  full first-sync scope, everything uploads.
- `_ds_sync.json` ships **last** (`NOTES.md:200`).
- Run `pnpm --workspace-root run design-sync:build-css` after any
  `pnpm install` — install prunes the `apps/app/node_modules/@` junction.

## 6. Baseline cleanup

`2f22a679…` carries a stray `handoff/members-step-handoff.md` from the
invalid run. Remove it through the push's own `upload.deletePaths`
sequence (`remote-diff.mjs:39`) on the next legitimate baseline sync, or
via the file browser row menu. Do not instruct the baseline's chat agent
to delete it — that adds another turn to the project being restored.

## 7. Record per arm

Per `PROTOCOL-v2` §"Observation and stopping":

- The generated handoff file bytes (not the chat summary), saved to the run dir
- Project id, chat url, model/effort as displayed
- Chosen composition, prop correctness, provider boundaries, state ownership
- References actually followed, with reachable revision-matched targets
- Unsupported contracts or invented policy; human interventions

Do **not** estimate tool calls, latency or cost from collapsed tool
labels — explicitly barred by the protocol. My earlier contamination
argument leaned on those labels and is withdrawn; the incomparable
verdict rests on the missing tree and the pre-existing artifact.

## 8. Disposal

Delete `c33d6b53-7057-4dd6-b5fb-9ea0a8d647ae` — wrong ingestion,
contaminated, no tree. Keep `e6b58c10…` as historical v1 evidence; do not
reuse it as an arm.

## 8. Execution split (2026-09-27)

No single session has both capabilities. Divide it:

| Step | Who | Why |
| --- | --- | --- |
| Push payload to the gate project | session with **DesignSync MCP** | only it has write auth (`remote-diff.mjs:18`) |
| Run the probe chat, capture handoff bytes | session with **browser/relay** | the artifact lives behind `claudeusercontent`, not in the chat text |
| Grade (blind) | fresh subagent | must not have seen this prep |
| Apply the exception, compute verdict | evaluator | see §4 — the grader never sees the rule |

### Write set — verification aid, NOT the plan

`gate-upload-files.txt` / `.json` list the 575 payload paths with hashes.
Use them to **verify** the push landed, and to confirm the frozen
manifest sha. Do **not** pass them as the plan's `writes`.

`finalize_plan` takes glob patterns, verbatim from
`.ds-sync/storybook/SKILL.md:279`:

```
writes: ["components/**", "tokens/**", "fonts/**", "_vendor/**",
         "_preview/**", "guidelines/**", "_ds_bundle.js",
         "_ds_bundle.css", "styles.css", "README.md",
         "_ds_sync.json", "_ds_needs_recompile"]
deletes: []          # empty project, nothing to reconcile
localDir: "./ds-bundle"
```

An under-scoped `writes` list silently and permanently desyncs the
project; full writes are the safe default and are idempotent.

Do not use `resync.mjs` to compute scope — it runs `package-build`
first, which rebuilds `ds-bundle` and moves the frozen manifest sha.

### Push order — four phases, not one flat write

`_ds_needs_recompile` is a **sentinel**, not an ordinary payload file. It
fences the app's manifest/copy machinery against a half-uploaded state.
Per `SKILL.md:290-295`:

1. **Sentinel first** — `write_files` with only `_ds_needs_recompile`.
2. **All content writes** — chunked to <=256 files per `write_files`
   call under the same `planId`. The server also bounds payload *bytes*:
   batch `fonts/` and other binary-heavy dirs smaller; on a 500, halve
   the chunk and retry.
3. **Deletes** — none here (empty project).
4. **Sentinel re-arm, then `_ds_sync.json` last**, in its own
   `write_files` call.

`_ds_sync.json` is the absolute final write. Uploaded early, a mid-plan
failure leaves the anchor vouching for files the project does not have,
and deterministic rebuilds mean no later sync repairs them.

**Any write/delete failure that retries do not clear means STOP** — no
sentinel re-arm, no `_ds_sync.json`. An un-anchored project merely
re-verifies next sync; a fresh anchor over a half-applied upload is
permanent.

If `finalize_plan` is denied, stop and report it (`SKILL.md:286`).
Denial means the session cannot approve, not that the arguments were
wrong.

Finish with `list_files` and confirm the count and tree:

```
components/  guidelines/  _preview/  _vendor/  fonts/
README.md  styles.css  _ds_bundle.css  _ds_bundle.js
_ds_needs_recompile  _ds_sync.json
```

`guidelines/` must contain all five files. If it does not, stop — that is
the gate failing at delivery, before the probe is worth running.

### config.json hazard

The gate project id is written into `.design-sync/config.json`, replacing
the production `2f22a679…`. **Leave that edit uncommitted, and revert it
when the run finishes.** Committing it would point the repo's design-sync
config at a disposable evaluation project, and the next routine sync
would push production content there instead of to the baseline.

## 9. Phase-2 chunk payloads (2026-09-27)

The pushing session's classifier denies enumerating paths under
`ds-bundle/`. The `write_files` arrays are therefore precomputed as prep
artifacts — ready-to-paste `[{path, localPath}]`, all paths relative to
`localDir: "./ds-bundle"`.

Currency (`SKILL.md:297`): the pushing session verified the live
`ds-bundle/` against `gate-upload-files.json` immediately before upload —
575 paths, every byte count and sha256 agreeing, manifest sha still
`ff2d3043…c257f`. The list is current, not carried over stale.

Send in this order, same `planId`, after the sentinel is already written:

| # | File | Files | MB |
| --- | --- | --- | --- |
| 1 | `gate-chunk-01-bundle-js.json` | 1 | 5.18 |
| 2 | `gate-chunk-02-vendor.json` | 2 | 1.11 |
| 3 | `gate-chunk-03-css-docs-fonts-guidelines.json` | 11 | 0.93 |
| 4 | `gate-chunk-04-preview.json` | 103 | 0.63 |
| 5 | `gate-chunk-05-components-a.json` | 228 | 0.39 |
| 6 | `gate-chunk-06-components-b.json` | 228 | 0.40 |
| 7 | `gate-chunk-sentinel.json` — **re-arm** | 1 | — |
| 8 | `gate-chunk-anchor.json` — `_ds_sync.json`, own call | 1 | — |

573 content + sentinel + anchor = 575. Every chunk is <=256 files; the
5.18 MB bundle ships alone because the server bounds bytes as well as
count. On a 500, halve the chunk and retry.

Chunk 3 carries all five `guidelines/` files — the material the gate
exists to verify.

Deletes: none, the project was empty. Phase 3 is a no-op.

STOP rule unchanged: any write failure retries do not clear means no
sentinel re-arm and no `_ds_sync.json`.

## 10. Run 1 outcome and the fix on the critical path (2026-09-28)

Run `runs/20260927T232116Z/` returned **FAIL**. Six of seven required
criteria, all four incorrect criteria and context reachability passed.
`required[6]` failed on sub-claim `.4`, revision matching — **not** on
default values, so the APP-1225 exception did not apply. Blocker filed as
[APP-1235](https://linear.app/aragon/issue/APP-1235).

### Frozen before run 2: emitted URLs count

An unresolvable upstream URL that the **payload itself emitted** counts
against the "every cited source path or reference resolves" condition.
The bundle is the thing under test; handing the model a broken link is a
bundle defect, not a model error. In run 1 the handoff copied
`github.com/aragon/gov-ui-kit/blob/e06fbb8d/...` verbatim from
`guidelines/context/source-index.md:997`.

Decided now so it is not decided after seeing run 2's result.

### Why the cheap fix was rejected

A prose-only pass (revisions in `conventions.md`, `REPORT.md`,
`tokens/README.md`, plus the manifest field) is free — none of those
bytes are keyed. But the grader listed the unresolvable URL as a finding
**separate** from the revision mismatch, and under the adjudication above
it fails the same condition. A prose-only run 2 would likely fail again
and burn a gate cycle.

So both halves land together, accepting the cost:
`.ds-sync/lib/sync-hashes.mjs:146-147` hashes every `.mjs` under
`overrides/` into the global config slice, and `sourceKeyFor:188-189`
folds that slice into every component source key. Editing
`overrides/docs.mjs` therefore moves all 114 keys — `changed`, grades
cleared, not a grades-kept spot-check. Full capture and re-grade required.

No escape hatch: `configSlicesFor:142-144` keys fork behaviour off file
bytes precisely so a config map cannot mask it.

### Run 2 preconditions

Beyond the identity gate in §3, assert before pushing:

```sh
grep -rlE '3c9bb798|8d70bdf0|64b517f5' ds-bundle/                            # empty
grep -c 'github.com/aragon/gov-ui-kit' ds-bundle/guidelines/context/source-index.md   # 0
```

Prompt, answer key, thresholds, blind-grading rule and the APP-1225
exception are unchanged. Draw nothing new; run 2 is the same single arm.

### Run 2 uses a new project

`cf7d7d99…` now holds run 1's handoff. Reusing it, or its chat, gives run 2
the warm start that voided the 2026-09-25 attempt: the model would find a
prior answer at the path it writes to. Create a new empty project, push
the rebuilt payload, run one fresh chat.

Keep `cf7d7d99…` as run 1 evidence. Delete `c33d6b53…`, the invalid
2026-09-25 project, whenever convenient.

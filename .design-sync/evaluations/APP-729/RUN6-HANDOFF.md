# Run 6 — production control versus APP-1243 registry candidate

Same shape as Run 5. One variable moved: the candidate's App-owned components now
carry registry entries with composition contracts, and prompts project those
contracts instead of converter prose. Run 5 ended `EQUIVALENT` with the candidate
losing composition and winning citations; this run tests whether the composition
loss is closed without giving up the citation gain.

Requires a Claude Code session with **DesignSync MCP** and an authenticated
browser relay. Do not run it from a session without both.

## Inputs, frozen

| | |
|---|---|
| Candidate bundle | `/Users/kd-m2air/.herdr/worktrees/app-next/app-1243/ds-bundle` |
| Candidate branch | `APP-1243` @ `950ef4711`, tree clean |
| Manifest sha256 | `d23b3a415f6fd818346850b51bfc37e28b6f3633b9545b6761742a3e7598aa08` |
| Upload set | 575 files, 8,844,487 bytes |
| Embedded app revision | `49eb62525f777956b7b4c27ee81bf23db5355113` |
| Kit | `aragon/gov-ui-kit` `64b517f5…`, v2.11.4 |
| Production control | Design project `2f22a679-7abb-4283-9f39-e28a63dba83b` |
| Probe | `runs/20260929T152851Z/prompt.txt`, sha256 `c6ee953bb00600ae05f1b5a1188a1dadda7afa9b81eb698d4c8aa9231b99e3c3` |
| Rubric | `runs/20260929T152851Z/GRADER-BRIEF-RUN5.md`, sha256 `9e034b7bc4955ade744fa6be11f86ef750cb0d3affe70fc3ba158c29f02a82dc` |
| Model / effort | Opus 5, Medium |

Verify both frozen inputs against `runs/20260929T152851Z/frozen-inputs.sha256`
before sending anything. If either hash differs, stop.

## Steps

**1. Create two fresh empty Design projects.** One control, one candidate. Never
reuse a project or chat from any prior run — a retained handoff file is a warm
start and voids the run (`reachability-N5`).

**2. Populate the control byte-for-byte from production.** Copy from
`2f22a679…` on the server. Do not rebuild, re-emit, or normalise it. Never push
to or mutate `2f22a679…` itself.

**3. Upload the candidate through DesignSync.** Order matters: sentinel
`_ds_needs_recompile` → content chunks ≤256 files → deletes (none) → sentinel
re-arm → `_ds_sync.json` **last**. Uploads are full writes; do not scope by
`.sync-diff.json`, which is computed against an anchor a new project does not
have.

**4. Verify ingestion on both arms before probing.** `list_files` = 575 on the
candidate, `guidelines/` = 5 entries. Re-read and hash the critical files from
the **served** copy and compare against `.payload-manifest.json`. Pre-upload
hashes are not delivery evidence. Spot-check that
`guidelines/context/source-index.md` names `64b517f5` and that
`components/forms/AddressesInput/AddressesInput.prompt.md` contains
`"mappedArrays": "supported"`.

**5. Run the probe once per arm, in a fresh chat each.** Frozen prompt verbatim,
Opus 5 / Medium, zero prior turns, no follow-ups, no retries, no corrections. If
Design routes the probe into its own design-system fixing flow, the run is void —
record it and start over (`20260929T082320Z`).

**6. Capture each handoff from served bytes,** not Monaco/editor state. Record
sha256 and byte length for both.

**7. Grade each arm in its own fresh grader session.** Give the grader only the
handoff artifact, the rubric, and payload read access. No A/B framing, no ticket
numbers, no exception rules, no mention of the other arm. Both verdicts are
immutable once written.

**8. Compare only after both grades are in.** Criterion by criterion. A
citation-style-only win is not material improvement; the verdict must name a
concrete consumer-visible difference.

**9. Record everything** under `.design-sync/evaluations/APP-729/runs/<stamp>/`
following Run 5's layout, plus the browser/operator split.

## What this run is testing

Run 5's candidate claimed `.map()` collapses `AddressesInput` rows into a single
child — the inverse of what its own shipped preview does. That sentence was
model-generated, not authored, which is why the fix was structural rather than a
prompt patch. The candidate now emits a source-backed contract:
`mappedArrays: supported`, `wrapperElements: unsupported`,
`nestedFormWrapper: unsupported`, `index: matches-position`, each evidence ref
pinned by sha256 and line.

A candidate win on composition **without** regressing citations closes APP-1243's
acceptance. A repeat `EQUIVALENT` means the registry contract is not reaching the
model's answer, which is a delivery problem, not a content one — do not patch the
sentence.

## Do not

- Modify the candidate, rebuild the bundle, or change the protocol mid-run.
- Adjudicate after seeing a result. Exceptions are applied by the evaluator, not
  the grader, and only the two already frozen (APP-1225 prop defaults;
  audit-time revisions in `registry-report.md` are not a second revision family).
- Commit `.design-sync/config.json` while it points at a disposable project.

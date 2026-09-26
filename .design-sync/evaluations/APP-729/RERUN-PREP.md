# APP-729 delta rerun — prep pack

Status: prep only. No arm has been run under a valid setup. The
2026-09-25/26 attempt is **incomparable** (see `runs/20260925T133856Z/`).

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

## 3. Artifacts — STALE, rebuild before use

**Identity gate. The recorded payload no longer matches the tree.**
`ds-bundle/.payload-manifest.json` records `source.commit 8a3ea8c8…`
with `source.dirty: []`, but the worktree is on `APP-1223-closure` with
uncommitted edits to `.design-sync/overrides/emit.mjs`,
`overrides/app-ownership.mjs`, `refresh.test.mjs`,
`component-registry/registry.json` and `selection-guide.json`.
`emit.mjs` generates the declarations, so the emitted bytes have moved.
Pushing `57f59808…` would ship an artifact whose manifest lies about its
own provenance — the exact failure `PROTOCOL-v2` names when it says to
distinguish producer-asserted from locally verified identity.

Before any push:

```sh
cd /Users/kd-m2air/.herdr/worktrees/app-next/app-1208
git add -A && git commit -m "feat(APP-1223): <summary>"   # or stash
node .design-sync/refresh.mjs                              # rebuild payload
node --test .design-sync/refresh.test.mjs                  # must be 3/3
sha256sum ds-bundle/.payload-manifest.json ds-bundle/.ds-build-meta.json
```

Record the **new** hashes and the new `source.commit` in the run dir and
in `probe.json` before the first arm runs. Confirm `source.dirty` is `[]`
and that it is true this time.

- Candidate payload: `/Users/kd-m2air/.herdr/worktrees/app-next/app-1208/ds-bundle`
  - superseded hashes (do not cite): manifest `57f598081d01a152e1309c8a0b7be15ee12d8e868be7fea48de5ab205fa49e77`, build-meta `c4a11a165c53cc50785eceec83fb7e054c061aa76c11bd1cfbb29242b4173ac3`
  - `payload.upload.files`: 575 entries, includes `guidelines/index.md` and `guidelines/context/index.md`
  - kit `@aragon/gov-ui-kit@2.11.4`, kit commit `e06fbb8d…`
- Scope: APP-726, 727, 728, 735, 736, 1208, 1223. **Not** APP-1224, APP-1225.
  APP-1225 (prop defaults) is the sub-issue closest to the probe's
  `required[6]`; its absence bounds what this run can show.
- Frozen probe: `runs/20260925T133856Z/probe.json`
  - model `Opus 5`, effort `Medium`, arm order **candidate first** (`randomByteHex: ba`)
  - `prompt` is the exact 829-char submitted message — reuse verbatim
- Answer key: `runs/20260925T133856Z/answer-key.json` (7 required, 4 incorrect)

## 4. Arms to build

All arms are **fresh disposable projects** (`PROTOCOL-v2` §"Integrity and
accepted-code gate"). Never run in, or push to, `2f22a679…`.

Declare the question before running (`PROTOCOL-v2` item 8).

### Delta run — does the added context help? (default)

- **Arm A — candidate, full context.** New empty project; push the
  rebuilt `ds-bundle` complete, including `guidelines/**`.
- **Arm B — candidate, context withheld.** Second new empty project;
  push the **same** rebuilt payload with the `aux` `guidelines/**` paths
  **excluded from upload scope**.

  Withhold at push time only. Do **not** delete the files from
  `ds-bundle/` — `refresh.mjs` validation throws on unlisted/stale files,
  and the emitted `README.md` cites `guidelines/context/index.md`, so
  deleting would recreate `e6b58c10`'s "README names bytes that aren't
  there" defect inside the control arm. `remote-diff.mjs:43` defines
  `aux` as `guidelines/**` + `README.md`; ship `README.md`, skip
  `guidelines/**`.

  Retain a file/hash diff proving the delta is exactly those paths.

Identical runtime, components, styling, declarations on both sides. This
is a synthetic ablation, not the historical baseline — keep its result
separate from the v1 record.

### No-regression run — is the APP-1220 stack safe to ship?

- **Arm A** as above (full candidate).
- **Arm C — production baseline.** `2f22a679…` → project menu →
  **Duplicate project**. Preserves the full tree and per-component
  "Usage notes for Claude" without touching the original.

This varies runtime *and* context together (2.10.0 → 2.11.4), so it
cannot attribute anything to the context pieces. Both arms passing is the
expected, correct result — evidence of no regression, not absence of
value.

Every arm: one chat, zero prior turns, Opus 5 / Medium, the frozen prompt
verbatim, candidate arm first, order recorded.

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

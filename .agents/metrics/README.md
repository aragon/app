# Guardrail metrics

Telemetry for the rule-skills spike. Answers one question: **is this spike pulling its weight, or do we shut it down?**

## What this folder is

| File | Purpose | Tracked |
|---|---|---|
| `hits.jsonl` | Shared, team-wide log of rule-skill fires. Append-only. | ✓ checked-in |
| `.buffer.jsonl` | Per-developer transient buffer. Drained on every commit. | gitignored |
| `README.md` | This file. | ✓ checked-in |

`hits.jsonl` is the single source of truth. Everything else exists to populate it or read from it.

## Why this exists

The rule-skills system at `.agents/skills/rules/` is a spike. It has a real maintenance cost (loader, frontmatter discipline, contributor education) and a speculative benefit (agents make fewer convention mistakes). We need numbers to know whether the trade is worth it.

The metrics in this folder answer:

- **Are the rules firing on real work?** Per-rule hit counts over time.
- **At what cost?** Hook latency (p50, p95) and total bytes injected.
- **On what files?** Per-rule file paths show whether globs are scoped right.

If, after a few weeks of collected data, the rules are rarely firing or only firing on bot-edited files, the spike loses. If they're firing on hot paths during real PRs, the spike earns its keep.

## Pipeline

```
 ┌─────────────────────────┐
 │ agent runs Edit/Write   │
 │ → PreToolUse hook fires │
 └────────────┬────────────┘
              │
              ▼
 ┌─────────────────────────────────────────┐
 │ .agents/hooks/inject-rules.mjs          │
 │ matches rule globs against file path    │
 │ if match: appends 1 JSON line per rule  │
 │           to .agents/metrics/.buffer    │
 └────────────┬────────────────────────────┘
              │
              │   (developer eventually commits)
              ▼
 ┌─────────────────────────────────────────┐
 │ .husky/pre-commit                       │
 │ → pnpm guardrails:record                │
 │   reads .buffer.jsonl                   │
 │   appends contents to hits.jsonl        │
 │   truncates buffer                      │
 │   git-adds hits.jsonl                   │
 └────────────┬────────────────────────────┘
              │
              │   (PR merges)
              ▼
 ┌─────────────────────────────────────────┐
 │ hits.jsonl on main grows                │
 │ pnpm guardrails:stats reads it          │
 │   prints per-rule / latency / bytes     │
 └─────────────────────────────────────────┘
```

Two scripts (`record-metrics.mjs`, `stats-metrics.mjs`) and one buffered write inside the loader. No external infra. No CI gate. No dashboards. Until the spike's value is established, anything more is over-engineering.

## Row schema

One JSON object per line. One row per `(event × matched rule)` — so a single hook fire that matches two rules produces two rows.

```json
{"ts":"2026-05-20T08:01:20.888Z","tool":"Edit","file":"src/shared/api/daoService/queries/useDao.ts","rule":"query-and-cache","bytes":2385,"elapsed_ms":1,"adapter":"claude"}
```

| Field | Meaning |
|---|---|
| `ts` | ISO-8601 UTC timestamp at hook fire. Enables daily/weekly windows without timezone math. |
| `tool` | `Edit`, `Write`, or `MultiEdit`. Reveals whether rules fire mostly on existing-file edits vs new-file writes. |
| `file` | Repo-relative path. Never absolute — the loader strips that. Same path the matcher resolves against. |
| `rule` | Singular rule name that fired on this event. |
| `bytes` | Length of the rule body that was injected. The token-cost proxy. |
| `elapsed_ms` | Time from hook entry to `additionalContext` returned. Catches loader regressions. |
| `adapter` | `claude`, `generic`, etc. Lets you slice by harness when multiple agent runtimes are in play. |

No author, no machine ID, no absolute paths. The PR diff already reveals more than this file does.

## How aggregation stays reliable on a shared repo

The whole pipeline is built around five properties. If any of them broke, sums would drift. They don't, and here's why.

### 1. Every line is self-contained and idempotent

A row carries every field needed to interpret it. There are no referential keys, no joins, no implied ordering. Read any subset of `hits.jsonl` and the per-rule sums over that subset are correct. Shuffle the lines and the aggregator returns the same numbers.

### 2. Concurrent PRs append, they don't overwrite

Two PRs both add lines at the end of `hits.jsonl`. Git's text merge handles disjoint trailing appends cleanly — the merged file contains both sets of new lines concatenated.

```
main:        [50 lines]
PR-A adds:   [50 lines] + [PR-A's 7 lines]
PR-B adds:   [50 lines] + [PR-B's 4 lines]
merged:      [50 lines] + [PR-A's 7 lines] + [PR-B's 4 lines]
```

This is one of the rare git operations that auto-merges reliably, because append-to-end is associative. The only way to get a conflict marker is if both PRs branched from the same point *and* the diff happens to align byte-exactly — and the resolution in that case is "keep both," which still loses nothing.

### 3. The recorder is drain-and-truncate, not copy

`pnpm guardrails:record` runs in one shot: read buffer → append to shared file → truncate buffer. If a developer runs it twice in a row, the second run finds an empty buffer and exits. No double-recording.

The only failure window is between append and truncate. If append succeeds but truncate fails (disk full, permission flap), the developer gets duplicate rows on the next successful run. Rare and recoverable by hand-deleting. We don't engineer around it because the spike's cost ceiling is low.

### 4. Squash and rebase preserve rows

The rows live in file content, not commit metadata. Squashing a PR concatenates its commits into one — all rows survive. Rebasing rewrites commits but keeps the file content. Force-push to a feature branch can drop unrecorded rows from the developer's machine, but `main` only ever sees what arrives via merged PR, so the shared file isn't affected.

### 5. The aggregator never lets the LLM do math

`stats-metrics.mjs` reads `hits.jsonl`, splits on `\n`, `JSON.parse`s each line, accumulates with `Map.set/get`, sorts arrays for percentiles. All deterministic Node. The LLM only ever reads the *printed output* — which it can quote, but cannot accidentally re-sum into a different number.

## Honest failure modes

These are the things this pipeline can't tell you, and that's on purpose:

- **Opt-out.** A developer who disables the hook (or removes the pre-commit step) contributes zero events. The sum is "fires across contributors who opted in," not "fires team-wide." Participation can't be enforced from a checkout.
- **Stale checkouts.** A long-lived branch may miss events on edits made before its last rebase. Rare in practice.
- **Manual edits.** If someone hand-edits `hits.jsonl`, the aggregate lies. We could add a CI integrity SHA, but for a spike that's overkill.
- **Clock skew.** `ts` comes from the developer's clock. An hours-wrong clock rolls events into the wrong daily bucket. Not catastrophic for kill/keep signal.

Net effect: the sum is reliable as a **lower bound** of real rule activity, with daily aggregates stable to within clock-skew tolerance. For "is this spike pulling its weight?", that's plenty.

## Commands

```sh
pnpm guardrails:record    # drains .buffer.jsonl → hits.jsonl, stages it
pnpm guardrails:stats     # prints per-rule, latency, byte aggregates
```

`record` runs automatically from `.husky/pre-commit`. You typically only call it directly when debugging.

## Kill criteria

If, four weeks after the spike lands and contributors have done real work on it, the data shows any of:

- Most rules firing fewer than 10× per week
- p95 hook latency above ~40ms
- Total injected bytes per week above what we'd save by inlining the rules in `CLAUDE.md`

…the spike has lost. Remove the loader, the rule files, this folder, and the husky line. The cost was bounded; the experiment ran.

If instead rules fire steadily on real PR-changed files at sub-20ms latency, the spike has earned its keep and we can talk about graduating individual rules (CI enforcement, native frontmatter, dashboards, anything).

The data decides.

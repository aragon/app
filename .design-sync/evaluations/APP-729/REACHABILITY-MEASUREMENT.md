# Reachability rate — measurement protocol

Frozen 2026-09-28, before any draw. Nothing here is renegotiable once a
result exists.

## Why

Three graded runs produced three different reachability outcomes on a
payload whose correctness improved each round:

| Run | Outcome |
| --- | --- |
| 1 | cited `selection-guide.json`, facts verified present |
| 2 | cited neither gated file |
| 3 | cited `index.md` and `source-index.md`, neither gated file |

Run 1 proves the guide is openable. Runs 2 and 3 prove it is not reliably
opened. Three single samples cannot distinguish an undiscoverable bundle
from a model that opens the guide part of the time, and the difference
decides whether this criterion can gate a merge.

The router added before run 3 named both gated files in an imperative first
line and did not change the outcome. That was the pre-registered test and it
came back negative, so the next step is measurement, not another rewrite.

## Design

- **Payload:** `3f513541ff886587ce0548757f3c4b04a84658818cb2a24bf974e03d5ed86075`,
  already delivered to project `3523fe1f-f2a6-4775-9484-519da9dd27c5` and
  verified byte-exact. Not rebuilt, not re-pushed.
- **N = 5.** Five fresh chats in that one project. Nothing else varies.
- **Prompt:** the frozen 829-character probe, verbatim, from
  `runs/20260925T133856Z/probe.json`.
- **Model:** Opus 5, Medium effort.
- Run 3's own chat is **not** counted. It was graded under the full gate and
  is reported separately; reusing it would mix a graded draw into a
  measurement sample.

## What counts as a hit

The re-frozen criterion, verbatim, no looser:

> The handoff attributes a **composition or contract** fact — a component
> choice, prop semantics, or the App/kit layer split — to
> `guidelines/context/selection-guide.json` or
> `guidelines/context/registry-report.md`. A provenance citation — a
> revision, a SHA, a dirty-file list — does **not** count, from any file.

Citing `index.md` or `source-index.md` is not a hit. Naming a gated file
without attributing a fact to it is not a hit. Run 1 would score a hit; runs
2 and 3 would not.

## Who judges

**Not me.** A cheap self-check puts the evaluator back inside the
measurement being used to decide the merge, which is the failure this whole
protocol exists to avoid.

Each of the five handoffs goes to a blind subagent with the criterion above
and read access to the project. It answers one question — hit or not, with
the quoted span it relied on, or a statement that there is none. It is told
nothing about the other draws, the payload's history, or what the rate is
for.

I tally. I do not adjudicate individual draws.

## Decision rule — frozen now

- **0/5** — the criterion is unsatisfiable against this bundle. It is
  removed as a gating condition and recorded as an APP-726 discoverability
  finding. The other three conditions still gate.
- **1/5 to 4/5** — the criterion is stochastic. A coin-flip cannot gate
  seven PRs, so it is removed as a gating condition and the measured rate is
  recorded. Any future claim that a bundle "fails reachability" must cite a
  rate, not a draw.
- **5/5** — reachability is reliable and runs 2 and 3 were unlucky draws.
  The criterion stays, and the merge waits on a passing run.

In all three cases the rate is recorded in `RERUN-PREP.md` and the run-1/2/3
verdicts gain a pointer to it. No outcome here retroactively changes those
verdicts; they stand as graded.

## What this does not measure

Whether the router helps. Measuring that needs the pre-router payload run
the same way, and no such measurement exists. Do not infer the router's
effect from this sample.

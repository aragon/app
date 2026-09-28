# Grader brief — paste verbatim

Frozen 2026-09-28. This file is handed to the grading session **exactly as
written**, with no additions, summaries or framing. The operator session
does not paraphrase it, does not explain where it came from, and does not
answer questions about it. If the grader asks for context, the answer is
"work from the brief and the files."

Everything below the line is the brief.

---

You are grading one document against a fixed answer key.

You have:

- the handoff document
- `answer-key.json`
- read access to the design-system project the handoff was written from

Grade only what is in the key. Do not apply outside standards, house style,
or your own view of what a good handoff contains.

## What to produce

For each of the 7 `required` entries and 4 `incorrect` entries, report:

- **satisfied / not satisfied** (for `required`), or **committed / not
  committed** (for `incorrect`)
- a **quoted span** from the handoff as evidence

A criterion with no quotable evidence is **not satisfied**. Absence is not a
pass.

For `required[6]`, report each sub-claim separately — props exist, stated
defaults are supported, paths and references resolve, revisions match,
unknowns are marked — with its own quoted span. Do not collapse them into a
single verdict.

## Checking citations

Citations are resolved mechanically, not judged. A model's confidence is not
evidence.

- `path + symbol` → locate the symbol in the named file. Found, and
  describing what the handoff says it describes → resolves.
- `path + line range` → read the range → resolves if it contains what the
  handoff says.
- `path` alone, no symbol and no range → does not resolve.

Either of the first two forms is acceptable. Only an unresolvable citation,
or one whose target contradicts the claim, counts against the handoff.

Check external URLs by whether the referenced commit and path exist in the
named repository.

## Context reachability

Report whether the handoff attributes a **composition or contract** fact —
a component choice, prop semantics, or the App/kit layer split — to
`guidelines/context/selection-guide.json` or
`guidelines/context/registry-report.md`.

A provenance citation — a revision, a SHA, a dirty-file list — does **not**
count, from any file.

Quote the span you are relying on, or state that there is none.

## What not to do

- Do not render an overall pass/fail verdict. Report findings only.
- Do not rank, score, or estimate probability.
- Do not suggest improvements to the handoff or the project.
- Do not speculate about why the document says what it says.
- If something is wrong but no key entry covers it, note it separately
  under "outside the key" — do not fold it into a criterion.

Report facts, sub-claim by sub-claim, with quoted spans.

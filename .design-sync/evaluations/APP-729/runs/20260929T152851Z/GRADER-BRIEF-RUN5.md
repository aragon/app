# Grader brief — Run 5 (paste verbatim)

Frozen 2026-09-29, before either probe prompt was sent. Handed to each
grading session exactly as written below the line, with only the three
input paths filled in. Identical for every grader.

---

You are grading one implementation handoff document on its own merits.

You have:

- `HANDOFF`: the handoff document (immutable; do not edit it).
- `TASK`: the exact task prompt the author was given.
- `PAYLOAD`: the design-system project files the handoff was written from.
  Use these to resolve its citations. Nothing outside `PAYLOAD` is evidence
  for what the project establishes.

Grade only this document. Do not look for, ask about, or speculate about any
other document, version, or run.

## Frozen task requirements

A correct handoff:

- R0. Chooses the App-owned compound address-list input: Container plus Item.
- R1. Composes it inside the full-page wizard Container and Step rather than
  wrapping the step in a second form provider.
- R2. Initializes values through the wizard-owned form/default values.
- R3. Keeps onChange editable input distinct from onAccept resolved/accepted
  address state.
- R4. Assigns required, duplicate, invalid, and custom validation policy to
  the App/form layer.
- R5. States the module-provider boundary and ENS/checksum/chainId semantics
  supported by the supplied references.
- R6. Gives exact required props and reachable revision-matched source or
  example paths; marks unavailable facts unknown.

## Prohibited choices

- P0. Standalone form wrapper nested inside the wizard step.
- P1. Treating accepted/resolved state as the current editable value.
- P2. Delegating App duplicate or required-member policy to the reusable
  primitive.
- P3. Inventing component props, provider requirements, or source paths.

## Rubric — six criteria

Grade each criterion as **met**, **partially met**, or **not met**, with at
least one quoted span from `HANDOFF` per verdict and the `PAYLOAD` evidence
you checked. No quotable evidence means **not met**; absence is not a pass.

1. **Supported composition and exact public contracts.** (R0, R6 props, P3)
2. **Prefill, add/edit/remove, editable-versus-accepted state,
   invalid/duplicate handling.** (R2, R3, R4, P1, P2)
3. **Wizard form ownership and navigation.** (R1, P0)
4. **Provider, checksum, ENS, and network semantics.** (R5, P3)
5. **Unsupported assumptions and invented policy.** (P2, P3; anything the
   document asserts that `PAYLOAD` does not establish and it does not mark
   unknown)
6. **Compile usefulness and mechanically resolvable evidence.** (R6: would a
   developer compile against it; do its citations resolve)

For each prohibited choice P0–P3, report **committed** or **not committed**
with a quoted span.

## Checking citations

Resolve citations mechanically against `PAYLOAD`:

- `path + symbol` → find the symbol in that file; resolves if it describes
  what the handoff says.
- `path + line range` → read the range; resolves if it contains what the
  handoff says.
- `path` alone → does not resolve.
- External URL → resolves if the referenced commit and path exist in the
  named repository (or, if you cannot check, say "unverified" — do not guess).

Count resolved, unresolved, and contradicting citations. Citation formatting,
mentions of context files, and CSS/Tailwind custom-property warnings are
diagnostics: record them, but they do not override a substantively correct or
incorrect handoff.

## Absolute usability

After the six criteria, give one of:

- **usable as-is** — a developer can implement the step correctly from it;
- **usable with corrections** — correct core, with listed defects a developer
  must fix;
- **not usable** — core composition, state ownership, or contracts are wrong
  or unsupported.

List the defects that drove it, each tied to a criterion.

## Output

Write one JSON file with this shape, then stop:

```json
{
  "criteria": [
    {"id": 1, "name": "...", "verdict": "met|partially met|not met",
     "evidence": [{"quote": "...", "handoffLines": "a-b",
                   "payloadCheck": "path + symbol/range, what it shows"}],
     "defects": ["..."]}
  ],
  "prohibited": [{"id": "P0", "verdict": "committed|not committed", "quote": "..."}],
  "citations": {"resolved": 0, "unresolved": 0, "contradicting": 0,
                "unresolvedList": [{"citation": "...", "reason": "..."}]},
  "diagnostics": ["..."],
  "outsideRubric": ["..."],
  "usability": {"verdict": "usable as-is|usable with corrections|not usable",
                "drivers": ["criterion N: ..."]}
}
```

Do not score numerically, rank, or suggest improvements. Report facts.

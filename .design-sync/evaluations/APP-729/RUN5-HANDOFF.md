# Run 5 — production-versus-candidate generative comparison

## Decision

Answer one product question: does the proposed candidate produce a materially better implementation handoff than the currently deployed Design bundle?

This is a holistic product comparison, not causal attribution to one PR or context file. The arms intentionally represent the deployed and proposed products; revision and payload differences are part of that comparison and must be reported, not hidden.

Report three results independently:

1. **Ingestion integrity** — fresh project, complete payload, hashes/revisions recorded.
2. **Absolute usability** — correctness and implementation usefulness of each artifact.
3. **Comparative value** — candidate materially better, equivalent, or worse.

Citation formatting, context-file mentions, and Design's Tailwind custom-property warnings are diagnostics. They do not override a substantively correct or incorrect handoff.

## Arms

### Control — current production bundle

- Create a fresh empty Design project.
- Copy the current production design-system payload from project `2f22a679-7abb-4283-9f39-e28a63dba83b` into it byte-for-byte through DesignSync MCP.
- Do not reuse the production project's chat or its stray handoff artifact.
- Record the copied file list, byte counts, hashes, and embedded revisions.

### Candidate — proposed bundle

- Create a separate fresh empty Design project.
- Upload `/Users/kd-m2air/.herdr/worktrees/app-next/app-729-fresh-candidate/ds-bundle` through the sanctioned `/design-sync` MCP flow.
- Use `ds-bundle/.payload-manifest.json` as the expected 575-file, 8,676,148-byte upload set. Manifest SHA-256: `af41067c2ccbe62127032b981107ce300606a74a1eab09e47afade526e6e976c`; embedded app revision: `2b512b90d3093f1170a14f2ccf7eab41dcc7f036`.
- Upload `_ds_sync.json` last.
- Re-read and hash the uploaded critical files after compilation; precompile hashes are not sufficient.

## Controlled probe

For both arms:

- Model: Opus 5.
- Effort: Medium.
- Zero prior user turns.
- Send the exact same frozen prompt once.
- No follow-up, correction, or retry.
- Capture the generated handoff file from its served bytes, not from Monaco/editor state.
- Record the exact prompt readback method and displayed model/effort.

Frozen prompt source:

`runs/20260929T094027Z/prompt.txt`

## Independent grading

Grade each arm independently in a separate fresh grader session. Give each
grader only:

- one immutable handoff artifact;
- the frozen task requirements and prohibited choices;
- that arm's own immutable payload/source files for citation resolution.

Do not mention the other arm or ask for a comparison. The candidate artifact
may legitimately identify its candidate provenance; independent grading avoids
turning that disclosure into an A/B label. Use the same frozen grading brief and
schema for both graders. After both verdicts are immutable, the evaluator
compares their criterion-level findings:

1. Supported composition and exact public contracts.
2. Prefill, add/edit/remove, editable-versus-accepted state, invalid/duplicate handling.
3. Wizard form ownership and navigation.
4. Provider, checksum, ENS, and network semantics.
5. Unsupported assumptions and invented policy.
6. Compile usefulness and mechanically resolvable evidence.

The comparative verdict must identify concrete consumer-visible differences. A citation-style-only win is not material improvement.

## Operational boundary

Perform project creation, copying/upload, and post-upload hash verification in the Claude Code session with DesignSync MCP. The probe requires a browser-capable session unless that Claude Code session has an authenticated browser relay. Do not silently move the probe to another session; record the operator split before sending either prompt.

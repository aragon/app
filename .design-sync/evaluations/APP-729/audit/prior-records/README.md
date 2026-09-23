# APP-729 — old vs candidate Claude Design comparison

**Status: comparison complete with recorded comparability limitations.** The candidate is **from unmerged PRs**; nothing here marks it accepted or deployed.

Both runs used the frozen [prompt](PROMPT.md) and [protocol](PROTOCOL.md), submitted as one message with visible **Opus 5 / Medium**. The submitted message SHA-256 was `68a6bee9c13d5e0aa7983927ff7563a6ed054b0118b500ea725b1a7360d87867`. No human correction was sent to either valid run.

## Verdict

**Result: the new bundle context pieces produced a modest discovery and handoff improvement, but no meaningful implementation delta on this task.**

The candidate improved provenance, source/API handoff, validation detail, and live evidence. It identified the unmerged App/GovKit revisions, retained source-to-package uncertainty, produced a separate handoff, and visibly resolved the example address to `vitalik.eth`. Its prototype rendered empty, populated, invalid, duplicate, desktop, and 390×844 mobile states without a generated-artifact correction.

The old 2.10.0 baseline used `WizardPage.Container` and `WizardPage.Step` directly, so its prototype had better real-flow fidelity. The candidate used `FormWrapper` and kit primitives for a standalone prototype, then explicitly instructed implementers to use `WizardPage` and `BlockNavigationContextProvider` in the real create-flow. That is a documented prototype departure, not evidence that the candidate context selected the wrong components.

This task was already solvable from the old context: both projects exposed `AddressesInput`, `AddressInput`, `WizardPage`, examples, and compiled implementation. The candidate context made discovery and handoff more precise, but `AddressesInput.d.ts` remained generic and still forced compiled-bundle inspection. This single run therefore does not demonstrate a material implementation improvement or absence of value; a follow-up needs tasks where the new registry, selection guidance, or source links are necessary to reach the correct result.

## Side-by-side result

| Criterion | Preserved old baseline | Candidate from unmerged PRs |
| --- | --- | --- |
| Component selection | Correct `AddressesInput.Container/.Item` over kit `AddressInput`; prototype used `WizardPage` directly | Correct address compound; standalone shell used kit primitives, and the handoff correctly prescribed `WizardPage` for real integration |
| Source/props | Found prompt refs/examples and recovered wrapper props from compiled bundle | Stronger source paths, field shape, revisions, and registry context; wrapper `.d.ts` is still generic |
| Requested states | All states rendered; duplicate persistence needed one automatic correction | All states rendered on initial output; ENS reverse resolution visibly ran |
| Form/providers | Wizard owns form; required providers present | `FormWrapper` valid for standalone prototype; handoff correctly distinguishes real `WizardPage` integration |
| Add/remove | Exercised: 1→2→1 rows; final remove disabled | Exercised: 1→2→1 rows; final remove disabled |
| Mobile | Built-in 390 mode captured | Actual 390×844 viewport captured; document width stayed 390px |
| Human corrections | None | None |
| Automatic output corrections | One: duplicate error persistence | None to generated prototype |
| Handoff | Inline, accurate, explicit ENS limitation | Separate, more precise; explicitly labels candidate provenance and gaps |

Full criterion labels and evidence references are in [comparison.json](comparison.json).

## Runs and retained evidence

### Old baseline

- Source project: <https://claude.ai/design/p/2f22a679-7abb-4283-9f39-e28a63dba83b>
- Valid session: <https://claude.ai/design/p/464ba599-10d1-4704-98b2-e15349ee45e4>
- Visible bundle version: GovUiKit 2.10.0
- Evidence: [`runs/old/`](runs/old/), including transcript, served/rendered source, desktop/mobile screenshots, add/remove observation, and run metadata
- One evaluator setup attempt is preserved and excluded under `runs/old/invalid-session.*` because multiline input was submitted as multiple turns.
- The exact old archive, checksum, converter revision, registry identity, and remote freshness remain unknown. The user-designated remote project and retained visible readme are the baseline evidence.

### Candidate from unmerged PRs

- Project/run: <https://claude.ai/design/p/e6b58c10-ca85-42b9-beab-dfe1886bfe81>
- Visible bundle version: GovUiKit 2.11.4
- Visible identities: App base `3c9bb798f3679fb2eb8052a192847ab2274ed1d5`; GovKit source `8d70bdf0c7fc32e994894d47067f518253b04f80`; source-to-published-package equivalence unknown
- Evidence: [`runs/candidate/`](runs/candidate/), including transcript, served/rendered source, separate handoff, all state screenshots, 390×844 capture, interaction observations, and run metadata
- Comparability limitation: the unpublished candidate exposed no **New design** action. Generation therefore created the two output files in the supplied candidate project instead of a separate disposable project, contrary to the fixed isolation instruction. The pre-run project readme/screenshot were retained first.

## Findings routed to APP-1208

Comment `1c119189-5ee8-46a3-a640-f87aca286c0f` records two candidate bundle/export findings:

1. `components/forms/AddressesInput/AddressesInput.d.ts` remains `[key: string]: unknown`, forcing compiled-bundle prop recovery.
2. The design-system checker reports Tailwind/Typography runtime variables and unclassified motion tokens in read-only generated CSS.

The prototype-shell difference is retained as a model-run observation, not routed as a candidate bundle defect.

No exporter code, application code, accepted revisions, release state, commit, branch, or remote was changed.

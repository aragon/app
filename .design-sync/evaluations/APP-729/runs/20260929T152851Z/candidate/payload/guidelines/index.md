# Guidelines

## Start here

- **Choosing a component** — read [the selection guide](./context/selection-guide.json). It indexes intent, alternatives and evidence. It covers the **kit layer**: every entry is a `govkit:` id. App-owned compounds (`AddressesInput`, `ResourcesInput`, `WizardPage`, `Page`, …) have no entry of their own; reach them through the kit primitive they compose and through this bundle's `README.md`.
- **Composing, providers, form ownership** — the bundle `README.md`. It is the only place that records which wrapper owns form state and which provider is genuinely required.
- **Citing source** — [recorded source references](./context/source-index.md), addressed at the recorded revisions.
- **Coverage gaps and audit provenance** — [the registry report](./context/registry-report.md). Read it before claiming something is absent from the design system.

## Authority

When these disagree, prefer in this order: the component's `.d.ts` and the compiled `_ds_bundle.js`, then `_preview/*.js`, then the generated context under `context/`, then hand-written prose in `README.md`. Generated files are extracted from source; prose is maintained by hand and can lag.

Every claim-bearing reference must identify a checkable target. Cite `path → exported symbol`, `path → Markdown heading`, or `path:Lx-Ly`; never cite a bare path. Examples: `components/forms/AddressesInput/AddressesInput.d.ts → AddressesInputContainerProps`, `README.md → Select and compose`, and `guidelines/index.md → Authority`.

## Delivered App context

- [Authoritative design context](./context/index.md)

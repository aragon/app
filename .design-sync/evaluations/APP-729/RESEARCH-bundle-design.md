# How design-context bundles should be structured for an LLM reader

Research run 2026-09-28, after run 2 of the APP-1220 acceptance gate failed
context reachability on byte-identical guide content. Three parallel scouts:
official Claude/Anthropic docs, LLM documentation research, and how other
design systems ship machine-readable component docs.

Read this before changing `conventions.md`, `docs.mjs` or the selection
guide's shape.

## What is documented, and what is not

**There is no privileged entry-point filename.** No official source grants
`README.md`, `index.md`, `DESIGN.md` or anything else special status in a
Claude Design project. Checked: the [Claude Code command
reference](https://code.claude.com/docs/en/commands), the [design system
setup
guide](https://support.claude.com/en/articles/14604397-set-up-your-design-system-in-claude-design),
[getting
started](https://support.claude.com/en/articles/14604416-get-started-with-claude-design),
and the [Claude Design
announcement](https://www.anthropic.com/news/claude-design-anthropic-labs).
The `design.md` in the [Juno customer
story](https://claude.com/customers/juno) is one team's convention.

This also settles it from the other direction: `SKILL.md:279` fixes the
upload set, and a bundle-root `DESIGN.md` is not in it. It would never
reach the project.

**No published file-ranking or retrieval contract for Design bundles.**
Generic [Projects
RAG](https://support.claude.com/en/articles/11473015-retrieval-augmented-generation-rag-for-projects)
describes a knowledge-search tool that retrieves relevant content instead of
loading everything, and recommends descriptive filenames and referring to
documents by name. Whether Design bundles use that same path is
**undocumented** — treat as inference, not fact.

**No required component-doc schema, token serialization, or Design-specific
size cap.** [Artifacts
guidance](https://code.claude.com/docs/en/artifacts) shows a Markdown token
list and says explicitly that the format shown is only an example. Upload
limits are generic: 30 MB per file, total bounded by the context window.

So: our 295 KB `source-index.md` is legal but too big to read in one call,
which is consistent with retrieval-over-load.

## What the field does

Convergent three-layer pattern across Adobe Spectrum, Shopify Polaris, IBM
Carbon, Atlassian, Storybook:

1. an authoritative machine-readable component contract
2. a short intent/selection index
3. focused examples and implementation guidance

We have all three. Layer 2 is the weak one: `selection-guide.json` is a
projection of registry records, not a task-to-component index, and it
covers only the kit layer.

Worth reading if the guide's shape is ever revisited:

- [Adobe Spectrum component
  format](https://opensource.adobe.com/spectrum-design-data/spec/component-format/)
  and [document
  blocks](https://opensource.adobe.com/spectrum-design-data/spec/document-blocks/)
  — typed guidance with purpose/guideline/accessibility/do-dont, plus
  agent-specific prose. Draft specs, not a standard.
- [Storybook AI manifests](https://storybook.js.org/docs/ai/manifests) —
  generated props, defaults, stories, descriptions.
- [Shopify Polaris component
  docs](https://shopify.dev/docs/api/app-home/latest/web-components/actions/button)
  — purpose, properties, defaults, events, slots, examples, best practices,
  limitations, in one page per component.
- shadcn's [`registry.json`](https://ui.shadcn.com/docs/registry/registry-json)
  is a distribution catalog, not a component API or selection guide. It is
  not the analogue it first appears to be.

**No cross-vendor convention exists for marking generated vs hand-written
content**, which is notable given every defect this gate has found came from
hand-written prose while generated content stayed correct.

## What changed in this bundle as a result

- `guidelines/index.md` states decision-critical facts inline rather than
  only linking them. Run 2 opened none of the context files; a passive link
  was not enough, and one run had already skipped the JSON.
- It names each file and what it is for, which is the documented lever if
  retrieval is name-based.
- It records an authority order — declarations and compiled bundle, then
  previews, then generated context, then hand-written prose — because prose
  is the layer that has been wrong twice.
- It requires citations as **path plus symbol**, never a bare line number.
  `required[6].3` failed on `_preview/AddressesInput.js` L110 versus
  `WizardPage.js` L110: two files, same line, different components.

## Honest limits

Markdown-vs-JSON readability, imperative-vs-passive instruction wording, and
whether a model defers to prose or to source when they conflict are all
**hypotheses**. No controlled study of this bundle exists, and the scouts
found no published measurement that settles them.

The router is a reasoned bet on documented mechanisms, not a proven fix for
reachability. If run 3 fails the same criterion, the next step is
measurement — repeat runs on one payload — not another prose rewrite.

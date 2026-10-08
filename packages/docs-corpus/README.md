# @aragon/docs-corpus

Loader of the Aragon platform knowledge base, [`aragon/platform-doc`](https://github.com/aragon/platform-doc) (private, branch `development`), shared by the assistant (its documentation index) and the docs site so both publish the same pages. Source-only: consumers import `src/index.ts` (the assistant's index build runs under tsx, the site's content step will too); nothing is built or published.

- `resolveCorpus` — where a build reads the base from: the checkout `DOCS_CORPUS_DIR` names, as-is, otherwise a shallow fetch (with `DOCS_REPO_TOKEN`, or the git credentials of the machine) into the consumer's cache directory. A failed fetch throws in CI and falls back to the cached checkout elsewhere.
- `loadCorpus` — the published-page filter, fail-closed: knowledge types only, review states by mode (`ready`: the pages the product owner validated, `drafts`: plus the pages under review), never `internal/`, the operating files or `protocol-doc/`. Bodies lose their frontmatter, title heading, maintenance sections and checklists; their links go through a resolver, `resolvePublicLink` by default (absolute links stay, protocol-doc links go to GitHub, other relative links keep their text). The site passes a resolver of its own that knows the published set.
- `docsCorpusModes` — which mode each consumer publishes in each environment: the one place to flip.

Tests: `pnpm test` (the fetch is exercised against a throwaway local repository).

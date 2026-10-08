# @aragon/docs

Public site of the Aragon platform knowledge base, served at [app.aragon.org/help](https://app.aragon.org/help) through the app's rewrite (APP-1133). The content lives in [`aragon/platform-doc`](https://github.com/aragon/platform-doc) (private, branch `development`) and reaches the site at build time only, through [`@aragon/docs-corpus`](../../packages/docs-corpus/README.md) — the same loader and filter the assistant indexes with, so both publish the same pages. A static [Fumadocs](https://fumadocs.dev) export (Next.js, `output: 'export'`, `basePath: '/help'`): no server, no analytics, no error tracking, no link back to the private repository.

## Development

```sh
DOCS_CORPUS_DIR=../../../platform-doc pnpm dev   # reads a local checkout; without it, fetches the repository
pnpm build                                        # content → next build → output check, out/ is the site
pnpm test                                         # jest (node environment)
pnpm type-check
pnpm lint
```

`pnpm dev` and `pnpm build` start with `pnpm prepare:content` (`src/content/prepareContent.ts`), which resolves the corpus — the checkout `DOCS_CORPUS_DIR` names, otherwise a shallow fetch into the git-ignored `.docs-corpus/` with `DOCS_REPO_TOKEN` or the git credentials of the machine — keeps the pages the environment's mode publishes and writes them into the git-ignored `content/docs/` (one markdown file per page, a `meta.json` per folder) and `public/` (a `.md` copy of every page, `llms.txt`, `llms-full.txt`). `src/content/buildContent.ts` holds the rules; `pnpm check:output` fails the build when a page is missing from `out/`.

**Mode.** `DOCS_ENV` (`config/.env.*`, copied to `.env.local` by `pnpm setup <env>`) names the environment; `docsCorpusModes.site` in `@aragon/docs-corpus` maps it to a corpus mode: production publishes the pages the product owner validated (`ready`), every other environment adds the pages under review (`drafts`) and shows them with a "Draft" callout. `internal/`, the operating files and `protocol-doc/` are never published.

**Pages and links.** Area `index.md` files are the landing pages and set the sidebar order (their pages in the order they link to them; the root `index.md` orders the areas the same way and is the home page); pages an index does not link to follow by path. Links are resolved by `resolveSiteLink`: a page on the site becomes its route (`accounts/account.md` → `/help/accounts/account`, fragment kept), a page the mode does not publish becomes plain text, a protocol page goes to its GitHub page, absolute links stay.

**Theme.** Everything visual is in `src/app/globals.css`: the Fumadocs `vitepress` preset (the look of the protocol documentation), Aragon's blue as the accent and the font `src/app/layout.tsx` loads with `next/font`. Another preset, or the gov-ui-kit tokens, is a change to that file only; there are no custom UI components.

## Deploy

Through `shared-deploy.yml` (`workspace: apps/docs`, vaults `kv_docs_*`, Vercel project `platform-doc-ui`). Vercel serves a static export at the root of the deployment whatever the base path, so `vercel.json` rewrites `/help/*` onto it; the app only ever requests `/help/*`. `docs-development.yml` on every merge to `main` touching the site (`docs` filter in `.github/filters.yml`), on the `docs-updated` dispatch from `aragon/platform-doc` and by hand; `docs-production.yml` by hand only (`workflow_dispatch`, or the `release-docs` dispatch from `aragon/platform-doc`); `app-preview.yml` deploys a preview when a pull request touches `apps/docs`. The workspace has no version and no changesets: production is whatever `main` builds from the validated pages at the time of the dispatch.

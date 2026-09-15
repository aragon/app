import { z } from 'zod';

// Names of the agent's documentation tools. Shared by the service (tool registration and the
// narration filter) and the widget (the tool parts it renders a spinner for while they run).
export const docsToolNames = {
    listDocs: 'listDocs',
    searchDocs: 'searchDocs',
    readDoc: 'readDoc',
} as const;

export const docsToolNameSet: ReadonlySet<string> = new Set(
    Object.values(docsToolNames),
);

// One documentation search hit as the model receives it from the searchDocs tool. `path` is the
// page's corpus-relative path (accounts/account.md) — the identity the readDoc tool takes — and
// deliberately not a public URL: where the knowledge base gets published, and therefore what a
// citation would link to, is still undecided, so answers carry no sources yet. The excerpt is the
// matching passage, the breadcrumb its place in the documentation (area › page › section).
export const docSearchResultSchema = z.object({
    path: z.string(),
    title: z.string(),
    breadcrumb: z.string(),
    excerpt: z.string(),
    score: z.number(),
});

export type IDocSearchResult = z.infer<typeof docSearchResultSchema>;

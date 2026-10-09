import type { IDocsCorpusMode } from './corpus';

/**
 * Deployment environments of the consumers — the assistant's names (ASSISTANT_ENV / VERCEL_ENV).
 */
export type DocsEnvironment =
    | 'local'
    | 'development'
    | 'preview'
    | 'production';

export type DocsCorpusConsumer = 'assistant' | 'site';

/**
 * Which pages each consumer publishes in each environment — the one place to flip either. The
 * public docs site shows the product owner's validated pages in production and the drafts
 * everywhere else, so a page is previewed on the development site before it is validated. The
 * assistant answers from the drafts in every environment: the owner considers the draft content
 * correct and only its wording unreviewed, so the chatbot may use it while the site shows the
 * reviewed pages only — a page the site does not publish is one the assistant can read but not
 * link to.
 */
export const docsCorpusModes: Record<
    DocsCorpusConsumer,
    Record<DocsEnvironment, IDocsCorpusMode>
> = {
    assistant: {
        local: 'drafts',
        development: 'drafts',
        preview: 'drafts',
        production: 'drafts',
    },
    site: {
        local: 'drafts',
        development: 'drafts',
        preview: 'drafts',
        production: 'ready',
    },
};

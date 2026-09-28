import { docsToolNames } from '@aragon/assistant-contracts';
import { tool } from 'ai';
import { z } from 'zod';
import type { IDocsSearch } from '../../docs/docsSearch';
import { observability } from '../../lib/observability';

// The agent's documentation tools, registered on the chat pipeline only when
// config.docsSearchEnabled is true. None of them needs an approval: they read the index built
// into the bundle. They run silently — the prompt asks for no text around them and the narration
// filter drops what slips through — so the widget shows a spinner on their tool parts while they
// run and nothing once they are done.

export const buildDocsTools = (params: {
    docsSearch: IDocsSearch;
    sessionId: string;
}) => {
    const { docsSearch, sessionId } = params;

    return {
        [docsToolNames.searchDocs]: tool({
            description:
                'Search the Aragon platform documentation. Call it before answering any question about how the app works, how to do something in it, whether something is possible, or why it behaves the way it does. Returns the most relevant passages, each with the path of the page it comes from. The passages describe the product from the outside; your answer speaks to the user in the second person about what they can do. The path is an internal id for readDoc, never shown or linked.',
            inputSchema: z.object({
                query: z
                    .string()
                    .min(1)
                    .describe(
                        'The user\'s task in a few words, in English, e.g. "which networks can I create an account on".',
                    ),
            }),
            execute: async ({ query }) => {
                const startTime = Date.now();
                const results = await docsSearch.search(query);

                // The query is user-shaped content and stays out of the logs; the counters say
                // whether the documentation had anything to offer.
                observability.logStep({
                    sessionId,
                    step: 'searchDocs',
                    latencyMs: Date.now() - startTime,
                    resultCount: results.length,
                    topScore: results[0]?.score,
                    docsCorpus: docsSearch.meta.mode,
                });

                return { results };
            },
        }),
        [docsToolNames.readDoc]: tool({
            description:
                'Read a whole documentation page by its path (as returned by searchDocs or listDocs), when a passage is not enough to answer — and whenever the user asks for a complete list (every network, every option): a passage may hold only part of it.',
            inputSchema: z.object({
                path: z
                    .string()
                    .min(1)
                    .describe('The page path, e.g. accounts/account.md.'),
            }),
            execute: ({ path }) => {
                const page = docsSearch.readDoc(path);

                return Promise.resolve(
                    page ?? {
                        found: false,
                        message:
                            'No documentation page at this path. Find pages with searchDocs or listDocs.',
                    },
                );
            },
        }),
        [docsToolNames.listDocs]: tool({
            description:
                'List the documentation pages (title, path, summary), optionally only those of one area. Use it to see what the documentation covers, or to find a page by topic when a search returned nothing useful. This inventory is for internal navigation only; do not show or describe it to the user.',
            inputSchema: z.object({
                area: z
                    .string()
                    .optional()
                    .describe(
                        'Optional area name to narrow the list to, e.g. Governance.',
                    ),
            }),
            execute: ({ area }) =>
                Promise.resolve({ docs: docsSearch.listDocs({ area }) }),
        }),
    };
};

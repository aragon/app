import { docsToolNames } from '@aragon/assistant-contracts';
import { tool } from 'ai';
import { z } from 'zod';
import type { IDocsSearch } from '../../docs/docsSearch';
import { observability } from '../../lib/observability';

// The agent's documentation tools, registered only when the request enables them
// (features.docsSearch). Neither needs an approval: they read the index built into the bundle.
// They run silently: the prompt asks for no text around them, the narration filter drops what
// slips through, and the widget shows a spinner while they run. The route drops their outputs
// from the history of later turns (see routes/chat.ts).

export const buildDocsTools = (params: {
    docsSearch: IDocsSearch;
    sessionId: string;
}) => {
    const { docsSearch, sessionId } = params;

    return {
        [docsToolNames.searchDocs]: tool({
            description:
                "Search Aragon's product documentation. Returns the best-matching passages, each with the path of its page; a path is an id for readDoc, never shown or linked. When the user's own terms return nothing that fits, search for the general rule behind their case instead.",
            inputSchema: z.object({
                query: z
                    .string()
                    .min(1)
                    .describe(
                        'What the user needs, in a few English words, e.g. "which networks can I create an account on" or, for a case the documentation may not name, the rule behind it: "how membership of a voting body is defined".',
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
                'Read a whole documentation page by its path, when a passage is cut off or the question needs the complete picture (every option, every network).',
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
                            'No documentation page at this path. Find pages with searchDocs.',
                    },
                );
            },
        }),
    };
};

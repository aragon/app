import type { IDocSearchResult } from '@aragon/assistant-contracts';
import { tool } from 'ai';
import { z } from 'zod';

// Phase-2 seam: registered on the chat pipeline only when config.docsSearchEnabled is true (it
// never is in Phase 1). The result shape is pinned by docSearchResultSchema in the contracts.
export const searchDocsTool = tool({
    description:
        'Search the Aragon App documentation for articles answering a product question.',
    inputSchema: z.object({ query: z.string() }),
    execute: (): Promise<IDocSearchResult[]> => Promise.resolve([]),
});

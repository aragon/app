import { z } from 'zod';

// Pinned Phase-2 seam: the searchDocs tool returns this shape. The Phase-1 stub returns an empty
// array; docs answering fills it in without a contract change.
export const docSearchResultSchema = z.object({
    title: z.string(),
    url: z.string(),
    excerpt: z.string(),
    score: z.number(),
});

export type IDocSearchResult = z.infer<typeof docSearchResultSchema>;

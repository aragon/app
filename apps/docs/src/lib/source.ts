import { loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/plugins/lucide-icons';
import { pageSchema } from 'fumadocs-core/source/schema';
import { defineDocs } from 'fumadocs-mdx/macro';
import { z } from 'zod';

// The content directory is written by `pnpm prepare:content` (src/content/prepareContent.ts) from
// the knowledge base; nothing in it is authored here. `draft` marks a page still under review.
const docs = defineDocs({
    dir: 'content/docs',
    docs: {
        schema: pageSchema.extend({ draft: z.boolean().optional() }),
    },
});

export const source = loader({
    baseUrl: '/',
    source: docs.toFumadocsSource(),
    // The sidebar icons of the areas: Lucide names in the meta.json files (src/content/buildContent.ts).
    plugins: [lucideIconsPlugin()],
});

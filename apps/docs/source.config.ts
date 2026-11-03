import { defineConfig } from 'fumadocs-mdx/config';
import { remarkLinkCards } from './src/lib/remarkLinkCards';

// Global MDX options of the content collection (src/lib/source.ts defines the collection itself):
// the Fumadocs defaults plus the card grids of the landing pages.
export default defineConfig({
    mdxOptions: {
        remarkPlugins: (plugins) => [...plugins, remarkLinkCards],
    },
});

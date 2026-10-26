import type { IconType } from '@aragon/gov-ui-kit';
import { type LoaderPlugin, loader } from 'fumadocs-core/source';
import { pageSchema } from 'fumadocs-core/source/schema';
import { defineDocs } from 'fumadocs-mdx/macro';
import { createElement, type ReactNode } from 'react';
import { z } from 'zod';
import { Icon } from '../components/kit';

// The content directory is written by `pnpm prepare:content` (src/content/prepareContent.ts) from
// the knowledge base; nothing in it is authored here. `draft` marks a page still under review,
// `sidebarTitle` a sidebar label shorter than the page title.
const docs = defineDocs({
    dir: 'content/docs',
    docs: {
        schema: pageSchema.extend({
            draft: z.boolean().optional(),
            sidebarTitle: z.string().optional(),
        }),
    },
});

const toIcon = (icon: ReactNode): ReactNode =>
    typeof icon === 'string'
        ? createElement(Icon, { icon: icon as IconType, size: 'sm' })
        : icon;

// The sidebar entries of the top level (sidebarEntries in src/content/buildContent.ts): the
// gov-ui-kit icon names of the frontmatter and meta.json files, and the shorter labels.
const sidebarPlugin: LoaderPlugin = {
    name: 'aragon:sidebar',
    transformPageTree: {
        file(node, filePath) {
            const file =
                filePath == null ? undefined : this.storage.read(filePath);
            const sidebarTitle =
                file?.format === 'page'
                    ? (file.data as { sidebarTitle?: string }).sidebarTitle
                    : undefined;

            return {
                ...node,
                name: sidebarTitle ?? node.name,
                icon: toIcon(node.icon),
            };
        },
        folder(node) {
            return { ...node, icon: toIcon(node.icon) };
        },
    },
};

export const source = loader({
    baseUrl: '/',
    source: docs.toFumadocsSource(),
    plugins: [sidebarPlugin],
});

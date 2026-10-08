import path from 'node:path';
import {
    cleanBody,
    type ICorpusDocument,
    type ILinkContext,
    type ILinkResolver,
    isFenceLine,
    parseHeading,
    resolvePublicLink,
    rewriteLinks,
} from '@aragon/docs-corpus';
import {
    draftNotice,
    siteDescription,
    siteTitle,
    toCanonicalUrl,
} from '../lib/site';

// Turns the published pages of the knowledge base into the files the site is built from: one
// markdown file per page in the fumadocs content directory, a meta.json per folder with the
// sidebar order, and the public copies readers and models fetch (<page>.md, llms.txt,
// llms-full.txt). Pure: the CLI around it (prepareContent.ts) reads and writes.

export interface ISitePage {
    /**
     * Corpus-relative path (accounts/account.md), also the path of the public markdown copy.
     */
    path: string;
    /**
     * Site route without the base path (/accounts/account); Next adds the base path to links.
     */
    route: string;
    title: string;
    description?: string;
    draft: boolean;
    /**
     * Page markdown with its links resolved to site routes.
     */
    body: string;
}

export interface ISiteFolder {
    /**
     * Corpus directory: '' for the root, 'accounts' for an area.
     */
    dir: string;
    title: string;
    /**
     * The folder's landing page, from its index.md.
     */
    index?: ISitePage;
    /**
     * The folder's pages in sidebar order.
     */
    pages: ISitePage[];
}

export interface ISite {
    root: ISiteFolder;
    /**
     * The areas in sidebar order.
     */
    areas: ISiteFolder[];
}

export interface IFile {
    /**
     * Path relative to the directory the file is written to.
     */
    path: string;
    content: string;
}

const frontmatterPattern = /^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/;

/**
 * Site route of a corpus page: index pages are their folder (accounts/index.md → /accounts, the
 * root index.md → /).
 */
export const toRoute = (corpusPath: string): string =>
    `/${corpusPath.replace(/\.md$/, '').replace(/(?:^|\/)index$/, '')}`;

const indexPathOf = (dir: string): string =>
    dir === '' ? 'index.md' : `${dir}/index.md`;

const dirOf = (corpusPath: string): string => {
    const dir = path.posix.dirname(corpusPath);

    return dir === '.' ? '' : dir;
};

// Corpus path and fragment a relative link points at, resolved from the page it is on; a link
// starting with `/` is resolved from the corpus root.
const resolveLinkTarget = (
    url: string,
    fromPath: string,
): { path: string; fragment: string } => {
    const hashIndex = url.indexOf('#');
    const target = hashIndex === -1 ? url : url.slice(0, hashIndex);
    const fragment = hashIndex === -1 ? '' : url.slice(hashIndex);
    const resolved = target.startsWith('/')
        ? target.slice(1)
        : path.posix.join(path.posix.dirname(fromPath), target);

    return { path: path.posix.normalize(decodeURI(resolved)), fragment };
};

// A page is on the site when the mode publishes it; a folder's index page when the folder has
// a published page; the root index always, it is the home page.
const isOnSite = (
    corpusPath: string,
    publishedPaths: ReadonlySet<string>,
): boolean => {
    if (publishedPaths.has(corpusPath)) {
        return true;
    }

    if (path.posix.basename(corpusPath) !== 'index.md') {
        return false;
    }

    const dir = dirOf(corpusPath);

    return (
        dir === '' ||
        [...publishedPaths].some((published) => published.startsWith(`${dir}/`))
    );
};

/**
 * Link resolver of the site: a same-page anchor and an absolute link stay as written, a protocol
 * page goes to its public GitHub page (resolvePublicLink), a relative link to a page on the site
 * becomes the page's route with its fragment, and a link to anything else resolves nowhere, so
 * only its text is kept.
 */
export const resolveSiteLink: ILinkResolver = (url, context) => {
    if (url.startsWith('#')) {
        return url;
    }

    const publicDestination = resolvePublicLink(url, context);

    if (publicDestination != null) {
        return publicDestination;
    }

    const target = resolveLinkTarget(url, context.path);

    return isOnSite(target.path, context.publishedPaths)
        ? `${toRoute(target.path)}${target.fragment}`
        : null;
};

// The pages on the site an index page links to, in order of first appearance.
const listLinkedPaths = (source: string, context: ILinkContext): string[] => {
    const linked: string[] = [];

    rewriteLinks(source, (url) => {
        if (url.startsWith('#') || resolvePublicLink(url, context) != null) {
            return url;
        }

        const target = resolveLinkTarget(url, context.path).path;

        if (
            target !== context.path &&
            isOnSite(target, context.publishedPaths) &&
            !linked.includes(target)
        ) {
            linked.push(target);
        }

        return url;
    });

    return linked;
};

// The first level-one heading of a markdown file, frontmatter skipped.
const readTitle = (source: string): string | undefined => {
    let inFence = false;

    for (const line of source.replace(frontmatterPattern, '').split(/\r?\n/)) {
        if (isFenceLine(line)) {
            inFence = !inFence;
            continue;
        }

        const heading = parseHeading(line, inFence);

        if (heading?.level === 1) {
            return heading.text;
        }
    }

    return undefined;
};

// Pages in the order an index page links to them, the ones it does not link to after them by path.
const orderPages = (pages: ISitePage[], linkedPaths: string[]): ISitePage[] => {
    const linked = linkedPaths.flatMap(
        (linkedPath) => pages.find((page) => page.path === linkedPath) ?? [],
    );
    const rest = pages
        .filter((page) => !linked.includes(page))
        .sort((a, b) => a.path.localeCompare(b.path));

    return [...linked, ...rest];
};

const toSitePage = (document: ICorpusDocument): ISitePage => ({
    path: document.path,
    route: toRoute(document.path),
    title: document.title,
    description: document.summary,
    draft: document.status === 'draft',
    body: document.body,
});

/**
 * Arranges the published pages into the site: the areas (folders with published pages) and their
 * landing pages come from the index.md files, which also set the sidebar order — a folder's pages
 * follow the order its index links to them, the areas the order the root index links to their
 * landing pages, and pages an index does not link to come after, by path. `indexSources` holds
 * the raw index.md files of the corpus by path; a folder without one has no landing page.
 */
export const buildSite = (
    documents: ICorpusDocument[],
    indexSources: ReadonlyMap<string, string>,
): ISite => {
    const publishedPaths: ReadonlySet<string> = new Set(
        documents.map((document) => document.path),
    );

    const buildFolder = (dir: string): ISiteFolder => {
        const indexPath = indexPathOf(dir);
        const context: ILinkContext = { path: indexPath, publishedPaths };
        const source = indexSources.get(indexPath);
        const folderDocuments = documents.filter(
            (document) => dirOf(document.path) === dir,
        );
        const pages = folderDocuments.map(toSitePage);
        // The loader read the area title from the same index.md, or humanized the directory.
        const title =
            (source == null ? undefined : readTitle(source)) ??
            folderDocuments[0]?.area ??
            siteTitle;
        const linked = source == null ? [] : listLinkedPaths(source, context);

        return {
            dir,
            title,
            index:
                source == null
                    ? undefined
                    : {
                          path: indexPath,
                          route: toRoute(indexPath),
                          title,
                          draft: false,
                          body: cleanBody(
                              source.replace(frontmatterPattern, ''),
                              (url) => resolveSiteLink(url, context),
                          ),
                      },
            pages: orderPages(pages, linked),
        };
    };

    const root = buildFolder('');
    const rootSource = indexSources.get(indexPathOf('')) ?? '';
    const linkedDirs = listLinkedPaths(rootSource, {
        path: indexPathOf(''),
        publishedPaths,
    })
        .filter((linkedPath) => path.posix.basename(linkedPath) === 'index.md')
        .map(dirOf);
    const dirs = [...new Set(documents.map((document) => dirOf(document.path)))]
        .filter((dir) => dir !== '')
        .sort((a, b) => a.localeCompare(b));
    const areas = [
        ...linkedDirs.filter((dir) => dirs.includes(dir)),
        ...dirs.filter((dir) => !linkedDirs.includes(dir)),
    ].map(buildFolder);

    return { root, areas };
};

const slugOf = (corpusPath: string): string =>
    path.posix.basename(corpusPath, '.md');

const renderFrontmatter = (
    fields: Record<string, string | boolean | undefined>,
): string => {
    const lines = Object.entries(fields)
        .filter(([, value]) => value !== undefined)
        // JSON strings are valid YAML double-quoted scalars, so titles with colons or quotes are safe.
        .map(([key, value]) => `${key}: ${JSON.stringify(value)}`);

    return `---\n${lines.join('\n')}\n---\n\n`;
};

const toContentFile = (page: ISitePage): IFile => ({
    path: page.path,
    content: `${renderFrontmatter({
        title: page.title,
        description: page.description,
        draft: page.draft || undefined,
    })}${page.body}\n`,
});

// The sidebar order of a folder: its pages in order, then whatever else is in the folder.
const toMetaFile = (folder: ISiteFolder, items: string[]): IFile => ({
    path: path.posix.join(folder.dir, 'meta.json'),
    content: `${JSON.stringify({ title: folder.title, pages: [...items, '...'] }, null, 4)}\n`,
});

/**
 * The files of the fumadocs content directory: a markdown page per published page and landing
 * page, a meta.json per folder.
 */
export const renderContentFiles = (site: ISite): IFile[] => {
    const folders = [site.root, ...site.areas];
    const pages = folders.flatMap((folder) => [
        ...(folder.index == null ? [] : [folder.index]),
        ...folder.pages,
    ]);

    // The home page opens the root folder's list; an area's landing page is its folder entry.
    return [
        ...pages.map(toContentFile),
        toMetaFile(site.root, [
            ...(site.root.index == null ? [] : ['index']),
            ...site.root.pages.map((page) => slugOf(page.path)),
            ...site.areas.map((area) => area.dir),
        ]),
        ...site.areas.map((area) =>
            toMetaFile(
                area,
                area.pages.map((page) => slugOf(page.path)),
            ),
        ),
    ];
};

// A page as a standalone markdown document: title, draft notice, summary, body with absolute links.
const renderMarkdown = (page: ISitePage): string => {
    const notice = page.draft ? `> ${draftNotice}\n\n` : '';
    const summary = page.description == null ? '' : `${page.description}\n\n`;
    const body = rewriteLinks(page.body, (url) =>
        url.startsWith('/') ? toCanonicalUrl(url) : url,
    );

    return `# ${page.title}\n\n${notice}${summary}${body}\n`;
};

const renderLlmsEntry = (page: ISitePage): string => {
    const summary = page.description == null ? '' : `: ${page.description}`;

    return `- [${page.title}](${toCanonicalUrl(page.route)}.md)${summary}`;
};

/**
 * The files of the public directory: a markdown copy of every page next to its HTML
 * (/accounts/account.md), the llms.txt index and the llms-full.txt concatenation.
 */
export const renderPublicFiles = (site: ISite): IFile[] => {
    const folders = [site.root, ...site.areas];
    const pages = folders.flatMap((folder) => [
        ...(folder.index == null ? [] : [folder.index]),
        ...folder.pages,
    ]);
    const index = [
        `# ${siteTitle}`,
        '',
        `> ${siteDescription}`,
        '',
        ...site.root.pages.map(renderLlmsEntry),
        ...site.areas.flatMap((area) => [
            '',
            `## ${area.title}`,
            '',
            ...area.pages.map(renderLlmsEntry),
        ]),
    ];
    const full = pages.map(
        (page) =>
            `# ${page.title} (${toCanonicalUrl(page.route)})\n\n${renderMarkdown(page).replace(/^# .*\n\n/, '')}`,
    );

    return [
        ...pages.map((page) => ({
            path: page.path,
            content: renderMarkdown(page),
        })),
        { path: 'llms.txt', content: `${index.join('\n')}\n` },
        { path: 'llms-full.txt', content: full.join('\n---\n\n') },
    ];
};

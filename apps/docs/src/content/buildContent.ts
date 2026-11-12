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
import type { IconType } from '@aragon/gov-ui-kit';
import {
    draftNotice,
    siteDescription,
    siteTitle,
    toCanonicalUrl,
    toMarkdownFile,
    toMarkdownUrl,
} from '../lib/site';

// Turns the published pages of the knowledge base into the files the site is built from: one
// markdown file per page in the fumadocs content directory, a meta.json per folder with the
// sidebar order, and the public copies readers and models fetch (<page>.md, llms.txt,
// llms-full.txt). Pure: the CLI around it (prepareContent.ts) reads and writes.

export interface ISitePage {
    /**
     * Corpus-relative path (accounts/account.md).
     */
    path: string;
    /**
     * Site route without the base path (/accounts/account); Next adds the base path to links.
     * It also names the public markdown copy (toMarkdownFile), so a landing page's copy sits
     * next to its route (/accounts → accounts.md), where the page actions look for it.
     */
    route: string;
    title: string;
    description?: string;
    draft: boolean;
    /**
     * Date of the last change of the page in the knowledge base (ISO 8601), when its checkout has
     * the history.
     */
    lastModified?: string;
    /**
     * Page markdown with its links resolved to site routes.
     */
    body: string;
}

export interface ISiteFolder {
    /**
     * Corpus directory: '' for the root, 'accounts' for an area, 'governance/configuration' for
     * a folder inside one.
     */
    dir: string;
    title: string;
    /**
     * The folder's landing page, from its index.md.
     */
    index?: ISitePage;
    /**
     * The folder's own pages in sidebar order.
     */
    pages: ISitePage[];
    /**
     * The folders inside it in sidebar order; the sidebar nests them the way the corpus does.
     */
    folders: ISiteFolder[];
    /**
     * The sidebar order of the folder: the slugs of its pages and the names of its folders, as
     * its index links to them, the ones it does not link to after (pages by path, then folders).
     */
    order: string[];
}

export interface ISite {
    root: ISiteFolder;
    /**
     * The areas (the root's folders) in sidebar order.
     */
    areas: ISiteFolder[];
}

/**
 * Every page of a folder and the folders inside it: the landing page first, then the pages, then
 * the folders in sidebar order.
 */
export const listSitePages = (folder: ISiteFolder): ISitePage[] => [
    ...(folder.index == null ? [] : [folder.index]),
    ...folder.pages,
    ...folder.folders.flatMap(listSitePages),
];

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

// The directory of a page, and the parent of a directory ('' for the root and the areas).
const dirOf = (corpusPath: string): string => {
    const dir = path.posix.dirname(corpusPath);

    return dir === '.' ? '' : dir;
};

const slugOf = (corpusPath: string): string =>
    path.posix.basename(corpusPath, '.md');

// The title of a folder with neither an index page nor a page of its own, from its name
// (staged-governance → Staged governance).
const humanizeDir = (dir: string): string => {
    const name = path.posix.basename(dir).replace(/-/g, ' ');

    return name.charAt(0).toUpperCase() + name.slice(1);
};

// A destination the author percent-encoded is compared decoded; one with a stray `%` (not an
// escape) is compared as written, like every other mistake of the corpus.
const decodePath = (value: string): string => {
    try {
        return decodeURI(value);
    } catch {
        return value;
    }
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

    return { path: path.posix.normalize(decodePath(resolved)), fragment };
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

const toSitePage = (
    document: ICorpusDocument,
    lastModified: ReadonlyMap<string, string>,
): ISitePage => ({
    path: document.path,
    route: toRoute(document.path),
    title: document.title,
    description: document.summary,
    draft: document.status === 'draft',
    lastModified: lastModified.get(document.path),
    body: document.body,
});

/**
 * Arranges the published pages into the site, the tree of the corpus: the areas (folders with
 * published pages), the folders inside them and their landing pages come from the index.md
 * files, which also set the sidebar order — a folder's pages and folders follow the order its
 * index links to them (a folder through its landing page), the areas the order the root index
 * links to their landing pages, and what an index does not link to comes after, by path.
 * `indexSources` holds the raw index.md files of the corpus by path; a folder without one has no
 * landing page. `lastModified` dates the corpus files by their last change (readLastModified of
 * the loader); a page it does not date shows no date.
 */
export const buildSite = (
    documents: ICorpusDocument[],
    indexSources: ReadonlyMap<string, string>,
    lastModified: ReadonlyMap<string, string> = new Map(),
): ISite => {
    const publishedPaths: ReadonlySet<string> = new Set(
        documents.map((document) => document.path),
    );
    // Every directory on the way to a published page: a folder of the site.
    const folderDirs = new Set<string>();
    for (const document of documents) {
        for (let dir = dirOf(document.path); dir !== ''; dir = dirOf(dir)) {
            folderDirs.add(dir);
        }
    }

    const buildFolder = (dir: string): ISiteFolder => {
        const indexPath = indexPathOf(dir);
        const context: ILinkContext = { path: indexPath, publishedPaths };
        const source = indexSources.get(indexPath);
        const folderDocuments = documents.filter(
            (document) => dirOf(document.path) === dir,
        );
        const pages = folderDocuments.map((document) =>
            toSitePage(document, lastModified),
        );
        const childDirs = [...folderDirs]
            .filter((candidate) => dirOf(candidate) === dir)
            .sort((a, b) => a.localeCompare(b));
        // The loader read the area title from the same index.md, or humanized the directory.
        const title =
            (source == null ? undefined : readTitle(source)) ??
            folderDocuments[0]?.area ??
            (dir === '' ? siteTitle : humanizeDir(dir));
        const linked = source == null ? [] : listLinkedPaths(source, context);
        const linkedDirs = linked
            .filter((linkedPath) => slugOf(linkedPath) === 'index')
            .map(dirOf)
            .filter((linkedDir) => childDirs.includes(linkedDir));
        const folders = [
            ...linkedDirs,
            ...childDirs.filter((childDir) => !linkedDirs.includes(childDir)),
        ].map(buildFolder);
        const orderedPages = orderPages(pages, linked);
        const linkedNames = linked.flatMap((linkedPath) => {
            if (pages.some((page) => page.path === linkedPath)) {
                return [slugOf(linkedPath)];
            }
            const linkedDir = dirOf(linkedPath);

            return slugOf(linkedPath) === 'index' &&
                childDirs.includes(linkedDir)
                ? [path.posix.basename(linkedDir)]
                : [];
        });
        const order = [
            ...linkedNames,
            ...orderedPages.map((page) => slugOf(page.path)),
            ...folders.map((folder) => path.posix.basename(folder.dir)),
        ].filter((name, index, names) => names.indexOf(name) === index);

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
                          lastModified: lastModified.get(indexPath),
                          body: cleanBody(
                              source.replace(frontmatterPattern, ''),
                              (url) => resolveSiteLink(url, context),
                          ),
                      },
            pages: orderedPages,
            folders,
            order,
        };
    };

    const root = buildFolder('');

    return { root, areas: root.folders };
};

const renderFrontmatter = (
    fields: Record<string, string | boolean | undefined>,
): string => {
    const lines = Object.entries(fields)
        .filter(([, value]) => value !== undefined)
        // JSON strings are valid YAML double-quoted scalars, so titles with colons or quotes are safe.
        .map(([key, value]) => `${key}: ${JSON.stringify(value)}`);

    return `---\n${lines.join('\n')}\n---\n\n`;
};

export interface ISidebarEntry {
    /**
     * Root page slug (`value-proposition`, `index` for the home page) or area directory.
     */
    name: string;
    /**
     * Sidebar label when it differs from the page title.
     */
    label?: string;
    /**
     * gov-ui-kit icon name, resolved by the loader in src/lib/source.ts.
     */
    icon: `${IconType}`;
}

// The top level of the sidebar, in order: the root pages and the areas, each with its gov-ui-kit
// icon. Root pages and areas not listed here follow, in the order the root index gives them.
export const sidebarEntries: readonly ISidebarEntry[] = [
    { name: 'index', label: 'Home', icon: 'HOME' },
    { name: 'value-proposition', label: 'Why Aragon?', icon: 'INFO' },
    { name: 'application', icon: 'APP_EXPLORE' },
    { name: 'accounts', icon: 'APP_DASHBOARD' },
    { name: 'access-control', icon: 'BLOCKCHAIN_SMARTCONTRACT' },
    { name: 'governance', icon: 'APP_PROPOSALS' },
    { name: 'treasury', icon: 'APP_ASSETS' },
    { name: 'osx-and-the-platform', label: 'Aragon OSx', icon: 'SLASH' },
    { name: 'guides', icon: 'HELP' },
];

const sidebarEntryOf = (name: string): ISidebarEntry | undefined =>
    sidebarEntries.find((entry) => entry.name === name);

const sidebarRankOf = (name: string): number => {
    const rank = sidebarEntries.findIndex((entry) => entry.name === name);

    return rank === -1 ? sidebarEntries.length : rank;
};

// A root page carries its sidebar label and icon in its frontmatter; pages in an area show neither.
const toContentFile = (page: ISitePage, entry?: ISidebarEntry): IFile => ({
    path: page.path,
    content: `${renderFrontmatter({
        title: page.title,
        description: page.description,
        draft: page.draft || undefined,
        lastModified: page.lastModified,
        sidebarTitle: entry?.label,
        icon: entry?.icon,
    })}${page.body}\n`,
});

// The sidebar order of a folder: its pages and folders in order, then whatever else is in it.
const toMetaFile = (folder: ISiteFolder, items: string[]): IFile => ({
    path: path.posix.join(folder.dir, 'meta.json'),
    content: `${JSON.stringify(
        {
            title: folder.title,
            icon: sidebarEntryOf(folder.dir)?.icon,
            pages: [...items, '...'],
        },
        null,
        4,
    )}\n`,
});

// The files of a folder and the folders inside it; a folder's landing page is its folder entry.
const renderFolderFiles = (folder: ISiteFolder, items: string[]): IFile[] => [
    ...(folder.index == null ? [] : [toContentFile(folder.index)]),
    ...folder.pages.map((page) => toContentFile(page)),
    toMetaFile(folder, items),
    ...folder.folders.flatMap((child) => renderFolderFiles(child, child.order)),
];

/**
 * The files of the fumadocs content directory: a markdown page per published page and landing
 * page, a meta.json per folder.
 */
export const renderContentFiles = (site: ISite): IFile[] => {
    const rootPages = [
        ...(site.root.index == null ? [] : [site.root.index]),
        ...site.root.pages,
    ];
    // The home page and the root pages sit next to the areas; sidebarEntries orders them together
    // (a stable sort, so the unlisted ones keep the order of the root index).
    const rootItems = [
        ...(site.root.index == null ? [] : ['index']),
        ...site.root.order,
    ].sort((a, b) => sidebarRankOf(a) - sidebarRankOf(b));

    return [
        ...rootPages.map((page) =>
            toContentFile(page, sidebarEntryOf(slugOf(page.path))),
        ),
        toMetaFile(site.root, rootItems),
        ...site.areas.flatMap((area) => renderFolderFiles(area, area.order)),
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

    return `- [${page.title}](${toMarkdownUrl(page.route)})${summary}`;
};

/**
 * The files of the public directory: a markdown copy of every page next to its HTML
 * (/accounts/account.md, /accounts.md for a landing page), the llms.txt index and the
 * llms-full.txt concatenation.
 */
export const renderPublicFiles = (site: ISite): IFile[] => {
    const pages = listSitePages(site.root);
    // An area is a section of the index, a folder inside it a subsection.
    const renderLlmsSection = (
        folder: ISiteFolder,
        level: number,
    ): string[] => [
        '',
        `${'#'.repeat(level)} ${folder.title}`,
        '',
        ...folder.pages.map(renderLlmsEntry),
        ...folder.folders.flatMap((child) =>
            renderLlmsSection(child, Math.min(level + 1, 6)),
        ),
    ];
    const index = [
        `# ${siteTitle}`,
        '',
        `> ${siteDescription}`,
        '',
        ...site.root.pages.map(renderLlmsEntry),
        ...site.areas.flatMap((area) => renderLlmsSection(area, 2)),
    ];
    const full = pages.map(
        (page) =>
            `# ${page.title} (${toCanonicalUrl(page.route)})\n\n${renderMarkdown(page).replace(/^# .*\n\n/, '')}`,
    );

    return [
        ...pages.map((page) => ({
            path: toMarkdownFile(page.route),
            content: renderMarkdown(page),
        })),
        { path: 'llms.txt', content: `${index.join('\n')}\n` },
        { path: 'llms-full.txt', content: full.join('\n---\n\n') },
    ];
};

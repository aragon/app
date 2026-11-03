import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Nodes } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { parse as parseYaml } from 'yaml';

/**
 * Which pages of the knowledge base make it into the documentation index. `ready` is the set the
 * product owner has validated (see publishedStatusesByMode) — the same pages the public docs site
 * will publish; `drafts` adds the pages still under review, so the non-production environments
 * have a real corpus to test the assistant against while the review is in progress.
 */
export type IDocsCorpusMode = 'ready' | 'drafts';

// Entry types that carry product knowledge (the base's canonical pages and guides). Tasks, notes
// and opportunities are the base's own bookkeeping — work items, boards, candidate ideas — and
// never describe how the product works.
export const knowledgeDocTypes: ReadonlySet<string> = new Set([
    'concept',
    'capability',
    'pattern',
    'decision',
    'principle',
    'risk',
    'reference',
    'guide',
    'example',
]);

// Which `status` values a corpus mode publishes. The base's workflow (platform-doc/WORKFLOW.md)
// marks a page under review with `status: draft` and REMOVES the field once the product owner has
// validated it — so a knowledge page with no status is a validated one and publishes in every
// mode, next to the explicit `ready` value planned as the publish switch. Any other status
// (blocked, candidate, in-progress, …) belongs to work items and never publishes.
const publishedStatusesByMode: Record<
    IDocsCorpusMode,
    ReadonlySet<string | undefined>
> = {
    ready: new Set([undefined, 'ready']),
    drafts: new Set([undefined, 'ready', 'draft']),
};

// Never knowledge, whatever they contain: version control and agent configuration, the read-only
// protocol submodule, raw captures and the owner's inbox and research workspace (mirrors the
// base's own ignore list in wiki.toml), and `internal/` — the base's own workflow keeps builder
// guidance, design principles, documentation maintenance and product opportunities there and
// excludes the folder from user-facing content (platform-doc/WORKFLOW.md, "User-facing content
// and existing metadata"). Its pages carry ordinary knowledge types, so the location is the
// only thing that tells them apart from product pages.
const skippedDirectories: ReadonlySet<string> = new Set([
    '.git',
    '.claude',
    '.agents',
    '.wiki',
    '.obsidian',
    'node_modules',
    'protocol-doc',
    'raw',
    'inbox',
    'research',
    'internal',
]);

/**
 * Where a protocol page (a `protocol-doc/…` link in the base) can be read outside the wiki. The
 * protocol documentation has no developer portal yet, so its GitHub pages stand in — the same
 * destination the base's own "On GitHub" links use. When the portal exists, this is the one
 * place to point at it.
 */
export const protocolDocPublicBaseUrl =
    'https://github.com/aragon/protocol-doc/blob/main/';

// Sections that hold the base's review bookkeeping rather than product knowledge: open owner
// questions and parked progress notes. Matched on the heading text, at any heading level.
const maintenanceSectionPattern = /^(open questions?\b|progress$)/i;

export interface ICorpusDocument {
    /**
     * Corpus-relative POSIX path (accounts/account.md): the page's identity across the index and
     * the tools.
     */
    path: string;
    title: string;
    type: string;
    /**
     * Review state as written in the frontmatter; absent on a page the product owner validated.
     */
    status?: string;
    summary?: string;
    /**
     * Title of the area the page belongs to — its folder's index page heading, or the root index
     * heading for top-level pages.
     */
    area: string;
    /**
     * Page markdown without frontmatter, without its title heading and without the maintenance
     * sections and owner checklists.
     */
    body: string;
}

export type ICorpusSkipReason =
    | 'no-frontmatter'
    | 'invalid-frontmatter'
    | 'not-knowledge'
    | 'status'
    | 'no-title';

export interface ICorpusSkippedFile {
    path: string;
    reason: ICorpusSkipReason;
}

export interface ILinkContext {
    /**
     * Corpus-relative path of the page the link is on.
     */
    path: string;
    /**
     * Paths of the pages the corpus publishes in the mode it was loaded with.
     */
    publishedPaths: ReadonlySet<string>;
}

/**
 * Where a link destination points once the page is read outside the wiki; null drops the link
 * and keeps its text (an image its alt text).
 */
export type ILinkResolver = (
    url: string,
    context: ILinkContext,
) => string | null;

export interface ILoadCorpusParams {
    rootDir: string;
    mode: IDocsCorpusMode;
    /**
     * Where the links of a page point for the consumer's readers; resolvePublicLink when absent.
     */
    resolveLink?: ILinkResolver;
}

export interface ILoadCorpusResult {
    documents: ICorpusDocument[];
    skipped: ICorpusSkippedFile[];
}

const frontmatterPattern = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/;
const frontmatterLinePattern = /^([a-z_]+):\s*(.*)$/;
const headingPattern = /^(#{1,6})\s+(.*?)\s*#*\s*$/;
const fencePattern = /^\s*(```|~~~)/;
const checklistPattern = /^\s*[-*]\s+\[[ xX]\]\s/;

type IFrontmatter = Record<string, unknown>;

// The base's own tooling reads frontmatter more leniently than a YAML parser: a `source:`
// provenance line quoting a title with a colon in it is a YAML error, and losing the page over it
// would be wrong. When the block does not parse, the scalar keys this loader needs are read line
// by line instead.
const parseFrontmatterLines = (block: string): IFrontmatter => {
    const data: IFrontmatter = {};

    for (const line of block.split(/\r?\n/)) {
        const match = frontmatterLinePattern.exec(line);

        if (match?.[1] != null) {
            data[match[1]] = (match[2] ?? '')
                .trim()
                .replace(/^["']|["']$/g, '');
        }
    }

    return data;
};

const parseFrontmatter = (
    source: string,
): { data: IFrontmatter; body: string } | ICorpusSkipReason => {
    const match = frontmatterPattern.exec(source);

    if (match == null) {
        return 'no-frontmatter';
    }

    const block = match[1] ?? '';
    const body = source.slice(match[0].length);

    try {
        const data: unknown = parseYaml(block);

        if (data == null || typeof data !== 'object' || Array.isArray(data)) {
            return 'invalid-frontmatter';
        }

        return { data: data as IFrontmatter, body };
    } catch {
        const data = parseFrontmatterLines(block);

        return Object.keys(data).length === 0
            ? 'invalid-frontmatter'
            : { data, body };
    }
};

const readString = (data: IFrontmatter, key: string): string | undefined => {
    const value = data[key];

    return typeof value === 'string' && value.trim() !== ''
        ? value.trim()
        : undefined;
};

/**
 * Walks the page lines while tracking fenced code blocks, so a `#` line inside a code sample is
 * never taken for a heading. Yields the heading level and text for heading lines, null otherwise.
 */
export const parseHeading = (
    line: string,
    inFence: boolean,
): { level: number; text: string } | null => {
    if (inFence) {
        return null;
    }

    const match = headingPattern.exec(line);

    return match == null
        ? null
        : { level: match[1]?.length ?? 0, text: match[2] ?? '' };
};

export const isFenceLine = (line: string): boolean => fencePattern.test(line);

// Rewrites the links (see rewriteLinks), then strips the title heading, the maintenance sections
// (with everything below them until a heading of the same or a higher level) and the owner
// checklists; collapses the blank runs that leaves.
export const cleanBody = (
    markdown: string,
    resolve: (url: string) => string | null = toPublicDestination,
): string => {
    const kept: string[] = [];
    let inFence = false;
    let skippingBelowLevel: number | null = null;
    let titleSeen = false;

    for (const line of rewriteLinks(markdown, resolve).split(/\r?\n/)) {
        if (isFenceLine(line)) {
            inFence = !inFence;
        }

        const heading = parseHeading(line, inFence || isFenceLine(line));

        if (heading != null && skippingBelowLevel != null) {
            if (heading.level <= skippingBelowLevel) {
                skippingBelowLevel = null;
            } else {
                continue;
            }
        }

        if (skippingBelowLevel != null) {
            continue;
        }

        if (heading != null && maintenanceSectionPattern.test(heading.text)) {
            skippingBelowLevel = heading.level;
            continue;
        }

        if (heading != null && heading.level === 1 && !titleSeen) {
            titleSeen = true;
            continue;
        }

        if (!inFence && checklistPattern.test(line)) {
            continue;
        }

        kept.push(line);
    }

    return kept
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
};

const absoluteLinkPattern = /^[a-z][a-z0-9+.-]*:/i;
const protocolDocLinkPattern = /^(?:\.\.?\/)*\/?protocol-doc\/(.*)$/;

// Where a destination may point for a reader with no access to the base: an absolute one where
// it points, a protocol page at its public address, anything else nowhere (null).
const toPublicDestination = (url: string): string | null => {
    if (absoluteLinkPattern.test(url)) {
        return url;
    }

    const protocolPath = protocolDocLinkPattern.exec(url)?.[1];

    return protocolPath == null
        ? null
        : `${protocolDocPublicBaseUrl}${protocolPath}`;
};

/**
 * The resolver of a reader with no access to the knowledge base, which is what the assistant's
 * users are. Absolute links (aragon.org, GitHub, explorers) stay as written. A link into the
 * protocol documentation — relative in the base, since it is a submodule there — becomes the
 * public GitHub page of the same file, fragment included: the agent may hand it to a user with a
 * protocol question. Any other relative link points at a page of this knowledge base or at a
 * section of the same page and resolves nowhere: only its text is kept, so a page path or name
 * can never leave the corpus as a link. The docs site resolves those onto its own pages instead.
 */
export const resolvePublicLink: ILinkResolver = (url) =>
    toPublicDestination(url);

/**
 * Rewrites the links of a page for a reader outside the wiki: every destination goes through
 * the resolver, and a link it resolves nowhere keeps its text only. Images and link definitions
 * follow the same rule (an image falls back to its alt text, a definition is removed); a
 * reference follows its definition.
 *
 * Links are found by the markdown parser the widget renders with (micromark; the widget's GFM
 * extension only adds bare absolute URLs), so every form the widget would draw as a link is seen
 * here — inline with or without a title or angle brackets, reference, autolink — and code is
 * never touched. The page is rewritten in place: only the source of a rewritten link changes.
 */
export const rewriteLinks = (
    markdown: string,
    resolve: (url: string) => string | null = toPublicDestination,
): string => {
    const tree = fromMarkdown(markdown);
    const definitions = new Map<string, string>();

    const collectDefinitions = (node: Nodes) => {
        if (node.type === 'definition') {
            definitions.set(node.identifier, node.url);
        }

        if ('children' in node) {
            for (const child of node.children) {
                collectDefinitions(child);
            }
        }
    };
    collectDefinitions(tree);

    const offsetsOf = (node: Nodes): [number, number] => [
        node.position?.start.offset ?? 0,
        node.position?.end.offset ?? 0,
    ];

    // The source between two offsets, with the given nodes inside it rewritten.
    const renderRange = (
        start: number,
        end: number,
        children: Nodes[],
    ): string => {
        let output = '';
        let cursor = start;

        for (const child of children) {
            const [childStart, childEnd] = offsetsOf(child);
            output += markdown.slice(cursor, childStart) + render(child);
            cursor = childEnd;
        }

        return output + markdown.slice(cursor, end);
    };

    // A link's text as written: its content nodes, rewritten, without the brackets.
    const renderText = (children: Nodes[]): string => {
        const first = children[0];
        const last = children.at(-1);

        return first == null || last == null
            ? ''
            : renderRange(offsetsOf(first)[0], offsetsOf(last)[1], children);
    };

    const render = (node: Nodes): string => {
        const [start, end] = offsetsOf(node);
        const verbatim = () =>
            renderRange(start, end, 'children' in node ? node.children : []);

        switch (node.type) {
            case 'link': {
                const destination = resolve(node.url);

                if (destination == null) {
                    return renderText(node.children);
                }

                return destination === node.url
                    ? verbatim()
                    : `[${renderText(node.children)}](${destination})`;
            }
            case 'image': {
                const destination = resolve(node.url);

                if (destination == null) {
                    return node.alt ?? '';
                }

                return destination === node.url
                    ? verbatim()
                    : `![${node.alt ?? ''}](${destination})`;
            }
            case 'definition': {
                const destination = resolve(node.url);

                if (destination == null) {
                    return '';
                }

                return destination === node.url
                    ? verbatim()
                    : `[${node.label ?? node.identifier}]: ${destination}`;
            }
            // A reference follows its definition, which is rewritten on its own: a protocol one
            // points at the public page already, a relative one is gone.
            case 'linkReference':
                return resolve(definitions.get(node.identifier) ?? '') == null
                    ? renderText(node.children)
                    : verbatim();
            case 'imageReference':
                return resolve(definitions.get(node.identifier) ?? '') == null
                    ? (node.alt ?? '')
                    : verbatim();
            default:
                return verbatim();
        }
    };

    return render(tree);
};

// The first level-one heading of a markdown file, frontmatter skipped — how a folder's index page
// names the area it fronts.
const readFirstHeading = (source: string): string | undefined => {
    const frontmatter = frontmatterPattern.exec(source);
    const body =
        frontmatter == null ? source : source.slice(frontmatter[0].length);
    let inFence = false;

    for (const line of body.split(/\r?\n/)) {
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

const humanizeDirectory = (directory: string): string => {
    const name = directory.split('/').at(-1) ?? directory;

    return name
        .split('-')
        .filter((part) => part !== '')
        .map((part, index) =>
            index === 0 ? part.charAt(0).toUpperCase() + part.slice(1) : part,
        )
        .join(' ');
};

const toPosix = (filePath: string): string =>
    filePath.split(path.sep).join('/');

const isSkippedPath = (relativePath: string): boolean =>
    relativePath
        .split('/')
        .slice(0, -1)
        .some((segment) => skippedDirectories.has(segment));

/**
 * Reads the knowledge base and keeps the pages the given mode publishes. The gate fails closed:
 * a page without frontmatter, of a non-knowledge type, without a title, or in a review state the
 * mode does not publish is skipped (and reported, so a build can show what it left out). The
 * links of the kept pages are resolved once the set is known, so a resolver can tell a link to
 * a published page from one to a page the mode leaves out.
 */
export const loadCorpus = async (
    params: ILoadCorpusParams,
): Promise<ILoadCorpusResult> => {
    const { rootDir, mode, resolveLink = resolvePublicLink } = params;
    const publishedStatuses = publishedStatusesByMode[mode];
    const entries = await readdir(rootDir, {
        withFileTypes: true,
        recursive: true,
    });
    const files = entries
        .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
        .map((entry) =>
            toPosix(
                path.relative(rootDir, path.join(entry.parentPath, entry.name)),
            ),
        )
        .filter((relativePath) => !isSkippedPath(relativePath))
        .sort();

    const areaTitles = new Map<string, string>();
    const resolveArea = async (directory: string): Promise<string> => {
        const cached = areaTitles.get(directory);
        if (cached != null) {
            return cached;
        }

        const indexPath = path.join(rootDir, directory, 'index.md');
        const heading = await readFile(indexPath, 'utf8')
            .then(readFirstHeading)
            .catch(() => undefined);
        const area = heading ?? humanizeDirectory(directory);
        areaTitles.set(directory, area);

        return area;
    };

    const pages: ICorpusDocument[] = [];
    const skipped: ICorpusSkippedFile[] = [];

    for (const relativePath of files) {
        const source = await readFile(path.join(rootDir, relativePath), 'utf8');
        const parsed = parseFrontmatter(source);

        if (typeof parsed === 'string') {
            skipped.push({ path: relativePath, reason: parsed });
            continue;
        }

        const type = readString(parsed.data, 'type');
        if (type == null || !knowledgeDocTypes.has(type)) {
            skipped.push({ path: relativePath, reason: 'not-knowledge' });
            continue;
        }

        const status = readString(parsed.data, 'status');
        if (!publishedStatuses.has(status)) {
            skipped.push({ path: relativePath, reason: 'status' });
            continue;
        }

        const title = readString(parsed.data, 'title');
        if (title == null) {
            skipped.push({ path: relativePath, reason: 'no-title' });
            continue;
        }

        pages.push({
            path: relativePath,
            title,
            type,
            status,
            summary: readString(parsed.data, 'summary'),
            area: await resolveArea(
                path.posix.dirname(relativePath) === '.'
                    ? ''
                    : path.posix.dirname(relativePath),
            ),
            body: parsed.body,
        });
    }

    const publishedPaths: ReadonlySet<string> = new Set(
        pages.map((page) => page.path),
    );
    const documents = pages.map((page) => ({
        ...page,
        body: cleanBody(page.body, (url) =>
            resolveLink(url, { path: page.path, publishedPaths }),
        ),
    }));

    return { documents, skipped };
};

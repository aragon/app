import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
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
// base's own ignore list in wiki.toml).
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
]);

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

export interface ILoadCorpusParams {
    rootDir: string;
    mode: IDocsCorpusMode;
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

// Strips the title heading, the maintenance sections (with everything below them until a heading
// of the same or a higher level) and the owner checklists; collapses the blank runs that leaves.
export const cleanBody = (markdown: string): string => {
    const kept: string[] = [];
    let inFence = false;
    let skippingBelowLevel: number | null = null;
    let titleSeen = false;

    for (const line of markdown.split(/\r?\n/)) {
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
 * mode does not publish is skipped (and reported, so a build can show what it left out).
 */
export const loadCorpus = async (
    params: ILoadCorpusParams,
): Promise<ILoadCorpusResult> => {
    const { rootDir, mode } = params;
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

    const documents: ICorpusDocument[] = [];
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

        documents.push({
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
            body: cleanBody(parsed.body),
        });
    }

    return { documents, skipped };
};

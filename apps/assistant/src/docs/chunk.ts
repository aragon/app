import { type ICorpusDocument, isFenceLine, parseHeading } from './corpus';

export interface IDocChunk {
    /**
     * `${path}#${index}` — stable within one build, the Orama document id.
     */
    id: string;
    path: string;
    title: string;
    /**
     * Where the passage sits in the documentation: area › page › section (› subsection).
     */
    breadcrumb: string;
    /**
     * Section heading the chunk belongs to, empty for a page's introduction.
     */
    section: string;
    /**
     * The passage markdown, heading lines included (they carry the section's own words for the
     * full-text side of the search).
     */
    text: string;
}

// About 1500 tokens: long enough to keep a section's argument together, short enough that five
// hits plus the conversation fit any turn.
export const defaultChunkMaxChars = 6000;

const breadcrumbSeparator = ' › ';

export const buildBreadcrumb = (parts: Array<string | undefined>): string =>
    parts
        .filter((part): part is string => part != null && part !== '')
        .join(breadcrumbSeparator);

interface IBlock {
    heading: string;
    level: number;
    lines: string[];
}

// Splits markdown into blocks at headings of the given level (a heading of a HIGHER level than
// `level`, i.e. a smaller number, also closes the block); the text before the first heading is
// the block with an empty heading. Code fences are opaque.
const splitAtHeadings = (lines: string[], level: number): IBlock[] => {
    const blocks: IBlock[] = [{ heading: '', level: 0, lines: [] }];
    let inFence = false;

    for (const line of lines) {
        const heading = parseHeading(line, inFence);

        if (heading != null && heading.level <= level) {
            blocks.push({
                heading: heading.text,
                level: heading.level,
                lines: [line],
            });
            continue;
        }

        if (isFenceLine(line)) {
            inFence = !inFence;
        }

        blocks.at(-1)?.lines.push(line);
    }

    return blocks.filter((block) => block.lines.join('\n').trim() !== '');
};

// Greedy paragraph packing for a block that is too long even as a subsection: paragraphs are
// accumulated up to the cap; a single paragraph over the cap stays whole (a table or a long list
// is worth more intact than clipped).
const splitAtParagraphs = (text: string, maxChars: number): string[] => {
    const paragraphs = text.split(/\n{2,}/);
    const pieces: string[] = [];
    let current = '';

    for (const paragraph of paragraphs) {
        const candidate =
            current === '' ? paragraph : `${current}\n\n${paragraph}`;

        if (candidate.length > maxChars && current !== '') {
            pieces.push(current);
            current = paragraph;
        } else {
            current = candidate;
        }
    }

    if (current.trim() !== '') {
        pieces.push(current);
    }

    return pieces;
};

/**
 * Cuts a page into passages: one per level-two section (its subsections included), the
 * introduction on its own. A section over the cap is cut at its level-three headings, and a
 * subsection still over it at paragraph boundaries. Every passage is prefixed by its breadcrumb
 * when embedded (see toEmbeddingInput), so a passage keeps saying which page and section it is
 * about even when its own words do not.
 */
export const chunkDocument = (
    document: ICorpusDocument,
    params: { maxChars?: number } = {},
): IDocChunk[] => {
    const { maxChars = defaultChunkMaxChars } = params;
    const lines = document.body.split(/\r?\n/);
    const pieces: Array<{ section: string; text: string }> = [];

    for (const section of splitAtHeadings(lines, 2)) {
        const sectionText = section.lines.join('\n').trim();

        if (sectionText.length <= maxChars) {
            pieces.push({ section: section.heading, text: sectionText });
            continue;
        }

        // The section heading line is set aside so it does not open a block of its own, and
        // rejoins the first block: the section's preamble, or its first subsection when the
        // heading is followed directly by one.
        const [headingLine = '', ...sectionBody] = section.lines;
        const subsections = splitAtHeadings(sectionBody, 3);

        for (const [index, subsection] of subsections.entries()) {
            const label = buildBreadcrumb([
                section.heading,
                subsection.heading,
            ]);
            const lines =
                index === 0
                    ? [headingLine, '', ...subsection.lines]
                    : subsection.lines;
            const text = lines.join('\n').trim();

            for (const piece of splitAtParagraphs(text, maxChars)) {
                pieces.push({ section: label, text: piece.trim() });
            }
        }
    }

    return pieces
        .filter((piece) => piece.text !== '')
        .map((piece, index) => ({
            id: `${document.path}#${String(index)}`,
            path: document.path,
            title: document.title,
            breadcrumb: buildBreadcrumb([
                document.area,
                document.title,
                piece.section,
            ]),
            section: piece.section,
            text: piece.text,
        }));
};

/**
 * What gets embedded for a passage: its place in the documentation and the page summary (when
 * the page has one) ahead of the passage itself, so the vector carries the context a lone
 * section would lose.
 */
export const toEmbeddingInput = (
    chunk: Pick<IDocChunk, 'breadcrumb' | 'text'>,
    summary?: string,
): string =>
    [chunk.breadcrumb, summary, chunk.text]
        .filter((part): part is string => part != null && part !== '')
        .join('\n\n');

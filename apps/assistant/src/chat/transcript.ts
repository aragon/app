import type { IChatMessage } from '@aragon/assistant-contracts';

interface ITranscriptEntry {
    role: 'user' | 'assistant';
    text: string;
}

// Flattens UI messages to plain text turns; non-text parts (data parts, step markers) are dropped.
export const toTranscript = (messages: IChatMessage[]): ITranscriptEntry[] =>
    messages
        .map((message) => ({
            role: message.role,
            text: message.parts
                .filter(
                    (part): part is { type: 'text'; text: string } =>
                        part.type === 'text' && typeof part.text === 'string',
                )
                .map((part) => part.text)
                .join('\n')
                .trim(),
        }))
        .filter((entry) => entry.text.length > 0);

const longestBacktickRun = (text: string): number =>
    text
        .match(/`+/g)
        ?.reduce((longest, run) => Math.max(longest, run.length), 0) ?? 0;

// Linear-ticket hygiene: verbatim chat text is embedded as a fenced code block (info string
// `text`, i.e. ```text) so it renders as inert data — no links, @-mentions, headings or
// collapsible markers — and any automation reading the ticket later sees an explicit data
// boundary instead of prompt-injectable prose. The fence is always longer than any backtick run
// inside, so the content cannot close it early.
export const fenceUserText = (text: string): string => {
    const fence = '`'.repeat(Math.max(3, longestBacktickRun(text) + 1));

    return `${fence}text\n${text}\n${fence}`;
};

// Linear-ticket hygiene for a user value rendered as inline code: line breaks are collapsed and the
// delimiter is longer than any backtick run inside, so the value cannot close the span early. A
// value that starts or ends with a backtick or a space is padded, which Markdown strips again.
export const codeUserText = (text: string): string => {
    const inline = text.replace(/\s*[\r\n]+\s*/g, ' ');
    const delimiter = '`'.repeat(longestBacktickRun(inline) + 1);
    const padding = /^[` ]|[` ]$/.test(inline) ? ' ' : '';

    return `${delimiter}${padding}${inline}${padding}${delimiter}`;
};

// Linear-ticket hygiene for a user value rendered inline, in a list row or as link text: line
// breaks are collapsed so it cannot start a block of its own, and the delimiters that open a
// link, mention, emphasis, code span, strikethrough, heading or HTML tag are escaped. A bare URL
// still autolinks, as anywhere in Markdown.
export const inlineUserText = (text: string): string =>
    text.replace(/\s*[\r\n]+\s*/g, ' ').replace(/[\\`*_[\]()<>~#]/g, '\\$&');

// Prompt-injection hygiene: every user-authored line in the Linear ticket body is rendered as a
// quoted block so it can never pose as instructions or structure outside the quote, and each line
// is escaped like an inline value, because Markdown still renders inside a quote. A lone `\r` ends
// a line in Markdown too, so it gets the quote prefix like `\n`.
export const quoteUserText = (text: string): string =>
    text
        .split(/\r\n|\r|\n/)
        .map((line) => `> ${inlineUserText(line)}`)
        .join('\n');

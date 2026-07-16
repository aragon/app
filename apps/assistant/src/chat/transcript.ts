import type { IChatMessage } from '@aragon/assistant-contracts';

export interface ITranscriptEntry {
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

// Prompt-injection hygiene: every user-authored line is rendered as a quoted block so it can never
// pose as instructions, headings or structure — in prompts and in the Linear ticket body alike.
export const quoteUserText = (text: string): string =>
    text
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n');

// Linear-ticket hygiene: verbatim chat text is embedded as a fenced block so it renders as inert
// data — no links, @-mentions, headings or collapsible markers — and any automation reading the
// ticket later sees an explicit data boundary instead of prompt-injectable prose. The fence is
// always longer than any backtick run inside, so the content cannot close it early.
export const fenceUserText = (text: string): string => {
    const longestBacktickRun =
        text
            .match(/`+/g)
            ?.reduce((longest, run) => Math.max(longest, run.length), 0) ?? 0;
    const fence = '`'.repeat(Math.max(3, longestBacktickRun + 1));

    return `${fence}text\n${text}\n${fence}`;
};

export const renderTranscript = (messages: IChatMessage[]): string =>
    toTranscript(messages)
        .map((entry) =>
            entry.role === 'user'
                ? `[user]:\n${quoteUserText(entry.text)}`
                : `[assistant]: ${entry.text}`,
        )
        .join('\n\n');

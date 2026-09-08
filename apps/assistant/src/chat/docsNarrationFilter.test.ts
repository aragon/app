import type { UIMessageChunk } from 'ai';
import {
    buildDocsNarrationFilter,
    narrationMaxChars,
} from './docsNarrationFilter';

const toolNames = new Set(['searchDocs', 'readDoc', 'listDocs']);

const runThrough = async (
    chunks: UIMessageChunk[],
): Promise<UIMessageChunk[]> => {
    const source = new ReadableStream<UIMessageChunk>({
        start: (controller) => {
            for (const chunk of chunks) {
                controller.enqueue(chunk);
            }
            controller.close();
        },
    });

    const output: UIMessageChunk[] = [];
    for await (const chunk of source.pipeThrough(
        buildDocsNarrationFilter({ toolNames }),
    )) {
        output.push(chunk);
    }

    return output;
};

const textPart = (id: string, text: string): UIMessageChunk[] => [
    { type: 'text-start', id },
    { type: 'text-delta', id, delta: text },
    { type: 'text-end', id },
];

const toolCall = (
    toolName: string,
    toolCallId = 'call-1',
): UIMessageChunk[] => [
    { type: 'tool-input-start', toolCallId, toolName },
    { type: 'tool-input-available', toolCallId, toolName, input: {} },
    { type: 'tool-output-available', toolCallId, output: {} },
];

const textOf = (chunks: UIMessageChunk[]): string[] =>
    chunks.flatMap((chunk) =>
        chunk.type === 'text-delta' ? [chunk.delta] : [],
    );

describe('buildDocsNarrationFilter', () => {
    it('drops the sentence written before a documentation tool call and keeps the answer', async () => {
        const output = await runThrough([
            { type: 'start' },
            { type: 'start-step' },
            ...textPart('t1', 'Let me look into the documentation for you.'),
            ...toolCall('searchDocs'),
            { type: 'finish-step' },
            { type: 'start-step' },
            ...textPart('t2', 'Let me read the full page.'),
            ...toolCall('readDoc', 'call-2'),
            { type: 'finish-step' },
            { type: 'start-step' },
            ...textPart('t3', 'Linking is display only.'),
            { type: 'finish-step' },
            { type: 'finish' },
        ]);

        expect(textOf(output)).toEqual(['Linking is display only.']);
        // The tool chunks and the lifecycle chunks all pass, in order.
        expect(output.map((chunk) => chunk.type)).toEqual([
            'start',
            'start-step',
            'tool-input-start',
            'tool-input-available',
            'tool-output-available',
            'finish-step',
            'start-step',
            'tool-input-start',
            'tool-input-available',
            'tool-output-available',
            'finish-step',
            'start-step',
            'text-start',
            'text-delta',
            'text-end',
            'finish-step',
            'finish',
        ]);
    });

    it('drops narration whose text part only closes after the documentation tool call', async () => {
        const output = await runThrough([
            { type: 'start' },
            { type: 'text-start', id: 't1' },
            {
                type: 'text-delta',
                id: 't1',
                delta: "I'll look this up in the documentation.",
            },
            ...toolCall('searchDocs'),
            { type: 'text-end', id: 't1' },
            { type: 'finish-step' },
            { type: 'start-step' },
            ...textPart('t2', 'The documentation does not state a gas cost.'),
            { type: 'finish' },
        ]);

        expect(textOf(output)).toEqual([
            'The documentation does not state a gas cost.',
        ]);
        expect(
            output.filter(
                (chunk) => chunk.type === 'text-end' && chunk.id === 't1',
            ),
        ).toHaveLength(0);
        expect(output.map((chunk) => chunk.type)).toContain('tool-input-start');
    });

    it('keeps the sentence written before a ticket draft: the prompt requires it', async () => {
        const output = await runThrough([
            { type: 'start' },
            ...textPart(
                't1',
                'The draft is below, add anything that comes to mind.',
            ),
            ...toolCall('createLinearTicket'),
            { type: 'finish' },
        ]);

        expect(textOf(output)).toEqual([
            'The draft is below, add anything that comes to mind.',
        ]);
    });

    it('streams a text part on as soon as it is longer than a sentence', async () => {
        const long = 'x'.repeat(narrationMaxChars + 1);
        const output = await runThrough([
            { type: 'start' },
            { type: 'text-start', id: 't1' },
            { type: 'text-delta', id: 't1', delta: long },
            { type: 'text-delta', id: 't1', delta: ' and more' },
            { type: 'text-end', id: 't1' },
            // A documentation tool call after a long text does not make it narration.
            ...toolCall('searchDocs'),
            { type: 'finish' },
        ]);

        expect(textOf(output)).toEqual([long, ' and more']);
    });

    it('releases a held text part when the stream ends or when something else interleaves', async () => {
        const trailing = await runThrough([
            { type: 'start' },
            ...textPart('t1', 'Short final answer.'),
        ]);
        expect(textOf(trailing)).toEqual(['Short final answer.']);

        const interleaved = await runThrough([
            { type: 'start' },
            { type: 'text-start', id: 't1' },
            { type: 'text-delta', id: 't1', delta: 'Half a ' },
            { type: 'reasoning-start', id: 'r1' },
            { type: 'text-delta', id: 't1', delta: 'sentence.' },
            { type: 'text-end', id: 't1' },
            ...toolCall('searchDocs'),
            { type: 'finish' },
        ]);
        expect(textOf(interleaved)).toEqual(['Half a ', 'sentence.']);
        expect(interleaved.map((chunk) => chunk.type)).toContain(
            'reasoning-start',
        );
    });
});

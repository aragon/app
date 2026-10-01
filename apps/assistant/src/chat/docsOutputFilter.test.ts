import { type UIMessageChunk, uiMessageChunkSchema } from 'ai';
import { buildDocsOutputFilter } from './docsOutputFilter';

const toolNames = new Set(['searchDocs', 'readDoc']);

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
        buildDocsOutputFilter({ toolNames }),
    )) {
        output.push(chunk);
    }

    return output;
};

const toolCall = (
    toolName: string,
    toolCallId: string,
    output: unknown,
): UIMessageChunk[] => [
    { type: 'tool-input-start', toolCallId, toolName },
    { type: 'tool-input-available', toolCallId, toolName, input: {} },
    { type: 'tool-output-available', toolCallId, output },
];

describe('buildDocsOutputFilter', () => {
    it('withholds the output of a documentation tool call and keeps every other chunk', async () => {
        const passages = { results: [{ path: 'governance/body.md' }] };
        const ticket = { identifier: 'SUP-1' };
        const output = await runThrough([
            { type: 'start' },
            ...toolCall('searchDocs', 'call-1', passages),
            ...toolCall('createLinearTicket', 'call-2', ticket),
            { type: 'text-start', id: 't1' },
            { type: 'text-delta', id: 't1', delta: 'Done.' },
            { type: 'text-end', id: 't1' },
            { type: 'finish' },
        ]);

        expect(output).toEqual([
            { type: 'start' },
            {
                type: 'tool-input-start',
                toolCallId: 'call-1',
                toolName: 'searchDocs',
            },
            {
                type: 'tool-input-available',
                toolCallId: 'call-1',
                toolName: 'searchDocs',
                input: {},
            },
            {
                type: 'tool-output-available',
                toolCallId: 'call-1',
                output: null,
            },
            {
                type: 'tool-input-start',
                toolCallId: 'call-2',
                toolName: 'createLinearTicket',
            },
            {
                type: 'tool-input-available',
                toolCallId: 'call-2',
                toolName: 'createLinearTicket',
                input: {},
            },
            {
                type: 'tool-output-available',
                toolCallId: 'call-2',
                output: ticket,
            },
            { type: 'text-start', id: 't1' },
            { type: 'text-delta', id: 't1', delta: 'Done.' },
            { type: 'text-end', id: 't1' },
            { type: 'finish' },
        ]);
    });

    it('recognizes a call announced by its input chunk alone', async () => {
        const output = await runThrough([
            {
                type: 'tool-input-available',
                toolCallId: 'call-1',
                toolName: 'readDoc',
                input: { path: 'governance/body.md' },
            },
            {
                type: 'tool-output-available',
                toolCallId: 'call-1',
                output: 'page',
            },
        ]);

        expect(output[1]).toEqual({
            type: 'tool-output-available',
            toolCallId: 'call-1',
            output: null,
        });
    });

    it('emits a withheld chunk the client accepts after the JSON round trip', async () => {
        const [chunk] = await runThrough([
            {
                type: 'tool-input-start',
                toolCallId: 'call-1',
                toolName: 'searchDocs',
            },
            {
                type: 'tool-output-available',
                toolCallId: 'call-1',
                output: 'x',
            },
        ]).then((output) => output.slice(1));

        // The widget validates every chunk it reads against the SDK schema; a key that
        // serializes away (an undefined output) fails it and ends the turn on an error.
        const validated = await uiMessageChunkSchema().validate?.(
            JSON.parse(JSON.stringify(chunk)),
        );

        expect(validated?.success).toBe(true);
    });
});

import type { UIMessageChunk } from 'ai';
import { observability } from '../lib/observability';
import { buildTimeoutErrorTransform } from './timeoutErrorStream';

// The wall-clock cap is a minute, so the signal is faked rather than waited on: what matters is
// which abort the transform treats as a failure, not how long it took to get there.
const buildSignal = (aborted: boolean): AbortSignal => {
    if (!aborted) {
        return new AbortController().signal;
    }

    const controller = new AbortController();
    controller.abort();

    return controller.signal;
};

const runThrough = async (
    chunks: UIMessageChunk[],
    transform: TransformStream<UIMessageChunk, UIMessageChunk>,
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
    for await (const chunk of source.pipeThrough(transform)) {
        output.push(chunk);
    }

    return output;
};

describe('buildTimeoutErrorTransform', () => {
    const sessionId = 'b3b8f8a2-6c9d-4c9e-8f6a-2d1e0c9b8a7f';

    let logErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        logErrorSpy = jest
            .spyOn(observability, 'logError')
            .mockImplementation(() => undefined);
    });

    afterEach(() => {
        logErrorSpy.mockRestore();
    });

    it('turns the silent abort of a timed-out call into a coded error the widget can show', async () => {
        const onTimeout = jest.fn();
        const output = await runThrough(
            [{ type: 'start' }, { type: 'abort' }],
            buildTimeoutErrorTransform({
                sessionId,
                timeoutSignal: buildSignal(true),
                onTimeout,
            }),
        );

        expect(output).toHaveLength(2);
        expect(output[0]).toEqual({ type: 'start' });
        // The abort is gone: replayed as-is, the widget renders an empty message and no error.
        expect(output[1]).toEqual({
            type: 'error',
            errorText: expect.stringContaining('"code":"timeout"'),
        });
        // The failure must not stay invisible — this is the whole point of the transform.
        expect(logErrorSpy).toHaveBeenCalledTimes(1);
        expect(onTimeout).toHaveBeenCalledTimes(1);
    });

    it('leaves a client-side stop alone: it aborts the stream too and is not a failure', async () => {
        const onTimeout = jest.fn();
        const output = await runThrough(
            [{ type: 'start' }, { type: 'abort' }],
            buildTimeoutErrorTransform({
                sessionId,
                timeoutSignal: buildSignal(false),
                onTimeout,
            }),
        );

        expect(output).toEqual([{ type: 'start' }, { type: 'abort' }]);
        expect(logErrorSpy).not.toHaveBeenCalled();
        expect(onTimeout).not.toHaveBeenCalled();
    });

    it('passes a normal stream through untouched', async () => {
        const chunks: UIMessageChunk[] = [
            { type: 'start' },
            { type: 'text-start', id: 'text-1' },
            { type: 'text-delta', id: 'text-1', delta: 'Hi.' },
            { type: 'text-end', id: 'text-1' },
            { type: 'finish' },
        ];

        const output = await runThrough(
            chunks,
            buildTimeoutErrorTransform({
                sessionId,
                timeoutSignal: buildSignal(true),
                onTimeout: jest.fn(),
            }),
        );

        expect(output).toEqual(chunks);
    });
});

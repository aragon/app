import {
    isModelContentChunk,
    streamFirstRespondingModel,
} from './modelFailover';

interface IChunk {
    type: string;
    model: string;
}

interface IFakeAttempt {
    model: string;
    /**
     * Pushes a chunk into this attempt's stream, standing in for the provider answering.
     */
    emit: (type: string) => void;
    cancelled: () => boolean;
    aborted: () => boolean;
}

// Each attempt is a stream the test feeds by hand: nothing arrives until the test says so, which
// is exactly the silence the deadline is there to catch.
const buildRunner = (params: { answerOn?: string } = {}) => {
    const { answerOn } = params;
    const attempts: IFakeAttempt[] = [];
    const failovers: Array<{ from: string; to: string }> = [];

    const run = (models: string[], signal?: AbortSignal) =>
        streamFirstRespondingModel<IChunk>({
            models,
            firstContentTimeoutMs: 10,
            signal: signal ?? new AbortController().signal,
            isContent: isModelContentChunk,
            onFailover: (failover) => failovers.push(failover),
            start: ({ model, abortSignal }) => {
                let cancelled = false;
                let emit = (_type: string) => {
                    // Replaced synchronously by the stream's start callback.
                };

                const stream = new ReadableStream<IChunk>({
                    start: (controller) => {
                        emit = (type) => controller.enqueue({ type, model });
                        // Every attempt opens with the lifecycle chunk the SDK emits before the
                        // provider has said anything — it must not count as an answer.
                        emit('start-step');

                        if (model === answerOn) {
                            emit('text-start');
                        }
                    },
                    cancel: () => {
                        cancelled = true;
                    },
                });

                attempts.push({
                    model,
                    emit: (type) => emit(type),
                    cancelled: () => cancelled,
                    aborted: () => abortSignal.aborted,
                });

                return stream;
            },
        });

    return { run, attempts, failovers };
};

describe('modelFailover', () => {
    describe('streamFirstRespondingModel', () => {
        it('keeps the model that answers and never opens a second attempt', async () => {
            const { run, attempts, failovers } = buildRunner({
                answerOn: 'primary',
            });

            await run(['primary', 'fallback']);

            expect(attempts).toHaveLength(1);
            expect(failovers).toHaveLength(0);
            expect(attempts[0].aborted()).toEqual(false);
        });

        it('replays the chunks read while waiting, so the turn arrives whole', async () => {
            const { run, attempts } = buildRunner({ answerOn: 'primary' });

            const stream = await run(['primary', 'fallback']);
            attempts[0].emit('text-delta');
            attempts[0].emit('finish');
            const chunks = await readAllOnce(stream);

            // The lifecycle chunk consumed while deciding is not swallowed.
            expect(chunks.map(({ type }) => type)).toEqual([
                'start-step',
                'text-start',
                'text-delta',
                'finish',
            ]);
        });

        it('moves the turn to the next model when the first one stays silent', async () => {
            const { run, attempts, failovers } = buildRunner({
                answerOn: 'fallback',
            });

            const stream = await run(['primary', 'fallback']);
            const chunks = await readAllOnce(stream);

            expect(failovers).toEqual([{ from: 'primary', to: 'fallback' }]);
            expect(chunks.every(({ model }) => model === 'fallback')).toEqual(
                true,
            );
            // The stalled attempt is cancelled and aborted, so it cannot keep running.
            expect(attempts[0].aborted()).toEqual(true);
            expect(attempts[0].cancelled()).toEqual(true);
        });

        it('never abandons the last model: there is nothing left to move to', async () => {
            const { run, attempts, failovers } = buildRunner();

            await run(['only']);

            expect(attempts).toHaveLength(1);
            expect(failovers).toHaveLength(0);
            expect(attempts[0].aborted()).toEqual(false);
        });

        it('stops failing over once the overall cap has fired', async () => {
            const { run, attempts, failovers } = buildRunner();
            const controller = new AbortController();
            controller.abort();

            await run(['primary', 'fallback'], controller.signal);

            // The turn is over either way; a second model can no longer help, and the caller's
            // timeout handling is what reports it.
            expect(attempts).toHaveLength(1);
            expect(failovers).toHaveLength(0);
        });
    });

    describe('isModelContentChunk', () => {
        it.each([
            'text-start',
            'text-delta',
            'tool-input-start',
            'tool-input-available',
            'error',
        ])('counts %s as the provider having answered', (type) => {
            expect(isModelContentChunk({ type })).toEqual(true);
        });

        // The lifecycle chunks the SDK emits before the provider replies. Counting any of them
        // would make the stall deadline unreachable and bring the silent hang back.
        it.each(['start', 'start-step', 'finish-step'])(
            'does not count the lifecycle chunk %s',
            (type) => {
                expect(isModelContentChunk({ type })).toEqual(false);
            },
        );
    });
});

// The fake attempts never close their stream, so reading is bounded by what has been enqueued.
const readAllOnce = async (
    stream: ReadableStream<IChunk>,
): Promise<IChunk[]> => {
    const reader = stream.getReader();
    const chunks: IChunk[] = [];

    for (;;) {
        const next = await Promise.race([
            reader.read(),
            new Promise<'idle'>((resolve) => setTimeout(() => resolve('idle'))),
        ]);

        if (next === 'idle' || next.done) {
            break;
        }

        chunks.push(next.value);
    }

    await reader.cancel();

    return chunks;
};

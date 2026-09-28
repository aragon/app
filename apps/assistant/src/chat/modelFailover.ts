// Chunks that can only follow an actual response body. The lifecycle chunks the SDK emits before
// the provider has answered ('start', 'start-step') are deliberately absent: counting those as
// content would make the stall deadline below unreachable, which is the whole failure this module
// exists to catch. An 'error' counts — the attempt did produce a verdict, and a failed call is
// the Gateway's own job to fail over.
const contentChunkTypes = new Set([
    'text-start',
    'text-delta',
    'reasoning-start',
    'reasoning-delta',
    'tool-input-start',
    'tool-input-delta',
    'tool-input-available',
    'tool-input-error',
    'tool-output-available',
    'tool-output-error',
    'tool-approval-request',
    'source-url',
    'source-document',
    'file',
    'data',
    'error',
]);

/**
 * Whether a UI message chunk means the provider has started answering. Typed on the tag alone:
 * the SDK's chunk union is generic over the message type and does not narrow across tool maps.
 */
export const isModelContentChunk = (chunk: { type: string }): boolean =>
    contentChunkTypes.has(chunk.type);

export interface IModelAttempt {
    /**
     * Gateway id of the model this attempt runs on.
     */
    model: string;
    /**
     * Cancels this attempt — either the overall wall-clock cap or the stall deadline firing.
     */
    abortSignal: AbortSignal;
    /**
     * Models still left after this one, to hand the Gateway as its own error fallbacks.
     */
    remainingModels: string[];
}

export interface IStreamFirstRespondingModelParams<TChunk> {
    /**
     * Models to try, best first. The last one is never abandoned: there is nothing left to move
     * to, so the overall cap owns it.
     */
    models: string[];
    /**
     * How long a model may stay silent before the turn moves to the next one.
     */
    firstContentTimeoutMs: number;
    /**
     * The turn's overall wall-clock cap. Once it fires, the current attempt is returned as-is.
     */
    signal: AbortSignal;
    /**
     * Opens one attempt's chunk stream. Nothing is pulled from it until this function returns.
     */
    start: (attempt: IModelAttempt) => ReadableStream<TChunk>;
    /**
     * Whether a chunk means the provider answered (see `isModelContentChunk`).
     */
    isContent: (chunk: TChunk) => boolean;
    /**
     * Reports a move to the next model, for the step log.
     */
    onFailover: (params: { from: string; to: string }) => void;
}

/**
 * Runs a turn on the first model that actually starts answering.
 *
 * The AI Gateway already fails a call over to the next model when the upstream *errors*. It
 * cannot do anything about the failure mode we actually see: the provider accepts the call and
 * then goes quiet. Nothing errors, so nothing fails over — the turn just hangs until the wall
 * clock cap kills it (measured on the preview: the same prompt on the same provider answering in
 * 1.0s, 1.7s and 2.3s, then once in 47.8s, then once not at all).
 *
 * So the stall is turned into a failover here: the attempt's stream is read until it produces
 * content, and a model that produces none within `firstContentTimeoutMs` is abandoned for the
 * next one. Nothing has reached the user at that point — the deadline is defined by the absence
 * of content — so the swap is invisible, and no tool can have run, which is what keeps a retry
 * from duplicating a ticket. The chunks read while waiting are put back in front of the returned
 * stream, so the caller sees the turn whole.
 */
export const streamFirstRespondingModel = async <TChunk>(
    params: IStreamFirstRespondingModelParams<TChunk>,
): Promise<ReadableStream<TChunk>> => {
    const {
        models,
        firstContentTimeoutMs,
        signal,
        start,
        isContent,
        onFailover,
    } = params;

    for (const [index, model] of models.entries()) {
        const nextModel = models[index + 1];
        const attemptController = new AbortController();

        const stream = start({
            model,
            abortSignal: AbortSignal.any([signal, attemptController.signal]),
            remainingModels: models.slice(index + 1),
        });
        const reader = stream.getReader();
        const buffered: TChunk[] = [];

        // Nothing left to move to: hand the attempt back and let the overall cap decide.
        if (nextModel == null) {
            return restoreStream(reader, buffered);
        }

        const answered = await readUntilContent({
            reader,
            buffered,
            isContent,
            firstContentTimeoutMs,
            signal,
        });

        if (answered) {
            return restoreStream(reader, buffered);
        }

        onFailover({ from: model, to: nextModel });
        attemptController.abort(
            new Error(
                `Model ${model} produced nothing within ${firstContentTimeoutMs}ms.`,
            ),
        );
        // Nobody will read this attempt again; cancelling releases it and keeps its abort from
        // surfacing as an unhandled rejection.
        void reader.cancel().catch(() => undefined);
    }

    // The loop always returns on its last entry, so this only guards an empty model list.
    throw new Error('streamFirstRespondingModel: no models configured.');
};

// Reads the attempt until it produces content. Resolves true when it did — or when waiting any
// longer cannot help: the stream ended, or the turn's overall cap fired and a different model
// would be just as dead. Everything read on the way is kept in `buffered` so the caller can put
// it back in front of the stream.
const readUntilContent = async <TChunk>(params: {
    reader: ReadableStreamDefaultReader<TChunk>;
    buffered: TChunk[];
    isContent: (chunk: TChunk) => boolean;
    firstContentTimeoutMs: number;
    signal: AbortSignal;
}): Promise<boolean> => {
    const { reader, buffered, isContent, firstContentTimeoutMs, signal } =
        params;

    const deadline = buildDeadline(firstContentTimeoutMs, signal);

    try {
        for (;;) {
            const next = await Promise.race([reader.read(), deadline.reached]);

            if (next === stalled) {
                return signal.aborted;
            }

            if (next.done) {
                return true;
            }

            buffered.push(next.value);

            if (isContent(next.value)) {
                return true;
            }
        }
    } finally {
        deadline.clear();
    }
};

// Sentinel for "the model said nothing in time", distinct from any read result.
const stalled = Symbol('stalled');

const buildDeadline = (timeoutMs: number, signal: AbortSignal) => {
    let clear = () => {
        // Replaced synchronously by the promise executor below.
    };

    const reached = new Promise<typeof stalled>((resolve) => {
        const settle = () => {
            clearTimeout(timer);
            signal.removeEventListener('abort', settle);
            resolve(stalled);
        };

        const timer = setTimeout(settle, timeoutMs);
        signal.addEventListener('abort', settle, { once: true });
        clear = () => {
            clearTimeout(timer);
            signal.removeEventListener('abort', settle);
        };
    });

    return { reached, clear };
};

// Puts the chunks read while waiting back in front of the rest of the attempt.
const restoreStream = <TChunk>(
    reader: ReadableStreamDefaultReader<TChunk>,
    buffered: TChunk[],
): ReadableStream<TChunk> =>
    new ReadableStream<TChunk>({
        start: (controller) => {
            for (const chunk of buffered) {
                controller.enqueue(chunk);
            }
            buffered.length = 0;
        },
        pull: async (controller) => {
            const { done, value } = await reader.read();

            if (done) {
                controller.close();

                return;
            }

            controller.enqueue(value);
        },
        cancel: (reason) => reader.cancel(reason),
    });

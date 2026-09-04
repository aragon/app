import type { IAssistantError } from '@aragon/assistant-contracts';
import type { UIMessageChunk } from 'ai';
import { observability } from '../lib/observability';

export interface ITimeoutErrorTransformParams {
    /**
     * Session the stream belongs to; tags the reported error.
     */
    sessionId: string;
    /**
     * The signal that caps the model call. Only this signal firing turns an abort into a failure —
     * the composer's Stop ends the stream the same way and is not an error.
     */
    timeoutSignal: AbortSignal;
    /**
     * Ran once when the cap fired, before the error chunk is emitted: the route refunds the turn
     * here, the same way it does for a stream that failed outright.
     */
    onTimeout: () => void;
}

/**
 * Rewrites the `abort` chunk a timed-out model call ends on into the error chunk the widget
 * renders, and reports the timeout.
 *
 * A model call cancelled by the service's own wall-clock cap does not fail the stream: the AI SDK
 * ends it with an `abort` chunk, which the widget shows as nothing at all. The assistant message
 * stays empty, no error surfaces and nothing reaches Sentry — observed on a preview, where a
 * stalled upstream left the panel silent for a minute and then idle, with no reply and no trace of
 * the failure anywhere.
 */
export const buildTimeoutErrorTransform = (
    params: ITimeoutErrorTransformParams,
): TransformStream<UIMessageChunk, UIMessageChunk> => {
    const { sessionId, timeoutSignal, onTimeout } = params;

    return new TransformStream({
        transform: (chunk, controller) => {
            if (chunk.type !== 'abort' || !timeoutSignal.aborted) {
                controller.enqueue(chunk);

                return;
            }

            const error = new Error('The chat model call exceeded its cap.');
            error.name = 'ChatModelTimeoutError';
            observability.logError(error, { sessionId, step: 'respond' });
            onTimeout();

            const payload: IAssistantError = {
                error: {
                    code: 'timeout',
                    message: 'The assistant took too long to answer.',
                },
            };

            controller.enqueue({
                type: 'error',
                errorText: JSON.stringify(payload),
            });
        },
    });
};

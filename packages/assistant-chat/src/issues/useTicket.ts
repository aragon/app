import {
    assistantErrorSchema,
    createIssueResponseSchema,
    type IAssistantErrorCode,
    type ICreateIssueRequest,
    type ICreateIssueResponse,
    type IPreviewIssueRequest,
    type ISupportIntent,
    previewIssueResponseSchema,
} from '@aragon/assistant-contracts';
import { useMutation } from '@tanstack/react-query';
import { useRef } from 'react';
import type { z } from 'zod';
import type { IChatMonitoring } from '../monitoring';

/**
 * Lifecycle of the session's ticket, driven by two explicit user actions:
 * - `idle`: nothing prepared yet (or the preview was reset by a newer message);
 * - `previewing` / `previewed` / `unclear`: preparing the preview and its two outcomes;
 * - `creating` / `created`: sending the reviewed ticket;
 * - `error`: the creation failed — retrying reuses the same session.
 * A failed preview falls back to `idle` with `previewError` set.
 */
export type TicketStatus =
    | 'idle'
    | 'previewing'
    | 'previewed'
    | 'unclear'
    | 'creating'
    | 'created'
    | 'error';

export interface ITicketError {
    /**
     * Error code returned by the assistant service, when available.
     */
    code?: IAssistantErrorCode;
    /**
     * Human-readable error message.
     */
    message: string;
}

export interface ITicketPreview {
    /**
     * Summary distilled from the conversation; becomes the ticket title.
     */
    summary: string;
    /**
     * Classified intent of the request; drives the ticket label.
     */
    intent: ISupportIntent;
}

export interface IUseTicketParams {
    /**
     * Base URL of the assistant service.
     */
    assistantUrl: string;
    /**
     * Monitoring implementation injected by the host app.
     */
    monitoring: IChatMonitoring;
}

export interface IUseTicketResult {
    /**
     * Current state of the ticket lifecycle.
     */
    status: TicketStatus;
    /**
     * The reviewed preview, set while `previewed` (and kept through creation).
     */
    preview?: ITicketPreview;
    /**
     * Error of the last preview attempt; preparing again retries.
     */
    previewError?: ITicketError;
    /**
     * The created issue, set on success.
     */
    issue?: ICreateIssueResponse;
    /**
     * Error of the last creation attempt.
     */
    createError?: ITicketError;
    /**
     * Prepares the ticket preview from the given transcript.
     */
    prepare: (request: IPreviewIssueRequest) => void;
    /**
     * Creates the issue the preview showed; also used to retry after a failure.
     */
    send: (request: ICreateIssueRequest) => void;
    /**
     * Resets the lifecycle: a newer message makes the preview stale, a new session starts over.
     */
    reset: () => void;
}

// Carries the service's error shape through the mutations so the UI can branch on the code.
class TicketRequestError extends Error {
    readonly info: ITicketError;

    constructor(info: ITicketError) {
        super(info.message);
        this.info = info;
    }
}

const fallbackError: ITicketError = {
    message: 'The request could not be processed.',
};

// The single wire helper of the ticket flow: POST, validate the happy shape, translate non-2xx
// bodies into the shared error shape.
const postJson = async <TResult>(
    url: string,
    request: unknown,
    schema: z.ZodType<TResult>,
): Promise<TResult> => {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        const body = await response.json().catch(() => null);
        const parsed = assistantErrorSchema.safeParse(body);
        throw new TicketRequestError(
            parsed.success
                ? {
                      code: parsed.data.error.code,
                      message: parsed.data.error.message,
                  }
                : fallbackError,
        );
    }

    return schema.parse(await response.json());
};

const toTicketError = (error: unknown): ITicketError | undefined => {
    if (error == null) {
        return undefined;
    }

    return error instanceof TicketRequestError ? error.info : fallbackError;
};

export const useTicket = (params: IUseTicketParams): IUseTicketResult => {
    const { assistantUrl, monitoring } = params;

    // Synchronous double-invoke guard shared by both actions: the isPending render snapshot
    // updates only on the next render, so two clicks in the same tick would both pass a
    // state-only gate.
    const inFlightRef = useRef(false);

    // The refusal is reported with the error code only — never with user content.
    const buildMutationOptions = (action: string) => ({
        // The default 'online' mode would silently pause the mutation while the browser is
        // offline (and auto-fire it on reconnect) instead of surfacing the error.
        networkMode: 'always' as const,
        onSettled: () => {
            inFlightRef.current = false;
        },
        onError: (error: Error) => {
            if (error instanceof TicketRequestError) {
                monitoring.logMessage(`assistantChat: ${action} failed`, {
                    level: 'warning',
                    context: { code: error.info.code },
                });
            } else {
                monitoring.logError(error, {
                    context: { step: `assistantChat.${action}` },
                });
            }
        },
    });

    // reset() does not cancel an in-flight react-query mutation — its result still lands. The
    // generation stamp lets a reset invalidate whatever is still flying: a preview requested
    // before the reset (e.g. the user sent another message meanwhile) is ignored on arrival.
    const generationRef = useRef(0);

    const previewMutation = useMutation({
        mutationFn: (variables: {
            request: IPreviewIssueRequest;
            generation: number;
        }) =>
            postJson(
                `${assistantUrl}/issues/preview`,
                variables.request,
                previewIssueResponseSchema,
            ),
        ...buildMutationOptions('previewIssue'),
    });

    const isPreviewCurrent =
        previewMutation.variables?.generation === generationRef.current;

    const createMutation = useMutation({
        mutationFn: (request: ICreateIssueRequest) =>
            postJson(
                `${assistantUrl}/issues`,
                request,
                createIssueResponseSchema,
            ),
        ...buildMutationOptions('createIssue'),
    });

    const runExclusive = (action: () => void) => {
        if (
            inFlightRef.current ||
            previewMutation.isPending ||
            createMutation.isPending ||
            createMutation.isSuccess
        ) {
            return;
        }

        inFlightRef.current = true;
        action();
    };

    const preview =
        isPreviewCurrent && previewMutation.data?.status === 'ready'
            ? previewMutation.data
            : undefined;

    // Creation outranks preview: once the user sent the ticket, the preview sub-state is history.
    const deriveStatus = (): TicketStatus => {
        if (createMutation.isPending) {
            return 'creating';
        }
        if (createMutation.isSuccess) {
            return 'created';
        }
        if (createMutation.isError) {
            return 'error';
        }
        if (!isPreviewCurrent) {
            return 'idle';
        }
        if (previewMutation.isPending) {
            return 'previewing';
        }
        if (previewMutation.data?.status === 'ready') {
            return 'previewed';
        }
        if (previewMutation.data?.status === 'unclear') {
            return 'unclear';
        }

        return 'idle';
    };

    return {
        status: deriveStatus(),
        preview,
        previewError: isPreviewCurrent
            ? toTicketError(previewMutation.error)
            : undefined,
        issue: createMutation.data,
        createError: toTicketError(createMutation.error),
        prepare: (request) =>
            runExclusive(() =>
                previewMutation.mutate({
                    request,
                    generation: generationRef.current,
                }),
            ),
        send: (request) => {
            // Sending requires a reviewed preview; the server enforces the same rule.
            if (preview != null) {
                runExclusive(() => createMutation.mutate(request));
            }
        },
        reset: () => {
            generationRef.current += 1;
            previewMutation.reset();
            createMutation.reset();
        },
    };
};

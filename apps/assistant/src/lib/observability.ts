import * as Sentry from '@sentry/hono/node';

export type IAssistantStep =
    | 'respond'
    | 'createTicket'
    | 'confirmFile'
    | 'removeFile'
    | 'transferFiles'
    | 'cleanupBlobs'
    | 'rateLimit';

export type IRefusalReason =
    | 'off_topic'
    | 'turn_limit'
    | 'token_budget'
    | 'rate_limited'
    | 'session_limit';

// PII rule enforced structurally: no free-text fields — message content and email addresses can
// never end up in logs, only ids, counters and codes.
export interface IStepLogEntry {
    sessionId: string;
    step: IAssistantStep;
    model?: string;
    latencyMs: number;
    tokensIn?: number;
    tokensOut?: number;
    refusalReason?: IRefusalReason;
    issueId?: string;
    // Ticket intent (feedback/bug/support) on a createTicket event — a category, never content.
    intent?: string;
    // Model stop reason ('stop', 'length', 'tool-calls', …): a 'length' means the reply or the
    // tool arguments were truncated before completing.
    finishReason?: string;
    // Error name/code only, never a message that could carry user content.
    error?: string;
}

export interface IErrorLogContext {
    sessionId?: string;
    step?: IAssistantStep;
}

// Error class names along the cause chain (never messages): distinguishes schema failures
// (ZodError) from parse/truncation failures (JSONParseError) without logging content.
const collectCauseNames = (error: unknown): string[] => {
    const names: string[] = [];
    let cursor = (error as { cause?: unknown } | null)?.cause;

    while (names.length < 4 && cursor != null && typeof cursor === 'object') {
        names.push((cursor as Error).name ?? 'UnknownError');
        cursor = (cursor as { cause?: unknown }).cause;
    }

    return names;
};

class Observability {
    // Keep both transports: Sentry Logs provides cross-signal correlation, while stdout remains
    // available during provider incidents and in Vercel's live logs.
    logStep = (entry: IStepLogEntry) => {
        Sentry.logger.info('assistant.step', { ...entry });
        // biome-ignore lint/suspicious/noConsole: stdout JSON is the log transport (Vercel Logs)
        console.log(JSON.stringify({ level: 'info', type: 'step', ...entry }));
    };

    logError = (error: unknown, context: IErrorLogContext = {}) => {
        // The session id doubles as an indexed tag: Sentry issue search only covers tags, so
        // `sessionId:<uuid>` queries can trace a ticket through the error events.
        Sentry.captureException(error, {
            tags:
                context.sessionId != null
                    ? { sessionId: context.sessionId }
                    : undefined,
            extra: { ...context },
        });
        // biome-ignore lint/suspicious/noConsole: stderr JSON is the log transport (Vercel Logs)
        console.error(
            JSON.stringify({
                level: 'error',
                type: 'error',
                error: error instanceof Error ? error.name : 'UnknownError',
                causes: collectCauseNames(error),
                ...context,
            }),
        );
    };
}

export const observability = new Observability();

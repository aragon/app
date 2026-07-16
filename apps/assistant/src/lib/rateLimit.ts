import type { IAssistantError } from '@aragon/assistant-contracts';
import { Ratelimit } from '@upstash/ratelimit';
import type { Context } from 'hono';
import type { MiddlewareHandler } from 'hono/types';
import { z } from 'zod';
import { type IAppDependencies, lazy } from './appDependencies';
import { getConfig } from './config';
import { observability } from './observability';

// First x-forwarded-for hop is the client on Vercel; 'unknown' groups direct local requests.
export const getClientIp = (context: Context): string => {
    const forwardedFor = context.req.header('x-forwarded-for');
    const firstHop = forwardedFor?.split(',')[0]?.trim();

    return firstHop || context.req.header('x-real-ip') || 'unknown';
};

// The two limiters refuse with distinct codes: 'rate_limited' is the per-minute burst limit
// (retrying in a moment helps), 'session_limit' is the daily budget of new sessions (it does
// not — the client points at the support portal instead).
const refusalByCode = {
    rate_limited: 'Too many requests, please retry later.',
    session_limit: 'The daily limit of new support chats is reached.',
} as const;

// Logs the refusal and answers with the shared 429 shape of both limiters; resetAtMs is the
// window reset returned by @upstash/ratelimit and drives the Retry-After header.
export const refuseRateLimited = (
    context: Context,
    sessionId: string,
    resetAtMs: number,
    code: keyof typeof refusalByCode = 'rate_limited',
) => {
    observability.logStep({
        sessionId,
        step: 'rateLimit',
        latencyMs: 0,
        refusalReason: code,
    });

    const body: IAssistantError = {
        error: { code, message: refusalByCode[code] },
    };
    const retryAfterSeconds = Math.max(
        1,
        Math.ceil((resetAtMs - Date.now()) / 1000),
    );
    context.header('Retry-After', String(retryAfterSeconds));

    return context.json(body, 429);
};

// Per-IP daily budget of NEW sessions; the chat route consumes one unit on a session's first
// turn. Lives here so the whole rate-limit policy stays in one module.
export const buildNewSessionLimiter = (deps: IAppDependencies) =>
    lazy(
        () =>
            new Ratelimit({
                redis: deps.getRedis(),
                limiter: Ratelimit.fixedWindow(
                    getConfig().rateLimit.sessionsPerDay,
                    '1 d',
                ),
                prefix: 'assistant:rl:sessions',
            }),
    );

const sessionIdPeekSchema = z.object({ sessionId: z.uuid() });

// Best-effort sessionId lookup so a refusal stays traceable per session: the middleware runs
// before route validation, so the body is peeked directly (Hono memoizes body reads — the route
// handler can still parse it). Requests without a top-level sessionId (e.g. /files/token, GET
// requests, malformed JSON) fall back to 'unknown'.
const peekSessionId = async (context: Context): Promise<string> => {
    const body: unknown = await context.req.json().catch(() => null);
    const parsed = sessionIdPeekSchema.safeParse(body);

    return parsed.success ? parsed.data.sessionId : 'unknown';
};

// Per-IP requests-per-minute limit (@upstash/ratelimit, atomic Lua on Upstash). Lazy for the
// same reason as the app dependencies: construction must not require secrets, and /health keeps
// serving on secret-less cold starts.
export const buildRateLimitMiddleware = (
    deps: IAppDependencies,
): MiddlewareHandler => {
    const getLimiter = lazy(
        () =>
            new Ratelimit({
                redis: deps.getRedis(),
                limiter: Ratelimit.slidingWindow(
                    getConfig().rateLimit.requestsPerMinute,
                    '1 m',
                ),
                prefix: 'assistant:rl:requests',
            }),
    );

    return async (context, next) => {
        const { success, reset } = await getLimiter().limit(
            getClientIp(context),
        );

        if (!success) {
            return refuseRateLimited(
                context,
                await peekSessionId(context),
                reset,
            );
        }

        await next();
    };
};

import { assistantLimits } from '@aragon/assistant-contracts';
import { Hono } from 'hono';
import { createMockChatModel } from '../test/mockModel';
import {
    createTestDependencies,
    type ITestDependencies,
} from '../test/testDependencies';
import { buildChatRoute } from './chat';

const sessionId = 'b3b8f8a2-6c9d-4c9e-8f6a-2d1e0c9b8a7f';
const otherSessionId = 'a1a1a1a1-2b2b-4c3c-8d4d-5e5e5e5e5e5e';

const buildRequestBody = (session = sessionId) => ({
    sessionId: session,
    messages: [
        {
            id: 'message-1',
            role: 'user',
            parts: [{ type: 'text', text: 'The vote button crashes.' }],
        },
    ],
    appContext: { route: '/dao', appVersion: '1.33.2' },
});

const buildApp = (deps: ITestDependencies) =>
    new Hono().route('/chat', buildChatRoute(deps));

const postChat = (app: Hono, session = sessionId) =>
    app.request('/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(buildRequestBody(session)),
    });

// Guardrail tests: sessions over their hard limits must never reach the model — a regression
// here silently turns abuse into unbounded model spend.
describe('POST /chat guardrails', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        process.env = { ...originalEnv };
        delete process.env.ASSISTANT_RATE_LIMIT_SESSIONS_PER_DAY;
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it('caps new sessions per IP per day and keeps refused sessions refused on retry', async () => {
        process.env.ASSISTANT_RATE_LIMIT_SESSIONS_PER_DAY = '1';
        const model = createMockChatModel({
            objects: [{ intent: 'bug' }],
        });
        const deps = createTestDependencies(model);
        const app = buildApp(deps);

        // The first session consumes the whole daily budget. Draining the stream keeps its
        // onFinish work inside the test.
        const first = await postChat(app);
        expect(first.status).toEqual(200);
        await first.text();

        const second = await postChat(app, otherSessionId);
        expect(second.status).toEqual(429);
        expect(second.headers.get('Retry-After')).not.toBeNull();
        // The daily budget refuses with its own code: its message ("come back tomorrow")
        // must never be the burst-limit "wait a moment".
        const secondBody = (await second.json()) as {
            error: { code: string };
        };
        expect(secondBody.error.code).toEqual('session_limit');

        // The refused session must stay refused when its id is resent: a refused session never
        // counted a turn, so the retry re-enters the new-session gate.
        const retried = await postChat(app, otherSessionId);
        expect(retried.status).toEqual(429);
    });

    it('returns the fixed turn-limit message without any model call', async () => {
        const model = createMockChatModel({});
        const deps = createTestDependencies(model);

        for (
            let turn = 0;
            turn < assistantLimits.maxTurnsPerSession;
            turn += 1
        ) {
            await deps.sessionStore.incrementTurns(sessionId);
        }

        const response = await postChat(buildApp(deps));
        const body = await response.text();

        expect(response.status).toEqual(200);
        expect(body).toContain('reached its length limit');
        expect(model.doGenerateCalls).toHaveLength(0);
        expect(model.doStreamCalls).toHaveLength(0);
    });

    it('returns the fixed token-budget message without any model call', async () => {
        const model = createMockChatModel({});
        const deps = createTestDependencies(model);
        await deps.sessionStore.addTokens(
            sessionId,
            assistantLimits.maxTokensPerSession,
        );

        const response = await postChat(buildApp(deps));
        const body = await response.text();

        expect(body).toContain('reached its size limit');
        expect(model.doGenerateCalls).toHaveLength(0);
        expect(model.doStreamCalls).toHaveLength(0);
    });

    it('maps an upstream rate limit to a coded stream error and refunds the turn', async () => {
        const model = createMockChatModel({
            objects: [{ intent: 'bug' }],
            streamError: Object.assign(new Error('too many requests'), {
                statusCode: 429,
            }),
        });
        const deps = createTestDependencies(model);

        const response = await postChat(buildApp(deps));
        const body = await response.text();
        // Let the fire-and-forget turn refund settle.
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(response.status).toEqual(200);
        expect(body).toContain('upstream_rate_limited');
        // The failed turn is refunded so a retry does not burn the budget twice.
        expect(await deps.sessionStore.getTurns(sessionId)).toEqual(0);
    });

    it('runs a single structured call per turn and streams no ticket state', async () => {
        const model = createMockChatModel({ objects: [{ intent: 'bug' }] });
        const deps = createTestDependencies(model);

        const response = await postChat(buildApp(deps));
        const body = await response.text();

        expect(response.status).toEqual(200);
        // A turn is classify (guardrail) + respond only: extraction happens exclusively behind
        // the explicit preview action, so a flaky extraction can never break the conversation.
        expect(model.doGenerateCalls).toHaveLength(1);
        expect(body).not.toContain('data-collectedFields');
    });

    it('counts classify and respond usage against the session token budget', async () => {
        const model = createMockChatModel({ objects: [{ intent: 'bug' }] });
        const deps = createTestDependencies(model);

        const response = await postChat(buildApp(deps));
        await response.text();

        expect(response.status).toEqual(200);
        // The mock reports 15 tokens per call (10 in + 5 out); a turn is classify + respond —
        // a regression back to respond-only counting would report 15 here.
        expect(await deps.sessionStore.getTokens(sessionId)).toEqual(30);
    });
});

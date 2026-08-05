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
        const deps = createTestDependencies(createMockChatModel({}));
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
        // A plain refused turn has no approved tool calls to resolve.
        expect(body).not.toContain('tool-output-error');
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
        expect(model.doStreamCalls).toHaveLength(0);
    });

    it('maps an upstream rate limit to a coded stream error and refunds the turn', async () => {
        const model = createMockChatModel({
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

    it('counts the agent stream usage once against the session token budget', async () => {
        const deps = createTestDependencies(createMockChatModel({}));

        const response = await postChat(buildApp(deps));
        await response.text();

        expect(response.status).toEqual(200);
        // The mock reports 15 tokens (10 in + 5 out) for the single agent call.
        expect(await deps.sessionStore.getTokens(sessionId)).toEqual(15);
    });

    it('resolves a dangling approval request as superseded instead of failing the model call', async () => {
        const model = createMockChatModel({});
        const deps = createTestDependencies(model);
        const app = buildApp(deps);

        // The user kept typing while a draft awaited approval: the history carries a tool part
        // stuck in `approval-requested`, which converts to a tool call without a response.
        const body = buildRequestBody();
        body.messages = [
            ...body.messages,
            {
                id: 'message-2',
                role: 'assistant',
                parts: [
                    {
                        type: 'tool-createLinearTicket',
                        toolCallId: 'tc-1',
                        state: 'approval-requested',
                        input: {
                            intent: 'bug',
                            title: 'Voting transaction reverts',
                            description:
                                'Submitting a vote reverts with an unknown error.',
                        },
                        approval: { id: 'ap-1' },
                    },
                ],
            } as never,
            {
                id: 'message-3',
                role: 'user',
                parts: [{ type: 'text', text: 'It only happens in Safari.' }],
            },
        ];

        const response = await app.request('/chat', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(body),
        });
        const streamed = await response.text();

        expect(response.status).toEqual(200);
        // The turn streams a normal reply (no error part), and the model saw the draft as a
        // denied tool call it can re-draft from.
        expect(streamed).not.toContain('"type":"error"');
        expect(JSON.stringify(model.doStreamCalls)).toContain(
            'execution-denied',
        );
    });

    it('drops tool parts a Stop left in input-streaming or input-available instead of bricking the session', async () => {
        const model = createMockChatModel({});
        const deps = createTestDependencies(model);
        const app = buildApp(deps);

        // The composer's Stop can abort a draft mid-stream; the client keeps the tool part
        // as-is (cancelPendingToolCallsOnSend is false), so the history replays it in an
        // incomplete state — converted naively it becomes a tool call without a response and
        // every following turn of the session fails.
        const body = buildRequestBody();
        body.messages = [
            ...body.messages,
            {
                id: 'message-2',
                role: 'assistant',
                parts: [
                    { type: 'text', text: 'Let me draft that for you.' },
                    {
                        type: 'tool-createLinearTicket',
                        toolCallId: 'tc-1',
                        state: 'input-streaming',
                        input: { intent: 'bug' },
                    },
                    {
                        type: 'tool-createLinearTicket',
                        toolCallId: 'tc-2',
                        state: 'input-available',
                        input: {
                            intent: 'bug',
                            title: 'Voting transaction reverts',
                            description:
                                'Submitting a vote reverts with an unknown error.',
                        },
                    },
                ],
            } as never,
            {
                id: 'message-3',
                role: 'user',
                parts: [{ type: 'text', text: 'Actually, one more detail.' }],
            },
        ];

        const response = await app.request('/chat', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(body),
        });
        const streamed = await response.text();

        expect(response.status).toEqual(200);
        // The turn streams a normal reply, and the stopped draft never reaches the model as a
        // dangling tool call.
        expect(streamed).not.toContain('"type":"error"');
        const streamCalls = JSON.stringify(model.doStreamCalls);
        expect(streamCalls).not.toContain('tc-1');
        expect(streamCalls).not.toContain('tc-2');
    });

    it('shows the model where an attachment arrived in the conversation', async () => {
        const model = createMockChatModel({});
        const deps = createTestDependencies(model);
        const app = buildApp(deps);

        // The bytes travel out-of-band (the widget sends the name only), so the conversation
        // itself must say that a file came with this message — otherwise the model keeps asking
        // for a screenshot the user just sent.
        const body = buildRequestBody();
        body.messages = [
            {
                id: 'message-1',
                role: 'user',
                parts: [
                    { type: 'text', text: 'Here is what I see.' },
                    {
                        type: 'data-attachment',
                        data: { filename: 'screenshot.png' },
                    },
                ],
            } as never,
        ];

        const response = await app.request('/chat', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(body),
        });
        await response.text();

        expect(response.status).toEqual(200);
        const streamCalls = JSON.stringify(model.doStreamCalls);
        expect(streamCalls).toContain('[attached: screenshot.png]');
        // The system prompt explains the marker only when the conversation carries one.
        expect(streamCalls).toContain('means the user attached that file');
    });

    it('leaves the attachment guidance out of a conversation without files', async () => {
        const model = createMockChatModel({});
        const deps = createTestDependencies(model);

        const response = await postChat(buildApp(deps));
        await response.text();

        expect(JSON.stringify(model.doStreamCalls)).not.toContain(
            'means the user attached that file',
        );
    });

    it('strips replayed reasoning parts from the history before the model call', async () => {
        const model = createMockChatModel({});
        const deps = createTestDependencies(model);
        const app = buildApp(deps);

        // A reasoning model's thinking travels back with the client history; it feeds no next
        // turn and some providers reject it, so it must never reach the model call.
        const body = buildRequestBody();
        body.messages = [
            ...body.messages,
            {
                id: 'message-2',
                role: 'assistant',
                parts: [
                    { type: 'reasoning', text: 'Private chain of thought.' },
                    { type: 'text', text: 'Could you share more details?' },
                ],
            } as never,
            {
                id: 'message-3',
                role: 'user',
                parts: [{ type: 'text', text: 'It started today.' }],
            },
        ];

        const response = await app.request('/chat', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(body),
        });
        await response.text();

        expect(response.status).toEqual(200);
        const streamCalls = JSON.stringify(model.doStreamCalls);
        expect(streamCalls).not.toContain('Private chain of thought.');
        expect(streamCalls).toContain('Could you share more details?');
    });

    it('gates ticket creation behind approval: a proposed tool call never executes on its own', async () => {
        const deps = createTestDependencies(
            createMockChatModel({
                toolCall: {
                    toolName: 'createLinearTicket',
                    input: {
                        intent: 'bug',
                        title: 'Voting transaction reverts',
                        description:
                            'Submitting a vote reverts with an unknown error.',
                    },
                },
            }),
        );

        const response = await postChat(buildApp(deps));
        const body = await response.text();

        expect(response.status).toEqual(200);
        // The tool call streams to the client, but creation waits for the user's approval —
        // Linear is never touched by an unapproved proposal.
        expect(body).toContain('createLinearTicket');
        expect(deps.linear.createIssueCalls).toHaveLength(0);
    });

    // An approval resume: the widget re-sends the history ending on the assistant's message,
    // whose draft the user just approved — no new user input.
    const buildResumeBody = (toolCallId = 'tc-1') => {
        const body = buildRequestBody();
        body.messages = [
            ...body.messages,
            {
                id: 'message-2',
                role: 'assistant',
                parts: [
                    {
                        type: 'tool-createLinearTicket',
                        toolCallId,
                        state: 'approval-responded',
                        input: {
                            intent: 'bug',
                            title: 'Voting transaction reverts',
                            description:
                                'Submitting a vote reverts with an unknown error.',
                        },
                        approval: { id: 'ap-1', approved: true },
                    },
                ],
            } as never,
        ];

        return body;
    };

    const postResume = (app: Hono, toolCallId?: string) =>
        app.request('/chat', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(buildResumeBody(toolCallId)),
        });

    it('continues the assistant message on a resume instead of opening a second one', async () => {
        const deps = createTestDependencies(createMockChatModel({}));

        const response = await postResume(buildApp(deps));
        const streamed = await response.text();

        // The response is stamped with the id of the message the draft lives in, so the widget
        // continues it. A fresh id makes the widget append a copy of that message — the sentence
        // written before the tool call would then appear a second time under the created ticket.
        expect(streamed).toContain('"type":"start","messageId":"message-2"');
    });

    it('does not count an approval resume against the turn budget', async () => {
        const deps = createTestDependencies(createMockChatModel({}));

        const response = await postResume(buildApp(deps));
        await response.text();

        expect(response.status).toEqual(200);
        // The resume executed the approved creation, and the ticket cost one turn (the draft),
        // not two — the Create press itself is free.
        expect(deps.linear.createIssueCalls).toHaveLength(1);
        expect(await deps.sessionStore.getTurns(sessionId)).toEqual(0);
    });

    it('fails a pending approved creation explicitly when a limit refuses the resume', async () => {
        const model = createMockChatModel({});
        const deps = createTestDependencies(model);
        await deps.sessionStore.addTokens(
            sessionId,
            assistantLimits.maxTokensPerSession,
        );

        const response = await postResume(buildApp(deps), 'tc-9');
        const streamed = await response.text();

        expect(response.status).toEqual(200);
        // The fixed limit message also resolves the approved call as a failure: the approval
        // card reaches a terminal state instead of showing the creation in flight forever.
        expect(streamed).toContain('tool-output-error');
        expect(streamed).toContain('tc-9');
        expect(streamed).toContain('reached its size limit');
        expect(model.doStreamCalls).toHaveLength(0);
        expect(deps.linear.createIssueCalls).toHaveLength(0);
    });
});

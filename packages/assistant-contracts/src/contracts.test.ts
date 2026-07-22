import {
    assistantErrorSchema,
    chatRequestSchema,
    createTicketToolInputSchema,
    createTicketToolOutputSchema,
} from './index';

// Pinned wire contract between the assistant service and the chat widget. These payloads are
// written out literally on purpose: a failure here means a DEPLOYED widget/server pair breaks,
// not that a type needs updating. Change them only together with both sides.
describe('assistant wire contract', () => {
    const request = {
        sessionId: 'b3b8f8a2-6c9d-4c9e-8f6a-2d1e0c9b8a7f',
        messages: [
            {
                id: 'message-1',
                role: 'user',
                parts: [{ type: 'text', text: 'The app crashes when I vote.' }],
            },
            {
                id: 'message-2',
                role: 'assistant',
                // The widget posts its UIMessage history verbatim: non-text parts (tool calls,
                // step markers) must stay tolerated.
                parts: [
                    { type: 'step-start' },
                    {
                        type: 'tool-createLinearTicket',
                        toolCallId: 'call-1',
                        state: 'output-available',
                    },
                    { type: 'text', text: 'Got it.' },
                ],
            },
        ],
        appContext: {
            route: '/dao/proposals',
            appVersion: '1.33.2',
            daoAddress: '0x123',
            network: 'base-mainnet',
            walletAddress: '0xabc',
        },
    };

    it('accepts the pinned chat request shape', () => {
        expect(chatRequestSchema.safeParse(request).success).toBeTruthy();
    });

    it('accepts the optional debug context fields attached to the ticket', () => {
        const withDebug = {
            ...request,
            appContext: {
                ...request.appContext,
                chainId: 8453,
                recentTransactions: [
                    { hash: '0xdeadbeef', status: 'SUBMITTED', type: 'vote' },
                    { status: 'FAILED' },
                ],
            },
        };
        expect(chatRequestSchema.safeParse(withDebug).success).toBeTruthy();
    });

    it('rejects requests without a session uuid or app context', () => {
        expect(
            chatRequestSchema.safeParse({ ...request, sessionId: 'nope' })
                .success,
        ).toBeFalsy();
        expect(
            chatRequestSchema.safeParse({ ...request, appContext: {} }).success,
        ).toBeFalsy();
    });

    it('pins the createLinearTicket tool input shape', () => {
        expect(
            createTicketToolInputSchema.safeParse({
                intent: 'bug',
                title: 'Voting transaction reverts',
                description:
                    'Submitting a vote on a proposal reverts with an unknown error.',
                email: 'user@example.com',
                stepsToReproduce: ['Open a proposal', 'Press vote'],
            }).success,
        ).toBeTruthy();

        // The zod gate rejects thin/premature calls (short title, missing description) and
        // off-topic intents so the model gathers more before it can file.
        expect(
            createTicketToolInputSchema.safeParse({
                intent: 'bug',
                title: 'bug',
                description: 'x',
            }).success,
        ).toBeFalsy();
        expect(
            createTicketToolInputSchema.safeParse({
                intent: 'off_topic',
                title: 'Voting transaction reverts',
                description:
                    'Submitting a vote on a proposal reverts with an unknown error.',
            }).success,
        ).toBeFalsy();
    });

    it('pins the createLinearTicket tool output shape', () => {
        expect(
            createTicketToolOutputSchema.safeParse({
                identifier: 'SUP-123',
                url: 'https://linear.app/aragon/issue/SUP-123',
            }).success,
        ).toBeTruthy();
    });

    it('pins the shared error shape and its codes', () => {
        expect(
            assistantErrorSchema.safeParse({
                error: {
                    code: 'rate_limited',
                    message: 'Too many requests, please retry later.',
                },
            }).success,
        ).toBeTruthy();

        // The widget switches its error UX on the code: unknown codes must never pass.
        expect(
            assistantErrorSchema.safeParse({
                error: { code: 'brand_new_code', message: 'x' },
            }).success,
        ).toBeFalsy();
    });
});

import {
    assistantErrorSchema,
    chatRequestSchema,
    createIssueRequestSchema,
    createIssueResponseSchema,
    previewIssueResponseSchema,
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
                // The widget posts its UIMessage history verbatim: non-text parts (data parts,
                // step markers) must stay tolerated.
                parts: [
                    { type: 'step-start' },
                    {
                        type: 'data-collectedFields',
                        data: { fields: { intent: 'bug' } },
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

    it('accepts the pinned chat/issue request shape', () => {
        expect(chatRequestSchema.safeParse(request).success).toBeTruthy();
        // Preview and creation take the transcript too: the requests ARE the chat request shape.
        expect(
            createIssueRequestSchema.safeParse(request).success,
        ).toBeTruthy();
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

    it('pins the issue preview response', () => {
        expect(
            previewIssueResponseSchema.safeParse({
                status: 'ready',
                summary: 'Voting crash',
                intent: 'bug',
            }).success,
        ).toBeTruthy();
        expect(
            previewIssueResponseSchema.safeParse({ status: 'unclear' }).success,
        ).toBeTruthy();

        // A ready preview without a reviewable summary must never pass.
        expect(
            previewIssueResponseSchema.safeParse({ status: 'ready' }).success,
        ).toBeFalsy();
    });

    it('pins the issue creation response', () => {
        expect(
            createIssueResponseSchema.safeParse({
                issueId: 'issue-1',
                identifier: 'SUP-123',
                url: 'https://linear.app/aragon/issue/SUP-123',
                alreadyExisted: false,
            }).success,
        ).toBeTruthy();
    });

    it('pins the shared error shape and its codes', () => {
        expect(
            assistantErrorSchema.safeParse({
                error: {
                    code: 'rate_limited',
                    message: 'Too many requests, please retry later.',
                    details: { missingFields: ['summary'] },
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

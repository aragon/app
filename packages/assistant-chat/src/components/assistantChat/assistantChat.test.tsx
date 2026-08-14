import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { IChatMonitoring } from '../../monitoring';
import { AssistantChat } from './assistantChat';

// The blob client uploads straight to blob storage with its own vendor protocol; the mock skips
// those vendor calls only — the confirm request to our own service still goes through fetch.
jest.mock('@vercel/blob/client', () => ({
    upload: jest.fn(() =>
        Promise.resolve({ url: 'https://blob.test/assistant/file/image.png' }),
    ),
}));

// Integration tests of the whole widget: real context, runtime bridge and AI SDK transport — only
// the network is faked. A failure here means a broken user flow, not a changed implementation
// detail. The stream is the AI SDK v7 UI-message-stream (SSE, one JSON chunk per event) and the
// ticket flow runs entirely through tool-call + approval parts.

const assistantUrl = 'https://assistant.test';

// The draft the model streams: a completed tool call gated behind an approval request. The widget
// renders it as the review card with Create / Dismiss.
const draftChunks = (toolCallId: string) => [
    { type: 'start' },
    { type: 'tool-input-start', toolCallId, toolName: 'createLinearTicket' },
    {
        type: 'tool-input-available',
        toolCallId,
        toolName: 'createLinearTicket',
        input: {
            intent: 'bug',
            title: 'Proposal page crashes on load',
            description:
                'The proposal page crashes on load right after opening it.',
        },
    },
    {
        type: 'tool-approval-request',
        approvalId: `ap-${toolCallId}`,
        toolCallId,
    },
    { type: 'finish' },
];

// The resume after Create succeeds: the tool output lands on the approved tool call.
const successChunks = (toolCallId: string) => [
    { type: 'start' },
    {
        type: 'tool-output-available',
        toolCallId,
        output: {
            identifier: 'SUP-123',
            url: 'https://linear.app/aragon/issue/SUP-123',
        },
    },
    { type: 'finish' },
];

// A plain streamed text reply.
const textChunks = (text: string) => [
    { type: 'start' },
    { type: 'text-start', id: 'txt-1' },
    { type: 'text-delta', id: 'txt-1', delta: text },
    { type: 'text-end', id: 'txt-1' },
    { type: 'finish' },
];

// The resume after Create fails: the server turned the tool throw into a tool-output-error part.
const errorChunks = (toolCallId: string) => [
    { type: 'start' },
    {
        type: 'tool-output-error',
        toolCallId,
        errorText: 'Creating the ticket failed. Please try again.',
    },
    { type: 'finish' },
];

const createHeaders = (entries: Record<string, string>) => ({
    get: (name: string) => entries[name.toLowerCase()] ?? null,
});

const createChatResponse = (chunks: unknown[]): Response => {
    const events = chunks
        .map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`)
        .join('');
    const body = new ReadableStream<Uint8Array>({
        start: (controller) => {
            controller.enqueue(
                new TextEncoder().encode(`${events}data: [DONE]\n\n`),
            );
            controller.close();
        },
    });

    return {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: createHeaders({
            'content-type': 'text/event-stream',
            'x-vercel-ai-ui-message-stream': 'v1',
        }),
        body,
    } as unknown as Response;
};

// A distinctive marker in the user's message: no monitoring call may ever carry it.
const userSecret = 'secret-token-xyz';

describe('<AssistantChat /> integration', () => {
    const originalFetch = global.fetch;
    const fetchMock = jest.fn<
        Promise<Response>,
        [RequestInfo | URL, RequestInit?]
    >();

    // Queued responses for consecutive POST /chat calls (initial send, then each approval resume).
    let chatResponses: Response[] = [];

    const chatCalls = () =>
        fetchMock.mock.calls.filter(([input]) =>
            input.toString().endsWith('/chat'),
        );

    beforeEach(() => {
        localStorage.clear();
        chatResponses = [];
        fetchMock.mockReset();
        fetchMock.mockImplementation((input) => {
            const url = input.toString();

            if (url === `${assistantUrl}/chat`) {
                const next = chatResponses.shift();

                if (next == null) {
                    throw new Error('Unexpected /chat call');
                }

                return Promise.resolve(next);
            }

            // The upload confirm of the service (the blob-storage leg itself is mocked at the
            // module level): the file is validated and queued for the ticket.
            if (url === `${assistantUrl}/files/confirm`) {
                return Promise.resolve({
                    ok: true,
                    status: 201,
                    headers: createHeaders({
                        'content-type': 'application/json',
                    }),
                    json: () =>
                        Promise.resolve({
                            id: 'file-1',
                            filename: 'screenshot.png',
                            contentType: 'image/png',
                            size: 4,
                        }),
                } as unknown as Response);
            }

            throw new Error(`Unexpected fetch to ${url}`);
        });
        global.fetch = fetchMock as unknown as typeof fetch;
    });

    afterAll(() => {
        global.fetch = originalFetch;
    });

    const widget = (isOpen = true, monitoring?: IChatMonitoring) => (
        <AssistantChat
            appContext={{ route: '/dashboard', appVersion: '1.0.0' }}
            assistantUrl={assistantUrl}
            isOpen={isOpen}
            monitoring={monitoring}
            onClose={jest.fn()}
        />
    );

    const renderWidget = (monitoring?: IChatMonitoring) =>
        render(widget(true, monitoring));

    const sendMessageAndReviewDraft = async () => {
        const composer = await screen.findByRole('textbox', {
            name: 'Message',
        });
        await userEvent.type(
            composer,
            `The proposal page crashes on load (${userSecret}).{Enter}`,
        );

        // The streamed draft: the ticket title the model assembled, offered for approval.
        expect(
            await screen.findByText('Proposal page crashes on load'),
        ).toBeInTheDocument();

        return screen.getByRole('button', { name: 'Create ticket' });
    };

    it('drafts the ticket, creates it on approval and links to it', async () => {
        chatResponses = [
            createChatResponse(draftChunks('tc-1')),
            createChatResponse(successChunks('tc-1')),
        ];
        renderWidget();

        const createButton = await sendMessageAndReviewDraft();
        expect(
            screen.getByRole('button', { name: 'Dismiss' }),
        ).toBeInTheDocument();

        // The transcript opens with the time it started, the header names the draft in progress.
        expect(screen.getByText(/^Today \d{2}:\d{2}$/)).toBeInTheDocument();
        expect(
            screen.getByText('Draft: Proposal page crashes on load'),
        ).toBeInTheDocument();

        await userEvent.click(createButton);

        // Approval resumes the stream (a second /chat call) and the tool output renders as success.
        expect(await screen.findByText('Request created')).toBeInTheDocument();
        expect(screen.getByText('SUP-123')).toBeInTheDocument();
        expect(chatCalls()).toHaveLength(2);

        // The header follows the ticket from draft to created.
        expect(
            screen.getByText('SUP-123: Proposal page crashes on load'),
        ).toBeInTheDocument();

        // The created ticket is remembered in the device-local history.
        expect(
            JSON.parse(
                localStorage.getItem('aragon-assistant:requests') ?? '[]',
            ),
        ).toEqual([expect.objectContaining({ identifier: 'SUP-123' })]);
    });

    it('shows a retryable failure when creation fails and recovers on retry', async () => {
        // Retry regenerates the turn: the model re-drafts (a fresh approval gate) rather than
        // silently re-firing, so the sequence is draft → error → fresh draft → success.
        chatResponses = [
            createChatResponse(draftChunks('tc-1')),
            createChatResponse(errorChunks('tc-1')),
            createChatResponse(draftChunks('tc-2')),
            createChatResponse(successChunks('tc-2')),
        ];
        const monitoring: IChatMonitoring = {
            logError: jest.fn(),
            logMessage: jest.fn(),
        };
        renderWidget(monitoring);

        const createButton = await sendMessageAndReviewDraft();
        await userEvent.click(createButton);

        // The failed creation surfaces as a retryable card, never a thrown transport error.
        expect(
            await screen.findByText("We couldn't create your request"),
        ).toBeInTheDocument();

        // Retry re-drafts; approving the fresh draft creates the ticket.
        await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
        await userEvent.click(
            await screen.findByRole('button', { name: 'Create ticket' }),
        );

        expect(await screen.findByText('Request created')).toBeInTheDocument();
        expect(screen.getByText('SUP-123')).toBeInTheDocument();

        // Monitoring stays PII-free: a tool failure is an expected outcome (not reported as an
        // error), and nothing the user typed ever reaches a monitoring call.
        expect(monitoring.logError).not.toHaveBeenCalled();
        const monitoringCalls = [
            ...(monitoring.logError as jest.Mock).mock.calls,
            ...(monitoring.logMessage as jest.Mock).mock.calls,
        ];
        for (const call of monitoringCalls) {
            expect(JSON.stringify(call)).not.toContain(userSecret);
        }
    });

    it('keeps a sent attachment visible in the transcript without sending its bytes to the chat', async () => {
        chatResponses = [
            createChatResponse(textChunks('Thanks for the screenshot.')),
        ];
        renderWidget();

        // The add-attachment button mounts a hidden file input on the page and clicks it; the
        // upload runs through the attachment adapter (blob leg mocked, confirm over fetch).
        await userEvent.click(
            await screen.findByRole('button', { name: 'Add attachment' }),
        );
        const fileInput =
            document.querySelector<HTMLInputElement>('input[type="file"]');
        expect(fileInput).not.toBeNull();
        await userEvent.upload(
            fileInput as HTMLInputElement,
            new File(['1234'], 'screenshot.png', { type: 'image/png' }),
        );

        // The composer shows the pending tile while the file sits unsent.
        expect(
            await screen.findByRole('button', { name: /Image attachment/ }),
        ).toBeInTheDocument();

        const composer = screen.getByRole('textbox', { name: 'Message' });
        await userEvent.type(composer, 'here is the screenshot{Enter}');
        expect(
            await screen.findByText('Thanks for the screenshot.'),
        ).toBeInTheDocument();

        // The tile moved from the composer into the sent user message instead of vanishing.
        expect(
            screen.getByRole('button', { name: /Image attachment/ }),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: 'Remove file' }),
        ).not.toBeInTheDocument();

        // The bytes stay local: the request names the attachment (so the service can show the
        // model where it arrived) and carries nothing else of it.
        const [, chatRequest] = chatCalls()[0];
        const requestBody = JSON.parse(chatRequest?.body as string) as {
            messages: { parts: Record<string, unknown>[] }[];
        };
        const requestParts = requestBody.messages.flatMap(
            (message) => message.parts,
        );
        expect(requestParts).toContainEqual({
            type: 'data-attachment',
            data: { filename: 'screenshot.png' },
        });
        expect(chatRequest?.body).not.toContain('data:image/png;base64');
    });

    it('opens the requests filed from this device from the link under the composer', async () => {
        localStorage.setItem(
            'aragon-assistant:requests',
            JSON.stringify([
                {
                    identifier: 'SUP-1',
                    url: 'https://linear.app/aragon/issue/SUP-1',
                    summary: 'Treasury shows a stale balance',
                    createdAt: '2026-07-24T10:00:00.000Z',
                },
            ]),
        );
        renderWidget();

        await userEvent.click(
            await screen.findByRole('button', { name: 'Past requests (1)' }),
        );

        // The requests take over the panel: the entry deep-links to the ticket, the composer is
        // gone until the user comes back to the conversation.
        expect(
            screen.getByRole('link', {
                name: /Treasury shows a stale balance/,
            }),
        ).toHaveAttribute('href', 'https://linear.app/aragon/issue/SUP-1');
        expect(
            screen.queryByRole('textbox', { name: 'Message' }),
        ).not.toBeInTheDocument();

        await userEvent.click(
            screen.getByRole('button', { name: 'Back to chat' }),
        );
        expect(
            await screen.findByRole('textbox', { name: 'Message' }),
        ).toBeInTheDocument();
    });

    it('leaves the requests behind when the panel is closed while showing them', async () => {
        localStorage.setItem(
            'aragon-assistant:requests',
            JSON.stringify([
                {
                    identifier: 'SUP-1',
                    url: 'https://linear.app/aragon/issue/SUP-1',
                    summary: 'Treasury shows a stale balance',
                    createdAt: '2026-07-24T10:00:00.000Z',
                },
            ]),
        );
        const { rerender } = renderWidget();

        await userEvent.click(
            await screen.findByRole('button', { name: 'Past requests (1)' }),
        );
        expect(
            screen.queryByRole('textbox', { name: 'Message' }),
        ).not.toBeInTheDocument();

        // Reopening lands on the conversation, not on the detour the panel was closed from.
        rerender(widget(false));
        rerender(widget(true));

        expect(
            await screen.findByRole('textbox', { name: 'Message' }),
        ).toBeInTheDocument();
    });

    it('stops naming a draft in the header once the user dismisses it', async () => {
        chatResponses = [
            createChatResponse(draftChunks('tc-1')),
            createChatResponse(textChunks('No problem, the draft is gone.')),
        ];
        renderWidget();

        await sendMessageAndReviewDraft();
        await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));

        // The card says the draft was dismissed, so nothing is being worked on: the header drops
        // back to naming a fresh conversation.
        expect(
            await screen.findByText(
                'Draft dismissed. Keep chatting to prepare a new one.',
            ),
        ).toBeInTheDocument();
        expect(
            screen.queryByText('Draft: Proposal page crashes on load'),
        ).not.toBeInTheDocument();
        expect(screen.getByText('New conversation')).toBeInTheDocument();
    });

    it('marks an unapproved draft as superseded when the user keeps typing', async () => {
        chatResponses = [
            createChatResponse(draftChunks('tc-1')),
            createChatResponse(textChunks('Got it, updating the draft.')),
        ];
        renderWidget();

        await sendMessageAndReviewDraft();

        const composer = screen.getByRole('textbox', { name: 'Message' });
        await userEvent.type(composer, 'one more detail{Enter}');
        expect(
            await screen.findByText('Got it, updating the draft.'),
        ).toBeInTheDocument();

        // The undecided draft is spent quietly — no error wording, no lingering Create button.
        expect(
            screen.getByText(
                'Earlier draft set aside — your newer messages replaced it.',
            ),
        ).toBeInTheDocument();
        expect(
            screen.queryByText(
                'That draft did not come through. Keep chatting to prepare a new one.',
            ),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: 'Create ticket' }),
        ).not.toBeInTheDocument();
        expect(screen.getByText('New conversation')).toBeInTheDocument();

        // The pending approval travels to the server untouched, where it resolves as superseded —
        // the client must not rewrite it into a tool error.
        const [, secondRequest] = chatCalls()[1];
        const secondBody = JSON.parse(secondRequest?.body as string) as {
            messages: {
                parts: { type: string; state?: string }[];
            }[];
        };
        const toolParts = secondBody.messages
            .flatMap((message) => message.parts)
            .filter((part) => part.type === 'tool-createLinearTicket');
        expect(toolParts).toEqual([
            expect.objectContaining({ state: 'approval-requested' }),
        ]);
    });
});

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { IChatMonitoring } from '../../monitoring';
import { AssistantChat } from './assistantChat';

// Integration tests of the whole widget: real controller, hooks and AI SDK transport — only the
// network is faked. A failure here means a broken user flow, not a changed implementation detail.

const assistantUrl = 'https://assistant.test';

// AI SDK UI message stream: SSE with one JSON chunk per event, terminated by [DONE]. The stream
// carries the conversation only — ticket state goes through the explicit preview flow.
const chatStreamChunks = [
    { type: 'start' },
    { type: 'text-start', id: 'text-1' },
    {
        type: 'text-delta',
        id: 'text-1',
        delta: 'Thanks, that is everything we need!',
    },
    { type: 'text-end', id: 'text-1' },
    { type: 'finish' },
];

const createHeaders = (entries: Record<string, string>) => ({
    get: (name: string) => entries[name.toLowerCase()] ?? null,
});

const createChatResponse = (): Response => {
    const events = chatStreamChunks
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

const createJsonResponse = (status: number, body: unknown): Response =>
    ({
        ok: status < 400,
        status,
        statusText: '',
        headers: createHeaders({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(body),
        text: () => Promise.resolve(JSON.stringify(body)),
        body: null,
    }) as unknown as Response;

const readyPreview = {
    status: 'ready',
    summary: 'Proposal page crashes',
    intent: 'bug',
};

const createdIssue = {
    issueId: 'issue-1',
    identifier: 'SUP-123',
    url: 'https://linear.app/aragon/issue/SUP-123',
    alreadyExisted: false,
};

describe('<AssistantChat /> integration', () => {
    const originalFetch = global.fetch;
    const fetchMock = jest.fn<Promise<Response>, [RequestInfo | URL]>();

    let previewResponses: Response[] = [];
    let issueResponses: Response[] = [];

    const issueCalls = () =>
        fetchMock.mock.calls.filter(([input]) =>
            input.toString().endsWith('/issues'),
        );

    beforeEach(() => {
        localStorage.clear();
        previewResponses = [];
        issueResponses = [];
        fetchMock.mockReset();
        fetchMock.mockImplementation((input) => {
            const url = input.toString();

            if (url === `${assistantUrl}/chat`) {
                return Promise.resolve(createChatResponse());
            }

            if (url === `${assistantUrl}/issues/preview`) {
                const next = previewResponses.shift();

                if (next == null) {
                    throw new Error('Unexpected /issues/preview call');
                }

                return Promise.resolve(next);
            }

            if (url === `${assistantUrl}/issues`) {
                const next = issueResponses.shift();

                if (next == null) {
                    throw new Error('Unexpected /issues call');
                }

                return Promise.resolve(next);
            }

            throw new Error(`Unexpected fetch to ${url}`);
        });
        global.fetch = fetchMock as unknown as typeof fetch;
    });

    afterAll(() => {
        global.fetch = originalFetch;
    });

    const renderWidget = (monitoring?: IChatMonitoring) =>
        render(
            <QueryClientProvider client={new QueryClient()}>
                <AssistantChat
                    appContext={{ route: '/dashboard', appVersion: '1.0.0' }}
                    assistantUrl={assistantUrl}
                    isOpen={true}
                    monitoring={monitoring}
                    onClose={jest.fn()}
                />
            </QueryClientProvider>,
        );

    const chatOneTurn = async () => {
        const composer = await screen.findByRole('textbox', {
            name: 'Message',
        });
        await userEvent.type(
            composer,
            'The proposal page crashes on load.{Enter}',
        );

        expect(
            await screen.findByText('Thanks, that is everything we need!'),
        ).toBeInTheDocument();
    };

    const prepareUntilReady = async () => {
        await chatOneTurn();
        await userEvent.click(
            screen.getByRole('button', { name: 'Prepare ticket' }),
        );

        // The reviewed preview: the ticket title the server distilled, offered for sending.
        expect(
            await screen.findByText('Proposal page crashes'),
        ).toBeInTheDocument();

        return screen.getByRole('button', { name: 'Send ticket' });
    };

    it('previews the ticket from the conversation and creates it exactly once', async () => {
        // The creation response is deferred so the second click below lands while the request
        // is still in flight — the window in which a double POST would duplicate the ticket.
        let resolveIssue!: (response: Response) => void;
        const deferredIssue = new Promise<Response>((resolve) => {
            resolveIssue = resolve;
        });
        fetchMock.mockImplementation((input) => {
            const url = input.toString();

            if (url === `${assistantUrl}/chat`) {
                return Promise.resolve(createChatResponse());
            }

            if (url === `${assistantUrl}/issues/preview`) {
                return Promise.resolve(createJsonResponse(200, readyPreview));
            }

            if (url === `${assistantUrl}/issues`) {
                return deferredIssue;
            }

            throw new Error(`Unexpected fetch to ${url}`);
        });
        renderWidget();

        const sendButton = await prepareUntilReady();
        expect(screen.getByText('Ready to send')).toBeInTheDocument();

        // A double click must not create a second ticket.
        await userEvent.click(sendButton);
        await userEvent.click(sendButton);
        resolveIssue(createJsonResponse(201, createdIssue));

        expect(await screen.findByText('Request created')).toBeInTheDocument();
        expect(screen.getByText('SUP-123')).toBeInTheDocument();
        expect(issueCalls()).toHaveLength(1);

        // One ticket = one chat: the composer is replaced by the new-chat bar.
        expect(
            screen.getByRole('button', { name: 'Start new chat' }),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('textbox', { name: 'Message' }),
        ).not.toBeInTheDocument();
    });

    it('keeps collecting when the preview finds no actionable request', async () => {
        previewResponses = [createJsonResponse(200, { status: 'unclear' })];
        renderWidget();

        await chatOneTurn();
        await userEvent.click(
            screen.getByRole('button', { name: 'Prepare ticket' }),
        );

        // The honest outcome: no ticket offered, the user is nudged to keep talking.
        expect(
            await screen.findByText(/tell us a bit more/),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: 'Send ticket' }),
        ).not.toBeInTheDocument();
    });

    it('shows the error panel on a failed creation and recovers through retry', async () => {
        previewResponses = [createJsonResponse(200, readyPreview)];
        issueResponses = [
            createJsonResponse(502, {
                error: { code: 'internal', message: 'Linear is unreachable.' },
            }),
            createJsonResponse(201, createdIssue),
        ];
        const monitoring: IChatMonitoring = {
            logError: jest.fn(),
            logMessage: jest.fn(),
        };
        renderWidget(monitoring);

        const sendButton = await prepareUntilReady();
        await userEvent.click(sendButton);

        expect(
            await screen.findByText("We couldn't create your request"),
        ).toBeInTheDocument();

        // The refusal is reported with the error code only — never with user content.
        expect(monitoring.logMessage).toHaveBeenCalledWith(
            'assistantChat: createIssue failed',
            { level: 'warning', context: { code: 'internal' } },
        );

        await userEvent.click(screen.getByRole('button', { name: 'Retry' }));

        expect(await screen.findByText('Request created')).toBeInTheDocument();
        expect(issueCalls()).toHaveLength(2);
    });
});

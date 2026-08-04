import { type BrowserContext, expect, type Page, test } from '@playwright/test';

const featureFlagCookieName = 'aragon.featureFlags.overrides';

const supportPortalUrl =
    'https://aragonassociation.atlassian.net/servicedesk/customer/portal/3';

const supportEmailHref = 'mailto:support@aragon.org';

// The assistant runs on its own origin (NEXT_PUBLIC_ASSISTANT_URL); with the feature flag on,
// the navigation-bar trigger opens the chat side panel. Everything streams from POST /chat: the
// agent drafts the ticket as a tool call gated behind an approval, and approving it resumes the
// stream with a second /chat call that carries the tool output.
const chatRoutePattern = '**/chat';

const setSupportChatFlag = async (
    context: BrowserContext,
    baseURL: string,
    enabled: boolean,
) => {
    await context.addCookies([
        {
            name: featureFlagCookieName,
            value: encodeURIComponent(JSON.stringify({ supportChat: enabled })),
            url: baseURL,
        },
    ]);
};

// AI SDK UI message stream: SSE with one JSON chunk per event, terminated by [DONE].
const buildStream = (chunks: unknown[]): string => {
    const events = chunks.map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`);

    return `${events.join('')}data: [DONE]\n\n`;
};

// First /chat call: the agent drafts the ticket — a completed tool call awaiting user approval,
// rendered by the widget as the review card with Create / Dismiss.
const draftStream = buildStream([
    { type: 'start' },
    {
        type: 'tool-input-start',
        toolCallId: 'tc-1',
        toolName: 'createLinearTicket',
    },
    {
        type: 'tool-input-available',
        toolCallId: 'tc-1',
        toolName: 'createLinearTicket',
        input: {
            intent: 'bug',
            title: 'Proposal page crashes',
            description: 'The proposal page crashes on load.',
        },
    },
    { type: 'tool-approval-request', approvalId: 'ap-1', toolCallId: 'tc-1' },
    { type: 'finish' },
]);

// Second /chat call (the approval resume): the executed tool reports the created ticket.
const successStream = buildStream([
    { type: 'start' },
    {
        type: 'tool-output-available',
        toolCallId: 'tc-1',
        output: {
            identifier: 'SUP-123',
            url: 'https://linear.app/aragon/issue/SUP-123',
        },
    },
    { type: 'finish' },
]);

const getChatTrigger = (page: Page) =>
    page.getByRole('button', { name: 'Open support chat' });

// The chat lives in a non-modal side panel (`aside`), not a dialog: the page stays interactive
// while it is open.
const getChatPanel = (page: Page) =>
    page.getByRole('complementary', { name: 'Support chat' });

test.describe('Support chat', () => {
    test('opens the chat, drafts the ticket and creates it on approval', async ({
        baseURL,
        context,
        page,
    }) => {
        await setSupportChatFlag(context, baseURL!, true);

        const chatStreams = [draftStream, successStream];
        await page.route(chatRoutePattern, (route) =>
            route.fulfill({
                body: chatStreams.shift(),
                headers: {
                    'cache-control': 'no-cache',
                    'content-type': 'text/event-stream',
                    'x-vercel-ai-ui-message-stream': 'v1',
                },
            }),
        );

        await page.goto('/');
        await getChatTrigger(page).click();

        // Panel open: accessible title + greeting message + the persistent email escape hatch.
        const panel = getChatPanel(page);
        await expect(panel).toBeVisible();
        await expect(
            panel.getByRole('heading', { name: 'Aragon Support Assistant' }),
        ).toBeVisible();
        await expect(
            page.getByText("Hi! Tell us what's going on"),
        ).toBeVisible();
        await expect(
            panel.getByRole('link', { name: 'support@aragon.org' }),
        ).toHaveAttribute('href', supportEmailHref);

        // Send a message; the agent streams back the ticket draft for review.
        const composer = page.getByRole('textbox', { name: 'Message' });
        await composer.fill('The proposal page crashes on load.');
        await composer.press('Enter');

        await expect(
            page.getByText('The proposal page crashes on load.').first(),
        ).toBeVisible();
        await expect(
            page.getByText('Proposal page crashes', { exact: true }),
        ).toBeVisible();
        await expect(
            panel.getByRole('button', { name: 'Dismiss' }),
        ).toBeVisible();

        // Approving resumes the stream: the tool executes and the card links to the ticket.
        // `exact` keeps the match away from other "Create …" buttons of the page.
        await panel
            .getByRole('button', { name: 'Create', exact: true })
            .click();

        await expect(page.getByText('Request created')).toBeVisible();
        await expect(page.getByText('SUP-123')).toBeVisible();
    });

    test('hides the chat entry points and keeps the external support link when the flag is disabled', async ({
        baseURL,
        context,
        page,
    }) => {
        await setSupportChatFlag(context, baseURL!, false);

        await page.goto('/');

        // `exact` keeps DAO cards whose text mentions "support" out of the match. The footer
        // help entry links to the external portal regardless of the flag.
        const helpLink = page.getByRole('link', {
            name: 'Support',
            exact: true,
        });
        await expect(helpLink).toBeVisible();
        await expect(helpLink).toHaveAttribute('href', supportPortalUrl);

        // Flag off: neither the navigation-bar trigger nor the chat panel are rendered.
        await expect(getChatTrigger(page)).toHaveCount(0);
        await expect(getChatPanel(page)).toHaveCount(0);
    });
});

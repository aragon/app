import { type BrowserContext, expect, type Page, test } from '@playwright/test';

const featureFlagCookieName = 'aragon.featureFlags.overrides';

const supportPortalUrl =
    'https://aragonassociation.atlassian.net/servicedesk/customer/portal/3';

// The assistant runs on its own origin (NEXT_PUBLIC_ASSISTANT_URL); with the feature flag on,
// the help click opens the chat directly. The chat streams from POST /chat; the ticket goes
// through POST /issues/preview.
const chatRoutePattern = '**/chat';
const previewRoutePattern = '**/issues/preview';

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

// AI SDK UI message stream: SSE with one JSON chunk per event, terminated by [DONE]. The stream
// carries the conversation only — ticket state goes through the explicit preview flow.
const buildChatStream = (): string => {
    const chunks = [
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

    const events = chunks.map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`);

    return `${events.join('')}data: [DONE]\n\n`;
};

const openSupportChat = async (page: Page) => {
    await page.getByRole('link', { name: 'Support', exact: true }).click();
};

test.describe('Support chat', () => {
    test('opens the chat, streams a reply and previews the ticket for sending', async ({
        baseURL,
        context,
        page,
    }) => {
        await setSupportChatFlag(context, baseURL!, true);
        await page.route(previewRoutePattern, (route) =>
            route.fulfill({
                json: {
                    status: 'ready',
                    summary: 'Proposal page crashes',
                    intent: 'bug',
                },
            }),
        );
        await page.route(chatRoutePattern, (route) =>
            route.fulfill({
                body: buildChatStream(),
                headers: {
                    'cache-control': 'no-cache',
                    'content-type': 'text/event-stream',
                    'x-vercel-ai-ui-message-stream': 'v1',
                },
            }),
        );

        await page.goto('/');
        await openSupportChat(page);

        // Drawer open: accessible title + greeting message + the persistent portal escape hatch.
        const drawer = page.getByRole('dialog', {
            name: 'Aragon Support Assistant',
        });
        await expect(drawer).toBeVisible();
        await expect(
            page.getByText("Hi! Tell us what's going on"),
        ).toBeVisible();
        await expect(
            drawer.getByRole('link', { name: 'Support portal' }),
        ).toHaveAttribute('href', supportPortalUrl);

        // Send a message and receive the mocked streamed reply.
        const composer = page.getByRole('textbox', { name: 'Message' });
        await composer.fill('The proposal page crashes on load.');
        await composer.press('Enter');

        await expect(
            page.getByText('The proposal page crashes on load.').first(),
        ).toBeVisible();
        await expect(
            page.getByText('Thanks, that is everything we need!'),
        ).toBeVisible();

        // The explicit preview: the strip button distills the conversation into the reviewable
        // ticket, whose title the server returned.
        await page.getByRole('button', { name: 'Prepare ticket' }).click();
        await expect(page.getByText('Proposal page crashes')).toBeVisible();
        await expect(
            page.getByRole('button', { name: 'Send ticket' }),
        ).toBeVisible();
    });

    test('keeps the external support link when the flag is disabled', async ({
        baseURL,
        context,
        page,
    }) => {
        await setSupportChatFlag(context, baseURL!, false);

        await page.goto('/');

        // `exact` keeps DAO cards whose text mentions "support" out of the match.
        const helpLink = page.getByRole('link', {
            name: 'Support',
            exact: true,
        });
        await expect(helpLink).toBeVisible();
        await expect(helpLink).toHaveAttribute('href', supportPortalUrl);
    });
});

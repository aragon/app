import { type BrowserContext, expect, type Page, test } from '@playwright/test';

const featureFlagCookieName = 'aragon.featureFlags.overrides';

const supportPortalUrl =
    'https://aragonassociation.atlassian.net/servicedesk/customer/portal/3';

const supportEmailHref = 'mailto:support@aragon.org';

// The assistant runs on its own origin (NEXT_PUBLIC_ASSISTANT_URL); with the feature flag on,
// the navigation-bar trigger opens the chat side panel. The chat streams from POST /chat; the
// ticket goes through POST /issues/preview.
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

const getChatTrigger = (page: Page) =>
    page.getByRole('button', { name: 'Open support chat' });

// The chat lives in a non-modal side panel (`aside`), not a dialog: the page stays interactive
// while it is open.
const getChatPanel = (page: Page) =>
    page.getByRole('complementary', { name: 'Support chat' });

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
        // `exact` keeps the non-exact (case-insensitive) match from also hitting the user
        // message "The proposal page crashes on load." above the ticket preview.
        await expect(
            page.getByText('Proposal page crashes', { exact: true }),
        ).toBeVisible();
        await expect(
            page.getByRole('button', { name: 'Send ticket' }),
        ).toBeVisible();
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

import { DaoDashboardPage, getDaosWithFeature } from '@e2e/helpers';
import {
    type BrowserContext,
    expect,
    type Locator,
    type Page,
    test,
} from '@playwright/test';

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

const getBoundingBox = async (locator: Locator) => {
    const box = await locator.boundingBox();
    if (box == null) {
        throw new Error(`${locator.toString()} is not rendered`);
    }

    return box;
};

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

        // Panel open: accessible title, the subline naming a fresh conversation, and the greeting.
        const panel = getChatPanel(page);
        await expect(panel).toBeVisible();
        await expect(
            panel.getByRole('heading', { name: 'Aragon Assistant' }),
        ).toBeVisible();
        await expect(panel.getByText('New conversation')).toBeVisible();
        await expect(
            page.getByText('What do you need help with?'),
        ).toBeVisible();

        // Send a message; the agent streams back the ticket draft for review.
        const composer = page.getByRole('textbox', { name: 'Message' });
        await composer.fill('The proposal page crashes on load.');
        await composer.press('Enter');

        await expect(
            page.getByText('The proposal page crashes on load.').first(),
        ).toBeVisible();
        await expect(
            panel.getByRole('heading', { name: 'Proposal page crashes' }),
        ).toBeVisible();
        await expect(
            panel.getByRole('button', { name: 'Dismiss' }),
        ).toBeVisible();

        // The header names the draft, and the escape hatch to a human now sits under the composer.
        await expect(
            panel.getByText('Draft: Proposal page crashes'),
        ).toBeVisible();
        await expect(
            panel.getByRole('link', { name: 'Email support' }),
        ).toHaveAttribute('href', supportEmailHref);

        // Approving resumes the stream: the tool executes and the card names the ticket.
        await panel.getByRole('button', { name: 'Create ticket' }).click();

        await expect(page.getByText('Request created')).toBeVisible();
        // The ticket travels as a reference, never a link: the workspace is not reachable by
        // users. The mocked stream still carries the legacy `url` field an older service sends,
        // which the widget must ignore rather than render.
        await expect(panel.getByText('SUP-123', { exact: true })).toBeVisible();
        await expect(panel.getByRole('link', { name: /SUP-123/ })).toHaveCount(
            0,
        );

        // The header follows the ticket from draft to created.
        await expect(
            panel.getByText('SUP-123: Proposal page crashes'),
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

    // The app is laid out against the width of its own column, not the browser window (APP-1143):
    // docked, the panel takes 500px of the 1280px window, so the dashboard has to drop to its
    // stacked layout instead of squeezing the 400px aside next to the main column.
    test('lays the dashboard out against the width left beside the docked panel', async ({
        baseURL,
        context,
        page,
    }) => {
        await setSupportChatFlag(context, baseURL!, true);

        const [dao] = getDaosWithFeature('multisig');
        const dashboard = await new DaoDashboardPage({
            page,
            network: dao.network,
            address: dao.address,
        }).navigate();

        const main = dashboard.mainContent();
        // The page aside and the chat panel are both `complementary` landmarks; the details card
        // tells the page one apart.
        const aside = page
            .getByRole('complementary')
            .filter({ has: page.getByRole('heading', { name: 'Contract' }) });
        const panel = getChatPanel(page);

        await expect(main).toBeVisible();
        await expect(aside).toBeVisible();

        // Panel closed: the desktop layout, the aside beside the main column.
        const closedMain = await getBoundingBox(main);
        const closedAside = await getBoundingBox(aside);
        expect(closedAside.x).toBeGreaterThanOrEqual(
            closedMain.x + closedMain.width,
        );

        await getChatTrigger(page).click();
        await expect(panel).toBeVisible();

        // The panel animates its width in, so poll until the layout has settled. The app keeps
        // 780px, below its `lg` breakpoint: the aside stacks under the main column at the same
        // width, and nothing reaches under the panel or overflows the window.
        await expect(async () => {
            const [openMain, openAside, openPanel] = await Promise.all(
                [main, aside, panel].map(getBoundingBox),
            );
            expect(openPanel.x).toBeGreaterThanOrEqual(
                openMain.x + openMain.width,
            );
            expect(openPanel.x).toBeGreaterThanOrEqual(
                openAside.x + openAside.width,
            );
            expect(openAside.y).toBeGreaterThanOrEqual(
                openMain.y + openMain.height,
            );
            expect(Math.abs(openAside.width - openMain.width)).toBeLessThan(1);
        }).toPass();

        // Subpixel widths round the scroll width up, so allow a pixel.
        const horizontalOverflow = await page.evaluate(
            () =>
                document.documentElement.scrollWidth -
                document.documentElement.clientWidth,
        );
        expect(horizontalOverflow).toBeLessThanOrEqual(1);

        // Narrower window, panel still docked (a window decision): the app keeps 600px, below its
        // `md` breakpoint, so the gov-ui-kit definition list in the details card follows the column
        // too and stacks each term over its value instead of laying them out as a row. 1100px
        // rather than the ticket's 1024px: docking is decided at exactly 64rem, and a window that
        // wide leaves the decision to whether the runner's scrollbar takes layout space.
        await page.setViewportSize({ width: 1100, height: 720 });
        const term = aside.getByRole('term').first();
        const definition = aside.getByRole('definition').first();
        await expect(async () => {
            const [narrowMain, narrowPanel, termBox, definitionBox] =
                await Promise.all(
                    [main, panel, term, definition].map(getBoundingBox),
                );
            expect(narrowPanel.x).toBeGreaterThanOrEqual(
                narrowMain.x + narrowMain.width,
            );
            expect(definitionBox.y).toBeGreaterThanOrEqual(
                termBox.y + termBox.height,
            );
        }).toPass();
    });
});

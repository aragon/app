import { type BrowserContext, expect, test } from '@playwright/test';

const enableWorkspaces = async (context: BrowserContext, baseURL: string) => {
    await context.addCookies([
        {
            name: 'aragon.featureFlags.overrides',
            value: encodeURIComponent(JSON.stringify({ workspaces: true })),
            url: baseURL,
        },
    ]);
};

test.describe('Wallet connect modal', () => {
    test.beforeEach(async ({ baseURL, context, page }) => {
        await enableWorkspaces(context, baseURL!);
        await page.goto('/');
    });

    // The landing signs in straight from the wallet's own modal. The Aragon dialog that used to introduce it is
    // gone from this flow only: the DAO pages still open it through their connected-wallet guards.
    test('opens the wallet modal directly, without the Aragon dialog', async ({
        page,
    }) => {
        // AppKit mounts its host element on load, so a hidden host before the click is what makes the one after
        // it mean something.
        await expect(page.locator('w3m-modal')).toBeHidden();

        await page
            .getByRole('button', { name: 'Continue with wallet' })
            .click();

        await expect(page.locator('w3m-modal')).toBeVisible();
        // AppKit renders its own shadow tree, so the assertions that hold are the host's visibility and the
        // absence of the Aragon dialog that used to come first.
        await expect(page.getByRole('dialog')).toHaveCount(0);
        await expect(
            page.getByText('wants to connect to your wallet'),
        ).toHaveCount(0);
    });

    test('keeps the user on the landing until a wallet connects', async ({
        page,
    }) => {
        await page
            .getByRole('button', { name: 'Continue with wallet' })
            .click();
        await expect(page.locator('w3m-modal')).toBeVisible();

        await expect(page).toHaveURL(/\/$/);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });
});

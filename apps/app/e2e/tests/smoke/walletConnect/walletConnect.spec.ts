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

test.describe('Wallet connect dialog', () => {
    test.beforeEach(async ({ baseURL, context, page }) => {
        await enableWorkspaces(context, baseURL!);
        await page.goto('/');
    });

    test('opens with expected trust signals and controls', async ({ page }) => {
        await page
            .getByRole('button', { name: 'Continue with wallet' })
            .click();

        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();

        await expect(
            dialog.getByText('wants to connect to your wallet'),
        ).toBeVisible();
        await expect(dialog.getByText('View-only permissions')).toBeVisible();
        await expect(dialog.getByText(/Trusted by/)).toBeVisible();
        await expect(dialog.getByText('Audited smart contracts')).toBeVisible();

        await expect(
            dialog.getByRole('button', { name: 'Connect' }),
        ).toBeVisible();
        await expect(
            dialog.getByRole('button', { name: 'Cancel' }),
        ).toBeVisible();
    });

    test('Cancel closes the dialog', async ({ page }) => {
        await page
            .getByRole('button', { name: 'Continue with wallet' })
            .click();

        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();

        await dialog.getByRole('button', { name: 'Cancel' }).click();
        await expect(dialog).toBeHidden();
    });
});

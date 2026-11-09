import { type BrowserContext, expect, test } from '@playwright/test';

const featureFlagCookieName = 'aragon.featureFlags.overrides';
const workspaceStorageKey = 'aragon-workspaces';

const setWorkspacesFlag = async (
    context: BrowserContext,
    baseURL: string,
    enabled: boolean,
) => {
    await context.addCookies([
        {
            name: featureFlagCookieName,
            value: encodeURIComponent(JSON.stringify({ workspaces: enabled })),
            url: baseURL,
        },
    ]);
};

test.describe('First-time workspace experience', () => {
    test('preserves the existing root and hides new routes when disabled', async ({
        baseURL,
        context,
        page,
    }) => {
        await setWorkspacesFlag(context, baseURL!, false);

        await page.goto('/');
        await expect(
            page.getByRole('heading', {
                level: 1,
                name: /Governed on Aragon/i,
            }),
        ).toBeVisible();

        const exploreResponse = await page.goto('/explore');
        expect(exploreResponse?.status()).toBe(404);

        const demoResponse = await page.goto('/demo');
        expect(demoResponse?.status()).toBe(404);
    });

    test.describe('when enabled', () => {
        test.beforeEach(async ({ baseURL, context }) => {
            await setWorkspacesFlag(context, baseURL!, true);
        });

        test('links the landing page to Explore and the demo workspace', async ({
            page,
        }) => {
            await page.goto('/');

            await expect(
                page.getByRole('heading', {
                    level: 1,
                    name: 'Manage your team’s onchain finances',
                }),
            ).toBeVisible();
            await expect(
                page.getByRole('button', { name: 'Continue with wallet' }),
            ).toBeVisible();

            await page
                .getByRole('link', {
                    name: 'Find your Safe or Aragon account',
                })
                .first()
                .click();
            await expect(page).toHaveURL(/\/explore(?:\?.*)?$/);
            await expect(
                page.getByRole('heading', {
                    level: 1,
                    name: /Governed on Aragon/i,
                }),
            ).toBeVisible();

            await page.goto('/');
            await page
                .getByRole('link', { name: 'See a demo workspace' })
                .first()
                .click();
            await expect(page).toHaveURL(/\/demo$/);
            await expect(
                page.getByRole('heading', {
                    level: 1,
                    name: 'Aragon workspace',
                }),
            ).toBeVisible();
        });

        test('keeps the demo read-only while its account views remain navigable', async ({
            page,
        }) => {
            await page.goto('/demo');

            await expect(
                page.getByText('Read-only demo').first(),
            ).toBeVisible();
            for (const account of [
                'Aragon X (Mainnet)',
                'Aragon Operations Safe',
                'Aragon Grants Safe',
            ]) {
                await expect(page.getByText(account).first()).toBeVisible();
            }
            expect(
                await page.evaluate(
                    (key) => localStorage.getItem(key),
                    workspaceStorageKey,
                ),
            ).toBeNull();

            await page
                .getByRole('link', { name: /Aragon X \(Mainnet\)/ })
                .last()
                .click();
            await expect(page).toHaveURL(
                /\/demo\/account\/aragon-x\/dashboard$/,
            );
            await expect(
                page.getByRole('heading', {
                    level: 1,
                    name: 'Aragon X (Mainnet)',
                }),
            ).toBeVisible();
            await page.getByRole('link', { name: 'Proposals' }).first().click();
            await expect(page).toHaveURL(
                /\/demo\/account\/aragon-x\/proposals$/,
            );
            await expect(page.getByText('MULTISIG-265')).toBeVisible();
        });

        test('creates an empty workspace and exposes both account actions', async ({
            page,
        }) => {
            await page.goto('/workspace');

            await expect(page).toHaveURL(
                /\/workspace\/my-workspace-[^/]+\/all\/overview$/,
            );
            await expect(
                page.getByRole('heading', { level: 1, name: 'My workspace' }),
            ).toBeVisible();

            const addExistingAccount = page.getByRole('link', {
                name: 'Add an existing account',
            });
            await expect(addExistingAccount).toBeVisible();
            await expect(
                page.getByRole('button', { name: 'Create a new account' }),
            ).toBeVisible();

            await addExistingAccount.click();
            await expect(page).toHaveURL(/\/edit\?step=ACCOUNTS$/);
        });

        test('opens DAO creation from the empty workspace', async ({
            page,
        }) => {
            await page.goto('/workspace');
            await page
                .getByRole('button', { name: 'Create a new account' })
                .click();

            await expect(
                page.getByRole('dialog', { name: 'Create new DAO' }),
            ).toBeVisible();
        });
    });
});

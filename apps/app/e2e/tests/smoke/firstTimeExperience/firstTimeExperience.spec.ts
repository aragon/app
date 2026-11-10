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

        test('links the landing page to the real demo workspace without an Explore CTA', async ({
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
            await expect(
                page.getByRole('link', { name: 'Explore DAOs' }),
            ).toHaveCount(0);

            await page
                .getByRole('link', { name: 'See a demo workspace' })
                .first()
                .click();
            await expect(page).toHaveURL(
                /\/workspace\/aragon-demo\/all\/overview$/,
            );
            await expect(
                page.getByRole('heading', { level: 1, name: 'Aragon' }),
            ).toBeVisible();
        });

        test('installs the demo fixture and keeps normal workspace navigation working', async ({
            page,
        }) => {
            await page.goto('/demo');

            await expect(page).toHaveURL(
                /\/workspace\/aragon-demo\/all\/overview$/,
            );
            await expect
                .poll(async () =>
                    page.evaluate((key) => {
                        const registry = JSON.parse(
                            localStorage.getItem(key) ?? '{}',
                        ) as Record<string, { isDemo?: boolean }>;
                        return registry['aragon-demo']?.isDemo;
                    }, workspaceStorageKey),
                )
                .toBe(true);
            await expect(
                page.getByRole('button', { name: 'Read-Only Demo' }).first(),
            ).toBeDisabled();
            await expect(
                page.getByRole('link', { name: 'Edit workspace' }),
            ).toHaveCount(0);

            await page
                .getByRole('link', { name: /Aragon X \(Mainnet\)/ })
                .last()
                .click();
            await expect(page).toHaveURL(
                /\/workspace\/aragon-demo\/ethereum-mainnet-0x9c25a6b1bf3F6Fd2F68a62169c043045C2460482\/overview(?:\?.*)?$/,
            );
            await page.getByRole('link', { name: 'Proposals' }).first().click();
            await expect(page).toHaveURL(
                /\/workspace\/aragon-demo\/ethereum-mainnet-0x9c25a6b1bf3F6Fd2F68a62169c043045C2460482\/proposals(?:\?.*)?$/,
            );
            await expect(
                page.getByRole('button', { name: 'New proposal' }),
            ).toHaveCount(0);
            await page
                .getByRole('link', { name: 'Transactions' })
                .first()
                .click();
            await expect(
                page.getByRole('button', { name: 'New transaction' }),
            ).toHaveCount(0);
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

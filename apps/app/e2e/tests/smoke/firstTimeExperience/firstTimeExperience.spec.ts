import { type BrowserContext, expect, test } from '@playwright/test';
import workspaceDemoFixture from '../../../../src/modules/workspace/fixtures/workspaceDemo.fixture.json';

const featureFlagCookieName = 'aragon.featureFlags.overrides';
const workspaceStorageKey = 'aragon-workspaces';
const aragonDemoName = workspaceDemoFixture['aragon-demo'].name;
const xmaquinaDemoName = workspaceDemoFixture['xmaquina-demo'].name;

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

        test('links the landing page to the real demo workspace without an Explore DAOs CTA', async ({
            page,
        }) => {
            await page.goto('/');

            await expect(
                page.getByRole('heading', {
                    level: 1,
                    name: 'Your team’s onchain finances, in one place',
                }),
            ).toBeVisible();
            await expect(
                page.getByRole('button', { name: 'Continue with wallet' }),
            ).toBeVisible();
            await expect(
                page.getByRole('link', { name: 'Explore DAOs' }),
            ).toHaveCount(0);

            await page
                .getByRole('link', { name: 'Explore a demo workspace' })
                .click();
            await expect(page).toHaveURL(
                /\/workspace\/aragon-demo\/all\/overview$/,
            );
            await expect(
                page.getByRole('heading', {
                    level: 1,
                    name: aragonDemoName,
                }),
            ).toBeVisible();
        });

        test('installs the fixture from a copied demo account link in a fresh tab', async ({
            page,
        }) => {
            await page.goto(
                '/workspace/aragon-demo/polygon-mainnet-0x311Ff044882bf953cA3A70867f5B1836C2a9b76B/overview',
            );

            await expect(
                page.getByRole('heading', {
                    level: 1,
                    name: 'Polygon Safe',
                }),
            ).toBeVisible();
        });

        test('does not treat nested demo paths as the installer', async ({
            page,
        }) => {
            const response = await page.goto('/demo/not-a-route');

            expect(response?.status()).toBe(404);
        });

        test('opens a valid workspace after replacing differently-IDed or blank registries', async ({
            baseURL,
            context,
            page,
        }) => {
            await context.addCookies([
                {
                    name: featureFlagCookieName,
                    value: encodeURIComponent(
                        JSON.stringify({
                            debugPanel: true,
                            workspaces: true,
                        }),
                    ),
                    url: baseURL!,
                },
            ]);
            await page.goto('/');
            await page.evaluate(
                ([key, registry]) =>
                    localStorage.setItem(key, JSON.stringify(registry)),
                [
                    workspaceStorageKey,
                    {
                        'my-workspace-12345678': {
                            id: 'my-workspace-12345678',
                            name: 'Old workspace',
                            description: '',
                            avatar: null,
                            links: [],
                            accounts: [],
                            targets: [],
                        },
                    },
                ],
            );
            await page.goto('/workspace/my-workspace-12345678/all/overview');
            await page.locator('button[class*="bottom-18"]').click();
            await expect(
                page.getByRole('heading', { name: 'Workspace registry' }),
            ).toBeVisible();
            const debugHeadings = await page
                .getByRole('heading', { level: 3 })
                .allTextContents();
            expect(debugHeadings.indexOf('Workspace registry')).toBeLessThan(
                debugHeadings.indexOf('Simulation'),
            );

            const downloadPromise = page.waitForEvent('download');
            await page.getByRole('button', { name: 'Export JSON' }).click();
            const download = await downloadPromise;
            expect(download.suggestedFilename()).toMatch(
                /^aragon-workspaces-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}Z\.json$/,
            );

            page.once('dialog', (dialog) => dialog.accept());
            await page.locator('input[type="file"]').setInputFiles({
                name: 'aragon-workspaces.json',
                mimeType: 'application/json',
                buffer: Buffer.from(
                    JSON.stringify({
                        'imported-workspace': {
                            id: 'imported-workspace',
                            name: 'Imported workspace',
                            description: '',
                            avatar: null,
                            links: [],
                            accounts: [],
                            targets: [],
                        },
                    }),
                ),
            });

            await expect(page).toHaveURL(
                /\/workspace\/imported-workspace\/all\/overview$/,
            );
            await expect(
                page.getByRole('heading', {
                    level: 1,
                    name: 'Imported workspace',
                }),
            ).toBeVisible();

            await page.locator('button[class*="bottom-18"]').click();
            page.once('dialog', (dialog) => dialog.accept());
            await page.locator('input[type="file"]').setInputFiles({
                name: 'blank-aragon-workspaces.json',
                mimeType: 'application/json',
                buffer: Buffer.from('{}'),
            });

            await expect(page).toHaveURL(
                /\/workspace\/my-workspace-[a-f0-9]{8}\/all\/overview$/,
            );
            await expect(
                page.getByRole('heading', {
                    level: 1,
                    name: 'My workspace',
                }),
            ).toBeVisible();
        });

        test('installs the demo fixture and keeps normal workspace navigation working', async ({
            page,
        }) => {
            await page.goto('/workspace');
            await expect(page).toHaveURL(
                /\/workspace\/my-workspace-[a-f0-9]{8}\/all\/overview$/,
            );

            await page.goto('/');
            await page
                .getByRole('link', { name: 'Explore a demo workspace' })
                .first()
                .click();

            await expect(page).toHaveURL(
                /\/workspace\/aragon-demo\/all\/overview$/,
            );
            await expect(
                page.getByRole('link', { name: 'Edit workspace' }),
            ).toBeVisible();
            const polygonSafe = page
                .getByRole('link', { name: /Polygon Safe/ })
                .last();
            await expect(polygonSafe).toBeVisible();
            await polygonSafe.click();
            await expect(page).toHaveURL(
                /\/workspace\/aragon-demo\/polygon-mainnet-0x311Ff044882bf953cA3A70867f5B1836C2a9b76B\/overview(?:\?.*)?$/,
            );
            await expect(
                page.getByRole('heading', {
                    level: 1,
                    name: 'Polygon Safe',
                }),
            ).toBeVisible();

            await page
                .getByRole('button', {
                    name: /Polygon Safe 0x311F…b76B/,
                })
                .click();
            await page
                .getByRole('menuitem', { name: /Aragon X \(Mainnet\)/ })
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
            ).toBeVisible();
            await page
                .getByRole('link', { name: 'Transactions' })
                .first()
                .click();
            await page
                .getByRole('button', {
                    exact: true,
                    name: `avatar ${aragonDemoName}`,
                })
                .click();
            await expect(
                page.getByRole('menuitem', { name: 'Create workspace' }),
            ).toBeVisible();
            await expect(
                page.getByRole('menuitem', { name: 'My workspace' }),
            ).toHaveCount(0);
            await expect(
                page.getByRole('menuitem', { name: /Cryptex/i }),
            ).toHaveCount(0);
            await page
                .getByRole('menuitem', { name: xmaquinaDemoName })
                .click();
            await expect(page).toHaveURL(
                /\/workspace\/xmaquina-demo\/all\/overview$/,
            );
            await expect(
                page.getByRole('heading', {
                    level: 1,
                    name: xmaquinaDemoName,
                }),
            ).toBeVisible();
            await expect(
                page.getByRole('link', { name: /Polygon Safe/ }).last(),
            ).toBeVisible();

            await page.goto('/workspace');
            await expect(page).toHaveURL(
                /\/workspace\/my-workspace-[a-f0-9]{8}\/all\/overview$/,
            );
            await expect(
                page.getByRole('heading', {
                    level: 1,
                    name: 'My workspace',
                }),
            ).toBeVisible();
            await page.getByRole('button', { name: /My workspace/ }).click();
            await expect(
                page.getByRole('menuitem', { name: aragonDemoName }),
            ).toHaveCount(0);
            await expect(
                page.getByRole('menuitem', { name: xmaquinaDemoName }),
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

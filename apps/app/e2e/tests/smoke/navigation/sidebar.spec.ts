import { SMOKE_DAOS } from '@e2e/helpers';
import { type BrowserContext, expect, type Page, test } from '@playwright/test';

// The sidebar ships behind the `workspaces` flag, which defaults off outside local: the override cookie turns it on
// wherever the suite runs (the server merges it over the CMS and the defaults).
const enableWorkspaces = async (context: BrowserContext, baseURL: string) => {
    await context.addCookies([
        {
            name: 'aragon.featureFlags.overrides',
            value: encodeURIComponent(JSON.stringify({ workspaces: true })),
            url: baseURL,
        },
    ]);
};

const dao = SMOKE_DAOS.find(({ name }) => name === 'Swiss Shield DAO')!;
const daoUrl = `/dao/${dao.network}/${dao.address}`;

// The sidebar is the only navigation listing the DAO settings outside the dialog.
const daoSidebar = (page: Page) =>
    page.getByRole('navigation').filter({
        has: page.getByRole('link', { name: 'Settings', exact: true }),
    });

test.describe('Sidebar navigation', () => {
    test.beforeEach(async ({ context, baseURL }) => {
        await enableWorkspaces(context, baseURL!);
    });

    test.describe('desktop', () => {
        test.use({ viewport: { width: 1440, height: 900 } });

        test('replaces the navigation bar and the page footer on the DAO pages', async ({
            page,
        }) => {
            await page.goto(`${daoUrl}/dashboard`);

            const sidebar = daoSidebar(page);
            await expect(sidebar).toBeVisible();
            for (const name of ['Dashboard', 'Assets', 'Transactions']) {
                await expect(
                    sidebar.getByRole('link', { name, exact: true }),
                ).toBeVisible();
            }
            await expect(sidebar.getByText('Governed on')).toBeVisible();
            await expect(
                sidebar.getByRole('link', { name: 'Explore all DAOs' }),
            ).toHaveAttribute('href', '/');
            // The DAO heads the sidebar as it heads the dialog, rather than as a button opening that same dialog.
            await expect(
                sidebar.getByText(dao.name, { exact: true }),
            ).toBeVisible();
            await expect(
                sidebar.getByRole('button', { name: dao.name }),
            ).toHaveCount(0);
            await expect(page.getByRole('contentinfo')).toBeHidden();

            await sidebar
                .getByRole('link', { name: 'Assets', exact: true })
                .click();
            await expect(page).toHaveURL(new RegExp(`${daoUrl}/assets`));
            await expect(daoSidebar(page)).toBeVisible();
        });

        test('lists the workspace sections and its settings on the workspace pages', async ({
            page,
        }) => {
            // The workspace registry is a local-storage mock for now, so the workspace is seeded before the app loads.
            const workspace = {
                id: 'e2e-sidebar',
                name: 'E2E Sidebar Workspace',
                description: '',
                avatar: null,
                links: [],
                targets: [],
                accounts: [
                    {
                        id: 'ethereum-mainnet-0xf204245b0B05E9A0780761E326552A569c1D6ceb',
                        type: 'DAO',
                        address: '0xf204245b0B05E9A0780761E326552A569c1D6ceb',
                        network: 'ethereum-mainnet',
                    },
                ],
            };
            await page.addInitScript((value) => {
                localStorage.setItem(
                    'aragon-workspaces',
                    JSON.stringify({ [value.id]: value }),
                );
            }, workspace);

            await page.goto(`/workspace/${workspace.id}/all/overview`);

            const sidebar = page.getByRole('navigation').filter({
                has: page.getByRole('link', { name: 'Edit workspace' }),
            });
            await expect(sidebar).toBeVisible();
            await expect(
                sidebar.getByRole('link', { name: 'Proposals', exact: true }),
            ).toHaveAttribute(
                'href',
                `/workspace/${workspace.id}/all/proposals`,
            );
            await expect(
                sidebar.getByRole('link', { name: 'Edit workspace' }),
            ).toHaveAttribute('href', `/workspace/${workspace.id}/edit`);
            await expect(page.getByRole('contentinfo')).toBeHidden();
            // Permissions and settings belong to a DAO account: the aggregated scope has neither.
            await expect(
                sidebar.getByRole('link', { name: 'Settings', exact: true }),
            ).toHaveCount(0);

            const [account] = workspace.accounts;
            await page.goto(
                `/workspace/${workspace.id}/${account.id}/settings`,
            );
            for (const section of ['permissions', 'settings']) {
                await expect(
                    sidebar.getByRole('link', {
                        name:
                            section === 'settings' ? 'Settings' : 'Permissions',
                        exact: true,
                    }),
                ).toHaveAttribute(
                    'href',
                    `/workspace/${workspace.id}/${account.id}/${section}`,
                );
            }
            // The DAO settings page renders, not the gate's error state or the section-not-found page.
            await expect(
                page.getByRole('heading', { name: 'Account', exact: true }),
            ).toBeVisible();
        });
    });

    test.describe('mobile', () => {
        test.use({ viewport: { width: 390, height: 844 } });

        test('keeps the hamburger menu and the page footer', async ({
            page,
        }) => {
            await page.goto(`${daoUrl}/dashboard`);

            await expect(daoSidebar(page)).toBeHidden();
            await expect(page.getByRole('contentinfo')).toBeVisible();

            // The hamburger has no accessible name, so it is found by its menu icon. The click is retried because
            // the page may still be hydrating.
            const hamburger = page
                .getByRole('navigation')
                .getByRole('button')
                .filter({ has: page.getByTestId('MENU') });
            const dialog = page.getByRole('dialog', {
                name: 'DAO navigation menu',
            });
            await expect(async () => {
                await hamburger.click();
                await expect(dialog).toBeVisible({ timeout: 2000 });
            }).toPass();
            await expect(
                dialog.getByRole('link', { name: 'Settings', exact: true }),
            ).toBeVisible();
        });
    });

    test.describe('tablet', () => {
        // Below `lg` too, where the hamburger is hidden and the DAO home button, now carrying the DAO name, opens the
        // dialog.
        test.use({ viewport: { width: 800, height: 900 } });

        test('keeps the navigation bar, its dialog and the page footer', async ({
            page,
        }) => {
            await page.goto(`${daoUrl}/dashboard`);

            await expect(daoSidebar(page)).toBeHidden();
            await expect(page.getByRole('contentinfo')).toBeVisible();

            // The click is retried because the page may still be hydrating.
            const dialog = page.getByRole('dialog', {
                name: 'DAO navigation menu',
            });
            await expect(async () => {
                await page
                    .getByRole('navigation')
                    .getByRole('button', { name: dao.name })
                    .click();
                await expect(dialog).toBeVisible({ timeout: 2000 });
            }).toPass();
            await expect(
                dialog.getByRole('link', { name: 'Settings', exact: true }),
            ).toBeVisible();
        });
    });
});

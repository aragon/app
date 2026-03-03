import { DaoPage, SMOKE_DAOS } from '@e2e/helpers';
import { expect, test } from '@playwright/test';

const tabs = [
    { path: 'proposals', heading: 'Proposals' },
    { path: 'members', heading: 'Members' },
    { path: 'assets', heading: 'Assets' },
    { path: 'transactions', heading: 'Transactions' },
];

for (const dao of SMOKE_DAOS.slice(0, 3)) {
    for (const tab of tabs) {
        test(`[${dao.name}] ${tab.heading} tab loads`, async ({ page }) => {
            const daoPage = new DaoPage({
                page,
                network: dao.network,
                address: dao.address,
                path: tab.path,
            });
            await daoPage.navigate();

            await expect(
                page.getByRole('heading', { name: tab.heading }).first(),
            ).toBeVisible();
            await expect(page.getByRole('main')).toBeVisible();
            expect(page.url()).toContain(tab.path);
        });
    }
}

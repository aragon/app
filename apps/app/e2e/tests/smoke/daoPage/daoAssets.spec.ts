import { DaoAssetsPage, SMOKE_DAOS } from '@e2e/helpers';
import { expect, test } from '@playwright/test';

for (const dao of SMOKE_DAOS) {
    test(`Assets page renders [${dao.name}]`, async ({ page }) => {
        const assets = await new DaoAssetsPage({
            page,
            network: dao.network,
            address: dao.address,
        }).navigate();

        await expect.soft(assets.pageTitle()).toBeVisible();
        await expect.soft(assets.mainContent()).toBeVisible();
        await expect.soft(assets.asideCard()).toBeVisible();
    });
}

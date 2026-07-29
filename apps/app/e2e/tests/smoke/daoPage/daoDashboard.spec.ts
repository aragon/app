import { DaoDashboardPage, SMOKE_DAOS } from '@e2e/helpers';
import { expect, test } from '@playwright/test';

for (const dao of SMOKE_DAOS) {
    test(`Dashboard renders [${dao.name}]`, async ({ page }) => {
        const dashboard = await new DaoDashboardPage({
            page,
            network: dao.network,
            address: dao.address,
        }).navigate();

        await expect.soft(dashboard.mainContent()).toBeVisible();
        await expect.soft(dashboard.assetsHeading()).toBeVisible();
        await expect.soft(dashboard.asideCard()).toBeVisible();
        await expect.soft(dashboard.contractCard()).toBeVisible();
    });
}

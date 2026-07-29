import { DaoGaugesPage, getDaosWithFeature } from '@e2e/helpers';
import { expect, test } from '@playwright/test';

const gaugesDaos = getDaosWithFeature('gauges');

for (const dao of gaugesDaos) {
    test(`Gauges page renders [${dao.name}]`, async ({ page }) => {
        const gauges = await new DaoGaugesPage({
            page,
            network: dao.network,
            address: dao.address,
        }).navigate();

        await expect.soft(gauges.mainContent()).toBeVisible();
        await expect.soft(gauges.mainContent()).not.toBeEmpty();
        await expect.soft(gauges.asideCards()).toBeVisible();
    });
}

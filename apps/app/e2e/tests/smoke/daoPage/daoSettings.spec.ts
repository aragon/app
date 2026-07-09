import {
    DaoProcessDetailPage,
    DaoSettingsPage,
    SMOKE_DAOS,
} from '@e2e/helpers';
import { expect, test } from '@playwright/test';

for (const dao of SMOKE_DAOS) {
    test(`Settings page renders [${dao.name}]`, async ({ page }) => {
        const settings = await new DaoSettingsPage({
            page,
            network: dao.network,
            address: dao.address,
        }).navigate();

        await expect.soft(settings.pageTitle()).toBeVisible();
        await expect.soft(settings.daoInfoSection()).toBeVisible();
        await expect.soft(settings.asideVersionCard()).toBeVisible();
    });

    test(`Governance process detail renders [${dao.name}]`, async ({
        page,
    }) => {
        const settings = await new DaoSettingsPage({
            page,
            network: dao.network,
            address: dao.address,
        }).navigate();

        const firstProcessLink = settings.firstProcess();
        await expect(firstProcessLink).toBeVisible();

        const href = await firstProcessLink.getAttribute('href');
        expect(href).toBeTruthy();
        expect(href).toMatch(/\/settings\//);

        await page.goto(href as string, { waitUntil: 'domcontentloaded' });

        const processDetail = new DaoProcessDetailPage(page);
        await expect.soft(processDetail.settingsBreadcrumb()).toBeVisible();
        await expect
            .soft(processDetail.governanceProcessSection())
            .toBeVisible();
        await expect.soft(processDetail.detailsAsideCard()).toBeVisible();
    });
}

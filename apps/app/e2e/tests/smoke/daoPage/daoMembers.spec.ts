import { DaoMembersPage, SMOKE_DAOS } from '@e2e/helpers';
import { expect, test } from '@playwright/test';

for (const dao of SMOKE_DAOS) {
    test(`Members page renders [${dao.name}]`, async ({ page }) => {
        const members = await new DaoMembersPage({
            page,
            network: dao.network,
            address: dao.address,
        }).navigate();

        await expect.soft(members.pageTitle()).toBeVisible();
        await expect.soft(members.firstMember()).toBeVisible();
        await expect.soft(members.asideCard()).toBeVisible();
    });
}

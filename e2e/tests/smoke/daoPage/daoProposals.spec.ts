import { DaoProposalsPage, SMOKE_DAOS } from '@e2e/helpers';
import { expect, test } from '@playwright/test';

for (const dao of SMOKE_DAOS) {
    test(`Proposals page renders [${dao.name}]`, async ({ page }) => {
        const proposals = await new DaoProposalsPage({
            page,
            network: dao.network,
            address: dao.address,
        }).navigate();

        await expect.soft(proposals.pageTitle()).toBeVisible();
        await expect
            .soft(proposals.firstProposal())
            .toBeVisible({ timeout: 30_000 });
        await expect.soft(proposals.asideCard()).toBeVisible();
    });
}

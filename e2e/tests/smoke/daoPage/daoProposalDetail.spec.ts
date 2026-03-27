import {
    DaoProposalDetailPage,
    DaoProposalsPage,
    SMOKE_DAOS,
} from '@e2e/helpers';
import { expect, test } from '@playwright/test';

for (const dao of SMOKE_DAOS) {
    test(`Proposal detail renders [${dao.name}]`, async ({ page }) => {
        const proposals = await new DaoProposalsPage({
            page,
            network: dao.network,
            address: dao.address,
        }).navigate();

        const firstProposalLink = proposals.firstProposal();
        await expect(firstProposalLink).toBeVisible({ timeout: 30_000 });

        const href = await firstProposalLink.getAttribute('href');
        expect(href).toBeTruthy();
        expect(href).toMatch(/\/proposals\//);

        await page.goto(href as string, { waitUntil: 'domcontentloaded' });

        const detail = new DaoProposalDetailPage(page);
        await expect.soft(detail.proposalTitle()).toBeVisible();
        await expect.soft(detail.proposalTitle()).not.toBeEmpty();
        await expect.soft(detail.mainContent()).toBeVisible();
        await expect.soft(detail.detailsAsideCard()).toBeVisible();
    });
}

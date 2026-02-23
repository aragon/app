import { DaoMembersPage, MemberDetailsPage, SMOKE_DAOS } from '@e2e/helpers';
import { expect, test } from '@playwright/test';

const testDao = SMOKE_DAOS.find((dao) => dao.name === 'Ethereum')!;

test.describe('Member profile', () => {
    let details: MemberDetailsPage;

    test.beforeEach(async ({ page }) => {
        const membersPage = await new DaoMembersPage({
            page,
            network: testDao.network,
            address: testDao.address,
        }).navigate();

        await expect(membersPage.pageTitle()).toBeVisible();
        await membersPage.firstMember().click();
        await page.waitForURL(/\/members\/0x/);

        details = new MemberDetailsPage(page);
    });

    test('shows voting activity and proposal creation sections', async () => {
        await expect(details.votingActivity()).toBeVisible();
        await expect(details.proposalCreation()).toBeVisible();
    });

    test('shows details aside with address info', async () => {
        await expect(details.detailsCard()).toBeVisible();
    });
});

import { DaoDashboardPage, SMOKE_DAOS } from '@e2e/helpers';
import { expect, test } from '@playwright/test';

for (const dao of SMOKE_DAOS) {
    test.describe(`Dashboard [${dao.name}]`, () => {
        let dashboard: DaoDashboardPage;

        test.beforeEach(async ({ page }) => {
            dashboard = await new DaoDashboardPage({
                page,
                network: dao.network,
                address: dao.address,
            }).navigate();
        });

        test('renders DAO header with name and avatar', async () => {
            await expect(dashboard.daoName()).toBeVisible();
            await expect(dashboard.daoName()).not.toBeEmpty();
            await expect(dashboard.daoAvatar()).toBeVisible();
        });

        test('shows stats row', async () => {
            await expect(dashboard.proposalsStat()).toBeVisible();
            await expect(dashboard.membersStat()).toBeVisible();
            await expect(dashboard.treasuryStat()).toBeVisible();
        });

        test('renders main content sections', async () => {
            await expect(dashboard.latestProposalsHeading()).toBeVisible();
            await expect(dashboard.membersHeading()).toBeVisible();
            await expect(dashboard.assetsHeading()).toBeVisible();
        });

        test('shows contract and resources aside', async () => {
            await expect(dashboard.contractCard()).toBeVisible();
            await expect(dashboard.resourcesCard()).toBeVisible();
        });
    });
}

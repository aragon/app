import { DaoRewardsPage, getDaosWithFeature } from '@e2e/helpers';
import { expect, test } from '@playwright/test';

const rewardsDaos = getDaosWithFeature('rewards');

for (const dao of rewardsDaos) {
    test(`Rewards page renders [${dao.name}]`, async ({ page }) => {
        const rewards = await new DaoRewardsPage({
            page,
            network: dao.network,
            address: dao.address,
        }).navigate();

        await expect.soft(rewards.mainContent()).toBeVisible();
        await expect.soft(rewards.mainContent()).not.toBeEmpty();
        await expect.soft(rewards.asideCard()).toBeVisible();
    });
}

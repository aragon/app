import { DaoTransactionsPage, SMOKE_DAOS } from '@e2e/helpers';
import { expect, test } from '@playwright/test';

for (const dao of SMOKE_DAOS) {
    test(`Transactions page renders [${dao.name}]`, async ({ page }) => {
        const transactions = await new DaoTransactionsPage({
            page,
            network: dao.network,
            address: dao.address,
        }).navigate();

        if (transactions.isVercelError()) {
            await transactions.attachErrorContext(test.info());
            // biome-ignore lint/suspicious/noSkippedTests: runtime skip for Vercel platform errors (e.g. FUNCTION_INVOCATION_TIMEOUT)
            test.skip(true, 'Vercel platform error');
        }

        await expect.soft(transactions.pageTitle()).toBeVisible();
        await expect.soft(transactions.mainContent()).toBeVisible();
        await expect.soft(transactions.asideCard()).toBeVisible();
    });
}

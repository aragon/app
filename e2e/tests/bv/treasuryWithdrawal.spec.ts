import {
    BV_DAOS,
    confirmGovernanceTransactionDialog,
    createAndPublishMultisigWithdrawProposal,
    DaoAssetsPage,
    DaoProposalDetailPage,
    DaoTransactionsPage,
    ensureBvDaoSession,
    expectProposalActionsDecoded,
    getConnectedWalletAddress,
    sendNativeEthFromConnectedPage,
} from '@e2e/helpers';
import { expect, test } from '@e2e/setup';

const dao = BV_DAOS.testAndr;
const DEPOSIT_ETH = '0.0001';
const WITHDRAW_ETH = '0.00005';

/** Populated when running the full serial suite; individual runs use BV_E2E_* env vars. */
const shared: {
    proposalTitle?: string;
    proposalUrl?: string;
} = {};

test.describe
    .serial('Multisig treasury withdrawal', () => {
        test.describe.configure({ timeout: 300_000 });

        test('funds DAO treasury (deposit) and verifies Assets + Transactions', async ({
            page,
            metamask,
        }) => {
            await ensureBvDaoSession(page, metamask, dao);

            await sendNativeEthFromConnectedPage(page, metamask, {
                to: dao.address,
                amountEth: DEPOSIT_ETH,
            });

            const assets = new DaoAssetsPage({
                page,
                network: dao.network,
                address: dao.address,
            });
            await assets.navigate();
            await expect(assets.pageTitle()).toBeVisible();
            await expect(assets.mainContent().getByText(/ETH/)).toBeVisible({
                timeout: 25_000,
            });

            const transactions = new DaoTransactionsPage({
                page,
                network: dao.network,
                address: dao.address,
            });
            await transactions.navigate();
            await expect(transactions.pageTitle()).toBeVisible();
            await expect(transactions.mainContent()).not.toBeEmpty();
        });

        test('creates multisig withdraw proposal and shows decoded actions', async ({
            page,
            metamask,
        }) => {
            await ensureBvDaoSession(page, metamask, dao);

            const receiverAddress = await getConnectedWalletAddress(page);

            const { title, url } =
                await createAndPublishMultisigWithdrawProposal(
                    page,
                    metamask,
                    dao,
                    {
                        receiverAddress,
                        amountEth: WITHDRAW_ETH,
                    },
                );
            shared.proposalTitle = title;
            shared.proposalUrl = url;

            const detail = new DaoProposalDetailPage(page);
            await expect(detail.proposalTitle()).toHaveText(title, {
                timeout: 30_000,
            });
            await expectProposalActionsDecoded(page);
        });

        test('approves the multisig proposal', async ({ page, metamask }) => {
            const title =
                shared.proposalTitle ??
                process.env.BV_E2E_PROPOSAL_TITLE?.trim();
            const url =
                shared.proposalUrl ?? process.env.BV_E2E_PROPOSAL_URL?.trim();
            if (!title || !url) {
                throw new Error(
                    'Set BV_E2E_PROPOSAL_TITLE and BV_E2E_PROPOSAL_URL in e2e/.env, or run the suite from the first test',
                );
            }

            await ensureBvDaoSession(page, metamask, dao);
            await page.goto(url);

            await expect(
                new DaoProposalDetailPage(page).proposalTitle(),
            ).toHaveText(title, { timeout: 30_000 });

            await page
                .getByRole('button', { name: 'Approve proposal', exact: true })
                .click();
            await confirmGovernanceTransactionDialog(page, metamask);

            await expect(
                page.getByRole('button', { name: 'Execute', exact: true }),
            ).toBeVisible({ timeout: 120_000 });
        });

        test('executes the proposal on-chain', async ({ page, metamask }) => {
            const url =
                shared.proposalUrl ?? process.env.BV_E2E_PROPOSAL_URL?.trim();
            if (!url) {
                throw new Error(
                    'Set BV_E2E_PROPOSAL_URL in e2e/.env, or run the suite from the first test',
                );
            }

            await ensureBvDaoSession(page, metamask, dao);
            await page.goto(url);

            const executeBtn = page.getByRole('button', {
                name: 'Execute',
                exact: true,
            });
            await expect(executeBtn).toBeVisible({ timeout: 120_000 });
            await executeBtn.click();
            await confirmGovernanceTransactionDialog(page, metamask);

            await expect(
                page.getByRole('button', { name: 'Executed', exact: true }).or(
                    page.getByRole('link', {
                        name: 'Executed',
                        exact: true,
                    }),
                ),
            ).toBeVisible({ timeout: 120_000 });
        });

        test('shows Withdraw in transactions after execution', async ({
            page,
            metamask,
        }) => {
            await ensureBvDaoSession(page, metamask, dao);

            const transactions = new DaoTransactionsPage({
                page,
                network: dao.network,
                address: dao.address,
            });
            await transactions.navigate();

            await expect(transactions.pageTitle()).toBeVisible();
            const mainTx = transactions.mainContent();
            await expect(mainTx).not.toBeEmpty();

            await expect(
                mainTx.locator('[data-testid="WITHDRAW"]').first(),
            ).toBeVisible({ timeout: 60_000 });
            await expect(
                mainTx.getByText('Withdraw', { exact: true }).first(),
            ).toBeVisible();
        });
    });

import { expect, type Page } from '@playwright/test';
import type { MetaMask } from '@synthetixio/synpress/playwright';
import { getAddress } from 'viem';
import type { BvMultisigTreasuryDao } from '../constants/bvDaos';
import { DaoProposalDetailPage } from '../pages/daoProposalDetailPage/daoProposalDetailPage';
import { DaoProposalsPage } from '../pages/daoProposalsPage/daoProposalsPage';
import { WalletConnectionPage } from '../shared/walletConnectionPage/walletConnectionPage';
import {
    signTransactionInDappDialog,
    switchNetwork,
} from '../utils/metamaskUtils';

const CREATE_PROPOSAL_FORM = '#createProposalWizard';

/**
 * Advance past the Actions step by choosing "Skip simulation" from the split-button menu.
 * Scoped to the menu containing that item to avoid ambiguity with other open menus.
 */
async function advanceFromActionsStepSkippingSimulation(
    page: Page,
): Promise<void> {
    const footerPrimary = page
        .locator(CREATE_PROPOSAL_FORM)
        .locator('div.flex.flex-row.justify-between')
        .last()
        .getByRole('button')
        .last();
    await footerPrimary.click();
    const actionsFooterMenu = page
        .getByRole('menu')
        .filter({
            has: page.getByRole('menuitem', {
                name: 'Skip simulation',
                exact: true,
            }),
        })
        .last();
    await actionsFooterMenu.waitFor({ state: 'visible', timeout: 15_000 });
    await page
        .locator('button[type="submit"][form="createProposalWizard"]')
        .filter({ hasText: 'Skip simulation' })
        .click();
    await expect(
        page
            .getByRole('dialog', { name: 'Publish proposal' })
            .or(page.getByRole('heading', { name: /Proposal settings/i })),
    ).toBeVisible({ timeout: 30_000 });
}

export async function ensureBvDaoSession(
    page: Page,
    metamask: MetaMask,
    dao: BvMultisigTreasuryDao,
): Promise<void> {
    const walletPage = new WalletConnectionPage({
        page,
        path: `/dao/${dao.network}/${dao.address}/dashboard`,
    });
    await walletPage.navigate();
    await walletPage.connectWallet(metamask);
    await switchNetwork(page, metamask, 'Sepolia');
}

export async function waitForProposalsMemberGate(page: Page): Promise<void> {
    await page.waitForResponse(
        (res) =>
            /\/v2\/members\/[^/]+\/[^/]+\/exists(?:\?|$)/.test(res.url()) &&
            res.ok(),
        { timeout: 25_000 },
    );
}

export async function openMultisigProposalWizard(page: Page): Promise<void> {
    await page
        .getByRole('main')
        .getByRole('button', { name: 'Proposal', exact: true })
        .click();

    try {
        await page
            .getByRole('dialog')
            .waitFor({ state: 'visible', timeout: 10_000 });
    } catch {
        // Single-process plugin: navigates straight to the create URL.
    }

    const dialog = page.getByRole('dialog');
    if (await dialog.isVisible().catch(() => false)) {
        await dialog.getByText('Multisig', { exact: true }).click();
        await dialog.getByRole('button', { name: 'Create proposal' }).click();
    }

    await expect(page).toHaveURL(/\/create\/.*\/proposal/, { timeout: 25_000 });
}

/** Fill the multisig native ETH withdrawal proposal form (title → actions → recipient → amount). */
export async function fillMultisigNativeWithdrawProposal(
    page: Page,
    {
        proposalTitle,
        receiverAddress,
        amountEth,
    }: {
        proposalTitle: string;
        receiverAddress: string;
        amountEth: string;
    },
): Promise<void> {
    const checksummedReceiver = getAddress(receiverAddress as `0x${string}`);
    const wizardForm = page.locator(CREATE_PROPOSAL_FORM);

    await expect(page.getByLabel('Proposal title')).toBeVisible({
        timeout: 25_000,
    });
    await page.getByLabel('Proposal title').fill(proposalTitle);

    await page.getByRole('button', { name: 'Next', exact: true }).click();

    const addActionBtn = wizardForm.getByRole('button', {
        name: 'Action',
        exact: true,
    });
    await expect(addActionBtn).toBeVisible({ timeout: 25_000 });
    await addActionBtn.click();

    const actionSearch = page.getByPlaceholder(
        /Search by action, contract name, or address/i,
    );
    await expect(actionSearch).toBeVisible({ timeout: 15_000 });
    await actionSearch.fill('Transfer');
    const transferOption = page.getByRole('option', {
        name: 'Transfer',
        exact: true,
    });
    await expect(transferOption).toBeVisible({ timeout: 15_000 });
    await transferOption.click();

    const assetTrigger = wizardForm.getByRole('button', {
        name: 'Select',
        exact: true,
    });
    await expect(assetTrigger).toBeVisible({ timeout: 20_000 });
    await assetTrigger.click();

    const assetDialog = page.getByRole('dialog', { name: 'Select an asset' });
    await expect(assetDialog).toBeVisible({ timeout: 20_000 });
    await expect(
        assetDialog.getByText(/ETH|Ether|Ethereum/i).first(),
    ).toBeVisible({ timeout: 25_000 });
    await assetDialog
        .getByText(/^(Ether|Ethereum|ETH)$/)
        .first()
        .click();
    await expect(assetDialog).toBeHidden({ timeout: 15_000 });

    await expect(
        wizardForm.getByRole('button', { name: 'Max', exact: true }),
    ).toBeVisible({ timeout: 30_000 });

    const amountField = wizardForm.getByRole('spinbutton');
    await expect(amountField).toBeEnabled({ timeout: 15_000 });
    await amountField.fill(amountEth);
    await amountField.blur();
    await expect(amountField).toHaveValue(amountEth, { timeout: 10_000 });

    const recipientField = wizardForm.getByPlaceholder(/ENS or 0x/i);
    await recipientField.click();
    await recipientField.fill(checksummedReceiver);
    await recipientField.blur();
    // AddressInput debounces 300 ms before committing the value.
    await page.waitForTimeout(400);
    await expect(
        wizardForm
            .getByText(new RegExp(checksummedReceiver.slice(0, 6), 'i'))
            .first(),
    ).toBeVisible({ timeout: 20_000 });
    await page
        .getByRole('heading', { name: 'Add actions', exact: true })
        .click();

    await advanceFromActionsStepSkippingSimulation(page);

    const publishDialog = page.getByRole('dialog', {
        name: 'Publish proposal',
    });
    if (!(await publishDialog.isVisible().catch(() => false))) {
        await page
            .locator(CREATE_PROPOSAL_FORM)
            .getByRole('button', { name: 'Publish proposal', exact: true })
            .click();
        await expect(publishDialog).toBeVisible({ timeout: 30_000 });
    }
}

export async function expectProposalActionsDecoded(page: Page): Promise<void> {
    const detail = new DaoProposalDetailPage(page);
    const actionsHeading = page.getByRole('heading', {
        name: 'Actions',
        exact: true,
    });
    await expect(actionsHeading).toBeVisible({ timeout: 30_000 });
    await expect(detail.mainContent()).not.toBeEmpty();

    const mainWithActions = page
        .getByRole('main')
        .filter({ has: actionsHeading });

    const accordionTrigger = mainWithActions
        .locator('button[aria-expanded="false"]')
        .first();
    if (
        await accordionTrigger.isVisible({ timeout: 5000 }).catch(() => false)
    ) {
        await accordionTrigger.click();
    }

    await expect(
        mainWithActions.getByText('Ether', { exact: true }).first(),
    ).toBeVisible({ timeout: 30_000 });
}

export async function createAndPublishMultisigWithdrawProposal(
    page: Page,
    metamask: MetaMask,
    dao: BvMultisigTreasuryDao,
    {
        receiverAddress,
        amountEth,
        titlePrefix = 'BV E2E',
    }: {
        receiverAddress: string;
        amountEth: string;
        titlePrefix?: string;
    },
): Promise<{ title: string; url: string }> {
    const proposals = new DaoProposalsPage({
        page,
        network: dao.network,
        address: dao.address,
    });
    await proposals.navigate();
    await waitForProposalsMemberGate(page);
    await openMultisigProposalWizard(page);

    const proposalTitle = `${titlePrefix} ${Date.now()}`;
    await fillMultisigNativeWithdrawProposal(page, {
        proposalTitle,
        receiverAddress,
        amountEth,
    });

    await signTransactionInDappDialog(page, metamask);
    await page.waitForURL(/\/proposals/, { timeout: 60_000 });

    return { title: proposalTitle, url: page.url() };
}

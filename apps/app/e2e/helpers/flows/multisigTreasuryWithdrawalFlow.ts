import { expect, type Page } from '@playwright/test';
import type { MetaMask } from '@synthetixio/synpress/playwright';
import { getAddress } from 'viem';
import type { BvMultisigTreasuryDao } from '../constants/bvDaos';
import {
    ACCORDION_VISIBILITY_TIMEOUT,
    ARAGON_PROFILE_DISMISS_TIMEOUT,
    MEMBER_GATE_API_TIMEOUT,
    PLUGIN_SELECT_DIALOG_TIMEOUT,
    PROPOSAL_CREATED_NAV_TIMEOUT,
    PROPOSAL_FORM_ELEMENT_TIMEOUT,
    PUBLISH_DIALOG_TIMEOUT,
    UI_DIALOG_TIMEOUT,
    UI_FIELD_VALUE_TIMEOUT,
    UI_STEP_TIMEOUT,
} from '../constants/timeouts';
import { DaoProposalDetailPage } from '../pages/daoProposalDetailPage/daoProposalDetailPage';
import { DaoProposalsPage } from '../pages/daoProposalsPage/daoProposalsPage';
import { WalletConnectionPage } from '../shared/walletConnectionPage/walletConnectionPage';
import {
    approveOptionalMetaMaskNotifications,
    getConnectedWalletAddress,
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
    // The Actions step footer renders a Dropdown.Container whose trigger button
    // has the label "Next" (submitLabel when hasNext=true). Radix also sets
    // data-state on the trigger, so we can combine both to stay stable.
    const dropdownTrigger = page
        .locator(CREATE_PROPOSAL_FORM)
        .getByRole('button', { name: 'Next', exact: true })
        .and(page.locator('[data-state]'));
    await dropdownTrigger.click();
    const actionsFooterMenu = page
        .getByRole('menu')
        .filter({
            has: page.getByRole('menuitem', {
                name: 'Skip simulation',
                exact: true,
            }),
        })
        .last();
    await actionsFooterMenu.waitFor({
        state: 'visible',
        timeout: UI_STEP_TIMEOUT,
    });
    await page
        .locator('button[type="submit"][form="createProposalWizard"]')
        .filter({ hasText: 'Skip simulation' })
        .click();
    await expect(
        page
            .getByRole('dialog', { name: 'Publish proposal' })
            .or(page.getByRole('heading', { name: /Proposal settings/i })),
    ).toBeVisible({ timeout: PUBLISH_DIALOG_TIMEOUT });
}

/**
 * Navigates to the DAO dashboard, connects the MetaMask wallet,
 * and switches to the DAO's network — the prerequisite for every BV test.
 */
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
    await approveOptionalMetaMaskNotifications(metamask);
    await switchNetwork(page, metamask, dao.network);

    const walletAddress = await getConnectedWalletAddress(page);
    // AragonProfileOnboardingWatcher — once per address after connect
    await page.evaluate((addr) => {
        localStorage.setItem(
            `aragon-profile-onboarding:${addr.toLowerCase()}`,
            'true',
        );
    }, walletAddress);
    await page
        .getByRole('dialog')
        .filter({
            has: page.getByRole('heading', {
                name: /your profile|Aragon name/i,
            }),
        })
        .getByRole('button', { name: 'Cancel', exact: true })
        .click({ timeout: ARAGON_PROFILE_DISMISS_TIMEOUT })
        .catch(() => undefined);
}

/**
 * Waits for the `/v2/members/.../exists` API response that gates the
 * "New Proposal" button on the proposals page. Without this, clicking
 * the button may race against the member-check and fail.
 */
/** Call before navigating to proposals — the exists check fires during page load. */
export function waitForProposalsMemberGate(page: Page) {
    return page.waitForResponse(
        (res) =>
            /\/v2\/members\/[^/]+\/[^/]+\/exists(?:\?|$)/.test(res.url()) &&
            res.ok(),
        { timeout: MEMBER_GATE_API_TIMEOUT },
    );
}

/**
 * Opens the proposal creation wizard from the proposals page.
 * Handles both multi-process DAOs (dialog with plugin choice) and
 * single-process DAOs (direct navigation to `/create/.../proposal`).
 */
export async function openMultisigProposalWizard(page: Page): Promise<void> {
    await page
        .getByRole('main')
        .getByRole('button', { name: 'Proposal', exact: true })
        .click();

    try {
        await page.getByRole('dialog').waitFor({
            state: 'visible',
            timeout: PLUGIN_SELECT_DIALOG_TIMEOUT,
        });
    } catch {
        // Single-process DAOs skip the plugin selection dialog
        // and navigate straight to the create URL.
    }

    const dialog = page.getByRole('dialog');
    if (await dialog.isVisible().catch(() => false)) {
        await dialog.getByText('Multisig', { exact: true }).click();
        await dialog.getByRole('button', { name: 'Create proposal' }).click();
    }

    await expect(page).toHaveURL(/\/create\/.*\/proposal/, {
        timeout: PROPOSAL_FORM_ELEMENT_TIMEOUT,
    });
}

/** Fills the multisig native ETH withdrawal proposal form (title, actions, recipient, amount). */
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
        timeout: PROPOSAL_FORM_ELEMENT_TIMEOUT,
    });
    await page.getByLabel('Proposal title').fill(proposalTitle);

    await page.getByRole('button', { name: 'Next', exact: true }).click();

    const addActionBtn = wizardForm.getByRole('button', {
        name: 'Action',
        exact: true,
    });
    await expect(addActionBtn).toBeVisible({
        timeout: PROPOSAL_FORM_ELEMENT_TIMEOUT,
    });
    await addActionBtn.click();

    const actionSearch = page.getByPlaceholder(
        /Search by action, contract name, or address/i,
    );
    await expect(actionSearch).toBeVisible({ timeout: UI_STEP_TIMEOUT });
    await actionSearch.fill('Transfer');
    const transferOption = page.getByRole('option', {
        name: 'Transfer',
        exact: true,
    });
    await expect(transferOption).toBeVisible({ timeout: UI_STEP_TIMEOUT });
    await transferOption.click();

    const assetTrigger = wizardForm.getByRole('button', {
        name: 'Select',
        exact: true,
    });
    await expect(assetTrigger).toBeVisible({ timeout: UI_DIALOG_TIMEOUT });
    await assetTrigger.click();

    const assetDialog = page.getByRole('dialog', { name: 'Select an asset' });
    await expect(assetDialog).toBeVisible({ timeout: UI_DIALOG_TIMEOUT });
    await expect(
        assetDialog.getByText(/ETH|Ether|Ethereum/i).first(),
    ).toBeVisible({ timeout: PROPOSAL_FORM_ELEMENT_TIMEOUT });
    await assetDialog
        .getByText(/^(Ether|Ethereum|ETH)$/)
        .first()
        .click();
    await expect(assetDialog).toBeHidden({ timeout: UI_STEP_TIMEOUT });

    // AssetInput labels the button "Max {balance}" (e.g. "Max 0.51"), not "Max" alone.
    const maxAmountButton = wizardForm.getByRole('button', { name: /^Max\b/ });
    await expect(maxAmountButton).toBeVisible({
        timeout: PUBLISH_DIALOG_TIMEOUT,
    });

    const amountField = wizardForm.getByRole('spinbutton');
    await expect(amountField).toBeEnabled({ timeout: UI_STEP_TIMEOUT });
    await amountField.fill(amountEth);
    await amountField.blur();
    await expect(amountField).toHaveValue(amountEth, {
        timeout: UI_FIELD_VALUE_TIMEOUT,
    });

    const recipientField = wizardForm.getByPlaceholder(/ENS or 0x/i);
    await recipientField.click();
    await recipientField.fill(checksummedReceiver);
    await recipientField.blur();
    // AddressInput component debounces 300 ms before committing the value;
    // wait slightly longer so the resolved address appears in the UI.
    await page.waitForTimeout(400);
    await expect(
        wizardForm
            .getByText(new RegExp(checksummedReceiver.slice(0, 6), 'i'))
            .first(),
    ).toBeVisible({ timeout: UI_DIALOG_TIMEOUT });
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
        await expect(publishDialog).toBeVisible({
            timeout: PUBLISH_DIALOG_TIMEOUT,
        });
    }
}

/**
 * Verifies that the proposal detail page shows decoded action data
 * (expands the accordion if collapsed and checks for "Ether" text).
 */
export async function expectProposalActionsDecoded(page: Page): Promise<void> {
    const detail = new DaoProposalDetailPage(page);
    const actionsHeading = page.getByRole('heading', {
        name: 'Actions',
        exact: true,
    });
    await expect(actionsHeading).toBeVisible({
        timeout: PUBLISH_DIALOG_TIMEOUT,
    });
    await expect(detail.mainContent()).not.toBeEmpty();

    const mainWithActions = page
        .getByRole('main')
        .filter({ has: actionsHeading });

    const accordionTrigger = mainWithActions
        .locator('button[aria-expanded="false"]')
        .first();
    if (
        await accordionTrigger
            .isVisible({ timeout: ACCORDION_VISIBILITY_TIMEOUT })
            .catch(() => false)
    ) {
        await accordionTrigger.click();
    }

    await expect(
        mainWithActions.getByText('Ether', { exact: true }).first(),
    ).toBeVisible({ timeout: PUBLISH_DIALOG_TIMEOUT });
}

/**
 * End-to-end: navigates to proposals, opens the multisig wizard,
 * fills a native ETH withdrawal proposal, publishes it, and returns
 * the created proposal's title and URL.
 */
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
    const memberGate = waitForProposalsMemberGate(page);
    await proposals.navigate();
    await memberGate.catch(() => undefined);
    await openMultisigProposalWizard(page);

    const proposalTitle = `${titlePrefix} ${Date.now()}`;
    await fillMultisigNativeWithdrawProposal(page, {
        proposalTitle,
        receiverAddress,
        amountEth,
    });

    await signTransactionInDappDialog(page, metamask);
    await page.waitForURL(/\/proposals/, {
        timeout: PROPOSAL_CREATED_NAV_TIMEOUT,
    });

    return { title: proposalTitle, url: page.url() };
}

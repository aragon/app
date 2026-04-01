import type { BrowserContext, Page } from '@playwright/test';
import type { MetaMask } from '@synthetixio/synpress/playwright';
import { parseEther } from 'viem';
import {
    GOVERNANCE_DIALOG_TIMEOUT,
    MM_CONFIRM_ACTION_TIMEOUT,
    MM_CONFIRM_NOTIFICATION_TIMEOUT,
    MM_NOTIFICATION_TIMEOUT,
    VIEW_PROPOSAL_TIMEOUT,
} from '../constants/timeouts';

interface EthereumProvider {
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
}

type WindowWithEthereum = Window & { ethereum?: EthereumProvider };

const CHAIN_IDS: Record<string, string> = {
    'ethereum-sepolia': '0xaa36a7',
    'ethereum-mainnet': '0x1',
};

/**
 * Finds the MetaMask notification popup among open browser pages.
 *
 * Side Panel is disabled via manifest patching (see `syncWalletSetupCache`),
 * so MetaMask falls back to `notification.html` popups that Playwright can interact with.
 */
export async function getMetaMaskActionPage(
    context: BrowserContext,
    extensionId: string,
    timeout = MM_NOTIFICATION_TIMEOUT,
): Promise<Page> {
    const notificationUrl = `chrome-extension://${extensionId}/notification.html`;
    const isActionPage = (url: string) => url.startsWith(notificationUrl);

    const existing = context
        .pages()
        .find((p) => !p.isClosed() && isActionPage(p.url()));
    if (existing) {
        return existing;
    }

    const page = await context.waitForEvent('page', {
        predicate: (p) => isActionPage(p.url()),
        timeout,
    });
    await page.waitForLoadState('domcontentloaded');
    return page;
}

/** Confirms the pending MetaMask notification by trying common button labels. */
async function clickMetaMaskConfirmAction(
    actionPage: Page,
    { timeout = MM_CONFIRM_ACTION_TIMEOUT }: { timeout?: number } = {},
) {
    const exactNames = ['Confirm', 'Sign', 'Approve', 'Sign transaction'];
    for (const name of exactNames) {
        const btn = actionPage.getByRole('button', { name, exact: true });
        if (await btn.isVisible().catch(() => false)) {
            await btn.click();
            return;
        }
    }
    const fallback = actionPage
        .getByRole('button')
        .filter({ hasText: /^(Confirm|Sign|Approve)$/i })
        .first();
    await fallback.waitFor({ state: 'visible', timeout });
    await fallback.click();
}

/**
 * Clicks "Connect" in the MetaMask notification popup that appears
 * when the dApp requests wallet connection.
 */
export async function connectToDapp(metamask: MetaMask) {
    if (!metamask.extensionId) {
        throw new Error('MetaMask extensionId is not set');
    }
    const actionPage = await getMetaMaskActionPage(
        metamask.context,
        metamask.extensionId,
    );
    const connectBtn = actionPage.getByRole('button', {
        name: 'Connect',
        exact: true,
    });
    await connectBtn.waitFor({
        state: 'visible',
        timeout: MM_CONFIRM_ACTION_TIMEOUT,
    });
    await connectBtn.click();
}

/**
 * Confirms a pending MetaMask transaction notification.
 * Retries once if the notification is slow to appear (e.g. after network switch).
 */
export async function confirmTransaction(metamask: MetaMask) {
    const extensionId = metamask.extensionId;
    if (!extensionId) {
        throw new Error('MetaMask extensionId is not set');
    }
    const attempt = async () => {
        // MetaMask renders the notification popup asynchronously; brief pause
        // lets the extension open the window before we start searching for it.
        await metamask.page.waitForTimeout(400);
        const actionPage = await getMetaMaskActionPage(
            metamask.context,
            extensionId,
            MM_CONFIRM_NOTIFICATION_TIMEOUT,
        );
        await clickMetaMaskConfirmAction(actionPage);
    };
    try {
        await attempt();
    } catch {
        // Notification may lag behind — retry after a short stabilization pause.
        await metamask.page.waitForTimeout(800);
        await attempt();
    }
}

/**
 * Signs a transaction in the "Publish proposal" dialog, confirms in MetaMask,
 * then clicks "View proposal" to navigate to the newly created proposal.
 */
export async function signTransactionInDappDialog(
    page: Page,
    metamask: MetaMask,
    {
        signTimeout = 40_000,
        viewProposalTimeout = VIEW_PROPOSAL_TIMEOUT,
    }: { signTimeout?: number; viewProposalTimeout?: number } = {},
) {
    const publishDialog = page
        .getByRole('dialog', { name: 'Publish proposal' })
        .or(page.getByRole('dialog').filter({ hasText: 'Publish proposal' }));
    const signBtn = publishDialog.getByRole('button', {
        name: 'Sign transaction',
        exact: true,
    });
    await signBtn.click({ timeout: signTimeout });
    await confirmTransaction(metamask);

    const viewProposal = publishDialog
        .getByRole('button', { name: 'View proposal', exact: true })
        .or(
            publishDialog.getByRole('link', {
                name: 'View proposal',
                exact: true,
            }),
        );
    await viewProposal.click({ timeout: viewProposalTimeout });
}

/**
 * Switches the MetaMask network via `wallet_switchEthereumChain` RPC call
 * injected into the dApp page. Auto-approves the MetaMask popup if one appears.
 */
export async function switchNetwork(
    page: Page,
    metamask: MetaMask,
    networkName: string,
) {
    const chainId = CHAIN_IDS[networkName];
    if (!chainId) {
        throw new Error(
            `Unknown network "${networkName}". Known: ${Object.keys(CHAIN_IDS).join(', ')}`,
        );
    }
    const extensionId = metamask.extensionId;
    if (!extensionId) {
        throw new Error('MetaMask extensionId is not set');
    }

    await Promise.all([
        page.evaluate(async (cId) => {
            const ethereum = (window as WindowWithEthereum).ethereum;
            if (!ethereum) {
                throw new Error('window.ethereum is not available');
            }
            await ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: cId }],
            });
        }, chainId),
        getMetaMaskActionPage(metamask.context, extensionId, 5000)
            .then((actionPage) => clickMetaMaskConfirmAction(actionPage))
            .catch(() => undefined),
    ]);
}

/** Returns the checksummed address of the currently connected wallet. */
export function getConnectedWalletAddress(page: Page): Promise<string> {
    return page.evaluate(async () => {
        const ethereum = (window as WindowWithEthereum).ethereum;
        if (!ethereum) {
            throw new Error('window.ethereum is not available');
        }
        const accounts = (await ethereum.request({
            method: 'eth_requestAccounts',
        })) as string[];
        if (!accounts[0]) {
            throw new Error('No connected account');
        }
        return accounts[0];
    });
}

/**
 * Steps through the governance TransactionDialog (vote / execute):
 *
 * The dialog cycles through multiple rounds because a multisig proposal may
 * require several sequential on-chain actions (approve → execute), each
 * showing "Sign transaction" / "Resend to wallet" before arriving at
 * "View proposal". The loop handles all intermediate states:
 *
 * 1. If "View proposal" is already visible → click and exit.
 * 2. If the dialog is open with "Sign transaction" or "Resend to wallet" →
 *    click the button, confirm in MetaMask, then loop.
 * 3. If the dialog disappears (transaction processing) → wait for "View proposal".
 *
 * `maxRounds` is set high (14) to accommodate the worst case of chained
 * multi-step governance flows with retry-able signing prompts.
 */
export async function confirmGovernanceTransactionDialog(
    page: Page,
    metamask: MetaMask,
    {
        maxRounds = 14,
        viewProposalTimeout = VIEW_PROPOSAL_TIMEOUT,
    }: { maxRounds?: number; viewProposalTimeout?: number } = {},
): Promise<void> {
    const governanceTransactionDialog = page.getByRole('dialog').filter({
        has: page.getByRole('heading', {
            name: /Submit vote|Execute proposal/,
        }),
    });

    const viewProposalCta = page
        .getByRole('link', { name: 'View proposal', exact: true })
        .or(
            page.getByRole('button', {
                name: 'View proposal',
                exact: true,
            }),
        );

    await governanceTransactionDialog
        .first()
        .waitFor({ state: 'visible', timeout: GOVERNANCE_DIALOG_TIMEOUT });

    for (let round = 0; round < maxRounds; round++) {
        if (await viewProposalCta.isVisible().catch(() => false)) {
            await viewProposalCta.click({ timeout: 20_000 });
            return;
        }

        const dialogVisible = await governanceTransactionDialog
            .first()
            .isVisible()
            .catch(() => false);
        if (!dialogVisible) {
            await viewProposalCta.waitFor({
                state: 'visible',
                timeout: viewProposalTimeout,
            });
            await viewProposalCta.click({ timeout: 20_000 });
            return;
        }

        const primaryNames = ['Sign transaction', 'Resend to wallet'] as const;

        let clicked = false;
        for (const name of primaryNames) {
            const btn = governanceTransactionDialog
                .first()
                .getByRole('button', { name, exact: true });
            if (await btn.isVisible().catch(() => false)) {
                await page.bringToFront();
                await btn.click({ timeout: 90_000 });
                clicked = true;
                await confirmTransaction(metamask);
                break;
            }
        }

        if (!clicked) {
            // No actionable button yet — pause briefly before polling again.
            await page.waitForTimeout(600);
        }
    }

    await viewProposalCta.waitFor({
        state: 'visible',
        timeout: viewProposalTimeout,
    });
    await viewProposalCta.click({ timeout: 20_000 });
}

/**
 * Sends native ETH from the connected wallet to a target address
 * by injecting an `eth_sendTransaction` RPC call and confirming in MetaMask.
 */
export async function sendNativeEthFromConnectedPage(
    page: Page,
    metamask: MetaMask,
    { to, amountEth }: { to: string; amountEth: string },
): Promise<void> {
    const valueHex = `0x${parseEther(amountEth).toString(16)}`;
    await Promise.all([
        page.evaluate(
            async ({ to, valueHex }) => {
                const ethereum = (window as WindowWithEthereum).ethereum;
                if (!ethereum) {
                    throw new Error('window.ethereum is not available');
                }
                const accounts = (await ethereum.request({
                    method: 'eth_requestAccounts',
                })) as string[];
                await ethereum.request({
                    method: 'eth_sendTransaction',
                    params: [{ from: accounts[0], to, value: valueHex }],
                });
            },
            { to, valueHex },
        ),
        confirmTransaction(metamask),
    ]);
}

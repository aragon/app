import type { BrowserContext, Page } from '@playwright/test';
import type { MetaMask } from '@synthetixio/synpress/playwright';

const ACTION_DELAY_MS = 400;

interface EthereumProvider {
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
}

type WindowWithEthereum = Window & { ethereum?: EthereumProvider };

const CHAIN_IDS: Record<string, string> = {
    Sepolia: '0xaa36a7',
    'Ethereum Mainnet': '0x1',
    Mainnet: '0x1',
};

/**
 * Finds the MetaMask notification popup. Side Panel is disabled via manifest
 * patching (see syncWalletSetupCache), so MetaMask falls back to notification.html.
 */
export async function getMetaMaskActionPage(
    context: BrowserContext,
    extensionId: string,
    timeout = 15_000,
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
    { timeout = 12_000 }: { timeout?: number } = {},
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
    await connectBtn.waitFor({ state: 'visible', timeout: 12_000 });
    await connectBtn.click();
}

const METAMASK_NOTIFICATION_TIMEOUT_MS = 45_000;

export async function confirmTransaction(metamask: MetaMask) {
    const extensionId = metamask.extensionId;
    if (!extensionId) {
        throw new Error('MetaMask extensionId is not set');
    }
    const attempt = async () => {
        await metamask.page.waitForTimeout(ACTION_DELAY_MS);
        const actionPage = await getMetaMaskActionPage(
            metamask.context,
            extensionId,
            METAMASK_NOTIFICATION_TIMEOUT_MS,
        );
        await clickMetaMaskConfirmAction(actionPage);
    };
    try {
        await attempt();
    } catch {
        await metamask.page.waitForTimeout(800);
        await attempt();
    }
}

/** Sign transaction in the "Publish proposal" dialog, confirm in MetaMask, then click "View proposal". */
export async function signTransactionInDappDialog(
    page: Page,
    metamask: MetaMask,
    {
        signTimeout = 40_000,
        viewProposalTimeout = 120_000,
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

/** Switch MetaMask network via wallet_switchEthereumChain RPC; auto-approves if a popup appears. */
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
        getMetaMaskActionPage(metamask.context, metamask.extensionId!, 5000)
            .then((actionPage) => clickMetaMaskConfirmAction(actionPage))
            .catch(() => undefined),
    ]);
}

function ethStringToWeiHex(amountEth: string): string {
    const normalized = amountEth.trim();
    const [wholePart, fracPart = ''] = normalized.split('.');
    const paddedFrac = (fracPart + '0'.repeat(18)).slice(0, 18);
    const wei =
        BigInt(wholePart || '0') * 10n ** 18n + BigInt(paddedFrac || '0');
    return `0x${wei.toString(16)}`;
}

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
 * clicks "Sign transaction" → confirms in MetaMask → waits for "View proposal".
 * Dialog is scoped by heading to avoid ambiguity with other `[role="dialog"]` nodes.
 */
export async function confirmGovernanceTransactionDialog(
    page: Page,
    metamask: MetaMask,
    {
        maxRounds = 14,
        viewProposalTimeout = 120_000,
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
        .waitFor({ state: 'visible', timeout: 35_000 });

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
            await page.waitForTimeout(600);
        }
    }

    await viewProposalCta.waitFor({
        state: 'visible',
        timeout: viewProposalTimeout,
    });
    await viewProposalCta.click({ timeout: 20_000 });
}

export async function sendNativeEthFromConnectedPage(
    page: Page,
    metamask: MetaMask,
    { to, amountEth }: { to: string; amountEth: string },
): Promise<void> {
    const valueHex = ethStringToWeiHex(amountEth);
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

import type { Page } from '@playwright/test';
import { testWithSynpress } from '@synthetixio/synpress';
import { MetaMask, metaMaskFixtures } from '@synthetixio/synpress/playwright';
import walletSetup from './wallet.setup';

const base = testWithSynpress(metaMaskFixtures(walletSetup));

export const test = base.extend<{ metamask: MetaMask }>({
    metamask: async ({ context, metamaskPage, extensionId }, use) => {
        const homeUrl = `chrome-extension://${extensionId}/home.html`;

        const mmPage: Page =
            context
                .pages()
                .find(
                    (p) =>
                        p.url().startsWith(homeUrl) &&
                        !p.url().includes('onboarding'),
                ) ?? metamaskPage;

        // MetaMask may lock between tests; unlock if the password field is present.
        const lockInput = mmPage.locator('[data-testid="unlock-password"]');
        if ((await lockInput.count()) > 0) {
            await lockInput.fill(walletSetup.walletPassword);
            await mmPage.locator('[data-testid="unlock-submit"]').click();
            // Extension UI re-renders after unlock — no reliable DOM event to await.
            await mmPage.waitForTimeout(1000);
        }

        // Close stale extension tabs (onboarding, popups) that Synpress
        // may have left open — they interfere with notification detection.
        const extPrefix = `chrome-extension://${extensionId}/`;
        for (const p of context.pages()) {
            if (p !== mmPage && p.url().startsWith(extPrefix)) {
                await p.close();
            }
        }

        const metamask = new MetaMask(
            context,
            mmPage,
            walletSetup.walletPassword,
            extensionId,
        );
        await use(metamask);
    },
});

export const { expect } = test;

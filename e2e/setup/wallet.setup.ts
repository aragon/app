import path from 'node:path';
import { defineWalletSetup } from '@synthetixio/synpress';
import { getExtensionId, MetaMask } from '@synthetixio/synpress/playwright';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve('e2e/.env') });

const SEED_PHRASE = process.env.E2E_FE_MM_WALLET_SECRET_RECOVERY_PHRASE;
const PASSWORD = process.env.E2E_FE_MM_WALLET_PASSWORD;

if (!SEED_PHRASE || !PASSWORD) {
    throw new Error(
        'E2E_FE_MM_WALLET_SECRET_RECOVERY_PHRASE and E2E_FE_MM_WALLET_PASSWORD must be set (e2e/.env locally, or CI via 1Password)',
    );
}

const walletSetup = defineWalletSetup(PASSWORD, async (context, walletPage) => {
    const extensionId = await getExtensionId(context, 'MetaMask');
    const metamask = new MetaMask(context, walletPage, PASSWORD, extensionId);

    await metamask.importWallet(SEED_PHRASE);

    // const homeUrl = `chrome-extension://${extensionId}/home.html`;

    // // Post-import: navigate home, unlock if needed, complete onboarding.
    // await walletPage.goto(homeUrl);
    // await walletPage.waitForTimeout(2000);

    // const lockInput = walletPage.locator('[data-testid="unlock-password"]');
    // if (await lockInput.isVisible().catch(() => false)) {
    //     await lockInput.fill(PASSWORD);
    //     await walletPage.locator('[data-testid="unlock-submit"]').click();
    //     await walletPage.waitForTimeout(2000);
    // }

    // const openWalletBtn = walletPage.locator(
    //     '[data-testid="onboarding-complete-done"]',
    // );
    // if (await openWalletBtn.isVisible().catch(() => false)) {
    //     await openWalletBtn.click();
    //     await walletPage.waitForTimeout(3000);
    // }

    // // Enable test networks in Advanced settings.
    // await walletPage.goto(`${homeUrl}#settings/advanced`);
    // await walletPage.waitForTimeout(2000);

    // await walletPage
    //     .locator('.tab-bar__tab')
    //     .filter({ hasText: 'Advanced' })
    //     .click();
    // await walletPage.waitForTimeout(1000);

    // const offToggle = walletPage.locator(
    //     '[data-testid="advanced-setting-show-testnet-conversion"] label.toggle-button--off:not(.show-fiat-on-testnets-toggle)',
    // );
    // if ((await offToggle.count()) > 0) {
    //     await offToggle.click();
    //     await walletPage
    //         .locator(
    //             '[data-testid="advanced-setting-show-testnet-conversion"] label.toggle-button--on:not(.show-fiat-on-testnets-toggle)',
    //         )
    //         .waitFor({ state: 'visible', timeout: 5000 });
    // }
});

const WALLET_SETUP_CACHE_KEY = 'wallet-setup';

export default { ...walletSetup, hash: WALLET_SETUP_CACHE_KEY };

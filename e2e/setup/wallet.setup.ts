import path from 'node:path';
import { defineWalletSetup } from '@synthetixio/synpress';
import { getExtensionId } from '@synthetixio/synpress/playwright';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve('e2e/.env') });

const SEED_PHRASE = process.env.E2E_FE_MM_WALLET_SECRET_RECOVERY_PHRASE;
const PASSWORD = process.env.E2E_FE_MM_WALLET_PASSWORD;

if (!SEED_PHRASE || !PASSWORD) {
    throw new Error(
        'E2E_FE_MM_WALLET_SECRET_RECOVERY_PHRASE and E2E_FE_MM_WALLET_PASSWORD must be set (e2e/.env locally, or CI via 1Password)',
    );
}

/**
 * Fill the MetaMask 13.x SRP input via per-word fields.
 *
 * MM 13.x `SrpInputImport` starts as a single `<Textarea>` and transitions
 * to individual `<TextField>` inputs after the first word + Space.  Synpress's
 * `.type(phrase)` races with the React DOM swap on CI/xvfb, leaving the
 * Continue button disabled.
 *
 * Approach: type the first word into the textarea, press Space to switch to
 * per-word mode, then `.fill()` each remaining word — exactly how MetaMask's
 * own Playwright tests handle it.
 */
async function fillSrpPerWord(
    page: import('@playwright/test').Page,
    seedPhrase: string,
) {
    const words = seedPhrase.split(' ');

    const textarea = page.getByTestId('srp-input-import__srp-note');
    await textarea.fill(words[0]);
    await textarea.press('Space');

    for (let i = 1; i < words.length; i++) {
        const field = page.getByTestId(`import-srp__srp-word-${i}`);
        await field.fill(words[i]);
        if (i < words.length - 1) {
            await field.press('Space');
        }
    }
}

const walletSetup = defineWalletSetup(PASSWORD, async (context, walletPage) => {
    const extensionId = await getExtensionId(context, 'MetaMask');
    const homeUrl = `chrome-extension://${extensionId}/home.html`;

    await walletPage
        .locator('[data-testid="onboarding-import-wallet"]')
        .click();
    await walletPage.getByTestId('onboarding-import-with-srp-button').click();

    await fillSrpPerWord(walletPage, SEED_PHRASE);

    await walletPage.getByTestId('import-srp-confirm').click();

    // Create password.
    await walletPage
        .locator('[data-testid="create-password-new-input"]')
        .fill(PASSWORD);
    await walletPage
        .locator('[data-testid="create-password-confirm-input"]')
        .fill(PASSWORD);
    await walletPage.locator('[data-testid="create-password-terms"]').click();
    await walletPage.locator('[data-testid="create-password-submit"]').click();

    // Analytics opt-out.
    await walletPage.locator('#metametrics-opt-in').click();
    await walletPage.locator('[data-testid="metametrics-i-agree"]').click();

    // Post-import: navigate home, unlock if needed, complete onboarding.
    await walletPage.goto(homeUrl);
    await walletPage.waitForTimeout(2000);

    const lockInput = walletPage.locator('[data-testid="unlock-password"]');
    if (await lockInput.isVisible().catch(() => false)) {
        await lockInput.fill(PASSWORD);
        await walletPage.locator('[data-testid="unlock-submit"]').click();
        await walletPage.waitForTimeout(2000);
    }

    const openWalletBtn = walletPage.locator(
        '[data-testid="onboarding-complete-done"]',
    );
    if (await openWalletBtn.isVisible().catch(() => false)) {
        await openWalletBtn.click();
        await walletPage.waitForTimeout(3000);
    }

    // Enable test networks in Advanced settings.
    await walletPage.goto(`${homeUrl}#settings/advanced`);
    await walletPage.waitForTimeout(2000);

    await walletPage
        .locator('.tab-bar__tab')
        .filter({ hasText: 'Advanced' })
        .click();
    await walletPage.waitForTimeout(1000);

    const offToggle = walletPage.locator(
        '[data-testid="advanced-setting-show-testnet-conversion"] label.toggle-button--off:not(.show-fiat-on-testnets-toggle)',
    );
    if ((await offToggle.count()) > 0) {
        await offToggle.click();
        await walletPage
            .locator(
                '[data-testid="advanced-setting-show-testnet-conversion"] label.toggle-button--on:not(.show-fiat-on-testnets-toggle)',
            )
            .waitFor({ state: 'visible', timeout: 5000 });
    }
});

const WALLET_SETUP_CACHE_KEY = 'wallet-setup';

export default { ...walletSetup, hash: WALLET_SETUP_CACHE_KEY };

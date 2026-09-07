import path from 'node:path';
import type { Page } from '@playwright/test';
import { defineWalletSetup } from '@synthetixio/synpress';
import { getExtensionId } from '@synthetixio/synpress/playwright';
import dotenv from 'dotenv';
import { WALLET_SETUP_CACHE_KEY } from './walletCacheKey.mjs';

dotenv.config({ path: path.resolve('e2e/.env') });

const SEED_PHRASE = process.env.E2E_FE_MM_WALLET_SECRET_RECOVERY_PHRASE;
const PASSWORD = process.env.E2E_FE_MM_WALLET_PASSWORD;

if (!SEED_PHRASE || !PASSWORD) {
    throw new Error(
        'E2E_FE_MM_WALLET_SECRET_RECOVERY_PHRASE and E2E_FE_MM_WALLET_PASSWORD must be set (e2e/.env locally, or CI via 1Password)',
    );
}

const SRP_ATTEMPTS = 3;
const TOGGLE_ATTEMPTS = 3;

/**
 * Imports the wallet through the MetaMask onboarding flow (same steps as
 * synpress's MetaMask.importWallet, inlined to make the SRP entry retryable).
 *
 * MetaMask splits the typed phrase into per-word inputs and re-renders while
 * typing, which occasionally drops words and leaves the Continue button
 * disabled — so the phrase is retyped from scratch until it validates.
 */
const importWalletOnboarding = async (walletPage: Page) => {
    await walletPage.getByTestId('onboarding-import-wallet').click();
    await walletPage.getByTestId('onboarding-import-with-srp-button').click();

    const confirmButton = walletPage.getByTestId('import-srp-confirm');

    for (let attempt = 1; attempt <= SRP_ATTEMPTS; attempt++) {
        await walletPage
            .getByTestId('srp-input-import__srp-note')
            .type(SEED_PHRASE, { delay: 25 });

        // Poll instead of waitFor: the button is present but disabled, and
        // whether it ever enables depends on the typed phrase being complete.
        const deadline = Date.now() + 5000;
        let enabled = false;
        while (!enabled && Date.now() < deadline) {
            enabled = await confirmButton.isEnabled();
            if (!enabled) {
                await walletPage.waitForTimeout(250);
            }
        }
        if (enabled) {
            break;
        }
        if (attempt === SRP_ATTEMPTS) {
            throw new Error(
                'MetaMask did not accept the secret recovery phrase (Continue stayed disabled)',
            );
        }
        await walletPage.getByText('Clear all').click();
        await walletPage.waitForTimeout(500);
    }

    await confirmButton.click();

    await walletPage
        .locator('[data-testid="create-password-new-input"]')
        .type(PASSWORD, { delay: 20 });
    await walletPage
        .locator('[data-testid="create-password-confirm-input"]')
        .type(PASSWORD, { delay: 20 });
    await walletPage.locator('[data-testid="create-password-terms"]').click();
    await walletPage.locator('[data-testid="create-password-submit"]').click();

    // The post-password screens vary between runs (metametrics opt-in,
    // completion page, or a lock screen when the session expires mid-flow).
    // Handle whichever appears until the UI settles instead of assuming a
    // fixed order.
    const isVisible = (selector: string) =>
        walletPage
            .locator(selector)
            .isVisible()
            .catch(() => false);

    const deadline = Date.now() + 60_000;
    let quietChecks = 0;
    let disabledDoneChecks = 0;
    while (quietChecks < 5 && Date.now() < deadline) {
        if (await isVisible('#metametrics-opt-in')) {
            await walletPage.locator('#metametrics-opt-in').click();
            await walletPage
                .locator('[data-testid="metametrics-i-agree"]')
                .click();
            quietChecks = 0;
        } else if (await isVisible('[data-testid="unlock-password"]')) {
            await walletPage
                .locator('[data-testid="unlock-password"]')
                .fill(PASSWORD);
            await walletPage.locator('[data-testid="unlock-submit"]').click();
            quietChecks = 0;
        } else if (
            await isVisible('[data-testid="onboarding-complete-done"]')
        ) {
            const doneButton = walletPage.locator(
                '[data-testid="onboarding-complete-done"]',
            );
            if (await doneButton.isEnabled().catch(() => false)) {
                await doneButton.click();
                disabledDoneChecks = 0;
            } else if (++disabledDoneChecks >= 10) {
                // The "Open wallet" button can stay disabled while the "Pin the
                // extension" tooltip is shown; reloading home.html gets past it.
                break;
            }
            quietChecks = 0;
        } else {
            quietChecks++;
        }
        await walletPage.waitForTimeout(1000);
    }
};

/**
 * Enables the "Show test networks" toggle in Advanced settings. The click
 * occasionally does not register in CI, so it is retried until the toggle
 * actually flips.
 */
const enableTestNetworks = async (walletPage: Page, homeUrl: string) => {
    await walletPage.goto(`${homeUrl}#settings/advanced`);
    await walletPage.waitForTimeout(2000);

    // MetaMask Advanced settings tab — CSS class selectors are version-dependent.
    await walletPage
        .locator('.tab-bar__tab')
        .filter({ hasText: 'Advanced' })
        .click();
    await walletPage.waitForTimeout(1000);

    // MetaMask reuses this testid for both the "Show conversion on test networks"
    // and "Show test networks" rows; :not(.show-fiat-on-testnets-toggle) picks the latter.
    const offToggle = walletPage.locator(
        '[data-testid="advanced-setting-show-testnet-conversion"] label.toggle-button--off:not(.show-fiat-on-testnets-toggle)',
    );
    const onToggle = walletPage.locator(
        '[data-testid="advanced-setting-show-testnet-conversion"] label.toggle-button--on:not(.show-fiat-on-testnets-toggle)',
    );

    for (let attempt = 1; attempt <= TOGGLE_ATTEMPTS; attempt++) {
        if ((await offToggle.count()) === 0) {
            return;
        }
        await offToggle.click();
        const flipped = await onToggle
            .waitFor({ state: 'visible', timeout: 5000 })
            .then(() => true)
            .catch(() => false);
        if (flipped) {
            return;
        }
    }

    throw new Error(
        'Failed to enable the "Show test networks" toggle in MetaMask Advanced settings',
    );
};

const walletSetup = defineWalletSetup(PASSWORD, async (context, walletPage) => {
    try {
        await importWalletOnboarding(walletPage);

        const extensionId = await getExtensionId(context, 'MetaMask');
        const homeUrl = `chrome-extension://${extensionId}/home.html`;

        // MetaMask extension pages render asynchronously after navigation;
        // no DOM event reliably signals readiness, so brief pauses are required.
        await walletPage.goto(homeUrl);
        await walletPage.waitForTimeout(2000);

        // MetaMask may show a lock screen if the session expired during import.
        const lockInput = walletPage.locator('[data-testid="unlock-password"]');
        if (await lockInput.isVisible().catch(() => false)) {
            await lockInput.fill(PASSWORD);
            await walletPage.locator('[data-testid="unlock-submit"]').click();
            await walletPage.waitForTimeout(2000);
        }

        const openWalletBtn = walletPage.locator(
            '[data-testid="onboarding-complete-done"]',
        );
        if (
            (await openWalletBtn.isVisible().catch(() => false)) &&
            (await openWalletBtn.isEnabled().catch(() => false))
        ) {
            await openWalletBtn.click();
            await walletPage.waitForTimeout(3000);
        }

        await enableTestNetworks(walletPage, homeUrl);
    } catch (error) {
        // The cache-creation step uploads no Playwright traces; a screenshot in
        // e2e/test-results/ lands in the CI artifact and shows what MetaMask displayed.
        await walletPage
            .screenshot({
                path: 'e2e/test-results/wallet-setup-failure.png',
                fullPage: true,
            })
            .catch(() => undefined);
        throw error;
    }
});

export default { ...walletSetup, hash: WALLET_SETUP_CACHE_KEY };

/**
 * Opens a browser with the cached MetaMask profile for manual setup
 * (onboarding, enabling test networks, etc). Close the browser to save.
 *
 * Prereqs: pnpm e2e:bv:wallet-cache
 * Usage:   node e2e/scripts/openCachedBrowser.mjs
 */
import path from 'node:path';
import { chromium } from '@playwright/test';

const CACHE_ROOT = path.join(process.cwd(), '.cache-synpress');
const PROFILE_DIR = path.join(CACHE_ROOT, 'wallet-setup');
const METAMASK_DIR = path.join(CACHE_ROOT, 'metamask-chrome-13.13.1');

console.log('[openCachedBrowser] Launching browser with cached profile...');
console.log(`  Profile: ${PROFILE_DIR}`);
console.log(`  Extension: ${METAMASK_DIR}`);
console.log('');
console.log('  Configure MetaMask as needed, then CLOSE the browser to save.');
console.log('');

const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    args: [
        `--disable-extensions-except=${METAMASK_DIR}`,
        `--load-extension=${METAMASK_DIR}`,
    ],
});

await new Promise((resolve) => {
    context.on('close', resolve);
});

console.log('[openCachedBrowser] Browser closed. Profile saved.');

'use strict';
// Dialogs and the wallet-connected variants of pages.
// Usage: node capture-dialogs.cjs [--update] [connectDialog|connected|vote|mobileNav]
const {
    TV_ROUTE: TV,
    WORKSPACE_ID: WS,
    newContext,
    workspaceSeed,
    goto,
    gotoConnected,
    shot,
    runCapture,
} = require('./lib.cjs');
const D = require('./data.cjs');
const walletScript = require('./wallet-inject.cjs');

const seed = workspaceSeed();
const NADIA = D.PEOPLE[0];
// jonas-b.eth has not voted on MGP-8 yet, so the vote form is available to him.
const JONAS = D.PEOPLE[10];
const viewport = { fullPage: false };

const dialogs = {
    async connectDialog(browser) {
        const context = await newContext(browser, {
            initScripts: [walletScript(NADIA.address, { connected: false })],
        });
        const page = await context.newPage();
        await goto(page, '/');
        await page.getByRole('button', { name: 'Connect' }).first().click();
        const dialog = page.getByRole('dialog');
        await dialog.getByRole('button', { name: /Connect/ }).waitFor();
        await shot(page, 'dialog-connect-wallet', viewport);
        await dialog.getByRole('button', { name: /Connect/ }).click();
        await page.locator('w3m-modal.open').waitFor();
        await shot(page, 'dialog-connect-wallet-appkit', viewport);
    },
    async connected(browser) {
        const context = await newContext(browser, {
            initScripts: [walletScript(NADIA.address), seed.script],
        });
        const page = await context.newPage();
        await gotoConnected(page, `${TV}/dashboard`, NADIA.ens);
        await shot(page, 'connected-dao-dashboard');
        await page
            .getByRole('button', { name: /nadia\.eth/ })
            .first()
            .click();
        await page.getByRole('dialog').waitFor();
        await shot(page, 'dialog-user-wallet', viewport);
        await page.keyboard.press('Escape');
        await page.getByRole('dialog').waitFor({ state: 'hidden' });
        await gotoConnected(page, `${TV}/members/${NADIA.address}`, NADIA.ens);
        await shot(page, 'connected-dao-member-detail-self');
        await gotoConnected(page, `/workspace/${WS}/all/todos`, NADIA.ens);
        await shot(page, 'connected-workspace-all-todos');
        await gotoConnected(page, `/workspace/${WS}/all/overview`, NADIA.ens);
        await shot(page, 'connected-workspace-all-overview');
        await gotoConnected(
            page,
            `/workspace/${WS}/${seed.tvAccountId}/todos`,
            NADIA.ens,
        );
        await shot(page, 'connected-workspace-account-todos');
    },
    async vote(browser) {
        const context = await newContext(browser, {
            initScripts: [walletScript(JONAS.address)],
        });
        const page = await context.newPage();
        await gotoConnected(page, `${TV}/proposals/MGP-8`, JONAS.ens);
        await shot(page, 'connected-dao-proposal-mgp-8-not-voted');
        await page.getByRole('button', { name: /Vote on proposal/ }).click();
        await page.getByText('Yes, I approve').waitFor();
        await shot(page, 'connected-dao-proposal-vote-options');
        await page.getByText('Yes, I approve').click();
        await shot(page, 'connected-dao-proposal-vote-yes-selected');
        await page.getByRole('button', { name: /Submit vote/ }).click();
        await page
            .getByRole('dialog')
            .getByRole('button', { name: 'Sign transaction' })
            .waitFor();
        await shot(page, 'dialog-vote-transaction', viewport);
    },
    async mobileNav(browser) {
        const context = await newContext(browser, {
            mobile: true,
            initScripts: [seed.script],
        });
        const page = await context.newPage();
        await goto(page, `${TV}/dashboard`);
        // The menu button of the mobile top bar has no accessible name: it is the last button of the bar.
        await page.locator('nav:visible').locator('button').last().click();
        await page.getByRole('dialog').getByText('Explore all DAOs').waitFor();
        await shot(page, 'dialog-dao-navigation-mobile', viewport);
    },
};

const jobs = Object.entries(dialogs).map(([name, run]) => ({ name, run }));

runCapture(jobs, (name, filter) => name === filter);

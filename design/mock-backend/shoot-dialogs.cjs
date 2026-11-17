'use strict';
// Dialogs and wallet-connected variants. Usage: node shoot-dialogs.cjs [name-filter]
const {
    chromium,
    setupContext,
    shot,
    settle,
    BASE,
} = require('./shoot-lib.cjs');
const D = require('./data.cjs');
const inject = require('./wallet-inject.cjs');
const viem = require(
    require.resolve('viem', {
        paths: [
            require('node:path').join(__dirname, '..', '..', 'apps', 'app'),
        ],
    }),
);

const TV = '/dao/ethereum-mainnet/meridian.dao.eth';
const WS = 'meridian-ecosystem';
const tvId = `ethereum-mainnet-${viem.getAddress(D.TV_DAO_ADDR)}`;
const msId = `ethereum-mainnet-${viem.getAddress(D.MS_DAO_ADDR)}`;
const workspace = {
    id: WS,
    name: 'Meridian Ecosystem',
    description:
        'Treasury and governance of Meridian DAO and the Atlas Grants Council in one place.',
    avatar: null,
    links: [{ name: 'Website', url: 'https://meridian.xyz' }],
    accounts: [
        {
            id: tvId,
            type: 'DAO',
            address: viem.getAddress(D.TV_DAO_ADDR),
            network: 'ethereum-mainnet',
            metadata: { name: 'Meridian DAO' },
        },
        {
            id: msId,
            type: 'DAO',
            address: viem.getAddress(D.MS_DAO_ADDR),
            network: 'ethereum-mainnet',
            metadata: { name: 'Atlas Grants Council' },
        },
    ],
    targets: [],
};
const seedWorkspace = `try { localStorage.setItem('aragon-workspaces', ${JSON.stringify(JSON.stringify({ [WS]: workspace }))}); } catch (e) {}`;
const NADIA = D.PEOPLE[0].address;

const go = async (page, url, wait = 7000) => {
    await page.goto(`${BASE}${url}`, {
        waitUntil: 'domcontentloaded',
        timeout: 240_000,
    });
    await settle(page, wait);
};

const jobs = {
    async connectDialog(browser) {
        const ctx = await setupContext(browser, {
            initScript: inject(NADIA, { connected: false }),
        });
        const page = await ctx.newPage();
        await go(page, '/', 4000);
        await page.getByRole('button', { name: 'Connect' }).first().click();
        await page.waitForTimeout(3000);
        await shot(page, 'dialog-connect-wallet', { fullPage: false });
        await page
            .getByRole('dialog')
            .getByRole('button', { name: /Connect/ })
            .first()
            .click();
        await page.waitForTimeout(6000);
        await shot(page, 'dialog-connect-wallet-appkit', { fullPage: false });
        await ctx.close();
    },
    async connected(browser) {
        const ctx = await setupContext(browser, {
            initScript: `${inject(NADIA)}\n${seedWorkspace}`,
        });
        const page = await ctx.newPage();
        await go(page, `${TV}/dashboard`);
        await shot(page, 'connected-dao-dashboard');
        await page
            .getByRole('button', { name: /nadia\.eth/ })
            .first()
            .click();
        await page.waitForTimeout(2500);
        await shot(page, 'dialog-user-wallet', { fullPage: false });
        await page.keyboard.press('Escape');
        await go(page, `${TV}/members/${NADIA}`);
        await shot(page, 'connected-dao-member-detail-self');
        await go(page, `/workspace/${WS}/all/todos`);
        await shot(page, 'connected-workspace-all-todos');
        await go(page, `/workspace/${WS}/all/overview`);
        await shot(page, 'connected-workspace-all-overview');
        await go(page, `/workspace/${WS}/${tvId}/todos`);
        await shot(page, 'connected-workspace-account-todos');
        await ctx.close();
    },
    async vote(browser) {
        // jonas-b.eth has not voted on MGP-8 yet, so the vote form is available.
        const ctx = await setupContext(browser, {
            initScript: inject(D.PEOPLE[10].address),
        });
        const page = await ctx.newPage();
        await go(page, `${TV}/proposals/MGP-8`);
        await shot(page, 'connected-dao-proposal-mgp-8-not-voted');
        await page
            .getByRole('button', { name: /Vote on proposal/ })
            .first()
            .click();
        await page.waitForTimeout(1500);
        await shot(page, 'connected-dao-proposal-vote-options');
        await page.getByText('Yes, I approve').first().click();
        await page.waitForTimeout(800);
        await shot(page, 'connected-dao-proposal-vote-yes-selected');
        await page.waitForTimeout(800);
        await page
            .getByRole('button', { name: /Submit vote/ })
            .first()
            .click();
        await page.waitForTimeout(4000);
        await shot(page, 'dialog-vote-transaction', { fullPage: false });
        await ctx.close();
    },
    async mobileNav(browser) {
        const ctx = await setupContext(browser, {
            viewport: { width: 390, height: 844 },
            isMobile: true,
            initScript: seedWorkspace,
        });
        const page = await ctx.newPage();
        await go(page, `${TV}/dashboard`);
        const btns = await page.evaluate(() =>
            [...document.querySelectorAll('header button, nav button, button')]
                .slice(0, 12)
                .map(
                    (b) =>
                        `${b.getAttribute('aria-label')}|${b.textContent.slice(0, 20)}`,
                ),
        );
        console.log(btns.join('\n'));
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.mouse.click(366, 30);
        await page.waitForTimeout(2500);
        await shot(page, 'dialog-dao-navigation-mobile', { fullPage: false });
        await ctx.close();
    },
};

(async () => {
    const filter = process.argv[2];
    const browser = await chromium.launch();
    for (const [name, fn] of Object.entries(jobs)) {
        if (filter && filter !== name) {
            continue;
        }
        try {
            await fn(browser);
        } catch (e) {
            console.log('JOB FAILED', name, String(e).slice(0, 300));
        }
    }
    await browser.close();
})();

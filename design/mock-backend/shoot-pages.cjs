'use strict';
// Captures every static page. Usage: node shoot-pages.cjs [filter-substring]
const { chromium, setupContext, shot } = require('./shoot-lib.cjs');
const D = require('./data.cjs');
const viem = require(
    require.resolve('viem', {
        paths: [
            require('node:path').join(__dirname, '..', '..', 'apps', 'app'),
        ],
    }),
);

const TV = '/dao/ethereum-mainnet/meridian.dao.eth';
const MS = '/dao/ethereum-mainnet/atlas-grants.dao.eth';
const tvId = `ethereum-mainnet-${viem.getAddress(D.TV_DAO_ADDR)}`;
const msId = `ethereum-mainnet-${viem.getAddress(D.MS_DAO_ADDR)}`;
const WS = 'meridian-ecosystem';

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

const PAGES = [
    ['explore', '/'],
    ['dao-dashboard', `${TV}/dashboard`],
    ['dao-proposals', `${TV}/proposals`],
    ['dao-proposal-mgp-8-active', `${TV}/proposals/MGP-8`],
    ['dao-proposal-mgp-7-pending', `${TV}/proposals/MGP-7`],
    ['dao-proposal-mgp-6-executable', `${TV}/proposals/MGP-6`],
    ['dao-proposal-mgp-5-accepted', `${TV}/proposals/MGP-5`],
    ['dao-proposal-mgp-4-rejected', `${TV}/proposals/MGP-4`],
    ['dao-proposal-mgp-3-executed', `${TV}/proposals/MGP-3`],
    ['dao-proposal-mgp-2-executed', `${TV}/proposals/MGP-2`],
    ['dao-members', `${TV}/members`],
    ['dao-member-detail', `${TV}/members/${D.PEOPLE[0].address}`],
    ['dao-assets', `${TV}/assets`],
    ['dao-transactions', `${TV}/transactions`],
    ['dao-permissions', `${TV}/permissions`],
    ['dao-settings', `${TV}/settings`],
    ['dao-settings-process-mgp', `${TV}/settings/mgp`],
    ['ms-dashboard', `${MS}/dashboard`],
    ['ms-proposals', `${MS}/proposals`],
    ['ms-proposal-agc-5-active', `${MS}/proposals/AGC-5`],
    ['ms-proposal-agc-4-executable', `${MS}/proposals/AGC-4`],
    ['ms-proposal-agc-2-expired', `${MS}/proposals/AGC-2`],
    ['ms-proposal-agc-1-executed', `${MS}/proposals/AGC-1`],
    ['ms-proposal-agc-3-rejected', `${MS}/proposals/AGC-3`],
    ['ms-proposal-agc-6-pending', `${MS}/proposals/AGC-6`],
    ['ms-members', `${MS}/members`],
    ['ms-member-detail', `${MS}/members/${D.PEOPLE[2].address}`],
    ['ms-assets', `${MS}/assets`],
    ['ms-transactions', `${MS}/transactions`],
    ['ms-permissions', `${MS}/permissions`],
    ['ms-settings', `${MS}/settings`],
    ['ms-settings-process-agc', `${MS}/settings/agc`],
    ['create-workspace', '/create/workspace'],
    ...[
        'overview',
        'todos',
        'proposals',
        'members',
        'assets',
        'transactions',
    ].map((s) => [`workspace-all-${s}`, `/workspace/${WS}/all/${s}`]),
    ...[
        'overview',
        'todos',
        'proposals',
        'members',
        'assets',
        'transactions',
        'permissions',
        'settings',
    ].map((s) => [`workspace-account-${s}`, `/workspace/${WS}/${tvId}/${s}`]),
    ['workspace-edit', `/workspace/${WS}/edit`],
    ['not-found-404', '/this-page-does-not-exist'],
    [
        'dao-not-found',
        '/dao/ethereum-mainnet/0x000000000000000000000000000000000000dead/dashboard',
    ],
];

(async () => {
    const filter = process.argv[2];
    const browser = await chromium.launch();
    const ctx = await setupContext(browser, { initScript: seedWorkspace });
    const page = await ctx.newPage();
    for (const [name, url] of PAGES) {
        if (filter && !name.includes(filter)) {
            continue;
        }
        try {
            await shot(page, name, { url });
            if (name === 'dao-permissions' || name === 'ms-permissions') {
                await page.getByRole('switch').first().click();
                await page.waitForTimeout(2500);
                await shot(page, `${name}-including-dao-grants`);
                await page
                    .getByRole('tab', { name: 'Graph' })
                    .first()
                    .click()
                    .catch(() =>
                        page
                            .getByText('Graph', { exact: true })
                            .first()
                            .click(),
                    );
                await page.waitForTimeout(4000);
                await shot(page, `${name}-graph`);
            }
        } catch (e) {
            console.log('FAILED', name, String(e).slice(0, 200));
        }
    }
    if (!filter || filter === 'mobile') {
        const mctx = await setupContext(browser, {
            viewport: { width: 390, height: 844 },
            isMobile: true,
            initScript: seedWorkspace,
        });
        const mp = await mctx.newPage();
        await shot(mp, 'mobile-explore', { url: '/' });
        await shot(mp, 'mobile-dao-dashboard', { url: `${TV}/dashboard` });
    }
    await browser.close();
})();

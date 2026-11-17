'use strict';
// Captures every page that needs no interaction. Usage: node capture-pages.cjs [--update] [part of a shot name]
const {
    TV_ROUTE: TV,
    MS_ROUTE: MS,
    SPP_ROUTE: SPP,
    WORKSPACE_ID: WS,
    deps,
    newContext,
    workspaceSeed,
    settle,
    stableScreenshot,
    goto,
    shot,
    runCapture,
} = require('./lib.cjs');
const D = require('./data.cjs');
// Northstar Protocol, the staged-governance (SPP) DAO, built the way mock-server.cjs builds it.
const NS = require('./data-spp.cjs').build({ ...D, viem: deps.viem });

const seed = workspaceSeed();
const workspaceSections = (prefix, base, sections) =>
    sections.map((s) => [`${prefix}-${s}`, `${base}/${s}`]);

// [shot name, route, options]. Options: mobile (390x844), status (expected HTTP status, default 200),
// errorPage (the shot is meant to show an error page), permissions (also capture the two other views of the page).
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
    ['dao-permissions', `${TV}/permissions`, { permissions: true }],
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
    ['ms-permissions', `${MS}/permissions`, { permissions: true }],
    ['ms-settings', `${MS}/settings`],
    ['ms-settings-process-agc', `${MS}/settings/agc`],
    ['spp-dashboard', `${SPP}/dashboard`],
    ['spp-proposals', `${SPP}/proposals`],
    ['spp-proposal-nsp-8-approval-active', `${SPP}/proposals/NSP-8`],
    ['spp-proposal-nsp-7-advanceable', `${SPP}/proposals/NSP-7`],
    ['spp-proposal-nsp-6-veto-active', `${SPP}/proposals/NSP-6`],
    ['spp-proposal-nsp-5-vetoed', `${SPP}/proposals/NSP-5`],
    ['spp-proposal-nsp-4-executable', `${SPP}/proposals/NSP-4`],
    ['spp-proposal-nsp-3-expired', `${SPP}/proposals/NSP-3`],
    ['spp-proposal-nsp-2-executed', `${SPP}/proposals/NSP-2`],
    ['spp-proposal-nsp-1-rejected', `${SPP}/proposals/NSP-1`],
    ['spp-members', `${SPP}/members`],
    // The other tabs of the members page (daoUtils.getPluginTabId; a Safe tab adds the DAO address).
    [
        'spp-members-core-team',
        `${SPP}/members?members=${NS.MS_ADDR.toLowerCase()}-core-team`,
    ],
    [
        'spp-members-council-safe',
        `${SPP}/members?members=${NS.COUNCIL_SAFE.toLowerCase()}-safe-${NS.DAO_ADDR.toLowerCase()}`,
    ],
    [
        'spp-members-guardian-safe',
        `${SPP}/members?members=${NS.GUARDIAN_SAFE.toLowerCase()}-safe-${NS.DAO_ADDR.toLowerCase()}`,
    ],
    ['spp-member-detail', `${SPP}/members/${D.PEOPLE[0].address}`],
    ['spp-assets', `${SPP}/assets`],
    ['spp-transactions', `${SPP}/transactions`],
    ['spp-permissions', `${SPP}/permissions`, { permissions: true }],
    ['spp-settings', `${SPP}/settings`],
    ['spp-settings-process-nsp', `${SPP}/settings/nsp`],
    // Behind the safeAccountPage feature flag, which is on in the local environment (NEXT_PUBLIC_ENV=local).
    ['safe-account', `/safe/ethereum-mainnet/${NS.COUNCIL_SAFE}`],
    ...workspaceSections('workspace-all', `/workspace/${WS}/all`, [
        'overview',
        'todos',
        'proposals',
        'members',
        'assets',
        'transactions',
    ]),
    ...workspaceSections(
        'workspace-account',
        `/workspace/${WS}/${seed.tvAccountId}`,
        [
            'overview',
            'todos',
            'proposals',
            'members',
            'assets',
            'transactions',
            'permissions',
            'settings',
        ],
    ),
    [
        'workspace-account-member-detail',
        `/workspace/${WS}/${seed.tvAccountId}/members/${D.PEOPLE[0].address}`,
    ],
    [
        'workspace-account-proposal-mgp-8',
        `/workspace/${WS}/${seed.tvAccountId}/proposals/MGP-8`,
    ],
    ['workspace-edit', `/workspace/${WS}/edit`],
    [
        'not-found-404',
        '/this-page-does-not-exist',
        { status: 404, errorPage: true },
    ],
    [
        'dao-not-found',
        '/dao/ethereum-mainnet/0x000000000000000000000000000000000000dead/dashboard',
        { status: 404, errorPage: true },
    ],
    ['mobile-explore', '/', { mobile: true }],
    ['mobile-dao-dashboard', `${TV}/dashboard`, { mobile: true }],
];

const jobs = PAGES.map(([name, route, opts = {}]) => ({
    name,
    run: async (browser) => {
        const context = await newContext(browser, {
            mobile: opts.mobile,
            initScripts: [seed.script],
        });
        const page = await context.newPage();
        await goto(page, route, opts);
        await shot(page, name, opts);
        if (opts.permissions) {
            await page.getByRole('switch').first().click();
            await shot(page, `${name}-including-dao-grants`);
            await page.getByRole('radio', { name: 'Graph' }).click();
            await page.locator('.react-flow__node').first().waitFor();
            await settle(page);
            await stableScreenshot(page, true);
            // React Flow measures where the edges attach while its viewport is still zooming to fit, which leaves
            // rounding noise in the edge paths (now and then a pixel of antialiasing). The graph is at rest now:
            // make it measure again. Shrinking the content box of each node by a pixel, with the same outer size,
            // fires React Flow's resize observer without changing the layout.
            await page.evaluate(() => {
                for (const node of document.querySelectorAll(
                    '.react-flow__node',
                )) {
                    node.style.height = `${node.offsetHeight}px`;
                    node.style.boxSizing = 'border-box';
                    node.style.paddingBottom = '1px';
                }
            });
            await shot(page, `${name}-graph`);
        }
    },
}));

runCapture(jobs, (name, filter) => name.includes(filter));

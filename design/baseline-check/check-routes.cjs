'use strict';
// Route coverage: every page route of the app (each page.tsx under apps/app/src/app) needs a reference screenshot in
// design/reference, or a reason in SKIP. Fails on a route that has neither, on a listed screenshot that does not
// exist, and on an entry whose route is gone. Usage: node check-routes.cjs
const fs = require('node:fs');
const path = require('node:path');
const { REPO, REFERENCE } = require('./lib.cjs');

const APP = path.join(REPO, 'apps', 'app', 'src', 'app');
const DAO = 'dao/[network]/[addressOrEns]';
const WS = 'workspace/[workspaceId]/(workspacePage)';

// Route (the folder of its page.tsx, relative to apps/app/src/app) -> the reference that shows it. One is enough;
// the capture scripts take more (other states, other DAOs, mobile).
const COVERED = {
    '': 'explore',
    'create/dao': 'create-dao-step1-chain',
    'create/workspace': 'create-workspace-step1-empty',
    [`${DAO}/(daoPage)/dashboard`]: 'dao-dashboard',
    [`${DAO}/(daoPage)/proposals`]: 'dao-proposals',
    [`${DAO}/(daoPage)/proposals/[proposalSlug]`]: 'dao-proposal-mgp-8-active',
    [`${DAO}/(daoPage)/members`]: 'dao-members',
    [`${DAO}/(daoPage)/members/[address]`]: 'dao-member-detail',
    [`${DAO}/(daoPage)/assets`]: 'dao-assets',
    [`${DAO}/(daoPage)/transactions`]: 'dao-transactions',
    [`${DAO}/(daoPage)/permissions`]: 'dao-permissions',
    [`${DAO}/(daoPage)/settings`]: 'dao-settings',
    [`${DAO}/(daoPage)/settings/[slug]`]: 'dao-settings-process-mgp',
    [`${DAO}/create/[pluginAddress]/proposal`]: 'create-proposal-step1-empty',
    [`${DAO}/create/[pluginAddress]/process`]: 'create-process-step1-empty',
    [`${DAO}/create/execute`]: 'create-execute-step1',
    'safe/[network]/[address]': 'safe-account',
    [`${WS}/all/overview`]: 'workspace-all-overview',
    [`${WS}/all/todos`]: 'workspace-all-todos',
    [`${WS}/all/proposals`]: 'workspace-all-proposals',
    [`${WS}/all/members`]: 'workspace-all-members',
    [`${WS}/all/assets`]: 'workspace-all-assets',
    [`${WS}/all/transactions`]: 'workspace-all-transactions',
    [`${WS}/[accountId]/overview`]: 'workspace-account-overview',
    [`${WS}/[accountId]/todos`]: 'workspace-account-todos',
    [`${WS}/[accountId]/proposals`]: 'workspace-account-proposals',
    [`${WS}/[accountId]/proposals/[proposalSlug]`]:
        'workspace-account-proposal-mgp-8',
    [`${WS}/[accountId]/members`]: 'workspace-account-members',
    [`${WS}/[accountId]/members/[address]`]: 'workspace-account-member-detail',
    [`${WS}/[accountId]/assets`]: 'workspace-account-assets',
    [`${WS}/[accountId]/transactions`]: 'workspace-account-transactions',
    [`${WS}/[accountId]/permissions`]: 'workspace-account-permissions',
    [`${WS}/[accountId]/settings`]: 'workspace-account-settings',
    'workspace/[workspaceId]/[accountId]/create/execute':
        'workspace-create-execute-step1',
    'workspace/[workspaceId]/edit': 'workspace-edit',
};

// Routes without a reference, and why. Keep this short: a new page belongs in COVERED.
const SKIP = {
    // Automations (capital flow): out of scope of the baseline for now.
    [`${DAO}/(daoPage)/settings/automations/[id]`]: 'automations, out of scope',
    [`${DAO}/create/[pluginAddress]/policy`]: 'automations, out of scope',
    // DaoPluginPage: only the gauge-voter and capital-distributor plugins register pages here, and no mock DAO has
    // either; for the mock DAOs every URL below it is the DAO not-found page.
    [`${DAO}/(daoPage)/[...segments]`]:
        'plugin pages, no mock DAO has a plugin that registers one',
    // Client-side redirect to the first workspace (/workspace/<id>/all/overview); shows a spinner only.
    workspace: 'redirect only',
    // Catch-alls that only call notFound(), so a mistyped section 404s inside the workspace layout.
    [`${WS}/all/[...section]`]: 'notFound() only',
    [`${WS}/[accountId]/[...section]`]: 'notFound() only',
};

const routes = [];
const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            walk(full);
        } else if (entry.name === 'page.tsx') {
            routes.push(path.relative(APP, dir).split(path.sep).join('/'));
        }
    }
};
walk(APP);
routes.sort();

const problems = [];
for (const route of routes) {
    const reference = COVERED[route];
    if (reference != null) {
        const file = path.join(REFERENCE, `${reference}.webp`);
        const ok = fs.existsSync(file);
        console.log(
            `${ok ? 'ok     ' : 'MISSING'} /${route} -> ${reference}.webp`,
        );
        if (!ok) {
            problems.push(
                `/${route}: design/reference/${reference}.webp does not exist`,
            );
        }
    } else if (SKIP[route] != null) {
        console.log(`skip    /${route} (${SKIP[route]})`);
    } else {
        console.log(`NONE    /${route}`);
        problems.push(`/${route}: no reference and not in SKIP`);
    }
}
for (const route of [...Object.keys(COVERED), ...Object.keys(SKIP)]) {
    if (!routes.includes(route)) {
        problems.push(
            `/${route} is listed in check-routes.cjs but has no page.tsx`,
        );
    }
}

const count = (list) => routes.filter((route) => list[route] != null).length;
console.log(
    `\n${routes.length} routes: ${count(COVERED)} with a reference, ${count(SKIP)} skipped`,
);
if (problems.length > 0) {
    console.error(
        `\n${problems.length} problem(s):\n${problems.map((p) => `  - ${p}`).join('\n')}`,
    );
    process.exit(1);
}

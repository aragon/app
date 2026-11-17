'use strict';
// Walks through the creation wizards as nadia.eth and captures each step.
// Usage: node capture-wizards.cjs [--update]
//   [createDao|createWorkspace|createProposal|execute|createProcess|sppCreateProposal|workspaceExecute]
const {
    TV_ROUTE: TV,
    SPP_ROUTE: SPP,
    WORKSPACE_ID: WS,
    deps,
    newContext,
    workspaceSeed,
    gotoConnected,
    shot,
    runCapture,
} = require('./lib.cjs');
const D = require('./data.cjs');
const walletScript = require('./wallet-inject.cjs');
const NS = require('./data-spp.cjs').build({ ...D, viem: deps.viem });
const seed = workspaceSeed();
// Wizards that run inside the mock workspace, whose context also gets the workspace seed.
const IN_WORKSPACE = new Set(['workspaceExecute']);

const viewport = { fullPage: false };
const NADIA = D.PEOPLE[0];
const enter = (page, route) => gotoConnected(page, route, NADIA.ens);

const stepNumber = (page) =>
    page.evaluate(() =>
        Number(document.body.textContent.match(/Step\s*(\d+)/)?.[1]),
    );
// Clicks "Next" and waits until the wizard shows the following step.
const next = async (page) => {
    const before = await stepNumber(page);
    await page.getByRole('button', { name: /^Next/ }).last().click();
    await page.waitForFunction(
        (step) =>
            Number(document.body.textContent.match(/Step\s*(\d+)/)?.[1]) ===
            step,
        before + 1,
    );
};

// Adds a "Transfer" action from the action menu and fills it in: USDC to the Atlas Grants Council.
const openTransferAction = async (page) => {
    await page.getByRole('button', { name: /^Action$/ }).click();
    await page.getByRole('option', { name: 'Transfer' }).waitFor();
};
const fillTransfer = async (page, amount, shots = {}) => {
    await page.getByRole('option', { name: 'Transfer' }).click();
    await page.getByRole('button', { name: /^Select$/ }).waitFor();
    if (shots.empty) {
        await shot(page, shots.empty);
    }
    await page.getByRole('button', { name: /^Select$/ }).click();
    const assets = page.getByRole('dialog');
    const usdc = assets.getByRole('button', { name: /USD Coin/ });
    await usdc.waitFor();
    if (shots.dialog) {
        await shot(page, shots.dialog, viewport);
    }
    await usdc.click();
    await assets.waitFor({ state: 'hidden' });
    await page.locator('main input[type=number]').first().fill(amount);
    const recipient = page.getByPlaceholder(/ENS or 0x/).first();
    await recipient.click();
    await page.keyboard.type('atlas-grants.dao.eth');
    // The field resolves the ENS name to an address; leaving it shows the resolved account.
    await page.getByRole('heading', { name: 'Add actions' }).click();
};

const wizards = {
    async createDao(page) {
        await enter(page, '/create/dao');
        await shot(page, 'create-dao-step1-chain');
        await page.getByText('Ethereum', { exact: true }).first().click();
        await next(page);
        await shot(page, 'create-dao-step2-describe-empty');
        await page.getByRole('textbox').nth(0).fill('Meridian Labs');
        await page.getByRole('textbox').nth(1).fill('meridian-labs');
        await page
            .locator('textarea')
            .first()
            .fill(
                'Meridian is a community-owned protocol for cross-chain liquidity routing. MRD holders steer the treasury and fund public goods.',
            );
        await page.getByRole('button', { name: /^Add$/ }).click();
        await page.getByLabel('URL', { exact: true }).fill('https://meridian.xyz');
        await page.getByLabel(/Link text/).fill('Website');
        await shot(page, 'create-dao-step2-describe-filled');
        await page.getByRole('button', { name: /Publish DAO/ }).last().click();
        await page
            .getByRole('dialog')
            .getByRole('button', { name: 'Sign transaction' })
            .waitFor();
        await shot(page, 'dialog-publish-dao-transaction', viewport);
    },
    async createWorkspace(page) {
        await enter(page, '/create/workspace');
        await shot(page, 'create-workspace-step1-empty');
        await page.getByLabel(/Workspace name/).fill('Meridian Ecosystem');
        await page
            .getByLabel(/Description/)
            .fill(
                'Treasury and governance of Meridian DAO and the Atlas Grants Council in one place.',
            );
        await shot(page, 'create-workspace-step1-filled');
        await next(page);
        await shot(page, 'create-workspace-step2');
        await next(page);
        await shot(page, 'create-workspace-step3');
    },
    async createProposal(page) {
        await enter(page, `${TV}/create/${D.TV_PLUGIN}/proposal`);
        await shot(page, 'create-proposal-step1-empty');
        await page
            .getByRole('textbox')
            .first()
            .fill('Fund the Q2 2027 Ecosystem Grants Program');
        await page
            .locator('textarea')
            .first()
            .fill(
                'Allocate 300,000 USDC to the Ecosystem Grants Program to fund integrations, tooling and research during Q2 2027.',
            );
        await page.locator('[contenteditable="true"]').first().click();
        await page.keyboard.type(
            'Over the last two quarters Meridian has grown routed volume by 38%. This proposal continues the grants program ratified in MGP-8.',
        );
        await shot(page, 'create-proposal-step1-filled');
        await next(page);
        await shot(page, 'create-proposal-step2-actions');
        await openTransferAction(page);
        await shot(page, 'create-proposal-step2-action-menu', viewport);
        await fillTransfer(page, '300000', {
            empty: 'create-proposal-step2-transfer-empty',
            dialog: 'dialog-select-asset',
        });
        await shot(page, 'create-proposal-step2-transfer-filled');
        await page.getByRole('button', { name: /^Next/ }).last().click();
        await page.getByText('Skip simulation').waitFor();
        await shot(page, 'create-proposal-step2-next-menu', viewport);
        await page.getByText('Skip simulation').click();
        await page.getByRole('button', { name: /Publish proposal/ }).waitFor();
        await shot(page, 'create-proposal-step3-settings');
        await page
            .getByRole('button', { name: /Publish proposal/ })
            .last()
            .click();
        await page
            .getByRole('dialog')
            .getByRole('button', { name: 'Sign transaction' })
            .waitFor();
        await shot(page, 'dialog-publish-proposal-transaction', viewport);
    },
    async execute(page) {
        await enter(page, `${TV}/create/execute`);
        await shot(page, 'create-execute-step1');
        await openTransferAction(page);
        await shot(page, 'create-execute-action-menu', viewport);
        await fillTransfer(page, '25000');
        await shot(page, 'create-execute-transfer-filled');
    },
    async createProcess(page) {
        await enter(page, `${TV}/create/${D.TV_PLUGIN}/process`);
        await shot(page, 'create-process-step1-empty');
        await page.getByRole('textbox').nth(0).fill('Treasury Council');
        await page.getByRole('textbox').nth(1).fill('TRC');
        await page
            .locator('textarea')
            .first()
            .fill(
                'A five-member council that approves treasury operations up to 250,000 USDC per proposal.',
            );
        await shot(page, 'create-process-step1-filled');
        await next(page);
        await shot(page, 'create-process-step2-governance-design');
        await page.getByRole('button', { name: /Add voting body/ }).click();
        await page.getByRole('dialog').waitFor();
        await shot(page, 'dialog-create-process-add-voting-body', viewport);
    },
    async sppCreateProposal(page) {
        await enter(page, `${SPP}/create/${NS.SPP_ADDR}/proposal`);
        await shot(page, 'spp-create-proposal-step1-empty');
    },
    async workspaceExecute(page) {
        await enter(page, `/workspace/${WS}/${seed.tvAccountId}/create/execute`);
        await shot(page, 'workspace-create-execute-step1');
    },
};

const jobs = Object.entries(wizards).map(([name, wizard]) => ({
    name,
    run: async (browser) => {
        const context = await newContext(browser, {
            initScripts: [
                walletScript(NADIA.address),
                ...(IN_WORKSPACE.has(name) ? [seed.script] : []),
            ],
        });
        await wizard(await context.newPage());
    },
}));

runCapture(jobs, (name, filter) => name === filter);

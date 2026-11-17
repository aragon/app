'use strict';
// Click through the wizards and capture one screenshot per step. Usage: node shoot-wizards.cjs [which]
const {
    chromium,
    setupContext,
    shot,
    settle,
    BASE,
} = require('./shoot-lib.cjs');
const D = require('./data.cjs');
const inject = require('./wallet-inject.cjs');

const TV = '/dao/ethereum-mainnet/meridian.dao.eth';
const MS = '/dao/ethereum-mainnet/atlas-grants.dao.eth';

const stepText = (page) =>
    page.evaluate(
        () => (document.body.textContent.match(/Step\s*\n?\s*(\d+)/) || [])[1],
    );
const next = async (page) => {
    const before = await stepText(page);
    await page.getByRole('button', { name: /^Next/ }).last().click();
    for (let i = 0; i < 30; i++) {
        await page.waitForTimeout(500);
        if ((await stepText(page)) !== before) {
            break;
        }
    }
    await page.waitForTimeout(2500);
    await page.evaluate(() => window.scrollTo(0, 0));
};
const dump = async (page) => {
    const t = await page.evaluate(() =>
        document.body.textContent.slice(0, 1500),
    );
    console.log('---- page text ----\n', t);
};

const wizards = {
    async createDao(page) {
        await page.goto(`${BASE}/create/dao`, {
            waitUntil: 'domcontentloaded',
        });
        await settle(page, 4000);
        await shot(page, 'create-dao-step1-chain');
        await page.getByText('Ethereum', { exact: true }).first().click();
        await page.waitForTimeout(500);
        await next(page);
        await shot(page, 'create-dao-step2-describe-empty');
        const boxes = page.getByRole('textbox');
        await boxes.nth(0).fill('Meridian Labs');
        await boxes.nth(1).fill('meridian-labs');
        await page
            .locator('textarea')
            .first()
            .fill(
                'Meridian is a community-owned protocol for cross-chain liquidity routing. MRD holders steer the treasury and fund public goods.',
            );
        await page
            .getByRole('button', { name: /^Add$/ })
            .first()
            .click()
            .catch(() => undefined);
        await page.waitForTimeout(500);
        const after = page.getByRole('textbox');
        const n = await after.count();
        if (n >= 5) {
            await after.nth(n - 2).fill('https://meridian.xyz');
            await after.nth(n - 1).fill('Website');
        }
        await page.waitForTimeout(800);
        await shot(page, 'create-dao-step2-describe-filled');
        await page
            .getByRole('button', { name: /Publish DAO/ })
            .last()
            .click()
            .catch((e) => console.log('submit', String(e).slice(0, 100)));
        await page.waitForTimeout(3000);
        await shot(page, 'dialog-publish-dao-transaction', { fullPage: false });
        await dump(page);
    },
    async createWorkspace(page) {
        await page.goto(`${BASE}/create/workspace`, {
            waitUntil: 'domcontentloaded',
        });
        await settle(page, 4000);
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
        await dump(page);
        await next(page).catch(() => undefined);
        await shot(page, 'create-workspace-step3');
        await dump(page);
    },
    async createProposal(page) {
        await page.goto(`${BASE}${TV}/create/${D.TV_PLUGIN}/proposal`, {
            waitUntil: 'domcontentloaded',
        });
        await settle(page, 5000);
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
        const editor = page.locator('[contenteditable="true"]').first();
        if (await editor.count()) {
            await editor.click();
            await page.keyboard.type(
                'Over the last two quarters Meridian has grown routed volume by 38%. This proposal continues the grants program ratified in MGP-8.',
            );
        }
        await page.waitForTimeout(800);
        await shot(page, 'create-proposal-step1-filled');
        await next(page);
        await shot(page, 'create-proposal-step2-actions');
        await dump(page);
        await page
            .getByRole('button', { name: /^Action$/ })
            .first()
            .click();
        await page.waitForTimeout(1500);
        await shot(page, 'create-proposal-step2-action-menu', {
            fullPage: false,
        });
        await page
            .getByRole('option', { name: /Transfer/ })
            .first()
            .click()
            .catch(async () => {
                await page
                    .getByText('Transfer', { exact: true })
                    .first()
                    .click();
            });
        await page.waitForTimeout(2000);
        await shot(page, 'create-proposal-step2-transfer-empty');
        await dump(page);
        try {
            await page
                .getByRole('button', { name: /^Select$/ })
                .first()
                .click();
            await page.waitForTimeout(3000);
            await shot(page, 'dialog-select-asset', { fullPage: false });
            await page.mouse.click(700, 391);
            console.log('asset selected');
            await page.waitForTimeout(1500);
            await page
                .locator('main input[type=number]')
                .first()
                .fill('300000', { timeout: 8000 });
            console.log('amount filled');
            const recipient = page.getByPlaceholder(/ENS or 0x/).first();
            await recipient.click();
            await page.keyboard.type('atlas-grants.dao.eth');
            await page.waitForTimeout(3000);
            await page.mouse.click(5, 300);
            await page.waitForTimeout(1500);
            await shot(page, 'create-proposal-step2-transfer-filled');
        } catch (e) {
            console.log('transfer fill failed', String(e).slice(0, 200));
        }
        await page.getByRole('button', { name: /^Next/ }).last().click();
        await page.waitForTimeout(1500);
        await shot(page, 'create-proposal-step2-next-menu', {
            fullPage: false,
        });
        await page.getByText('Skip simulation').first().click();
        await page.waitForTimeout(4000);
        await page.evaluate(() => window.scrollTo(0, 0));
        await shot(page, 'create-proposal-step3-settings');
        await dump(page);
        await page
            .getByRole('button', { name: /Publish proposal/ })
            .last()
            .click();
        await page.waitForTimeout(5000);
        await shot(page, 'dialog-publish-proposal-transaction', {
            fullPage: false,
        });
        await dump(page);
    },
    async createProposalMs(page) {
        await page.goto(`${BASE}${MS}/create/${D.MS_PLUGIN}/proposal`, {
            waitUntil: 'domcontentloaded',
        });
        await settle(page, 5000);
        await shot(page, 'ms-create-proposal-step1-empty');
    },
    async execute(page) {
        await page.goto(`${BASE}${TV}/create/execute`, {
            waitUntil: 'domcontentloaded',
        });
        await settle(page, 5000);
        await shot(page, 'create-execute-step1');
        await page
            .getByRole('button', { name: /^Action$/ })
            .first()
            .click();
        await page.waitForTimeout(1500);
        await shot(page, 'create-execute-action-menu', { fullPage: false });
        await page.getByText('Transfer', { exact: true }).first().click();
        await page.waitForTimeout(2000);
        await page
            .getByRole('button', { name: /^Select$/ })
            .first()
            .click();
        await page.waitForTimeout(3000);
        await page.mouse.click(700, 391);
        await page.waitForTimeout(1500);
        await page
            .locator('main input[type=number]')
            .first()
            .fill('25000', { timeout: 8000 });
        await page
            .getByPlaceholder(/ENS or 0x/)
            .first()
            .click();
        await page.keyboard.type('atlas-grants.dao.eth');
        await page.waitForTimeout(3000);
        await page.mouse.click(5, 300);
        await page.waitForTimeout(1500);
        await shot(page, 'create-execute-transfer-filled');
    },
    async createProcess(page) {
        await page.goto(`${BASE}${TV}/create/${D.TV_PLUGIN}/process`, {
            waitUntil: 'domcontentloaded',
        });
        await settle(page, 5000);
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
        await page
            .getByRole('button', { name: /Add voting body/ })
            .first()
            .click();
        await page.waitForTimeout(2500);
        await shot(page, 'dialog-create-process-add-voting-body', {
            fullPage: false,
        });
        await dump(page);
    },
};

(async () => {
    const which = process.argv[2];
    const browser = await chromium.launch();
    for (const [name, fn] of Object.entries(wizards)) {
        if (which && which !== name) {
            continue;
        }
        const ctx = await setupContext(browser, {
            initScript: inject(D.PEOPLE[0].address),
        });
        const page = await ctx.newPage();
        page.on('pageerror', (e) =>
            console.log('pageerror:', String(e).slice(0, 200)),
        );
        try {
            await fn(page);
        } catch (e) {
            console.log('WIZARD FAILED', name, String(e).slice(0, 300));
            await shot(page, `${name}-failure-state`).catch(() => undefined);
        }
        await ctx.close();
    }
    await browser.close();
})();

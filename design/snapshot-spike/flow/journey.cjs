'use strict';
// Spike3 journey: the governance designer ("Create governance process" wizard on Meridian, wallet nadia.eth).
// Drives the running app; at each state `snap(id, title, opts)` writes app/<id>.png and ir/<id>.json and appends the
// state to states.json (the board order). id = GD_<row>_<nn>_<slug>. targets: [locator, next state id] = what the
// script clicks next (becomes a link to that state's file).
// Usage: node journey.cjs [row ...]   (default: all rows)
const fs = require('node:fs');
const path = require('node:path');
const L = require('/home/user/app/design/baseline-check/lib.cjs');
const D = require('/home/user/app/design/baseline-check/data.cjs');

const HERE = __dirname;
const [CANVAS, IR, APP] = ['canvas', 'ir', 'app'].map((d) => path.join(HERE, d));
for (const d of [CANVAS, IR, APP]) fs.mkdirSync(d, { recursive: true });
const ROWS = process.argv.slice(2).length ? process.argv.slice(2).map(Number) : [1, 2, 3, 4];
const ROUTE = `${L.TV_ROUTE}/create/${D.TV_PLUGIN}/process`;
const extract = fs.readFileSync(path.join(HERE, 'extract-in-page.js'), 'utf8');
const SAFE = D.addr('safe-northstar-council'); // the Northstar council Safe of data-spp.cjs

(async () => {
    const t0 = Date.now();
    const timing = {};
    const states = [];
    const browser = await L.launch();
    const context = await L.newContext(browser, { initScripts: [require('/home/user/app/design/baseline-check/wallet-inject.cjs')(D.PEOPLE[0].address)] });
    let page;

    // ---- harness (same as spike2) ----
    const ensureKit = () =>
        page.evaluate(async () => {
            if (window.__spikeKit) return true;
            const script = [...document.scripts].find((s) => s.src.includes('gov-ui-kit_dist'));
            const text = await (await fetch(script.src)).text();
            const m = text.match(/"(\[project\][^"]*gov-ui-kit\/dist\/index\.es\.js \[app-client\] \(ecmascript\))"/);
            TURBOPACK.push([script, 'spike-kit-probe', (ctx) => { window.__spikeKit = ctx.i(m[1]); }]);
            TURBOPACK.push({ otherChunks: [], runtimeModuleIds: ['spike-kit-probe'] });
            for (let i = 0; i < 50 && !window.__spikeKit; i++) await new Promise((r) => setTimeout(r, 20));
            return !!window.__spikeKit;
        });
    // Spike3 links (v2): every Playwright click / fill / key press is recorded as an event of the current "cursor"
    // state. The cursor is the last snap, or a state named by at(id) (a snap-less marker: "the page now IS that board
    // state"), or null after lost() (the page is in a state that is not on the board). At each snap and at each at(),
    // the events since the cursor become an edge {from, to, events}; assemble.cjs turns edges into links.
    let cursor = null;
    let cursorBy = null; // 'snap' | 'at'
    let pageExport = null; // id of the state whose export is in the current page (xids of __xHit refer to it)
    let events = [];
    const edges = [];
    const LocatorProto = Object.getPrototypeOf((await context.newPage().then(async (p) => { const l = p.locator('body'); await p.close(); return l; })));
    const origClick = LocatorProto.click;
    const origFill = LocatorProto.fill;
    LocatorProto.click = async function (...args) {
        const rec = await this.evaluate((el) => {
            const c = el.closest('button,a,[role=button],[role=radio]') ?? el;
            const text = (c.getAttribute('aria-label') || c.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 80);
            const hit = window.__xHit ? window.__xHit(el) : null;
            return { text, role: c.getAttribute('role') ?? c.tagName.toLowerCase(), tag: el.tagName.toLowerCase(), inDialog: !!el.closest('[role=dialog]'), xid: hit?.xid ?? null, what: hit?.what ?? null };
        }, undefined, { timeout: 5000 }).catch((e) => ({ error: String(e.message).split('\n')[0] }));
        events.push({ ev: 'click', exportOf: pageExport, locator: String(this), ...rec });
        return origClick.apply(this, args);
    };
    LocatorProto.fill = async function (...args) {
        events.push({ ev: 'type', locator: String(this) });
        return origFill.apply(this, args);
    };
    const hookKeyboard = (p) => {
        const kb = p.keyboard;
        const [t, pr] = [kb.type.bind(kb), kb.press.bind(kb)];
        kb.type = async (...a) => { events.push({ ev: 'type', keys: 'text' }); return t(...a); };
        kb.press = async (k, ...a) => { events.push({ ev: 'key', key: k }); return pr(k, ...a); };
    };
    const closeEdge = (to, kind) => {
        if (cursor) edges.push({ from: cursor, fromBy: cursorBy, to, toBy: kind, events });
        events = [];
    };
    const at = (id) => { closeEdge(id, 'at'); cursor = id; cursorBy = 'at'; console.log(`  at ${id}`); };
    const lost = () => { events = []; cursor = null; cursorBy = null; };
    const snap = async (id, title, { viewport = false, settleMs = 20000 } = {}) => {
        const targets = []; // spike3 links: targets are recorded from clicks now
        const ts = Date.now();
        await Promise.race([L.settle(page), new Promise((_, rej) => setTimeout(() => rej(new Error('settle timeout')), settleMs))]).catch((e) => console.log(`  ${id}: not settled (${String(e.message).slice(0, 120)})`));
        if (!viewport) await page.evaluate(() => window.scrollTo(0, 0));
        fs.writeFileSync(path.join(APP, `${id}.png`), await L.stableScreenshot(page, !viewport));
        await page.evaluate(() => { window.__xTargets = []; });
        for (const [loc, to] of targets) {
            await loc.first().evaluate((el, t) => { window.__xTargets.push({ el, to: t }); }, to, { timeout: 2000 }).catch(() => console.log(`  target not found -> ${to}`));
        }
        if (!(await ensureKit())) throw new Error('kit module not found');
        const result = await page.evaluate((src) => (0, eval)(src)(window.__spikeKit), extract);
        const scrollY = await page.evaluate(() => window.scrollY);
        fs.writeFileSync(path.join(IR, `${id}.json`), JSON.stringify({ name: id, title, viewport, scrollY, url: page.url(), htmlAttrs: result.htmlAttrs, body: result.body, stats: result.stats }));
        states.push({ id, title, viewport });
        closeEdge(id, 'snap');
        cursor = id; cursorBy = 'snap'; pageExport = id;
        timing[id] = Date.now() - ts;
        console.log(`${id}: ${timing[id]} ms, targets ${JSON.stringify(result.stats.targets ?? [])}`);
    };

    // ---- app vocabulary ----
    const btn = (name) => page.getByRole('button', { name });
    const nextBtn = () => btn(/^Next$/).last();
    const dlg = () => page.getByRole('dialog').last();
    const dBtn = (name) => dlg().getByRole('button', { name });
    const dNext = () => dBtn(/^(Next|Save)$/).last();
    const stepIs = (n) => page.waitForFunction((s) => Number(document.body.textContent.match(/Step\s*(\d+)/)?.[1]) === s, n);
    const open = async () => {
        if (page) await page.close();
        page = await context.newPage();
        hookKeyboard(page);
        pageExport = null;
        lost();
        await L.gotoConnected(page, ROUTE, D.PEOPLE[0].ens);
    };
    const fillStep1 = async () => {
        await page.getByRole('textbox').nth(0).fill('Treasury Council');
        await page.getByRole('textbox').nth(1).fill('TRC');
        await page.locator('textarea').first().fill('A five-member council that approves treasury operations up to 250,000 USDC per proposal.');
    };
    const toStep2 = async () => { await open(); at('GD_1_01_step1-empty'); await fillStep1(); await nextBtn().click(); await stepIs(2); at('GD_1_03_designer-basic-empty'); };
    const toAdvanced = async () => { await toStep2(); await page.getByRole('radio', { name: 'Advanced' }).click(); await btn(/^Add stage$/).waitFor(); };
    const pickType = async (label) => { await dlg().getByRole('radio', { name: new RegExp(`^${label}`) }).click(); await dNext().click(); };
    const fillToken = async () => {
        await dlg().locator('input[name="membership.token.name"]').fill('Treasury Council Token');
        await dlg().locator('input[name="membership.token.symbol"]').fill('TRC');
        await dlg().locator('input[name="membership.members.0.tokenAmount"]').fill('1000000');
    };
    const fillMultisig = async () => {
        // nadia.eth is prefilled as the first member; add two more.
        for (const p of [D.PEOPLE[1], D.PEOPLE[2]]) {
            await dBtn(/^Add$/).click();
            const ta = dlg().locator('textarea').last();
            await ta.click();
            await page.keyboard.type(p.ens ?? p.address);
            await page.keyboard.press('Tab');
            await page.waitForFunction(() => [...document.querySelectorAll('[role=dialog] textarea')].every((t) => !t.value), null, { timeout: 1500 }).catch(() => undefined);
        }
    };
    const stage = (i) => page.locator(`input[name="stages.${i}.name"]`).locator('xpath=ancestor::*[.//button[normalize-space()="Add body"]][1]');
    // A sub-plugin body added in one go (no snaps): type, name, proposal type, membership, governance.
    const addSubBody = async (i, type, name, kind = 'Approval') => {
        await stage(i).getByRole('button', { name: 'Add body' }).click();
        await dlg().waitFor();
        await pickType(type);
        await dlg().locator('input[name="name"]').fill(name);
        await dNext().click();
        await dlg().getByRole('radio', { name: new RegExp(`^${kind}`) }).click();
        await dNext().click();
        if (type === 'Token voting') await fillToken();
        if (type === 'Multisig') await fillMultisig();
        await dNext().click();
        await dNext().click();
        await dlg().waitFor({ state: 'hidden' });
    };

    // ---- Row 1: main path, Basic ----
    if (ROWS.includes(1)) {
        await open();
        await snap('GD_1_01_step1-empty', 'Step 1 · empty');
        await fillStep1();
        await snap('GD_1_02_step1-filled', 'Step 1 · filled', { targets: [[nextBtn(), 'GD_1_03_designer-basic-empty']] });
        await nextBtn().click();
        await stepIs(2);
        await snap('GD_1_03_designer-basic-empty', 'Designer · Basic, no body', { targets: [[btn(/Add voting body/), 'GD_1_04_body-type']] });
        await btn(/Add voting body/).click();
        await dlg().waitFor();
        await snap('GD_1_04_body-type', 'Add voting body · choose type', { viewport: true });
        await pickType('Token voting');
        await snap('GD_1_05_body-token-membership', 'Token voting · membership (new token)', { viewport: true });
        await fillToken();
        await snap('GD_1_06_body-token-membership-filled', 'Token voting · membership filled', { viewport: true, targets: [[dNext(), 'GD_1_07_body-token-governance']] });
        await dNext().click();
        await dlg().locator('input[name="governance.supportThreshold"]').waitFor();
        await snap('GD_1_07_body-token-governance', 'Token voting · governance', { viewport: true, targets: [[dNext(), 'GD_1_08_designer-basic-body']] });
        await dNext().click();
        await dlg().waitFor({ state: 'hidden' });
        await snap('GD_1_08_designer-basic-body', 'Designer · Basic with body', { targets: [[nextBtn(), 'GD_1_09_step3-proposal-creation']] });
        await nextBtn().click();
        await stepIs(3);
        await snap('GD_1_09_step3-proposal-creation', 'Step 3 · proposal creation', { targets: [[nextBtn(), 'GD_1_10_step4-permissions']] });
        await nextBtn().click();
        await stepIs(4);
        await snap('GD_1_10_step4-permissions', 'Step 4 · permissions', { targets: [[btn(/Publish process/), 'GD_1_11_publish-dialog']] });
        await btn(/Publish process/).click();
        await dBtn('Sign transaction').waitFor();
        await snap('GD_1_11_publish-dialog', 'Publish process · tx 1 of 2', { viewport: true });
    }

    // ---- Row 2: Advanced path ----
    if (ROWS.includes(2)) {
        await toAdvanced();
        await snap('GD_2_01_advanced-empty', 'Designer · Advanced, no stages', { targets: [[btn(/^Add stage$/), 'GD_2_02_stage-added']] });
        await btn(/^Add stage$/).click();
        await page.locator('input[name="stages.0.name"]').fill('Council approval');
        await snap('GD_2_02_stage-added', 'Stage 1 added', { targets: [[stage(0).getByRole('button', { name: 'Add body' }), 'GD_2_03_sub-body-type']] });
        await stage(0).getByRole('button', { name: 'Add body' }).click();
        await dlg().waitFor();
        await snap('GD_2_03_sub-body-type', 'Add body · type (stage)', { viewport: true });
        await pickType('Multisig');
        await dlg().locator('input[name="name"]').fill('Treasury Council');
        await dlg().locator('textarea[name="description"]').fill('Five council members approve treasury operations.');
        await snap('GD_2_04_sub-body-metadata', 'Add body · name and description', { viewport: true });
        await dNext().click();
        await snap('GD_2_05_sub-body-proposal-type', 'Add body · approval or veto', { viewport: true });
        await dlg().getByRole('radio', { name: /^Approval/ }).click();
        await dNext().click();
        await fillMultisig();
        await snap('GD_2_06_sub-body-multisig-members', 'Multisig · members', { viewport: true });
        await dNext().click();
        await snap('GD_2_07_sub-body-multisig-governance', 'Multisig · threshold', { viewport: true });
        await dNext().click();
        await dlg().waitFor({ state: 'hidden' });
        await snap('GD_2_08_stage-one-body', 'Stage with one body');
        await addSubBody(0, 'Token voting', 'TRC holders');
        await snap('GD_2_09_stage-two-bodies', 'Stage with two bodies', { targets: [[stage(0).getByRole('button', { name: 'Edit settings' }), 'GD_2_10_stage-settings']] });
        await stage(0).getByRole('button', { name: 'Edit settings' }).click();
        await dlg().waitFor();
        await snap('GD_2_10_stage-settings', 'Stage settings dialog', { viewport: true });
        await dBtn(/^Save$/).click();
        await dlg().waitFor({ state: 'hidden' });
        at('GD_2_09_stage-two-bodies'); // settings saved unchanged: the page is that state again
        await btn(/^Add stage$/).click();
        lost(); // a second, empty stage: not on the board
        await page.locator('input[name="stages.1.name"]').fill('Guardian veto');
        await addSubBody(1, 'Multisig', 'Guardians', 'Veto');
        await snap('GD_2_11_veto-stage', 'Second stage · veto body');
        await btn(/^Add stage$/).click();
        await page.locator('input[name="stages.2.name"]').fill('Timelock');
        await snap('GD_2_12_timelock-stage', 'Third stage · timelock (no bodies)');
        await nextBtn().click();
        await stepIs(3);
        await snap('GD_2_13_step3-advanced', 'Step 3 · proposal creation (advanced)');
    }

    // ---- Row 3: voting body variants ----
    if (ROWS.includes(3)) {
        await toStep2();
        await btn(/Add voting body/).click();
        await dlg().waitFor();
        at('GD_1_04_body-type');
        await pickType('Token voting');
        await dlg().locator('input[name="membership.token.name"]').waitFor();
        at('GD_1_05_body-token-membership');
        await dlg().getByRole('radio', { name: /^Import token/ }).click();
        await snap('GD_3_01_token-import-empty', 'Token voting · import token', { viewport: true });
        await dlg().getByRole('textbox').first().fill(D.TOKENS.MRD.address);
        await page.waitForTimeout(1500);
        await snap('GD_3_02_token-import-checked', 'Token voting · imported token checks', { viewport: true, settleMs: 6000 });
        await page.keyboard.press('Escape');
        await dlg().waitFor({ state: 'hidden' });
        at('GD_1_03_designer-basic-empty');
        await btn(/Add voting body/).click();
        await dlg().waitFor();
        at('GD_1_04_body-type');
        await pickType('Multisig');
        await fillMultisig();
        await snap('GD_3_03_multisig-members', 'Multisig · members (basic)', { viewport: true });
        await dNext().click();
        await snap('GD_3_04_multisig-governance', 'Multisig · threshold (basic)', { viewport: true });
        await page.keyboard.press('Escape');
        await dlg().waitFor({ state: 'hidden' });
        at('GD_1_03_designer-basic-empty');
        await btn(/Add voting body/).click();
        await dlg().waitFor();
        at('GD_1_04_body-type');
        await pickType('Lock to vote');
        await snap('GD_3_05_lock-to-vote-membership', 'Lock to vote · membership', { viewport: true });
        await dlg().getByRole('textbox').first().click();
        await page.keyboard.type(D.TOKENS.MRD.address);
        await page.keyboard.press('Tab');
        await snap('GD_3_06_lock-to-vote-token', 'Lock to vote · token checks', { viewport: true, settleMs: 6000 });
        await page.keyboard.press('Escape');
        await dlg().waitFor({ state: 'hidden' });
        at('GD_1_03_designer-basic-empty');
        await page.getByRole('radio', { name: 'Advanced' }).click();
        await btn(/^Add stage$/).waitFor();
        at('GD_2_01_advanced-empty');
        await btn(/^Add stage$/).click();
        lost(); // stage without a name: not on the board
        await stage(0).getByRole('button', { name: 'Add body' }).click();
        await dlg().waitFor();
        await pickType('Any address');
        await dlg().getByRole('radio', { name: /^Approval/ }).click();
        await dNext().click();
        await snap('GD_3_08_external-empty', 'Any address · address step', { viewport: true });
        await dlg().getByRole('textbox').first().click();
        await page.keyboard.type(D.PEOPLE[3].address);
        await page.keyboard.press('Tab');
        await snap('GD_3_09_external-address', 'Any address · address type detected', { viewport: true, settleMs: 6000 });
        await page.keyboard.press('Escape');
        await dlg().waitFor({ state: 'hidden' });
        lost();
        await stage(0).getByRole('button', { name: 'Add body' }).click();
        await pickType('Any address');
        await dlg().getByRole('radio', { name: /^Approval/ }).click();
        await dNext().click();
        await dlg().getByRole('textbox').first().click();
        await page.keyboard.type(SAFE);
        await page.keyboard.press('Tab');
        await dlg().getByText(/Safe/).first().waitFor({ timeout: 15000 }).catch(() => console.log('  Safe not detected'));
        await page.waitForTimeout(500);
        await snap('GD_3_10_external-safe', 'Any address · Safe', { viewport: true, settleMs: 6000 });
    }

    // ---- Row 4: errors and edge states ----
    if (ROWS.includes(4)) {
        await open();
        at('GD_1_01_step1-empty');
        await nextBtn().click();
        await page.getByText(/mandatory/i).first().waitFor();
        await snap('GD_4_01_step1-errors', 'Step 1 · required errors');
        await page.getByRole('textbox').nth(0).fill('Treasury Council');
        await page.getByRole('textbox').nth(1).fill('tr1');
        await nextBtn().click();
        await page.getByText(/Invalid Key format/).first().waitFor();
        await snap('GD_4_02_step1-key-format', 'Step 1 · invalid key');
        await page.getByRole('textbox').nth(1).fill('TRC');
        await nextBtn().click();
        await stepIs(2);
        at('GD_1_03_designer-basic-empty');
        await nextBtn().click();
        await page.getByText(/A body must be added/).first().waitFor();
        await snap('GD_4_03_body-required', 'Step 2 · a body must be added');
        await btn(/Add voting body/).click();
        await dlg().waitFor();
        at('GD_1_04_body-type');
        await pickType('Token voting');
        await dlg().locator('input[name="membership.token.name"]').waitFor();
        at('GD_1_05_body-token-membership');
        await dNext().click();
        await dlg().getByText(/mandatory/).first().waitFor();
        // all field errors rendered: the count of error texts is stable for 600 ms
        await page.waitForFunction(() => {
            const n = (document.querySelector('[role=dialog]')?.innerText.match(/mandatory|required|invalid/gi) ?? []).length;
            const w = window.__errStable ?? (window.__errStable = { n: -1, t: 0 });
            if (n !== w.n) { w.n = n; w.t = Date.now(); return false; }
            return Date.now() - w.t > 600;
        }, null, { polling: 100, timeout: 8000 }).catch(() => undefined);
        await snap('GD_4_04_body-token-errors', 'Token voting · field errors', { viewport: true });
        await dBtn(/^Back$/).click();
        at('GD_1_04_body-type'); // back on the type screen
        await pickType('Multisig');
        await dBtn(/^Add$/).click();
        await dlg().locator('textarea').last().fill('0x1234');
        await dBtn(/^Add$/).click();
        await dlg().locator('textarea').last().fill(D.PEOPLE[0].address);
        await dNext().click();
        await page.waitForTimeout(800);
        await snap('GD_4_05_body-multisig-errors', 'Multisig · member errors', { viewport: true });
        await page.keyboard.press('Escape');
        await dlg().waitFor({ state: 'hidden' });
        lost();
        await page.getByRole('radio', { name: 'Advanced' }).click();
        await btn(/^Add stage$/).click();
        await nextBtn().click();
        await page.waitForTimeout(800);
        await snap('GD_4_06_stage-errors', 'Advanced · stage name required');
        await stage(0).getByRole('button', { name: 'Edit settings' }).click();
        await dlg().waitFor();
        const dur = dlg().getByRole('textbox');
        for (let i = 0; i < (await dur.count()); i++) await dur.nth(i).fill('0');
        await dBtn(/^Save$/).click();
        await page.waitForTimeout(800);
        await snap('GD_4_07_stage-duration-min', 'Stage settings · duration minimum', { viewport: true });
    }

    fs.writeFileSync(path.join(HERE, 'links-log.json'), JSON.stringify(edges, null, 1));
    fs.writeFileSync(path.join(HERE, 'states.json'), JSON.stringify(states, null, 1));
    // CSS of the whole journey (spike2).
    const sheets = await page.evaluate(() => [...document.styleSheets].map((s) => ({ href: s.href, text: s.href ? null : [...s.cssRules].map((r) => r.cssText).join('\n'), owner: s.ownerNode?.getAttribute?.('data-precedence') ?? s.ownerNode?.tagName })));
    const parts = [];
    const fontDir = path.join(CANVAS, 'app-export-assets');
    fs.mkdirSync(fontDir, { recursive: true });
    for (const s of sheets) {
        let text = s.text;
        if (s.href) text = await (await page.request.get(s.href)).text();
        if (!text || (!s.href && text.includes('nextjs-portal'))) continue;
        const base = s.href ?? `${L.APP_URL}/`;
        for (const u of new Set([...text.matchAll(/url\((['"]?)([^'")]+)\1\)/g)].map((m) => m[2]).filter((x) => !x.startsWith('data:')))) {
            const abs = new URL(u, base);
            if (!abs.href.startsWith(L.APP_URL)) continue;
            const name = path.basename(abs.pathname);
            const file = path.join(fontDir, name);
            if (!fs.existsSync(file)) {
                const r = await page.request.get(abs.href);
                if (r.ok()) fs.writeFileSync(file, await r.body());
            }
            text = text.split(u).join(`app-export-assets/${name}`);
        }
        parts.push(`/* ==== ${s.href ? new URL(s.href).pathname : `inline <style> (${s.owner})`} ==== */\n${text}`);
    }
    fs.writeFileSync(path.join(CANVAS, 'app-export.css'), parts.join('\n\n'));
    timing.total = Date.now() - t0;
    console.log(`states ${states.length}, total ${timing.total} ms`);
    fs.writeFileSync(path.join(HERE, 'journey-log.json'), JSON.stringify(timing, null, 1));
    await browser.close();
})().catch((e) => {
    console.error(e);
    process.exit(1);
});

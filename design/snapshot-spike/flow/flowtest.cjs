'use strict';
// Spike3 flow test: drives the state files in the canvas runtime with real clicks and keyboard typing and asserts the
// file loaded after each action (navigation happens in the same page, as Play does). Main path forward, then the
// reverse path (Back / Close / X), then the empty-field and radio-branch cases. Screenshot per step in states-flow/.
// Writes flowtest-report.json; exit code 1 on any failure.
const fs = require('node:fs');
const path = require('node:path');
const { L, openPage, ready } = require('./flowlib.cjs');

const SHOTS = path.join(__dirname, 'states-flow');
fs.rmSync(SHOTS, { recursive: true, force: true });
fs.mkdirSync(SHOTS, { recursive: true });
const ids = JSON.parse(fs.readFileSync(path.join(__dirname, 'states.json'), 'utf8')).map((s) => s.id);
const full = (short) => { const id = ids.find((x) => x.startsWith(`${short}_`)); if (!id) throw new Error(`no state ${short}`); return id; };

// step: [action, expected state (short id) | 'stay']
const T = (label, text) => ({ type: label, text });
const B = (name, scope = 'page') => ({ click: name, scope });
const R = (name) => ({ radio: name });
const X = { x: true };
const C = (label) => ({ clear: label });
const scenarios = [
    { name: 'main path forward', start: 'GD_1_01', steps: [
        [T('Process name', 'Treasury'), 'stay'], [T('Key', 'TRS'), 'stay'], [B('Next'), 'GD_1_03'],
        [B('Add voting body'), 'GD_1_04'], [R('Token voting'), 'stay'], [B('Next', 'dialog'), 'GD_1_05'],
        [T('Token name', 'Meridian'), 'stay'], [T('Token symbol', 'MRD'), 'stay'], [B('Next', 'dialog'), 'GD_1_07'],
        [B('Save', 'dialog'), 'GD_1_08'], [B('Next'), 'GD_1_09'], [B('Next'), 'GD_1_10'], [B('Publish process'), 'GD_1_11'] ] },
    { name: 'reverse: wizard Back + publish Close', start: 'GD_1_11', steps: [
        [B('Close', 'dialog'), 'GD_1_10'], [B('Back'), 'GD_1_09'], [B('Back'), 'GD_1_08'], [B('Back'), 'GD_1_02'] ] },
    { name: 'reverse: designer Back', start: 'GD_1_03', steps: [[B('Back'), 'GD_1_02']] },
    { name: 'reverse: body dialog Back chain', start: 'GD_1_07', steps: [[B('Back', 'dialog'), 'GD_1_06'], [B('Back', 'dialog'), 'GD_1_04'], [B('Close', 'dialog'), 'GD_1_03']] },
    { name: 'reverse: Back from membership (empty)', start: 'GD_1_05', steps: [[B('Back', 'dialog'), 'GD_1_04']] },
    { name: 'reverse: Back from token errors', start: 'GD_4_04', steps: [[B('Back', 'dialog'), 'GD_1_04']] },
    { name: 'X on body type', start: 'GD_1_04', steps: [[X, 'GD_1_03']] },
    { name: 'X on membership', start: 'GD_1_05', steps: [[X, 'GD_1_03']] },
    { name: 'X on membership filled', start: 'GD_1_06', steps: [[X, 'GD_1_03']] },
    { name: 'X on token errors', start: 'GD_4_04', steps: [[X, 'GD_1_03']] },
    { name: 'X on governance', start: 'GD_1_07', steps: [[X, 'GD_1_03']] },
    { name: 'step 1 empty -> errors -> still empty stays -> filled', start: 'GD_1_01', steps: [
        [B('Next'), 'GD_4_01'], [B('Next'), 'stay'], [T('Process name', 'Treasury'), 'stay'], [B('Next'), 'stay'], [T('Key', 'TRS'), 'stay'], [B('Next'), 'GD_1_03'] ] },
    { name: 'step 1 only one field typed', start: 'GD_1_01', steps: [[T('Process name', 'Treasury'), 'stay'], [B('Next'), 'GD_4_01']] },
    { name: 'step 1 filled state -> designer', start: 'GD_1_02', steps: [[B('Next'), 'GD_1_03']] },
    { name: 'step 1 filled state cleared -> errors', start: 'GD_1_02', steps: [[C('Key'), 'stay'], [B('Next'), 'GD_4_01']] },
    { name: 'designer Next without body -> body required', start: 'GD_1_03', steps: [[B('Next'), 'GD_4_03'], [B('Add voting body'), 'GD_1_04']] },
    { name: 'membership empty -> token errors -> stays -> filled', start: 'GD_1_05', steps: [
        [B('Next', 'dialog'), 'GD_4_04'], [B('Next', 'dialog'), 'stay'], [T('Token name', 'Meridian'), 'stay'], [T('Token symbol', 'MRD'), 'stay'], [B('Next', 'dialog'), 'GD_1_07'] ] },
    { name: 'membership filled state -> governance', start: 'GD_1_06', steps: [[B('Next', 'dialog'), 'GD_1_07']] },
    { name: 'membership filled state cleared -> errors', start: 'GD_1_06', steps: [[C('Token name'), 'stay'], [B('Next', 'dialog'), 'GD_4_04']] },
    { name: 'body type default (Multisig) -> multisig members', start: 'GD_1_04', steps: [[B('Next', 'dialog'), 'GD_3_03']] },
    { name: 'body type Lock to vote', start: 'GD_1_04', steps: [[R('Lock to vote'), 'stay'], [B('Next', 'dialog'), 'GD_3_05']] },
    { name: 'membership Import token', start: 'GD_1_05', steps: [[R('Import token'), 'GD_3_01']] },
    { name: 'designer Advanced', start: 'GD_1_03', steps: [[R('Advanced'), 'GD_2_01']] },
];

const cur = (page) => decodeURIComponent(page.url().split('/').pop()).replace(/\.dc\.html$/, '');
const scopeOf = (page, s) => (s === 'dialog' ? page.locator('[role=dialog]').last() : page.locator('body'));
const field = (page, label) => page.locator('[role=dialog], body').last().getByRole('textbox', { name: new RegExp(`^${label}`) }).first();
async function act(page, a) {
    if (a.type) {
        const f = (await page.locator('[role=dialog]').count()) ? page.locator('[role=dialog]').last().getByRole('textbox', { name: new RegExp(`^${a.type}`) }).first() : page.getByRole('textbox', { name: new RegExp(`^${a.type}`) }).first();
        await f.click();
        await page.keyboard.type(a.text, { delay: 20 });
        const v = await f.inputValue();
        if (v !== a.text) throw new Error(`typed "${a.text}" into ${a.type}, field shows "${v}"`);
        return `type "${a.text}" into ${a.type}`;
    }
    if (a.clear) {
        const f = (await page.locator('[role=dialog]').count()) ? page.locator('[role=dialog]').last().getByRole('textbox', { name: new RegExp(`^${a.clear}`) }).first() : page.getByRole('textbox', { name: new RegExp(`^${a.clear}`) }).first();
        await f.click();
        await page.keyboard.press('ControlOrMeta+A');
        await page.keyboard.press('Backspace');
        const v = await f.inputValue();
        if (v !== '') throw new Error(`cleared ${a.clear}, field shows "${v}"`);
        return `clear ${a.clear}`;
    }
    if (a.radio) {
        const r = page.getByRole('radio', { name: new RegExp(`^${a.radio}`) }).last();
        await r.click();
        return `pick radio ${a.radio}`;
    }
    if (a.x) {
        // the Dialog.Header close button: the button in the header that holds the dialog title
        const box = await page.evaluate(() => {
            const d = [...document.querySelectorAll('[role=dialog]')].pop();
            const title = d.querySelector('h1,h2,h3,[id$=title]') ?? d;
            for (let p = title; p && p !== d; p = p.parentElement) { const b = p.querySelector('button'); if (b && !b.innerText.trim()) { const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; } }
            return null;
        });
        if (!box) throw new Error('no header X found');
        await page.mouse.click(box.x, box.y);
        return 'click header X';
    }
    const b = scopeOf(page, a.scope).getByRole('button', { name: a.click, exact: true });
    const n = await b.count();
    if (n !== 1) throw new Error(`${n} buttons "${a.click}" in ${a.scope}`);
    await b.scrollIntoViewIfNeeded();
    await b.click();
    return `click "${a.click}"${a.scope === 'dialog' ? ' (dialog)' : ''}`;
}

(async () => {
    const browser = await L.launch();
    const report = [];
    let shot = 0;
    let fails = 0;
    for (const sc of scenarios) {
        const page = await openPage(browser);
        const start = full(sc.start);
        await page.goto(`http://canvas.test/${start}.dc.html`);
        await ready(page);
        console.log(`\n# ${sc.name} (start ${start})`);
        for (const [a, exp] of sc.steps) {
            const before = cur(page);
            const want = exp === 'stay' ? before : full(exp);
            let what = JSON.stringify(a);
            let ok = false;
            let err = '';
            try {
                what = await act(page, a);
                if (exp === 'stay') await page.waitForTimeout(1200);
                else { await page.waitForURL((u) => u.pathname.endsWith(`/${want}.dc.html`), { timeout: 8000 }); await ready(page); }
                ok = cur(page) === want;
            } catch (e) { err = e.message.split('\n')[0]; }
            const got = cur(page);
            const file = `${String(++shot).padStart(2, '0')}_${got}.png`;
            await page.screenshot({ path: path.join(SHOTS, file) });
            if (!ok) fails++;
            const line = `${ok ? 'PASS' : 'FAIL'}  ${before}: ${what} -> ${got}${exp === 'stay' ? ' (stays)' : ''}${ok ? '' : `  expected ${want}${err ? ` [${err}]` : ''}`}`;
            console.log(line);
            report.push({ scenario: sc.name, from: before, action: what, expected: want, got, ok, err, shot: file });
        }
        await page.close();
    }
    await browser.close();
    fs.writeFileSync(path.join(__dirname, 'flowtest-report.json'), JSON.stringify(report, null, 1));
    console.log(`\n${report.length - fails}/${report.length} steps pass`);
    process.exit(fails ? 1 : 0);
})();

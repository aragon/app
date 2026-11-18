'use strict';
// Canvas-runtime harness for flowtest.cjs (same routing as linktest3.cjs).
const fs = require('node:fs');
const path = require('node:path');
const L = require('/home/user/app/design/baseline-check/lib.cjs');
const RUNTIME = path.join(L.OUT, 'runtime');
const CANVAS = path.join(__dirname, 'canvas');
const resolve = (u) => { const p = decodeURIComponent(u).replace(/^\/+/, ''); if (p === 'support.js') return path.join(RUNTIME, 'artifact-type', 'dc-runtime.js'); if (p.startsWith('ds/')) return path.join(RUNTIME, 'project', p); if (L.SCREENS.appAssets?.[p]) return path.join(L.REPO, L.SCREENS.appAssets[p]); return path.join(CANVAS, p); };
const MIME = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.svg': 'image/svg+xml', '.png': 'image/png', '.ttf': 'font/ttf', '.woff2': 'font/woff2' };
async function openPage(browser) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.route('**/*', (r) => { const u = new URL(r.request().url()); if (u.origin !== 'http://canvas.test') return r.abort(); const f = resolve(u.pathname); return fs.existsSync(f) ? r.fulfill({ body: fs.readFileSync(f), contentType: MIME[path.extname(f)] ?? 'application/octet-stream' }) : r.fulfill({ status: 404, body: '' }); });
    return page;
}
const ready = async (page) => { await page.locator('#dc-root > *').first().waitFor({ state: 'attached', timeout: 20000 }); await page.waitForTimeout(1500); };
module.exports = { L, openPage, ready };

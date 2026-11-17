'use strict';
// Shared Playwright helpers: browser setup with external-asset interception and a screenshot helper.
const { chromium } = require('playwright');
const path = require('node:path');
const fs = require('node:fs');

const BASE = process.env.APP_URL ?? 'http://localhost:3000';
const SHOTS = path.join(__dirname, '..', 'reference');
// sharp comes with Next.js (the app's image optimizer); resolve it through Next so this folder needs no install of its own.
const NEXT_DIR = path.dirname(
    require.resolve('next/package.json', {
        paths: [path.join(__dirname, '..', '..', 'apps', 'app')],
    }),
);
const sharp = require(require.resolve('sharp', { paths: [NEXT_DIR] }));
fs.mkdirSync(SHOTS, { recursive: true });

const PALETTE = {
    usdc: ['#2775CA', '#fff'],
    eth: ['#627EEA', '#fff'],
    weth: ['#EC4899', '#fff'],
    dai: ['#F5AC37', '#fff'],
    mrd: ['#0F766E', '#fff'],
    meridian: ['#0F766E', '#ECFEFF'],
    atlas: ['#7C3AED', '#F5F3FF'],
    lido: ['#F69988', '#fff'],
    'polygon-village': ['#8247E5', '#fff'],
    solace: ['#DB2777', '#fff'],
    harbor: ['#0369A1', '#fff'],
    greenfield: ['#16A34A', '#fff'],
    nexus: ['#111827', '#fff'],
    orbit: ['#EA580C', '#fff'],
};
const svgFor = (key) => {
    const k = key.toLowerCase();
    const [bg, fg] = PALETTE[k] ?? ['#64748B', '#fff'];
    const label = (
        k === 'polygon-village' ? 'PV' : k.slice(0, k.length <= 4 ? 4 : 2)
    ).toUpperCase();
    const size = label.length > 3 ? 26 : label.length > 2 ? 32 : 40;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><circle cx="64" cy="64" r="64" fill="${bg}"/><text x="64" y="64" dy="0.35em" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-weight="700" font-size="${size}" fill="${fg}">${label}</text></svg>`;
};

const keyFromUrl = (u) => {
    const m = u.match(/mock-assets\.aragon\.test\/(?:token|avatar)\/([^./?]+)/);
    return m ? m[1] : 'x';
};

async function setupContext(browser, opts = {}) {
    const context = await browser.newContext({
        viewport: opts.viewport ?? { width: 1440, height: 900 },
        deviceScaleFactor: 1,
        isMobile: opts.isMobile ?? false,
        hasTouch: opts.isMobile ?? false,
    });
    await context.addCookies([
        {
            name: 'aragon.featureFlags.overrides',
            value: encodeURIComponent(JSON.stringify({ debugPanel: false })),
            url: BASE,
        },
    ]);
    // Hide the Next.js dev-mode indicator so it does not appear in the screenshots.
    await context.addInitScript(() => {
        const css =
            'nextjs-portal,.tsqd-parent-container,.tsqd-open-btn-container,button[title="Show dev panel"]{display:none!important}';
        const add = () => {
            const s = document.createElement('style');
            s.textContent = css;
            document.head.appendChild(s);
        };
        if (document.head) {
            add();
        } else {
            document.addEventListener('DOMContentLoaded', add);
        }
        // Hide the React Hook Form devtools panel (a fixed element) whenever it renders.
        setInterval(() => {
            document
                .querySelectorAll(
                    'body > div, body div[style*="position: fixed"]',
                )
                .forEach((el) => {
                    const t = el.textContent || '';
                    if (
                        t.startsWith('\u25a0 React Hook Form') &&
                        el.style.display !== 'none'
                    ) {
                        el.style.display = 'none';
                    }
                });
        }, 300);
    });
    if (opts.initScript) {
        await context.addInitScript(opts.initScript);
    }
    await context.route('**/*', async (route) => {
        const req = route.request();
        const url = req.url();
        let target = url;
        if (url.startsWith(BASE) && url.includes('/_next/image')) {
            target = decodeURIComponent(
                new URL(url).searchParams.get('url') ?? '',
            );
            if (target.startsWith('/')) {
                return route.continue();
            }
        } else if (
            url.startsWith(BASE) ||
            url.startsWith('data:') ||
            url.startsWith('blob:')
        ) {
            return route.continue();
        }
        if (target.includes('api.pinata.cloud')) {
            return route.fulfill({
                status: 200,
                contentType: 'application/json',
                headers: { 'access-control-allow-origin': '*' },
                body: JSON.stringify({
                    IpfsHash:
                        'bafkreihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku',
                    PinSize: 1024,
                    Timestamp: new Date().toISOString(),
                }),
            });
        }
        if (target.includes('mock-assets.aragon.test')) {
            return route.fulfill({
                status: 200,
                contentType: 'image/svg+xml',
                body: svgFor(keyFromUrl(target)),
            });
        }
        if (
            req.resourceType() === 'font' ||
            req.resourceType() === 'stylesheet'
        ) {
            return route.abort();
        }
        return route.abort();
    });
    return context;
}

async function settle(page, extraMs = 2500) {
    try {
        await page.waitForLoadState('networkidle', { timeout: 30_000 });
    } catch {
        // Best effort: carry on without it.
    }
    await page.waitForTimeout(extraMs);
}

async function shot(page, name, opts = {}) {
    if (opts.url) {
        await page.goto(`${BASE}${opts.url}`, {
            waitUntil: 'domcontentloaded',
            timeout: 240_000,
        });
        await settle(page, opts.wait ?? 7000);
    }
    const file = path.join(SHOTS, `${name}.webp`);
    const png = await page.screenshot({ fullPage: opts.fullPage ?? true });
    await sharp(png).webp({ lossless: true }).toFile(file);
    console.log('saved', file);
    return file;
}

module.exports = { chromium, setupContext, settle, shot, BASE, SHOTS };

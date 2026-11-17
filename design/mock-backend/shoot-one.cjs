'use strict';
// Usage: node shoot-one.cjs <name> <url> [mobile]
const { chromium, setupContext, shot } = require('./shoot-lib.cjs');
(async () => {
    const [name, url, mobile] = process.argv.slice(2);
    const browser = await chromium.launch();
    const ctx = await setupContext(
        browser,
        mobile ? { viewport: { width: 390, height: 844 }, isMobile: true } : {},
    );
    const page = await ctx.newPage();
    page.on('console', (m) => {
        if (m.type() === 'error') {
            console.log('console.error:', m.text().slice(0, 300));
        }
    });
    page.on('pageerror', (e) =>
        console.log('pageerror:', String(e).slice(0, 300)),
    );
    await shot(page, name, { url });
    await browser.close();
})();

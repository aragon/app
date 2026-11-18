'use strict';
// Renders artboards of the spike canvas copy and compares each with a reference, same logic as compare.cjs.
// Usage: node cmp.cjs <Artboard.dc.html>=<reference name> ...
const fs = require('node:fs');
const path = require('node:path');
const L = require('/home/user/app/design/baseline-check/lib.cjs');
const { checkInputs, renderArtboard } = require('./render-canvas.cjs');
const { compareImages, pixels } = require('./compare-lib.cjs');

(async () => {
    console.log(checkInputs());
    const browser = await L.launch();
    const outDir = path.join(__dirname, 'out');
    fs.mkdirSync(outDir, { recursive: true });
    for (const arg of process.argv.slice(2)) {
        const [artboard, ref] = arg.split('=');
        const t0 = Date.now();
        const { png, height, problems } = await renderArtboard(browser, artboard);
        const ms = Date.now() - t0;
        const name = artboard.replace('.dc.html', '');
        fs.writeFileSync(path.join(outDir, `${name}-1440.png`), png);
        const refFile = path.join(L.REFERENCE, `${ref}.webp`);
        const refPx = await pixels(refFile);
        const pct = await compareImages(refFile, png, path.join(outDir, `${name}-compare.png`));
        console.log(`${artboard}: ref height ${refPx.height}, canvas height ${height}, differing ${pct.toFixed(2)}%, render ${ms} ms`);
        for (const p of problems) console.log(`  ${p}`);
    }
    await browser.close();
})();

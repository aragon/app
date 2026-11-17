'use strict';
// Renders design/canvas artboards through the canvas's own runtime, the way the claude.ai canvas shows them.
// Usage: node render-canvas.cjs [--mobile] [Artboard.dc.html ...]   -> out/canvas/<Artboard>-<width>.png
//
// Two things the canvas serves are not in the repo and are read from out/runtime/ (see README, "Canvas runtime"):
//   out/runtime/artifact-type/dc-runtime.js              the artboard runtime (the canvas serves it as ./support.js)
//   out/runtime/project/ds/aragon-gov-ui-kit/**          the canvas's copy of the design system
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const {
    DESIGN,
    REPO,
    CANVAS,
    OUT,
    SCREENS,
    NOW_MS,
    die,
    launch,
    sleep,
    stableScreenshot,
} = require('./lib.cjs');

const RUNTIME = path.join(OUT, 'runtime');
const RUNTIME_JS = path.join(RUNTIME, 'artifact-type', 'dc-runtime.js');
const KIT_DIR = path.join(RUNTIME, 'project', 'ds', 'aragon-gov-ui-kit');
const ORIGIN = 'http://canvas.test';
// Known packaging fault of the design system: components/bundle.css declares the two Manrope faces a second time
// with a path that does not exist. The live canvas gets the same 404s; the fonts load through tokens.css.
const KNOWN_404 = [
    '/ds/aragon-gov-ui-kit/components/src/theme/fonts/Manrope-Regular.ttf',
    '/ds/aragon-gov-ui-kit/components/src/theme/fonts/Manrope-SemiBold.ttf',
];
const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.ttf': 'font/ttf',
    '.woff2': 'font/woff2',
};

// The pointer file of the canvas that belongs to the checked-out branch (design/canvases/*.json, "branch"), or
// baseline.json when no pointer names this branch.
const canvasPointer = () => {
    const dir = path.join(DESIGN, 'canvases');
    let branch = '';
    try {
        branch = require('node:child_process')
            .execFileSync('git', ['branch', '--show-current'], {
                cwd: REPO,
                encoding: 'utf8',
            })
            .trim();
    } catch {
        // not a git checkout: fall back to the baseline
    }
    const own = fs
        .readdirSync(dir)
        .filter((file) => file.endsWith('.json'))
        .map((file) => path.join(dir, file))
        .find(
            (file) =>
                JSON.parse(fs.readFileSync(file, 'utf8')).branch === branch,
        );
    return own ?? path.join(dir, 'baseline.json');
};

// Exits unless the runtime and the design-system copy are in out/runtime, the copy is the pinned one, and every
// app-owned image of design/screens.json exists.
const checkInputs = () => {
    if (!fs.existsSync(RUNTIME_JS) || !fs.existsSync(KIT_DIR)) {
        die(
            [
                'The canvas runtime is not in out/runtime/. It is not part of the repo: a Claude session fetches it from the',
                'live canvas (link in design/README.md) with the Artifact tool (action "read", with "paths"):',
                '  artifact-type/dc-runtime.js          -> out/runtime/artifact-type/dc-runtime.js',
                '  project/ds/aragon-gov-ui-kit/**      -> out/runtime/project/ds/aragon-gov-ui-kit/',
            ].join('\n'),
        );
    }
    // The pin of the checked-out branch's canvas (an exploration may have moved to a newer kit), else the baseline's.
    const pinFile = canvasPointer();
    const pinName = path.relative(REPO, pinFile);
    const pinned = JSON.parse(fs.readFileSync(pinFile, 'utf8')).kit?.files;
    const wrong = Object.entries(pinned ?? {}).filter(([file, sha256]) => {
        const full = path.join(KIT_DIR, file);
        return (
            !fs.existsSync(full) ||
            crypto
                .createHash('sha256')
                .update(fs.readFileSync(full))
                .digest('hex') !== sha256
        );
    });
    if (wrong.length > 0) {
        die(
            `The design-system copy in out/runtime is not the one pinned in ${pinName} (kit.files). Missing or different: ${wrong.map(([file]) => file).join(', ')}`,
        );
    }
    const missing = Object.values(SCREENS.appAssets ?? {}).filter(
        (file) => !fs.existsSync(path.join(REPO, file)),
    );
    if (missing.length > 0) {
        die(
            `design/screens.json (appAssets) points at files that do not exist: ${missing.join(', ')}`,
        );
    }
    return pinned
        ? `kit copy matches ${pinName} (${Object.keys(pinned).length} files)`
        : `no kit pin to check (${pinName} has no kit.files)`;
};

// Resolves a path of the canvas project the way the canvas does.
const resolve = (urlPath) => {
    const p = decodeURIComponent(urlPath).replace(/^\/+/, '');
    if (p === 'support.js') {
        return RUNTIME_JS;
    }
    if (p.startsWith('ds/')) {
        return path.join(RUNTIME, 'project', p);
    }
    if (SCREENS.appAssets?.[p]) {
        return path.join(REPO, SCREENS.appAssets[p]);
    }
    return p.includes('..') ? undefined : path.join(CANVAS, p);
};

// Renders one artboard as a top-level page on a fake origin, at the reference time. Returns the full-page PNG, its
// height and the problems found (page errors, missing files).
const renderArtboard = async (browser, artboard, opts = {}) => {
    const context = await browser.newContext({
        viewport: opts.mobile
            ? { width: 390, height: 844 }
            : { width: 1440, height: 900 },
        deviceScaleFactor: 1,
        reducedMotion: 'reduce',
        locale: 'en-US',
        timezoneId: 'UTC',
    });
    await context.clock.setFixedTime(new Date(NOW_MS));
    const page = await context.newPage();
    const problems = [];
    let lastRequest = Date.now();
    page.on('pageerror', (error) => problems.push(`page error: ${error}`));
    await page.route('**/*', (route) => {
        lastRequest = Date.now();
        const url = new URL(route.request().url());
        if (url.origin !== ORIGIN) {
            // The kit looks up ENS names and avatars; offline it falls back to addresses and generated avatars.
            return route.abort();
        }
        const file = resolve(url.pathname);
        if (file && fs.existsSync(file)) {
            return route.fulfill({
                contentType:
                    MIME[path.extname(file)] ?? 'application/octet-stream',
                body: fs.readFileSync(file),
            });
        }
        if (!KNOWN_404.includes(url.pathname)) {
            problems.push(`missing file: ${url.pathname}`);
        }
        return route.fulfill({ status: 404, body: 'not found' });
    });
    await page.goto(`${ORIGIN}/${artboard}`, { waitUntil: 'load' });
    await page
        .locator('#dc-root > *')
        .first()
        .waitFor({ state: 'attached', timeout: 20_000 })
        .catch(() =>
            problems.push('the artboard never mounted (#dc-root is empty)'),
        );
    await page.evaluate(() => document.fonts.ready);
    // Lookups retry with a growing delay before a component falls back: wait for 5s without any request.
    for (
        const start = Date.now();
        Date.now() - start < 40_000 && Date.now() - lastRequest < 5000;
    ) {
        await sleep(250);
    }
    const png = await stableScreenshot(page, true);
    const height = await page.evaluate(
        () => document.documentElement.scrollHeight,
    );
    await context.close();
    return { png, height, problems };
};

module.exports = { KIT_DIR, KNOWN_404, checkInputs, renderArtboard };

if (require.main === module) {
    (async () => {
        const args = process.argv.slice(2);
        const mobile = args.includes('--mobile');
        const names = args.filter((arg) => arg !== '--mobile');
        const known = fs
            .readdirSync(CANVAS)
            .filter((f) => f.endsWith('.dc.html'));
        const unknown = names.filter((name) => !known.includes(name));
        if (unknown.length > 0) {
            die(
                `Not in design/canvas: ${unknown.join(', ')}\nUsage: node render-canvas.cjs [--mobile] [${known.join(' | ')}]`,
            );
        }
        console.log(checkInputs());
        const browser = await launch();
        const outDir = path.join(OUT, 'canvas');
        fs.mkdirSync(outDir, { recursive: true });
        let failed = false;
        for (const artboard of names.length > 0 ? names : known) {
            const { png, height, problems } = await renderArtboard(
                browser,
                artboard,
                { mobile },
            );
            const file = path.join(
                outDir,
                `${artboard.replace('.dc.html', '')}-${mobile ? 390 : 1440}.png`,
            );
            fs.writeFileSync(file, png);
            console.log(
                `${artboard}: height ${height} -> ${path.relative(process.cwd(), file)}`,
            );
            for (const problem of problems) {
                failed = true;
                console.error(`  ${problem}`);
            }
        }
        await browser.close();
        process.exit(failed ? 1 : 0);
    })();
}

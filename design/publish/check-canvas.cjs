'use strict';
// Load check for the prototypes: renders design/canvas/*.dc.html through the canvas's own runtime, the way a claude.ai
// design canvas shows them, at desktop and phone width, and fails on what a load can see: page errors, a part's error
// box, a frame that never mounts, a file the page asks for that does not exist, sideways overflow.
//
// Two things the canvas serves are not in the repo (the runtime is claude.ai's code; the kit is a build) and are read
// from design/.runtime/, which is gitignored. A Claude session fills it with the Artifact tool (action "read", with
// "paths" and out_dir design/.runtime) from the canvas being checked (the reference canvas, or a ticket's canvas):
//   artifact-type/dc-runtime.js              (the frames load it as ./support.js)
//   project/ds/aragon-gov-ui-kit/<file>      (each file of <folder>/kit-files.json, see prepare-publish.cjs)
//
//   node design/publish/check-canvas.cjs [--width 1440|390] [--now <ISO time>] [--eval <file.js>] [--shots] [Name ...]
//
// Names are prototype file names without .dc.html, optionally with a query (Workspace?welcome=1); default: every
// prototype in canvas-layout.json. Without --width, each is checked at 1440 and at 390. --eval runs the async JS
// expression in the file in each page after it settles and prints the result (for click-throughs, which belong to a
// session and are not kept). --shots saves full-page screenshots to design/.runtime/shots/. Exit code 1 on any problem.
const fs = require('node:fs');
const path = require('node:path');
const { CANVAS, APP_ASSETS, REPO, die } = require('./paths.cjs');

const RUNTIME = path.join(CANVAS, '..', '.runtime');
const RUNTIME_JS = path.join(RUNTIME, 'artifact-type', 'dc-runtime.js');
const KIT_DIR = path.join(RUNTIME, 'project', 'ds', 'aragon-gov-ui-kit');
const ORIGIN = 'http://canvas.test';
// The kit's bundle.css declares the two Manrope faces a second time with a path that does not exist; the live canvas
// gets the same 404s, and the fonts load through tokens.css.
const KNOWN_404 = /\/ds\/aragon-gov-ui-kit\/components\/src\/theme\/fonts\//;
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

const args = process.argv.slice(2);
const option = (name) => {
    const i = args.indexOf(name);
    if (i < 0) {
        return undefined;
    }
    const [, value] = args.splice(i, 2);
    return value;
};
const shots = args.includes('--shots');
if (shots) {
    args.splice(args.indexOf('--shots'), 1);
}
const width = option('--width');
const now = option('--now');
const evalFile = option('--eval');
const widths = width ? [Number(width)] : [1440, 390];
const layout = JSON.parse(
    fs.readFileSync(path.join(CANVAS, '..', 'canvas-layout.json'), 'utf8'),
);
const names =
    args.length > 0
        ? args
        : layout.rows.flatMap((row) =>
              row.artboards.map((board) => board.file.replace('.dc.html', '')),
          );
const unknown = names.filter(
    (name) =>
        !fs.existsSync(path.join(CANVAS, `${name.split('?')[0]}.dc.html`)),
);
if (unknown.length > 0) {
    die(`Not in design/canvas: ${unknown.join(', ')}`);
}
if (!(fs.existsSync(RUNTIME_JS) && fs.existsSync(KIT_DIR))) {
    die(
        [
            'design/.runtime/ is missing the canvas runtime or the kit. They are not in the repo: read them from the canvas',
            'with the Artifact tool (action "read", out_dir design/.runtime), paths:',
            '  artifact-type/dc-runtime.js',
            '  project/ds/aragon-gov-ui-kit/<each file in kit-files.json>',
        ].join('\n'),
    );
}

// Playwright: the app's dependency, else one installed on the machine.
const playwright = (() => {
    for (const name of ['playwright', '@playwright/test']) {
        try {
            return require(
                require.resolve(name, {
                    paths: [path.join(REPO, 'apps', 'app'), REPO],
                }),
            );
        } catch {
            // try the next
        }
    }
    die(
        'Playwright not found: run pnpm install (it is a dependency of apps/app).',
    );
})();

const resolve = (urlPath) => {
    const p = decodeURIComponent(urlPath).replace(/^\/+/, '');
    if (p === 'support.js') {
        return RUNTIME_JS;
    }
    if (p.startsWith('ds/')) {
        return path.join(RUNTIME, 'project', p);
    }
    if (APP_ASSETS[p]) {
        return path.join(REPO, APP_ASSETS[p]);
    }
    return p.includes('..') ? undefined : path.join(CANVAS, p);
};

const check = async (browser, name, viewportWidth) => {
    const context = await browser.newContext({
        viewport: {
            width: viewportWidth,
            height: viewportWidth < 768 ? 844 : 900,
        },
        deviceScaleFactor: 1,
        locale: 'en-US',
        timezoneId: 'UTC',
    });
    if (now) {
        await context.clock.setFixedTime(new Date(now));
    }
    const page = await context.newPage();
    const problems = [];
    let lastRequest = Date.now();
    page.on('pageerror', (error) =>
        problems.push(`page error: ${String(error).slice(0, 400)}`),
    );
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
        if (!KNOWN_404.test(url.pathname)) {
            problems.push(`missing file: ${url.pathname}`);
        }
        return route.fulfill({ status: 404, body: 'not found' });
    });
    const [file, query = ''] = name.split('?');
    await page.goto(`${ORIGIN}/${file}.dc.html${query ? `?${query}` : ''}`, {
        waitUntil: 'load',
    });
    await page
        .locator('#dc-root > *')
        .first()
        .waitFor({ state: 'attached', timeout: 20_000 })
        .catch(() =>
            problems.push('the frame never mounted (#dc-root is empty)'),
        );
    await page.evaluate(() => document.fonts.ready);
    // Lookups retry with a growing delay before a component falls back: wait for 5s without any request, at most 40s.
    for (
        const start = Date.now();
        Date.now() - start < 40_000 && Date.now() - lastRequest < 5000;
    ) {
        await page.waitForTimeout(250);
    }
    const measured = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        errorBoxes: [
            ...document.querySelectorAll('.sc-logic-error,[data-dc-error]'),
        ].map((box) => box.textContent.slice(0, 200)),
    }));
    if (measured.scrollWidth > viewportWidth) {
        problems.push(
            `sideways overflow: ${measured.scrollWidth}px wide at ${viewportWidth}px`,
        );
    }
    for (const box of measured.errorBoxes) {
        problems.push(`error box: ${box}`);
    }
    let evalResult;
    if (evalFile) {
        evalResult = await page.evaluate(fs.readFileSync(evalFile, 'utf8'));
    }
    if (shots) {
        const dir = path.join(RUNTIME, 'shots');
        fs.mkdirSync(dir, { recursive: true });
        await page.screenshot({
            path: path.join(
                dir,
                `${file}${query ? `-${query.replace(/\W+/g, '_')}` : ''}-${viewportWidth}.png`,
            ),
            fullPage: true,
        });
    }
    await context.close();
    return { problems, evalResult };
};

// A check mostly waits (fonts, lookups the kit retries offline), so a few run at once; results print in order.
const CONCURRENCY = 6;

(async () => {
    const browser = await playwright.chromium.launch();
    const jobs = names.flatMap((name) =>
        widths.map((viewportWidth) => ({ name, viewportWidth })),
    );
    const results = new Array(jobs.length);
    let next = 0;
    const worker = async () => {
        while (next < jobs.length) {
            const i = next++;
            results[i] = await check(
                browser,
                jobs[i].name,
                jobs[i].viewportWidth,
            );
        }
    };
    await Promise.all(Array.from({ length: CONCURRENCY }, worker));
    let failed = false;
    jobs.forEach(({ name, viewportWidth }, i) => {
        const { problems, evalResult } = results[i];
        console.log(
            `${problems.length > 0 ? 'FAIL' : 'ok  '} ${name} @${viewportWidth}`,
        );
        for (const problem of [...new Set(problems)]) {
            console.log(`     ${problem}`);
        }
        if (evalResult !== undefined) {
            console.log(
                typeof evalResult === 'string'
                    ? evalResult
                    : JSON.stringify(evalResult, null, 1),
            );
        }
        failed ||= problems.length > 0;
    });
    await browser.close();
    process.exit(failed ? 1 : 0);
})();

'use strict';
// Shared by every script in this folder: paths, the three dependencies borrowed from the app, the reference time, the
// Playwright setup (offline routes, fixed clock, no motion) and the capture runner (checks, failures, exit code).
const fs = require('node:fs');
const path = require('node:path');

const HERE = __dirname;
const DESIGN = path.join(HERE, '..');
const REPO = path.join(DESIGN, '..');
const APP_DIR = path.join(REPO, 'apps', 'app');
const CANVAS = path.join(DESIGN, 'canvas');
const REFERENCE = path.join(DESIGN, 'reference');
const OUT = path.join(HERE, 'out');
const SHOTS = path.join(OUT, 'shots');
const FAILURES = path.join(OUT, 'failures');

// This folder declares no dependencies of its own. Playwright and viem are the app's; sharp is the one Next.js ships
// for its image optimizer.
const fromApp = (name) => require(require.resolve(name, { paths: [APP_DIR] }));
const deps = {
    get viem() {
        return fromApp('viem');
    },
    get chromium() {
        return fromApp('@playwright/test').chromium;
    },
    get sharp() {
        const nextDir = path.dirname(
            require.resolve('next/package.json', { paths: [APP_DIR] }),
        );
        return require(require.resolve('sharp', { paths: [nextDir] }));
    },
};

const SCREENS = JSON.parse(
    fs.readFileSync(path.join(DESIGN, 'screens.json'), 'utf8'),
);
// The one "now" of the mock data, the app's browser clock and the canvas render.
const NOW_MS = Date.parse(process.env.MOCK_NOW ?? SCREENS.referenceTime);
if (Number.isNaN(NOW_MS)) {
    throw new Error(
        'No valid reference time: set referenceTime in design/screens.json (or MOCK_NOW) to an ISO date.',
    );
}

const MOCK_PORT = Number(process.env.MOCK_PORT ?? 4100);
const APP_PORT = Number(process.env.APP_PORT ?? 3000);
const MOCK_URL = `http://localhost:${MOCK_PORT}`;
const APP_URL = `http://localhost:${APP_PORT}`;
const NAV_TIMEOUT = 240_000; // the first visit of a route compiles it
const ASSET_HOST = 'https://mock-assets.aragon.test';
const CMS_PREFIX = 'https://raw.githubusercontent.com/aragon/app-cms/main/';
const PINATA_REPLY = {
    IpfsHash: 'bafkreihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku',
    PinSize: 1024,
    Timestamp: new Date(NOW_MS).toISOString(),
};

const die = (message) => {
    console.error(message);
    process.exit(1);
};

// ---------- browser ----------

// CHROMIUM_PATH: a Chromium binary, or a folder that contains one, for machines where the browser build Playwright
// expects cannot be installed.
const chromiumExecutable = () => {
    const given = process.env.CHROMIUM_PATH;
    if (!given) {
        return undefined;
    }
    if (!fs.existsSync(given)) {
        die(`CHROMIUM_PATH does not exist: ${given}`);
    }
    if (!fs.statSync(given).isDirectory()) {
        return given;
    }
    const names = new Set([
        'chrome',
        'chrome-headless-shell',
        'chrome.exe',
        'Chromium',
        'Google Chrome for Testing',
    ]);
    let level = [given];
    for (let depth = 0; depth < 6 && level.length > 0; depth++) {
        const next = [];
        for (const dir of level) {
            for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
                const full = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    next.push(full);
                } else if (names.has(entry.name)) {
                    return full;
                }
            }
        }
        level = next;
    }
    return die(`CHROMIUM_PATH: no Chromium binary found inside ${given}`);
};

const launch = async () => {
    try {
        return await deps.chromium.launch({
            executablePath: chromiumExecutable(),
            // Chromium re-rasters only the invalidated part of a tile and draws it over the pixels already there,
            // so a rounded edge on a fractional position (the wallet button in the top bar) came out a shade
            // different with every repaint, and the result depended on how often the page had repainted. Full
            // raster clears the tile first.
            // The rest are what Playwright's headless-shell wrapper passes, and the reference screenshots were taken
            // with them: text without hinting or subpixel (LCD) antialiasing and one colour profile render the same
            // whichever Chromium binary runs, so screenshots and canvas renders compare across machines.
            args: [
                '--disable-partial-raster',
                '--font-render-hinting=none',
                '--disable-lcd-text',
                '--force-color-profile=srgb',
            ],
        });
    } catch (error) {
        return die(
            `Could not start Chromium: ${String(error).split('\n')[0]}\nInstall the browser with "pnpm --filter @aragon/app e2e:install", or point CHROMIUM_PATH at a Chromium binary.`,
        );
    }
};

// Injected before any page script: hides the dev-only overlays and stops CSS motion.
const pageSetup = () => {
    // CSS animations and transitions jump to their end state (spinners and pulsing dots hold their first frame), the
    // text caret is not drawn (it blinks), smooth scrolling is off.
    const motion =
        '*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;animation-iteration-count:1!important;transition-duration:0s!important;transition-delay:0s!important;scroll-behavior:auto!important;caret-color:transparent!important}';
    const css = [
        // Next.js dev indicator, React Query devtools, the app's dev panel button.
        'nextjs-portal,.tsqd-parent-container,.tsqd-open-btn-container,button[title="Show dev panel"]{display:none!important}',
        motion,
        // The Explore "Featured" carousel is moved by framer-motion (an inline transform on its track, set on every
        // animation frame): pin the track 160px in, the frame the canvas reproduces. See README, "Determinism".
        '.overflow-hidden>.flex.w-max.will-change-transform{transform:translateX(-160px)!important}',
    ].join('\n');
    const add = () => {
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    };
    if (document.head) {
        add();
    } else {
        document.addEventListener('DOMContentLoaded', add);
    }
    // A document stylesheet does not reach into shadow roots, where the wallet SDK's modal (Lit web components) keeps
    // its own animations (the header title slides in, buttons fade). Every shadow root gets the motion rule as an
    // adopted stylesheet, and keeps it when the component assigns its own list (Lit assigns adoptedStyleSheets).
    if (
        typeof CSSStyleSheet === 'function' &&
        'adoptedStyleSheets' in Document.prototype
    ) {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(motion);
        const property = Object.getOwnPropertyDescriptor(
            ShadowRoot.prototype,
            'adoptedStyleSheets',
        );
        Object.defineProperty(ShadowRoot.prototype, 'adoptedStyleSheets', {
            ...property,
            set(sheets) {
                property.set.call(
                    this,
                    sheets.includes(sheet) ? sheets : [...sheets, sheet],
                );
            },
        });
        const attachShadow = Element.prototype.attachShadow;
        Element.prototype.attachShadow = function (...args) {
            const root = attachShadow.apply(this, args);
            root.adoptedStyleSheets = [];
            return root;
        };
    }
    // The React Hook Form devtools panel is a fixed element without a stable selector: hide it whenever it renders.
    const hideFormDevtools = () => {
        for (const el of document.querySelectorAll(
            'body > div, body div[style*="position: fixed"]',
        )) {
            if (
                (el.textContent || '').startsWith('\u25a0 React Hook Form') &&
                el.style.display !== 'none'
            ) {
                el.style.display = 'none';
            }
        }
    };
    setInterval(hideFormDevtools, 300);
    // Chromium keeps how an inline SVG was painted while an ancestor was being scaled (a dialog opening from 88%
    // scale), so the antialiasing of icons (the dialog's close icon) depended on the animation frame it was first
    // painted in. Taking every SVG out of the layout and back in, in one task, makes it paint again at rest; nothing
    // is shown in between. Also walks open shadow roots (the wallet SDK's icons).
    window.baselineRepaintSvgs = () => {
        const roots = [document];
        // The array grows while it is iterated: shadow roots found inside shadow roots are walked as well.
        for (const root of roots) {
            for (const el of root.querySelectorAll('*')) {
                if (el.shadowRoot) {
                    roots.push(el.shadowRoot);
                }
            }
        }
        const svgs = roots.flatMap((root) => [...root.querySelectorAll('svg')]);
        const styles = svgs.map((svg) => svg.getAttribute('style'));
        for (const svg of svgs) {
            svg.style.setProperty('display', 'none', 'important');
        }
        void document.body.offsetHeight;
        svgs.forEach((svg, i) => {
            if (styles[i] === null) {
                svg.removeAttribute('style');
            } else {
                svg.setAttribute('style', styles[i]);
            }
        });
        void document.body.offsetHeight;
    };
    // What settle() waits for inside the page: the whole document has arrived, React has hydrated every control of
    // it (React Query devtools, hidden above, are not React's), fonts and images are loaded, no skeleton is left.
    window.baselineReady = () => {
        hideFormDevtools();
        const controls = document.querySelectorAll(
            ':is(button, a):not(.tsqd-parent-container *)',
        );
        const hydrated =
            document.readyState === 'complete' &&
            [...controls].every((el) =>
                Object.keys(el).some((key) => key.startsWith('__reactProps')),
            );
        if (!hydrated) {
            return false;
        }
        // A full-page shot includes images below the viewport, which lazy loading would leave out. (Only after
        // hydration: React must find the attribute as the server rendered it.)
        for (const img of document.images) {
            img.loading = 'eager';
        }
        return (
            document.fonts.status === 'loaded' &&
            [...document.images].every((img) => img.complete) &&
            document.querySelector('.animate-pulse') === null
        );
    };
};

// The app asks for DAO avatars through its IPFS gateway and the image optimizer, so the mock host can sit anywhere
// in the URL. "<kind>/<key>.png" and "<kind>/<key>.svg" both map to design/canvas/assets/mock/<kind>/<key>.svg.
const mockImage = (url) => {
    const m = url.match(
        /mock-assets\.aragon\.test\/(token|avatar)\/([a-z0-9-]+)\.(?:svg|png)/,
    );
    return m
        ? path.join(CANVAS, 'assets', 'mock', m[1], `${m[2]}.svg`)
        : undefined;
};

// A browser context for the app on mock data. Nothing but the app itself is reachable: mock images come from the
// canvas assets, the CMS from ./cms, Pinata is faked, every other external request is aborted.
const newContext = async (browser, opts = {}) => {
    const mobile = opts.mobile ?? false;
    const context = await browser.newContext({
        viewport: mobile
            ? { width: 390, height: 844 }
            : { width: 1440, height: 900 },
        deviceScaleFactor: 1,
        isMobile: mobile,
        hasTouch: mobile,
        reducedMotion: 'reduce',
        locale: 'en-US',
        timezoneId: 'UTC',
    });
    context.setDefaultTimeout(30_000);
    context.setDefaultNavigationTimeout(NAV_TIMEOUT);
    // Date is frozen at the reference time; timers and requestAnimationFrame keep running.
    await context.clock.setFixedTime(new Date(NOW_MS));
    await context.addCookies([
        {
            name: 'aragon.featureFlags.overrides',
            value: encodeURIComponent(JSON.stringify({ debugPanel: false })),
            url: APP_URL,
        },
    ]);
    await context.addInitScript(pageSetup);
    for (const script of opts.initScripts ?? []) {
        await context.addInitScript(script);
    }

    const state = { pending: new Set(), lastActivity: Date.now(), errors: [] };
    context.baseline = state;
    const touch = (request, done) => {
        if (done) {
            state.pending.delete(request);
        } else if (request.resourceType() !== 'eventsource') {
            state.pending.add(request);
        }
        state.lastActivity = Date.now();
    };
    context.on('request', (request) => touch(request, false));
    context.on('requestfinished', (request) => touch(request, true));
    context.on('requestfailed', (request) => touch(request, true));
    context.on('weberror', (webError) =>
        state.errors.push(`page error: ${String(webError.error())}`),
    );
    // React reports server-rendered HTML that disagrees with the client (other clock, other data) on the console.
    context.on('console', (message) => {
        if (
            !state.connecting &&
            message.type() === 'error' &&
            /hydrat/i.test(message.text().split('\n')[0])
        ) {
            state.errors.push(`hydration: ${message.text().split('\n')[0]}`);
        }
    });

    // Only the dev server's own sockets (hot reload) may connect.
    await context.routeWebSocket(
        (url) => !url.href.startsWith(`ws://localhost:${APP_PORT}/`),
        (socket) => socket.close(),
    );
    await context.route('**/*', (route) => {
        let url = route.request().url();
        if (url.startsWith(`${APP_URL}/_next/image`)) {
            // Remote images go through the Next.js optimizer: answer for the image it would fetch.
            const source = new URL(url).searchParams.get('url') ?? '';
            if (source.startsWith('/')) {
                return route.continue();
            }
            url = source;
        } else if (/^(data:|blob:)/.test(url) || url.startsWith(APP_URL)) {
            return route.continue();
        }
        if (url.includes(new URL(ASSET_HOST).host)) {
            const file = mockImage(url);
            if (file && fs.existsSync(file)) {
                return route.fulfill({ path: file });
            }
            state.errors.push(
                `no mock image for ${url} in design/canvas/assets/mock`,
            );
            return route.fulfill({ status: 404, body: 'not found' });
        }
        if (url.startsWith(CMS_PREFIX)) {
            const file = path.join(
                HERE,
                'cms',
                path.basename(new URL(url).pathname),
            );
            if (fs.existsSync(file)) {
                return route.fulfill({
                    path: file,
                    contentType: 'application/json',
                    headers: { 'access-control-allow-origin': '*' },
                });
            }
            state.errors.push(`no CMS snapshot for ${url} in cms/`);
            return route.fulfill({ status: 404, body: 'not found' });
        }
        if (url.startsWith('https://api.pinata.cloud/')) {
            return route.fulfill({
                contentType: 'application/json',
                headers: { 'access-control-allow-origin': '*' },
                body: JSON.stringify(PINATA_REPLY),
            });
        }
        // Everything else (wallet SDK configuration, analytics, featured DAO logos, ...) stays offline.
        return route.abort();
    });
    return context;
};

// ---------- mock workspace ----------

const TV_ROUTE = '/dao/ethereum-mainnet/meridian.dao.eth';
const MS_ROUTE = '/dao/ethereum-mainnet/atlas-grants.dao.eth';
const SPP_ROUTE = '/dao/ethereum-mainnet/northstar.dao.eth';
const WORKSPACE_ID = 'meridian-ecosystem';

// Workspaces live in the browser's localStorage: seed one that holds both mock DAOs.
const workspaceSeed = () => {
    const D = require('./data.cjs');
    const account = (address, name) => ({
        id: `ethereum-mainnet-${deps.viem.getAddress(address)}`,
        type: 'DAO',
        address: deps.viem.getAddress(address),
        network: 'ethereum-mainnet',
        metadata: { name },
    });
    const workspace = {
        id: WORKSPACE_ID,
        name: 'Meridian Ecosystem',
        description:
            'Treasury and governance of Meridian DAO and the Atlas Grants Council in one place.',
        avatar: null,
        links: [{ name: 'Website', url: 'https://meridian.xyz' }],
        accounts: [
            account(D.TV_DAO_ADDR, 'Meridian DAO'),
            account(D.MS_DAO_ADDR, 'Atlas Grants Council'),
        ],
        targets: [],
    };
    const stored = JSON.stringify({ [WORKSPACE_ID]: workspace });
    return {
        tvAccountId: workspace.accounts[0].id,
        // Init scripts also run in blank and sandboxed frames, which have no storage.
        script: `if (location.origin === '${APP_URL}') { localStorage.setItem('aragon-workspaces', ${JSON.stringify(stored)}); }`,
    };
};

// ---------- capture ----------

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Waits until the page has nothing left to load: React has hydrated every control, no request has been in flight
// for half a second, fonts are ready, every image is decoded and no loading skeleton is on screen.
const settle = async (page) => {
    const state = page.context().baseline;
    await page.waitForLoadState('load');
    const deadline = Date.now() + 60_000;
    for (;;) {
        const quiet =
            state.pending.size === 0 && Date.now() - state.lastActivity >= 500;
        const loaded =
            quiet && (await page.evaluate(() => window.baselineReady()));
        if (loaded) {
            return;
        }
        if (Date.now() > deadline) {
            const waiting = [...state.pending].map((r) =>
                r.url().slice(0, 120),
            );
            throw new Error(
                `page did not settle within 60s (${waiting.length > 0 ? `requests in flight: ${waiting.join(', ')}` : 'hydration, fonts, images or loading skeletons still pending'})`,
            );
        }
        await sleep(100);
    }
};

const goto = async (page, route, opts = {}) => {
    const response = await page.goto(`${APP_URL}${route}`, {
        waitUntil: 'domcontentloaded',
    });
    const status = response?.status() ?? 0;
    if (status !== (opts.status ?? 200)) {
        throw new Error(
            `${route} answered HTTP ${status}, expected ${opts.status ?? 200}`,
        );
    }
    await settle(page);
};

// Screenshots until two consecutive frames are identical: late layout (the permissions graph fitting its viewport)
// or a JS-driven animation shows up as frames that differ.
const stableScreenshot = async (page, fullPage) => {
    await page.evaluate(() => window.baselineRepaintSvgs?.());
    // Two animation frames, so what was just laid out has also been painted.
    await page.evaluate(
        () =>
            new Promise((resolve) =>
                requestAnimationFrame(() => requestAnimationFrame(resolve)),
            ),
    );
    const take = () => page.screenshot({ fullPage, animations: 'disabled' });
    let frame = await take();
    for (let attempt = 0; ; attempt++) {
        await sleep(250);
        const next = await take();
        if (next.equals(frame)) {
            return frame;
        }
        if (attempt === 40) {
            throw new Error(
                'the page never held still (frames keep differing)',
            );
        }
        frame = next;
    }
};

// Opens a route as a connected wallet (a context created with the wallet-inject.cjs init script). The server
// renders every page as "not connected", and a wallet that connects while React hydrates that HTML leaves markup
// React does not repair. So the route is entered the way a connected user enters it: the wallet connects on the
// Explore page first, then the app navigates client-side, and the page is rendered once, in its connected state.
const gotoConnected = async (page, route, walletName) => {
    const state = page.context().baseline;
    if (!page.url().startsWith(APP_URL)) {
        state.connecting = true;
        await goto(page, '/');
        await page.getByRole('button', { name: walletName }).first().waitFor();
        state.connecting = false;
    }
    await page.evaluate((to) => window.next.router.push(to), route);
    await page.waitForURL(`${APP_URL}${route}`);
    await settle(page);
};

const produced = new Set();

// Captures one screenshot of the app into out/shots as lossless WebP. Options: fullPage (default true), errorPage
// (the shot is meant to show the app's error screen).
const shot = async (page, name, opts = {}) => {
    if (typeof name !== 'string' || !/^[a-z0-9-]+$/.test(name)) {
        throw new Error(`invalid shot name: ${String(name)}`);
    }
    await settle(page);
    const state = page.context().baseline;
    if (state.errors.length > 0) {
        throw new Error(state.errors.splice(0).join('; '));
    }
    if (
        !opts.errorPage &&
        (await page.getByText('Something went wrong').first().isVisible())
    ) {
        throw new Error('the app shows its error screen');
    }
    const fullPage = opts.fullPage ?? true;
    if (fullPage) {
        // A page left scrolled would show its sticky header in the middle of a full-page shot.
        await page.evaluate(() => window.scrollTo(0, 0));
    }
    const frame = await stableScreenshot(page, fullPage);
    fs.mkdirSync(SHOTS, { recursive: true });
    await deps
        .sharp(frame)
        .webp({ lossless: true })
        .toFile(path.join(SHOTS, `${name}.webp`));
    produced.add(name);
    console.log(`  ${name}`);
};

const answers = async (url, what, hint) => {
    try {
        const response = await fetch(url, {
            signal: AbortSignal.timeout(NAV_TIMEOUT),
        });
        if (response.ok) {
            return response;
        }
        return die(
            `${what} answered HTTP ${response.status} on ${url}. ${hint}`,
        );
    } catch (error) {
        return die(
            `${what} does not answer on ${url} (${error.cause?.code ?? error.name}). ${hint}`,
        );
    }
};

const mockHealth = async () => {
    const response = await answers(
        `${MOCK_URL}/health`,
        'The mock backend',
        'Start both servers with ./start.sh.',
    );
    return response.json();
};

// Runs the jobs of one capture script. Usage of every script: node capture-<x>.cjs [--update] [name]
//   jobs:   [{ name, run: async (browser) => {...} }]
//   match:  (jobName, filter) => boolean
// Screenshots go to out/shots; only --update copies them to design/reference, and only when nothing failed.
const runCapture = async (jobs, match) => {
    const args = process.argv.slice(2);
    const update = args.includes('--update');
    const rest = args.filter((arg) => arg !== '--update');
    if (rest.length > 1 || rest.some((arg) => arg.startsWith('-'))) {
        die(
            `Usage: node ${path.basename(process.argv[1])} [--update] [name]\nNames: ${jobs.map((job) => job.name).join(', ')}`,
        );
    }
    const filter = rest[0];
    const selected = filter
        ? jobs.filter((job) => match(job.name, filter))
        : jobs;
    if (selected.length === 0) {
        die(
            `"${filter}" matches nothing. Names: ${jobs.map((job) => job.name).join(', ')}`,
        );
    }

    const health = await mockHealth();
    if (health.now !== Math.floor(NOW_MS / 1000)) {
        die(
            `The mock backend runs on another clock (${new Date(health.now * 1000).toISOString()}) than this script (${new Date(NOW_MS).toISOString()}). Restart it (./stop.sh, ./start.sh) with the same MOCK_NOW.`,
        );
    }
    await answers(
        `${APP_URL}/`,
        'The app',
        'Start both servers with ./start.sh (the first start compiles for several minutes).',
    );

    // Jobs run on several browsers at once, each its own Chromium, so a failing job's cleanup touches only its own
    // contexts. Every job sets up its page from scratch, so the order does not matter; the mock backend keeps no
    // state between requests. BASELINE_CONCURRENCY overrides the count.
    const failures = [];
    const concurrency = Math.max(
        1,
        Number(process.env.BASELINE_CONCURRENCY) ||
            Math.min(4, require('node:os').availableParallelism()),
    );
    let next = 0;
    const worker = async () => {
        const browser = await launch();
        while (next < selected.length) {
            const job = selected[next++];
            let failed = false;
            try {
                await job.run(browser);
                console.log(job.name);
            } catch (error) {
                failed = true;
                const reason = String(error.message ?? error).split('\n')[0];
                failures.push(`${job.name}: ${reason}`);
                console.error(`${job.name}\n  FAILED: ${reason}`);
            }
            // A job that fails leaves its context open: keep what was on screen, then close it.
            for (const context of browser.contexts()) {
                for (const page of failed ? context.pages() : []) {
                    fs.mkdirSync(FAILURES, { recursive: true });
                    await page
                        .screenshot({
                            path: path.join(FAILURES, `${job.name}.png`),
                            fullPage: true,
                        })
                        // Best effort: the page may already be gone, and the failure is reported either way.
                        .catch(() => undefined);
                }
                await context.close();
            }
        }
        await browser.close();
    };
    await Promise.all(
        Array.from({ length: Math.min(concurrency, selected.length) }, worker),
    );

    const after = await mockHealth();
    for (const key of ['unmatched', 'errors']) {
        if (after[key] > health[key]) {
            failures.push(
                `the mock backend logged ${after[key] - health[key]} ${key === 'unmatched' ? 'request(s) it has no route for' : 'error(s)'} (see out/mock-requests.log)`,
            );
        }
    }
    if (failures.length > 0) {
        console.error(
            `\n${failures.length} failure(s):\n${failures.map((f) => `  - ${f}`).join('\n')}`,
        );
        console.error(
            `Screens at the moment of failure: ${path.relative(process.cwd(), FAILURES)}/${update ? '\ndesign/reference was not updated.' : ''}`,
        );
        process.exit(1);
    }
    if (update) {
        fs.mkdirSync(REFERENCE, { recursive: true });
        for (const name of produced) {
            fs.copyFileSync(
                path.join(SHOTS, `${name}.webp`),
                path.join(REFERENCE, `${name}.webp`),
            );
        }
    }
    console.log(
        `${produced.size} screenshot(s) in ${path.relative(process.cwd(), SHOTS)}/${update ? ', copied to design/reference/' : ''}`,
    );
};

module.exports = {
    HERE,
    DESIGN,
    REPO,
    CANVAS,
    REFERENCE,
    OUT,
    SCREENS,
    NOW_MS,
    MOCK_PORT,
    APP_URL,
    ASSET_HOST,
    CMS_PREFIX,
    PINATA_REPLY,
    TV_ROUTE,
    MS_ROUTE,
    SPP_ROUTE,
    WORKSPACE_ID,
    deps,
    die,
    launch,
    newContext,
    workspaceSeed,
    sleep,
    settle,
    stableScreenshot,
    goto,
    gotoConnected,
    shot,
    runCapture,
};

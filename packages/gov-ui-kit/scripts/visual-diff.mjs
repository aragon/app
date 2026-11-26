#!/usr/bin/env node
// Screenshot comparison of every kit story: catches unintended visual changes, e.g. of a token or class change that
// should keep every colour. Two capture sets are always produced on the same machine
// in the same run; no baseline is committed (screenshots are large and depend on the platform's font rendering).
//
//   node scripts/visual-diff.mjs ref <git-ref> [--head <git-ref>] [options]
//       Builds Storybook for <git-ref> (in a temporary git worktree) and for the working tree (or --head <git-ref>),
//       captures both and compares them. Exits 1 on any difference.
//   node scripts/visual-diff.mjs build <out-dir> [--ref <git-ref>]
//       Static Storybook build of the working tree, or of <git-ref> via a temporary worktree.
//   node scripts/visual-diff.mjs capture <storybook-dir> <out-dir> [options]
//       Captures every story of a static Storybook build.
//   node scripts/visual-diff.mjs compare <base-dir> <head-dir> [--diff <dir>]
//       Pixel comparison of two capture sets; writes a diff image per differing story. Exits 1 on any difference.
//
// Options: --filter <text contained in the story id> · --workers <n> (default 4) · --threshold <pixels> (default 0)
//          --work-dir <dir> (default node_modules/.cache/visual-diff)
//          --<attribute> <mode> for each token preview of .storybook/tokenPreviews.json, e.g. --theme next
//
// Playwright: uses `playwright-core` from the kit if present, else from another workspace (apps/app, apps/docs), or
// PLAYWRIGHT_CORE_PATH. Chromium: Playwright's own, else the newest one under PLAYWRIGHT_BROWSERS_PATH, or
// CHROMIUM_EXECUTABLE. Never runs `playwright install`.

import { execFileSync } from 'node:child_process';
import {
    existsSync,
    lstatSync,
    mkdirSync,
    mkdtempSync,
    readdirSync,
    readFileSync,
    realpathSync,
    rmSync,
    symlinkSync,
    writeFileSync,
} from 'node:fs';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { crc32, deflateSync, inflateSync } from 'node:zlib';

const kitRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = resolve(kitRoot, '../..');
const kitPath = relative(repoRoot, kitRoot);

// Stories whose pixels are not reproducible run to run. Each entry needs a reason; they are skipped, not compared.
const excludedStories = {};

const fixedTime = new Date('2025-01-15T12:00:00Z');
const viewport = { width: 1280, height: 800 };
const tokenPreviews = JSON.parse(readFileSync(resolve(kitRoot, '.storybook/tokenPreviews.json'), 'utf8'));

const log = (message) => console.log(`visual-diff: ${message}`);
const fail = (message) => {
    console.error(`visual-diff: ${message}`);
    process.exit(2);
};

const outputMarker = (dir, kind) => join(dir, `.visual-diff-${kind}`);

const prepareOutput = (dir, kind, inputs = []) => {
    mkdirSync(dir, { recursive: true });
    if (!lstatSync(dir).isDirectory()) {
        fail(`expected an output directory at ${dir}`);
    }
    const output = realpathSync(dir);
    for (const input of [process.cwd(), kitRoot, ...inputs]) {
        const path = realpathSync(input);
        if (path === output || path.startsWith(join(output, sep))) {
            fail(`output directory ${dir} contains ${input}`);
        }
    }
    const entries = readdirSync(dir);
    if (entries.length > 0 && !lstatSync(outputMarker(dir, kind), { throwIfNoEntry: false })?.isFile()) {
        fail(`refusing to clear ${dir}: choose an empty directory or a previous visual-diff ${kind} output`);
    }
    for (const entry of entries) {
        rmSync(join(dir, entry), { recursive: true, force: true });
    }
    writeFileSync(outputMarker(dir, kind), '', { flag: 'wx' });
};

const parseArgs = (argv) => {
    const positional = [];
    const options = { workers: 4, threshold: 0 };
    for (let index = 0; index < argv.length; index++) {
        const arg = argv[index];
        if (arg.startsWith('--')) {
            const [key, inline] = arg.slice(2).split('=');
            options[key.replace(/-(\w)/g, (_m, c) => c.toUpperCase())] = inline ?? argv[++index];
        } else {
            positional.push(arg);
        }
    }
    options.workers = Number(options.workers);
    options.threshold = Number(options.threshold);
    // Storybook globals of the requested token previews, as the iframe URL takes them: `theme:next;…`.
    const requested = tokenPreviews.filter(({ attribute }) => options[attribute] != null);
    for (const { attribute, modes } of requested) {
        if (!modes.includes(options[attribute])) {
            fail(`unknown ${attribute} "${options[attribute]}" (${modes.join(' | ')})`);
        }
    }
    options.globals = requested.map(({ attribute }) => `${attribute}:${options[attribute]}`).join(';');
    return { positional, options };
};

// --- PNG (8-bit, non-interlaced RGB/RGBA, as Chromium writes them) ----------------------------------------------

const decodePng = (buffer) => {
    let offset = 8;
    let width = 0;
    let height = 0;
    let channels = 0;
    const idat = [];
    while (offset < buffer.length) {
        const length = buffer.readUInt32BE(offset);
        const type = buffer.toString('latin1', offset + 4, offset + 8);
        const data = buffer.subarray(offset + 8, offset + 8 + length);
        if (type === 'IHDR') {
            width = data.readUInt32BE(0);
            height = data.readUInt32BE(4);
            const [bitDepth, colorType, , , interlace] = data.subarray(8);
            channels = { 2: 3, 6: 4 }[colorType];
            if (bitDepth !== 8 || channels == null || interlace !== 0) {
                throw new Error(
                    `unsupported PNG (bit depth ${bitDepth}, colour type ${colorType}, interlace ${interlace})`,
                );
            }
        } else if (type === 'IDAT') {
            idat.push(data);
        }
        offset += 12 + length;
    }
    const raw = inflateSync(Buffer.concat(idat));
    const stride = width * channels;
    const pixels = Buffer.alloc(width * height * 4);
    let previous = Buffer.alloc(stride);
    for (let y = 0; y < height; y++) {
        const filter = raw[y * (stride + 1)];
        const line = Buffer.from(raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)));
        for (let x = 0; x < stride; x++) {
            const left = x >= channels ? line[x - channels] : 0;
            const up = previous[x];
            const upLeft = x >= channels ? previous[x - channels] : 0;
            let predictor = 0;
            if (filter === 1) {
                predictor = left;
            } else if (filter === 2) {
                predictor = up;
            } else if (filter === 3) {
                predictor = (left + up) >> 1;
            } else if (filter === 4) {
                const p = left + up - upLeft;
                const pa = Math.abs(p - left);
                const pb = Math.abs(p - up);
                const pc = Math.abs(p - upLeft);
                predictor = pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft;
            }
            line[x] = (line[x] + predictor) & 0xff;
        }
        for (let x = 0; x < width; x++) {
            const target = (y * width + x) * 4;
            line.copy(pixels, target, x * channels, x * channels + channels);
            if (channels === 3) {
                pixels[target + 3] = 255;
            }
        }
        previous = line;
    }
    return { width, height, pixels };
};

const encodePng = ({ width, height, pixels }) => {
    const chunk = (type, data) => {
        const header = Buffer.alloc(8);
        header.writeUInt32BE(data.length, 0);
        header.write(type, 4, 'latin1');
        const crc = Buffer.alloc(4);
        crc.writeUInt32BE(crc32(Buffer.concat([header.subarray(4), data])) >>> 0);
        return Buffer.concat([header, data, crc]);
    };
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(width, 0);
    ihdr.writeUInt32BE(height, 4);
    ihdr.set([8, 6, 0, 0, 0], 8);
    const raw = Buffer.alloc(height * (width * 4 + 1));
    for (let y = 0; y < height; y++) {
        pixels.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
    }
    return Buffer.concat([
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        chunk('IHDR', ihdr),
        chunk('IDAT', deflateSync(raw)),
        chunk('IEND', Buffer.alloc(0)),
    ]);
};

// Counts differing pixels; the diff image shows the base dimmed with differing pixels in red (sizes may differ).
const diffImages = (base, head) => {
    const width = Math.max(base.width, head.width);
    const height = Math.max(base.height, head.height);
    const out = Buffer.alloc(width * height * 4);
    let count = 0;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const target = (y * width + x) * 4;
            const inBase = x < base.width && y < base.height;
            const inHead = x < head.width && y < head.height;
            const a = inBase ? (y * base.width + x) * 4 : -1;
            const b = inHead ? (y * head.width + x) * 4 : -1;
            const same =
                inBase &&
                inHead &&
                base.pixels[a] === head.pixels[b] &&
                base.pixels[a + 1] === head.pixels[b + 1] &&
                base.pixels[a + 2] === head.pixels[b + 2] &&
                base.pixels[a + 3] === head.pixels[b + 3];
            if (same) {
                const grey = 255 - ((255 - (base.pixels[a] + base.pixels[a + 1] + base.pixels[a + 2]) / 3) >> 2);
                out.set([grey, grey, grey, 255], target);
            } else {
                count++;
                out.set([255, 0, 64, 255], target);
            }
        }
    }
    return { count, image: { width, height, pixels: out } };
};

// --- Storybook build ---------------------------------------------------------------------------------------------

const run = (command, args, cwd) =>
    execFileSync(command, args, { cwd, stdio: ['ignore', 'pipe', 'inherit'], encoding: 'utf8' });

const buildStorybook = (outDir, ref) => {
    const started = Date.now();
    prepareOutput(outDir, 'build');
    if (ref == null) {
        log(`building Storybook of the working tree -> ${outDir}`);
        run(
            resolve(kitRoot, 'node_modules/.bin/storybook'),
            ['build', '-o', outDir, '--quiet', '--disable-telemetry'],
            kitRoot,
        );
    } else {
        const commit = run('git', ['rev-parse', '--verify', `${ref}^{commit}`], repoRoot).trim();
        const worktree = mkdtempSync(join(tmpdir(), 'guk-visual-diff-'));
        log(`building Storybook of ${ref} (${commit.slice(0, 10)}) in a temporary worktree -> ${outDir}`);
        run('git', ['worktree', 'add', '--detach', '--quiet', worktree, commit], repoRoot);
        try {
            // Dependencies come from this checkout: the root store is shared whole; the kit's own node_modules is
            // mirrored entry by entry so build caches (node_modules/.cache) are not shared between the two builds.
            // A ref with different dependencies than the working tree is therefore built with today's dependencies.
            symlinkSync(resolve(repoRoot, 'node_modules'), join(worktree, 'node_modules'));
            const kitModules = join(worktree, kitPath, 'node_modules');
            mkdirSync(kitModules, { recursive: true });
            for (const entry of readdirSync(resolve(kitRoot, 'node_modules'))) {
                if (entry !== '.cache') {
                    symlinkSync(resolve(kitRoot, 'node_modules', entry), join(kitModules, entry));
                }
            }
            run(
                resolve(kitRoot, 'node_modules/.bin/storybook'),
                ['build', '-o', outDir, '--quiet', '--disable-telemetry'],
                join(worktree, kitPath),
            );
        } finally {
            run('git', ['worktree', 'remove', '--force', worktree], repoRoot);
        }
    }
    // Storybook can empty the output directory during its build.
    writeFileSync(outputMarker(outDir, 'build'), '');
    log(`built in ${((Date.now() - started) / 1000).toFixed(1)}s`);
};

// --- Capture -----------------------------------------------------------------------------------------------------

const loadPlaywright = () => {
    const candidates = [
        process.env.PLAYWRIGHT_CORE_PATH,
        ...['', 'apps/app', 'apps/docs'].map((workspace) => {
            try {
                return createRequire(
                    resolve(workspace === '' ? kitRoot : resolve(repoRoot, workspace), 'package.json'),
                ).resolve('playwright-core');
            } catch {
                return undefined;
            }
        }),
    ].filter(Boolean);
    if (candidates.length === 0) {
        fail('playwright-core not found: install the repo (pnpm install) or set PLAYWRIGHT_CORE_PATH');
    }
    return createRequire(import.meta.url)(candidates[0]);
};

const findChromium = () => {
    if (process.env.CHROMIUM_EXECUTABLE) {
        return process.env.CHROMIUM_EXECUTABLE;
    }
    const roots = [process.env.PLAYWRIGHT_BROWSERS_PATH, join(process.env.HOME ?? '', '.cache/ms-playwright')].filter(
        (root) => root && existsSync(root),
    );
    const binaries = [
        ['chromium_headless_shell-', 'chrome-headless-shell-linux64/chrome-headless-shell'],
        ['chromium_headless_shell-', 'chrome-linux/headless_shell'],
        ['chromium-', 'chrome-linux64/chrome'],
        ['chromium-', 'chrome-linux/chrome'],
    ];
    for (const [prefix, binary] of binaries) {
        for (const root of roots) {
            const found = readdirSync(root)
                .filter((entry) => entry.startsWith(prefix) && /^\d+$/.test(entry.slice(prefix.length)))
                .sort((a, b) => Number(b.slice(prefix.length)) - Number(a.slice(prefix.length)))
                .map((entry) => join(root, entry, binary))
                .find((path) => existsSync(path));
            if (found) {
                return found;
            }
        }
    }
    return undefined;
};

const launchBrowser = async () => {
    const { chromium } = loadPlaywright();
    const args = ['--font-render-hinting=none', '--disable-skia-runtime-opts', '--force-color-profile=srgb'];
    try {
        return await chromium.launch({ args });
    } catch (error) {
        const executablePath = findChromium();
        if (executablePath == null || !/Executable doesn't exist|browserType\.launch/.test(String(error))) {
            throw error;
        }
        log(`Playwright's own Chromium is missing; using ${executablePath}`);
        return chromium.launch({ args, executablePath });
    }
};

const contentTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.mjs': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ttf': 'font/ttf',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
};

const serve = async (root) => {
    const server = createServer((request, response) => {
        const path = join(root, decodeURIComponent(new URL(request.url, 'http://x').pathname));
        if (!path.startsWith(root)) {
            response.statusCode = 403;
            response.end();
            return;
        }
        try {
            const body = readFileSync(path.endsWith('/') ? join(path, 'index.html') : path);
            response.setHeader('content-type', contentTypes[extname(path)] ?? 'application/octet-stream');
            response.end(body);
        } catch {
            response.statusCode = 404;
            response.end();
        }
    });
    await new Promise((done) => server.listen(0, '127.0.0.1', done));
    return { server, origin: `http://127.0.0.1:${server.address().port}` };
};

// Runs in the page before any story code: deterministic Math.random.
const seedRandom = () => {
    let seed = 0x2f_6b_3a_91;
    Math.random = () => {
        seed = (seed + 0x6d_2b_79_f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
        return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
    };
};

const freezeCss = `*, *::before, *::after {
    animation: none !important;
    transition: none !important;
    caret-color: transparent !important;
    scroll-behavior: auto !important;
}`;

const captureStory = async (browser, origin, story, globals, outDir) => {
    const context = await browser.newContext({
        viewport,
        deviceScaleFactor: 1,
        reducedMotion: 'reduce',
        colorScheme: 'light',
        locale: 'en-US',
        timezoneId: 'UTC',
    });
    try {
        // Stories render offline: anything not served by the static build (remote avatars, token logos) fails fast
        // and identically every run instead of depending on the network.
        await context.route('**/*', (route) =>
            route.request().url().startsWith(origin) ? route.continue() : route.abort('blockedbyclient'),
        );
        await context.addInitScript(seedRandom);
        const page = await context.newPage();
        await page.clock.setFixedTime(fixedTime);
        await page.goto(`${origin}/iframe.html?id=${story.id}&viewMode=story&globals=${globals}`);
        const status = await page
            .waitForFunction(
                () => {
                    const { classList } = document.body;
                    if (classList.contains('sb-show-errordisplay')) {
                        return 'error';
                    }
                    return classList.contains('sb-show-main') && document.querySelector('#storybook-root') != null
                        ? 'ok'
                        : null;
                },
                undefined,
                { timeout: 30_000 },
            )
            .then((handle) => handle.jsonValue());
        await page.addStyleTag({ content: freezeCss });
        await page.evaluate(async () => {
            await document.fonts.ready;
            await Promise.all(
                [...document.images].map((image) =>
                    image.complete
                        ? null
                        : new Promise((done) => image.addEventListener('loadend', done, { once: true })),
                ),
            );
            await new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)));
        });
        await page.mouse.move(viewport.width - 1, viewport.height - 1);
        // Stable wait: a screenshot is accepted once two consecutive ones are identical.
        const shoot = () => page.screenshot({ fullPage: true, animations: 'disabled', caret: 'hide' });
        let previous = await shoot();
        let attempts = 1;
        for (; attempts < 6; attempts++) {
            await page.waitForTimeout(100);
            const next = await shoot();
            if (next.equals(previous)) {
                break;
            }
            previous = next;
        }
        writeFileSync(join(outDir, `${story.id}.png`), previous);
        return { status, unstable: attempts === 6 };
    } finally {
        await context.close();
    }
};

const capture = async (storybookDir, outDir, options) => {
    const root = resolve(storybookDir);
    const index = JSON.parse(readFileSync(join(root, 'index.json'), 'utf8'));
    // Plain substring match on the story id: the filter is never compiled as a regular expression.
    const filter = options.filter ? options.filter.toLowerCase() : null;
    const all = Object.values(index.entries).filter((entry) => entry.type === 'story');
    const stories = all.filter(
        (story) => excludedStories[story.id] == null && (filter == null || story.id.includes(filter)),
    );
    prepareOutput(outDir, 'capture', [root]);
    const started = Date.now();
    const { server, origin } = await serve(root);
    const browser = await launchBrowser();
    const results = {};
    try {
        let next = 0;
        const worker = async () => {
            while (next < stories.length) {
                const story = stories[next++];
                try {
                    results[story.id] = await captureStory(browser, origin, story, options.globals, outDir);
                } catch (error) {
                    results[story.id] = { status: 'failed', error: String(error).split('\n')[0] };
                }
            }
        };
        await Promise.all(Array.from({ length: Math.max(1, options.workers) }, worker));
    } finally {
        await browser.close();
        server.close();
    }
    const failed = Object.entries(results).filter(([, result]) => result.status === 'failed');
    const errors = Object.entries(results).filter(([, result]) => result.status === 'error');
    const unstable = Object.entries(results).filter(([, result]) => result.unstable);
    writeFileSync(
        join(outDir, 'manifest.json'),
        `${JSON.stringify({ globals: options.globals, viewport, stories: results, excluded: excludedStories }, null, 4)}\n`,
    );
    log(
        `captured ${stories.length - failed.length}/${stories.length} stories (${options.globals || 'default tokens'}, ` +
            `${Object.keys(excludedStories).length} excluded, ${all.length - stories.length - Object.keys(excludedStories).length} filtered) ` +
            `in ${((Date.now() - started) / 1000).toFixed(1)}s -> ${outDir}`,
    );
    for (const [id, result] of failed) {
        log(`  capture failed: ${id}: ${result.error}`);
    }
    for (const [id] of errors) {
        log(`  story renders Storybook's error display: ${id}`);
    }
    for (const [id] of unstable) {
        log(`  never settled (consecutive screenshots kept changing): ${id}`);
    }
};

// --- Compare -----------------------------------------------------------------------------------------------------

const compare = (baseDir, headDir, options) => {
    const diffDir = resolve(options.diff ?? join(headDir, '..', 'diff'));
    const pngs = (dir) => new Set(readdirSync(dir).filter((file) => file.endsWith('.png')));
    const base = pngs(baseDir);
    const head = pngs(headDir);
    prepareOutput(diffDir, 'compare', [baseDir, headDir]);
    const names = [...new Set([...base, ...head])].sort();
    const rows = [];
    for (const name of names) {
        const id = name.slice(0, -4);
        if (!base.has(name) || !head.has(name)) {
            rows.push({ id, result: base.has(name) ? 'only in base' : 'only in head' });
            continue;
        }
        const a = readFileSync(join(baseDir, name));
        const b = readFileSync(join(headDir, name));
        if (a.equals(b)) {
            continue;
        }
        const imageA = decodePng(a);
        const imageB = decodePng(b);
        const { count, image } = diffImages(imageA, imageB);
        if (count > options.threshold) {
            writeFileSync(join(diffDir, name), encodePng(image));
            const size =
                imageA.width === imageB.width && imageA.height === imageB.height
                    ? ''
                    : ` (size ${imageA.width}x${imageA.height} -> ${imageB.width}x${imageB.height})`;
            rows.push({ id, result: `${count} px${size}` });
        }
    }
    for (const { id, result } of rows) {
        console.log(`  ${id}: ${result}`);
    }
    log(
        `compared ${names.length} stories: ${rows.length} differ${rows.length > 0 ? `, diff images in ${diffDir}` : ''}`,
    );
    return rows.length === 0;
};

// --- Commands ----------------------------------------------------------------------------------------------------

const { positional, options } = parseArgs(process.argv.slice(2));
const [command, ...args] = positional;
const workDir = resolve(options.workDir ?? resolve(kitRoot, 'node_modules/.cache/visual-diff'));

switch (command) {
    case 'build': {
        buildStorybook(resolve(args[0] ?? join(workDir, 'storybook')), options.ref);
        break;
    }
    case 'capture': {
        if (args.length !== 2) {
            fail('usage: capture <storybook-dir> <out-dir>');
        }
        await capture(args[0], resolve(args[1]), options);
        break;
    }
    case 'compare': {
        if (args.length !== 2) {
            fail('usage: compare <base-dir> <head-dir> [--diff <dir>]');
        }
        process.exitCode = compare(resolve(args[0]), resolve(args[1]), options) ? 0 : 1;
        break;
    }
    case 'ref': {
        if (args.length !== 1) {
            fail('usage: ref <git-ref> [--head <git-ref>]');
        }
        const started = Date.now();
        buildStorybook(join(workDir, 'base-storybook'), args[0]);
        buildStorybook(join(workDir, 'head-storybook'), options.head);
        await capture(join(workDir, 'base-storybook'), join(workDir, 'base'), options);
        await capture(join(workDir, 'head-storybook'), join(workDir, 'head'), options);
        const same = compare(join(workDir, 'base'), join(workDir, 'head'), { ...options, diff: join(workDir, 'diff') });
        log(
            `${args[0]} vs ${options.head ?? 'working tree'} (${options.globals || 'default tokens'}) in ${((Date.now() - started) / 1000).toFixed(1)}s`,
        );
        process.exitCode = same ? 0 : 1;
        break;
    }
    default:
        fail(
            'usage: visual-diff.mjs ref <git-ref> | build <out-dir> | capture <storybook-dir> <out-dir> | compare <base> <head>',
        );
}

'use strict';
// Compares every screen of design/screens.json, rendered from design/canvas, with its reference screenshot.
// Usage: node compare.cjs [--threshold <percent>] [--allow-stand-ins] [--against <folder>]
//   --threshold        share of differing pixels that fails a screen, in percent (default 1)
//   --allow-stand-ins  report stand-ins without failing (exploration branches only, see below)
//   --against          compare with renders saved by render-canvas.cjs (<artboard>-1440.png, <artboard>-390.png) in
//                      <folder> instead of design/reference; screens without a saved render are skipped
// Prints one row per comparison and writes reference | canvas | difference images to out/compare/. Exits 1 when a
// height differs, more than the threshold of pixels differ, a render has problems, a screen uses an undefined class,
// or a screen holds a stand-in.
//
// A stand-in is markup that an exploration draws in place of a kit component it wants to change, marked with
// data-stands-in-for="GovUiKit.<Component>". It may exist on an exploration branch only: the pull request that
// implements the design changes the kit component and puts the real one back (RUNBOOK.md, Handover).
const fs = require('node:fs');
const path = require('node:path');
const {
    CANVAS,
    REFERENCE,
    OUT,
    SCREENS,
    deps,
    die,
    launch,
} = require('./lib.cjs');
const { KIT_DIR, checkInputs, renderArtboard } = require('./render-canvas.cjs');

const CHANNEL_TOLERANCE = 25; // a pixel differs when one of its channels is off by more than this (of 255)

// Classes used in the screens that neither the kit stylesheet nor the canvas's app.css defines do nothing, silently.
const undefinedClasses = () => {
    const css =
        fs.readFileSync(
            path.join(KIT_DIR, 'components', 'bundle.css'),
            'utf8',
        ) + fs.readFileSync(path.join(CANVAS, 'app.css'), 'utf8');
    const defined = new Set(
        [...css.matchAll(/\.((?:[a-zA-Z0-9_-]|\\.)+)/g)].map((m) =>
            m[1].replace(/\\(.)/g, '$1'),
        ),
    );
    const found = [];
    for (const file of fs
        .readdirSync(CANVAS)
        .filter((f) => f.endsWith('.dc.html'))
        .sort()) {
        const source = fs.readFileSync(path.join(CANVAS, file), 'utf8');
        const used = new Set();
        for (const m of source.matchAll(
            /(?:class-name|layout-class-name|class)="([^"]*)"/g,
        )) {
            if (!m[1].includes('{{')) {
                for (const token of m[1].split(/\s+/).filter(Boolean)) {
                    used.add(token);
                }
            }
        }
        const missing = [...used].filter((token) => !defined.has(token)).sort();
        if (missing.length > 0) {
            found.push(`${file}: ${missing.join(' ')}`);
        }
    }
    return found;
};

// Kit components drawn as hand-made markup by an exploration (see the header).
const standIns = () =>
    fs
        .readdirSync(CANVAS)
        .filter((f) => f.endsWith('.dc.html'))
        .sort()
        .flatMap((file) =>
            [
                ...fs
                    .readFileSync(path.join(CANVAS, file), 'utf8')
                    .matchAll(/data-stands-in-for="([^"]+)"/g),
            ].map((m) => `${file}: ${m[1]}`),
        );

const pixels = async (input) => {
    const { data, info } = await deps
        .sharp(input)
        .removeAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
    return { data, width: info.width, height: info.height };
};

// Returns the share of differing pixels (over the taller of the two images) and writes reference | canvas | difference.
const compareImages = async (referenceFile, canvasPng, outFile) => {
    const a = await pixels(referenceFile);
    const b = await pixels(canvasPng);
    const width = Math.max(a.width, b.width);
    const height = Math.max(a.height, b.height);
    const mask = Buffer.alloc(width * height * 3, 255);
    let differing = 0;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const inA = x < a.width && y < a.height;
            const inB = x < b.width && y < b.height;
            const i = (y * a.width + x) * 3;
            const j = (y * b.width + x) * 3;
            const differs =
                !(inA && inB) ||
                Math.abs(a.data[i] - b.data[j]) > CHANNEL_TOLERANCE ||
                Math.abs(a.data[i + 1] - b.data[j + 1]) > CHANNEL_TOLERANCE ||
                Math.abs(a.data[i + 2] - b.data[j + 2]) > CHANNEL_TOLERANCE;
            if (differs) {
                differing += 1;
                const k = (y * width + x) * 3;
                mask[k] = 220;
                mask[k + 1] = 0;
                mask[k + 2] = 0;
            }
        }
    }
    const gap = 16;
    const panel = (image, left) => ({
        input: image.data,
        raw: { width: image.width, height: image.height, channels: 3 },
        left,
        top: 0,
    });
    await deps
        .sharp({
            create: {
                width: width * 3 + gap * 2,
                height,
                channels: 3,
                background: '#808080',
            },
        })
        .composite([
            panel(a, 0),
            panel(b, width + gap),
            panel({ data: mask, width, height }, (width + gap) * 2),
        ])
        .png()
        .toFile(outFile);
    return (100 * differing) / (width * height);
};

(async () => {
    const usage =
        'Usage: node compare.cjs [--threshold <percent>] [--allow-stand-ins] [--against <folder>]';
    const args = process.argv.slice(2);
    let threshold = 1;
    let allowStandIns = false;
    let against = null;
    while (args.length > 0) {
        const arg = args.shift();
        if (arg === '--threshold') {
            threshold = Number(args.shift());
        } else if (arg === '--allow-stand-ins') {
            allowStandIns = true;
        } else if (arg === '--against') {
            against = path.resolve(args.shift() ?? '');
        } else {
            die(usage);
        }
    }
    if (!(threshold >= 0) || (against && !fs.existsSync(against))) {
        die(usage);
    }
    console.log(checkInputs());

    const failures = undefinedClasses().map(
        (line) => `classes that no stylesheet defines, ${line}`,
    );
    const foundStandIns = standIns();
    for (const line of foundStandIns) {
        console.log(`stand-in: ${line}`);
    }
    if (!allowStandIns) {
        failures.push(
            ...foundStandIns.map(
                (line) =>
                    `stand-in left in place of the kit component, ${line}`,
            ),
        );
    }
    const outDir = path.join(OUT, 'compare');
    fs.mkdirSync(outDir, { recursive: true });
    const browser = await launch();
    const rows = [
        [
            'artboard',
            'reference',
            'ref height',
            'canvas height',
            'differing',
            '',
        ],
    ];
    const notes = [];
    for (const screen of SCREENS.screens) {
        for (const [reference, mobile] of [
            [screen.reference, false],
            [screen.mobileReference, true],
        ]) {
            if (!reference) {
                continue;
            }
            const referenceFile = against
                ? path.join(
                      against,
                      `${screen.artboard.replace('.dc.html', '')}-${mobile ? 390 : 1440}.png`,
                  )
                : path.join(REFERENCE, reference);
            if (against && !fs.existsSync(referenceFile)) {
                continue;
            }
            if (!fs.existsSync(referenceFile)) {
                failures.push(
                    `${screen.artboard}: design/reference/${reference} does not exist`,
                );
                continue;
            }
            const render = await renderArtboard(browser, screen.artboard, {
                mobile,
            });
            const referenceHeight = (await deps.sharp(referenceFile).metadata())
                .height;
            const differing = await compareImages(
                referenceFile,
                render.png,
                path.join(outDir, reference.replace(/\.webp$/, '.png')),
            );
            const problems = [
                ...render.problems,
                ...(render.height === referenceHeight
                    ? []
                    : [
                          `height ${render.height} instead of ${referenceHeight}`,
                      ]),
                ...(differing > threshold
                    ? [
                          `${differing.toFixed(2)}% of pixels differ (threshold ${threshold}%)`,
                      ]
                    : []),
            ];
            rows.push([
                screen.artboard,
                reference,
                String(referenceHeight),
                String(render.height),
                `${differing.toFixed(2)}%`,
                problems.length > 0 ? 'FAIL' : 'ok',
            ]);
            failures.push(
                ...problems.map(
                    (p) => `${screen.artboard} vs ${reference}: ${p}`,
                ),
            );
        }
        notes.push(
            ...(screen.knownDifferences ?? []).map(
                (note) => `${screen.artboard}, known difference: ${note}`,
            ),
        );
    }
    await browser.close();

    const widths = rows[0].map((_, column) =>
        Math.max(...rows.map((row) => row[column].length)),
    );
    for (const row of rows) {
        console.log(
            row.map((cell, column) => cell.padEnd(widths[column])).join('  '),
        );
    }
    for (const note of notes) {
        console.log(note);
    }
    console.log(
        `Side-by-side images (reference | canvas | difference): ${path.relative(process.cwd(), outDir)}/`,
    );
    if (failures.length > 0) {
        console.error(
            `\n${failures.length} failure(s):\n${failures.map((f) => `  - ${f}`).join('\n')}`,
        );
        process.exit(1);
    }
})();

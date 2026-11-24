'use strict';
// Lays the canvas out from design/canvas-layout.json: writes the pages, every frame's position and the row titles
// into design/canvas/canvas.json, keeping the file's other keys (title, design system record, creation stamp).
//
// The layout file lists only the prototypes, in rows, on the first page. Everything else is derived, so no part can
// be left off the canvas or listed twice:
//   - a prototype's parts are the files it mounts with <dc-import>, followed recursively;
//   - a part used by prototypes of more than one group goes in the "Shared" row (a page marked
//     "reuses" does not count: the workspace mounts the DAOs' own pages);
//   - every part goes on the one Parts page, in a titled row per group of prototypes, shared parts first, with
//     pages and steps before dialogs.
// The script fails if a .dc.html file in design/canvas is reached by no prototype, or a listed prototype is missing.
//
//   node design/publish/layout-canvas.cjs
const fs = require('node:fs');
const path = require('node:path');
const { CANVAS, die } = require('./paths.cjs');

const GAP_X = 80; // between frames in a row
const TITLE = 300; // a row's title sits this far above its frames (the canvas asks for at least 223)
const GAP_Y = 200; // between the tallest frame of a row and the next row's title
const PER_ROW = 8; // parts per row before wrapping

const layout = JSON.parse(
    fs.readFileSync(path.join(CANVAS, '..', 'canvas-layout.json'), 'utf8'),
);
const canvasFile = path.join(CANVAS, 'canvas.json');
const canvas = JSON.parse(fs.readFileSync(canvasFile, 'utf8'));
const files = fs
    .readdirSync(CANVAS)
    .filter((file) => file.endsWith('.dc.html'));
const read = (file) => fs.readFileSync(path.join(CANVAS, file), 'utf8');

const prototypes = layout.rows.flatMap((row) =>
    row.artboards.map((board) => board.file),
);
const missing = prototypes.filter((file) => !files.includes(file));
if (missing.length > 0) {
    die(
        `canvas-layout.json lists files that do not exist: ${missing.join(', ')}`,
    );
}

// The parts each prototype mounts, followed through parts that mount parts.
const importsOf = (file) =>
    [...read(file).matchAll(/<dc-import name="([^"{]+)"/g)]
        .map((match) => `${match[1]}.dc.html`)
        .filter((part) => files.includes(part));
const closure = (file, seen = new Set()) => {
    for (const part of importsOf(file)) {
        if (!seen.has(part)) {
            seen.add(part);
            closure(part, seen);
        }
    }
    return seen;
};

// A page marked "reuses" (the workspace, which mounts the DAOs' own pages) does not make a part shared: a part it
// reaches stays on the page of the prototype it was written for, and only parts nothing else reaches are its own.
const reach = (pages) => {
    const found = {};
    for (const page of pages) {
        for (const prototype of page.prototypes) {
            for (const part of closure(prototype)) {
                if (!prototypes.includes(part)) {
                    found[part] = (found[part] ?? new Set()).add(page.id);
                }
            }
        }
    }
    return found;
};
const pagesOfPart = reach(layout.partPages.filter((page) => !page.reuses));
for (const [part, pages] of Object.entries(
    reach(layout.partPages.filter((page) => page.reuses)),
)) {
    pagesOfPart[part] = pagesOfPart[part] ?? pages;
}
const unreached = files.filter(
    (file) => !(prototypes.includes(file) || pagesOfPart[file]),
);
if (unreached.length > 0) {
    die(
        `These files are mounted by no prototype of canvas-layout.json: ${unreached.join(', ')}`,
    );
}

const isDialog = (file) => /Dialog|Wallet(Connect|User)/.test(file);
const partPages = [
    { id: 'parts-shared', name: 'Shared by several prototypes' },
    ...layout.partPages,
].map((page) => {
    const parts = Object.keys(pagesOfPart)
        .filter((part) =>
            page.id === 'parts-shared'
                ? pagesOfPart[part].size > 1
                : pagesOfPart[part].size === 1 &&
                  pagesOfPart[part].has(page.id),
        )
        .sort();
    // One row per group on the single Parts page: pages and steps first, then dialogs.
    return {
        title: page.name,
        files: [
            ...parts.filter((part) => !isDialog(part)),
            ...parts.filter(isDialog),
        ],
    };
});

// The size a part's frame gets: its $preview, as the canvas would.
const previewSize = (file) => {
    const match = /"\$preview":\{"width":(\d+),"height":(\d+)\}/.exec(
        read(file),
    );
    const clamp = (n) => Math.min(Math.max(Number(n), 40), 8000);
    return match
        ? { w: clamp(match[1]), h: clamp(match[2]) }
        : { w: 1440, h: 900 };
};

const boards = {};
const notes = {};
const order = [];
const slug = (text) =>
    text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 30);

// Page 1: the prototypes. Each is a whole flow in a 1440 × 900 frame that fills the window in Play.
let y = 0;
for (const row of layout.rows) {
    let x = 0;
    for (const { file, title } of row.artboards) {
        boards[file] = {
            x,
            y: y + TITLE,
            w: 1440,
            h: 900,
            title,
            page: 'prototypes',
            expand: 'fill',
            is_interactive: true,
        };
        order.push(file);
        x += 1440 + GAP_X;
    }
    notes[`proto-${slug(row.title)}`] = {
        x: 0,
        y,
        text: row.title,
        kind: 'title1',
        maxW: Math.min(Math.max(x - GAP_X, 1440), 8000),
        page: 'prototypes',
    };
    y += TITLE + 900 + GAP_Y;
}
if (layout.note) {
    notes['proto-how-to'] = {
        x: -560,
        y: TITLE,
        w: 440,
        text: layout.note,
        page: 'prototypes',
    };
}

// The Parts page: one titled row per group of prototypes.
let top = 0;
for (const group of partPages.filter((entry) => entry.files.length > 0)) {
    notes[`parts-${slug(group.title)}`] = {
        x: 0,
        y: top,
        text: group.title,
        kind: 'title1',
        maxW: 8000,
        page: 'parts',
    };
    let rowTop = top + TITLE;
    for (let i = 0; i < group.files.length; i += PER_ROW) {
        let x = 0;
        let height = 0;
        for (const file of group.files.slice(i, i + PER_ROW)) {
            const size = previewSize(file);
            boards[file] = {
                x,
                y: rowTop,
                ...size,
                title: file.replace(/\.dc\.html$/, ''),
                page: 'parts',
            };
            order.push(file);
            x += size.w + GAP_X;
            height = Math.max(height, size.h);
        }
        rowTop += height + 120;
    }
    top = rowTop + GAP_Y;
}

canvas.pages = [
    { id: 'prototypes', name: 'Prototypes' },
    { id: 'parts', name: 'Parts' },
];
canvas.boards = boards;
canvas.order = order;
canvas.notes = notes;
canvas.launch = { view: 'canvas', page: 'prototypes' };
fs.writeFileSync(canvasFile, `${JSON.stringify(canvas, null, 2)}\n`);
console.log(
    `${prototypes.length} prototypes and ${order.length - prototypes.length} parts on ${canvas.pages.length} pages`,
);

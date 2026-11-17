'use strict';
// Lays the canvas out from design/screens.json → pages: writes the pages, every board's position and the row titles
// into design/canvas/canvas.json, keeping each board's other keys (title, size, flags) and every other key of the file.
//
// Each page is a column of rows; a row is a title note followed by its artboards left to right. Every .dc.html file
// of design/canvas must be placed exactly once: the script fails on a file that is missing, listed twice or listed
// without a file. A board new to canvas.json gets its size from its $preview and is titled after its file.
//
//   node design/baseline-check/layout-canvas.cjs
const fs = require('node:fs');
const path = require('node:path');

const DESIGN = path.resolve(__dirname, '..');
const CANVAS = path.join(DESIGN, 'canvas');
const GAP_X = 80; // between artboards in a row
const TITLE = 300; // a row's title note sits this far above its artboards (the canvas asks for at least 223)
const GAP_Y = 200; // between the tallest artboard of a row and the next row's title

const { pages } = JSON.parse(
    fs.readFileSync(path.join(DESIGN, 'screens.json'), 'utf8'),
);
const canvasFile = path.join(CANVAS, 'canvas.json');
const canvas = JSON.parse(fs.readFileSync(canvasFile, 'utf8'));
const files = fs
    .readdirSync(CANVAS)
    .filter((file) => file.endsWith('.dc.html'));

const placed = pages.flatMap((page) =>
    page.rows.flatMap((row) => row.artboards),
);
const problems = [
    ...files
        .filter((file) => !placed.includes(file))
        .map((file) => `${file} is on no row`),
    ...placed
        .filter((file, i) => placed.indexOf(file) !== i)
        .map((file) => `${file} is listed twice`),
    ...placed
        .filter((file) => !files.includes(file))
        .map((file) => `${file} is listed but does not exist`),
];
if (problems.length > 0) {
    console.error(`screens.json → pages:\n  ${problems.join('\n  ')}`);
    process.exit(1);
}

// The size a board gets when canvas.json has none for it yet: its $preview, as the canvas would.
const previewSize = (file) => {
    const match = /"\$preview":\{"width":(\d+),"height":(\d+)\}/.exec(
        fs.readFileSync(path.join(CANVAS, file), 'utf8'),
    );
    return match
        ? { w: Number(match[1]), h: Number(match[2]) }
        : { w: 1440, h: 900 };
};

const noteId = (pageId, title) =>
    `${pageId}-${title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')}`.slice(0, 40);

const boards = {};
const notes = {};
for (const page of pages) {
    let y = 0;
    for (const row of page.rows) {
        let x = 0;
        let height = 0;
        for (const file of row.artboards) {
            const board = canvas.boards[file] ?? {
                ...previewSize(file),
                title: file.replace(/\.dc\.html$/, ''),
            };
            boards[file] = { ...board, x, y: y + TITLE, page: page.id };
            x += board.w + GAP_X;
            height = Math.max(height, board.h);
        }
        notes[noteId(page.id, row.title)] = {
            x: 0,
            y,
            text: row.title,
            kind: 'title1',
            maxW: Math.max(x - GAP_X, 1440),
            page: page.id,
        };
        y += TITLE + height + GAP_Y;
    }
}

canvas.pages = pages.map(({ id, name }) => ({ id, name }));
canvas.boards = boards;
canvas.order = placed;
canvas.notes = notes;
canvas.launch = { view: 'canvas', page: pages[0].id };
fs.writeFileSync(canvasFile, `${JSON.stringify(canvas, null, 2)}\n`);
console.log(`${placed.length} artboards on ${pages.length} pages`);

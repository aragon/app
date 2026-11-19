'use strict';
// The reverse of prepare-publish.cjs: takes the files read from a canvas and makes design/canvas/ match them, so a
// designer's changes on the canvas show up as a git diff.
//
// <folder> holds the canvas's own files as read from it (everything under project/ except project/ds/, the kit).
// Each file is written byte for byte, except that every image url recorded in the canvas's record goes back to the
// image's path. A .dc.html file that is in design/canvas/ and not in <folder> was deleted on the canvas and is
// deleted here. Images are not copied back; an upload the record does not know (an image added on the canvas) is
// listed and the script exits with code 2: save that image under design/canvas/assets/, record it with
// record-assets.cjs, and run this again.
//
//   node design/publish/pull-canvas.cjs <folder> [canvas name, default: prototypes]
const fs = require('node:fs');
const path = require('node:path');
const { CANVAS, die, pointerFile } = require('./paths.cjs');

const input = process.argv[2];
if (!input || process.argv.length > 4) {
    die('Usage: node design/publish/pull-canvas.cjs <folder> [canvas name]');
}
const POINTER = pointerFile(process.argv[3]);
if (!fs.existsSync(POINTER)) {
    die(`${POINTER} does not exist: this canvas was never published from the repo`);
}
const root = fs.existsSync(path.join(input, 'project'))
    ? path.join(input, 'project')
    : input;
const pathOfUrl = Object.fromEntries(
    Object.entries(JSON.parse(fs.readFileSync(POINTER, 'utf8')).assets ?? {}).map(
        ([canvasPath, record]) => [record.url, canvasPath],
    ),
);

const isText = (file) => /\.(dc\.html|css|json)$/.test(file);
const pulled = fs
    .readdirSync(root)
    .filter((file) => isText(file) && fs.statSync(path.join(root, file)).isFile());
if (!pulled.includes('canvas.json')) {
    die(`${root} has no canvas.json: it does not look like a canvas's files`);
}

const unknown = new Set();
const changed = [];
for (const file of pulled) {
    const text = fs
        .readFileSync(path.join(root, file), 'utf8')
        .replace(/\/_blob\/[\w-]+/g, (url) => {
            if (!pathOfUrl[url]) {
                unknown.add(`${file}: ${url}`);
            }
            return pathOfUrl[url] ?? url;
        });
    const target = path.join(CANVAS, file);
    if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== text) {
        fs.writeFileSync(target, text);
        changed.push(file);
    }
}
const deleted = fs
    .readdirSync(CANVAS)
    .filter((file) => file.endsWith('.dc.html') && !pulled.includes(file));
for (const file of deleted) {
    fs.rmSync(path.join(CANVAS, file));
}

console.log(
    `${pulled.length} files read; ${changed.length} changed${changed.length > 0 ? `: ${changed.join(', ')}` : ''}; ${deleted.length} deleted${deleted.length > 0 ? `: ${deleted.join(', ')}` : ''}`,
);
if (unknown.size > 0) {
    console.log(
        `Uploads this canvas's record does not know (images added on the canvas):\n  ${[...unknown].join('\n  ')}`,
    );
    process.exit(2);
}

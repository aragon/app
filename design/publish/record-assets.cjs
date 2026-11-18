'use strict';
// Records the canvas uploads of images in the canvas pointer file (`assets`: canvas path → url and the sha256 of
// the file uploaded), for prepare-publish.cjs. Takes a JSON file mapping each image's canvas path (e.g.
// "assets/mock/avatar/meridian.svg") to the url the upload answered with.
//
//   node design/publish/record-assets.cjs <uploads.json>
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { APP_ASSETS, CANVAS, POINTER, REPO, die } = require('./paths.cjs');

const input = process.argv[2];
if (!input || process.argv.length > 3) {
    die('Usage: node design/publish/record-assets.cjs <uploads.json>');
}
const uploads = JSON.parse(fs.readFileSync(input, 'utf8'));
const pointer = JSON.parse(fs.readFileSync(POINTER, 'utf8'));
pointer.assets = pointer.assets ?? {};
for (const [canvasPath, url] of Object.entries(uploads)) {
    const appOwned = APP_ASSETS[canvasPath];
    const source = appOwned
        ? path.join(REPO, appOwned)
        : path.join(CANVAS, canvasPath);
    if (!fs.existsSync(source)) {
        die(
            `${canvasPath} is neither in design/canvas/ nor an app-owned image`,
        );
    }
    if (!/^\/_blob\/[\w-]+$/.test(url)) {
        die(`${canvasPath}: "${url}" is not a canvas upload url (/_blob/<id>)`);
    }
    pointer.assets[canvasPath] = {
        url,
        sha256: crypto
            .createHash('sha256')
            .update(fs.readFileSync(source))
            .digest('hex'),
    };
}
pointer.assets = Object.fromEntries(
    Object.entries(pointer.assets).sort(([a], [b]) => a.localeCompare(b)),
);
fs.writeFileSync(POINTER, `${JSON.stringify(pointer, null, 4)}\n`);
console.log(
    `${Object.keys(uploads).length} upload(s) recorded in ${path.relative(REPO, POINTER)}`,
);

'use strict';
// Records the canvas uploads of images in the canvas pointer file (`assets`: canvas path → url and the sha256 of
// the file uploaded), for prepare-publish.cjs. Takes a JSON file mapping each image to the url the upload answered with. The
// image is named by its canvas path ("assets/mock/avatar/meridian.svg") or by the path of the file uploaded
// ("<folder>/uploads/assets/mock/avatar/meridian.svg"), whichever the upload's answer makes easier to copy.
//
//   node design/publish/record-assets.cjs <uploads.json> [canvas name, default: prototypes]
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { APP_ASSETS, CANVAS, REPO, die, pointerFile } = require('./paths.cjs');

const input = process.argv[2];
if (!input || process.argv.length > 4) {
    die(
        'Usage: node design/publish/record-assets.cjs <uploads.json> [canvas name]',
    );
}
const POINTER = pointerFile(process.argv[3]);
const uploads = JSON.parse(fs.readFileSync(input, 'utf8'));
const pointer = fs.existsSync(POINTER)
    ? JSON.parse(fs.readFileSync(POINTER, 'utf8'))
    : {};
pointer.assets = pointer.assets ?? {};
for (const [key, url] of Object.entries(uploads)) {
    // A key may be the path of the file that was uploaded (…/uploads/assets/networks/base.svg): keep what follows uploads/.
    const canvasPath = key.includes('/uploads/')
        ? key.slice(key.lastIndexOf('/uploads/') + '/uploads/'.length)
        : key;
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

'use strict';
// Shared by the publish scripts: where things are.
const fs = require('node:fs');
const path = require('node:path');

const die = (message) => {
    console.error(message);
    process.exit(1);
};

const DESIGN = path.join(__dirname, '..');
const REPO = path.join(DESIGN, '..');
// The canvas files: prototypes, their parts, the stylesheets, the layout index and the mock images.
const CANVAS = path.join(DESIGN, 'canvas');
// A canvas's record: which canvas it is, the version last published or pulled, and the upload of each image on it
// (uploads belong to one canvas, so every canvas has a record of its own). `name` is the file name without .json;
// the reference canvas, the one that mirrors main, is "prototypes".
const pointerFile = (name = 'prototypes') => {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(name)) {
        die(`"${name}" is not a canvas name (lower-case letters, digits and dashes)`);
    }
    return path.join(DESIGN, 'canvases', `${name}.json`);
};
// Images the prototypes show that belong to the app (chain logos): canvas path → path in the repo.
const APP_ASSETS = JSON.parse(
    fs.readFileSync(path.join(DESIGN, 'app-assets.json'), 'utf8'),
);

module.exports = { APP_ASSETS, CANVAS, REPO, die, pointerFile };

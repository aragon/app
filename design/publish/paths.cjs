'use strict';
// Shared by the two publish scripts: where things are.
const fs = require('node:fs');
const path = require('node:path');

const DESIGN = path.join(__dirname, '..');
const REPO = path.join(DESIGN, '..');
// The canvas files: prototypes, their parts, the stylesheets, the layout index and the mock images.
const CANVAS = path.join(DESIGN, 'canvas');
// Which canvas these files are published to, and the upload of each image on it.
const POINTER = path.join(DESIGN, 'canvases', 'prototypes.json');
// Images the prototypes show that belong to the app (chain logos): canvas path → path in the repo.
const APP_ASSETS = JSON.parse(
    fs.readFileSync(path.join(DESIGN, 'app-assets.json'), 'utf8'),
);

const die = (message) => {
    console.error(message);
    process.exit(1);
};

module.exports = { APP_ASSETS, CANVAS, POINTER, REPO, die };

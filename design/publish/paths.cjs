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
// (uploads belong to one canvas, so every canvas has a record of its own). The reference canvas's record holds no
// version: that canvas carries its own project/published.json (see prepare-publish.cjs), so a refresh changes nothing in git. `name` is the file name without .json;
// the reference canvas, the one that mirrors main, is "prototypes".
//
// A record is in one place at a time. It starts as a draft in design/.runtime/canvases/, which git ignores, so a
// canvas that is never saved leaves nothing in git. The first save moves it to design/canvases/, where it is
// committed with the design.
const pointerFile = (name = 'prototypes') => {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(name)) {
        die(
            `"${name}" is not a canvas name (lower-case letters, digits and dashes)`,
        );
    }
    const saved = path.join(DESIGN, 'canvases', `${name}.json`);
    const draft = path.join(DESIGN, '.runtime', 'canvases', `${name}.json`);
    if (name === 'prototypes') {
        return saved;
    }
    if (fs.existsSync(saved) && fs.existsSync(draft)) {
        die(
            `"${name}" has two records, ${path.relative(REPO, saved)} and ${path.relative(REPO, draft)}: they are two canvases, rename the draft`,
        );
    }
    return fs.existsSync(saved) ? saved : draft;
};
// Images the prototypes show that belong to the app (chain logos): canvas path → path in the repo.
const APP_ASSETS = JSON.parse(
    fs.readFileSync(path.join(DESIGN, 'app-assets.json'), 'utf8'),
);

// The reference canvas's own record of what was published to it (the commit and the fingerprint), written by
// prepare-publish.cjs into project/: the canvas reads its files only under project/.
const STAMP = 'published.json';
// Fingerprint of a canvas's own files: a project/ folder, prepared by prepare-publish.cjs or read from the canvas.
// File names are part of it, so an edit, a rename and a deletion all change it. The kit (ds/), the stamp and the
// images are left out (images are not in the folder at all).
const digestFolder = (folder) => {
    const sha256 = (data) =>
        require('node:crypto').createHash('sha256').update(data).digest('hex');
    const hashes = [];
    for (const entry of fs.readdirSync(folder).sort()) {
        const file = path.join(folder, entry);
        if (entry === STAMP) {
            continue;
        }
        if (fs.statSync(file).isDirectory()) {
            if (entry === 'ds') {
                continue;
            }
            die(
                `${file} is a folder: a canvas's own files sit directly in project/`,
            );
        }
        hashes.push([entry, sha256(fs.readFileSync(file))]);
    }
    return sha256(JSON.stringify(hashes));
};

module.exports = {
    APP_ASSETS,
    CANVAS,
    REPO,
    STAMP,
    die,
    digestFolder,
    pointerFile,
};

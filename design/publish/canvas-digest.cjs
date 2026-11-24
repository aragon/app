'use strict';
// Fingerprints a canvas's own files: a project/ folder, either prepared by prepare-publish.cjs or read from the
// canvas. File names are part of it, so an edit, a rename and a deletion all change it. The kit (ds/) is left out,
// and images are not in the folder at all.
//
// With a canvas name it answers "was the canvas edited since the repo last saw it?": the fingerprint is compared
// with `canvasDigest` in the canvas's record. Exit code 0 if they are the same, 2 if they differ or the record has
// none. With --record the fingerprint is written to the record instead.
//
//   node design/publish/canvas-digest.cjs <project folder> [canvas name] [--record]
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { REPO, die, pointerFile } = require('./paths.cjs');

const args = process.argv.slice(2);
const record = args.includes('--record');
const [folder, name, ...rest] = args.filter((arg) => arg !== '--record');
if (
    !folder ||
    rest.length > 0 ||
    (record && !name) ||
    !fs.existsSync(path.join(folder, 'canvas.json'))
) {
    die(
        'Usage: node design/publish/canvas-digest.cjs <project folder containing canvas.json> [canvas name] [--record]',
    );
}

const sha256 = (data) => crypto.createHash('sha256').update(data).digest('hex');
const hashes = [];
for (const entry of fs.readdirSync(folder).sort()) {
    const file = path.join(folder, entry);
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
const digest = sha256(JSON.stringify(hashes));

if (!name) {
    console.log(digest);
    process.exit(0);
}
const POINTER = pointerFile(name);
const where = path.relative(REPO, POINTER);
if (!fs.existsSync(POINTER)) {
    die(`${where} does not exist: there is no record of this canvas here`);
}
const pointer = JSON.parse(fs.readFileSync(POINTER, 'utf8'));
if (record) {
    pointer.canvasDigest = digest;
    fs.writeFileSync(POINTER, `${JSON.stringify(pointer, null, 4)}\n`);
    console.log(`canvasDigest recorded in ${where}`);
} else if (pointer.canvasDigest === digest) {
    console.log(
        `Same as ${where}: the canvas was not edited since the repo last saw it`,
    );
} else {
    console.log(
        pointer.canvasDigest
            ? `Differs from ${where}: the canvas was edited since the repo last saw it`
            : `${where} has no canvasDigest: whether the canvas was edited is unknown`,
    );
    process.exit(2);
}

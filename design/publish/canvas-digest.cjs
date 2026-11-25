'use strict';
// Fingerprints a canvas's own files (digestFolder in paths.cjs).
//
// With a canvas name it answers "was the canvas edited since the repo last saw it?": the fingerprint is compared
// with `canvasDigest` in the canvas's record. Exit code 0 if they are the same, 2 if they differ or the record has
// none. With --record the fingerprint is written to the record instead.
//
// The reference canvas ("prototypes") keeps its fingerprint on the canvas, not in the repo: the comparison is with
// published.json in the project folder (read it from the canvas with the other files), and there is no --record.
//
//   node design/publish/canvas-digest.cjs <project folder> [canvas name] [--record]
const fs = require('node:fs');
const path = require('node:path');
const { REPO, STAMP, die, digestFolder, pointerFile } = require('./paths.cjs');

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

const digest = digestFolder(folder);

if (!name) {
    console.log(digest);
    process.exit(0);
}
if (name === 'prototypes') {
    if (record) {
        die(
            'The reference canvas carries its own published.json (prepare-publish.cjs writes it): nothing to record',
        );
    }
    const stamp = path.join(folder, STAMP);
    const published = fs.existsSync(stamp)
        ? JSON.parse(fs.readFileSync(stamp, 'utf8'))
        : undefined;
    if (published?.digest === digest) {
        console.log(
            `Same as published from ${published.commit}: the canvas was not edited since`,
        );
        process.exit(0);
    }
    console.log(
        published
            ? `Differs from what was published from ${published.commit}: the canvas was edited since`
            : `No ${STAMP} in ${folder}: read it from the canvas too. If the canvas has none, whether it was edited is unknown`,
    );
    process.exit(2);
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

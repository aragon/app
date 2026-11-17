'use strict';
// Prepares a refresh (RUNBOOK.md): writes the files to publish to <folder>/project/ and swaps every image path for
// the canvas's own copy of that image.
//
// A canvas loads images only from its asset store (an upload answers with a /_blob/<id> url); a path such as
// assets/mock/avatar/meridian.svg works in the repo's own renderer but shows nothing on the canvas. The repo keeps
// paths. The canvas pointer file records, per image, the url of its upload and the sha256 of the file uploaded
// (`assets`); this script replaces each path with that url in the copies it writes, so the canvas gets urls and the
// repo keeps paths. Sync does the reverse (RUNBOOK.md, Sync).
//
// An image that has no upload yet, or whose file changed since, is listed and copied ready to upload to
// <folder>/uploads/ (an SVG's <style> rules become attributes: the canvas strips <style> from uploads). Upload those,
// record the urls with record-assets.cjs, and run this again. Exit code 2 while any image needs an upload.
//
//   node design/baseline-check/prepare-publish.cjs <folder>
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { CANVAS, REPO, SCREENS, die } = require('./lib.cjs');
const { canvasPointer } = require('./render-canvas.cjs');

const out = process.argv[2];
if (!out || process.argv.length > 3) {
    die('Usage: node design/baseline-check/prepare-publish.cjs <folder>');
}
const pointerFile = canvasPointer();
const pointer = JSON.parse(fs.readFileSync(pointerFile, 'utf8'));
const uploaded = pointer.assets ?? {};

// Every file of the canvas, by its path on the canvas (under project/): the canvas folder and the app-owned images.
const files = {};
const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            walk(full);
        } else {
            files[path.relative(CANVAS, full)] = full;
        }
    }
};
walk(CANVAS);
for (const [canvasPath, repoPath] of Object.entries(SCREENS.appAssets ?? {})) {
    files[canvasPath] = path.join(REPO, repoPath);
}

const isImage = (file) => /\.(svg|png|jpe?g|gif|webp)$/i.test(file);
const sha256 = (file) =>
    crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

// The canvas strips <style> from an uploaded SVG: turn simple class rules (".st0{fill:#213147;}") into attributes.
const inlineSvgStyles = (svg) => {
    const rules = {};
    const withoutStyle = svg.replace(
        /<style[^>]*>([\s\S]*?)<\/style>/g,
        (_, css) => {
            for (const [, name, body] of css.matchAll(
                /\.([\w-]+)\s*\{([^}]*)\}/g,
            )) {
                rules[name] = body
                    .split(';')
                    .map((decl) => decl.split(':').map((part) => part.trim()))
                    .filter(([property, value]) => property && value);
            }
            return '';
        },
    );
    return withoutStyle.replace(/class="([\w\s-]+)"/g, (match, names) => {
        const decls = names.split(/\s+/).flatMap((name) => rules[name] ?? []);
        return decls.length > 0
            ? decls
                  .map(([property, value]) => `${property}="${value}"`)
                  .join(' ')
            : match;
    });
};

const pending = [];
const urls = {};
for (const [canvasPath, source] of Object.entries(files)) {
    if (!isImage(canvasPath)) {
        continue;
    }
    const record = uploaded[canvasPath];
    if (record && record.sha256 === sha256(source)) {
        urls[canvasPath] = record.url;
        continue;
    }
    pending.push(canvasPath);
    const target = path.join(out, 'uploads', canvasPath);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    if (canvasPath.endsWith('.svg')) {
        fs.writeFileSync(
            target,
            inlineSvgStyles(fs.readFileSync(source, 'utf8')),
        );
    } else {
        fs.copyFileSync(source, target);
    }
}

// Longest paths first, so no path is replaced inside a longer one.
const byLength = Object.keys(urls).sort((a, b) => b.length - a.length);
let written = 0;
for (const [canvasPath, source] of Object.entries(files)) {
    if (isImage(canvasPath)) {
        continue;
    }
    let text = fs.readFileSync(source, 'utf8');
    for (const imagePath of byLength) {
        text = text.split(imagePath).join(urls[imagePath]);
    }
    const target = path.join(out, 'project', canvasPath);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, text);
    written++;
}

console.log(
    `${written} files in ${path.join(out, 'project')}/, images swapped for their uploads (${path.relative(REPO, pointerFile)} → assets)`,
);
if (pending.length > 0) {
    console.log(
        `${pending.length} image(s) need an upload first, ready in ${path.join(out, 'uploads')}/:\n  ${pending.join('\n  ')}\nUpload them to the canvas (Artifact tool: publish with url and asset: true), record the urls with record-assets.cjs, then run this again.`,
    );
    process.exit(2);
}

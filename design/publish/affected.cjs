'use strict';
// Lists the prototype parts a range of app commits touched, so a catch-up reads only those. design/sources.json maps
// each part (a .dc.html file in design/canvas) to the app code it shows. A part is affected when, between base and head:
//   files    changed app files match the part's sources;
//   kit      changed kit files belong to a kit component the part mounts (read from the part file itself);
//   strings  en.json values whose old text appears in the part changed or were removed.
// partChanged marks parts whose own file was edited in the range too: the design probably came with the code. A
// part file added in the range says nothing about that and is not marked.
// Tests, stories, mocks and docs are ignored. unmapped lists changed UI files (.tsx, .css) that no part claims.
//
//   node design/publish/affected.cjs [--base <commit>] [--head <commit>] [--json] [--check] [--record [commit]]
//
// --base defaults to appCommit in design/canvases/prototypes.json, --head to HEAD. --check validates the map: a
// part per .dc.html file, a file per part, and every source glob matching a tracked file (exit 1 otherwise).
// --record sets appCommit to a commit's full sha (default HEAD) and changes nothing else in the file.
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { CANVAS, REPO, die } = require('./paths.cjs');

const MAP_FILE = path.join(REPO, 'design', 'sources.json');
const POINTER_FILE = path.join(REPO, 'design', 'canvases', 'prototypes.json');
const APP_SRC = 'apps/app/src/';
const KIT_SRC = 'packages/gov-ui-kit/src/';
const LOCALE = `${APP_SRC}assets/locales/en.json`;
const MIN_STRING = 8; // shorter strings match too much text to say anything

// A glob as a regular expression: ** crosses directories, * stays inside one name.
const globToRegExp = (glob) => {
    let source = '';
    for (let i = 0; i < glob.length; i++) {
        const char = glob[i];
        if (char === '*' && glob[i + 1] === '*') {
            i++;
            if (glob[i + 1] === '/') {
                i++;
                source += '(?:.*/)?';
            } else {
                source += '.*';
            }
        } else if (char === '*') {
            source += '[^/]*';
        } else {
            source += char.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
        }
    }
    return new RegExp(`^${source}$`);
};
const matchesGlob = (file, glob) => globToRegExp(glob).test(file);

const IGNORED =
    /\.(test|spec|stories)\.[a-z]+$|\.mdx?$|(^|\/)(__mocks__|__tests__|mocks|test|testUtils|docs)\/|(^|\/)[a-zA-Z]*(Mocks|TestUtils)\.[a-z]+$/;
const isIgnored = (file) => IGNORED.test(file);
const isUi = (file) => /\.(tsx|css)$/.test(file);

// App files, minus the locale, matching any of a part's sources.
const matchingFiles = (files, sources) => {
    const patterns = sources.map(globToRegExp);
    return files.filter(
        (file) => file !== LOCALE && patterns.some((re) => re.test(file)),
    );
};

// Kit component names a part file mounts: GovUiKit.ProposalVoting.Stage gives ProposalVoting.
const kitComponents = (partText) => {
    const names = new Set();
    const re = /component-from-global-scope="GovUiKit\.([A-Za-z0-9]+)/g;
    for (const match of partText.matchAll(re)) {
        names.add(match[1]);
    }
    return [...names];
};

// A kit file belongs to a component when a directory or file name in its path starts with the component's name
// (case-insensitive): proposalVoting/... and proposalVotingStage/... both belong to ProposalVoting.
const kitFileBelongsTo = (file, name) =>
    file
        .slice(KIT_SRC.length)
        .split('/')
        .some((segment) =>
            segment.toLowerCase().startsWith(name.toLowerCase()),
        );

const kitFilesFor = (kitFiles, partText) => {
    const names = kitComponents(partText);
    return kitFiles.filter((file) =>
        names.some((name) => kitFileBelongsTo(file, name)),
    );
};

const flatten = (value, prefix = '', out = {}) => {
    for (const [key, child] of Object.entries(value ?? {})) {
        const id = prefix ? `${prefix}.${key}` : key;
        if (child !== null && typeof child === 'object') {
            flatten(child, id, out);
        } else {
            out[id] = String(child);
        }
    }
    return out;
};

// Text left once {{interpolations}} are removed.
const literalLength = (text) =>
    text.replace(/\{\{[^}]*\}\}/g, '').trim().length;

// Strings whose value changed or was removed, as { key, old }. Short and mostly-interpolated ones are skipped.
const changedStrings = (before, after) => {
    const oldFlat = flatten(before);
    const newFlat = flatten(after);
    return Object.entries(oldFlat)
        .filter(([key, text]) => newFlat[key] !== text)
        .filter(
            ([, text]) =>
                text.length >= MIN_STRING &&
                literalLength(text) * 2 >= text.length,
        )
        .map(([key, old]) => ({ key, old }));
};

const stringsInPart = (changed, partText) =>
    changed.filter(({ old }) => partText.includes(old)).map(({ key }) => key);

// Splits changed files into parts and the rest. `map` is the sources.json content; `readPart` gives a part's text,
// or null for an entry whose file is gone (a stale map is --check's business, not a reason to stop).
const affectedParts = ({
    map,
    appFiles,
    kitFiles,
    strings,
    partFiles,
    readPart,
}) => {
    const claimed = new Set();
    const parts = [];
    for (const [part, { sources }] of Object.entries(map.parts)) {
        const text = readPart(part);
        if (text === null) {
            continue;
        }
        const files = matchingFiles(appFiles, sources);
        const kit = kitFilesFor(kitFiles, text);
        const hits = stringsInPart(strings, text);
        for (const file of [...files, ...kit]) {
            claimed.add(file);
        }
        if (files.length > 0 || kit.length > 0 || hits.length > 0) {
            parts.push({
                part,
                files,
                kit,
                strings: hits,
                partChanged: partFiles.includes(part),
            });
        }
    }
    const unmapped = [...appFiles, ...kitFiles].filter(
        (file) => isUi(file) && !claimed.has(file),
    );
    return {
        parts: parts.sort((a, b) => a.part.localeCompare(b.part)),
        unmapped,
    };
};

// --record takes an optional commit: the next argument unless it is another flag.
const parseArgs = (argv) => {
    const args = { json: false, check: false, record: null };
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === '--json' || arg === '--check') {
            args[arg.slice(2)] = true;
        } else if (arg === '--base' || arg === '--head') {
            if (argv[i + 1] === undefined || argv[i + 1].startsWith('--')) {
                throw new Error(`${arg} needs a commit`);
            }
            args[arg.slice(2)] = argv[++i];
        } else if (arg === '--record') {
            const next = argv[i + 1];
            args.record =
                next !== undefined && !next.startsWith('--')
                    ? argv[++i]
                    : 'HEAD';
        } else {
            throw new Error(`unknown argument ${arg}`);
        }
    }
    return args;
};

// Replaces the appCommit value in the pointer's text, leaving the rest as it is.
const recordCommit = (text, sha) => {
    const re = /("appCommit":\s*")[0-9a-f]*(")/;
    if (!re.test(text)) {
        throw new Error('no appCommit in the pointer file');
    }
    return text.replace(re, `$1${sha}$2`);
};

const checkMap = ({ map, partNames, trackedFiles }) => {
    const problems = [];
    const entries = Object.keys(map.parts);
    for (const name of partNames.filter((n) => !entries.includes(n))) {
        problems.push(`no entry for ${name}.dc.html`);
    }
    for (const name of entries.filter((n) => !partNames.includes(n))) {
        problems.push(`entry ${name} has no ${name}.dc.html`);
    }
    for (const [name, { sources }] of Object.entries(map.parts)) {
        for (const glob of sources ?? []) {
            const re = globToRegExp(glob);
            if (!trackedFiles.some((file) => re.test(file))) {
                problems.push(`${name}: "${glob}" matches no tracked file`);
            }
        }
    }
    return problems;
};

const git = (...args) =>
    execFileSync('git', args, {
        cwd: REPO,
        encoding: 'utf8',
        maxBuffer: 256 * 1024 * 1024,
    });
const resolve = (rev) => git('rev-parse', '--verify', `${rev}^{commit}`).trim();
const changedBetween = (base, head, paths, filter = []) =>
    git(
        'diff',
        '--name-only',
        '--no-renames',
        ...filter,
        base,
        head,
        '--',
        ...paths,
    )
        .split('\n')
        .filter(Boolean);
const jsonAt = (rev) => {
    try {
        return JSON.parse(git('show', `${rev}:${LOCALE}`));
    } catch {
        return {};
    }
};
const partNamesOnDisk = () =>
    fs
        .readdirSync(CANVAS)
        .filter((file) => file.endsWith('.dc.html'))
        .map((file) => file.slice(0, -'.dc.html'.length));

// Changed things of one kind (files, kit, strings), grouped by the set of parts that show them, so the reader
// opens each diff once and sees every part it reaches.
const groupByParts = (parts, field) => {
    const partsOf = new Map();
    for (const entry of parts) {
        for (const item of entry[field]) {
            partsOf.set(item, [...(partsOf.get(item) ?? []), entry.part]);
        }
    }
    const groups = new Map();
    for (const [item, names] of partsOf) {
        const key = names.join(', ');
        groups.set(key, [...(groups.get(key) ?? []), item]);
    }
    return [...groups].map(([names, items]) => ({ names, items }));
};

const section = (title, groups) =>
    groups.length === 0
        ? []
        : [
              `## ${title}`,
              ...groups.flatMap(({ names, items }) => [
                  `- ${names}`,
                  ...items.map((item) => `  - ${item}`),
              ]),
              '',
          ];

const report = ({ base, head, parts, unmapped }) => {
    const alsoChanged = parts
        .filter(({ partChanged }) => partChanged)
        .map(({ part }) => part);
    return [
        `# Prototype parts affected, ${base.slice(0, 9)}..${head.slice(0, 9)}`,
        '',
        parts.length === 0
            ? 'No part is affected.'
            : `${parts.length} parts. Each entry names the parts, then what changed for them.`,
        '',
        ...section('App files', groupByParts(parts, 'files')),
        ...section('Kit files', groupByParts(parts, 'kit')),
        ...section('Strings', groupByParts(parts, 'strings')),
        ...(alsoChanged.length > 0
            ? [
                  '## Parts that changed in the range too',
                  alsoChanged.join(', '),
                  '',
              ]
            : []),
        ...(unmapped.length > 0
            ? [
                  '## Unmapped UI files',
                  ...unmapped.map((file) => `- ${file}`),
                  '',
              ]
            : []),
    ].join('\n');
};

const main = () => {
    let args;
    try {
        args = parseArgs(process.argv.slice(2));
    } catch (error) {
        die(error.message);
    }
    const map = JSON.parse(fs.readFileSync(MAP_FILE, 'utf8'));

    if (args.check) {
        const trackedFiles = git('ls-files').split('\n').filter(Boolean);
        const problems = checkMap({
            map,
            partNames: partNamesOnDisk(),
            trackedFiles,
        });
        if (problems.length > 0) {
            die(
                `sources.json has problems:\n${problems.map((p) => `- ${p}`).join('\n')}`,
            );
        }
        console.log(`sources.json ok: ${Object.keys(map.parts).length} parts`);
        return;
    }
    if (args.record !== null) {
        const sha = resolve(args.record);
        const text = fs.readFileSync(POINTER_FILE, 'utf8');
        fs.writeFileSync(POINTER_FILE, recordCommit(text, sha));
        console.log(`appCommit set to ${sha}`);
        return;
    }

    const pointer = JSON.parse(fs.readFileSync(POINTER_FILE, 'utf8'));
    const base = resolve(args.base ?? pointer.appCommit);
    const head = resolve(args.head ?? 'HEAD');
    const changed = changedBetween(base, head, [APP_SRC, KIT_SRC]).filter(
        (file) => file === LOCALE || !isIgnored(file),
    );
    const partFiles = changedBetween(
        base,
        head,
        ['design/canvas'],
        ['--diff-filter=M'],
    )
        .filter((file) => file.endsWith('.dc.html'))
        .map((file) => path.basename(file, '.dc.html'));
    const strings = changed.includes(LOCALE)
        ? changedStrings(jsonAt(base), jsonAt(head))
        : [];
    const result = affectedParts({
        map,
        appFiles: changed.filter((file) => file.startsWith(APP_SRC)),
        kitFiles: changed.filter((file) => file.startsWith(KIT_SRC)),
        strings,
        partFiles,
        readPart: (part) => {
            const file = path.join(CANVAS, `${part}.dc.html`);
            return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
        },
    });
    const output = { base, head, ...result };
    console.log(args.json ? JSON.stringify(output, null, 2) : report(output));
};

if (require.main === module) {
    main();
}

module.exports = {
    affectedParts,
    changedStrings,
    checkMap,
    globToRegExp,
    groupByParts,
    isIgnored,
    kitComponents,
    kitFileBelongsTo,
    kitFilesFor,
    matchesGlob,
    matchingFiles,
    parseArgs,
    recordCommit,
    stringsInPart,
};

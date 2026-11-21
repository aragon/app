// Shared by the primitive-colour lint of the kit (scripts/primitive-colors.mjs) and of the app
// (apps/app/scripts/semanticColors/primitive-colors.mjs): the class pattern derived from the kit's primitive theme, the
// warn/error scope check of a biome.jsonc, and the per-folder findings report.

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const unique = (values) => [...new Set(values)].sort();

export const derivePattern = (kitRoot) => {
    const theme = (file) => readFileSync(resolve(kitRoot, 'src/theme/tokens', file), 'utf8');
    const colors = theme('primitives/colors.css');
    const steps = new Map();
    for (const [, palette, step] of colors.matchAll(/--color-([a-z]+)-(\d+)\s*:/g)) {
        steps.set(palette, [...(steps.get(palette) ?? []), step]);
    }
    const palettes = [...steps.keys()].sort();
    const allSteps = unique([...steps.values()].flat()).sort((a, b) => Number(a) - Number(b));
    if (palettes.length === 0) {
        throw new Error('no --color-<palette>-<step> found in primitives/colors.css');
    }

    const semanticUtilities = new Set(
        [...theme('semantic/colors.css').matchAll(/@utility\s+([\w-]+)/g)].map(([, name]) => name),
    );
    const primitiveOnly = (names) => unique(names).filter((name) => !semanticUtilities.has(name));

    const shadows = primitiveOnly(
        [...theme('primitives/shadows.css').matchAll(/--shadow-([\w-]+)\s*:/g)]
            .map(([, name]) => name)
            .filter((name) => palettes.some((palette) => name === palette || name.startsWith(`${palette}-`)))
            .map((name) => `shadow-${name}`),
    );
    const focusRing = theme('primitives/focusRing.css');
    const rings = primitiveOnly(
        [...focusRing.matchAll(/--ring-color-([a-z]+)\s*:/g)].map(([, name]) => `ring-${name}`),
    );
    const paletteUtilities = primitiveOnly(
        [...`${colors}\n${focusRing}`.matchAll(/@utility\s+([\w-]+)/g)]
            .map(([, name]) => name)
            .filter((name) => palettes.some((palette) => name.includes(`-${palette}`))),
    );

    const palette = `(?:${palettes.join('|')})`;
    const step = `(?:${allSteps.join('|')})`;
    // Any utility (bg, text, border-x, ring-offset, from, ...) with any variant prefix (`hover:`, `md:`,
    // `[&>svg]:`, `!`) and an optional `/opacity`; the CSS variable form covers `bg-(--color-…)` and `var(--color-…)`.
    const alternatives = [
        `[a-z]+(?:-[a-z]+)*-${palette}-${step}(?:/[\\w.%\\[\\]]+)?`,
        `--color-${palette}-${step}`,
        ...[...shadows, ...rings, ...paletteUtilities].map(escapeRegExp),
    ];
    // A class is delimited by anything that cannot continue a class name, so `shadow-neutral` does not match inside
    // `shadow-neutral-md` and `bg-success-default` (semantic) is never mistaken for a palette step.
    const core = `(?:^|[^\\w-])(?:${alternatives.join('|')})(?=[^\\w-]|$)`;
    return { core, palettes, allSteps, shadows, rings, paletteUtilities };
};

// The warn and error plugins must never both run on a file: every `includes` entry of an error plugin has to be
// negated in the warn plugin of the same language.
export const checkScopes = (configDir) => {
    const config = readFileSync(resolve(configDir, 'biome.jsonc'), 'utf8')
        .replace(/("(?:[^"\\]|\\.)*")|\/\/[^\n]*|\/\*[\s\S]*?\*\//g, (_match, string) => string ?? '')
        .replace(/,(\s*[}\]])/g, '$1');
    const plugins = JSON.parse(config).plugins ?? [];
    const problems = [];
    for (const language of ['js', 'css']) {
        const find = (severity) =>
            plugins.find((plugin) => plugin.path?.endsWith(`primitive-colors.${language}.${severity}.grit`));
        const warn = find('warn');
        const error = find('error');
        if (warn == null || error == null) {
            problems.push(`biome.jsonc must register both primitive-colors.${language}.{warn,error}.grit`);
            continue;
        }
        for (const glob of (error.includes ?? []).filter((entry) => !entry.startsWith('!'))) {
            if (!(warn.includes ?? []).includes(`!${glob}`)) {
                problems.push(
                    `"${glob}" is in the ${language} error plugin but not excluded ("!${glob}") from the warn one`,
                );
            }
        }
    }
    return problems;
};

// Folder that owns a finding in the kit: src/<core|modules>/components/<folder>, else the first two path segments.
export const kitOwner = (path) => {
    const parts = path.split('/');
    const components = parts.indexOf('components');
    return components > 0 && parts.length > components + 2 ? parts.slice(0, components + 2).join('/') : dirname(path);
};

// Runs Biome's linter in `root` (the folder of a biome.jsonc) and prints the primitive-colour findings per owner folder.
export const report = ({ root, kitRoot, targets, owner }) => {
    const biome = resolve(root, 'node_modules/.bin/biome');
    let output;
    try {
        output = execFileSync(biome, ['lint', '--reporter=json', '--max-diagnostics=none', ...targets], {
            cwd: root,
            encoding: 'utf8',
            maxBuffer: 256 * 1024 * 1024,
            stdio: ['ignore', 'pipe', 'ignore'],
        });
    } catch (error) {
        // Exits non-zero once a folder is on `error`; the JSON is still complete.
        output = error.stdout;
    }
    const { diagnostics } = JSON.parse(output);
    const { core } = derivePattern(kitRoot);
    const classPattern = new RegExp(core, 'g');
    const sources = new Map();
    const rows = new Map();
    for (const { category, message: text, location, severity } of diagnostics) {
        if (category !== 'plugin' || !text.startsWith('Primitive palette colour class')) {
            continue;
        }
        const { path } = location;
        if (!sources.has(path)) {
            sources.set(path, readFileSync(resolve(root, path), 'utf8').split('\n'));
        }
        const lines = sources.get(path);
        const { start, end } = location;
        const span =
            start.line === end.line
                ? lines[start.line - 1].slice(start.column - 1, end.column - 1)
                : [
                      lines[start.line - 1].slice(start.column - 1),
                      ...lines.slice(start.line, end.line - 1),
                      lines[end.line - 1].slice(0, end.column - 1),
                  ].join('\n');
        const row = rows.get(owner(path)) ?? { findings: 0, classes: 0, files: new Set(), severity };
        row.findings += 1;
        row.classes += [...span.matchAll(classPattern)].length;
        row.files.add(path);
        rows.set(owner(path), row);
    }
    const sorted = [...rows.entries()].sort(([a], [b]) => a.localeCompare(b));
    const width = Math.max(6, ...sorted.map(([folder]) => folder.length));
    const total = { findings: 0, classes: 0, files: 0 };
    console.log(`${'folder'.padEnd(width)}  findings  classes  files  severity`);
    for (const [folder, row] of sorted) {
        console.log(
            `${folder.padEnd(width)}  ${String(row.findings).padStart(8)}  ${String(row.classes).padStart(7)}  ${String(row.files.size).padStart(5)}  ${row.severity}`,
        );
        total.findings += row.findings;
        total.classes += row.classes;
        total.files += row.files.size;
    }
    console.log(
        `${'total'.padEnd(width)}  ${String(total.findings).padStart(8)}  ${String(total.classes).padStart(7)}  ${String(total.files).padStart(5)}`,
    );
    console.log(
        '\nfindings = flagged string literals / CSS nodes (what Biome reports); classes = primitive classes inside them.',
    );
};

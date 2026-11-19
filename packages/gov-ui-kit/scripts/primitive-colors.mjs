#!/usr/bin/env node
// Lint support for the migration from primitive palette classes (`bg-primary-400`, `text-neutral-500`,
// `shadow-neutral-md`, `focus-ring-primary`, `var(--color-critical-200)`) to the semantic colour layer
// (`src/theme/tokens/semantic`). The checks themselves are Biome GritQL plugins, wired in `biome.jsonc`; this script
// owns their pattern, so the four plugin files (JS/CSS × warn/error) cannot drift apart.
//
//   node scripts/primitive-colors.mjs generate   rewrite biome-plugins/primitive-colors.*.grit from src/theme
//   node scripts/primitive-colors.mjs check      fail if the plugin files are stale or biome.jsonc scopes overlap
//   node scripts/primitive-colors.mjs report     count findings per component folder (the migration to-do list)
//
// The pattern is derived from the primitive theme files, so it follows them: palette names and steps from
// primitives/colors.css, shadow names from primitives/shadows.css, ring colours from primitives/focusRing.css, and the
// palette-named `@utility` blocks (focus-ring-*, gradient-*). Names the semantic layer redefines as its own `@utility`
// (e.g. `shadow-success-sm`) are semantic and never flagged.

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const kitRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const theme = (file) => readFileSync(resolve(kitRoot, 'src/theme/tokens', file), 'utf8');
const pluginFile = (language, severity) =>
    resolve(kitRoot, `biome-plugins/primitive-colors.${language}.${severity}.grit`);
const severities = { warn: 'warn', error: 'error' };

const fail = (message) => {
    console.error(`primitive-colors: ${message}`);
    process.exit(1);
};

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const unique = (values) => [...new Set(values)].sort();

const derivePattern = () => {
    const colors = theme('primitives/colors.css');
    const steps = new Map();
    for (const [, palette, step] of colors.matchAll(/--color-([a-z]+)-(\d+)\s*:/g)) {
        steps.set(palette, [...(steps.get(palette) ?? []), step]);
    }
    const palettes = [...steps.keys()].sort();
    const allSteps = unique([...steps.values()].flat()).sort((a, b) => Number(a) - Number(b));
    if (palettes.length === 0) {
        fail('no --color-<palette>-<step> found in primitives/colors.css');
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

const message =
    'Primitive palette colour class: use a semantic colour class from src/theme/tokens/semantic instead ' +
    '(e.g. bg-accent-default, text-surface-secondary, border-critical-primary, shadow-surface-sm, ring-accent-focus).';

const render = (language, severity, { core }) => {
    // Grit regexes are Rust regexes matched against the whole node text; lookahead is not supported there, so the
    // trailing delimiter is consumed instead.
    const gritCore = core.replace('(?=[^\\w-]|$)', '(?:[^\\w-]|$)');
    const regex = `(?s).*${gritCore}.*`;
    // Laid out the way Biome's GritQL formatter prints it, so `biome check` leaves the generated files alone.
    const nodes =
        language === 'js'
            ? ['JsStringLiteralExpression()', 'JsTemplateChunkElement()', 'JsxString()', 'JsLiteralMemberName()']
            : ['TwApplyAtRule()', 'CssDashedIdentifier()'];
    return [
        '// Generated by scripts/primitive-colors.mjs from src/theme/tokens/primitives — do not edit by hand.',
        `// Flags primitive palette colour classes (${language === 'js' ? 'string literals, JSX strings, template chunks and object keys' : '@apply lines and --color-* variables'}).`,
        `language ${language}`,
        '',
        'or {',
        nodes.map((node) => `    ${node}`).join(',\n'),
        '} as $node where {',
        `    $node <: r"${regex}",`,
        `    register_diagnostic(span=$node, message="${message}", severity="${severities[severity]}")`,
        '}',
        '',
    ].join('\n');
};

const generated = () => {
    const pattern = derivePattern();
    return ['js', 'css'].flatMap((language) =>
        Object.keys(severities).map((severity) => ({
            file: pluginFile(language, severity),
            content: render(language, severity, pattern),
        })),
    );
};

// The warn and error plugins must never both run on a file: every `includes` entry of an error plugin has to be
// negated in the warn plugin of the same language.
const checkScopes = () => {
    const config = readFileSync(resolve(kitRoot, 'biome.jsonc'), 'utf8')
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

const check = () => {
    const stale = generated().filter(({ file, content }) => {
        try {
            return readFileSync(file, 'utf8') !== content;
        } catch {
            return true;
        }
    });
    const problems = [
        ...stale.map(({ file }) => `${relative(kitRoot, file)} is stale: run \`pnpm lint:colors:generate\``),
        ...checkScopes(),
    ];
    if (problems.length > 0) {
        fail(`\n  ${problems.join('\n  ')}`);
    }
    console.log('primitive-colors: plugins up to date, warn/error scopes disjoint');
};

// Folder that owns a finding: src/<core|modules>/components/<folder>, else the first two path segments.
const owner = (path) => {
    const parts = path.split('/');
    const components = parts.indexOf('components');
    return components > 0 && parts.length > components + 2 ? parts.slice(0, components + 2).join('/') : dirname(path);
};

const report = (targets) => {
    const biome = resolve(kitRoot, 'node_modules/.bin/biome');
    let output;
    try {
        output = execFileSync(biome, ['lint', '--reporter=json', '--max-diagnostics=none', ...targets], {
            cwd: kitRoot,
            encoding: 'utf8',
            maxBuffer: 256 * 1024 * 1024,
            stdio: ['ignore', 'pipe', 'ignore'],
        });
    } catch (error) {
        // Exits non-zero once a folder is on `error`; the JSON is still complete.
        output = error.stdout;
    }
    const { diagnostics } = JSON.parse(output);
    const { core } = derivePattern();
    const classPattern = new RegExp(core, 'g');
    const sources = new Map();
    const rows = new Map();
    for (const { category, message: text, location, severity } of diagnostics) {
        if (category !== 'plugin' || !text.startsWith('Primitive palette colour class')) {
            continue;
        }
        const { path } = location;
        if (!sources.has(path)) {
            sources.set(path, readFileSync(resolve(kitRoot, path), 'utf8').split('\n'));
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

const [command = 'check', ...targets] = process.argv.slice(2);
switch (command) {
    case 'generate':
        for (const { file, content } of generated()) {
            writeFileSync(file, content);
            console.log(`primitive-colors: wrote ${relative(kitRoot, file)}`);
        }
        break;
    case 'check':
        check();
        break;
    case 'report':
        report(targets.length > 0 ? targets : ['src']);
        break;
    default:
        fail(`unknown command "${command}" (generate | check | report)`);
}

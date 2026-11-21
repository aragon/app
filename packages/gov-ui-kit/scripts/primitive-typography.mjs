#!/usr/bin/env node
// Lint support for the semantic typography layer (src/theme/tokens/typography.css): text elements take a `type-*`
// role (or a documented exception of one) instead of primitive type classes. The checks themselves are Biome GritQL
// plugins, wired in the kit's and the app's `biome.jsonc`; this script owns their pattern, so the four plugin files
// (JS/CSS x warn/error) cannot drift apart.
//
//   node scripts/primitive-typography.mjs generate           rewrite biome-plugins/primitive-typography.*.grit
//   node scripts/primitive-typography.mjs check              fail if a plugin file is stale, a warn/error scope overlaps,
//                                                            or an allowlisted file holds more than its allowed classes
//   node scripts/primitive-typography.mjs report [<root>]    findings per folder (root: the kit, or e.g. ../../apps/app)
//
// Flagged, with any variant prefix and the important modifier: font sizes (`text-sm`, `md:text-lg`, `text-[13px]`,
// `text-[clamp(...)]`), line heights (`leading-*`), weights (`font-normal` ... `font-black`, `font-medium` included) and
// letter spacing (`tracking-*`). Use the role utilities and the modifiers `type-strong`, `type-mono`, `type-numeric`.
//
// Allowlist: sizes a component owns because they follow its shape, not the text's job (avatar initials follow the
// avatar size, the permission graph's node labels follow the node), and the few sizes outside the role system on
// purpose. Each allowlisted file is excluded from both plugins in biome.jsonc and listed below with the exact classes
// it may hold; `check` fails when such a file holds any other primitive type class.

import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const kitRoot = resolve(fileURLToPath(import.meta.url), '../..');
const repoRoot = resolve(kitRoot, '../..');

// One primitive type class: optional variants (`md:`, `placeholder:`, `[&>a]:`), optional leading or trailing `!`.
const VARIANTS = String.raw`(?:[\w\-\[\]&>:.*/()=,#%@'\x22]*:)?`;
const CLASS =
    String.raw`!?(?:text-(?:xs|sm|base|lg|xl|[2-9]xl)(?:/[\w.\[\]-]+)?|text-\[(?:\d|\.\d|clamp|calc|length:)[^\]\s]*\]|` +
    String.raw`leading-[\w.\[\]-]+|font-(?:thin|extralight|light|normal|medium|semibold|bold|extrabold|black)|tracking-[\w.\[\]-]+)!?`;
// Grit regexes are Rust regexes matched against the whole node text (no lookaround), so the delimiters are consumed.
const CORE = String.raw`(?:^|[\s'\x22\x60{])${VARIANTS}${CLASS}(?:[\s'\x22\x60}]|$)`;
const tokenRegex = new RegExp(String.raw`(?:^|(?<=[\s'\x22\x60{]))${VARIANTS}${CLASS}(?=[\s'\x22\x60}]|$)`, 'g');

export const allowlist = {
    'packages/gov-ui-kit/src/core/components/avatars/avatar/avatar.tsx': {
        reason: 'avatar initials: the size follows the avatar size (8 px at the 16 px avatar), not a type role',
        classes: /^(?:(?:sm|md|lg|xl|2xl):)?text-(?:\[8px\]|xs|sm|base|lg|xl)$|^leading-none$/,
    },
    'packages/gov-ui-kit/src/core/components/avatars/avatarStack/avatarStack.tsx': {
        reason: 'the avatar stack counter is an avatar glyph (weight of the "+n" initials)',
        classes: /^font-semibold$/,
    },
    'packages/gov-ui-kit/src/modules/components/dao/daoAvatar/daoAvatar.tsx': {
        reason: 'DAO avatar initials: the size follows the avatar size',
        classes: /^(?:(?:sm|md|lg|xl|2xl):)?text-(?:xs|sm|base|lg|xl|2xl)$|^leading-tight$/,
    },
    'apps/app/src/modules/settings/components/permissionsGraph/permissionStackNode.tsx': {
        reason: 'permission graph node labels: 10 px follows the node size',
        classes: /^text-\[10px\]$/,
    },
    'apps/app/src/modules/settings/components/permissionInfoTooltip/permissionInfoTooltip.tsx': {
        reason: 'icon box of an info tooltip trigger, no text',
        classes: /^leading-none$/,
    },
    'apps/app/src/modules/application/pages/landingPage/landingPage.tsx': {
        reason: 'the landing hero (type-display) keeps its fluid clamp() size, line height and tracking on top of the role',
        classes:
            /^(?:(?:md|xl):)?text-\[clamp\(1\.25rem,(?:7vw,1\.75rem|calc\(3\.7vw-7\.5px\),2\.5rem|calc\(3\.7vw-11px\),2\.5rem)\)\]$|^leading-\[1\.2\]$|^tracking-\[-0\.01em\]$/,
    },
};

const pluginFile = (language, severity) =>
    resolve(kitRoot, `biome-plugins/primitive-typography.${language}.${severity}.grit`);
const message =
    'Primitive type class: use a typography role from src/theme/tokens/typography.css instead (type-title-item, ' +
    'type-supporting, a documented type-<role>--<pattern> exception, or the modifiers type-strong / type-mono).';

const fail = (text) => {
    console.error(`primitive-typography: ${text}`);
    process.exit(1);
};

const render = (language, severity) => {
    const nodes =
        language === 'js'
            ? ['JsStringLiteralExpression()', 'JsTemplateChunkElement()', 'JsxString()', 'JsLiteralMemberName()']
            : ['TwApplyAtRule()'];
    return [
        '// Generated by scripts/primitive-typography.mjs — do not edit by hand.',
        `// Flags primitive type classes (${language === 'js' ? 'string literals, JSX strings, template chunks and object keys' : '@apply lines'}).`,
        `language ${language}`,
        '',
        ...(nodes.length === 1
            ? [`or { ${nodes[0]} } as $node where {`]
            : ['or {', nodes.map((node) => `    ${node}`).join(',\n'), '} as $node where {']),
        `    $node <: r"(?s).*${CORE}.*",`,
        `    register_diagnostic(span=$node, message="${message}", severity="${severity}")`,
        '}',
        '',
    ].join('\n');
};

const generated = () =>
    ['js', 'css'].flatMap((language) =>
        ['warn', 'error'].map((severity) => ({
            file: pluginFile(language, severity),
            content: render(language, severity),
        })),
    );

// Primitive type classes of a source file: every class-shaped token inside a string literal (CSS: @apply lines).
export const findingsOf = (text, isCss) => {
    const chunks = isCss
        ? [...text.matchAll(/@apply\s+([^;]+);/g)].map((m) => [m[1], m.index])
        : [...text.matchAll(/'([^'\n]*)'|"([^"\n]*)"|`([^`]*)`/g)].map((m) => [m[1] ?? m[2] ?? m[3] ?? '', m.index]);
    const found = [];
    for (const [chunk, index] of chunks) {
        for (const match of chunk.matchAll(tokenRegex)) {
            found.push({ token: match[0], line: text.slice(0, index).split('\n').length });
        }
    }
    return found;
};

const SKIP = /\.(test|spec|stories)\.tsx?$|\/__mocks__\/|\.d\.ts$/;
const walk = (dir, out = []) => {
    for (const name of readdirSync(dir)) {
        const path = join(dir, name);
        if (statSync(path).isDirectory()) {
            if (name !== 'node_modules' && name !== '.next') {
                walk(path, out);
            }
        } else if (/\.(tsx?|css)$/.test(name) && !SKIP.test(path)) {
            out.push(path);
        }
    }
    return out;
};

const checkAllowlist = () => {
    const problems = [];
    for (const [file, { classes }] of Object.entries(allowlist)) {
        const text = readFileSync(resolve(repoRoot, file), 'utf8');
        for (const { token, line } of findingsOf(text, file.endsWith('.css'))) {
            if (!classes.test(token.replaceAll('!', ''))) {
                problems.push(`${file}:${line} holds ${token}, which its allowlist entry does not allow`);
            }
        }
    }
    return problems;
};

// Warn and error scopes of each plugin pair must be disjoint, and allowlisted files excluded from both.
const checkScopes = () => {
    const problems = [];
    for (const config of ['packages/gov-ui-kit/biome.jsonc', 'apps/app/biome.jsonc']) {
        const text = readFileSync(resolve(repoRoot, config), 'utf8').replace(/^\s*\/\/.*$/gm, '');
        const plugins = JSON.parse(text).plugins ?? [];
        for (const language of ['js', 'css']) {
            const find = (severity) =>
                plugins.find((p) => p.path.endsWith(`primitive-typography.${language}.${severity}.grit`));
            const [warn, error] = [find('warn'), find('error')];
            if (warn == null || error == null) {
                problems.push(`${config}: the ${language} warn and error typography plugins must both be configured`);
                continue;
            }
            // Disjoint when every positive glob of one plugin is negated in the other (either direction).
            const positives = (plugin) => (plugin.includes ?? []).filter((glob) => !glob.startsWith('!'));
            const negatedIn = (globs, plugin) => globs.every((glob) => (plugin.includes ?? []).includes(`!${glob}`));
            if (!negatedIn(positives(warn), error) && !negatedIn(positives(error), warn)) {
                problems.push(
                    `${config}: the ${language} warn and error scopes overlap (negate one plugin's globs in the other)`,
                );
            }
            for (const file of Object.keys(allowlist).filter((f) => config.startsWith(f.split('/src/')[0]))) {
                const local = `!${relative(resolve(repoRoot, config, '..'), resolve(repoRoot, file))}`;
                for (const plugin of [warn, error]) {
                    if (!(plugin.includes ?? []).includes(local)) {
                        problems.push(`${config}: allowlisted ${local.slice(1)} must be excluded from ${plugin.path}`);
                    }
                }
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
        ...stale.map(({ file }) => `${relative(kitRoot, file)} is stale: run \`pnpm lint:typography:generate\``),
        ...checkScopes(),
        ...checkAllowlist(),
    ];
    if (problems.length > 0) {
        fail(`\n  ${problems.join('\n  ')}`);
    }
    console.log('primitive-typography: plugins up to date, warn/error scopes disjoint, allowlist respected');
};

const report = (rootArg) => {
    const root = resolve(kitRoot, rootArg ?? '.');
    const files = walk(resolve(root, 'src'));
    const byFolder = new Map();
    let total = 0;
    for (const file of files) {
        const rel = relative(repoRoot, file);
        if (Object.hasOwn(allowlist, rel)) {
            continue;
        }
        const found = findingsOf(readFileSync(file, 'utf8'), file.endsWith('.css'));
        if (found.length === 0) {
            continue;
        }
        total += found.length;
        const folder = relative(root, file).split('/').slice(0, 4).join('/');
        byFolder.set(folder, [
            ...(byFolder.get(folder) ?? []),
            ...found.map((f) => `${relative(root, file)}:${f.line} ${f.token}`),
        ]);
    }
    for (const [folder, items] of [...byFolder].sort()) {
        console.log(`${folder} (${items.length})`);
        for (const item of items) {
            console.log(`    ${item}`);
        }
    }
    console.log(
        `primitive-typography: ${total} findings in ${byFolder.size} folders of ${relative(repoRoot, root) || '.'}`,
    );
};

if (import.meta.main) {
    const [command = 'check', target] = process.argv.slice(2);
    switch (command) {
        case 'generate':
            for (const { file, content } of generated()) {
                writeFileSync(file, content);
                console.log(`primitive-typography: wrote ${relative(kitRoot, file)}`);
            }
            break;
        case 'check':
            check();
            break;
        case 'report':
            report(target);
            break;
        default:
            fail(`unknown command "${command}" (generate | check | report)`);
    }
}

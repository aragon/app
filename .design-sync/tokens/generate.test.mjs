import assert from 'node:assert/strict';
import {
    cpSync,
    mkdtempSync,
    readFileSync,
    rmSync,
    writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { generateCss } from './generate.mjs';

const require = createRequire(
    new URL('../../apps/app/package.json', import.meta.url),
);
const postcss = require('postcss');
const baseline = JSON.parse(
    readFileSync(new URL('./parity-baseline.json', import.meta.url), 'utf8'),
);

const appRoot = fileURLToPath(new URL('../../apps/app', import.meta.url));
const kitRoot = join(appRoot, 'node_modules/@aragon/gov-ui-kit');

function collectCustomProperties(css) {
    const declarations = new Map();
    postcss.parse(css).walkDecls((decl) => {
        if (decl.prop.startsWith('--')) {
            declarations.set(decl.prop, decl.value);
        }
    });
    return declarations;
}
function findDeclaration(css, property) {
    let declaration;
    postcss.parse(css).walkDecls(property, (candidate) => {
        assert.equal(declaration, undefined, `Duplicate ${property}`);
        declaration = candidate;
    });
    assert.ok(declaration, `Missing ${property}`);
    return declaration;
}

test('preserves every mapped CSS value from the parity baseline', () => {
    const declarations = collectCustomProperties(generateCss());

    for (const mapping of baseline.mappings) {
        assert.equal(
            declarations.get(mapping.sourceVariable),
            mapping.sourceValue,
            mapping.sourceVariable,
        );
    }
    assert.equal(
        declarations.get('--shadow-info'),
        '0px 1px 3px 0px rgba(21, 136, 185, 0.1), 0px 1px 2px -1px rgba(21, 136, 185, 0.1)',
    );
});

test('preserves source CSS rule boundaries', () => {
    const css = generateCss();
    const pixelBreakpoint = findDeclaration(css, '--breakpoint-sm-px');
    const remBreakpoint = findDeclaration(css, '--breakpoint-sm');

    assert.equal(pixelBreakpoint.parent.type, 'rule');
    assert.equal(pixelBreakpoint.parent.selector, ':root');
    assert.equal(remBreakpoint.parent.type, 'atrule');
    assert.equal(remBreakpoint.parent.name, 'theme');
});

test('generates a deterministic runtime primitive artifact', () => {
    const first = generateCss();
    const second = generateCss();
    const committed = readFileSync(
        new URL('../generated/govkit-primitives.css', import.meta.url),
        'utf8',
    );

    assert.equal(first, second);
    assert.equal(first, committed);
    assert.match(first, /--color-primary-500: #003bf5;/);
    assert.match(first, /--breakpoint-sm-px: 640;/);
    assert.match(first, /--breakpoint-sm: 40rem;/);
    assert.match(first, /--ring-color-primary: var\(--color-primary-200\);/);
    assert.match(first, /--radius-none: none;/);
    assert.match(first, /@utility focus-ring-primary/);
    assert.match(first, /@font-face/);
    assert.match(
        first,
        /url\(["']?\.\.\/\.\.\/apps\/app\/node_modules\/@aragon\/gov-ui-kit\/src\/theme\/fonts\/Manrope-Regular\.ttf["']?\)/,
    );
    assert.match(first, /--guk-dialog-overlay-z-index: 20;/);
    assert.doesNotMatch(first, /@import ["']tailwindcss["']/);
});

test('rejects unrewritten relative font URLs', (context) => {
    const root = mkdtempSync(join(tmpdir(), 'govkit-parity-'));
    context.after(() => rmSync(root, { recursive: true, force: true }));
    cpSync(join(kitRoot, 'package.json'), join(root, 'package.json'));
    cpSync(
        join(kitRoot, 'src/theme/tokens/primitives'),
        join(root, 'src/theme/tokens/primitives'),
        { recursive: true },
    );
    const typographyPath = join(
        root,
        'src/theme/tokens/primitives/typography.css',
    );
    const typography = readFileSync(typographyPath, 'utf8').replaceAll(
        '../../fonts/',
        '../fonts/',
    );
    writeFileSync(typographyPath, typography);

    const alteredBaseline = {
        ...baseline,
        retainedCss: baseline.retainedCss.map((entry) => ({
            ...entry,
            css: entry.css.replace('../../fonts/', '../fonts/'),
        })),
    };

    assert.throws(
        () =>
            generateCss({ appRoot, kitRoot: root, baseline: alteredBaseline }),
        /Unresolved relative font URLs/,
    );
});

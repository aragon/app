import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const cli = join(root, 'apps/app/node_modules/@tailwindcss/cli/dist/index.mjs');
const entries = [
    'apps/app/src/modules/application/components/layouts/layoutRoot/layoutRoot.css',
    '.design-sync/tailwind-entry.css',
];
const overrideDeclarations = [
    ['--guk-avatar-container-position', 'relative'],
    ['--guk-dialog-overlay-z-index', '20'],
    ['--guk-dialog-alert-overlay-z-index', '20'],
    ['--guk-dialog-content-z-index', '30'],
    ['--guk-dialog-alert-content-z-index', '30'],
    ['--guk-text-area-rich-text-expanded-z-index', '35'],
    ['--guk-dropdown-container-content-z-index', '40'],
];
for (const entry of entries) {
    test(`${entry} consumes generated GovKit primitives`, () => {
        const outputDir = mkdtempSync(join(tmpdir(), 'app-736-consumer-'));
        const output = join(outputDir, 'styles.css');

        try {
            execFileSync('node', [cli, '-i', entry, '-o', output], {
                cwd: root,
                stdio: 'ignore',
            });
            const css = readFileSync(output, 'utf8');
            assert.match(css, /--color-primary-500:\s*#003bf5;/);
            assert.match(css, /--breakpoint-sm:\s*40rem;/);
            assert.match(css, /--radius-none:\s*none;/);
            assert.match(
                css,
                /url\("\.\.\/\.\.\/apps\/app\/node_modules\/@aragon\/gov-ui-kit\/src\/theme\/fonts\/Manrope-Regular\.ttf"\)/,
            );

            assert.match(css, /--guk-dialog-overlay-z-index:\s*20;/);
            for (const [property, value] of overrideDeclarations) {
                assert.equal(
                    css.match(new RegExp(`${property}:\\s*${value};`, 'g'))
                        ?.length,
                    1,
                    `${property}: ${value} should be emitted once`,
                );
            }
            assert.ok(
                css.indexOf('--color-primary-500:') <
                    css.indexOf('--guk-dialog-overlay-z-index:'),
                'generated primitives must precede App overrides',
            );
            assert.match(css, /\.focus-ring-primary/);
        } finally {
            rmSync(outputDir, { recursive: true, force: true });
        }
    });
}

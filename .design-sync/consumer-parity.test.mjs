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
            assert.match(css, /--guk-dialog-overlay-z-index:\s*20;/);
            assert.match(css, /\.focus-ring-primary/);
            assert.match(
                css,
                /url\("\.\.\/\.\.\/apps\/app\/node_modules\/@aragon\/gov-ui-kit\/src\/theme\/fonts\/Manrope-Regular\.ttf"\)/,
            );
        } finally {
            rmSync(outputDir, { recursive: true, force: true });
        }
    });
}

/** @jest-environment node */

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

describe('visual-diff output directories', () => {
    let dir: string;
    const run = (...args: string[]) =>
        spawnSync(process.execPath, [require.resolve('./visual-diff.mjs'), ...args], { cwd: dir, encoding: 'utf8' });

    beforeEach(() => {
        dir = mkdtempSync(join(tmpdir(), 'govkit-visual-diff-'));
        mkdirSync(join(dir, 'base'));
        mkdirSync(join(dir, 'head'));
        writeFileSync(join(dir, 'base/index.json'), '{"entries":{}}');
    });

    afterEach(() => rmSync(dir, { recursive: true, force: true }));

    it.each([
        ['build', 'diff'],
        ['capture', 'base', 'diff'],
        ['compare', 'base', 'head'],
    ])('preserves an unrelated directory for %s', (...args) => {
        mkdirSync(join(dir, 'diff'));
        const file = join(dir, 'diff/notes.txt');
        writeFileSync(file, 'keep');
        const result = run(...args);
        expect(result.status).toBe(2);
        expect(result.stderr).toContain('refusing to clear');
        expect(readFileSync(file, 'utf8')).toBe('keep');
    });

    it('clears previous diff output and protects it when it is an input', () => {
        expect(run('compare', 'base', 'head').status).toBe(0);
        const stale = join(dir, 'diff/stale.png');
        writeFileSync(stale, 'stale');
        expect(run('compare', 'base', 'diff').status).toBe(2);
        expect(existsSync(stale)).toBe(true);
        expect(run('compare', 'base', 'head').status).toBe(0);
        expect(existsSync(stale)).toBe(false);
    });
});

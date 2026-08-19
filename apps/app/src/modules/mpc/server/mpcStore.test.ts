/**
 * @jest-environment node
 */

import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { MpcStore } from './mpcStore';

jest.mock('server-only', () => ({}));

describe('MpcStore', () => {
    let directory: string;

    beforeEach(() => {
        directory = mkdtempSync(join(tmpdir(), 'mpc-store-'));
    });

    afterEach(() => {
        rmSync(directory, { recursive: true, force: true });
    });

    it('returns an empty store when the file does not exist', () => {
        const store = new MpcStore(join(directory, 'nested', 'store.json'));

        expect(store.read().users).toEqual([]);
        expect(existsSync(store.getFilePath())).toBeFalsy();
    });

    it('persists updates atomically and reloads them from disk', () => {
        const filePath = join(directory, 'nested', 'store.json');
        const store = new MpcStore(filePath);

        store.update((data) => {
            data.users.push({
                id: 'user-1',
                username: 'alice',
                passwordHash: 'hash',
                salt: 'salt',
                createdAt: '2026-01-01T00:00:00.000Z',
            });
        });

        expect(existsSync(filePath)).toBeTruthy();
        expect(JSON.parse(readFileSync(filePath, 'utf8')).users).toHaveLength(
            1,
        );

        // Drop the cache and reload from disk.
        store.reset();
        const reloaded = new MpcStore(filePath);
        expect(reloaded.read().users[0].username).toEqual('alice');
        expect(reloaded.read().version).toEqual(1);
    });

    it('shares the cached data between instances with the same path', () => {
        const filePath = join(directory, 'store.json');
        const first = new MpcStore(filePath);
        const second = new MpcStore(filePath);

        first.update((data) => {
            data.loginAttempts.test = { failures: 1, firstFailureAt: 1 };
        });

        expect(second.read().loginAttempts.test.failures).toEqual(1);
    });
});

/**
 * @jest-environment node
 */

import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
    MPC_LOGIN_MAX_FAILURES,
    MPC_SESSION_IDLE_MS,
    MPC_SESSION_TTL_MS,
    MpcAuth,
} from './mpcAuth';
import { MpcStore } from './mpcStore';

jest.mock('server-only', () => ({}));

describe('MpcAuth', () => {
    let directory: string;
    let store: MpcStore;
    let auth: MpcAuth;

    const credentials = { username: 'alice', password: 'password123' };
    const meta = { ip: '10.0.0.1' };

    beforeEach(() => {
        directory = mkdtempSync(join(tmpdir(), 'mpc-auth-'));
        store = new MpcStore(join(directory, 'store.json'));
        auth = new MpcAuth(() => store);
    });

    afterEach(() => {
        store.reset();
        rmSync(directory, { recursive: true, force: true });
        jest.useRealTimers();
    });

    it('registers, logs in and resolves the session from the token', async () => {
        const registered = await auth.register(credentials, meta);
        expect(registered.session.user.username).toEqual('alice');
        expect(store.read().users[0].passwordHash).not.toContain('password');

        const login = await auth.login(credentials, meta);
        const resolved = auth.getSessionFromToken(login.token);
        expect(resolved?.user.username).toEqual('alice');

        auth.logout(login.token);
        expect(auth.getSessionFromToken(login.token)).toBeUndefined();
    });

    it('rejects registration of an existing username with a conflict', async () => {
        await auth.register(credentials, meta);
        await expect(
            auth.register({ ...credentials, username: 'ALICE' }, meta),
        ).rejects.toMatchObject({
            code: 'conflict',
        });
    });

    it('returns a generic error for unknown users and wrong passwords', async () => {
        await auth.register(credentials, meta);

        await expect(
            auth.login({ username: 'bob', password: 'password123' }, meta),
        ).rejects.toMatchObject({
            code: 'unauthorized',
            message: 'Invalid username or password.',
        });
        await expect(
            auth.login({ ...credentials, password: 'wrong-password' }, meta),
        ).rejects.toMatchObject({
            code: 'unauthorized',
            message: 'Invalid username or password.',
        });
    });

    it('locks the user after too many failed attempts', async () => {
        await auth.register(credentials, meta);

        for (let index = 0; index < MPC_LOGIN_MAX_FAILURES; index++) {
            await expect(
                auth.login(
                    { ...credentials, password: 'wrong-password' },
                    meta,
                ),
            ).rejects.toMatchObject({
                code: 'unauthorized',
            });
        }

        // Even the correct password is rejected while locked.
        await expect(auth.login(credentials, meta)).rejects.toMatchObject({
            code: 'rate_limited',
        });

        // Lock applies per IP too (different username, same ip).
        await expect(
            auth.login({ username: 'bob', password: 'password123' }, meta),
        ).rejects.toMatchObject({
            code: 'rate_limited',
        });

        // Different ip and different user is not locked (unknown user => unauthorized).
        await expect(
            auth.login(
                { username: 'bob', password: 'password123' },
                { ip: '10.0.0.2' },
            ),
        ).rejects.toMatchObject({
            code: 'unauthorized',
        });
    });

    it('expires sessions after the idle timeout and the absolute ttl', async () => {
        jest.useFakeTimers({ now: new Date('2026-01-01T00:00:00.000Z') });
        await auth.register(credentials, meta);
        const { token } = await auth.login(credentials, meta);

        jest.setSystemTime(Date.now() + MPC_SESSION_IDLE_MS - 1000);
        expect(auth.getSessionFromToken(token)).toBeDefined();

        jest.setSystemTime(Date.now() + MPC_SESSION_IDLE_MS + 1000);
        expect(auth.getSessionFromToken(token)).toBeUndefined();

        const second = await auth.login(credentials, meta);
        jest.setSystemTime(Date.now() + MPC_SESSION_TTL_MS + 1000);
        expect(auth.getSessionFromToken(second.token)).toBeUndefined();
    });

    it('builds a HttpOnly, SameSite=Strict cookie', () => {
        const cookie = auth.buildSessionCookie(
            'token',
            '2026-01-01T00:00:00.000Z',
        );

        expect(cookie).toContain('aragon_mpc_session=token');
        expect(cookie).toContain('HttpOnly');
        expect(cookie).toContain('SameSite=Strict');
        expect(cookie).toContain('Path=/');
        expect(auth.buildClearSessionCookie()).toContain(
            'aragon_mpc_session=;',
        );
    });
});

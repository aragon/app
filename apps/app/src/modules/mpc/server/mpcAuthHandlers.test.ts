/**
 * @jest-environment node
 */

import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { NextRequest } from 'next/server';
import type {
    IMpcApiError,
    IMpcSession,
} from '@/modules/mpc/api/mpcService/domain';
import {
    handleGetSession,
    handleLogin,
    handleRegister,
    handleTotpSetup,
    handleTotpVerify,
} from './mpcAuthHandlers';
import { getMpcStore } from './mpcStore';
import { serverCrypto } from './serverCrypto';

jest.mock('server-only', () => ({}));
jest.mock('@/shared/featureFlags', () => ({
    featureFlags: { isEnabled: jest.fn(() => Promise.resolve(true)) },
}));

// The default store resolves its path lazily on first use, so the env var is set before any handler runs.
const directory = mkdtempSync(join(tmpdir(), 'mpc-handlers-'));
process.env.MPC_POC_STORE_PATH = join(directory, 'store.json');

const emptyParams = { params: Promise.resolve({}) };

const buildRequest = (
    path: string,
    init: { method: string; body?: unknown; headers?: Record<string, string> },
): NextRequest =>
    new NextRequest(`http://localhost:3000${path}`, {
        method: init.method,
        headers: {
            'content-type': 'application/json',
            origin: 'http://localhost:3000',
            host: 'localhost:3000',
            'x-mpc-client': 'aragon-app',
            ...init.headers,
        },
        body: init.body != null ? JSON.stringify(init.body) : undefined,
    });

describe('mpc auth route handlers', () => {
    afterAll(() => {
        getMpcStore().reset();
        rmSync(directory, { recursive: true, force: true });
    });

    it('rejects mutations without the client header', async () => {
        const request = buildRequest('/api/mpc/auth/login', {
            method: 'POST',
            body: { username: 'alice', password: 'password123' },
            headers: { 'x-mpc-client': 'other' },
        });
        const response = await handleLogin(request, emptyParams);
        const body = (await response.json()) as IMpcApiError;

        expect(response.status).toEqual(403);
        expect(body.error.code).toEqual('forbidden');
    });

    it('rejects cross-origin mutations', async () => {
        const request = buildRequest('/api/mpc/auth/login', {
            method: 'POST',
            body: { username: 'alice', password: 'password123' },
            headers: { origin: 'http://evil.example' },
        });
        const response = await handleLogin(request, emptyParams);

        expect(response.status).toEqual(403);
    });

    it('registers, logs in and returns the session from the cookie', async () => {
        const registerResponse = await handleRegister(
            buildRequest('/api/mpc/auth/register', {
                method: 'POST',
                body: { username: 'alice', password: 'password123' },
            }),
            emptyParams,
        );
        expect(registerResponse.status).toEqual(201);
        expect(registerResponse.headers.get('cache-control')).toEqual(
            'no-store',
        );

        const loginResponse = await handleLogin(
            buildRequest('/api/mpc/auth/login', {
                method: 'POST',
                body: { username: 'alice', password: 'password123' },
            }),
            emptyParams,
        );
        const loginBody = (await loginResponse.json()) as IMpcSession;
        const setCookie = loginResponse.headers.get('set-cookie');

        expect(loginResponse.status).toEqual(200);
        expect(loginBody.user.username).toEqual('alice');
        expect(setCookie).toContain('aragon_mpc_session=');
        expect(setCookie).toContain('HttpOnly');

        const cookieValue = setCookie!.split(';')[0];
        const sessionResponse = await handleGetSession(
            buildRequest('/api/mpc/auth/session', {
                method: 'GET',
                headers: { cookie: cookieValue },
            }),
            emptyParams,
        );
        const sessionBody = (await sessionResponse.json()) as IMpcSession;

        expect(sessionResponse.status).toEqual(200);
        expect(sessionBody.user.username).toEqual('alice');
        expect(sessionBody.expiresAt).toEqual(loginBody.expiresAt);
    });

    it('returns 401 without a session cookie', async () => {
        const response = await handleGetSession(
            buildRequest('/api/mpc/auth/session', { method: 'GET' }),
            emptyParams,
        );
        const body = (await response.json()) as IMpcApiError;

        expect(response.status).toEqual(401);
        expect(body.error.code).toEqual('unauthorized');
    });

    it('enrolls the second factor with the setup + verify flow', async () => {
        const registerResponse = await handleRegister(
            buildRequest('/api/mpc/auth/register', {
                method: 'POST',
                body: { username: 'bob', password: 'password123' },
            }),
            emptyParams,
        );
        const cookie = registerResponse.headers
            .get('set-cookie')!
            .split(';')[0];

        const setupResponse = await handleTotpSetup(
            buildRequest('/api/mpc/auth/totp/setup', {
                method: 'POST',
                body: {},
                headers: { cookie },
            }),
            emptyParams,
        );
        const setupBody = (await setupResponse.json()) as {
            secret: string;
            otpauthUri: string;
        };

        expect(setupResponse.status).toEqual(200);
        expect(setupBody.secret).toMatch(/^[A-Z2-7]{32}$/);
        expect(setupBody.otpauthUri).toContain('otpauth://totp/');

        const invalidResponse = await handleTotpVerify(
            buildRequest('/api/mpc/auth/totp/verify', {
                method: 'POST',
                body: { totpCode: '000000' },
                headers: { cookie },
            }),
            emptyParams,
        );
        expect(invalidResponse.status).toEqual(401);

        const totpCode = serverCrypto.computeTotp(
            setupBody.secret,
            serverCrypto.getTotpStep(),
        );
        const verifyResponse = await handleTotpVerify(
            buildRequest('/api/mpc/auth/totp/verify', {
                method: 'POST',
                body: { totpCode },
                headers: { cookie },
            }),
            emptyParams,
        );
        const verifyBody = (await verifyResponse.json()) as {
            totpEnabled: boolean;
        };

        expect(verifyResponse.status).toEqual(200);
        expect(verifyBody.totpEnabled).toBeTruthy();

        const sessionResponse = await handleGetSession(
            buildRequest('/api/mpc/auth/session', {
                method: 'GET',
                headers: { cookie },
            }),
            emptyParams,
        );
        const sessionBody = (await sessionResponse.json()) as IMpcSession;

        expect(sessionBody.user.totpEnabled).toBeTruthy();
    });

    it('returns a validation error for invalid credentials format', async () => {
        const response = await handleRegister(
            buildRequest('/api/mpc/auth/register', {
                method: 'POST',
                body: { username: 'ab', password: 'short' },
            }),
            emptyParams,
        );
        const body = (await response.json()) as IMpcApiError;

        expect(response.status).toEqual(400);
        expect(body.error.code).toEqual('validation_error');
    });
});

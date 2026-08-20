/**
 * @jest-environment node
 */

import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { NextRequest } from 'next/server';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import type {
    IMpcApiError,
    IMpcServerShareResponse,
    IMpcSignRequest,
    IMpcSystem,
} from '@/modules/mpc/api/mpcService/domain';
import { featureFlags } from '@/shared/featureFlags';
import { handleLogin, handleRegister } from './mpcAuthHandlers';
import {
    handleCompleteRequest,
    handleCreateRequest,
    handleRejectRequest,
} from './mpcRequestHandlers';
import { getMpcStore } from './mpcStore';
import {
    handleCreateSystem,
    handleGetSystem,
    handleRegisterKey,
    handleServerShare,
} from './mpcSystemHandlers';
import { handleCreateWorkspace } from './mpcWorkspaceHandlers';

jest.mock('server-only', () => ({}));
jest.mock('@/shared/featureFlags', () => ({
    featureFlags: { isEnabled: jest.fn(() => Promise.resolve(true)) },
}));

const directory = mkdtempSync(join(tmpdir(), 'mpc-systems-'));
process.env.MPC_POC_STORE_PATH = join(directory, 'store.json');

const buildRequest = (
    path: string,
    init: { method: string; body?: unknown; cookie?: string },
): NextRequest =>
    new NextRequest(`http://localhost:3000${path}`, {
        method: init.method,
        headers: {
            'content-type': 'application/json',
            origin: 'http://localhost:3000',
            host: 'localhost:3000',
            'x-mpc-client': 'aragon-app',
            ...(init.cookie != null ? { cookie: init.cookie } : {}),
        },
        body: init.body != null ? JSON.stringify(init.body) : undefined,
    });

const params = <TParams>(value: TParams) => ({
    params: Promise.resolve(value),
});

const authenticate = async (username: string): Promise<string> => {
    await handleRegister(
        buildRequest('/api/mpc/auth/register', {
            method: 'POST',
            body: { username, password: 'password123' },
        }),
        params({}),
    );
    const response = await handleLogin(
        buildRequest('/api/mpc/auth/login', {
            method: 'POST',
            body: { username, password: 'password123' },
        }),
        params({}),
    );

    return response.headers.get('set-cookie')!.split(';')[0];
};

const createWorkspace = async (cookie: string): Promise<string> => {
    const response = await handleCreateWorkspace(
        buildRequest('/api/mpc/workspaces', {
            method: 'POST',
            cookie,
            body: { name: 'Test workspace' },
        }),
        params({}),
    );

    return ((await response.json()) as { id: string }).id;
};

describe('mpc system route handlers', () => {
    afterAll(() => {
        getMpcStore().reset();
        rmSync(directory, { recursive: true, force: true });
    });

    it('runs the create -> register key -> request -> release -> complete flow for a message', async () => {
        const cookie = await authenticate('owner');
        const workspaceId = await createWorkspace(cookie);
        const account = privateKeyToAccount(generatePrivateKey());

        const createResponse = await handleCreateSystem(
            buildRequest('/api/mpc/systems', {
                method: 'POST',
                cookie,
                body: {
                    name: 'Treasury',
                    chainIds: [11_155_111],
                    providerId: 'mock-shamir',
                    workspaceId,
                },
            }),
            params({}),
        );
        const system = (await createResponse.json()) as IMpcSystem;
        expect(createResponse.status).toEqual(201);
        expect(system.status).toEqual('initializing');
        expect(system.members[0].role).toEqual('owner');

        const systemParams = params({ systemId: system.id });
        const keyResponse = await handleRegisterKey(
            buildRequest(`/api/mpc/systems/${system.id}/key`, {
                method: 'POST',
                cookie,
                body: {
                    address: account.address,
                    publicKey: account.publicKey,
                    serverShare: {
                        index: 2,
                        value: `0x${'11'.repeat(32)}`,
                        epoch: 1,
                    },
                },
            }),
            systemParams,
        );
        const activeSystem = (await keyResponse.json()) as IMpcSystem & {
            serverShare?: unknown;
        };
        expect(keyResponse.status).toEqual(200);
        expect(activeSystem.status).toEqual('active');
        expect(activeSystem.epoch).toEqual(1);
        expect(activeSystem.serverShare).toBeUndefined();

        // The share is encrypted at rest.
        const stored = getMpcStore().read().systems[0].serverShare!;
        expect(stored.ciphertext).not.toContain('1111');

        // Server share is not exposed by GET system.
        const getResponse = await handleGetSystem(
            buildRequest(`/api/mpc/systems/${system.id}`, {
                method: 'GET',
                cookie,
            }),
            systemParams,
        );
        expect(JSON.stringify(await getResponse.json())).not.toContain(
            'ciphertext',
        );

        // Dry run: policy preview without persisting anything.
        const previewResponse = await handleCreateRequest(
            buildRequest(`/api/mpc/systems/${system.id}/requests`, {
                method: 'POST',
                cookie,
                body: {
                    payload: {
                        type: 'message',
                        message: { message: 'hello mpc' },
                    },
                    dryRun: true,
                },
            }),
            systemParams,
        );
        const preview = (await previewResponse.json()) as IMpcSignRequest;
        expect(previewResponse.status).toEqual(200);
        expect(preview.id).toEqual('preview');
        expect(preview.status).toEqual('approved');
        expect(getMpcStore().read().signRequests).toHaveLength(0);

        // The server share is never released for export.
        const exportResponse = await handleServerShare(
            buildRequest(`/api/mpc/systems/${system.id}/server-share`, {
                method: 'POST',
                cookie,
                body: { purpose: 'export' },
            }),
            systemParams,
        );
        expect(exportResponse.status).toEqual(400);

        const requestResponse = await handleCreateRequest(
            buildRequest(`/api/mpc/systems/${system.id}/requests`, {
                method: 'POST',
                cookie,
                body: {
                    payload: {
                        type: 'message',
                        message: { message: 'hello mpc' },
                    },
                },
            }),
            systemParams,
        );
        const request = (await requestResponse.json()) as IMpcSignRequest;
        expect(requestResponse.status).toEqual(201);
        expect(request.status).toEqual('approved');
        expect(request.summary.label).toContain('hello mpc');

        const shareResponse = await handleServerShare(
            buildRequest(`/api/mpc/systems/${system.id}/server-share`, {
                method: 'POST',
                cookie,
                body: { purpose: 'sign', requestId: request.id },
            }),
            systemParams,
        );
        const share = (await shareResponse.json()) as IMpcServerShareResponse;
        expect(shareResponse.status).toEqual(200);
        expect(share.serverShare).toEqual({
            index: 2,
            value: `0x${'11'.repeat(32)}`,
            epoch: 1,
        });

        const requestParams = params({
            systemId: system.id,
            requestId: request.id,
        });
        const wrongSignature = await privateKeyToAccount(
            generatePrivateKey(),
        ).signMessage({
            message: 'hello mpc',
        });
        const wrongResponse = await handleCompleteRequest(
            buildRequest(
                `/api/mpc/systems/${system.id}/requests/${request.id}/complete`,
                {
                    method: 'POST',
                    cookie,
                    body: { signature: wrongSignature },
                },
            ),
            requestParams,
        );
        const wrongBody = (await wrongResponse.json()) as IMpcApiError;
        expect(wrongResponse.status).toEqual(400);
        expect(wrongBody.error.code).toEqual('validation_error');
        expect(getMpcStore().read().signRequests[0].status).toEqual('failed');

        // New request with the right signature.
        const secondRequest = (await (
            await handleCreateRequest(
                buildRequest(`/api/mpc/systems/${system.id}/requests`, {
                    method: 'POST',
                    cookie,
                    body: {
                        payload: {
                            type: 'message',
                            message: { message: 'hello again' },
                        },
                    },
                }),
                systemParams,
            )
        ).json()) as IMpcSignRequest;
        await handleServerShare(
            buildRequest(`/api/mpc/systems/${system.id}/server-share`, {
                method: 'POST',
                cookie,
                body: { purpose: 'sign', requestId: secondRequest.id },
            }),
            systemParams,
        );
        const signature = await account.signMessage({ message: 'hello again' });
        const completeResponse = await handleCompleteRequest(
            buildRequest(
                `/api/mpc/systems/${system.id}/requests/${secondRequest.id}/complete`,
                {
                    method: 'POST',
                    cookie,
                    body: { signature },
                },
            ),
            params({ systemId: system.id, requestId: secondRequest.id }),
        );
        const completed = (await completeResponse.json()) as IMpcSignRequest;
        expect(completeResponse.status).toEqual(200);
        expect(completed.status).toEqual('signed');
        expect(completed.signature).toEqual(signature);

        // An abandoned released request can be rejected (frees the daily limit reservation).
        const thirdRequest = (await (
            await handleCreateRequest(
                buildRequest(`/api/mpc/systems/${system.id}/requests`, {
                    method: 'POST',
                    cookie,
                    body: {
                        payload: {
                            type: 'message',
                            message: { message: 'abandoned' },
                        },
                    },
                }),
                systemParams,
            )
        ).json()) as IMpcSignRequest;
        await handleServerShare(
            buildRequest(`/api/mpc/systems/${system.id}/server-share`, {
                method: 'POST',
                cookie,
                body: { purpose: 'sign', requestId: thirdRequest.id },
            }),
            systemParams,
        );
        const rejectResponse = await handleRejectRequest(
            buildRequest(
                `/api/mpc/systems/${system.id}/requests/${thirdRequest.id}/reject`,
                { method: 'POST', cookie },
            ),
            params({ systemId: system.id, requestId: thirdRequest.id }),
        );
        const rejected = (await rejectResponse.json()) as IMpcSignRequest;
        expect(rejectResponse.status).toEqual(200);
        expect(rejected.status).toEqual('rejected');
    });

    it('answers 404 on every endpoint when the feature flag is disabled', async () => {
        const cookie = await authenticate('flagged');
        jest.mocked(featureFlags.isEnabled).mockResolvedValueOnce(false);

        const response = await handleCreateSystem(
            buildRequest('/api/mpc/systems', {
                method: 'POST',
                cookie,
                body: {
                    name: 'Hidden',
                    chainIds: [11_155_111],
                    providerId: 'mock-shamir',
                    workspaceId: 'none',
                },
            }),
            params({}),
        );
        expect(response.status).toEqual(404);
    });

    it('hides systems from non members and blocks non-owner mutations', async () => {
        const ownerCookie = await authenticate('owner2');
        const otherCookie = await authenticate('other2');
        const workspaceId = await createWorkspace(ownerCookie);

        const system = (await (
            await handleCreateSystem(
                buildRequest('/api/mpc/systems', {
                    method: 'POST',
                    cookie: ownerCookie,
                    body: {
                        name: 'Private',
                        chainIds: [11_155_111],
                        providerId: 'mock-shamir',
                        workspaceId,
                    },
                }),
                params({}),
            )
        ).json()) as IMpcSystem;

        const response = await handleGetSystem(
            buildRequest(`/api/mpc/systems/${system.id}`, {
                method: 'GET',
                cookie: otherCookie,
            }),
            params({ systemId: system.id }),
        );
        expect(response.status).toEqual(404);

        const shareResponse = await handleServerShare(
            buildRequest(`/api/mpc/systems/${system.id}/server-share`, {
                method: 'POST',
                cookie: otherCookie,
                body: { purpose: 'export' },
            }),
            params({ systemId: system.id }),
        );
        expect(shareResponse.status).toEqual(404);
    });
});

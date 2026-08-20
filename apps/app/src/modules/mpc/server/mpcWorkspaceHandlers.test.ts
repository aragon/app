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
    IMpcPolicySimContext,
    IMpcPolicySimResult,
    IMpcSession,
    IMpcSignRequest,
    IMpcSystem,
    IMpcWorkspace,
    IMpcWorkspacePolicy,
} from '@/modules/mpc/api/mpcService/domain';
import { generateMpcPolicyFlow } from '@/modules/mpc/testUtils';
import { handleLogin, handleRegister } from './mpcAuthHandlers';
import { mpcPolicyEngine } from './mpcPolicyEngine';
import { handleCreateRequest, handleUpdateRequest } from './mpcRequestHandlers';
import { getMpcStore } from './mpcStore';
import {
    handleCreateSystem,
    handleGetSystem,
    handleRegisterKey,
} from './mpcSystemHandlers';
import {
    handleAddWorkspaceMember,
    handleCreateWorkspace,
    handleCreateWorkspacePolicy,
    handleListWorkspacePolicies,
    handleListWorkspaceSystems,
    handleListWorkspaces,
    handleRemoveWorkspaceMember,
    handleUpdateWorkspacePolicy,
} from './mpcWorkspaceHandlers';

jest.mock('server-only', () => ({}));
jest.mock('@/shared/featureFlags', () => ({
    featureFlags: { isEnabled: jest.fn(() => Promise.resolve(true)) },
}));

const directory = mkdtempSync(join(tmpdir(), 'mpc-workspace-handlers-'));
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

const authenticate = async (
    username: string,
): Promise<{ cookie: string; session: IMpcSession }> => {
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

    return {
        cookie: response.headers.get('set-cookie')!.split(';')[0],
        session: (await response.json()) as IMpcSession,
    };
};

const createWorkspace = async (
    cookie: string,
    name = 'Treasury team',
): Promise<IMpcWorkspace> => {
    const response = await handleCreateWorkspace(
        buildRequest('/api/mpc/workspaces', {
            method: 'POST',
            cookie,
            body: { name },
        }),
        params({}),
    );
    expect(response.status).toEqual(201);

    return (await response.json()) as IMpcWorkspace;
};

const createActiveSystem = async (
    cookie: string,
    workspaceId: string,
    name = 'Treasury',
): Promise<IMpcSystem> => {
    const account = privateKeyToAccount(generatePrivateKey());
    const createResponse = await handleCreateSystem(
        buildRequest('/api/mpc/systems', {
            method: 'POST',
            cookie,
            body: {
                name,
                chainIds: [11_155_111],
                providerId: 'mock-shamir',
                workspaceId,
            },
        }),
        params({}),
    );
    expect(createResponse.status).toEqual(201);
    const system = (await createResponse.json()) as IMpcSystem;
    await handleRegisterKey(
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
        params({ systemId: system.id }),
    );

    return system;
};

// Deterministic fake engine: amounts below 1 ETH are approved, 1..10 ETH escalate, the rest is denied.
const fakeEvaluate = (
    _flow: unknown,
    context: IMpcPolicySimContext,
): Promise<IMpcPolicySimResult> => {
    const gwei = BigInt(context.amount_wei) / BigInt(1_000_000_000);
    const template =
        gwei < BigInt(1_000_000_000)
            ? 'approve'
            : gwei < BigInt(10_000_000_000)
              ? 'escalate'
              : 'deny';

    return Promise.resolve({
        decision: {
            template,
            params: template === 'escalate' ? { extra_approvals: 2 } : {},
        },
        actionNodeId: `${template}_1`,
        path: ['trigger', 'amount_threshold_1', `${template}_1`],
        nodeResults: {},
        derived: {
            amount_gwei: gwei.toString(),
            weekday: 2,
            hour: 10,
            proposal_kind: 'native_transfer',
            selector: null,
            is_delegatecall: false,
            is_token_approval: false,
            approval_is_unlimited: false,
            erc20_amount: null,
            erc20_recipient: null,
            chain_id: context.chain_id ?? null,
            daily_spent_gwei: null,
            has_calldata: false,
        },
    });
};

describe('mpc workspace route handlers', () => {
    const checkSpy = jest.spyOn(mpcPolicyEngine, 'check');
    const evaluateSpy = jest.spyOn(mpcPolicyEngine, 'evaluate');

    beforeEach(() => {
        checkSpy.mockResolvedValue({ consistent: true, issues: [] });
        evaluateSpy.mockImplementation(fakeEvaluate);
    });

    afterAll(() => {
        checkSpy.mockRestore();
        evaluateSpy.mockRestore();
        getMpcStore().reset();
        rmSync(directory, { recursive: true, force: true });
    });

    it('starts with no workspace, lists created ones and enforces their policies on transaction requests', async () => {
        const { cookie } = await authenticate('owner');

        const emptyResponse = await handleListWorkspaces(
            buildRequest('/api/mpc/workspaces', { method: 'GET', cookie }),
            params({}),
        );
        expect((await emptyResponse.json()) as IMpcWorkspace[]).toEqual([]);

        const workspace = await createWorkspace(cookie);
        const workspacesResponse = await handleListWorkspaces(
            buildRequest('/api/mpc/workspaces', { method: 'GET', cookie }),
            params({}),
        );
        const workspaces = (await workspacesResponse.json()) as IMpcWorkspace[];
        expect(workspaces.map((item) => item.id)).toEqual([workspace.id]);
        expect(workspaces[0].members[0]).toMatchObject({
            username: 'owner',
            role: 'owner',
        });
        const workspaceParams = params({ workspaceId: workspaces[0].id });

        // Systems are created inside a workspace.
        const system = await createActiveSystem(cookie, workspace.id);
        expect(system.workspaceId).toEqual(workspace.id);
        const systemParams = params({ systemId: system.id });
        const systemsResponse = await handleListWorkspaceSystems(
            buildRequest(`/api/mpc/workspaces/${workspace.id}/systems`, {
                method: 'GET',
                cookie,
            }),
            workspaceParams,
        );
        expect(
            ((await systemsResponse.json()) as IMpcSystem[]).map(
                (item) => item.id,
            ),
        ).toEqual([system.id]);

        // Create a policy: the check runs on the engine before saving.
        const policyResponse = await handleCreateWorkspacePolicy(
            buildRequest(`/api/mpc/workspaces/${workspaces[0].id}/policies`, {
                method: 'POST',
                cookie,
                body: {
                    name: 'Treasury limits',
                    flow: generateMpcPolicyFlow(),
                },
            }),
            workspaceParams,
        );
        const policy = (await policyResponse.json()) as IMpcWorkspacePolicy;
        expect(policyResponse.status).toEqual(201);
        expect(policy.enabled).toBe(true);
        expect(policy.lastCheck.consistent).toBe(true);
        expect(checkSpy).toHaveBeenCalledTimes(1);

        const transactionRequest = (valueWei: string, dryRun?: boolean) =>
            handleCreateRequest(
                buildRequest(`/api/mpc/systems/${system.id}/requests`, {
                    method: 'POST',
                    cookie,
                    body: {
                        payload: {
                            type: 'transaction',
                            transaction: {
                                chainId: 11_155_111,
                                to: '0x1111111111111111111111111111111111111111',
                                valueWei,
                                data: '0x',
                            },
                        },
                        dryRun,
                    },
                }),
                systemParams,
            );

        // 0.5 ETH: approved by the policy.
        const approvedResponse = await transactionRequest('500000000000000000');
        const approved = (await approvedResponse.json()) as IMpcSignRequest;
        expect(approvedResponse.status).toEqual(201);
        expect(approved.status).toEqual('approved');
        expect(approved.policyDecision.workspacePolicies).toHaveLength(1);
        expect(approved.policyDecision.workspacePolicies![0]).toMatchObject({
            policyId: policy.id,
            decision: 'approve',
        });

        // 2 ETH: escalated -> approvals required (2 from the policy).
        const escalatedResponse = await transactionRequest(
            '2000000000000000000',
        );
        const escalated = (await escalatedResponse.json()) as IMpcSignRequest;
        expect(escalatedResponse.status).toEqual(201);
        expect(escalated.status).toEqual('pending_approval');
        expect(escalated.approvalsRequired).toEqual(2);
        expect(escalated.policyDecision.reasons[0]).toContain(
            'Treasury limits',
        );

        // 20 ETH: the dry run explains the denial, the real creation is refused.
        const previewResponse = await transactionRequest(
            '20000000000000000000',
            true,
        );
        const preview = (await previewResponse.json()) as IMpcSignRequest;
        expect(previewResponse.status).toEqual(200);
        expect(preview.status).toEqual('rejected');
        expect(preview.policyDecision.allowed).toBe(false);

        const deniedResponse = await transactionRequest('20000000000000000000');
        const denied = (await deniedResponse.json()) as IMpcApiError;
        expect(deniedResponse.status).toEqual(403);
        expect(denied.error.code).toEqual('policy_denied');
        expect(denied.error.message).toContain('Treasury limits');
        expect(
            getMpcStore()
                .read()
                .signRequests.filter((item) => item.systemId === system.id),
        ).toHaveLength(2);

        // Disabling the policy lifts the enforcement.
        const disableResponse = await handleUpdateWorkspacePolicy(
            buildRequest(
                `/api/mpc/workspaces/${workspaces[0].id}/policies/${policy.id}`,
                { method: 'PUT', cookie, body: { enabled: false } },
            ),
            params({ workspaceId: workspaces[0].id, policyId: policy.id }),
        );
        expect(disableResponse.status).toEqual(200);
        const allowedResponse = await transactionRequest(
            '20000000000000000000',
        );
        expect(allowedResponse.status).toEqual(201);
        const allowed = (await allowedResponse.json()) as IMpcSignRequest;
        expect(allowed.policyDecision.workspacePolicies).toBeUndefined();
    });

    it('hides the workspace from non-members; members read it (and its systems as viewers) but cannot edit', async () => {
        const owner = await authenticate('owner2');
        const other = await authenticate('stranger');
        const workspace = await createWorkspace(owner.cookie, 'Shared');
        const system = await createActiveSystem(
            owner.cookie,
            workspace.id,
            'Shared system',
        );

        const hidden = await handleListWorkspacePolicies(
            buildRequest(`/api/mpc/workspaces/${workspace.id}/policies`, {
                method: 'GET',
                cookie: other.cookie,
            }),
            params({ workspaceId: workspace.id }),
        );
        expect(hidden.status).toEqual(404);
        const hiddenSystem = await handleGetSystem(
            buildRequest(`/api/mpc/systems/${system.id}`, {
                method: 'GET',
                cookie: other.cookie,
            }),
            params({ systemId: system.id }),
        );
        expect(hiddenSystem.status).toEqual(404);

        // Only the owner adds members.
        const forbiddenAdd = await handleAddWorkspaceMember(
            buildRequest(`/api/mpc/workspaces/${workspace.id}/members`, {
                method: 'POST',
                cookie: other.cookie,
                body: { username: 'stranger' },
            }),
            params({ workspaceId: workspace.id }),
        );
        expect(forbiddenAdd.status).toEqual(404);
        const addResponse = await handleAddWorkspaceMember(
            buildRequest(`/api/mpc/workspaces/${workspace.id}/members`, {
                method: 'POST',
                cookie: owner.cookie,
                body: { username: 'stranger' },
            }),
            params({ workspaceId: workspace.id }),
        );
        expect(addResponse.status).toEqual(201);

        // The member reads the workspace, its policies and its systems (implicit viewer).
        const readable = await handleListWorkspacePolicies(
            buildRequest(`/api/mpc/workspaces/${workspace.id}/policies`, {
                method: 'GET',
                cookie: other.cookie,
            }),
            params({ workspaceId: workspace.id }),
        );
        expect(readable.status).toEqual(200);
        const visibleSystem = await handleGetSystem(
            buildRequest(`/api/mpc/systems/${system.id}`, {
                method: 'GET',
                cookie: other.cookie,
            }),
            params({ systemId: system.id }),
        );
        expect(visibleSystem.status).toEqual(200);
        const listed = await handleListWorkspaces(
            buildRequest('/api/mpc/workspaces', {
                method: 'GET',
                cookie: other.cookie,
            }),
            params({}),
        );
        expect(
            ((await listed.json()) as IMpcWorkspace[]).map((item) => item.id),
        ).toEqual([workspace.id]);

        const forbidden = await handleCreateWorkspacePolicy(
            buildRequest(`/api/mpc/workspaces/${workspace.id}/policies`, {
                method: 'POST',
                cookie: other.cookie,
                body: { name: 'Nope', flow: generateMpcPolicyFlow() },
            }),
            params({ workspaceId: workspace.id }),
        );
        expect(forbidden.status).toEqual(403);

        // Removing the member takes the access away again.
        const removeResponse = await handleRemoveWorkspaceMember(
            buildRequest(
                `/api/mpc/workspaces/${workspace.id}/members/${other.session.user.id}`,
                {
                    method: 'DELETE',
                    cookie: owner.cookie,
                },
            ),
            params({
                workspaceId: workspace.id,
                userId: other.session.user.id,
            }),
        );
        expect(removeResponse.status).toEqual(200);
        const hiddenAgain = await handleGetSystem(
            buildRequest(`/api/mpc/systems/${system.id}`, {
                method: 'GET',
                cookie: other.cookie,
            }),
            params({ systemId: system.id }),
        );
        expect(hiddenAgain.status).toEqual(404);
    });

    it('lets the requester modify an editable request (policies re-evaluated, approvals reset) and refuses otherwise', async () => {
        const { cookie } = await authenticate('editor');
        const workspace = await createWorkspace(cookie, 'Edits');
        const system = await createActiveSystem(
            cookie,
            workspace.id,
            'Editable',
        );
        await handleCreateWorkspacePolicy(
            buildRequest(`/api/mpc/workspaces/${workspace.id}/policies`, {
                method: 'POST',
                cookie,
                body: { name: 'Limits', flow: generateMpcPolicyFlow() },
            }),
            params({ workspaceId: workspace.id }),
        );
        const payload = (valueWei: string) => ({
            type: 'transaction',
            transaction: {
                chainId: 11_155_111,
                to: '0x1111111111111111111111111111111111111111',
                valueWei,
                data: '0x',
            },
        });

        // Non-editable request: modification refused.
        const fixedResponse = await handleCreateRequest(
            buildRequest(`/api/mpc/systems/${system.id}/requests`, {
                method: 'POST',
                cookie,
                body: { payload: payload('100000000000000000') },
            }),
            params({ systemId: system.id }),
        );
        const fixed = (await fixedResponse.json()) as IMpcSignRequest;
        expect(fixed.editable).toBe(false);
        const refused = await handleUpdateRequest(
            buildRequest(`/api/mpc/systems/${system.id}/requests/${fixed.id}`, {
                method: 'PUT',
                cookie,
                body: { payload: payload('200000000000000000') },
            }),
            params({ systemId: system.id, requestId: fixed.id }),
        );
        expect(refused.status).toEqual(409);

        // Editable request: 0.5 ETH approved -> modified to 2 ETH -> escalated by the policy.
        const createdResponse = await handleCreateRequest(
            buildRequest(`/api/mpc/systems/${system.id}/requests`, {
                method: 'POST',
                cookie,
                body: {
                    payload: payload('500000000000000000'),
                    editable: true,
                },
            }),
            params({ systemId: system.id }),
        );
        const created = (await createdResponse.json()) as IMpcSignRequest;
        expect(created.editable).toBe(true);
        expect(created.status).toEqual('approved');

        const updatedResponse = await handleUpdateRequest(
            buildRequest(
                `/api/mpc/systems/${system.id}/requests/${created.id}`,
                {
                    method: 'PUT',
                    cookie,
                    body: { payload: payload('2000000000000000000') },
                },
            ),
            params({ systemId: system.id, requestId: created.id }),
        );
        const updated = (await updatedResponse.json()) as IMpcSignRequest;
        expect(updatedResponse.status).toEqual(200);
        expect(updated.id).toEqual(created.id);
        expect(updated.status).toEqual('pending_approval');
        expect(updated.approvalsRequired).toEqual(2);
        expect(updated.summary.valueWei).toEqual('2000000000000000000');
        expect(updated.approvals).toEqual([]);

        // A payload denied by the policies leaves the request untouched.
        const deniedResponse = await handleUpdateRequest(
            buildRequest(
                `/api/mpc/systems/${system.id}/requests/${created.id}`,
                {
                    method: 'PUT',
                    cookie,
                    body: { payload: payload('20000000000000000000') },
                },
            ),
            params({ systemId: system.id, requestId: created.id }),
        );
        expect(deniedResponse.status).toEqual(403);
        expect(
            ((await deniedResponse.json()) as IMpcApiError).error.code,
        ).toEqual('policy_denied');
        const stored = getMpcStore()
            .read()
            .signRequests.find((item) => item.id === created.id)!;
        expect(stored.summary.valueWei).toEqual('2000000000000000000');
    });

    it('rejects structurally invalid flows before contacting the engine', async () => {
        const { cookie } = await authenticate('owner3');
        const workspace = await createWorkspace(cookie, 'Invalid flows');
        checkSpy.mockClear();

        const response = await handleCreateWorkspacePolicy(
            buildRequest(`/api/mpc/workspaces/${workspace.id}/policies`, {
                method: 'POST',
                cookie,
                body: {
                    name: 'Invalid',
                    flow: { flowVersion: 1, nodes: [], edges: [] },
                },
            }),
            params({ workspaceId: workspace.id }),
        );
        expect(response.status).toEqual(400);
        expect(checkSpy).not.toHaveBeenCalled();
    });
});

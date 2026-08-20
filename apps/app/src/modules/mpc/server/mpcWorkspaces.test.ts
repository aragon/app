/**
 * @jest-environment node
 */

import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { generateMpcPolicyFlow } from '@/modules/mpc/testUtils';
import { MpcApiError } from './mpcApiError';
import { mpcPolicyEngine } from './mpcPolicyEngine';
import { getMpcStore, migrateStoreData } from './mpcStore';
import {
    addWorkspaceMember,
    canReadWorkspace,
    createWorkspace,
    createWorkspacePolicy,
    deleteWorkspacePolicy,
    listEnabledPoliciesForSystem,
    listWorkspacePolicies,
    listWorkspaces,
    removeWorkspaceMember,
    updateWorkspacePolicy,
} from './mpcWorkspaces';

jest.mock('server-only', () => ({}));

const directory = mkdtempSync(join(tmpdir(), 'mpc-workspaces-'));
process.env.MPC_POC_STORE_PATH = join(directory, 'store.json');

const alice = {
    id: 'user-1',
    username: 'alice',
    createdAt: '2026-01-01T00:00:00.000Z',
    totpEnabled: false,
};
const bob = {
    id: 'user-2',
    username: 'bob',
    createdAt: '2026-01-01T00:00:00.000Z',
    totpEnabled: false,
};

describe('mpcWorkspaces', () => {
    const checkSpy = jest.spyOn(mpcPolicyEngine, 'check');

    beforeAll(() => {
        // The member lookups need the accounts to exist on the co-signer.
        getMpcStore().update((data) => {
            for (const user of [alice, bob]) {
                data.users.push({ ...user, passwordHash: 'x', salt: 'y' });
            }
        });
    });

    afterEach(() => {
        checkSpy.mockReset();
    });

    afterAll(() => {
        checkSpy.mockRestore();
        getMpcStore().reset();
        rmSync(directory, { recursive: true, force: true });
    });

    it('creates workspaces explicitly (no automatic workspace) with the creator as owner', () => {
        expect(listWorkspaces(alice.id)).toHaveLength(0);

        const workspace = createWorkspace(alice, { name: 'Treasury team' });

        expect(workspace).toMatchObject({
            name: 'Treasury team',
            ownerId: alice.id,
            isDefault: false,
            members: [{ userId: alice.id, username: 'alice', role: 'owner' }],
        });
        expect(listWorkspaces(alice.id).map((item) => item.id)).toEqual([
            workspace.id,
        ]);
        expect(listWorkspaces(bob.id)).toHaveLength(0);
    });

    it('adds and removes members (the owner cannot be removed)', () => {
        const workspace = createWorkspace(alice, { name: 'Shared' });

        expect(() =>
            addWorkspaceMember(workspace.id, { username: 'nobody' }),
        ).toThrow(MpcApiError);

        const members = addWorkspaceMember(workspace.id, { username: 'BOB' });
        expect(members.map((member) => member.username)).toEqual([
            'alice',
            'bob',
        ]);
        expect(canReadWorkspace(getMpcStore().read(), workspace, bob.id)).toBe(
            true,
        );
        expect(listWorkspaces(bob.id).map((item) => item.id)).toContain(
            workspace.id,
        );

        expect(() =>
            addWorkspaceMember(workspace.id, { username: 'bob' }),
        ).toThrow(/already a member/);
        expect(() => removeWorkspaceMember(workspace.id, alice.id)).toThrow(
            /owner cannot be removed/,
        );

        const remaining = removeWorkspaceMember(workspace.id, bob.id);
        expect(remaining.map((member) => member.username)).toEqual(['alice']);
        expect(listWorkspaces(bob.id).map((item) => item.id)).not.toContain(
            workspace.id,
        );
    });

    it('migrates legacy data: systems without workspace join their creator legacy workspace, workspaces get members', () => {
        const data = getMpcStore().read();
        data.systems.push({
            id: 'legacy',
            name: 'Legacy',
            workspaceId: '',
            status: 'active',
            providerId: 'mock-shamir',
            chainIds: [1],
            epoch: 1,
            recoveryAcknowledged: true,
            policy: {
                allowedChainIds: [1],
                recipientAllowlist: null,
                maxValuePerTxWei: null,
                dailyLimitWei: null,
                requireApprovalAboveWei: null,
                approvalsRequired: 1,
                allowContractCalls: true,
                allowMessageSigning: true,
            },
            members: [],
            createdBy: bob.id,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
        });
        data.workspaces.push({
            id: 'ws-legacy',
            name: 'Old',
            ownerId: alice.id,
            isDefault: false,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
        } as never);

        expect(migrateStoreData(data)).toBe(true);
        expect(
            data.systems.find((item) => item.id === 'legacy')?.workspaceId,
        ).toEqual('ws_user-2');
        const legacyWorkspace = data.workspaces.find(
            (item) => item.id === 'ws_user-2',
        )!;
        expect(legacyWorkspace.isDefault).toBe(true);
        expect(legacyWorkspace.members[0]).toMatchObject({
            userId: bob.id,
            username: 'bob',
            role: 'owner',
        });
        expect(
            data.workspaces.find((item) => item.id === 'ws-legacy')?.members,
        ).toEqual([
            expect.objectContaining({ userId: alice.id, role: 'owner' }),
        ]);
        // Idempotent.
        expect(migrateStoreData(data)).toBe(false);
    });

    it('refuses to save a policy whose formal check fails', async () => {
        checkSpy.mockResolvedValue({
            consistent: false,
            issues: [
                {
                    type: 'collision',
                    severity: 'error',
                    message: 'x',
                    nodes: ['a', 'b'],
                },
            ],
        });
        const workspace = createWorkspace(alice, { name: 'Checks' });

        await expect(
            createWorkspacePolicy(workspace, alice, {
                name: 'Broken',
                flow: generateMpcPolicyFlow(),
            }),
        ).rejects.toMatchObject({ code: 'policy_check_failed', status: 422 });
        expect(listWorkspacePolicies(workspace.id)).toHaveLength(0);
    });

    it('saves a verified policy with its check result and toggles / re-checks on update', async () => {
        checkSpy.mockResolvedValue({ consistent: true, issues: [] });
        const workspace = createWorkspace(alice, { name: 'Policies' });

        const policy = await createWorkspacePolicy(workspace, alice, {
            name: 'Small transfers',
            flow: generateMpcPolicyFlow(),
        });
        expect(policy).toMatchObject({
            workspaceId: workspace.id,
            name: 'Small transfers',
            enabled: true,
            lastCheck: { consistent: true, issues: [] },
        });
        expect(checkSpy).toHaveBeenCalledTimes(1);

        const disabled = await updateWorkspacePolicy(workspace, policy.id, {
            enabled: false,
        });
        expect(disabled.enabled).toBe(false);
        expect(checkSpy).toHaveBeenCalledTimes(1);
        expect(
            listEnabledPoliciesForSystem(getMpcStore().read(), {
                workspaceId: workspace.id,
            }),
        ).toHaveLength(0);

        checkSpy.mockResolvedValue({
            consistent: false,
            issues: [
                {
                    type: 'dead_branch',
                    severity: 'error',
                    message: 'x',
                    nodes: ['a'],
                },
            ],
        });
        await expect(
            updateWorkspacePolicy(workspace, policy.id, {
                flow: generateMpcPolicyFlow({ name: 'changed' }),
                enabled: true,
            }),
        ).rejects.toBeInstanceOf(MpcApiError);
        const stored = listWorkspacePolicies(workspace.id)[0];
        expect(stored.flow.name).toEqual('Small transfers');
        expect(stored.enabled).toBe(false);
    });

    it('inlines policy blocks before the check, refuses cycles and guards deletion of referenced policies', async () => {
        checkSpy.mockResolvedValue({ consistent: true, issues: [] });
        const workspace = createWorkspace(alice, { name: 'Blocks' });
        const base = await createWorkspacePolicy(workspace, alice, {
            name: 'Base',
            flow: generateMpcPolicyFlow(),
        });

        // A flow delegating its "true" branch to the base policy.
        const referencing = generateMpcPolicyFlow({
            nodes: [
                { id: 'trigger', type: 'trigger' },
                {
                    id: 'c1',
                    type: 'condition',
                    template: 'amount_threshold',
                    params: { operator: 'gte', amount_eth: '0' },
                },
                {
                    id: 'ref_1',
                    type: 'action',
                    template: 'policy_ref',
                    params: { policyId: base.id },
                },
                { id: 'deny_1', type: 'action', template: 'deny', params: {} },
            ],
            edges: [
                { from: 'trigger', to: 'c1' },
                { from: 'c1', to: 'ref_1', branch: 'true' },
                { from: 'c1', to: 'deny_1', branch: 'false' },
            ],
        });
        checkSpy.mockClear();
        const composed = await createWorkspacePolicy(workspace, alice, {
            name: 'Composed',
            flow: referencing,
        });
        // The engine received the expanded flow: no policy_ref, inlined nodes prefixed with the block id.
        const sent = checkSpy.mock.calls[0][0];
        expect(sent.nodes.some((node) => node.template === 'policy_ref')).toBe(
            false,
        );
        expect(sent.nodes.map((node) => node.id)).toEqual(
            expect.arrayContaining([
                'ref_1::amount_threshold_1',
                'ref_1::approve_1',
                'ref_1::deny_1',
            ]),
        );
        expect(sent.edges).toEqual(
            expect.arrayContaining([
                { from: 'c1', to: 'ref_1::amount_threshold_1', branch: 'true' },
            ]),
        );
        // The stored flow keeps the reference.
        expect(
            composed.flow.nodes.some((node) => node.template === 'policy_ref'),
        ).toBe(true);

        // Base cannot reference Composed back (cycle), nor itself.
        const cyclic = generateMpcPolicyFlow({
            nodes: [
                { id: 'trigger', type: 'trigger' },
                {
                    id: 'ref',
                    type: 'action',
                    template: 'policy_ref',
                    params: { policyId: composed.id },
                },
            ],
            edges: [{ from: 'trigger', to: 'ref' }],
        });
        await expect(
            updateWorkspacePolicy(workspace, base.id, { flow: cyclic }),
        ).rejects.toMatchObject({ code: 'validation_error' });
        await expect(
            createWorkspacePolicy(workspace, alice, {
                name: 'Unknown ref',
                flow: generateMpcPolicyFlow({
                    nodes: [
                        { id: 'trigger', type: 'trigger' },
                        {
                            id: 'ref',
                            type: 'action',
                            template: 'policy_ref',
                            params: { policyId: 'missing' },
                        },
                    ],
                    edges: [{ from: 'trigger', to: 'ref' }],
                }),
            }),
        ).rejects.toMatchObject({ code: 'validation_error' });

        // Base is used as a block by Composed: it cannot be deleted until the block is removed.
        expect(() => deleteWorkspacePolicy(workspace, base.id)).toThrow(
            /used as a block by: Composed/,
        );
        deleteWorkspacePolicy(workspace, composed.id);
        deleteWorkspacePolicy(workspace, base.id);
        expect(listWorkspacePolicies(workspace.id)).toHaveLength(0);
    });
});

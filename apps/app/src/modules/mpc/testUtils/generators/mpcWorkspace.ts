import type {
    IMpcPolicyFlow,
    IMpcWorkspace,
    IMpcWorkspacePolicy,
    IMpcWorkspacePolicyVerdict,
} from '@/modules/mpc/api/mpcService/domain';

export const generateMpcWorkspace = (
    workspace?: Partial<IMpcWorkspace>,
): IMpcWorkspace => ({
    id: 'ws_user-1',
    name: 'Default workspace',
    ownerId: 'user-1',
    isDefault: false,
    members: [
        {
            userId: 'user-1',
            username: 'alice',
            role: 'owner',
            addedAt: '2026-01-01T00:00:00.000Z',
        },
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...workspace,
});

/**
 * Minimal consistent flow: amounts below 1 ETH are approved, the rest denied.
 */
export const generateMpcPolicyFlow = (
    flow?: Partial<IMpcPolicyFlow>,
): IMpcPolicyFlow => ({
    flowVersion: 1,
    name: 'Small transfers',
    nodes: [
        { id: 'trigger', type: 'trigger' },
        {
            id: 'amount_threshold_1',
            type: 'condition',
            template: 'amount_threshold',
            params: { operator: 'lt', amount_eth: '1' },
        },
        { id: 'approve_1', type: 'action', template: 'approve', params: {} },
        { id: 'deny_1', type: 'action', template: 'deny', params: {} },
    ],
    edges: [
        { from: 'trigger', to: 'amount_threshold_1' },
        { from: 'amount_threshold_1', to: 'approve_1', branch: 'true' },
        { from: 'amount_threshold_1', to: 'deny_1', branch: 'false' },
    ],
    ...flow,
});

export const generateMpcWorkspacePolicy = (
    policy?: Partial<IMpcWorkspacePolicy>,
): IMpcWorkspacePolicy => ({
    id: 'policy-1',
    workspaceId: 'ws_user-1',
    name: 'Small transfers',
    flow: generateMpcPolicyFlow(),
    enabled: true,
    lastCheck: {
        at: '2026-01-01T00:00:00.000Z',
        consistent: true,
        issues: [],
    },
    createdBy: 'user-1',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...policy,
});

export const generateMpcWorkspacePolicyVerdict = (
    verdict?: Partial<IMpcWorkspacePolicyVerdict>,
): IMpcWorkspacePolicyVerdict => ({
    policyId: 'policy-1',
    policyName: 'Small transfers',
    decision: 'approve',
    params: {},
    isDefaultDeny: false,
    path: ['trigger', 'amount_threshold_1', 'approve_1'],
    reason: 'Policy "Small transfers" approves the transaction.',
    ...verdict,
});

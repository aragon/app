import 'server-only';
import type {
    IMpcAddWorkspaceMemberParams,
    IMpcCreateWorkspaceParams,
    IMpcPolicyCheckResult,
    IMpcPolicyFlow,
    IMpcSaveWorkspacePolicyParams,
    IMpcSystem,
    IMpcUpdateWorkspacePolicyParams,
    IMpcUser,
    IMpcWorkspace,
    IMpcWorkspaceMember,
    IMpcWorkspacePolicy,
} from '@/modules/mpc/api/mpcService/domain';
import { MpcApiError } from './mpcApiError';
import { mpcPolicyEngine } from './mpcPolicyEngine';
import {
    expandPolicyReferences,
    referencedPolicyIds,
} from './mpcPolicyReferences';
import { getMpcStore, type IMpcStoreData, nowIso } from './mpcStore';
import { serverCrypto } from './serverCrypto';

/**
 * Workspaces module of the POC co-signer: workspaces (created explicitly by accounts, with members), the
 * systems they group and the workspace-level transaction policies (decision-tree flows authored in the policy
 * editor).
 *
 * Saving a policy runs the formal check on the policy engine first: a flow that is not consistent (dead
 * branches / collisions) is never persisted, so every stored policy carries a passing check. Policies may
 * reference other policies of the workspace as blocks; references are inlined before the engine sees the flow.
 */

const MAX_POLICIES_PER_WORKSPACE = 50;
const MAX_WORKSPACES_PER_USER = 20;
const MAX_WORKSPACE_MEMBERS = 50;

export const findWorkspaceRecord = (
    workspaceId: string,
): IMpcWorkspace | undefined =>
    getMpcStore()
        .read()
        .workspaces.find((item) => item.id === workspaceId);

const requireWorkspaceRecord = (
    data: IMpcStoreData,
    workspaceId: string,
): IMpcWorkspace => {
    const workspace = data.workspaces.find((item) => item.id === workspaceId);

    if (workspace == null) {
        throw new MpcApiError('not_found', 'Workspace not found.');
    }

    return workspace;
};

export const isWorkspaceMember = (
    workspace: IMpcWorkspace,
    userId: string,
): boolean =>
    workspace.ownerId === userId ||
    workspace.members.some((member) => member.userId === userId);

/**
 * Workspace the user belongs to (owner or member), 404 otherwise (existence is not leaked).
 */
export const requireWorkspaceMembership = (
    data: IMpcStoreData,
    workspaceId: string,
    userId: string,
): IMpcWorkspace => {
    const workspace = data.workspaces.find((item) => item.id === workspaceId);

    if (workspace == null || !isWorkspaceMember(workspace, userId)) {
        throw new MpcApiError('not_found', 'Workspace not found.');
    }

    return workspace;
};

/**
 * A user can read a workspace when they are one of its members or a member of any of its systems (legacy
 * systems whose members were never added to the workspace).
 */
export const canReadWorkspace = (
    data: IMpcStoreData,
    workspace: IMpcWorkspace,
    userId: string,
): boolean =>
    isWorkspaceMember(workspace, userId) ||
    data.systems.some(
        (system) =>
            system.workspaceId === workspace.id &&
            system.status !== 'deleted' &&
            system.members.some((member) => member.userId === userId),
    );

export const listWorkspaces = (userId: string): IMpcWorkspace[] => {
    const data = getMpcStore().read();

    return data.workspaces
        .filter((workspace) => canReadWorkspace(data, workspace, userId))
        .sort((a, b) => {
            if (a.ownerId === userId && b.ownerId !== userId) {
                return -1;
            }

            if (b.ownerId === userId && a.ownerId !== userId) {
                return 1;
            }

            return a.createdAt.localeCompare(b.createdAt);
        });
};

export const createWorkspace = (
    user: IMpcUser,
    params: IMpcCreateWorkspaceParams,
): IMpcWorkspace =>
    getMpcStore().update((data) => {
        const ownedCount = data.workspaces.filter(
            (item) => item.ownerId === user.id,
        ).length;

        if (ownedCount >= MAX_WORKSPACES_PER_USER) {
            throw new MpcApiError(
                'conflict',
                'Too many workspaces for this user.',
            );
        }

        const now = nowIso();
        const workspace: IMpcWorkspace = {
            id: serverCrypto.randomId(),
            name: params.name,
            ownerId: user.id,
            isDefault: false,
            members: [
                {
                    userId: user.id,
                    username: user.username,
                    role: 'owner',
                    addedAt: now,
                },
            ],
            createdAt: now,
            updatedAt: now,
        };
        data.workspaces.push(workspace);

        return workspace;
    });

export const listWorkspaceMembers = (
    workspaceId: string,
): IMpcWorkspaceMember[] => findWorkspaceRecord(workspaceId)?.members ?? [];

export const addWorkspaceMember = (
    workspaceId: string,
    params: IMpcAddWorkspaceMemberParams,
): IMpcWorkspaceMember[] =>
    getMpcStore().update((data) => {
        const workspace = requireWorkspaceRecord(data, workspaceId);
        const user = data.users.find(
            (item) =>
                item.username.toLowerCase() === params.username.toLowerCase(),
        );

        if (user == null) {
            throw new MpcApiError('not_found', 'User not found.');
        }

        if (workspace.members.some((member) => member.userId === user.id)) {
            throw new MpcApiError(
                'conflict',
                'The user is already a member of the workspace.',
            );
        }

        if (workspace.members.length >= MAX_WORKSPACE_MEMBERS) {
            throw new MpcApiError(
                'conflict',
                'Too many members in this workspace.',
            );
        }

        workspace.members.push({
            userId: user.id,
            username: user.username,
            role: 'member',
            addedAt: nowIso(),
        });
        workspace.updatedAt = nowIso();

        return workspace.members;
    });

export const removeWorkspaceMember = (
    workspaceId: string,
    userId: string,
): IMpcWorkspaceMember[] =>
    getMpcStore().update((data) => {
        const workspace = requireWorkspaceRecord(data, workspaceId);
        const member = workspace.members.find((item) => item.userId === userId);

        if (member == null) {
            throw new MpcApiError('not_found', 'Member not found.');
        }

        if (member.role === 'owner') {
            throw new MpcApiError(
                'conflict',
                'The workspace owner cannot be removed.',
            );
        }

        workspace.members = workspace.members.filter(
            (item) => item.userId !== userId,
        );
        workspace.updatedAt = nowIso();

        return workspace.members;
    });

/**
 * Systems of a workspace (public view, server-only fields stripped), newest first.
 */
export const listWorkspaceSystems = (workspaceId: string): IMpcSystem[] =>
    getMpcStore()
        .read()
        .systems.filter(
            (item) =>
                item.workspaceId === workspaceId && item.status !== 'deleted',
        )
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map(
            ({ serverShare: _serverShare, deletedAt: _deletedAt, ...rest }) =>
                rest,
        );

export const listWorkspacePolicies = (
    workspaceId: string,
): IMpcWorkspacePolicy[] =>
    getMpcStore()
        .read()
        .workspacePolicies.filter((item) => item.workspaceId === workspaceId)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

export const findWorkspacePolicy = (
    workspaceId: string,
    policyId: string,
): IMpcWorkspacePolicy | undefined =>
    getMpcStore()
        .read()
        .workspacePolicies.find(
            (item) => item.id === policyId && item.workspaceId === workspaceId,
        );

const requirePolicyRecord = (
    data: IMpcStoreData,
    workspaceId: string,
    policyId: string,
): IMpcWorkspacePolicy => {
    const policy = data.workspacePolicies.find(
        (item) => item.id === policyId && item.workspaceId === workspaceId,
    );

    if (policy == null) {
        throw new MpcApiError('not_found', 'Policy not found.');
    }

    return policy;
};

/**
 * Enabled policies that apply to a system (all the enabled policies of its workspace).
 */
export const listEnabledPoliciesForSystem = (
    data: IMpcStoreData,
    system: Pick<IMpcSystem, 'workspaceId'>,
): IMpcWorkspacePolicy[] =>
    data.workspacePolicies
        .filter(
            (item) => item.workspaceId === system.workspaceId && item.enabled,
        )
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

const countErrors = (result: IMpcPolicyCheckResult): number =>
    result.issues.filter((issue) => issue.severity === 'error').length;

/**
 * Inlines the policy references of the flow and runs the formal check on the engine; refuses flows that are
 * not consistent. Warnings (gaps falling into the default deny) are allowed: deny is safe.
 */
const checkFlowOrThrow = async (
    data: IMpcStoreData,
    workspaceId: string,
    flow: IMpcPolicyFlow,
    policyId?: string,
): Promise<IMpcWorkspacePolicy['lastCheck']> => {
    const expanded = expandPolicyReferences(data, workspaceId, flow, policyId);
    const result = await mpcPolicyEngine.check(expanded.flow);

    if (!result.consistent) {
        const errors = countErrors(result);

        throw new MpcApiError(
            'policy_check_failed',
            `The policy was not saved: the formal check found ${errors.toString()} error(s) (dead branches or collisions). Fix them in the editor and check again.`,
        );
    }

    return { ...expanded.mapCheckResult(result), at: nowIso() };
};

export const createWorkspacePolicy = async (
    workspace: IMpcWorkspace,
    actor: IMpcUser,
    params: IMpcSaveWorkspacePolicyParams,
): Promise<IMpcWorkspacePolicy> => {
    const existingCount = listWorkspacePolicies(workspace.id).length;

    if (existingCount >= MAX_POLICIES_PER_WORKSPACE) {
        throw new MpcApiError(
            'conflict',
            'Too many policies in this workspace.',
        );
    }

    const lastCheck = await checkFlowOrThrow(
        getMpcStore().read(),
        workspace.id,
        params.flow,
    );

    return getMpcStore().update((data) => {
        requireWorkspaceRecord(data, workspace.id);
        const now = nowIso();
        const policy: IMpcWorkspacePolicy = {
            id: serverCrypto.randomId(),
            workspaceId: workspace.id,
            name: params.name,
            flow: params.flow,
            enabled: params.enabled ?? true,
            lastCheck,
            createdBy: actor.id,
            createdAt: now,
            updatedAt: now,
        };
        data.workspacePolicies.push(policy);

        return policy;
    });
};

export const updateWorkspacePolicy = async (
    workspace: IMpcWorkspace,
    policyId: string,
    params: IMpcUpdateWorkspacePolicyParams,
): Promise<IMpcWorkspacePolicy> => {
    // Re-run the check only when the flow changes (name / enabled toggles are cheap and offline).
    const lastCheck =
        params.flow != null
            ? await checkFlowOrThrow(
                  getMpcStore().read(),
                  workspace.id,
                  params.flow,
                  policyId,
              )
            : undefined;

    return getMpcStore().update((data) => {
        const policy = requirePolicyRecord(data, workspace.id, policyId);

        if (params.name != null) {
            policy.name = params.name;
        }

        if (params.flow != null && lastCheck != null) {
            policy.flow = params.flow;
            policy.lastCheck = lastCheck;
        }

        if (params.enabled != null) {
            policy.enabled = params.enabled;
        }

        policy.updatedAt = nowIso();

        return policy;
    });
};

export const deleteWorkspacePolicy = (
    workspace: IMpcWorkspace,
    policyId: string,
): void =>
    getMpcStore().update((data) => {
        requirePolicyRecord(data, workspace.id, policyId);
        const referrers = data.workspacePolicies.filter(
            (item) =>
                item.workspaceId === workspace.id &&
                item.id !== policyId &&
                referencedPolicyIds(item.flow).includes(policyId),
        );

        if (referrers.length > 0) {
            throw new MpcApiError(
                'conflict',
                `The policy is used as a block by: ${referrers.map((item) => item.name).join(', ')}. Remove those blocks first.`,
            );
        }

        data.workspacePolicies = data.workspacePolicies.filter(
            (item) => item.id !== policyId,
        );
    });

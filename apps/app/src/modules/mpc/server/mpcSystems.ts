import 'server-only';
import type {
    IMpcAddMemberParams,
    IMpcCreateSystemParams,
    IMpcMember,
    IMpcRegisterKeyParams,
    IMpcReshareParams,
    IMpcServerShareParams,
    IMpcServerSharePayload,
    IMpcSystem,
    IMpcUpdatePolicyParams,
    IMpcUpdateSystemParams,
    IMpcUser,
} from '@/modules/mpc/api/mpcService/domain';
import { appendActivity } from './mpcActivity';
import { MpcApiError } from './mpcApiError';
import { defaultMpcPolicy } from './mpcPolicy';
import { markRequestReleased } from './mpcSignRequests';
import {
    getMpcStore,
    type IMpcStoreData,
    type IMpcStoreServerShare,
    type IMpcStoreSystem,
    nowIso,
} from './mpcStore';
import { requireWorkspaceMembership } from './mpcWorkspaces';
import { serverCrypto } from './serverCrypto';

/**
 * Systems module of the POC co-signer: CRUD, key registration, server share custody, members and policy.
 * The server share is encrypted at rest and only ever leaves through releaseServerShare.
 */

const MAX_SYSTEMS_PER_USER = 50;

export const findSystemRecord = (
    systemId: string,
): IMpcStoreSystem | undefined =>
    getMpcStore()
        .read()
        .systems.find(
            (item) => item.id === systemId && item.status !== 'deleted',
        );

const requireSystemRecord = (
    data: IMpcStoreData,
    systemId: string,
): IMpcStoreSystem => {
    const system = data.systems.find(
        (item) => item.id === systemId && item.status !== 'deleted',
    );

    if (system == null) {
        throw new MpcApiError('not_found', 'System not found.');
    }

    return system;
};

/**
 * Strips server-only fields (encrypted share, soft delete metadata).
 */
export const toPublicSystem = (system: IMpcStoreSystem): IMpcSystem => {
    const {
        serverShare: _serverShare,
        deletedAt: _deletedAt,
        ...rest
    } = system;

    return rest;
};

const encryptShare = (share: IMpcServerSharePayload): IMpcStoreServerShare => {
    const encrypted = serverCrypto.encrypt(
        JSON.stringify({ index: share.index, value: share.value }),
    );

    return { ...encrypted, epoch: share.epoch };
};

const decryptShare = (share: IMpcStoreServerShare): IMpcServerSharePayload => {
    const decrypted = JSON.parse(serverCrypto.decrypt(share)) as {
        index: number;
        value: IMpcServerSharePayload['value'];
    };

    return {
        index: decrypted.index,
        value: decrypted.value,
        epoch: share.epoch,
    };
};

export const listSystems = (userId: string): IMpcSystem[] =>
    getMpcStore()
        .read()
        .systems.filter(
            (item) =>
                item.status !== 'deleted' &&
                item.members.some((member) => member.userId === userId),
        )
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map(toPublicSystem);

export const createSystem = (
    user: IMpcUser,
    params: IMpcCreateSystemParams,
): IMpcSystem =>
    getMpcStore().update((data) => {
        const ownedCount = data.systems.filter(
            (item) => item.createdBy === user.id && item.status !== 'deleted',
        ).length;

        if (ownedCount >= MAX_SYSTEMS_PER_USER) {
            throw new MpcApiError(
                'conflict',
                'Too many systems for this user.',
            );
        }

        const now = nowIso();
        const system: IMpcStoreSystem = {
            id: serverCrypto.randomId(),
            name: params.name,
            description: params.description,
            // Systems live in a workspace: its policies apply to every request.
            workspaceId: requireWorkspaceMembership(
                data,
                params.workspaceId,
                user.id,
            ).id,
            status: 'initializing',
            providerId: params.providerId,
            chainIds: params.chainIds,
            epoch: 0,
            recoveryAcknowledged: false,
            policy: defaultMpcPolicy(params.chainIds),
            members: [
                {
                    userId: user.id,
                    username: user.username,
                    role: 'owner',
                    addedAt: now,
                },
            ],
            createdBy: user.id,
            createdAt: now,
            updatedAt: now,
        };

        data.systems.push(system);
        appendActivity(data, {
            systemId: system.id,
            actor: user.username,
            type: 'system_created',
            data: { name: system.name, providerId: system.providerId },
        });

        return toPublicSystem(system);
    });

export const updateSystem = (
    systemId: string,
    params: IMpcUpdateSystemParams,
): IMpcSystem =>
    getMpcStore().update((data) => {
        const system = requireSystemRecord(data, systemId);

        if (params.name != null) {
            system.name = params.name;
        }

        if (params.description != null) {
            system.description =
                params.description === '' ? undefined : params.description;
        }

        system.updatedAt = nowIso();

        return toPublicSystem(system);
    });

export const deleteSystem = (systemId: string, actor: IMpcUser): void =>
    getMpcStore().update((data) => {
        const system = requireSystemRecord(data, systemId);
        const now = nowIso();
        system.status = 'deleted';
        system.deletedAt = now;
        system.updatedAt = now;
        // The encrypted server share is dropped on delete: the key becomes unusable through Aragon.
        system.serverShare = undefined;

        appendActivity(data, {
            systemId,
            actor: actor.username,
            type: 'system_deleted',
        });
    });

export const registerKey = (
    systemId: string,
    actor: IMpcUser,
    params: IMpcRegisterKeyParams,
): IMpcSystem =>
    getMpcStore().update((data) => {
        const system = requireSystemRecord(data, systemId);

        if (system.createdBy !== actor.id) {
            throw new MpcApiError(
                'forbidden',
                'Only the creator can register the key.',
            );
        }

        if (system.status !== 'initializing' || system.serverShare != null) {
            throw new MpcApiError('conflict', 'The system already has a key.');
        }

        system.address = params.address;
        system.publicKey = params.publicKey;
        system.serverShare = encryptShare(params.serverShare);
        system.epoch = 1;
        system.status = 'active';
        system.updatedAt = nowIso();

        appendActivity(data, {
            systemId,
            actor: actor.username,
            type: 'key_registered',
            data: { address: params.address, epoch: 1 },
        });

        return toPublicSystem(system);
    });

export const acknowledgeRecovery = (
    systemId: string,
    actor: IMpcUser,
): IMpcSystem =>
    getMpcStore().update((data) => {
        const system = requireSystemRecord(data, systemId);
        system.recoveryAcknowledged = true;
        system.updatedAt = nowIso();

        appendActivity(data, {
            systemId,
            actor: actor.username,
            type: 'recovery_acknowledged',
        });

        return toPublicSystem(system);
    });

/**
 * Releases the (decrypted) server share for an authorized purpose. Authorization rules:
 * - sign: the request must be approved (or released, when the same caller retries) and the caller must be the
 *   requester or an owner; the request transitions to "released".
 * - reshare / recover: owner only.
 * - export is never served: exporting the key requires the recovery share on the client (releasing B to a single
 *   owner would expose the full key without co-approval).
 * The release is always recorded in the activity log (never including the share).
 */
export const releaseServerShare = (
    systemId: string,
    actor: IMpcUser,
    member: IMpcMember,
    params: IMpcServerShareParams,
): IMpcServerSharePayload =>
    getMpcStore().update((data) => {
        const system = requireSystemRecord(data, systemId);

        if (system.status !== 'active' || system.serverShare == null) {
            throw new MpcApiError('conflict', 'The system has no active key.');
        }

        const activityData: Record<string, unknown> = {
            purpose: params.purpose,
            epoch: system.epoch,
        };

        if (params.purpose === 'export') {
            throw new MpcApiError(
                'forbidden',
                'The server share is never released for export: use the recovery share.',
            );
        }

        if (params.purpose === 'sign') {
            const request = markRequestReleased(
                data,
                systemId,
                params.requestId!,
                actor,
                member,
            );
            activityData.requestId = request.id;
        } else if (member.role !== 'owner') {
            throw new MpcApiError(
                'forbidden',
                `Purpose "${params.purpose}" requires the owner role.`,
            );
        }

        appendActivity(data, {
            systemId,
            actor: actor.username,
            type: 'share_released',
            data: activityData,
        });

        return decryptShare(system.serverShare);
    });

export const reshareSystem = (
    systemId: string,
    actor: IMpcUser,
    params: IMpcReshareParams,
): IMpcSystem =>
    getMpcStore().update((data) => {
        const system = requireSystemRecord(data, systemId);

        if (system.status !== 'active') {
            throw new MpcApiError('conflict', 'The system has no active key.');
        }

        if (params.serverShare.epoch !== system.epoch + 1) {
            throw new MpcApiError(
                'conflict',
                `Invalid epoch: expected ${(system.epoch + 1).toString()}, received ${params.serverShare.epoch.toString()}.`,
            );
        }

        // The previous share is overwritten and therefore invalidated.
        system.serverShare = encryptShare(params.serverShare);
        system.epoch = params.serverShare.epoch;
        system.updatedAt = nowIso();

        // Recovery share changed: the user must acknowledge the new one.
        system.recoveryAcknowledged = false;

        appendActivity(data, {
            systemId,
            actor: actor.username,
            type:
                params.mode === 'recover'
                    ? 'recovery_completed'
                    : 'reshare_completed',
            data: { epoch: system.epoch },
        });

        return toPublicSystem(system);
    });

export const listMembers = (systemId: string): IMpcMember[] => {
    const system = findSystemRecord(systemId);

    if (system == null) {
        throw new MpcApiError('not_found', 'System not found.');
    }

    return system.members;
};

export const addMember = (
    systemId: string,
    actor: IMpcUser,
    params: IMpcAddMemberParams,
): IMpcMember[] =>
    getMpcStore().update((data) => {
        const system = requireSystemRecord(data, systemId);
        const user = data.users.find(
            (item) =>
                item.username.toLowerCase() === params.username.toLowerCase(),
        );

        if (user == null) {
            throw new MpcApiError('not_found', 'User not found.');
        }

        const existing = system.members.find((item) => item.userId === user.id);

        if (existing != null) {
            throw new MpcApiError('conflict', 'User is already a member.');
        }

        if (system.members.length >= 50) {
            throw new MpcApiError('conflict', 'Too many members.');
        }

        system.members.push({
            userId: user.id,
            username: user.username,
            role: params.role,
            addedAt: nowIso(),
        });
        system.updatedAt = nowIso();

        appendActivity(data, {
            systemId,
            actor: actor.username,
            type: 'member_added',
            data: { username: user.username, role: params.role },
        });

        return system.members;
    });

export const removeMember = (
    systemId: string,
    actor: IMpcUser,
    userId: string,
): IMpcMember[] =>
    getMpcStore().update((data) => {
        const system = requireSystemRecord(data, systemId);
        const member = system.members.find((item) => item.userId === userId);

        if (member == null) {
            throw new MpcApiError('not_found', 'Member not found.');
        }

        const ownerCount = system.members.filter(
            (item) => item.role === 'owner',
        ).length;

        if (member.role === 'owner' && ownerCount <= 1) {
            throw new MpcApiError(
                'conflict',
                'The last owner of the system cannot be removed.',
            );
        }

        system.members = system.members.filter(
            (item) => item.userId !== userId,
        );
        system.updatedAt = nowIso();

        appendActivity(data, {
            systemId,
            actor: actor.username,
            type: 'member_removed',
            data: { username: member.username, role: member.role },
        });

        return system.members;
    });

export const updatePolicy = (
    systemId: string,
    actor: IMpcUser,
    policy: IMpcUpdatePolicyParams,
): IMpcSystem =>
    getMpcStore().update((data) => {
        const system = requireSystemRecord(data, systemId);
        system.policy = policy;
        system.updatedAt = nowIso();

        appendActivity(data, {
            systemId,
            actor: actor.username,
            type: 'policy_updated',
            data: { policy },
        });

        return toPublicSystem(system);
    });

export const authorizeExport = (systemId: string, actor: IMpcUser): void =>
    getMpcStore().update((data) => {
        requireSystemRecord(data, systemId);

        appendActivity(data, {
            systemId,
            actor: actor.username,
            type: 'key_exported',
        });
    });

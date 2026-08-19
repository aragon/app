import 'server-only';
import type {
    IMpcActivityResponse,
    IMpcBalanceResponse,
    IMpcMembersResponse,
    IMpcServerShareResponse,
    IMpcSimulateResponse,
    IMpcSystemResponse,
    IMpcSystemsResponse,
} from '@/modules/mpc/api/mpcService/domain';
import { listActivity } from './mpcActivity';
import {
    type IMpcSystemRouteParams,
    jsonOk,
    noContent,
    withSession,
    withSystemRole,
} from './mpcApiUtils';
import { mpcChain } from './mpcChain';
import {
    readJsonBody,
    validateAddMemberParams,
    validateCreateSystemParams,
    validatePolicyParams,
    validateRegisterKeyParams,
    validateReshareParams,
    validateServerShareParams,
    validateSimulateParams,
    validateUpdateSystemParams,
} from './mpcRequestValidation';
import {
    acknowledgeRecovery,
    addMember,
    authorizeExport,
    createSystem,
    deleteSystem,
    listMembers,
    listSystems,
    registerKey,
    releaseServerShare,
    removeMember,
    reshareSystem,
    toPublicSystem,
    updatePolicy,
    updateSystem,
} from './mpcSystems';

/**
 * Route handlers for /api/mpc/systems/** (except sign requests, see mpcRequestHandlers).
 */

interface IMemberRouteParams extends IMpcSystemRouteParams {
    userId: string;
}

// GET /api/mpc/systems
export const handleListSystems = withSession<Record<string, never>>((ctx) =>
    Promise.resolve(jsonOk<IMpcSystemsResponse>(listSystems(ctx.user.id))),
);

// POST /api/mpc/systems
export const handleCreateSystem = withSession<Record<string, never>>(
    async (ctx) => {
        const params = validateCreateSystemParams(
            await readJsonBody(ctx.request),
        );

        return jsonOk<IMpcSystemResponse>(createSystem(ctx.user, params), {
            status: 201,
        });
    },
);

// GET /api/mpc/systems/[systemId]
export const handleGetSystem = withSystemRole<IMpcSystemRouteParams>(
    'member',
    (ctx) =>
        Promise.resolve(jsonOk<IMpcSystemResponse>(toPublicSystem(ctx.system))),
);

// PATCH /api/mpc/systems/[systemId]
export const handleUpdateSystem = withSystemRole<IMpcSystemRouteParams>(
    ['owner'],
    async (ctx) => {
        const params = validateUpdateSystemParams(
            await readJsonBody(ctx.request),
        );

        return jsonOk<IMpcSystemResponse>(updateSystem(ctx.system.id, params));
    },
);

// DELETE /api/mpc/systems/[systemId]
export const handleDeleteSystem = withSystemRole<IMpcSystemRouteParams>(
    ['owner'],
    (ctx) => {
        deleteSystem(ctx.system.id, ctx.user);

        return Promise.resolve(noContent());
    },
);

// POST /api/mpc/systems/[systemId]/key
export const handleRegisterKey = withSystemRole<IMpcSystemRouteParams>(
    ['owner'],
    async (ctx) => {
        const params = validateRegisterKeyParams(
            await readJsonBody(ctx.request),
        );

        return jsonOk<IMpcSystemResponse>(
            registerKey(ctx.system.id, ctx.user, params),
        );
    },
);

// POST /api/mpc/systems/[systemId]/key/acknowledge-recovery
export const handleAcknowledgeRecovery = withSystemRole<IMpcSystemRouteParams>(
    ['owner'],
    (ctx) =>
        Promise.resolve(
            jsonOk<IMpcSystemResponse>(
                acknowledgeRecovery(ctx.system.id, ctx.user),
            ),
        ),
);

// POST /api/mpc/systems/[systemId]/server-share
export const handleServerShare = withSystemRole<IMpcSystemRouteParams>(
    ['owner', 'approver'],
    async (ctx) => {
        const params = validateServerShareParams(
            await readJsonBody(ctx.request),
        );
        const serverShare = releaseServerShare(
            ctx.system.id,
            ctx.user,
            ctx.member,
            params,
        );

        return jsonOk<IMpcServerShareResponse>({ serverShare });
    },
);

// POST /api/mpc/systems/[systemId]/reshare
export const handleReshare = withSystemRole<IMpcSystemRouteParams>(
    ['owner'],
    async (ctx) => {
        const params = validateReshareParams(await readJsonBody(ctx.request));

        return jsonOk<IMpcSystemResponse>(
            reshareSystem(ctx.system.id, ctx.user, params),
        );
    },
);

// GET /api/mpc/systems/[systemId]/members
export const handleListMembers = withSystemRole<IMpcSystemRouteParams>(
    'member',
    (ctx) =>
        Promise.resolve(
            jsonOk<IMpcMembersResponse>(listMembers(ctx.system.id)),
        ),
);

// POST /api/mpc/systems/[systemId]/members
export const handleAddMember = withSystemRole<IMpcSystemRouteParams>(
    ['owner'],
    async (ctx) => {
        const params = validateAddMemberParams(await readJsonBody(ctx.request));

        return jsonOk<IMpcMembersResponse>(
            addMember(ctx.system.id, ctx.user, params),
        );
    },
);

// DELETE /api/mpc/systems/[systemId]/members/[userId]
export const handleRemoveMember = withSystemRole<IMemberRouteParams>(
    ['owner'],
    (ctx, params) =>
        Promise.resolve(
            jsonOk<IMpcMembersResponse>(
                removeMember(ctx.system.id, ctx.user, params.userId),
            ),
        ),
);

// PUT /api/mpc/systems/[systemId]/policy
export const handleUpdatePolicy = withSystemRole<IMpcSystemRouteParams>(
    ['owner'],
    async (ctx) => {
        const policy = validatePolicyParams(await readJsonBody(ctx.request));

        return jsonOk<IMpcSystemResponse>(
            updatePolicy(ctx.system.id, ctx.user, policy),
        );
    },
);

// GET /api/mpc/systems/[systemId]/activity
export const handleListActivity = withSystemRole<IMpcSystemRouteParams>(
    'member',
    (ctx) =>
        Promise.resolve(
            jsonOk<IMpcActivityResponse>(listActivity(ctx.system.id)),
        ),
);

// GET /api/mpc/systems/[systemId]/balance
export const handleGetBalance = withSystemRole<IMpcSystemRouteParams>(
    'member',
    async (ctx) => {
        const { address } = ctx.system;

        if (address == null) {
            return jsonOk<IMpcBalanceResponse>({
                chainId: mpcChain.getClient().chain!.id,
                address: '0x0000000000000000000000000000000000000000',
                balanceWei: '0',
                nonce: 0,
            });
        }

        const [balance, nonce] = await Promise.all([
            mpcChain.getBalance(address),
            mpcChain.getTransactionCount(address),
        ]);

        return jsonOk<IMpcBalanceResponse>({
            chainId: mpcChain.getClient().chain!.id,
            address,
            balanceWei: balance.toString(),
            nonce,
        });
    },
);

// POST /api/mpc/systems/[systemId]/simulate
export const handleSimulate = withSystemRole<IMpcSystemRouteParams>(
    'member',
    async (ctx) => {
        const params = validateSimulateParams(await readJsonBody(ctx.request));
        mpcChain.assertSupportedChain(params.chainId);

        if (ctx.system.address == null) {
            return jsonOk<IMpcSimulateResponse>({
                ok: false,
                error: 'The system has no key yet.',
            });
        }

        const result = await mpcChain.simulate({
            from: ctx.system.address,
            to: params.to,
            value: BigInt(params.valueWei),
            data: params.data,
        });

        return jsonOk<IMpcSimulateResponse>(result);
    },
);

// POST /api/mpc/systems/[systemId]/export-authorization
export const handleExportAuthorization = withSystemRole<IMpcSystemRouteParams>(
    ['owner'],
    (ctx) => {
        authorizeExport(ctx.system.id, ctx.user);

        return Promise.resolve(noContent());
    },
);

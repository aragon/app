import 'server-only';
import type {
    IMpcPrepareTransactionResponse,
    IMpcRequestResponse,
    IMpcRequestsResponse,
} from '@/modules/mpc/api/mpcService/domain';
import {
    type IMpcSystemRouteParams,
    jsonOk,
    withSystemRole,
} from './mpcApiUtils';
import {
    readJsonBody,
    validateCompleteRequestParams,
    validateCreateRequestParams,
    validateUpdateRequestParams,
} from './mpcRequestValidation';
import {
    approveRequest,
    completeRequest,
    createRequest,
    listRequests,
    prepareTransaction,
    rejectRequest,
    updateRequest,
} from './mpcSignRequests';

/**
 * Route handlers for /api/mpc/systems/[systemId]/requests/**.
 */

interface IRequestRouteParams extends IMpcSystemRouteParams {
    requestId: string;
}

// GET /api/mpc/systems/[systemId]/requests
export const handleListRequests = withSystemRole<IMpcSystemRouteParams>(
    'member',
    (ctx) =>
        Promise.resolve(
            jsonOk<IMpcRequestsResponse>(listRequests(ctx.system.id)),
        ),
);

// POST /api/mpc/systems/[systemId]/requests
export const handleCreateRequest = withSystemRole<IMpcSystemRouteParams>(
    ['owner', 'approver'],
    async (ctx) => {
        const params = validateCreateRequestParams(
            await readJsonBody(ctx.request),
        );

        return jsonOk<IMpcRequestResponse>(
            await createRequest(ctx.system, ctx.user, params),
            { status: params.dryRun ? 200 : 201 },
        );
    },
);

// PUT /api/mpc/systems/[systemId]/requests/[requestId]
export const handleUpdateRequest = withSystemRole<IRequestRouteParams>(
    ['owner', 'approver'],
    async (ctx, params) => {
        const body = validateUpdateRequestParams(
            await readJsonBody(ctx.request),
        );

        return jsonOk<IMpcRequestResponse>(
            await updateRequest(
                ctx.system,
                ctx.user,
                ctx.member,
                params.requestId,
                body,
            ),
        );
    },
);

// POST /api/mpc/systems/[systemId]/requests/[requestId]/approve
export const handleApproveRequest = withSystemRole<IRequestRouteParams>(
    ['owner', 'approver'],
    (ctx, params) =>
        Promise.resolve(
            jsonOk<IMpcRequestResponse>(
                approveRequest(ctx.system.id, params.requestId, ctx.user),
            ),
        ),
);

// POST /api/mpc/systems/[systemId]/requests/[requestId]/reject
export const handleRejectRequest = withSystemRole<IRequestRouteParams>(
    ['owner', 'approver'],
    (ctx, params) =>
        Promise.resolve(
            jsonOk<IMpcRequestResponse>(
                rejectRequest(ctx.system.id, params.requestId, ctx.user),
            ),
        ),
);

// POST /api/mpc/systems/[systemId]/requests/[requestId]/prepare
export const handlePrepareTransaction = withSystemRole<IRequestRouteParams>(
    ['owner', 'approver'],
    async (ctx, params) =>
        jsonOk<IMpcPrepareTransactionResponse>(
            await prepareTransaction(
                ctx.system,
                params.requestId,
                ctx.user,
                ctx.member,
            ),
        ),
);

// POST /api/mpc/systems/[systemId]/requests/[requestId]/complete
export const handleCompleteRequest = withSystemRole<IRequestRouteParams>(
    ['owner', 'approver'],
    async (ctx, params) => {
        const body = validateCompleteRequestParams(
            await readJsonBody(ctx.request),
        );

        return jsonOk<IMpcRequestResponse>(
            await completeRequest(
                ctx.system,
                params.requestId,
                ctx.user,
                ctx.member,
                body,
            ),
        );
    },
);

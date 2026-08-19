import 'server-only';
import { type NextRequest, NextResponse } from 'next/server';
import type {
    IMpcApiError,
    IMpcMember,
    IMpcUser,
    MpcMemberRole,
} from '@/modules/mpc/api/mpcService/domain';
import { featureFlags } from '@/shared/featureFlags';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';
import { MpcApiError, type MpcApiErrorCode } from './mpcApiError';
import { type IMpcResolvedSession, mpcAuth } from './mpcAuth';
import { assertMutationRequest } from './mpcRequestValidation';
import type { IMpcStoreSystem } from './mpcStore';
import { findSystemRecord } from './mpcSystems';

/**
 * Route handler helpers: typed JSON responses (Cache-Control: no-store) and wrappers resolving the session and
 * the caller role inside a system.
 */

const NO_STORE_HEADERS = { 'Cache-Control': 'no-store' };

export const jsonOk = <TData>(
    data: TData,
    init?: { status?: number; headers?: Record<string, string> },
): NextResponse<TData> =>
    NextResponse.json(data, {
        status: init?.status ?? 200,
        headers: { ...NO_STORE_HEADERS, ...init?.headers },
    });

export const noContent = (headers?: Record<string, string>): NextResponse =>
    new NextResponse(null, {
        status: 204,
        headers: { ...NO_STORE_HEADERS, ...headers },
    });

export const jsonError = (
    status: number,
    code: MpcApiErrorCode,
    message: string,
    headers?: Record<string, string>,
): NextResponse<IMpcApiError> =>
    NextResponse.json(
        { error: { code, message } },
        { status, headers: { ...NO_STORE_HEADERS, ...headers } },
    );

/**
 * Maps any thrown error to an IMpcApiError response (unexpected errors are logged and returned as "internal").
 */
export const handleApiError = (
    error: unknown,
    context: Record<string, unknown> = {},
): NextResponse<IMpcApiError> => {
    if (error instanceof MpcApiError) {
        return jsonError(error.status, error.code, error.message);
    }

    monitoringUtils.logError(error, {
        context: { errorType: 'mpc_api_error', ...context },
    });

    return jsonError(500, 'internal', 'Unexpected error.');
};

export interface IMpcRouteContext<TParams> {
    params: Promise<TParams>;
}

export type MpcRouteHandler<TParams> = (
    request: NextRequest,
    context: IMpcRouteContext<TParams>,
) => Promise<Response>;

export interface IMpcSessionContext {
    request: NextRequest;
    user: IMpcUser;
    session: IMpcResolvedSession['session'];
}

export interface IMpcSystemContext extends IMpcSessionContext {
    system: IMpcStoreSystem;
    member: IMpcMember;
}

export interface IMpcSystemRouteParams {
    systemId: string;
}

const isMutation = (request: NextRequest): boolean =>
    request.method !== 'GET' && request.method !== 'HEAD';

/**
 * The whole /api/mpc surface is hidden (404) when the mpcSystems feature flag is disabled, mirroring the pages.
 */
const assertFeatureEnabled = async (): Promise<void> => {
    const isEnabled = await featureFlags.isEnabled('mpcSystems');

    if (!isEnabled) {
        throw new MpcApiError('not_found', 'Not found.');
    }
};

/**
 * Wraps a route handler with error mapping only (anonymous endpoints). Mutations still require the CSRF checks.
 */
export const withApi =
    <TParams>(
        handler: (request: NextRequest, params: TParams) => Promise<Response>,
    ): MpcRouteHandler<TParams> =>
    async (request, context) => {
        try {
            await assertFeatureEnabled();

            if (isMutation(request)) {
                assertMutationRequest(request);
            }

            const params = await context.params;

            return await handler(request, params);
        } catch (error) {
            return handleApiError(error, { path: request.nextUrl.pathname });
        }
    };

/**
 * Wraps a route handler requiring an authenticated session.
 */
export const withSession =
    <TParams>(
        handler: (
            ctx: IMpcSessionContext,
            params: TParams,
        ) => Promise<Response>,
    ): MpcRouteHandler<TParams> =>
    async (request, context) => {
        try {
            await assertFeatureEnabled();

            if (isMutation(request)) {
                assertMutationRequest(request);
            }

            const { user, session } = mpcAuth.requireSession(request);
            const params = await context.params;

            return await handler({ request, user, session }, params);
        } catch (error) {
            return handleApiError(error, { path: request.nextUrl.pathname });
        }
    };

/**
 * Wraps a route handler requiring an authenticated session and a membership in the system with one of the given
 * roles ("member" accepts any role). Non-members get 404 to avoid leaking system existence.
 */
export const withSystemRole = <TParams extends IMpcSystemRouteParams>(
    roles: MpcMemberRole[] | 'member',
    handler: (ctx: IMpcSystemContext, params: TParams) => Promise<Response>,
): MpcRouteHandler<TParams> =>
    withSession<TParams>((ctx, params) => {
        const system = findSystemRecord(params.systemId);
        const member = system?.members.find(
            (item) => item.userId === ctx.user.id,
        );

        if (system == null || member == null) {
            throw new MpcApiError('not_found', 'System not found.');
        }

        if (roles !== 'member' && !roles.includes(member.role)) {
            throw new MpcApiError(
                'forbidden',
                `This action requires one of the roles: ${roles.join(', ')}.`,
            );
        }

        return handler({ ...ctx, system, member }, params);
    });

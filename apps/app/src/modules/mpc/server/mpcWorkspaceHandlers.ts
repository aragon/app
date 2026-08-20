import 'server-only';
import type {
    IMpcCheckPolicyFlowResponse,
    IMpcPolicyCatalogResponse,
    IMpcSimulatePolicyFlowResponse,
    IMpcSystemsResponse,
    IMpcWorkspace,
    IMpcWorkspaceMembersResponse,
    IMpcWorkspacePoliciesResponse,
    IMpcWorkspacePolicyResponse,
    IMpcWorkspaceResponse,
    IMpcWorkspacesResponse,
} from '@/modules/mpc/api/mpcService/domain';
import { MpcApiError } from './mpcApiError';
import {
    type IMpcSessionContext,
    jsonOk,
    type MpcRouteHandler,
    noContent,
    withSession,
} from './mpcApiUtils';
import { mpcPolicyEngine } from './mpcPolicyEngine';
import { expandPolicyReferences } from './mpcPolicyReferences';
import {
    readJsonBody,
    validateAddWorkspaceMemberParams,
    validateCheckPolicyFlowParams,
    validateCreateWorkspaceParams,
    validateSaveWorkspacePolicyParams,
    validateSimulatePolicyFlowParams,
    validateUpdateWorkspacePolicyParams,
} from './mpcRequestValidation';
import { getMpcStore } from './mpcStore';
import {
    addWorkspaceMember,
    canReadWorkspace,
    createWorkspace,
    createWorkspacePolicy,
    deleteWorkspacePolicy,
    findWorkspacePolicy,
    findWorkspaceRecord,
    listWorkspaceMembers,
    listWorkspacePolicies,
    listWorkspaceSystems,
    listWorkspaces,
    removeWorkspaceMember,
    updateWorkspacePolicy,
} from './mpcWorkspaces';

/**
 * Route handlers for /api/mpc/workspaces/** and /api/mpc/policy-catalog (the policy editor surface).
 * Reading a workspace is allowed to its owner and to the members of its systems; editing policies is owner only.
 */

export interface IMpcWorkspaceRouteParams {
    workspaceId: string;
}

export interface IMpcWorkspacePolicyRouteParams
    extends IMpcWorkspaceRouteParams {
    policyId: string;
}

export interface IMpcWorkspaceMemberRouteParams
    extends IMpcWorkspaceRouteParams {
    userId: string;
}

interface IMpcWorkspaceContext extends IMpcSessionContext {
    workspace: IMpcWorkspace;
    isOwner: boolean;
}

/**
 * Wraps a session handler resolving the workspace and the caller access ("read" = owner or member of a
 * workspace system, "owner" = owner only). Non-readers get 404 to avoid leaking workspace existence.
 */
const withWorkspace = <TParams extends IMpcWorkspaceRouteParams>(
    access: 'read' | 'owner',
    handler: (ctx: IMpcWorkspaceContext, params: TParams) => Promise<Response>,
): MpcRouteHandler<TParams> =>
    withSession<TParams>((ctx, params) => {
        const workspace = findWorkspaceRecord(params.workspaceId);

        if (
            workspace == null ||
            !canReadWorkspace(getMpcStore().read(), workspace, ctx.user.id)
        ) {
            throw new MpcApiError('not_found', 'Workspace not found.');
        }

        const isOwner = workspace.ownerId === ctx.user.id;

        if (access === 'owner' && !isOwner) {
            throw new MpcApiError(
                'forbidden',
                'Only the workspace owner can manage its policies and members.',
            );
        }

        return handler({ ...ctx, workspace, isOwner }, params);
    });

// GET /api/mpc/workspaces
export const handleListWorkspaces = withSession<Record<string, never>>((ctx) =>
    Promise.resolve(
        jsonOk<IMpcWorkspacesResponse>(listWorkspaces(ctx.user.id)),
    ),
);

// POST /api/mpc/workspaces
export const handleCreateWorkspace = withSession<Record<string, never>>(
    async (ctx) => {
        const params = validateCreateWorkspaceParams(
            await readJsonBody(ctx.request),
        );

        return jsonOk<IMpcWorkspaceResponse>(
            createWorkspace(ctx.user, params),
            {
                status: 201,
            },
        );
    },
);

// GET /api/mpc/workspaces/[workspaceId]
export const handleGetWorkspace = withWorkspace<IMpcWorkspaceRouteParams>(
    'read',
    (ctx) => Promise.resolve(jsonOk<IMpcWorkspaceResponse>(ctx.workspace)),
);

// GET /api/mpc/workspaces/[workspaceId]/systems
export const handleListWorkspaceSystems =
    withWorkspace<IMpcWorkspaceRouteParams>('read', (ctx) =>
        Promise.resolve(
            jsonOk<IMpcSystemsResponse>(listWorkspaceSystems(ctx.workspace.id)),
        ),
    );

// GET /api/mpc/workspaces/[workspaceId]/members
export const handleListWorkspaceMembers =
    withWorkspace<IMpcWorkspaceRouteParams>('read', (ctx) =>
        Promise.resolve(
            jsonOk<IMpcWorkspaceMembersResponse>(
                listWorkspaceMembers(ctx.workspace.id),
            ),
        ),
    );

// POST /api/mpc/workspaces/[workspaceId]/members
export const handleAddWorkspaceMember = withWorkspace<IMpcWorkspaceRouteParams>(
    'owner',
    async (ctx) => {
        const params = validateAddWorkspaceMemberParams(
            await readJsonBody(ctx.request),
        );

        return jsonOk<IMpcWorkspaceMembersResponse>(
            addWorkspaceMember(ctx.workspace.id, params),
            { status: 201 },
        );
    },
);

// DELETE /api/mpc/workspaces/[workspaceId]/members/[userId]
export const handleRemoveWorkspaceMember =
    withWorkspace<IMpcWorkspaceMemberRouteParams>('owner', (ctx, params) =>
        Promise.resolve(
            jsonOk<IMpcWorkspaceMembersResponse>(
                removeWorkspaceMember(ctx.workspace.id, params.userId),
            ),
        ),
    );

// GET /api/mpc/workspaces/[workspaceId]/policies
export const handleListWorkspacePolicies =
    withWorkspace<IMpcWorkspaceRouteParams>('read', (ctx) =>
        Promise.resolve(
            jsonOk<IMpcWorkspacePoliciesResponse>(
                listWorkspacePolicies(ctx.workspace.id),
            ),
        ),
    );

// POST /api/mpc/workspaces/[workspaceId]/policies
export const handleCreateWorkspacePolicy =
    withWorkspace<IMpcWorkspaceRouteParams>('owner', async (ctx) => {
        const params = validateSaveWorkspacePolicyParams(
            await readJsonBody(ctx.request),
        );

        return jsonOk<IMpcWorkspacePolicyResponse>(
            await createWorkspacePolicy(ctx.workspace, ctx.user, params),
            { status: 201 },
        );
    });

// GET /api/mpc/workspaces/[workspaceId]/policies/[policyId]
export const handleGetWorkspacePolicy =
    withWorkspace<IMpcWorkspacePolicyRouteParams>('read', (ctx, params) => {
        const policy = findWorkspacePolicy(ctx.workspace.id, params.policyId);

        if (policy == null) {
            throw new MpcApiError('not_found', 'Policy not found.');
        }

        return Promise.resolve(jsonOk<IMpcWorkspacePolicyResponse>(policy));
    });

// PUT /api/mpc/workspaces/[workspaceId]/policies/[policyId]
export const handleUpdateWorkspacePolicy =
    withWorkspace<IMpcWorkspacePolicyRouteParams>(
        'owner',
        async (ctx, params) => {
            const body = validateUpdateWorkspacePolicyParams(
                await readJsonBody(ctx.request),
            );

            return jsonOk<IMpcWorkspacePolicyResponse>(
                await updateWorkspacePolicy(
                    ctx.workspace,
                    params.policyId,
                    body,
                ),
            );
        },
    );

// DELETE /api/mpc/workspaces/[workspaceId]/policies/[policyId]
export const handleDeleteWorkspacePolicy =
    withWorkspace<IMpcWorkspacePolicyRouteParams>('owner', (ctx, params) => {
        deleteWorkspacePolicy(ctx.workspace, params.policyId);

        return Promise.resolve(noContent());
    });

// POST /api/mpc/workspaces/[workspaceId]/policies/check
export const handleCheckPolicyFlow = withWorkspace<IMpcWorkspaceRouteParams>(
    'read',
    async (ctx) => {
        const { flow } = validateCheckPolicyFlowParams(
            await readJsonBody(ctx.request),
        );
        const expanded = expandPolicyReferences(
            getMpcStore().read(),
            ctx.workspace.id,
            flow,
            ctx.request.nextUrl.searchParams.get('policyId') ?? undefined,
        );

        return jsonOk<IMpcCheckPolicyFlowResponse>(
            expanded.mapCheckResult(await mpcPolicyEngine.check(expanded.flow)),
        );
    },
);

// POST /api/mpc/workspaces/[workspaceId]/policies/simulate
export const handleSimulatePolicyFlow = withWorkspace<IMpcWorkspaceRouteParams>(
    'read',
    async (ctx) => {
        const { flow, context } = validateSimulatePolicyFlowParams(
            await readJsonBody(ctx.request),
        );
        const expanded = expandPolicyReferences(
            getMpcStore().read(),
            ctx.workspace.id,
            flow,
            ctx.request.nextUrl.searchParams.get('policyId') ?? undefined,
        );

        return jsonOk<IMpcSimulatePolicyFlowResponse>(
            expanded.mapSimResult(
                await mpcPolicyEngine.evaluate(expanded.flow, context),
            ),
        );
    },
);

// GET /api/mpc/policy-catalog
export const handleGetPolicyCatalog = withSession<Record<string, never>>(
    async () => {
        const [catalog, examples] = await Promise.all([
            mpcPolicyEngine.getCatalog(),
            mpcPolicyEngine.getExamples(),
        ]);

        return jsonOk<IMpcPolicyCatalogResponse>({ ...catalog, examples });
    },
);

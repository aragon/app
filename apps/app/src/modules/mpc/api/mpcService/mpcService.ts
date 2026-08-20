import { HttpService } from '@/shared/api/httpService';
import type {
    IMpcActivityResponse,
    IMpcBalanceResponse,
    IMpcCheckPolicyFlowResponse,
    IMpcLoginResponse,
    IMpcMembersResponse,
    IMpcPolicyCatalogResponse,
    IMpcPrepareTransactionResponse,
    IMpcRequestResponse,
    IMpcRequestsResponse,
    IMpcServerShareResponse,
    IMpcSessionResponse,
    IMpcSimulatePolicyFlowResponse,
    IMpcSimulateResponse,
    IMpcSystemResponse,
    IMpcSystemsResponse,
    IMpcTotpSetupResponse,
    IMpcTotpVerifyResponse,
    IMpcWorkspaceMembersResponse,
    IMpcWorkspacePoliciesResponse,
    IMpcWorkspacePolicyResponse,
    IMpcWorkspaceResponse,
    IMpcWorkspacesResponse,
} from './domain';
import { MpcApiError } from './mpcApiError';
import type {
    IMpcAcknowledgeRecoveryServiceParams,
    IMpcAddMemberServiceParams,
    IMpcAddWorkspaceMemberServiceParams,
    IMpcApproveRequestServiceParams,
    IMpcAuthorizeExportServiceParams,
    IMpcCheckPolicyFlowServiceParams,
    IMpcCompleteRequestServiceParams,
    IMpcCreateRequestServiceParams,
    IMpcCreateSystemServiceParams,
    IMpcCreateWorkspacePolicyServiceParams,
    IMpcCreateWorkspaceServiceParams,
    IMpcDeleteSystemServiceParams,
    IMpcDeleteWorkspacePolicyServiceParams,
    IMpcGetActivityServiceParams,
    IMpcGetBalanceServiceParams,
    IMpcGetMembersServiceParams,
    IMpcGetRequestsServiceParams,
    IMpcGetSystemServiceParams,
    IMpcGetWorkspaceMembersServiceParams,
    IMpcGetWorkspacePoliciesServiceParams,
    IMpcGetWorkspacePolicyServiceParams,
    IMpcGetWorkspaceServiceParams,
    IMpcGetWorkspaceSystemsServiceParams,
    IMpcLoginServiceParams,
    IMpcPrepareRequestServiceParams,
    IMpcRegisterKeyServiceParams,
    IMpcRegisterServiceParams,
    IMpcRejectRequestServiceParams,
    IMpcRemoveMemberServiceParams,
    IMpcRemoveWorkspaceMemberServiceParams,
    IMpcReshareServiceParams,
    IMpcServerShareServiceParams,
    IMpcSimulatePolicyFlowServiceParams,
    IMpcSimulateServiceParams,
    IMpcTotpVerifyServiceParams,
    IMpcUpdatePolicyServiceParams,
    IMpcUpdateRequestServiceParams,
    IMpcUpdateSystemServiceParams,
    IMpcUpdateWorkspacePolicyServiceParams,
} from './mpcService.api';

type MpcHttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface IMpcCallParams<TUrlParams, TBody> {
    urlParams?: TUrlParams;
    queryParams?: object;
    body?: TBody;
}

export const MPC_API_BASE_URL = '/api/mpc';
export const MPC_CLIENT_HEADER = 'x-mpc-client';
export const MPC_CLIENT_HEADER_VALUE = 'aragon-app';

/**
 * Client of the POC MPC co-signer API (route handlers under /api/mpc). Methods map 1:1 to the endpoints.
 * Requests are sent with the session cookie (credentials: include) and the x-mpc-client header (CSRF defense).
 */
class MpcService extends HttpService {
    private urls = {
        register: '/auth/register',
        login: '/auth/login',
        logout: '/auth/logout',
        session: '/auth/session',
        totpSetup: '/auth/totp/setup',
        totpVerify: '/auth/totp/verify',
        systems: '/systems',
        system: '/systems/:systemId',
        key: '/systems/:systemId/key',
        acknowledgeRecovery: '/systems/:systemId/key/acknowledge-recovery',
        serverShare: '/systems/:systemId/server-share',
        reshare: '/systems/:systemId/reshare',
        members: '/systems/:systemId/members',
        member: '/systems/:systemId/members/:userId',
        policy: '/systems/:systemId/policy',
        requests: '/systems/:systemId/requests',
        request: '/systems/:systemId/requests/:requestId',
        approveRequest: '/systems/:systemId/requests/:requestId/approve',
        rejectRequest: '/systems/:systemId/requests/:requestId/reject',
        prepareRequest: '/systems/:systemId/requests/:requestId/prepare',
        completeRequest: '/systems/:systemId/requests/:requestId/complete',
        activity: '/systems/:systemId/activity',
        balance: '/systems/:systemId/balance',
        simulate: '/systems/:systemId/simulate',
        exportAuthorization: '/systems/:systemId/export-authorization',
        workspaces: '/workspaces',
        workspace: '/workspaces/:workspaceId',
        workspaceSystems: '/workspaces/:workspaceId/systems',
        workspaceMembers: '/workspaces/:workspaceId/members',
        workspaceMember: '/workspaces/:workspaceId/members/:userId',
        workspacePolicies: '/workspaces/:workspaceId/policies',
        workspacePolicy: '/workspaces/:workspaceId/policies/:policyId',
        checkPolicyFlow: '/workspaces/:workspaceId/policies/check',
        simulatePolicyFlow: '/workspaces/:workspaceId/policies/simulate',
        policyCatalog: '/policy-catalog',
    };

    constructor() {
        super(MPC_API_BASE_URL, MpcApiError.fromResponse);
    }

    private call = <TData, TUrlParams = unknown, TBody = unknown>(
        url: string,
        method: MpcHttpMethod,
        params: IMpcCallParams<TUrlParams, TBody> = {},
    ): Promise<TData> =>
        this.request<TData, TUrlParams, unknown, TBody>(url, params, {
            method,
            credentials: 'include',
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                [MPC_CLIENT_HEADER]: MPC_CLIENT_HEADER_VALUE,
            },
        });

    // Auth
    register = (params: IMpcRegisterServiceParams) =>
        this.call<IMpcLoginResponse>(this.urls.register, 'POST', params);

    login = (params: IMpcLoginServiceParams) =>
        this.call<IMpcLoginResponse>(this.urls.login, 'POST', params);

    logout = () => this.call<null>(this.urls.logout, 'POST');

    getSession = () => this.call<IMpcSessionResponse>(this.urls.session, 'GET');

    setupTotp = () =>
        this.call<IMpcTotpSetupResponse>(this.urls.totpSetup, 'POST');

    verifyTotp = (params: IMpcTotpVerifyServiceParams) =>
        this.call<IMpcTotpVerifyResponse>(this.urls.totpVerify, 'POST', params);

    // Systems
    getSystems = () => this.call<IMpcSystemsResponse>(this.urls.systems, 'GET');

    createSystem = (params: IMpcCreateSystemServiceParams) =>
        this.call<IMpcSystemResponse>(this.urls.systems, 'POST', params);

    getSystem = (params: IMpcGetSystemServiceParams) =>
        this.call<IMpcSystemResponse>(this.urls.system, 'GET', params);

    updateSystem = (params: IMpcUpdateSystemServiceParams) =>
        this.call<IMpcSystemResponse>(this.urls.system, 'PATCH', params);

    deleteSystem = (params: IMpcDeleteSystemServiceParams) =>
        this.call<null>(this.urls.system, 'DELETE', params);

    // Key
    registerKey = (params: IMpcRegisterKeyServiceParams) =>
        this.call<IMpcSystemResponse>(this.urls.key, 'POST', params);

    acknowledgeRecovery = (params: IMpcAcknowledgeRecoveryServiceParams) =>
        this.call<IMpcSystemResponse>(
            this.urls.acknowledgeRecovery,
            'POST',
            params,
        );

    getServerShare = (params: IMpcServerShareServiceParams) =>
        this.call<IMpcServerShareResponse>(
            this.urls.serverShare,
            'POST',
            params,
        );

    reshare = (params: IMpcReshareServiceParams) =>
        this.call<IMpcSystemResponse>(this.urls.reshare, 'POST', params);

    // Members / policy
    getMembers = (params: IMpcGetMembersServiceParams) =>
        this.call<IMpcMembersResponse>(this.urls.members, 'GET', params);

    addMember = (params: IMpcAddMemberServiceParams) =>
        this.call<IMpcMembersResponse>(this.urls.members, 'POST', params);

    removeMember = (params: IMpcRemoveMemberServiceParams) =>
        this.call<IMpcMembersResponse>(this.urls.member, 'DELETE', params);

    updatePolicy = (params: IMpcUpdatePolicyServiceParams) =>
        this.call<IMpcSystemResponse>(this.urls.policy, 'PUT', params);

    // Workspaces & workspace policies (policy editor)
    getWorkspaces = () =>
        this.call<IMpcWorkspacesResponse>(this.urls.workspaces, 'GET');

    createWorkspace = (params: IMpcCreateWorkspaceServiceParams) =>
        this.call<IMpcWorkspaceResponse>(this.urls.workspaces, 'POST', params);

    getWorkspace = (params: IMpcGetWorkspaceServiceParams) =>
        this.call<IMpcWorkspaceResponse>(this.urls.workspace, 'GET', params);

    getWorkspaceSystems = (params: IMpcGetWorkspaceSystemsServiceParams) =>
        this.call<IMpcSystemsResponse>(
            this.urls.workspaceSystems,
            'GET',
            params,
        );

    getWorkspaceMembers = (params: IMpcGetWorkspaceMembersServiceParams) =>
        this.call<IMpcWorkspaceMembersResponse>(
            this.urls.workspaceMembers,
            'GET',
            params,
        );

    addWorkspaceMember = (params: IMpcAddWorkspaceMemberServiceParams) =>
        this.call<IMpcWorkspaceMembersResponse>(
            this.urls.workspaceMembers,
            'POST',
            params,
        );

    removeWorkspaceMember = (params: IMpcRemoveWorkspaceMemberServiceParams) =>
        this.call<IMpcWorkspaceMembersResponse>(
            this.urls.workspaceMember,
            'DELETE',
            params,
        );

    getWorkspacePolicies = (params: IMpcGetWorkspacePoliciesServiceParams) =>
        this.call<IMpcWorkspacePoliciesResponse>(
            this.urls.workspacePolicies,
            'GET',
            params,
        );

    getWorkspacePolicy = (params: IMpcGetWorkspacePolicyServiceParams) =>
        this.call<IMpcWorkspacePolicyResponse>(
            this.urls.workspacePolicy,
            'GET',
            params,
        );

    createWorkspacePolicy = (params: IMpcCreateWorkspacePolicyServiceParams) =>
        this.call<IMpcWorkspacePolicyResponse>(
            this.urls.workspacePolicies,
            'POST',
            params,
        );

    updateWorkspacePolicy = (params: IMpcUpdateWorkspacePolicyServiceParams) =>
        this.call<IMpcWorkspacePolicyResponse>(
            this.urls.workspacePolicy,
            'PUT',
            params,
        );

    deleteWorkspacePolicy = (params: IMpcDeleteWorkspacePolicyServiceParams) =>
        this.call<null>(this.urls.workspacePolicy, 'DELETE', params);

    checkPolicyFlow = (params: IMpcCheckPolicyFlowServiceParams) =>
        this.call<IMpcCheckPolicyFlowResponse>(
            this.urls.checkPolicyFlow,
            'POST',
            params,
        );

    simulatePolicyFlow = (params: IMpcSimulatePolicyFlowServiceParams) =>
        this.call<IMpcSimulatePolicyFlowResponse>(
            this.urls.simulatePolicyFlow,
            'POST',
            params,
        );

    getPolicyCatalog = () =>
        this.call<IMpcPolicyCatalogResponse>(this.urls.policyCatalog, 'GET');

    // Requests
    getRequests = (params: IMpcGetRequestsServiceParams) =>
        this.call<IMpcRequestsResponse>(this.urls.requests, 'GET', params);

    createRequest = (params: IMpcCreateRequestServiceParams) =>
        this.call<IMpcRequestResponse>(this.urls.requests, 'POST', params);

    updateRequest = (params: IMpcUpdateRequestServiceParams) =>
        this.call<IMpcRequestResponse>(this.urls.request, 'PUT', params);

    approveRequest = (params: IMpcApproveRequestServiceParams) =>
        this.call<IMpcRequestResponse>(
            this.urls.approveRequest,
            'POST',
            params,
        );

    rejectRequest = (params: IMpcRejectRequestServiceParams) =>
        this.call<IMpcRequestResponse>(this.urls.rejectRequest, 'POST', params);

    prepareRequest = (params: IMpcPrepareRequestServiceParams) =>
        this.call<IMpcPrepareTransactionResponse>(
            this.urls.prepareRequest,
            'POST',
            params,
        );

    completeRequest = (params: IMpcCompleteRequestServiceParams) =>
        this.call<IMpcRequestResponse>(
            this.urls.completeRequest,
            'POST',
            params,
        );

    // Activity / chain
    getActivity = (params: IMpcGetActivityServiceParams) =>
        this.call<IMpcActivityResponse>(this.urls.activity, 'GET', params);

    getBalance = (params: IMpcGetBalanceServiceParams) =>
        this.call<IMpcBalanceResponse>(this.urls.balance, 'GET', params);

    simulate = (params: IMpcSimulateServiceParams) =>
        this.call<IMpcSimulateResponse>(this.urls.simulate, 'POST', params);

    authorizeExport = (params: IMpcAuthorizeExportServiceParams) =>
        this.call<null>(this.urls.exportAuthorization, 'POST', params);
}

export const mpcService = new MpcService();

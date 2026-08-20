import type {
    IMpcAddMemberParams,
    IMpcAddWorkspaceMemberParams,
    IMpcCheckPolicyFlowParams,
    IMpcCompleteRequestParams,
    IMpcCreateRequestParams,
    IMpcCreateSystemParams,
    IMpcCreateWorkspaceParams,
    IMpcLoginParams,
    IMpcRegisterKeyParams,
    IMpcRegisterParams,
    IMpcReshareParams,
    IMpcSaveWorkspacePolicyParams,
    IMpcServerShareParams,
    IMpcSimulateParams,
    IMpcSimulatePolicyFlowParams,
    IMpcUpdatePolicyParams,
    IMpcUpdateRequestParams,
    IMpcUpdateSystemParams,
    IMpcUpdateWorkspacePolicyParams,
} from './domain';

/**
 * Parameters of the mpcService methods (url params + body).
 */

export interface IMpcSystemUrlParams {
    /**
     * ID of the system.
     */
    systemId: string;
}

export interface IMpcRequestUrlParams extends IMpcSystemUrlParams {
    /**
     * ID of the sign request.
     */
    requestId: string;
}

export interface IMpcMemberUrlParams extends IMpcSystemUrlParams {
    /**
     * ID of the member user.
     */
    userId: string;
}

export interface IMpcWorkspaceUrlParams {
    /**
     * ID of the workspace.
     */
    workspaceId: string;
}

export interface IMpcWorkspacePolicyUrlParams extends IMpcWorkspaceUrlParams {
    /**
     * ID of the workspace policy.
     */
    policyId: string;
}

export interface IMpcWorkspaceMemberUrlParams extends IMpcWorkspaceUrlParams {
    /**
     * ID of the member user.
     */
    userId: string;
}

/**
 * Query params of the check / simulate endpoints: the policy being edited (excluded from policy-block
 * references so a policy cannot reference itself).
 */
export interface IMpcPolicyFlowQueryParams {
    policyId?: string;
}

// Auth
export interface IMpcRegisterServiceParams {
    body: IMpcRegisterParams;
}
export interface IMpcLoginServiceParams {
    body: IMpcLoginParams;
}

// Systems
export interface IMpcCreateSystemServiceParams {
    body: IMpcCreateSystemParams;
}
export interface IMpcGetSystemServiceParams {
    urlParams: IMpcSystemUrlParams;
}
export interface IMpcUpdateSystemServiceParams {
    urlParams: IMpcSystemUrlParams;
    body: IMpcUpdateSystemParams;
}
export type IMpcDeleteSystemServiceParams = IMpcGetSystemServiceParams;

// Key
export interface IMpcRegisterKeyServiceParams {
    urlParams: IMpcSystemUrlParams;
    body: IMpcRegisterKeyParams;
}
export type IMpcAcknowledgeRecoveryServiceParams = IMpcGetSystemServiceParams;
export interface IMpcServerShareServiceParams {
    urlParams: IMpcSystemUrlParams;
    body: IMpcServerShareParams;
}
export interface IMpcReshareServiceParams {
    urlParams: IMpcSystemUrlParams;
    body: IMpcReshareParams;
}

// Members / policy
export type IMpcGetMembersServiceParams = IMpcGetSystemServiceParams;
export interface IMpcAddMemberServiceParams {
    urlParams: IMpcSystemUrlParams;
    body: IMpcAddMemberParams;
}
export interface IMpcRemoveMemberServiceParams {
    urlParams: IMpcMemberUrlParams;
}
export interface IMpcUpdatePolicyServiceParams {
    urlParams: IMpcSystemUrlParams;
    body: IMpcUpdatePolicyParams;
}

// Requests
export type IMpcGetRequestsServiceParams = IMpcGetSystemServiceParams;
export interface IMpcCreateRequestServiceParams {
    urlParams: IMpcSystemUrlParams;
    body: IMpcCreateRequestParams;
}
export interface IMpcRequestActionServiceParams {
    urlParams: IMpcRequestUrlParams;
}
export type IMpcApproveRequestServiceParams = IMpcRequestActionServiceParams;
export type IMpcRejectRequestServiceParams = IMpcRequestActionServiceParams;
export type IMpcPrepareRequestServiceParams = IMpcRequestActionServiceParams;
export interface IMpcUpdateRequestServiceParams {
    urlParams: IMpcRequestUrlParams;
    body: IMpcUpdateRequestParams;
}
export interface IMpcCompleteRequestServiceParams {
    urlParams: IMpcRequestUrlParams;
    body: IMpcCompleteRequestParams;
}

// Activity / chain
export type IMpcGetActivityServiceParams = IMpcGetSystemServiceParams;
export type IMpcGetBalanceServiceParams = IMpcGetSystemServiceParams;
export interface IMpcSimulateServiceParams {
    urlParams: IMpcSystemUrlParams;
    body: IMpcSimulateParams;
}
export type IMpcAuthorizeExportServiceParams = IMpcGetSystemServiceParams;

// Workspaces & workspace policies
export interface IMpcGetWorkspaceServiceParams {
    urlParams: IMpcWorkspaceUrlParams;
}
export type IMpcGetWorkspacePoliciesServiceParams =
    IMpcGetWorkspaceServiceParams;
export interface IMpcGetWorkspacePolicyServiceParams {
    urlParams: IMpcWorkspacePolicyUrlParams;
}
export interface IMpcCreateWorkspacePolicyServiceParams {
    urlParams: IMpcWorkspaceUrlParams;
    body: IMpcSaveWorkspacePolicyParams;
}
export interface IMpcUpdateWorkspacePolicyServiceParams {
    urlParams: IMpcWorkspacePolicyUrlParams;
    body: IMpcUpdateWorkspacePolicyParams;
}
export interface IMpcDeleteWorkspacePolicyServiceParams {
    urlParams: IMpcWorkspacePolicyUrlParams;
}
export interface IMpcCheckPolicyFlowServiceParams {
    urlParams: IMpcWorkspaceUrlParams;
    queryParams?: IMpcPolicyFlowQueryParams;
    body: IMpcCheckPolicyFlowParams;
}
export interface IMpcSimulatePolicyFlowServiceParams {
    urlParams: IMpcWorkspaceUrlParams;
    queryParams?: IMpcPolicyFlowQueryParams;
    body: IMpcSimulatePolicyFlowParams;
}
export interface IMpcCreateWorkspaceServiceParams {
    body: IMpcCreateWorkspaceParams;
}
export type IMpcGetWorkspaceSystemsServiceParams =
    IMpcGetWorkspaceServiceParams;
export type IMpcGetWorkspaceMembersServiceParams =
    IMpcGetWorkspaceServiceParams;
export interface IMpcAddWorkspaceMemberServiceParams {
    urlParams: IMpcWorkspaceUrlParams;
    body: IMpcAddWorkspaceMemberParams;
}
export interface IMpcRemoveWorkspaceMemberServiceParams {
    urlParams: IMpcWorkspaceMemberUrlParams;
}

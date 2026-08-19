import type {
    IMpcAddMemberParams,
    IMpcCompleteRequestParams,
    IMpcCreateRequestParams,
    IMpcCreateSystemParams,
    IMpcLoginParams,
    IMpcRegisterKeyParams,
    IMpcRegisterParams,
    IMpcReshareParams,
    IMpcServerShareParams,
    IMpcSimulateParams,
    IMpcUpdatePolicyParams,
    IMpcUpdateSystemParams,
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

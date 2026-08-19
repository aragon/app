import type { Address, Hex } from 'viem';
import type { IMpcActivity } from './mpcActivity';
import type { IMpcPolicy } from './mpcPolicy';
import type { IMpcSignRequest, MpcSignRequestPayload } from './mpcSignRequest';
import type {
    IMpcMember,
    IMpcServerSharePayload,
    IMpcSystem,
    MpcMemberRole,
    MpcProviderId,
} from './mpcSystem';
import type { IMpcSession, IMpcUser } from './mpcUser';

/**
 * Request / response contracts of the POC MPC co-signer API (route handlers under /api/mpc).
 * Shared between the client service and the server implementation.
 */

// Auth
export interface IMpcLoginParams {
    username: string;
    password: string;
}
export type IMpcRegisterParams = IMpcLoginParams;
export type IMpcLoginResponse = IMpcSession;
export type IMpcSessionResponse = IMpcSession;

// Systems
export interface IMpcCreateSystemParams {
    name: string;
    description?: string;
    chainIds: number[];
    providerId: MpcProviderId;
}
export interface IMpcUpdateSystemParams {
    name?: string;
    description?: string;
}
export type IMpcSystemsResponse = IMpcSystem[];
export type IMpcSystemResponse = IMpcSystem;

// Key registration (after client-side ceremony)
export interface IMpcRegisterKeyParams {
    address: Address;
    publicKey: Hex;
    serverShare: IMpcServerSharePayload;
}

// Server share release
export type MpcSharePurpose = 'sign' | 'reshare' | 'recover' | 'export';
export interface IMpcServerShareParams {
    purpose: MpcSharePurpose;
    /**
     * Required when purpose is "sign".
     */
    requestId?: string;
}
export interface IMpcServerShareResponse {
    serverShare: IMpcServerSharePayload;
}

// Reshare / recovery
export interface IMpcReshareParams {
    serverShare: IMpcServerSharePayload;
    /**
     * "reshare" (owner rotated the shares) or "recover" (device share lost, recovered with recovery share).
     */
    mode: 'reshare' | 'recover';
}

// Members
export interface IMpcAddMemberParams {
    username: string;
    role: MpcMemberRole;
}
export type IMpcMembersResponse = IMpcMember[];

// Policy
export type IMpcUpdatePolicyParams = IMpcPolicy;

// Requests
export interface IMpcCreateRequestParams {
    payload: MpcSignRequestPayload;
    /**
     * Preview mode (POC extension): the server returns the summary + policy decision the request would get
     * without persisting it (id "preview"). Lets the UI show the decision before the request is created.
     */
    dryRun?: boolean;
}
export interface IMpcCompleteRequestParams {
    /**
     * Signature (message / typed data) or the signed raw transaction (transaction requests).
     */
    signature: Hex;
    signedTransaction?: Hex;
}
export type IMpcRequestsResponse = IMpcSignRequest[];
export type IMpcRequestResponse = IMpcSignRequest;

// Activity / chain
export type IMpcActivityResponse = IMpcActivity[];
export interface IMpcBalanceResponse {
    chainId: number;
    address: Address;
    /**
     * Balance in wei (decimal string).
     */
    balanceWei: string;
    /**
     * Next nonce.
     */
    nonce: number;
}
export interface IMpcSimulateParams {
    chainId: number;
    to: Address;
    valueWei: string;
    data?: Hex;
}
export interface IMpcSimulateResponse {
    ok: boolean;
    gas?: string;
    error?: string;
}
export interface IMpcPrepareTransactionResponse {
    /**
     * Unsigned transaction fields (EIP-1559) the client must sign, computed by the server.
     */
    chainId: number;
    nonce: number;
    to: Address;
    valueWei: string;
    data?: Hex;
    gas: string;
    maxFeePerGasWei: string;
    maxPriorityFeePerGasWei: string;
}

export interface IMpcApiError {
    error: {
        code: string;
        message: string;
    };
}

export type IMpcUserResponse = IMpcUser;

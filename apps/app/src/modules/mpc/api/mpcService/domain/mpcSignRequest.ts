import type { Address, Hex } from 'viem';
import type { IMpcPolicyDecision } from './mpcPolicy';

export type MpcSignRequestType = 'transaction' | 'message' | 'typedData';

export type MpcSignRequestStatus =
    | 'pending_approval'
    | 'approved'
    | 'rejected'
    | 'released'
    | 'signed'
    | 'broadcast'
    | 'failed';

export interface IMpcTransactionPayload {
    /**
     * Chain ID of the transaction.
     */
    chainId: number;
    /**
     * Recipient address.
     */
    to: Address;
    /**
     * Native value in wei (decimal string).
     */
    valueWei: string;
    /**
     * Optional calldata.
     */
    data?: Hex;
}

export interface IMpcMessagePayload {
    /**
     * Plain text message to sign (EIP-191 personal_sign).
     */
    message: string;
}

export interface IMpcTypedDataPayload {
    /**
     * EIP-712 typed data as JSON string.
     */
    typedDataJson: string;
}

export type MpcSignRequestPayload =
    | { type: 'transaction'; transaction: IMpcTransactionPayload }
    | { type: 'message'; message: IMpcMessagePayload }
    | { type: 'typedData'; typedData: IMpcTypedDataPayload };

export interface IMpcSignRequestSummary {
    /**
     * Short human readable summary (e.g. "Send 0.01 ETH to 0x…").
     */
    label: string;
    /**
     * Chain ID when applicable.
     */
    chainId?: number;
    /**
     * Recipient when applicable.
     */
    to?: Address;
    /**
     * Native value in wei (decimal string) when applicable.
     */
    valueWei?: string;
    /**
     * 4-byte selector when the transaction has calldata.
     */
    selector?: Hex;
    /**
     * Whether the transaction has calldata.
     */
    isContractCall?: boolean;
}

export interface IMpcApproval {
    /**
     * User id of the approver.
     */
    userId: string;
    /**
     * Username of the approver.
     */
    username: string;
    /**
     * Timestamp (ISO 8601).
     */
    at: string;
}

export interface IMpcSignRequest {
    /**
     * Unique identifier of the request.
     */
    id: string;
    /**
     * System the request belongs to.
     */
    systemId: string;
    /**
     * Type of the request.
     */
    type: MpcSignRequestType;
    /**
     * Payload to sign.
     */
    payload: MpcSignRequestPayload;
    /**
     * Human readable summary computed by the server.
     */
    summary: IMpcSignRequestSummary;
    /**
     * Current status.
     */
    status: MpcSignRequestStatus;
    /**
     * Policy decision computed at creation time.
     */
    policyDecision: IMpcPolicyDecision;
    /**
     * Approvals collected.
     */
    approvals: IMpcApproval[];
    /**
     * Rejections collected.
     */
    rejections: IMpcApproval[];
    /**
     * Number of approvals required.
     */
    approvalsRequired: number;
    /**
     * Username of the requester.
     */
    createdBy: string;
    /**
     * Creation timestamp (ISO 8601).
     */
    createdAt: string;
    /**
     * Timestamp the server share was released to the client (ISO 8601).
     */
    releasedAt?: string;
    /**
     * Resulting signature (hex).
     */
    signature?: Hex;
    /**
     * Transaction hash when broadcast.
     */
    txHash?: Hex;
    /**
     * Error message when failed.
     */
    error?: string;
    /**
     * Last update timestamp (ISO 8601).
     */
    updatedAt: string;
}

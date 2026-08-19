import type { Address } from 'viem';

export interface IMpcPolicy {
    /**
     * Chain IDs on which the system is allowed to sign transactions.
     */
    allowedChainIds: number[];
    /**
     * Recipient allowlist. Null means any recipient is allowed.
     */
    recipientAllowlist: Address[] | null;
    /**
     * Maximum native value per transaction in wei (decimal string). Null means no limit.
     */
    maxValuePerTxWei: string | null;
    /**
     * Rolling 24h native value limit in wei (decimal string). Null means no limit.
     */
    dailyLimitWei: string | null;
    /**
     * Requests above this native value (wei, decimal string) need approvals from other members. Null means never.
     */
    requireApprovalAboveWei: string | null;
    /**
     * Number of approvals (from members other than the requester) required when approval is needed.
     */
    approvalsRequired: number;
    /**
     * Whether transactions with calldata (contract calls) are allowed.
     */
    allowContractCalls: boolean;
    /**
     * Whether signing off-chain messages (EIP-191 / EIP-712) is allowed.
     */
    allowMessageSigning: boolean;
    /**
     * Whether message / typed data requests need approvalsRequired approvals before the server share is released.
     * Optional (POC extension): defaults to false so single-owner systems can still sign messages.
     */
    requireApprovalForMessages?: boolean;
}

export interface IMpcPolicyDecision {
    /**
     * Whether the request is allowed by the policy (may still require approvals).
     */
    allowed: boolean;
    /**
     * Whether the request needs approvals before the server share is released.
     */
    requiresApproval: boolean;
    /**
     * Human readable reasons for the decision (deny reasons or approval reasons).
     */
    reasons: string[];
}

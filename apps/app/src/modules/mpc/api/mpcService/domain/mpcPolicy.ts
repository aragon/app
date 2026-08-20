import type { Address } from 'viem';
import type { IMpcWorkspacePolicyVerdict } from './mpcWorkspace';

export interface IMpcPolicyTokenLimit {
    /**
     * ERC-20 token contract address the limit applies to.
     */
    token: Address;
    /**
     * Token symbol, used in human readable summaries and policy reasons.
     */
    symbol: string;
    /**
     * Token decimals, used to format amounts.
     */
    decimals: number;
    /**
     * Maximum amount per transfer in token min-units (decimal string). Null means no limit.
     */
    maxAmountUnits: string | null;
    /**
     * Transfers above this amount (min-units, decimal string) need approvals from other members. Null means never.
     */
    requireApprovalAboveUnits?: string | null;
}

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
    /**
     * ERC-20 transfer rules (POC extension). When set, transfer(address,uint256) calldata is decoded and the
     * rules apply to the decoded recipient / amount: transfers of unlisted tokens are denied and the
     * recipientAllowlist is checked against the actual payee instead of the token contract. Null / undefined
     * means no token rules (token transfers are plain contract calls).
     */
    tokenLimits?: IMpcPolicyTokenLimit[] | null;
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
    /**
     * Verdict of every enabled workspace policy evaluated for the request (transaction requests only).
     */
    workspacePolicies?: IMpcWorkspacePolicyVerdict[];
}

import {
    decodeFunctionData,
    erc20Abi,
    formatEther,
    formatUnits,
    getAddress,
} from 'viem';
import type {
    IMpcPolicy,
    IMpcPolicyDecision,
    IMpcPolicyTokenLimit,
    IMpcSignRequest,
    IMpcTransactionPayload,
    MpcSignRequestPayload,
} from '@/modules/mpc/api/mpcService/domain';

/**
 * Policy engine of the POC co-signer. Pure function: evaluates a sign request payload against the system policy
 * and the recent history of the system (for the rolling 24h limit).
 */

export const MPC_DAILY_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000;

// Statuses that count towards the daily spent value. Pending / approved requests reserve their value as well
// (their share can still be released), so a burst of small requests cannot bypass the limit. Rejected requests
// free the reserved value again.
const SPENT_STATUSES: IMpcSignRequest['status'][] = [
    'pending_approval',
    'approved',
    'released',
    'signed',
    'broadcast',
];

export const defaultMpcPolicy = (chainIds: number[]): IMpcPolicy => ({
    allowedChainIds: chainIds,
    recipientAllowlist: null,
    maxValuePerTxWei: null,
    dailyLimitWei: null,
    requireApprovalAboveWei: null,
    approvalsRequired: 1,
    allowContractCalls: true,
    allowMessageSigning: true,
    // POC / mock: any release of the server share exposes the full key to the browser (see README), therefore
    // approvals are the only barrier for message / typed data requests. Disabled by default so single-owner
    // systems (no other approver) can still sign; enable it on multi-member systems.
    requireApprovalForMessages: false,
    tokenLimits: null,
});

// 4-byte selector of transfer(address,uint256).
const ERC20_TRANSFER_SELECTOR = '0xa9059cbb';

export interface IMpcDecodedTokenTransfer {
    token: ReturnType<typeof getAddress>;
    recipient: ReturnType<typeof getAddress>;
    amountUnits: string;
}

/**
 * Decodes a plain ERC-20 transfer(address,uint256) transaction. Returns undefined for any other calldata
 * (including transferFrom / approve — the POC token rules only cover direct transfers).
 */
export const decodeTokenTransfer = (
    transaction: IMpcTransactionPayload,
): IMpcDecodedTokenTransfer | undefined => {
    if (!transaction.data?.toLowerCase().startsWith(ERC20_TRANSFER_SELECTOR)) {
        return undefined;
    }

    try {
        const { functionName, args } = decodeFunctionData({
            abi: erc20Abi,
            data: transaction.data,
        });

        if (functionName !== 'transfer') {
            return undefined;
        }

        const [recipient, amount] = args;

        return {
            token: getAddress(transaction.to),
            recipient: getAddress(recipient),
            amountUnits: amount.toString(),
        };
    } catch {
        return undefined;
    }
};

const formatTokenAmount = (
    amountUnits: bigint,
    limit: IMpcPolicyTokenLimit,
): string => `${formatUnits(amountUnits, limit.decimals)} ${limit.symbol}`;

const parseWei = (value: string | null | undefined): bigint | undefined => {
    if (value == null || value === '') {
        return undefined;
    }

    try {
        return BigInt(value);
    } catch {
        return undefined;
    }
};

const formatWei = (value: bigint): string => `${formatEther(value)} ETH`;

/**
 * Sums the native value of transaction requests that consumed the daily limit within the rolling window.
 */
export const computeDailySpentWei = (
    history: IMpcSignRequest[],
    now = Date.now(),
): bigint => {
    const windowStart = now - MPC_DAILY_LIMIT_WINDOW_MS;

    return history.reduce((total, request) => {
        if (
            request.payload.type !== 'transaction' ||
            !SPENT_STATUSES.includes(request.status) ||
            new Date(request.createdAt).getTime() < windowStart
        ) {
            return total;
        }

        return (
            total +
            (parseWei(request.payload.transaction.valueWei) ?? BigInt(0))
        );
    }, BigInt(0));
};

export const evaluatePolicy = (
    policy: IMpcPolicy,
    payload: MpcSignRequestPayload,
    history: IMpcSignRequest[] = [],
    now = Date.now(),
): IMpcPolicyDecision => {
    const reasons: string[] = [];
    const approvalReasons: string[] = [];

    if (payload.type !== 'transaction') {
        if (!policy.allowMessageSigning) {
            reasons.push('Message signing is not allowed by the policy.');

            return { allowed: false, requiresApproval: false, reasons };
        }

        const requiresApproval =
            policy.requireApprovalForMessages === true &&
            policy.approvalsRequired > 0;

        if (requiresApproval) {
            approvalReasons.push(
                `Message / typed data signing requires ${policy.approvalsRequired.toString()} approval(s) by policy.`,
            );
        }

        return { allowed: true, requiresApproval, reasons: approvalReasons };
    }

    const { transaction } = payload;
    const value = parseWei(transaction.valueWei) ?? BigInt(0);
    const isContractCall =
        transaction.data != null &&
        transaction.data !== '0x' &&
        transaction.data.length > 2;

    // Token rules only apply when the policy configures them: the decoded payee replaces the token contract in
    // the allowlist check and the per-token limits kick in.
    const tokenTransfer =
        policy.tokenLimits != null
            ? decodeTokenTransfer(transaction)
            : undefined;
    const effectiveRecipient = tokenTransfer?.recipient ?? transaction.to;

    if (!policy.allowedChainIds.includes(transaction.chainId)) {
        reasons.push(
            `Chain ${transaction.chainId.toString()} is not allowed by the policy.`,
        );
    }

    if (
        policy.recipientAllowlist != null &&
        !policy.recipientAllowlist.some(
            (address) =>
                address.toLowerCase() === effectiveRecipient.toLowerCase(),
        )
    ) {
        reasons.push('Recipient is not in the allowlist.');
    }

    if (tokenTransfer != null) {
        const tokenLimit = policy.tokenLimits?.find(
            (limit) =>
                limit.token.toLowerCase() === tokenTransfer.token.toLowerCase(),
        );
        const amount = BigInt(tokenTransfer.amountUnits);

        if (tokenLimit == null) {
            reasons.push(
                `Token ${tokenTransfer.token} is not allowed by the policy.`,
            );
        } else {
            const maxAmount = parseWei(tokenLimit.maxAmountUnits);

            if (maxAmount != null && amount > maxAmount) {
                reasons.push(
                    `Transfer of ${formatTokenAmount(amount, tokenLimit)} exceeds the per-transfer limit of ${formatTokenAmount(maxAmount, tokenLimit)}.`,
                );
            }

            const tokenApprovalThreshold = parseWei(
                tokenLimit.requireApprovalAboveUnits,
            );

            if (
                tokenApprovalThreshold != null &&
                amount > tokenApprovalThreshold &&
                policy.approvalsRequired > 0
            ) {
                approvalReasons.push(
                    `Transfer of ${formatTokenAmount(amount, tokenLimit)} is above the approval threshold of ${formatTokenAmount(tokenApprovalThreshold, tokenLimit)}: ${policy.approvalsRequired.toString()} approval(s) required.`,
                );
            }
        }
    }

    const maxValuePerTx = parseWei(policy.maxValuePerTxWei);

    if (maxValuePerTx != null && value > maxValuePerTx) {
        reasons.push(
            `Value ${formatWei(value)} exceeds the per-transaction limit of ${formatWei(maxValuePerTx)}.`,
        );
    }

    const dailyLimit = parseWei(policy.dailyLimitWei);

    if (dailyLimit != null) {
        const spent = computeDailySpentWei(history, now);

        if (spent + value > dailyLimit) {
            reasons.push(
                `Value ${formatWei(value)} exceeds the remaining daily limit (${formatWei(dailyLimit)} per 24h, ${formatWei(spent)} already used).`,
            );
        }
    }

    if (isContractCall && !policy.allowContractCalls) {
        reasons.push('Contract calls are not allowed by the policy.');
    }

    const approvalThreshold = parseWei(policy.requireApprovalAboveWei);

    if (
        approvalThreshold != null &&
        value > approvalThreshold &&
        policy.approvalsRequired > 0
    ) {
        approvalReasons.push(
            `Value ${formatWei(value)} is above the approval threshold of ${formatWei(approvalThreshold)}: ${policy.approvalsRequired.toString()} approval(s) required.`,
        );
    }

    if (reasons.length > 0) {
        return { allowed: false, requiresApproval: false, reasons };
    }

    return {
        allowed: true,
        requiresApproval: approvalReasons.length > 0,
        reasons: approvalReasons,
    };
};

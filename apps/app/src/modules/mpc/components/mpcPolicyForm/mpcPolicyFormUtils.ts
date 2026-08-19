import { addressUtils } from '@aragon/gov-ui-kit';
import { type Address, formatEther, parseEther } from 'viem';
import type { IMpcPolicy } from '@/modules/mpc/api/mpcService/domain';
import { MPC_SEPOLIA_CHAIN_ID } from '@/modules/mpc/constants/mpcConstants';

/**
 * Form representation of IMpcPolicy (amounts in ETH, lists as multi-line text).
 */
export interface IMpcPolicyFormData {
    allowedChainIds: string;
    recipientAllowlist: string;
    restrictRecipients: boolean;
    maxValuePerTxEth: string;
    dailyLimitEth: string;
    requireApprovalAboveEth: string;
    approvalsRequired: string;
    allowContractCalls: boolean;
    allowMessageSigning: boolean;
    requireApprovalForMessages: boolean;
}

const splitList = (value: string) =>
    value
        .split(/[\s,;]+/)
        .map((item) => item.trim())
        .filter((item) => item.length > 0);

const weiToEth = (value: string | null) =>
    value == null ? '' : formatEther(BigInt(value));

const ethToWei = (value: string): string | null =>
    value.trim().length === 0 ? null : parseEther(value.trim()).toString();

export const defaultMpcPolicyFormData = (): IMpcPolicyFormData => ({
    allowedChainIds: MPC_SEPOLIA_CHAIN_ID.toString(),
    recipientAllowlist: '',
    restrictRecipients: false,
    maxValuePerTxEth: '',
    dailyLimitEth: '',
    requireApprovalAboveEth: '',
    approvalsRequired: '1',
    allowContractCalls: true,
    allowMessageSigning: true,
    requireApprovalForMessages: false,
});

export const policyToFormData = (policy: IMpcPolicy): IMpcPolicyFormData => ({
    allowedChainIds: policy.allowedChainIds.join(', '),
    recipientAllowlist: (policy.recipientAllowlist ?? []).join('\n'),
    restrictRecipients: policy.recipientAllowlist != null,
    maxValuePerTxEth: weiToEth(policy.maxValuePerTxWei),
    dailyLimitEth: weiToEth(policy.dailyLimitWei),
    requireApprovalAboveEth: weiToEth(policy.requireApprovalAboveWei),
    approvalsRequired: policy.approvalsRequired.toString(),
    allowContractCalls: policy.allowContractCalls,
    allowMessageSigning: policy.allowMessageSigning,
    requireApprovalForMessages: policy.requireApprovalForMessages === true,
});

export const formDataToPolicy = (data: IMpcPolicyFormData): IMpcPolicy => ({
    allowedChainIds: splitList(data.allowedChainIds).map((id) => Number(id)),
    recipientAllowlist: data.restrictRecipients
        ? (splitList(data.recipientAllowlist) as Address[])
        : null,
    maxValuePerTxWei: ethToWei(data.maxValuePerTxEth),
    dailyLimitWei: ethToWei(data.dailyLimitEth),
    requireApprovalAboveWei: ethToWei(data.requireApprovalAboveEth),
    approvalsRequired: Number(data.approvalsRequired),
    allowContractCalls: data.allowContractCalls,
    allowMessageSigning: data.allowMessageSigning,
    requireApprovalForMessages: data.requireApprovalForMessages,
});

// Validators return a translation key when invalid (useFormField convention).

export const validateChainIds = (value: string) =>
    splitList(value).length > 0 &&
    splitList(value).every((id) => /^\d+$/.test(id))
        ? true
        : 'app.mpc.mpcPolicyForm.errors.chainIds';

export const validateAddressList = (value: string) =>
    splitList(value).every((address) => addressUtils.isAddress(address))
        ? true
        : 'app.mpc.mpcPolicyForm.errors.addressList';

export const validateEthAmount = (value: string) => {
    if (value.trim().length === 0) {
        return true;
    }

    try {
        return parseEther(value.trim()) >= BigInt(0)
            ? true
            : 'app.mpc.mpcPolicyForm.errors.amount';
    } catch {
        return 'app.mpc.mpcPolicyForm.errors.amount';
    }
};

export const validateApprovals = (value: string) =>
    /^\d+$/.test(value.trim()) && Number(value) >= 0 && Number(value) <= 10
        ? true
        : 'app.mpc.mpcPolicyForm.errors.approvals';

export const mpcPolicyFormUtils = {
    defaultMpcPolicyFormData,
    policyToFormData,
    formDataToPolicy,
    validateChainIds,
    validateAddressList,
    validateEthAmount,
    validateApprovals,
};

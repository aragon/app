'use client';

import { addressUtils, DefinitionList } from '@aragon/gov-ui-kit';
import { formatEther } from 'viem';
import type { IMpcPolicy } from '@/modules/mpc/api/mpcService/domain';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface IMpcPolicySummaryProps {
    /**
     * Policy to display.
     */
    policy: IMpcPolicy;
}

export const MpcPolicySummary: React.FC<IMpcPolicySummaryProps> = (props) => {
    const { policy } = props;
    const { t } = useTranslations();

    const formatWei = (value: string | null) =>
        value == null
            ? t('app.mpc.mpcPolicySummary.noLimit')
            : t('app.mpc.mpcPolicySummary.eth', {
                  value: formatEther(BigInt(value)),
              });

    const yesNo = (value: boolean) =>
        value
            ? t('app.mpc.mpcPolicySummary.allowed')
            : t('app.mpc.mpcPolicySummary.notAllowed');

    return (
        <DefinitionList.Container>
            <DefinitionList.Item
                term={t('app.mpc.mpcPolicySummary.allowedChainIds')}
            >
                {policy.allowedChainIds.join(', ')}
            </DefinitionList.Item>
            <DefinitionList.Item
                term={t('app.mpc.mpcPolicySummary.recipientAllowlist')}
            >
                {policy.recipientAllowlist == null ? (
                    t('app.mpc.mpcPolicySummary.anyRecipient')
                ) : policy.recipientAllowlist.length === 0 ? (
                    t('app.mpc.mpcPolicySummary.noRecipient')
                ) : (
                    <ul className="flex flex-col gap-1 font-mono text-sm">
                        {policy.recipientAllowlist.map((address) => (
                            <li key={address}>
                                {addressUtils.truncateAddress(address)}
                            </li>
                        ))}
                    </ul>
                )}
            </DefinitionList.Item>
            <DefinitionList.Item
                term={t('app.mpc.mpcPolicySummary.maxValuePerTx')}
            >
                {formatWei(policy.maxValuePerTxWei)}
            </DefinitionList.Item>
            <DefinitionList.Item
                term={t('app.mpc.mpcPolicySummary.dailyLimit')}
            >
                {formatWei(policy.dailyLimitWei)}
            </DefinitionList.Item>
            <DefinitionList.Item
                term={t('app.mpc.mpcPolicySummary.requireApprovalAbove')}
            >
                {policy.requireApprovalAboveWei == null
                    ? t('app.mpc.mpcPolicySummary.never')
                    : formatWei(policy.requireApprovalAboveWei)}
            </DefinitionList.Item>
            <DefinitionList.Item
                term={t('app.mpc.mpcPolicySummary.approvalsRequired')}
            >
                {policy.approvalsRequired}
            </DefinitionList.Item>
            <DefinitionList.Item
                term={t('app.mpc.mpcPolicySummary.allowContractCalls')}
            >
                {yesNo(policy.allowContractCalls)}
            </DefinitionList.Item>
            <DefinitionList.Item
                term={t('app.mpc.mpcPolicySummary.allowMessageSigning')}
            >
                {yesNo(policy.allowMessageSigning)}
            </DefinitionList.Item>
            <DefinitionList.Item
                term={t('app.mpc.mpcPolicySummary.requireApprovalForMessages')}
            >
                {yesNo(policy.requireApprovalForMessages === true)}
            </DefinitionList.Item>
        </DefinitionList.Container>
    );
};

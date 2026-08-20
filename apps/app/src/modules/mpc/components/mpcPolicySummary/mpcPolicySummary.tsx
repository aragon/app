'use client';

import { addressUtils, DefinitionList } from '@aragon/gov-ui-kit';
import { formatEther, formatUnits } from 'viem';
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
            {policy.tokenLimits != null && policy.tokenLimits.length > 0 && (
                <DefinitionList.Item
                    term={t('app.mpc.mpcPolicySummary.tokenLimits')}
                >
                    <ul className="flex flex-col gap-1 text-sm">
                        {policy.tokenLimits.map((limit) => (
                            <li key={limit.token}>
                                {limit.maxAmountUnits != null
                                    ? t('app.mpc.mpcPolicySummary.tokenLimit', {
                                          amount: formatUnits(
                                              BigInt(limit.maxAmountUnits),
                                              limit.decimals,
                                          ),
                                          symbol: limit.symbol,
                                      })
                                    : limit.symbol}
                                {limit.requireApprovalAboveUnits != null &&
                                    ` · ${t(
                                        'app.mpc.mpcPolicySummary.tokenApprovalAbove',
                                        {
                                            amount: formatUnits(
                                                BigInt(
                                                    limit.requireApprovalAboveUnits,
                                                ),
                                                limit.decimals,
                                            ),
                                            symbol: limit.symbol,
                                        },
                                    )}`}
                            </li>
                        ))}
                    </ul>
                </DefinitionList.Item>
            )}
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

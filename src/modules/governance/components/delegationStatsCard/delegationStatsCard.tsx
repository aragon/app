'use client';

import { Card } from '@aragon/gov-ui-kit';
import { Fragment } from 'react';
import type { ITokenPluginSettings } from '@/plugins/tokenPlugin/types';
import type { IDaoPlugin } from '@/shared/api/daoService';
import {
    type IPageHeaderStat,
    PageHeaderStat,
} from '@/shared/components/page/pageHeader/pageHeaderStat';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useSlotSingleFunction } from '@/shared/hooks/useSlotSingleFunction';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import type { IUsePluginMemberStatsParams } from '../../types';
import { MemberDelegateButton } from '../memberDelegateButton';

export interface IDelegationStatsCardProps {
    /**
     * DAO plugin to display the delegation section for.
     */
    plugin: IDaoPlugin;
    /**
     * Address of the member to display the delegation section for.
     */
    memberAddress: string;
    /**
     * ID of the DAO.
     */
    daoId: string;
}

export const DelegationStatsCard: React.FC<IDelegationStatsCardProps> = (
    props,
) => {
    const { plugin, daoId, memberAddress } = props;
    const { t } = useTranslations();

    const tokenSettings = plugin.settings as ITokenPluginSettings;
    const { address: tokenAddress, symbol: tokenSymbol } = tokenSettings.token;

    const memberStatsParams = {
        daoId,
        address: memberAddress,
        plugin,
    };

    const pluginStats = useSlotSingleFunction<
        IUsePluginMemberStatsParams,
        IPageHeaderStat[]
    >({
        params: memberStatsParams,
        slotId: GovernanceSlotId.GOVERNANCE_MEMBER_STATS,
        pluginId: plugin.interfaceType,
    });

    if (pluginStats == null || pluginStats.length === 0) {
        return null;
    }

    return (
        <Card className="p-4 md:p-6">
            <div className="flex flex-col gap-3 md:gap-2">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
                    <div className="flex min-w-px flex-1 items-center justify-around gap-3 md:justify-start md:gap-4">
                        {pluginStats.map((stat, index) => (
                            <Fragment key={stat.label}>
                                {index > 0 && (
                                    <div className="h-11 w-px shrink-0 bg-neutral-100" />
                                )}
                                <PageHeaderStat {...stat} />
                            </Fragment>
                        ))}
                    </div>
                    <div className="w-full shrink-0 md:w-auto">
                        <MemberDelegateButton
                            className="w-full md:w-auto"
                            daoId={daoId}
                            memberAddress={memberAddress}
                            tokenAddress={tokenAddress}
                            tokenSymbol={tokenSymbol}
                        />
                    </div>
                </div>
                <div className="hidden py-2 md:block">
                    <div className="h-px w-full bg-neutral-100" />
                </div>
                <p className="text-center text-neutral-400 text-xs leading-normal md:text-left md:text-sm">
                    {t('app.governance.delegationStatsCard.disclaimer')}
                </p>
            </div>
        </Card>
    );
};

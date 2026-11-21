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
    /**
     * Whether to display the message clarifying delegation scope.
     */
    displayDisclaimer?: boolean;
}

export const DelegationStatsCard: React.FC<IDelegationStatsCardProps> = (
    props,
) => {
    const { plugin, daoId, memberAddress, displayDisclaimer = false } = props;
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
        <Card inset="surface">
            <div className="flex flex-col gap-related--12-8">
                <div className="flex flex-col gap-group-stepped md:flex-row md:items-start">
                    <div className="flex min-w-px flex-1 items-center justify-around gap-group--12-16 md:justify-start">
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
                {displayDisclaimer && (
                    <>
                        <div className="hidden py-inset-flush--fixed-8 md:block">
                            <div className="h-px w-full bg-neutral-100" />
                        </div>
                        <p className="text-center text-xs leading-normal text-neutral-400 md:text-left md:text-sm">
                            {t('app.governance.delegationStatsCard.disclaimer')}
                        </p>
                    </>
                )}
            </div>
        </Card>
    );
};

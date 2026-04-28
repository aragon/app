'use client';

import { Card } from '@aragon/gov-ui-kit';
import { Fragment } from 'react';
import type { IDaoPlugin } from '@/shared/api/daoService';
import {
    type IPageHeaderStat,
    PageHeaderStat,
} from '@/shared/components/page/pageHeader/pageHeaderStat';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useSlotSingleFunction } from '@/shared/hooks/useSlotSingleFunction';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import type { IUsePluginMemberStatsParams } from '../../types';

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
     * Optional action element displayed on the right side of the stats row (e.g. a delegate button).
     */
    action?: React.ReactNode;
}

export const DelegationStatsCard: React.FC<IDelegationStatsCardProps> = (
    props,
) => {
    const { plugin, daoId, memberAddress, action } = props;
    const { t } = useTranslations();

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
        <Card className="p-6">
            <div className="flex flex-col gap-2">
                <div className="flex w-full items-start gap-6">
                    <div className="flex min-w-px flex-1 items-center gap-4">
                        {pluginStats.map((stat, index) => (
                            <Fragment key={stat.label}>
                                {index > 0 && (
                                    <div className="h-11 w-px shrink-0 bg-neutral-100" />
                                )}
                                <PageHeaderStat {...stat} />
                            </Fragment>
                        ))}
                    </div>
                    {action}
                </div>
                <div className="py-2">
                    <div className="h-px w-full bg-neutral-100" />
                </div>
                <p className="text-neutral-400 text-sm leading-normal">
                    {t('app.governance.delegationStatsCard.disclaimer')}
                </p>
            </div>
        </Card>
    );
};

'use client';

import type { ReactNode } from 'react';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { type IPluginFilterComponentProps, PluginFilterComponent } from '@/shared/components/pluginFilterComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPluginFilterUrlParam } from '@/shared/hooks/useDaoPluginFilterUrlParam';
import { pluginGroupFilter } from '@/shared/hooks/useDaoPlugins';
import { PluginType } from '@/shared/types';
import type { NestedOmit } from '@/shared/types/nestedOmit';
import type { IGetProposalListParams } from '../../api/governanceService';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import { DaoProposalListDefault } from './daoProposalListDefault';

export interface IDaoProposalListProps extends Pick<IPluginFilterComponentProps<IDaoPlugin>, 'value' | 'onValueChange'> {
    /**
     * Parameters to use for fetching the proposal list.
     */
    initialParams: NestedOmit<IGetProposalListParams, 'queryParams.pluginAddress'>;
    /**
     * Hides the pagination when set to true.
     */
    hidePagination?: boolean;
    /**
     * Children of the component.
     */
    children?: ReactNode;
}

export const daoProposalListFilterParam = 'proposals';

export const DaoProposalList: React.FC<IDaoProposalListProps> = (props) => {
    const { initialParams, value, onValueChange, ...otherProps } = props;
    const { daoId } = initialParams.queryParams;

    const { t } = useTranslations();
    const { activePlugin, setActivePlugin, plugins } = useDaoPluginFilterUrlParam({
        daoId,
        type: PluginType.PROCESS,
        includeGroupFilter: true,
        name: daoProposalListFilterParam,
        enableUrlUpdate: onValueChange == null,
    });

    const processedPlugins = plugins?.map((plugin) => {
        const { id, label, meta } = plugin;

        const isGroupTab = id === pluginGroupFilter.id;
        const processedLabel = isGroupTab ? t('app.governance.daoProposalList.groupTab') : label;

        const pluginAddress = isGroupTab ? undefined : meta.address;
        const pluginInitialParams = {
            ...initialParams,
            queryParams: { ...initialParams.queryParams, pluginAddress, onlyActive: isGroupTab },
        };

        return { ...plugin, label: processedLabel, props: { initialParams: pluginInitialParams, plugin: meta } };
    });

    return (
        <PluginFilterComponent
            Fallback={DaoProposalListDefault}
            onValueChange={onValueChange ?? setActivePlugin}
            plugins={processedPlugins}
            searchParamName={daoProposalListFilterParam}
            slotId={GovernanceSlotId.GOVERNANCE_DAO_PROPOSAL_LIST}
            value={value ?? activePlugin}
            {...otherProps}
        />
    );
};

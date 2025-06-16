'use client';

import type { IDaoPlugin } from '@/shared/api/daoService';
import { type IPluginTabComponentProps, PluginTabComponent } from '@/shared/components/pluginTabComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { pluginGroupTab, useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { PluginType } from '@/shared/types';
import type { NestedOmit } from '@/shared/types/nestedOmit';
import type { ReactNode } from 'react';
import type { IGetProposalListParams } from '../../api/governanceService';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import { DaoProposalListDefault } from './daoProposalListDefault';

export interface IDaoProposalListProps extends Pick<IPluginTabComponentProps<IDaoPlugin>, 'value' | 'onValueChange'> {
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

export const DaoProposalList: React.FC<IDaoProposalListProps> = (props) => {
    const { initialParams, ...otherProps } = props;
    const { daoId } = initialParams.queryParams;

    const { t } = useTranslations();
    const processPlugins = useDaoPlugins({ daoId, type: PluginType.PROCESS, includeGroupTab: true });

    const processedPlugins = processPlugins?.map((plugin) => {
        const { id, label, meta } = plugin;

        const isGroupTab = id === pluginGroupTab.id;
        const processedLabel = isGroupTab ? t('app.governance.daoProposalList.groupTab') : label;

        const pluginAddress = isGroupTab ? undefined : meta.address;
        const onlyActive = pluginAddress == null;
        const pluginInitialParams = {
            ...initialParams,
            queryParams: { ...initialParams.queryParams, pluginAddress, onlyActive },
        };

        return { ...plugin, label: processedLabel, props: { initialParams: pluginInitialParams, plugin: meta } };
    });

    return (
        <PluginTabComponent
            slotId={GovernanceSlotId.GOVERNANCE_DAO_PROPOSAL_LIST}
            plugins={processedPlugins}
            Fallback={DaoProposalListDefault}
            {...otherProps}
        />
    );
};

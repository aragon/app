'use client';

import type { IDaoPlugin } from '@/shared/api/daoService';
import { type IPluginTabComponentProps, PluginTabComponent } from '@/shared/components/pluginTabComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { pluginGroupTab } from '@/shared/hooks/useDaoPlugins';
import { useDaoPluginTabParam } from '@/shared/hooks/useDaoPluginTabParam';
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

export const daoProposalListSearchParam = 'proposalsTab';

export const DaoProposalList: React.FC<IDaoProposalListProps> = (props) => {
    const { initialParams, value, onValueChange, ...otherProps } = props;
    const { daoId } = initialParams.queryParams;

    const { t } = useTranslations();
    const {
        selectedPlugin,
        setSelectedPlugin,
        plugins: processPlugins,
    } = useDaoPluginTabParam({
        daoId,
        type: PluginType.PROCESS,
        includeGroupTab: true,
        name: daoProposalListSearchParam,
        enableUrlUpdate: onValueChange == null,
    });

    const processedPlugins = processPlugins.map((plugin) => {
        const { id, label, meta } = plugin;

        const isGroupTab = id === pluginGroupTab.id;
        const processedLabel = isGroupTab ? t('app.governance.daoProposalList.groupTab') : label;

        const pluginAddress = isGroupTab ? undefined : meta.address;
        const pluginInitialParams = {
            ...initialParams,
            queryParams: { ...initialParams.queryParams, pluginAddress, onlyActive: isGroupTab },
        };

        return { ...plugin, label: processedLabel, props: { initialParams: pluginInitialParams, plugin: meta } };
    });

    return (
        <PluginTabComponent
            slotId={GovernanceSlotId.GOVERNANCE_DAO_PROPOSAL_LIST}
            plugins={processedPlugins}
            Fallback={DaoProposalListDefault}
            value={value ?? selectedPlugin}
            onValueChange={onValueChange ?? setSelectedPlugin}
            searchParamName={daoProposalListSearchParam}
            {...otherProps}
        />
    );
};

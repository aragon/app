'use client';

import type { IDaoPlugin } from '@/shared/api/daoService';
import { type IPluginTabComponentProps, PluginTabComponent } from '@/shared/components/pluginTabComponent';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { useTranslations } from '@/shared/components/translationsProvider';
import { PluginType } from '@/shared/types';
import type { NestedOmit } from '@/shared/types/nestedOmit';
import type { ReactNode } from 'react';
import type { IGetProposalListParams } from '../../api/governanceService';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import { DaoProposalListDefault } from './daoProposalListDefault';

export interface IDaoProposalListContainerProps
    extends Pick<IPluginTabComponentProps<IDaoPlugin>, 'value' | 'onValueChange'> {
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

export const DaoProposalListContainer: React.FC<IDaoProposalListContainerProps> = (props) => {
    const { initialParams, ...otherProps } = props;

    const { t } = useTranslations();

    const processPlugins = useDaoPlugins({ daoId: initialParams.queryParams.daoId, type: PluginType.PROCESS });
    const processedPlugins = processPlugins?.map((plugin) => {
        const pluginInitialParams = {
            ...initialParams,
            queryParams: { ...initialParams.queryParams, pluginAddress: plugin.meta.address },
        };

        return { ...plugin, props: { initialParams: pluginInitialParams, plugin: plugin.meta } };
    });

    const allProposalsPlugin = processPlugins && processPlugins.length > 1
        ? [{
              id: 'all-proposals',
              uniqueId: 'all-proposals',
              label: t('app.governance.daoProposalsPage.tabs.ALL'),
              meta: {} as IDaoPlugin,
              props: {
                  initialParams: {
                      ...initialParams,
                      queryParams: { ...initialParams.queryParams, pluginAddress: '' },
                  },
                  plugin: {} as IDaoPlugin,
              },
          }, ...processedPlugins]
        : processedPlugins;

    return (
        <PluginTabComponent
            slotId={GovernanceSlotId.GOVERNANCE_DAO_PROPOSAL_LIST}
            plugins={allProposalsPlugin}
            Fallback={DaoProposalListDefault}
            {...otherProps}
        />
    );
};

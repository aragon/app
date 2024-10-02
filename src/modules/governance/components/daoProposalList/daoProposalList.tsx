'use client';

import type { IDaoPlugin } from '@/shared/api/daoService';
import { type IPluginTabComponentProps, PluginTabComponent } from '@/shared/components/pluginTabComponent';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { PluginType } from '@/shared/types';
import type { ReactNode } from 'react';
import type { IGetProposalListParams } from '../../api/governanceService';
import { GovernanceSlotId } from '../../constants/moduleSlots';

export interface IDaoProposalListProps extends Pick<IPluginTabComponentProps<IDaoPlugin>, 'value' | 'onValueChange'> {
    /**
     * Parameters to use for fetching the proposal list.
     */
    initialParams: IGetProposalListParams;
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
    const { initialParams, value, ...otherProps } = props;

    const processPlugins = useDaoPlugins({ daoId: initialParams.queryParams.daoId, type: PluginType.PROCESS });

    const pluginQueryParams = { ...initialParams.queryParams, pluginAddress: value?.meta.address };
    const processedParams = { ...initialParams, queryParams: pluginQueryParams };

    return (
        <PluginTabComponent
            slotId={GovernanceSlotId.GOVERNANCE_DAO_PROPOSAL_LIST}
            plugins={processPlugins}
            value={value}
            initialParams={processedParams}
            {...otherProps}
        />
    );
};

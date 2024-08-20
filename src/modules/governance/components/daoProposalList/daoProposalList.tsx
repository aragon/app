'use client';

import { PluginComponent } from '@/shared/components/pluginComponent';
import { useDaoPluginIds } from '@/shared/hooks/useDaoPluginIds';
import type { ReactNode } from 'react';
import type { IGetProposalListParams } from '../../api/governanceService';
import { GovernanceSlotId } from '../../constants/moduleSlots';

export interface IDaoProposalListProps {
    /**
     * DAO id to use for fetching the plugin ids.
     */
    daoId: string;
    /**
     * Initial parameters to use for fetching the proposal list.
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
    const { daoId, initialParams, ...otherProps } = props;

    const pluginIds = useDaoPluginIds(daoId);

    return (
        <PluginComponent
            slotId={GovernanceSlotId.GOVERNANCE_DAO_PROPOSAL_LIST}
            pluginIds={pluginIds}
            initialParams={initialParams}
            daoId={daoId}
            {...otherProps}
        />
    );
};

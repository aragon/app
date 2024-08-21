'use client';

import { PluginComponent } from '@/shared/components/pluginComponent';
import { useDaoPluginIds } from '@/shared/hooks/useDaoPluginIds';
import type { IGetVoteListParams } from '../../api/governanceService';
import { GovernanceSlotId } from '../../constants/moduleSlots';

export interface IVoteListProps {
    /**
     * Parameters to use for fetching the proposal votes.
     */
    initialParams: IGetVoteListParams;
    /**
     * ID of the DAO related to the votes.
     */
    daoId: string;
}

export const VoteList: React.FC<IVoteListProps> = (props) => {
    const { initialParams, daoId } = props;
    const pluginIds = useDaoPluginIds(daoId);

    return (
        <PluginComponent
            slotId={GovernanceSlotId.GOVERNANCE_VOTE_LIST}
            pluginIds={pluginIds}
            initialParams={initialParams}
            daoId={daoId}
        />
    );
};

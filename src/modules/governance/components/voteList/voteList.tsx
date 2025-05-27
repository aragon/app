'use client';

import { PluginTabComponent } from '@/shared/components/pluginTabComponent';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { PluginType } from '@/shared/types';
import type { NestedOmit } from '@/shared/types/nestedOmit';
import type { IGetVoteListParams } from '../../api/governanceService';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import { VoteListFallback } from './voteListFallback';

export interface IVoteListProps {
    /**
     * Parameters to use for fetching the proposal votes.
     */
    initialParams: NestedOmit<IGetVoteListParams, 'queryParams.pluginAddress'>;
    /**
     * ID of the DAO related to the votes.
     */
    daoId: string;
    /**
     * Plugin address to fetch the votes for.
     */
    pluginAddress?: string;
    /**
     * Defines if the voting is to veto or not.
     */
    isVeto?: boolean;
}

export const VoteList: React.FC<IVoteListProps> = (props) => {
    const { initialParams, daoId, pluginAddress, isVeto } = props;

    const processPlugins = useDaoPlugins({ daoId, type: PluginType.BODY, pluginAddress, includeSubPlugins: true });
    const processedPlugins = processPlugins?.map((plugin) => {
        const pluginInitialParams = {
            ...initialParams,
            queryParams: { ...initialParams.queryParams, pluginAddress: plugin.meta.address },
        };
        return { ...plugin, props: { initialParams: pluginInitialParams } };
    });

    return (
        <PluginTabComponent
            slotId={GovernanceSlotId.GOVERNANCE_VOTE_LIST}
            plugins={processedPlugins}
            daoId={daoId}
            isVeto={isVeto}
            Fallback={VoteListFallback}
        />
    );
};

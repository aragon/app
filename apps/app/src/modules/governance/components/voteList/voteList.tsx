'use client';

import { PluginFilterComponent } from '@/shared/components/pluginFilterComponent';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { PluginType } from '@/shared/types';
import type { NestedOmit } from '@/shared/types/nestedOmit';
import type { IGetVoteListParams } from '../../api/governanceService';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import { voteListFilterParam } from './voteListConstants';
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
    /**
     * Unique ID (plugin tab ID) of the plugin to open on when the URL names none. A valid `vote` URL parameter takes
     * precedence, and the user can still switch tabs.
     */
    defaultPluginId?: string;
}

export const VoteList: React.FC<IVoteListProps> = (props) => {
    const { initialParams, daoId, pluginAddress, isVeto, defaultPluginId } =
        props;

    const processPlugins = useDaoPlugins({
        daoId,
        type: PluginType.BODY,
        pluginAddress,
        includeSubPlugins: true,
        includeLinkedAccounts: true,
    });
    const processedPlugins = processPlugins?.map((plugin) => {
        const pluginInitialParams = {
            ...initialParams,
            queryParams: {
                ...initialParams.queryParams,
                pluginAddress: plugin.meta.address,
            },
        };
        return { ...plugin, props: { initialParams: pluginInitialParams } };
    });

    return (
        <PluginFilterComponent
            daoId={daoId}
            Fallback={VoteListFallback}
            isVeto={isVeto}
            plugins={processedPlugins}
            searchParamName={voteListFilterParam}
            slotId={GovernanceSlotId.GOVERNANCE_VOTE_LIST}
            value={processedPlugins?.find(
                (plugin) => plugin.uniqueId === defaultPluginId,
            )}
        />
    );
};

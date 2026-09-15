'use client';

import {
    DataListContainer,
    DataListPagination,
    DataListRoot,
    ProposalDataListItem,
} from '@aragon/gov-ui-kit';
import { DaoProposalListDefaultItem } from '@/modules/governance/components/daoProposalList';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { proposalUtils } from '@/modules/governance/utils/proposalUtils';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IWorkspaceAccountRef } from '../../api/workspaceQueryService';
import type { IWorkspaceAccount } from '../../api/workspaceService';
import { useWorkspaceDaos } from '../../hooks/useWorkspaceDaos';
import { useWorkspaceProposalListData } from '../../hooks/useWorkspaceProposalListData';
import { workspaceUtils } from '../../utils/workspaceUtils';

export interface IWorkspaceProposalListProps {
    /**
     * DAO accounts to aggregate the proposals of.
     */
    accounts: IWorkspaceAccount[];
    /**
     * Number of proposals to read per page.
     */
    pageSize: number;
}

/**
 * Aggregated proposal list of a workspace, laid out like `DaoProposalListDefault` of the DAO pages and reusing its
 * rows, so plugin-specific items keep rendering their own details.
 *
 * Each row is tagged with the name of the DAO it belongs to, which the DAO pages never need. The name comes from
 * the metadata the endpoint embeds, while the link and the slug need the full DAO — see `useWorkspaceDaos`.
 */
export const WorkspaceProposalList: React.FC<IWorkspaceProposalListProps> = (
    props,
) => {
    const { accounts, pageSize } = props;

    const { t } = useTranslations();

    const { daos, isPending: isDaosPending } = useWorkspaceDaos(accounts);

    const accountRefs: IWorkspaceAccountRef[] = accounts.map(
        ({ network, address }) => ({ network, address }),
    );

    const {
        onLoadMore,
        proposalList,
        state,
        itemsCount,
        emptyState,
        errorState,
    } = useWorkspaceProposalListData({
        params: { body: { accounts: accountRefs, pagination: { pageSize } } },
        isDaosPending,
        enabled: accounts.length > 0,
    });

    return (
        <DataListRoot
            entityLabel={t('app.workspace.workspaceProposalList.entity')}
            itemsCount={itemsCount}
            onLoadMore={onLoadMore}
            pageSize={pageSize}
            state={state}
        >
            <DataListContainer
                emptyState={emptyState}
                errorState={errorState}
                layoutClassName="grid grid-cols-1"
                SkeletonElement={ProposalDataListItem.Skeleton}
            >
                {proposalList.map((proposal) => {
                    const accountId = workspaceUtils.buildAccountId({
                        network: proposal.network,
                        address: proposal.daoAddress,
                    });
                    const dao = daos[accountId];

                    // The rows wait for the DAOs, so a missing one means its read failed. The item components
                    // require a DAO for the link and the publisher, so the row is dropped rather than rendered
                    // half-broken.
                    if (dao == null) {
                        return null;
                    }

                    return (
                        <PluginSingleComponent
                            dao={dao}
                            Fallback={DaoProposalListDefaultItem}
                            key={proposal.id}
                            pluginId={proposal.pluginInterfaceType}
                            proposal={proposal}
                            proposalSlug={proposalUtils.getProposalSlug(
                                proposal,
                                dao,
                            )}
                            slotId={
                                GovernanceSlotId.GOVERNANCE_DAO_PROPOSAL_LIST_ITEM
                            }
                            tag={dao.name}
                        />
                    );
                })}
            </DataListContainer>
            <DataListPagination />
        </DataListRoot>
    );
};

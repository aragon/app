import type { IGetProposalListParams, IProposal } from '@/modules/governance/api/governanceService';
import { useProposalListData } from '@/modules/governance/hooks/useProposalListData';
import { useDao, type IDaoPlugin, type IPluginSettings } from '@/shared/api/daoService';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
import { DataListContainer, DataListPagination, DataListRoot, ProposalDataListItem } from '@aragon/gov-ui-kit';
import type { ReactNode } from 'react';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import { proposalUtils } from '../../utils/proposalUtils';
import { DaoProposalListDefaultItem } from './daoProposalListDefaultItem';

export interface IDaoProposalListDefaultProps<TSettings extends IPluginSettings = IPluginSettings> {
    /**
     * Initial parameters to use for fetching the proposal list.
     */
    initialParams: IGetProposalListParams;
    /**
     * DAO plugin to display to proposals for.
     */
    plugin: IDaoPlugin<TSettings>;
    /**
     * Hides the pagination when set to true.
     */
    hidePagination?: boolean;
    /**
     * Children of the component.
     */
    children?: ReactNode;
}

export const DaoProposalListDefault: React.FC<IDaoProposalListDefaultProps> = (props) => {
    const { initialParams, hidePagination, children } = props;
    const { daoId } = initialParams.queryParams;

    const { t } = useTranslations();
    const { data: dao } = useDao({ urlParams: { id: daoId } });

    const { onLoadMore, state, pageSize, itemsCount, errorState, emptyState, proposalList } =
        useProposalListData(initialParams);

    const getProposalSlug = (proposal: IProposal) => {
        const { pluginAddress, incrementalId } = proposal;
        const [plugin] = daoUtils.getDaoPlugins(dao, { pluginAddress, includeSubPlugins: true })!;
        const proposalSlug = proposalUtils.getProposalSlug(incrementalId, plugin);

        return proposalSlug;
    };

    return (
        <DataListRoot
            entityLabel={t('app.governance.daoProposalList.entity')}
            onLoadMore={onLoadMore}
            state={state}
            pageSize={pageSize}
            itemsCount={itemsCount}
        >
            <DataListContainer
                SkeletonElement={ProposalDataListItem.Skeleton}
                emptyState={emptyState}
                errorState={errorState}
                layoutClassName="grid grid-cols-1"
            >
                {proposalList?.map((proposal) => (
                    <PluginSingleComponent
                        key={proposal.id}
                        pluginId={proposal.pluginSubdomain}
                        slotId={GovernanceSlotId.GOVERNANCE_DAO_PROPOSAL_LIST_ITEM}
                        dao={dao}
                        proposal={proposal}
                        proposalSlug={getProposalSlug(proposal)}
                        Fallback={DaoProposalListDefaultItem}
                    />
                ))}
            </DataListContainer>
            {!hidePagination && <DataListPagination />}
            {children}
        </DataListRoot>
    );
};

import type { IDaoProposalListDefaultProps } from '@/modules/governance/components/daoProposalList';
import { useProposalListData } from '@/modules/governance/hooks/useProposalListData';
import type { ISppProposal } from '@/plugins/sppPlugin/types';
import { useTranslations } from '@/shared/components/translationsProvider';
import { DataListContainer, DataListPagination, DataListRoot, ProposalDataListItem } from '@aragon/gov-ui-kit';
import { SppProposalListItem } from './sppProposalListItem';

export interface ISppProposalListProps extends IDaoProposalListDefaultProps {}

export const SppProposalList: React.FC<ISppProposalListProps> = (props) => {
    const { initialParams, hidePagination, children } = props;
    const { daoId } = initialParams.queryParams;

    const { t } = useTranslations();

    const { onLoadMore, state, pageSize, itemsCount, errorState, emptyState, proposalList } =
        useProposalListData<ISppProposal>(initialParams);

    return (
        <DataListRoot
            entityLabel={t('app.plugins.spp.sppProposalList.entity')}
            onLoadMore={onLoadMore}
            state={state}
            pageSize={pageSize}
            itemsCount={itemsCount}
        >
            <DataListContainer
                SkeletonElement={ProposalDataListItem.Skeleton}
                layoutClassName="grid grid-cols-1"
                errorState={errorState}
                emptyState={emptyState}
            >
                {proposalList?.map((proposal) => (
                    <SppProposalListItem key={proposal.id} proposal={proposal} daoId={daoId} />
                ))}
            </DataListContainer>
            {!hidePagination && <DataListPagination />}
            {children}
        </DataListRoot>
    );
};

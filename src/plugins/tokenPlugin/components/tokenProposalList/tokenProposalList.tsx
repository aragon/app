import type { IDaoProposalListProps } from '@/modules/governance/components/daoProposalList';
import { useProposalListData } from '@/modules/governance/hooks/useProposalListData';
import { useTranslations } from '@/shared/components/translationsProvider';
import { DataListContainer, DataListPagination, DataListRoot, ProposalDataListItem } from '@aragon/ods';
import type { ITokenProposal } from '../../types';
import { TokenProposalListItem } from './tokenProposalListItem';

export interface ITokenProposalListProps extends IDaoProposalListProps {}

export const TokenProposalList: React.FC<ITokenProposalListProps> = (props) => {
    const { daoId, params, hidePagination, children } = props;

    const { t } = useTranslations();

    const { onLoadMore, state, pageSize, itemsCount, errorState, emptyState, proposalList } =
        useProposalListData<ITokenProposal>(params);

    return (
        <DataListRoot
            entityLabel={t('app.plugins.token.tokenProposalList.entity')}
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
                    <TokenProposalListItem key={proposal.id} proposal={proposal} daoId={daoId} />
                ))}
            </DataListContainer>
            {!hidePagination && <DataListPagination />}
            {children}
        </DataListRoot>
    );
};

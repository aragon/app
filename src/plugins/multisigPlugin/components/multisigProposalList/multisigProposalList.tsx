import type { IDaoProposalListDefaultProps } from '@/modules/governance/components/daoProposalList';
import { useProposalListData } from '@/modules/governance/hooks/useProposalListData';
import { useTranslations } from '@/shared/components/translationsProvider';
import { DataListContainer, DataListPagination, DataListRoot, ProposalDataListItem } from '@aragon/ods';
import type { IMultisigProposal } from '../../types';
import { MultisigProposalListItem } from './multisigProposalListItem';

export interface IMultisigProposalListProps extends IDaoProposalListDefaultProps {}

export const MultisigProposalList: React.FC<IMultisigProposalListProps> = (props) => {
    const { initialParams, hidePagination, children } = props;
    const { daoId } = initialParams.queryParams;

    const { t } = useTranslations();

    const { onLoadMore, state, pageSize, itemsCount, errorState, emptyState, proposalList } =
        useProposalListData<IMultisigProposal>(initialParams);

    return (
        <DataListRoot
            entityLabel={t('app.plugins.multisig.multisigProposalList.entity')}
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
                    <MultisigProposalListItem key={proposal.id} proposal={proposal} daoId={daoId} />
                ))}
            </DataListContainer>
            {!hidePagination && <DataListPagination />}
            {children}
        </DataListRoot>
    );
};

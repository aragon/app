import type { IDaoProposalListDefaultProps } from '@/modules/governance/components/daoProposalList';
import { useProposalListData } from '@/modules/governance/hooks/useProposalListData';
import type { ISppProposal } from '@/plugins/sppPlugin/types';
import { useTranslations } from '@/shared/components/translationsProvider';
import { DataListContainer, DataListPagination, DataListRoot, ProposalDataListItem } from '@aragon/gov-ui-kit';
import { useDao } from '../../../../shared/api/daoService';
import { SppProposalListItem } from './sppProposalListItem';

export interface ISppProposalListProps extends IDaoProposalListDefaultProps {}

export const SppProposalList: React.FC<ISppProposalListProps> = (props) => {
    const { initialParams, hidePagination, plugin, children } = props;
    const { daoId } = initialParams.queryParams;

    const { t } = useTranslations();

    const { onLoadMore, state, pageSize, itemsCount, errorState, emptyState, proposalList } =
        useProposalListData<ISppProposal>(initialParams);
    const { data: dao } = useDao({ urlParams: { id: daoId } });

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
                {dao &&
                    proposalList?.map((proposal) => (
                        <SppProposalListItem key={proposal.id} proposal={proposal} dao={dao} plugin={plugin} />
                    ))}
            </DataListContainer>
            {!hidePagination && <DataListPagination />}
            {children}
        </DataListRoot>
    );
};

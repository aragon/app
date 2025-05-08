import type { IDaoProposalListDefaultProps } from '@/modules/governance/components/daoProposalList';
import { useProposalListData } from '@/modules/governance/hooks/useProposalListData';
import { useDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
import { DataListContainer, DataListPagination, DataListRoot, ProposalDataListItem } from '@aragon/gov-ui-kit';
import type { ITokenProposal } from '../../types';
import { TokenProposalListItem } from './tokenProposalListItem';

export interface ITokenProposalListProps extends IDaoProposalListDefaultProps {}

export const TokenProposalList: React.FC<ITokenProposalListProps> = (props) => {
    const { initialParams, hidePagination, plugin, children } = props;
    const { daoId } = initialParams.queryParams;

    const { t } = useTranslations();

    const { onLoadMore, state, pageSize, itemsCount, errorState, emptyState, proposalList } =
        useProposalListData<ITokenProposal>(initialParams);
    const { data: dao } = useDao({ urlParams: { id: daoId } });

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
                {dao &&
                    proposalList?.map((proposal) => (
                        <TokenProposalListItem
                            key={proposal.id}
                            proposal={proposal}
                            daoUrl={daoUtils.getDaoUrl(dao)}
                            plugin={plugin}
                        />
                    ))}
            </DataListContainer>
            {!hidePagination && <DataListPagination />}
            {children}
        </DataListRoot>
    );
};

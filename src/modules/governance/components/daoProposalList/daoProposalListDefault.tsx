import type { IGetProposalListParams } from '@/modules/governance/api/governanceService';
import { useProposalListData } from '@/modules/governance/hooks/useProposalListData';
import type { IDaoPlugin, IPluginSettings } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { DataListContainer, DataListPagination, DataListRoot, ProposalDataListItem } from '@aragon/gov-ui-kit';
import type { ReactNode } from 'react';
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

    const { onLoadMore, state, pageSize, itemsCount, errorState, emptyState, proposalList } =
        useProposalListData(initialParams);

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
                    <DaoProposalListDefaultItem key={proposal.id} daoId={daoId} proposal={proposal} />
                ))}
            </DataListContainer>
            {!hidePagination && <DataListPagination />}
            {children}
        </DataListRoot>
    );
};

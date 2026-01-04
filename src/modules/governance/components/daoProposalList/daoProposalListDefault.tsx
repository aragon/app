import {
    DataListContainer,
    DataListPagination,
    DataListRoot,
    ProposalDataListItem,
} from '@aragon/gov-ui-kit';
import type { ReactNode } from 'react';
import type { IGetProposalListParams } from '@/modules/governance/api/governanceService';
import { useProposalListData } from '@/modules/governance/hooks/useProposalListData';
import {
    type IDaoPlugin,
    type IPluginSettings,
    useDao,
} from '@/shared/api/daoService';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import { proposalUtils } from '../../utils/proposalUtils';
import { DaoProposalListDefaultItem } from './daoProposalListDefaultItem';

export interface IDaoProposalListDefaultProps<
    TSettings extends IPluginSettings = IPluginSettings,
> {
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

export const DaoProposalListDefault: React.FC<IDaoProposalListDefaultProps> = (
    props,
) => {
    const { initialParams, hidePagination, children } = props;
    const { daoId } = initialParams.queryParams;

    const { t } = useTranslations();
    const { data: dao } = useDao({ urlParams: { id: daoId } });

    const {
        onLoadMore,
        state,
        pageSize,
        itemsCount,
        errorState,
        emptyState,
        proposalList,
    } = useProposalListData(initialParams);

    return (
        <DataListRoot
            entityLabel={t('app.governance.daoProposalList.entity')}
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
                {proposalList?.map((proposal) => (
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
                    />
                ))}
            </DataListContainer>
            {!hidePagination && <DataListPagination />}
            {children}
        </DataListRoot>
    );
};

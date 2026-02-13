import {
    DataListContainer,
    DataListPagination,
    DataListRoot,
    ProposalDataListItem,
} from '@aragon/gov-ui-kit';
import { type ReactNode, useMemo } from 'react';
import type { IGetProposalListParams } from '@/modules/governance/api/governanceService';
import { useProposalListData } from '@/modules/governance/hooks/useProposalListData';
import {
    type IDaoPlugin,
    type IPluginSettings,
    useDao,
} from '@/shared/api/daoService';
import { PluginSingleComponent } from '@/shared/components/pluginSingleComponent';
import { useTranslations } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
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
    const { initialParams, plugin, hidePagination, children } = props;
    const { daoId } = initialParams.queryParams;

    const { t } = useTranslations();

    // Always use the parent DAO for the UI context — its plugins array is a
    // flat list that includes subDAO plugins, so getProposalSlug / getProposalUrl
    // can resolve any plugin by address.  The parent DAO is server-side
    // prefetched, so this is always a cache hit on initial render.
    const { data: dao } = useDao({ urlParams: { id: daoId } });

    // For subDAO plugins the API call must target the subDAO's own daoId so the
    // backend queries the correct DAO.
    const apiParams = useMemo(() => {
        const resolvedDaoId = daoUtils.resolvePluginDaoId(daoId, plugin, dao);

        if (resolvedDaoId === daoId) {
            return initialParams;
        }

        return {
            ...initialParams,
            queryParams: {
                ...initialParams.queryParams,
                daoId: resolvedDaoId,
            },
        };
    }, [initialParams, plugin, dao, daoId]);

    const {
        onLoadMore,
        state,
        pageSize,
        itemsCount,
        errorState,
        emptyState,
        proposalList,
    } = useProposalListData(apiParams);

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

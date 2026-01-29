import {
    DataListContainer,
    DataListPagination,
    DataListRoot,
    invariant,
    ProposalDataListItem,
} from '@aragon/gov-ui-kit';
import { useAccount } from 'wagmi';
import type { IDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { dataListUtils } from '@/shared/utils/dataListUtils';
import { useMemberLocks } from '../../api/locksService';
import type { IGaugeVoterPlugin } from '../../types';
import { GaugeVoterLockListItem } from './gaugeVoterLockListItem';

export interface IGaugeVoterLockListProps {
    /**
     * DAO with the gauge-voter plugin.
     */
    dao: IDao;
    /**
     * Gauge voter plugin containing voting escrow settings.
     */
    plugin: IGaugeVoterPlugin;
}

export const GaugeVoterLockList: React.FC<IGaugeVoterLockListProps> = (
    props,
) => {
    const { dao, plugin } = props;

    const { t } = useTranslations();
    const { address } = useAccount();

    const { votingEscrow } = plugin.settings;
    const { votingEscrow: votingEscrowAddresses } = plugin;

    invariant(
        votingEscrow != null && votingEscrowAddresses != null,
        'GaugeVoterLockList: escrow settings are required',
    );

    const { escrowAddress } = votingEscrowAddresses;

    const memberLocksQueryParams = {
        network: dao.network,
        escrowAddress,
        onlyActive: true,
    };
    const {
        data,
        status,
        fetchStatus,
        isFetchingNextPage,
        fetchNextPage,
        refetch: refetchMemberLocks,
    } = useMemberLocks(
        {
            urlParams: { address: address! },
            queryParams: memberLocksQueryParams,
        },
        { enabled: address != null },
    );

    const state = dataListUtils.queryToDataListState({
        status,
        fetchStatus,
        isFetchingNextPage,
    });
    const locksList = data?.pages.flatMap((page) => page.data);

    const pageSize = data?.pages[0].metadata.pageSize;
    const itemsCount = data?.pages[0].metadata.totalRecords;

    const errorState = {
        heading: t('app.plugins.gaugeVoter.gaugeVoterLockList.error.title'),
        description: t(
            'app.plugins.gaugeVoter.gaugeVoterLockList.error.description',
        ),
    };

    const emptyState = {
        heading: t('app.plugins.gaugeVoter.gaugeVoterLockList.empty.title'),
        description: t(
            'app.plugins.gaugeVoter.gaugeVoterLockList.empty.description',
        ),
    };

    return (
        <DataListRoot
            entityLabel={t('app.plugins.gaugeVoter.gaugeVoterLockList.entity')}
            itemsCount={itemsCount}
            onLoadMore={fetchNextPage}
            pageSize={pageSize}
            state={state}
        >
            <DataListContainer
                emptyState={emptyState}
                errorState={errorState}
                SkeletonElement={ProposalDataListItem.Skeleton}
            >
                {locksList?.map((lock) => (
                    <GaugeVoterLockListItem
                        dao={dao}
                        key={lock.id}
                        lock={lock}
                        onRefreshNeeded={() => void refetchMemberLocks()}
                        plugin={plugin}
                    />
                ))}
            </DataListContainer>
            <DataListPagination />
        </DataListRoot>
    );
};

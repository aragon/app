import type { ITokenPlugin } from '@/plugins/tokenPlugin/types';
import type { IDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { dataListUtils } from '@/shared/utils/dataListUtils';
import {
    DataListContainer,
    DataListPagination,
    DataListRoot,
    invariant,
    ProposalDataListItem,
} from '@aragon/gov-ui-kit';
import { useAccount } from 'wagmi';
import { useMemberLocks } from '../../../../api/tokenService';
import { TokenLockListItem } from './tokenLockListItem';

export interface ITokenLockListProps {
    /**
     * DAO with the token-voting plugin.
     */
    dao: IDao;
    /**
     * Token plugin containing voting escrow settings.
     */
    plugin: ITokenPlugin;
}

export const TokenLockList: React.FC<ITokenLockListProps> = (props) => {
    const { dao, plugin } = props;

    const { t } = useTranslations();
    const { address } = useAccount();

    const { votingEscrow } = plugin.settings;
    const { votingEscrow: votingEscrowAddresses } = plugin;

    invariant(votingEscrow != null && votingEscrowAddresses != null, 'TokenLockList: escrow settings are required');

    const { escrowAddress } = votingEscrowAddresses;

    const memberLocksQueryParams = { network: dao.network, escrowAddress, onlyActive: true };
    const { data, status, fetchStatus, isFetchingNextPage, fetchNextPage, refetch } = useMemberLocks(
        { urlParams: { address: address! }, queryParams: memberLocksQueryParams },
        { enabled: address != null },
    );

    const state = dataListUtils.queryToDataListState({ status, fetchStatus, isFetchingNextPage });
    const locksList = data?.pages.flatMap((page) => page.data);

    const pageSize = data?.pages[0].metadata.pageSize;
    const itemsCount = data?.pages[0].metadata.totalRecords;

    const errorState = {
        heading: t('app.plugins.token.tokenLockList.error.title'),
        description: t('app.plugins.token.tokenLockList.error.description'),
    };

    const emptyState = {
        heading: t('app.plugins.token.tokenLockList.empty.title'),
        description: t('app.plugins.token.tokenLockList.empty.description'),
    };

    return (
        <DataListRoot
            entityLabel={t('app.plugins.token.tokenLockList.entity')}
            onLoadMore={fetchNextPage}
            state={state}
            pageSize={pageSize}
            itemsCount={itemsCount}
        >
            <DataListContainer
                SkeletonElement={ProposalDataListItem.Skeleton}
                errorState={errorState}
                emptyState={emptyState}
            >
                {locksList?.map((lock) => (
                    <TokenLockListItem key={lock.id} lock={lock} plugin={plugin} dao={dao} onRefreshNeeded={refetch} />
                ))}
            </DataListContainer>
            <DataListPagination />
        </DataListRoot>
    );
};

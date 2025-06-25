import type { IDao, IDaoPlugin } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { dataListUtils } from '@/shared/utils/dataListUtils';
import { DataListContainer, DataListPagination, DataListRoot, ProposalDataListItem } from '@aragon/gov-ui-kit';
import { useAccount } from 'wagmi';
import { useMemberLocks } from '../../../../api/tokenService';
import type { ITokenPluginSettings } from '../../../../types';
import { TokenLockListItem } from './tokenLockListItem';

export interface ITokenLockListProps {
    /**
     * DAO with the token-voting plugin.
     */
    dao: IDao;
    /**
     * Token plugin containing voting escrow settings.
     */
    plugin: IDaoPlugin<ITokenPluginSettings>;
    /**
     * Callback called on lock dialog close.
     */
    onLockDialogClose?: () => void;
}

export const TokenLockList: React.FC<ITokenLockListProps> = (props) => {
    const { dao, plugin, onLockDialogClose } = props;

    const { t } = useTranslations();
    const { address } = useAccount();

    const memberLocksQueryParams = { network: dao.network, pluginAddress: plugin.address, onlyActive: true };
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
                    <TokenLockListItem
                        key={lock.id}
                        lock={lock}
                        plugin={plugin}
                        dao={dao}
                        onLockDialogClose={onLockDialogClose}
                        onRefreshNeeded={refetch}
                    />
                ))}
            </DataListContainer>
            <DataListPagination />
        </DataListRoot>
    );
};

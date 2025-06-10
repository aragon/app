import type { IDaoPlugin } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { DataListContainer, DataListPagination, DataListRoot, ProposalDataListItem } from '@aragon/gov-ui-kit';
import type { IGetMemberLocksParams } from '../../api/tokenService';
import { useTokenLockListData } from '../../hooks/useTokenLockListData';
import type { ITokenPluginSettings } from '../../types';
import { TokenLockListItem } from './components/tokenLockListItem';

export interface ITokenLockListProps {
    /**
     * Initial parameters to use for fetching the token locks.
     */
    initialParams: IGetMemberLocksParams;
    /**
     * Token plugin containing voting escrow settings.
     */
    plugin: IDaoPlugin<ITokenPluginSettings>;
}

export const TokenLockList: React.FC<ITokenLockListProps> = (props) => {
    const { initialParams, plugin } = props;
    const { t } = useTranslations();
    const { locksList, onLoadMore, state, pageSize, itemsCount, errorState, emptyState } =
        useTokenLockListData(initialParams);
    const network = initialParams.queryParams.network;

    return (
        <DataListRoot
            entityLabel={t('app.plugins.token.tokenLockList.entity')}
            onLoadMore={onLoadMore}
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
                    <TokenLockListItem key={lock.id} lock={lock} plugin={plugin} network={network} />
                ))}
            </DataListContainer>
            <DataListPagination />
        </DataListRoot>
    );
};

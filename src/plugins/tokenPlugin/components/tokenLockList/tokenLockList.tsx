import type { IDaoPlugin } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { DataListContainer, DataListPagination, DataListRoot, ProposalDataListItem } from '@aragon/gov-ui-kit';
import type { IGetMemberLocksParams } from '../../api/tokenService';
import { useTokenLocksListData } from '../../hooks/useTokenLocksListData';
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
        useTokenLocksListData(initialParams);

    return (
        <DataListRoot
            entityLabel={t('app.plugins.token.tokenLocksList.entity')}
            onLoadMore={onLoadMore}
            state={state}
            pageSize={pageSize}
            itemsCount={itemsCount}
        >
            <DataListContainer
                SkeletonElement={ProposalDataListItem.Skeleton} // TODO: create skeleton for ve locks, but maybe this one fits!
                errorState={errorState}
                emptyState={emptyState}
            >
                {locksList?.map((lock) => <TokenLockListItem key={lock.id} lock={lock} plugin={plugin} />)}
            </DataListContainer>
            <DataListPagination />
        </DataListRoot>
    );
};

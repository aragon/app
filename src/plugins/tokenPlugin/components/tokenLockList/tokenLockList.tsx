import { useTranslations } from '@/shared/components/translationsProvider';
import { DataListContainer, DataListPagination, DataListRoot, ProposalDataListItem } from '@aragon/gov-ui-kit';
import type { ITokenLocksDialogParams } from '../../dialogs/tokenLocksDialog';
import { useTokenLocksListData } from '../../hooks/useTokenLocksListData';
import { TokenLockListItem } from './components/tokenLockListItem';

export interface ITokenLockListProps extends ITokenLocksDialogParams {}

export const TokenLockList: React.FC<ITokenLockListProps> = (props) => {
    const { initialParams, votingEscrow, token } = props;
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
                {locksList?.map((lock) => (
                    <TokenLockListItem key={lock.id} lock={lock} votingEscrow={votingEscrow} token={token} />
                ))}
            </DataListContainer>
            <DataListPagination />
        </DataListRoot>
    );
};

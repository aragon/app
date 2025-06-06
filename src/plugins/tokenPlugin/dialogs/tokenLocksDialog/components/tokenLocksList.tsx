import { useTranslations } from '@/shared/components/translationsProvider';
import { DataListContainer, DataListPagination, DataListRoot, ProposalDataListItem } from '@aragon/gov-ui-kit';
import { useTokenLocksListData } from '../../../hooks/useTokenLocksListData';
import type { ITokenLocksDialogParams } from '../tokenLocksDialog';
import { TokenLocksListItem } from './tokenLocksListItem';

export interface ITokenLocksListProps extends ITokenLocksDialogParams {}

export const TokenLocksList: React.FC<ITokenLocksListProps> = (props) => {
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
                SkeletonElement={ProposalDataListItem.Skeleton} // TODO: create skeleton for ve locks
                errorState={errorState}
                emptyState={emptyState}
            >
                {locksList?.map((lock) => (
                    <TokenLocksListItem key={lock.id} lock={lock} votingEscrow={votingEscrow} token={token} />
                ))}
            </DataListContainer>
            <DataListPagination />
        </DataListRoot>
    );
};

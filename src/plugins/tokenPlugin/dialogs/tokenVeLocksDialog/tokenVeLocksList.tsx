import { useTranslations } from '@/shared/components/translationsProvider';
import { DataListContainer, DataListPagination, DataListRoot, ProposalDataListItem } from '@aragon/gov-ui-kit';
import { useTokenLocksListData } from '../../hooks/useTokenLocksListData';
import type { ITokenVeLocksDialogParams } from './tokenVeLocksDialog';
import { TokenVeLocksListItem } from './tokenVeLocksListItem';

export interface ITokenVeLocksListProps extends ITokenVeLocksDialogParams {}

export const TokenVeLocksList: React.FC<ITokenVeLocksListProps> = (props) => {
    const { initialParams, votingEscrow, token } = props;
    const { t } = useTranslations();
    const { locksList, onLoadMore, state, pageSize, itemsCount, errorState, emptyState } =
        useTokenLocksListData(initialParams);

    return (
        <DataListRoot
            entityLabel={t('app.plugins.token.tokenVeLocksList.entity')}
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
                {locksList?.map((lock) => <TokenVeLocksListItem lock={lock} />)}
            </DataListContainer>
            <DataListPagination />
        </DataListRoot>
    );
};

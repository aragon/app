import type { IVoteListProps } from '@/modules/governance/components/voteList';
import { useVoteListData } from '@/modules/governance/hooks/useVoteListData';
import { useTranslations } from '@/shared/components/translationsProvider';
import { DataListContainer, DataListPagination, DataListRoot, VoteDataListItem } from '@aragon/ods';
import { type IMultisigVote } from '../../types';

export interface IMultisigVoteListProps extends IVoteListProps {}

export const MultisigVoteList: React.FC<IMultisigVoteListProps> = (props) => {
    const { params, daoId } = props;

    const { t } = useTranslations();

    const { onLoadMore, state, pageSize, itemsCount, errorState, emptyState, voteList } =
        useVoteListData<IMultisigVote>(params);

    return (
        <DataListRoot
            entityLabel={t('app.plugins.multisig.multisigVoteList.entity')}
            onLoadMore={onLoadMore}
            state={state}
            pageSize={pageSize}
            itemsCount={itemsCount}
        >
            <DataListContainer
                SkeletonElement={VoteDataListItem.Skeleton}
                emptyState={emptyState}
                errorState={errorState}
            >
                {voteList?.map((vote) => (
                    <VoteDataListItem.Structure
                        key={vote.transactionHash}
                        href={`/dao/${daoId}/members/${vote.memberAddress}`}
                        voteIndicator="approve"
                        voter={{ address: vote.memberAddress }}
                    />
                ))}
            </DataListContainer>
            <DataListPagination />
        </DataListRoot>
    );
};

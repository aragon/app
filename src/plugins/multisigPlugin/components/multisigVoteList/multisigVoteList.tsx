import type { IVoteListProps } from '@/modules/governance/components/voteList';
import { useVoteListData } from '@/modules/governance/hooks/useVoteListData';
import { useTranslations } from '@/shared/components/translationsProvider';
import {
    DataListContainer,
    DataListPagination,
    DataListRoot,
    VoteDataListItem,
    VoteProposalDataListItem,
} from '@aragon/ods';
import { type IMultisigVote } from '../../types';

export interface IMultisigVoteListProps extends IVoteListProps {}

export const MultisigVoteList: React.FC<IMultisigVoteListProps> = (props) => {
    const { initialParams, daoId } = props;

    const { t } = useTranslations();

    const { onLoadMore, state, pageSize, itemsCount, errorState, emptyState, voteList } =
        useVoteListData<IMultisigVote>(initialParams);

    return (
        <DataListRoot
            entityLabel={t('app.plugins.multisig.multisigVoteList.entity')}
            onLoadMore={onLoadMore}
            state={state}
            pageSize={pageSize}
            itemsCount={itemsCount}
        >
            <DataListContainer
                SkeletonElement={
                    initialParams.queryParams.includeInfo === true
                        ? VoteProposalDataListItem.Skeleton
                        : VoteDataListItem.Skeleton
                }
                emptyState={emptyState}
                errorState={errorState}
            >
                {voteList?.map((vote) =>
                    initialParams.queryParams.includeInfo === true ? (
                        //TODO: Implement proposal id and index for PIP when available from backend (APP-3588)
                        <VoteProposalDataListItem.Structure
                            key={vote.transactionHash}
                            href={`/dao/${daoId}/proposals`}
                            voteIndicator="approve"
                            proposalId={`${vote.proposalInfo?.proposalId}`}
                            proposalTitle={`${vote.proposalInfo?.title}`}
                            date={vote.blockTimestamp * 1000}
                        />
                    ) : (
                        <VoteDataListItem.Structure
                            key={vote.transactionHash}
                            href={`/dao/${daoId}/members/${vote.memberAddress}`}
                            voteIndicator="approve"
                            voter={{ address: vote.memberAddress }}
                        />
                    ),
                )}
            </DataListContainer>
            <DataListPagination />
        </DataListRoot>
    );
};

import type { IGetVoteListParams } from '@/modules/governance/api/governanceService';
import type { IVoteListProps } from '@/modules/governance/components/voteList';
import { useVoteListData } from '@/modules/governance/hooks/useVoteListData';
import { voteListUtils } from '@/modules/governance/utils/voteListUtils';
import { useTranslations } from '@/shared/components/translationsProvider';
import {
    DataListContainer,
    DataListPagination,
    DataListRoot,
    VoteDataListItem,
    VoteProposalDataListItem,
} from '@aragon/gov-ui-kit';
import { type IMultisigVote } from '../../types';

export interface IMultisigVoteListProps extends IVoteListProps {
    /**
     * Parameters to use for fetching votes.
     */
    initialParams: IGetVoteListParams;
}

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
                        <VoteProposalDataListItem.Structure
                            key={vote.transactionHash}
                            href={voteListUtils.getProcessedProposalLink(vote, daoId)}
                            voteIndicator="approve"
                            proposalId={voteListUtils.getProcessedProposalId(vote)}
                            proposalTitle={voteListUtils.getProcessedProposalTitle(vote)}
                            date={vote.blockTimestamp * 1000}
                        />
                    ) : (
                        <VoteDataListItem.Structure
                            key={vote.transactionHash}
                            href={`/dao/${daoId}/members/${vote.member.address}`}
                            voteIndicator="approve"
                            voter={{
                                address: vote.member.address,
                                avatarSrc: vote.member.avatar ?? undefined,
                                name: vote.member.ens ?? undefined,
                            }}
                        />
                    ),
                )}
            </DataListContainer>
            <DataListPagination />
        </DataListRoot>
    );
};

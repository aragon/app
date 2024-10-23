import type { IGetVoteListParams } from '@/modules/governance/api/governanceService';
import type { IVoteListProps } from '@/modules/governance/components/voteList';
import { useVoteListData } from '@/modules/governance/hooks/useVoteListData';
import { useTranslations } from '@/shared/components/translationsProvider';
import {
    DataListContainer,
    DataListPagination,
    DataListRoot,
    VoteDataListItem,
    type VoteIndicator,
    VoteProposalDataListItem,
} from '@aragon/gov-ui-kit';
import { formatUnits } from 'viem';
import { type ITokenVote, VoteOption } from '../../types';

export interface ITokenVoteListProps extends IVoteListProps {
    /**
     * Parameters to use for fetching votes.
     */
    initialParams: IGetVoteListParams;
}

const voteOptionToIndicator: Record<VoteOption, VoteIndicator> = {
    [VoteOption.ABSTAIN]: 'abstain',
    [VoteOption.NO]: 'no',
    [VoteOption.YES]: 'yes',
};

export const TokenVoteList: React.FC<ITokenVoteListProps> = (props) => {
    const { initialParams, daoId } = props;

    const { t } = useTranslations();

    const { onLoadMore, state, pageSize, itemsCount, errorState, emptyState, voteList } =
        useVoteListData<ITokenVote>(initialParams);

    return (
        <DataListRoot
            entityLabel={t('app.plugins.token.tokenVoteList.entity')}
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
                            href={`/dao/${daoId}/proposals/${vote.proposal!.id}`}
                            voteIndicator={voteOptionToIndicator[vote.voteOption]}
                            proposalId={vote.proposal!.proposalIndex.toString()}
                            proposalTitle={vote.proposal!.title}
                            date={vote.blockTimestamp * 1000}
                        />
                    ) : (
                        <VoteDataListItem.Structure
                            key={vote.transactionHash}
                            href={`/dao/${daoId}/members/${vote.member.address}`}
                            voteIndicator={voteOptionToIndicator[vote.voteOption]}
                            voter={{
                                address: vote.member.address,
                                avatarSrc: vote.member.avatar ?? undefined,
                                name: vote.member.ens ?? undefined,
                            }}
                            votingPower={formatUnits(BigInt(vote.votingPower), vote.token.decimals)}
                            tokenSymbol={vote.token.symbol}
                        />
                    ),
                )}
            </DataListContainer>
            <DataListPagination />
        </DataListRoot>
    );
};

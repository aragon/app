import type { IVoteListProps } from '@/modules/governance/components/voteList';
import { useVoteListData } from '@/modules/governance/hooks/useVoteListData';
import { useTranslations } from '@/shared/components/translationsProvider';
import {
    DataListContainer,
    DataListPagination,
    DataListRoot,
    type IVoteDataListItemStructureProps,
    VoteDataListItem,
    VoteProposalDataListItem,
} from '@aragon/ods';
import { formatUnits } from 'viem';
import { type ITokenVote, VoteOption } from '../../types';

export interface ITokenVoteListProps extends IVoteListProps {}

// TODO: use VoteIndicator type when exported from ODS
const voteOptionToIndicator: Record<VoteOption, IVoteDataListItemStructureProps['voteIndicator']> = {
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
                        //TODO: Implement proposal id and index for PIP when available from backend (APP-3588)
                        <VoteProposalDataListItem.Structure
                            key={vote.transactionHash}
                            href={`/dao/${daoId}/proposals`}
                            voteIndicator={voteOptionToIndicator[vote.voteOption]}
                            proposalId={`0${vote.proposalId + 1}`}
                            proposalTitle={vote.proposalInfo!.title}
                            date={vote.blockTimestamp * 1000}
                        />
                    ) : (
                        <VoteDataListItem.Structure
                            key={vote.transactionHash}
                            href={`/dao/${daoId}/members/${vote.memberAddress}`}
                            voteIndicator={voteOptionToIndicator[vote.voteOption]}
                            voter={{ address: vote.memberAddress }}
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

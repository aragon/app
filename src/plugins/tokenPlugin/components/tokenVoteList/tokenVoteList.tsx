import type { IVoteListProps } from '@/modules/governance/components/voteList';
import { useVoteListData } from '@/modules/governance/hooks/useVoteListData';
import { useTranslations } from '@/shared/components/translationsProvider';
import {
    DataListContainer,
    DataListPagination,
    DataListRoot,
    type IVoteDataListItemStructureProps,
    VoteDataListItem,
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
                SkeletonElement={VoteDataListItem.Skeleton}
                emptyState={emptyState}
                errorState={errorState}
            >
                {voteList?.map((vote) => (
                    <VoteDataListItem.Structure
                        key={vote.transactionHash}
                        href={`/dao/${daoId}/members/${vote.memberAddress}`}
                        voteIndicator={voteOptionToIndicator[vote.voteOption]}
                        voter={{ address: vote.memberAddress }}
                        votingPower={formatUnits(BigInt(vote.votingPower), vote.token.decimals)}
                        tokenSymbol={vote.token.symbol}
                    />
                ))}
            </DataListContainer>
            <DataListPagination />
        </DataListRoot>
    );
};

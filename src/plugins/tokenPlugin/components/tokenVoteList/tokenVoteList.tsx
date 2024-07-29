import type { IVoteListProps } from '@/modules/governance/components/voteList';
import { useVoteListData } from '@/modules/governance/hooks/useVoteListData';
import { useTranslations } from '@/shared/components/translationsProvider';
import {
    ChainEntityType,
    DataListContainer,
    DataListPagination,
    DataListRoot,
    type IVoteDataListItemStructureProps,
    useBlockExplorer,
    VoteDataListItem,
} from '@aragon/ods';
import { type ITokenVote, VoteOption } from '../../types';

export interface ITokenVoteListProps extends Pick<IVoteListProps, 'initialParams'> {}

// TODO: use VoteIndicator type when exported from ODS
const voteOptionToIndicator: Record<VoteOption, IVoteDataListItemStructureProps['voteIndicator']> = {
    [VoteOption.ABSTAIN]: 'abstain',
    [VoteOption.NO]: 'no',
    [VoteOption.YES]: 'yes',
};

export const TokenVoteList: React.FC<ITokenVoteListProps> = (props) => {
    const { initialParams } = props;

    const { t } = useTranslations();
    const { buildEntityUrl } = useBlockExplorer();

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
                        // TODO: pass chain-id parameter when buildEntityUrl is updated
                        href={buildEntityUrl({ type: ChainEntityType.TRANSACTION, id: vote.transactionHash })}
                        target="_blank"
                        voteIndicator={voteOptionToIndicator[vote.voteOption]}
                        voter={{ address: vote.memberAddress }}
                        votingPower={vote.votingPower}
                        tokenSymbol={vote.token.symbol}
                    />
                ))}
            </DataListContainer>
            <DataListPagination />
        </DataListRoot>
    );
};

import type { IGetVoteListParams } from '@/modules/governance/api/governanceService';
import type { IVoteListProps } from '@/modules/governance/components/voteList';
import { VoteProposalListItem } from '@/modules/governance/components/voteList';
import { useVoteListData } from '@/modules/governance/hooks/useVoteListData';
import { useDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
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
    const { initialParams, daoId, isVeto } = props;

    const { t } = useTranslations();

    const { onLoadMore, state, pageSize, itemsCount, errorState, emptyState, voteList } =
        useVoteListData<ITokenVote>(initialParams);
    const { data: dao } = useDao({ urlParams: { id: daoId } });

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
                {voteList?.map((vote) => {
                    const voteIndicator = voteOptionToIndicator[vote.voteOption];
                    const voteIndicatorDescription =
                        voteIndicator !== 'abstain'
                            ? t(`app.plugins.token.tokenVoteList.description.${isVeto ? 'veto' : 'approve'}`)
                            : undefined;

                    return initialParams.queryParams.includeInfo === true ? (
                        <VoteProposalListItem
                            key={vote.transactionHash}
                            vote={vote}
                            daoId={daoId}
                            isVeto={isVeto}
                            voteIndicator={voteIndicator}
                            voteIndicatorDescription={voteIndicatorDescription}
                        />
                    ) : (
                        <VoteDataListItem.Structure
                            key={vote.transactionHash}
                            href={daoUtils.getDaoUrl(dao, `members/${vote.member.address}`)}
                            isVeto={isVeto}
                            voteIndicator={voteIndicator}
                            voteIndicatorDescription={voteIndicatorDescription}
                            voter={{
                                address: vote.member.address,
                                avatarSrc: vote.member.avatar ?? undefined,
                                name: vote.member.ens ?? undefined,
                            }}
                            votingPower={formatUnits(BigInt(vote.votingPower), vote.token.decimals)}
                            tokenSymbol={vote.token.symbol}
                        />
                    );
                })}
            </DataListContainer>
            <DataListPagination />
        </DataListRoot>
    );
};

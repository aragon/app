'use client';

import {
    DataListContainer,
    DataListPagination,
    DataListRoot,
    VoteDataListItem,
    type VoteIndicator,
    VoteProposalDataListItem,
} from '@aragon/gov-ui-kit';
import { formatUnits } from 'viem';
import { useEnsAvatar, useEnsName } from '@/modules/ens';
import type { IGetVoteListParams } from '@/modules/governance/api/governanceService';
import type { IVoteListProps } from '@/modules/governance/components/voteList';
import { VoteProposalListItem } from '@/modules/governance/components/voteList';
import { useVoteListData } from '@/modules/governance/hooks/useVoteListData';
import { useDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
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

    const {
        onLoadMore,
        state,
        pageSize,
        itemsCount,
        errorState,
        emptyState,
        voteList,
    } = useVoteListData<ITokenVote>(initialParams);
    const { data: dao } = useDao({ urlParams: { id: daoId } });

    return (
        <DataListRoot
            entityLabel={t('app.plugins.token.tokenVoteList.entity')}
            itemsCount={itemsCount}
            onLoadMore={onLoadMore}
            pageSize={pageSize}
            state={state}
        >
            <DataListContainer
                emptyState={emptyState}
                errorState={errorState}
                SkeletonElement={
                    initialParams.queryParams.includeInfo === true
                        ? VoteProposalDataListItem.Skeleton
                        : VoteDataListItem.Skeleton
                }
            >
                {voteList?.map((vote) => {
                    const voteIndicator =
                        voteOptionToIndicator[vote.voteOption];
                    const voteIndicatorDescription =
                        voteIndicator !== 'abstain'
                            ? t(
                                  `app.plugins.token.tokenVoteList.description.${isVeto ? 'veto' : 'approve'}`,
                              )
                            : undefined;

                    return initialParams.queryParams.includeInfo === true ? (
                        <VoteProposalListItem
                            daoId={daoId}
                            key={vote.transactionHash}
                            vote={vote}
                            voteIndicator={voteIndicator}
                        />
                    ) : (
                        <TokenVoteItem
                            dao={dao}
                            isVeto={isVeto}
                            key={vote.transactionHash}
                            vote={vote}
                            voteIndicator={voteIndicator}
                            voteIndicatorDescription={voteIndicatorDescription}
                        />
                    );
                })}
            </DataListContainer>
            <DataListPagination />
        </DataListRoot>
    );
};

/**
 * Wrapper for a single vote item that resolves the voter's ENS name.
 */
const TokenVoteItem: React.FC<{
    vote: ITokenVote;
    dao: ReturnType<typeof useDao>['data'];
    voteIndicator: VoteIndicator;
    voteIndicatorDescription?: string;
    isVeto?: boolean;
}> = (props) => {
    const { vote, dao, voteIndicator, voteIndicatorDescription, isVeto } =
        props;
    const { data: ensName } = useEnsName(vote.member.address);
    const { data: ensAvatar } = useEnsAvatar(ensName);

    return (
        <VoteDataListItem.Structure
            href={daoUtils.getDaoUrl(dao, `members/${vote.member.address}`)}
            isVeto={isVeto}
            tokenSymbol={vote.token.symbol}
            voteIndicator={voteIndicator}
            voteIndicatorDescription={voteIndicatorDescription}
            voter={{
                address: vote.member.address,
                avatarSrc: ensAvatar ?? undefined,
                name: ensName ?? undefined,
            }}
            votingPower={formatUnits(
                BigInt(vote.votingPower),
                vote.token.decimals,
            )}
        />
    );
};

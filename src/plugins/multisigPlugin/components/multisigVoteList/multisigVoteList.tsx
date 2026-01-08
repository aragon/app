'use client';

import {
    DataListContainer,
    DataListPagination,
    DataListRoot,
    VoteDataListItem,
    VoteProposalDataListItem,
} from '@aragon/gov-ui-kit';
import type { IGetVoteListParams } from '@/modules/governance/api/governanceService';
import {
    type IVoteListProps,
    VoteProposalListItem,
} from '@/modules/governance/components/voteList';
import { useVoteListData } from '@/modules/governance/hooks/useVoteListData';
import { useDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
import type { IMultisigVote } from '../../types';

export interface IMultisigVoteListProps extends IVoteListProps {
    /**
     * Parameters to use for fetching votes.
     */
    initialParams: IGetVoteListParams;
}

export const MultisigVoteList: React.FC<IMultisigVoteListProps> = (props) => {
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
    } = useVoteListData<IMultisigVote>(initialParams);
    const { data: dao } = useDao({ urlParams: { id: daoId } });

    return (
        <DataListRoot
            entityLabel={t('app.plugins.multisig.multisigVoteList.entity')}
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
                    const votingIndicator = isVeto ? 'veto' : 'approve';

                    return initialParams.queryParams.includeInfo === true ? (
                        <VoteProposalListItem
                            daoId={daoId}
                            key={vote.transactionHash}
                            vote={vote}
                            voteIndicator={votingIndicator}
                        />
                    ) : (
                        <VoteDataListItem.Structure
                            href={daoUtils.getDaoUrl(
                                dao,
                                `members/${vote.member.address}`,
                            )}
                            key={vote.transactionHash}
                            voteIndicator={votingIndicator}
                            voter={{
                                address: vote.member.address,
                                avatarSrc: vote.member.avatar ?? undefined,
                                name: vote.member.ens ?? undefined,
                            }}
                        />
                    );
                })}
            </DataListContainer>
            <DataListPagination />
        </DataListRoot>
    );
};

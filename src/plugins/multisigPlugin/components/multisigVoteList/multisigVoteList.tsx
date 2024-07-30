import type { IVoteListProps } from '@/modules/governance/components/voteList';
import { useVoteListData } from '@/modules/governance/hooks/useVoteListData';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import {
    ChainEntityType,
    DataListContainer,
    DataListPagination,
    DataListRoot,
    useBlockExplorer,
    VoteDataListItem,
} from '@aragon/ods';
import { type IMultisigVote } from '../../types';

export interface IMultisigVoteListProps extends Pick<IVoteListProps, 'initialParams'> {}

export const MultisigVoteList: React.FC<IMultisigVoteListProps> = (props) => {
    const { initialParams } = props;

    const { t } = useTranslations();
    const { buildEntityUrl } = useBlockExplorer();

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
                SkeletonElement={VoteDataListItem.Skeleton}
                emptyState={emptyState}
                errorState={errorState}
            >
                {voteList?.map((vote) => (
                    <VoteDataListItem.Structure
                        key={vote.transactionHash}
                        href={buildEntityUrl({
                            type: ChainEntityType.TRANSACTION,
                            id: vote.transactionHash,
                            chainId: networkDefinitions[vote.network].chainId,
                        })}
                        target="_blank"
                        voteIndicator="approve"
                        voter={{ address: vote.memberAddress }}
                    />
                ))}
            </DataListContainer>
            <DataListPagination />
        </DataListRoot>
    );
};

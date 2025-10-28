import { useTranslations } from '@/shared/components/translationsProvider';
import { dataListUtils } from '@/shared/utils/dataListUtils';
import type { DataListState } from '@aragon/gov-ui-kit';
import { DataListContainer, DataListPagination, DataListRoot } from '@aragon/gov-ui-kit';
import { useEffect, useRef } from 'react';
import type { IGetGaugeListParams } from '../../api/gaugeVoterService';
import type { IGaugeReturn } from '../../api/gaugeVoterService/domain';
import { useGaugeList } from '../../api/gaugeVoterService/queries';
import { GaugeVoterGaugeListHeading } from './gaugeVoterGaugeListHeading';
import { GaugeVoterGaugeListItemSkeleton } from './gaugeVoterGaugeListItemSkeleton';
import { GaugeVoterGaugeListItemStructure } from './gaugeVoterGaugeListItemStructure';

export interface IGaugeUserVote {
    gaugeAddress: string;
    /**
     * Formatted user votes for display (e.g., "1.5K").
     */
    formattedVotes: string;
    /**
     * Formatted total votes on gauge (backend with RPC fallback already applied).
     */
    formattedTotalVotes: string;
    /**
     * Numeric value for percentage calculations.
     */
    totalVotesValue: number;
}

export interface IGaugeVoterGaugeListProps {
    /**
     * Initial parameters for gauge list query.
     */
    initialParams: IGetGaugeListParams;
    /**
     * Array of selected gauge addresses.
     */
    selectedGauges?: string[];
    /**
     * Array of voted gauge addresses.
     */
    votedGauges?: readonly string[];
    /**
     * Function to handle gauge selection/deselection.
     */
    onSelect: (gauge: IGaugeReturn) => void;
    /**
     * Function to handle viewing gauge details.
     */
    onViewDetails?: (gauge: IGaugeReturn) => void;
    /**
     * Whether the user is connected.
     */
    isUserConnected: boolean;
    /**
     * Whether voting is active.
     */
    isVotingPeriod: boolean;
    /**
     * Whether user vote data is still loading.
     */
    isUserVotesLoading?: boolean;
    /**
     * Token symbol for voting power display.
     */
    tokenSymbol?: string;
    /**
     * User's votes per gauge from blockchain.
     */
    gaugeVotes: IGaugeUserVote[];
    /**
     * Total voting power for the epoch (for percentage calculations).
     */
    totalEpochVotingPower?: number;
}

export const GaugeVoterGaugeList: React.FC<IGaugeVoterGaugeListProps> = (props) => {
    const {
        initialParams,
        selectedGauges,
        votedGauges,
        onSelect,
        onViewDetails,
        isUserConnected,
        isVotingPeriod,
        tokenSymbol,
        isUserVotesLoading,
        gaugeVotes,
        totalEpochVotingPower,
    } = props;

    const { t } = useTranslations();

    const { data: gaugeListData, fetchNextPage, status, fetchStatus, isFetchingNextPage } = useGaugeList(initialParams);

    const state = dataListUtils.queryToDataListState({ status, fetchStatus, isFetchingNextPage });

    const userVotesLoadedRef = useRef(false);
    useEffect(() => {
        if (!isUserVotesLoading) {
            userVotesLoadedRef.current = true;
        }
    }, [isUserVotesLoading]);

    const shouldShowSkeleton =
        state === 'initialLoading' || (!userVotesLoadedRef.current && (isUserVotesLoading ?? false));
    const effectiveState: DataListState = shouldShowSkeleton ? 'initialLoading' : state;

    const itemsCount = gaugeListData?.pages[0]?.metadata?.totalRecords;
    const pageSize = gaugeListData?.pages[0]?.metadata?.pageSize;

    const emptyState = {
        heading: t('app.plugins.gaugeVoter.gaugeVoterGaugeList.emptyState.heading'),
        description: t('app.plugins.gaugeVoter.gaugeVoterGaugeList.emptyState.description'),
    };

    const errorState = {
        heading: t('app.plugins.gaugeVoter.gaugeVoterGaugeList.errorState.heading'),
        description: t('app.plugins.gaugeVoter.gaugeVoterGaugeList.errorState.description'),
    };

    const gaugeList = gaugeListData?.pages.flatMap((page) => page.data) ?? [];

    return (
        <DataListRoot
            entityLabel={t('app.plugins.gaugeVoter.gaugeVoterGaugeList.entity')}
            onLoadMore={fetchNextPage}
            state={effectiveState}
            pageSize={pageSize}
            itemsCount={itemsCount}
        >
            <GaugeVoterGaugeListHeading />
            <DataListContainer
                errorState={errorState}
                emptyState={emptyState}
                SkeletonElement={GaugeVoterGaugeListItemSkeleton}
            >
                {gaugeList.map((gauge) => {
                    const gaugeVoteData = gaugeVotes.find((v) => v.gaugeAddress === gauge.address);

                    return (
                        <GaugeVoterGaugeListItemStructure
                            key={gauge.address}
                            gauge={gauge}
                            isUserConnected={isUserConnected}
                            isSelected={selectedGauges?.includes(gauge.address) ?? false}
                            isVoted={votedGauges?.includes(gauge.address) ?? false}
                            onSelect={onSelect}
                            onViewDetails={onViewDetails}
                            totalEpochVotingPower={totalEpochVotingPower}
                            isVotingPeriod={isVotingPeriod}
                            tokenSymbol={tokenSymbol}
                            isUserVotesLoading={isUserVotesLoading ?? false}
                            formattedUserVotes={gaugeVoteData?.formattedVotes ?? '0'}
                            formattedTotalVotes={gaugeVoteData?.formattedTotalVotes ?? '0'}
                            totalVotesValue={gaugeVoteData?.totalVotesValue ?? 0}
                        />
                    );
                })}
            </DataListContainer>
            <DataListPagination />
        </DataListRoot>
    );
};

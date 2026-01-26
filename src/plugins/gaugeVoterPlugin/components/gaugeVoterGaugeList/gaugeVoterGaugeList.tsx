import {
    DataListContainer,
    DataListPagination,
    DataListRoot,
    type DataListState,
} from '@aragon/gov-ui-kit';
import { useTranslations } from '@/shared/components/translationsProvider';
import { dataListUtils } from '@/shared/utils/dataListUtils';
import type { IGauge, IGetGaugeListParams } from '../../api/gaugeVoterService';
import { useGaugeList } from '../../api/gaugeVoterService';
import { GaugeVoterGaugeListHeading } from './gaugeVoterGaugeListHeading';
import { GaugeVoterGaugeListItemSkeleton } from './gaugeVoterGaugeListItemSkeleton';
import { GaugeVoterGaugeListItemStructure } from './gaugeVoterGaugeListItemStructure';

export interface IGaugeUserVote {
    /**
     * Address of the gauge.
     */
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
    onSelect: (gauge: IGauge) => void;
    /**
     * Function to handle viewing gauge details.
     */
    onViewDetails?: (gauge: IGauge) => void;
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

export const GaugeVoterGaugeList: React.FC<IGaugeVoterGaugeListProps> = (
    props,
) => {
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

    const {
        data: gaugeListData,
        fetchNextPage,
        status,
        fetchStatus,
        isFetchingNextPage,
    } = useGaugeList(initialParams);

    const state = dataListUtils.queryToDataListState({
        status,
        fetchStatus,
        isFetchingNextPage,
    });

    const shouldShowSkeleton =
        state === 'initialLoading' || !!isUserVotesLoading;
    const effectiveState: DataListState = shouldShowSkeleton
        ? 'initialLoading'
        : state;

    const itemsCount = gaugeListData?.pages[0]?.metadata?.totalRecords;
    const pageSize = gaugeListData?.pages[0]?.metadata?.pageSize;

    const emptyState = {
        heading: t(
            'app.plugins.gaugeVoter.gaugeVoterGaugeList.emptyState.heading',
        ),
        description: t(
            'app.plugins.gaugeVoter.gaugeVoterGaugeList.emptyState.description',
        ),
    };

    const errorState = {
        heading: t(
            'app.plugins.gaugeVoter.gaugeVoterGaugeList.errorState.heading',
        ),
        description: t(
            'app.plugins.gaugeVoter.gaugeVoterGaugeList.errorState.description',
        ),
    };

    const gaugeList = gaugeListData?.pages.flatMap((page) => page.data) ?? [];

    return (
        <DataListRoot
            entityLabel={t('app.plugins.gaugeVoter.gaugeVoterGaugeList.entity')}
            itemsCount={itemsCount}
            onLoadMore={fetchNextPage}
            pageSize={pageSize}
            state={effectiveState}
        >
            <GaugeVoterGaugeListHeading />
            <DataListContainer
                emptyState={emptyState}
                errorState={errorState}
                SkeletonElement={GaugeVoterGaugeListItemSkeleton}
            >
                {gaugeList.map((gauge) => {
                    const gaugeVoteData = gaugeVotes.find(
                        (v) => v.gaugeAddress === gauge.address,
                    );

                    return (
                        <GaugeVoterGaugeListItemStructure
                            formattedTotalVotes={
                                gaugeVoteData?.formattedTotalVotes ?? '0'
                            }
                            formattedUserVotes={
                                gaugeVoteData?.formattedVotes ?? '0'
                            }
                            gauge={gauge}
                            isSelected={
                                selectedGauges?.includes(gauge.address) ?? false
                            }
                            isUserConnected={isUserConnected}
                            isUserVotesLoading={isUserVotesLoading ?? false}
                            isVoted={
                                votedGauges?.includes(gauge.address) ?? false
                            }
                            isVotingPeriod={isVotingPeriod}
                            key={gauge.address}
                            onSelect={onSelect}
                            onViewDetails={onViewDetails}
                            tokenSymbol={tokenSymbol}
                            totalEpochVotingPower={totalEpochVotingPower}
                            totalVotesValue={
                                gaugeVoteData?.totalVotesValue ?? 0
                            }
                        />
                    );
                })}
            </DataListContainer>
            <DataListPagination />
        </DataListRoot>
    );
};

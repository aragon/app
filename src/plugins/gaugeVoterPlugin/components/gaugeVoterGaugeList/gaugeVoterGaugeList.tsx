import { useTranslations } from '@/shared/components/translationsProvider';
import { dataListUtils } from '@/shared/utils/dataListUtils';
import { DataListContainer, DataListPagination, DataListRoot } from '@aragon/gov-ui-kit';
import type { IGetGaugeListParams } from '../../api/gaugeVoterService';
import type { IGauge } from '../../api/gaugeVoterService/domain';
import { useGaugeList } from '../../api/gaugeVoterService/queries';
import { GaugeVoterGaugeListHeading } from './gaugeVoterGaugeListHeading';
import { GaugeVoterGaugeListItemSkeleton } from './gaugeVoterGaugeListItemSkeleton';
import { GaugeVoterGaugeListItemStructure } from './gaugeVoterGaugeListItemStructure';

export interface IGaugeUserVote {
    gaugeAddress: string;
    userVotes: number;
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
    votedGauges?: string[];
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
     * Token symbol for voting power display.
     */
    tokenSymbol: string;
    /**
     * User's votes per gauge from blockchain.
     */
    gaugeVotes: IGaugeUserVote[];
    /**
     * Total voting power for the epoch (for percentage calculations).
     */
    totalEpochVotingPower?: string;
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
        gaugeVotes,
        totalEpochVotingPower,
    } = props;

    const { t } = useTranslations();

    const { data: gaugeListData, fetchNextPage, status, fetchStatus, isFetchingNextPage } = useGaugeList(initialParams);

    const state = dataListUtils.queryToDataListState({ status, fetchStatus, isFetchingNextPage });

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
            state={state}
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
                    const userVotesForGauge = gaugeVotes.find((v) => v.gaugeAddress === gauge.address)?.userVotes ?? 0;

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
                            userVotes={userVotesForGauge}
                        />
                    );
                })}
            </DataListContainer>
            <DataListPagination />
        </DataListRoot>
    );
};

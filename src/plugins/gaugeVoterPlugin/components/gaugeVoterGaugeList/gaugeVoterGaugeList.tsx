import { useTranslations } from '@/shared/components/translationsProvider';
import { dataListUtils } from '@/shared/utils/dataListUtils';
import { DataListContainer, DataListPagination, DataListRoot } from '@aragon/gov-ui-kit';
import type { IGetGaugeListParams } from '../../api/gaugeVoterService';
import type { IGauge } from '../../api/gaugeVoterService/domain';
import { useGaugeList } from '../../api/gaugeVoterService/queries';
import { GaugeVoterGaugeListItemSkeleton } from './gaugeVoterGaugeListItemSkeleton';
import { GaugeVoterGaugeListItemStructure } from './gaugeVoterGaugeListItemStructure';

export interface IGaugeVoterGaugeListProps {
    /**
     * Initial parameters for the gauge list query.
     */
    initialParams: IGetGaugeListParams;
    /**
     * Function to handle gauge voting.
     */
    onVote?: (gauge: IGauge) => void;
    /**
     * Function to handle viewing gauge details.
     */
    onViewDetails?: (gauge: IGauge) => void;
}

export const GaugeVoterGaugeList: React.FC<IGaugeVoterGaugeListProps> = (props) => {
    const { initialParams, onVote, onViewDetails } = props;

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

    const gaugeList = gaugeListData?.pages.flatMap((page) => page.data.flatMap((data) => data.gauges));
    console.log('gaugeList', gaugeList);
    return (
        <DataListRoot
            entityLabel={t('app.plugins.gaugeVoter.gaugeVoterGaugeList.entity')}
            onLoadMore={fetchNextPage}
            state={state}
            pageSize={pageSize}
            itemsCount={itemsCount}
        >
            <DataListContainer
                errorState={errorState}
                emptyState={emptyState}
                SkeletonElement={GaugeVoterGaugeListItemSkeleton}
            >
                {gaugeList?.map((gauge) => (
                    <GaugeVoterGaugeListItemStructure
                        key={gauge.address}
                        gauge={gauge}
                        onVote={onVote}
                        onViewDetails={onViewDetails}
                        totalEpochVotes={100000000}
                    />
                ))}
            </DataListContainer>
            <DataListPagination />
        </DataListRoot>
    );
};

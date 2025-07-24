import { type IGetAllowedActionsParams, useAllowedActions } from '@/modules/governance/api/executeSelectorsService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { dataListUtils } from '@/shared/utils/dataListUtils';
import type { IEmptyStateObjectIllustrationProps } from '@aragon/gov-ui-kit';

export const useAllowedActionsListData = (params: IGetAllowedActionsParams) => {
    const { t } = useTranslations();

    const { data, status, fetchStatus, isFetchingNextPage, fetchNextPage } = useAllowedActions(params);

    const allowedActionsList = data?.pages.flatMap((page) => page.data);

    const state = dataListUtils.queryToDataListState({
        status,
        fetchStatus,
        isFetchingNextPage,
    });

    const pageSize = params.queryParams.pageSize ?? data?.pages[0].metadata.pageSize;

    const itemsCount = data?.pages[0].metadata.totalRecords;

    const emptyState: IEmptyStateObjectIllustrationProps = {
        isStacked: false,
        heading: t('app.settings.daoProcessAllowedActions.emptyState.heading'),
        description: t('app.settings.daoProcessAllowedActions.emptyState.description'),
        objectIllustration: { object: 'SETTINGS' },
    };

    return { allowedActionsList, onLoadMore: fetchNextPage, state, pageSize, itemsCount, emptyState };
};

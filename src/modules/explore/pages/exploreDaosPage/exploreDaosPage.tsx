import { QueryClient } from '@tanstack/react-query';
import { Page } from '@/shared/components/page';
import { networkUtils } from '@/shared/utils/networkUtils';
import { featuredDaosOptions } from '../../api/cmsService';
import { daoListOptions } from '../../api/daoExplorerService';
import { ExploreDaosPageClient } from './exploreDaosPageClient';

const daosPerPage = 10;

export const ExploreDaosPage: React.FC = async () => {
    const queryClient = new QueryClient();

    const daoListQueryParams = {
        pageSize: daosPerPage,
        page: 1,
        sort: 'metrics.tvlUSD',
        networks: networkUtils.getMainnetNetworks(),
    };
    const daoListParams = { queryParams: daoListQueryParams };
    await queryClient.prefetchInfiniteQuery(daoListOptions(daoListParams));
    await queryClient.prefetchQuery(featuredDaosOptions());

    return (
        <Page.Container queryClient={queryClient}>
            <ExploreDaosPageClient initialParams={daoListParams} />
        </Page.Container>
    );
};

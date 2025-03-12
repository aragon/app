import { Page } from '@/shared/components/page';
import { QueryClient } from '@tanstack/react-query';
import { featuredDaosOptions } from '../../api/cmsService';
import { daoListOptions } from '../../api/daoExplorerService';
import { ExploreDaosPageClient } from './exploreDaosPageClient';

export interface IExploreDaosPageProps {}

const daosPerPage = 10;

export const ExploreDaosPage: React.FC<IExploreDaosPageProps> = async () => {
    const queryClient = new QueryClient();

    const daoListQueryParams = { pageSize: daosPerPage, page: 1, sort: 'metrics.tvlUSD' };
    const daoListParams = { queryParams: daoListQueryParams };
    await queryClient.prefetchInfiniteQuery(daoListOptions(daoListParams));
    await queryClient.prefetchQuery(featuredDaosOptions());

    return (
        <Page.Container queryClient={queryClient}>
            <ExploreDaosPageClient initialParams={daoListParams} />
        </Page.Container>
    );
};

import type { Network } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { QueryClient } from '@tanstack/react-query';
import { featuredDaosOptions } from '../../api/cmsService';
import { daoListOptions } from '../../api/daoExplorerService';
import { ExploreDaosPageClient } from './exploreDaosPageClient';

export interface IExploreDaosPageProps {}

const daosPerPage = 10;

export const ExploreDaosPage: React.FC<IExploreDaosPageProps> = async () => {
    const queryClient = new QueryClient();

    const networks = Object.keys(networkDefinitions) as Network[];
    const mainnetNetworks = networks.filter((network) => !networkDefinitions[network].testnet);

    const daoListQueryParams = { pageSize: daosPerPage, page: 1, sort: 'metrics.tvlUSD', networks: mainnetNetworks };
    const daoListParams = { queryParams: daoListQueryParams };
    await queryClient.prefetchInfiniteQuery(daoListOptions(daoListParams));
    await queryClient.prefetchQuery(featuredDaosOptions());

    return (
        <Page.Container queryClient={queryClient}>
            <ExploreDaosPageClient initialParams={daoListParams} />
        </Page.Container>
    );
};

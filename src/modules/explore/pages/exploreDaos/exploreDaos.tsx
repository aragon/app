import { Page } from '@/shared/components/page/page';
import { QueryClient } from '@tanstack/react-query';
import { daoListOptions } from '../../api/daoExplorerService';
import { DaoList } from '../../components/daoList';

export interface IExploreDaosProps {}

const daosPerPage = 20;

export const ExploreDaos: React.FC<IExploreDaosProps> = async () => {
    const queryClient = new QueryClient();

    const daoListQueryParams = { limit: daosPerPage, skip: 0, orderProp: 'tvlUSD' };
    const daoListParams = { queryParams: daoListQueryParams };
    await queryClient.prefetchInfiniteQuery(daoListOptions(daoListParams));

    return (
        <Page queryClient={queryClient}>
            <DaoList defaultParams={daoListParams} />
        </Page>
    );
};

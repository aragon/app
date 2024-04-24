import { Page } from '@/shared/components/page/page';
import { QueryClient } from '@tanstack/react-query';
import { daoListOptions } from '../../api/daoExplorerService';
import { DaoList } from '../../components/daoList';

export interface IExploreDaosProps {}

const daosPerPage = 20;

export const ExploreDaos: React.FC<IExploreDaosProps> = async () => {
    const queryClient = new QueryClient();

    const daoListQueryParams = { limit: daosPerPage, skip: 0 };
    await queryClient.prefetchInfiniteQuery(daoListOptions({ queryParams: daoListQueryParams }));

    return (
        <Page queryClient={queryClient}>
            <DaoList limit={daosPerPage} />
        </Page>
    );
};

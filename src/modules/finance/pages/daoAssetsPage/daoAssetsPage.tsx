import { Page } from '@/shared/components/page';
import { QueryClient } from '@tanstack/react-query';
import { balanceListOptions } from '../../api/financeService/queries/useBalanceList';
import { DaoAssetsPageContent } from './daoAssetsPageContent';

export interface IDaoAssetsPageProps {
    /**
     * DAO page parameters.
     */
    params: { slug: string };
}

export const DaoAssetsPage: React.FC<IDaoAssetsPageProps> = async (props) => {
    const { params } = props;
    const queryClient = new QueryClient();
    await queryClient.prefetchInfiniteQuery(balanceListOptions({ queryParams: {} }));

    return (
        <Page.Container queryClient={queryClient}>
            <DaoAssetsPageContent slug={params.slug}/>
        </Page.Container>
    );
};

import { Page } from '@/shared/components/page';
import { QueryClient } from '@tanstack/react-query';
import { balanceListOptions } from '../../api/financeService/queries/useBalanceList';
import { DaoAssetsPageClient } from './daoAssetsPageClient';

export interface IDaoAssetsPageProps {}

export const DaoAssetsPage: React.FC<IDaoAssetsPageProps> = async () => {
    const queryClient = new QueryClient();
    await queryClient.prefetchInfiniteQuery(balanceListOptions({ queryParams: {} }));

    return (
        <Page.Container queryClient={queryClient}>
            <DaoAssetsPageClient />
        </Page.Container>
    );
};

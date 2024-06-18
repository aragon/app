import { transactionListOptions } from '@/modules/finance/api/financeService/queries/useTransactionList';
import { Page } from '@/shared/components/page';
import { QueryClient } from '@tanstack/react-query';
import { DaoTransactionsPageContent } from './daoTransactionsPageContent';
export interface IDaoTransactionsPageProps {
    /**
     * DAO page parameters.
     */
    params: { slug: string };
}

export const DaoTransactionsPage: React.FC<IDaoTransactionsPageProps> = async (props) => {
    const { params } = props;
    const queryClient = new QueryClient();
    await queryClient.prefetchInfiniteQuery(transactionListOptions({ queryParams: {} }));

    return (
        <Page.Container queryClient={queryClient}>
            <DaoTransactionsPageContent slug={params.slug} />
        </Page.Container>
    );
};

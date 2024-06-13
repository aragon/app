import { transactionListOptions } from '@/modules/finance/api/financeService/queries/useTransactionList';
import { Page } from '@/shared/components/page';
import { QueryClient } from '@tanstack/react-query';
import { DaoTransactionsPageContent } from './daoTransactionsPageContent';
export interface IDaoTransactionsPageProps {}

export const DaoTransactionsPage: React.FC<IDaoTransactionsPageProps> = async () => {
    const queryClient = new QueryClient();
    await queryClient.prefetchInfiniteQuery(transactionListOptions({ queryParams: {} }));

    return (
        <Page.Container queryClient={queryClient}>
            <DaoTransactionsPageContent />
        </Page.Container>
    );
};

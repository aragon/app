import { transactionListOptions } from '@/modules/finance/api/financeService/queries/useTransactionList';
import { Page } from '@/shared/components/page';
import { type IDaoPageParams } from '@/shared/types';
import { QueryClient } from '@tanstack/react-query';
import { DaoTransactionsPageClient } from './daoTransactionsPageClient';

export interface IDaoTransactionsPageProps {
    /**
     * DAO page parameters.
     */
    params: IDaoPageParams;
}

export const DaoTransactionsPage: React.FC<IDaoTransactionsPageProps> = async (props) => {
    const { params } = props;
    const queryClient = new QueryClient();
    await queryClient.prefetchInfiniteQuery(transactionListOptions({ queryParams: {} }));

    return (
        <Page.Container queryClient={queryClient}>
            <DaoTransactionsPageClient id={params.id} />
        </Page.Container>
    );
};

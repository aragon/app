import { transactionListOptions } from '@/modules/finance/api/financeService/queries/useTransactionList/useTransactionList';
import { daoOptions } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { type IDaoPageParams } from '@/shared/types';
import { QueryClient } from '@tanstack/react-query';
import { DaoTransactionsPageClient } from './daoTransactionsPageClient';

export interface IDaoTransactionsPageProps {
    /**
     * DAO page parameters necessary for data fetching.
     */
    params: Promise<IDaoPageParams>;
}

export const daoTransactionsCount = 20;

export const DaoTransactionsPage: React.FC<IDaoTransactionsPageProps> = async (props) => {
    const { params } = props;
    const { id } = await params;

    const queryClient = new QueryClient();

    const useDaoParams = { id };
    const dao = await queryClient.fetchQuery(daoOptions({ urlParams: useDaoParams }));

    const transactionsQueryParams = { address: dao.address, network: dao.network, pageSize: daoTransactionsCount };
    const transactionsParams = { queryParams: transactionsQueryParams };

    await queryClient.prefetchInfiniteQuery(transactionListOptions(transactionsParams));

    return (
        <Page.Container queryClient={queryClient}>
            <DaoTransactionsPageClient id={id} initialParams={transactionsParams} />
        </Page.Container>
    );
};

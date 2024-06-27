import { transactionListOptions } from '@/modules/finance/api/financeService/queries/useTransactionList';
import { daoOptions } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { type IDaoPageParams } from '@/shared/types';
import { QueryClient } from '@tanstack/react-query';
import { DaoTransactionsPageClient } from './daoTransactionsPageClient';

export interface IDaoTransactionsPageProps {
    /**
     * DAO page parameters necessary for data fetching.
     */
    params: IDaoPageParams;
}

export const daoTransactionsCount = 6;

export const DaoTransactionsPage: React.FC<IDaoTransactionsPageProps> = async (props) => {
    const { params } = props;
    const id = params.id;
    const useDaoParams = { id };
    const queryClient = new QueryClient();

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

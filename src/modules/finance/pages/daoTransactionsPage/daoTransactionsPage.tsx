import { transactionListOptions } from '@/modules/finance/api/financeService/queries/useTransactionList/useTransactionList';
import { daoOptions } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { type IDaoPageParams } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { networkUtils } from '@/shared/utils/networkUtils';
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
    const daoPageParams = await params;

    if (!networkUtils.isValidNetwork(daoPageParams.network)) {
        // invalid network handled in DAO layout
        return null;
    }

    const queryClient = new QueryClient();

    const daoId = await daoUtils.resolveDaoId(daoPageParams);
    const useDaoParams = { id: daoId };
    const dao = await queryClient.fetchQuery(daoOptions({ urlParams: useDaoParams }));

    const transactionsQueryParams = { daoId: dao.id, pageSize: daoTransactionsCount };
    const transactionsParams = { queryParams: transactionsQueryParams };

    await queryClient.prefetchInfiniteQuery(transactionListOptions(transactionsParams));

    return (
        <Page.Container queryClient={queryClient}>
            <DaoTransactionsPageClient id={daoId} initialParams={transactionsParams} />
        </Page.Container>
    );
};

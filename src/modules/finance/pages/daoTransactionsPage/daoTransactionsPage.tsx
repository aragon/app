import { transactionListOptions } from '@/modules/finance/api/financeService/queries/useTransactionList';
import { daoService, daoServiceKeys } from '@/shared/api/daoService';
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
    const id = params.id;
    const useDaoParams = { id };
    const queryClient = new QueryClient();

    const dao = await queryClient.fetchQuery({
        queryKey: daoServiceKeys.dao({ urlParams: useDaoParams }),
        queryFn: () => daoService.getDao({ urlParams: useDaoParams }),
    });

    await queryClient.prefetchInfiniteQuery(
        transactionListOptions({ queryParams: { address: dao?.address, network: dao?.network } }),
    );

    return (
        <Page.Container queryClient={queryClient}>
            <DaoTransactionsPageClient id={params.id} />
        </Page.Container>
    );
};

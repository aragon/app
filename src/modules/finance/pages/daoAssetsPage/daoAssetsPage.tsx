import { daoOptions } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { type IDaoPageParams } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { QueryClient } from '@tanstack/react-query';
import { assetListOptions } from '../../api/financeService';
import { DaoAssetsPageClient } from './daoAssetsPageClient';

export interface IDaoAssetsPageProps {
    /**
     * DAO page parameters.
     */
    params: Promise<IDaoPageParams>;
}

export const daoAssetsCount = 20;

export const DaoAssetsPage: React.FC<IDaoAssetsPageProps> = async (props) => {
    const { params } = props;
    const daoPageParams = await params;
    const daoId = await daoUtils.resolveDaoId(daoPageParams);

    const queryClient = new QueryClient();

    const useDaoParams = { id: daoId };
    const dao = await queryClient.fetchQuery(daoOptions({ urlParams: useDaoParams }));

    const assetsQueryParams = { address: dao.address, network: dao.network, pageSize: daoAssetsCount };
    const assetsParams = { queryParams: assetsQueryParams };

    await queryClient.prefetchInfiniteQuery(assetListOptions(assetsParams));

    return (
        <Page.Container queryClient={queryClient}>
            <DaoAssetsPageClient id={daoId} initialParams={assetsParams} />
        </Page.Container>
    );
};

import { daoOptions } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { type IDaoPageParams } from '@/shared/types';
import { QueryClient } from '@tanstack/react-query';
import { assetListOptions } from '../../api/financeService/queries/useAssetList';
import { DaoAssetsPageClient } from './daoAssetsPageClient';

export interface IDaoAssetsPageProps {
    /**
     * DAO page parameters.
     */
    params: IDaoPageParams;
}

export const daoAssetsCount = 6;

export const DaoAssetsPage: React.FC<IDaoAssetsPageProps> = async (props) => {
    const { params } = props;
    const id = params.id;

    const queryClient = new QueryClient();

    const useDaoParams = { id };
    const dao = await queryClient.fetchQuery(daoOptions({ urlParams: useDaoParams }));

    const assetsQueryParams = { address: dao.address, network: dao.network, pageSize: daoAssetsCount };
    const assetsParams = { queryParams: assetsQueryParams };

    await queryClient.prefetchInfiniteQuery(assetListOptions(assetsParams));

    return (
        <Page.Container queryClient={queryClient}>
            <DaoAssetsPageClient id={params.id} initialParams={assetsParams} />
        </Page.Container>
    );
};

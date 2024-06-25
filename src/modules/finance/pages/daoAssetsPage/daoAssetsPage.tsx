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

export const DaoAssetsPage: React.FC<IDaoAssetsPageProps> = async (props) => {
    const { params } = props;
    const id = params.id;
    const useDaoParams = { id };
    const queryClient = new QueryClient();
    const dao = await queryClient.fetchQuery(daoOptions({ urlParams: useDaoParams }));

    await queryClient.prefetchInfiniteQuery(
        assetListOptions({ queryParams: { daoAddress: dao?.address, network: dao?.network } }),
    );

    return (
        <Page.Container queryClient={queryClient}>
            <DaoAssetsPageClient id={params.id} />
        </Page.Container>
    );
};

import { Page } from '@/shared/components/page';
import { QueryClient } from '@tanstack/react-query';
import { assetListOptions } from '../../api/financeService/queries/useAssetList';
import { DaoAssetsPageClient } from './daoAssetsPageClient';

export interface IDaoAssetsPageProps {
    /**
     * DAO page parameters.
     */
    params: { id: string };
}

export const DaoAssetsPage: React.FC<IDaoAssetsPageProps> = async (props) => {
    const { params } = props;
    const queryClient = new QueryClient();
    await queryClient.prefetchInfiniteQuery(assetListOptions({ queryParams: {} }));

    return (
        <Page.Container queryClient={queryClient}>
            <DaoAssetsPageClient id={params.id} />
        </Page.Container>
    );
};

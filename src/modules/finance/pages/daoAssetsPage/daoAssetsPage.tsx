import { Page } from '@/shared/components/page';
import { QueryClient } from '@tanstack/react-query';
import { balanceListOptions } from '../../api/financeService/queries/useBalanceList';
import { AssetList } from '../../components/assetList';
import { DaoAssetsPageAside } from './daoAssetsPageAside';

export interface IDaoAssetsPageProps {}

export const DaoAssetsPage: React.FC<IDaoAssetsPageProps> = async () => {
    const queryClient = new QueryClient();
    await queryClient.prefetchInfiniteQuery(balanceListOptions({ queryParams: {} }));

    return (
        <Page.Container queryClient={queryClient}>
            <Page.Content>
                <Page.Main
                    title="app.finance.daoAssetsPage.title"
                    action={{ label: 'app.finance.daoAssetsPage.action' }}
                >
                    <AssetList />
                </Page.Main>
                <DaoAssetsPageAside />
            </Page.Content>
        </Page.Container>
    );
};

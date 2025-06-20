import type { IDaoPluginPageProps } from '@/modules/application/types';
import { daoOptions } from '@/shared/api/daoService';
import { PageAside, PageAsideCard, PageContainer, PageContent, PageMain } from '@/shared/components/page';
import { QueryClient } from '@tanstack/react-query';

export interface ICapitalDistributorRewardsPageProps extends IDaoPluginPageProps {}

export const CapitalDistributorRewardsPage: React.FC<ICapitalDistributorRewardsPageProps> = (props) => {
    const { dao } = props;

    const queryClient = new QueryClient();
    queryClient.setQueryData(daoOptions({ urlParams: { id: dao.id } }).queryKey, dao);

    return (
        <PageContainer queryClient={queryClient}>
            <PageContent>
                <PageMain title="Rewards">
                    <p>Rewards List for {dao.name}</p>
                </PageMain>
                <PageAside>
                    <PageAsideCard title="All your rewards">
                        <p>Rewards Stats</p>
                    </PageAsideCard>
                </PageAside>
            </PageContent>
        </PageContainer>
    );
};

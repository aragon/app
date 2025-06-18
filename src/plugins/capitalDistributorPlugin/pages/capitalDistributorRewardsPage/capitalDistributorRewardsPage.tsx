import { PageAside, PageAsideCard, PageContainer, PageContent, PageMain } from '@/shared/components/page';
import type { IDaoPageParams } from '@/shared/types';

export interface ICapitalDistributorRewardsPageProps extends IDaoPageParams {}

export const CapitalDistributorRewardsPage: React.FC<ICapitalDistributorRewardsPageProps> = () => {
    return (
        <PageContainer>
            <PageContent>
                <PageMain title="Rewards">
                    <p>Rewards List</p>
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

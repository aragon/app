import type { IDaoPluginPageProps } from '@/modules/application/types';
import { daoOptions } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { QueryClient } from '@tanstack/react-query';
import { CapitalDistributorRewardsPageClient } from './capitalDistributorRewardsPageClient';

export interface ICapitalDistributorRewardsPageProps extends IDaoPluginPageProps {}

export const CapitalDistributorRewardsPage: React.FC<ICapitalDistributorRewardsPageProps> = (props) => {
    const { dao } = props;

    const queryClient = new QueryClient();
    queryClient.setQueryData(daoOptions({ urlParams: { id: dao.id } }).queryKey, dao);

    return (
        <Page.Container queryClient={queryClient}>
            <CapitalDistributorRewardsPageClient dao={dao} />
        </Page.Container>
    );
};

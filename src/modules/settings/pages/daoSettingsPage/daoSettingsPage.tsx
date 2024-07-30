import { daoOptions } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import type { IDaoPageParams } from '@/shared/types';
import { QueryClient } from '@tanstack/react-query';
import { DaoSettingsPageClient } from './daoSettingsPageClient';

export interface IDaoSettingsPageProps {
    /**
     * DAO page parameters.
     */
    params: IDaoPageParams;
}

export const DaoSettingsPage: React.FC<IDaoSettingsPageProps> = async (props) => {
    const { params } = props;

    const queryClient = new QueryClient();

    const daoQueryParams = { id: params.id };
    const daoParams = { urlParams: daoQueryParams };
    await queryClient.prefetchQuery(daoOptions(daoParams));
    return (
        <Page.Container>
            <Page.Content>
                <DaoSettingsPageClient initialParams={daoParams} />
            </Page.Content>
        </Page.Container>
    );
};

import { daoOptions } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { PluginType, type IDaoPageParams } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { networkUtils } from '@/shared/utils/networkUtils';
import { QueryClient } from '@tanstack/react-query';
import { redirect } from 'next/navigation';
import { memberListOptions } from '../../api/governanceService';
import { DaoMembersPageClient } from './daoMembersPageClient';

export interface IDaoMembersPageProps {
    /**
     * DAO page parameters.
     */
    params: Promise<IDaoPageParams>;
}

export const daoMembersCount = 18;

export const DaoMembersPage: React.FC<IDaoMembersPageProps> = async (props) => {
    const { params } = props;
    const daoPageParams = await params;

    if (!networkUtils.isValidNetwork(daoPageParams.network)) {
        // invalid network handled in DAO layout
        return null;
    }

    const queryClient = new QueryClient();

    const daoId = await daoUtils.resolveDaoId(daoPageParams);
    const daoUrlParams = { id: daoId };
    const dao = await queryClient.fetchQuery(daoOptions({ urlParams: daoUrlParams }));

    const plugins = daoUtils.getDaoPlugins(dao, {
        type: PluginType.BODY,
        includeSubPlugins: true,
    });

    if (!plugins?.length) {
        const daoUrl = daoUtils.getDaoUrl(dao, 'dashboard')!;
        redirect(daoUrl);
    }

    const bodyPluginAddress = plugins[0].address;
    const memberListQueryParams = { daoId, pluginAddress: bodyPluginAddress, pageSize: daoMembersCount };
    const memberListParams = { queryParams: memberListQueryParams };
    await queryClient.prefetchInfiniteQuery(memberListOptions({ queryParams: memberListQueryParams }));

    return (
        <Page.Container queryClient={queryClient}>
            <Page.Content>
                <DaoMembersPageClient initialParams={memberListParams} />
            </Page.Content>
        </Page.Container>
    );
};

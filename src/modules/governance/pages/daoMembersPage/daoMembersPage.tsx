import { daoOptions } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { PluginType, type IDaoPageParams } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { QueryClient } from '@tanstack/react-query';
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
    const daoId = await daoUtils.resolveDaoId(daoPageParams);

    const queryClient = new QueryClient();

    const daoUrlParams = { id: daoId };
    const dao = await queryClient.fetchQuery(daoOptions({ urlParams: daoUrlParams }));

    const { address: bodyPluginAddress } = daoUtils.getDaoPlugins(dao, {
        type: PluginType.BODY,
        includeSubPlugins: true,
    })![0];

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

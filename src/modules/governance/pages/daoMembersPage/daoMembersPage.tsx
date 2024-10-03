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
    params: IDaoPageParams;
}

export const daoMembersCount = 9;

export const DaoMembersPage: React.FC<IDaoMembersPageProps> = async (props) => {
    const { params } = props;

    const queryClient = new QueryClient();

    const daoUrlParams = { id: params.id };
    const dao = await queryClient.fetchQuery(daoOptions({ urlParams: daoUrlParams }));

    const { address: bodyPluginAddress } = daoUtils.getDaoPlugins(dao, { type: PluginType.BODY })![0];

    const memberListQueryParams = { daoId: params.id, pluginAddress: bodyPluginAddress, pageSize: daoMembersCount };
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

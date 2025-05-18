import { daoOptions } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { PluginType, type IDaoPageParams } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { QueryClient } from '@tanstack/react-query';
import { proposalListOptions } from '../../api/governanceService';
import { DaoProposalsPageClient } from './daoProposalsPageClient';

export interface IDaoProposalsPageProps {
    /**
     * DAO page parameters.
     */
    params: Promise<IDaoPageParams>;
}

export const daoProposalsCount = 10;

export const DaoProposalsPage: React.FC<IDaoProposalsPageProps> = async (props) => {
    const { params } = props;
    const daoPageParams = await params;
    const daoId = await daoUtils.resolveDaoId(daoPageParams);

    const queryClient = new QueryClient();

    const daoUrlParams = { id: daoId };
    const daoParams = { urlParams: daoUrlParams };
    const dao = await queryClient.fetchQuery(daoOptions(daoParams));

    const processPlugins = daoUtils.getDaoPlugins(dao, { type: PluginType.PROCESS })!;

    const proposalListQueryParams = processPlugins.length === 1
        ? { daoId, pageSize: daoProposalsCount, pluginAddress: processPlugins[0].address }
        : { daoId, pageSize: daoProposalsCount };
    const proposalListParams = { queryParams: proposalListQueryParams };
    await queryClient.prefetchInfiniteQuery(proposalListOptions(proposalListParams));

    return (
        <Page.Container queryClient={queryClient}>
            <Page.Content>
                <DaoProposalsPageClient initialParams={proposalListParams} />
            </Page.Content>
        </Page.Container>
    );
};

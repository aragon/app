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
    const { id: daoId } = await params;

    const queryClient = new QueryClient();

    const daoUrlParams = { id: daoId };
    const daoParams = { urlParams: daoUrlParams };
    const dao = await queryClient.fetchQuery(daoOptions(daoParams));

    const { address: processPluginAddress } = daoUtils.getDaoPlugins(dao, { type: PluginType.PROCESS })![0];

    const proposalListQueryParams = { daoId, pageSize: daoProposalsCount, pluginAddress: processPluginAddress };
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

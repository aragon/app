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
    params: IDaoPageParams;
}

export const daoProposalsCount = 9;

export const DaoProposalsPage: React.FC<IDaoProposalsPageProps> = async (props) => {
    const { params } = props;

    const queryClient = new QueryClient();

    const daoUrlParams = { id: params.id };
    const daoParams = { urlParams: daoUrlParams };
    const dao = await queryClient.fetchQuery(daoOptions(daoParams));

    const { address: processPluginAddress } = daoUtils.getDaoPlugins(dao, { type: PluginType.PROCESS })![0];

    const proposalListQueryParams = {
        daoId: params.id,
        pageSize: daoProposalsCount,
        pluginAddress: processPluginAddress,
    };
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

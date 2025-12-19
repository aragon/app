import { QueryClient } from '@tanstack/react-query';
import { daoOptions } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { type IDaoPageParams, PluginType } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { networkUtils } from '@/shared/utils/networkUtils';
import { proposalListOptions } from '../../api/governanceService';
import { DaoProposalsPageClient } from './daoProposalsPageClient';

export interface IDaoProposalsPageProps {
    /**
     * DAO page parameters.
     */
    params: Promise<IDaoPageParams>;
}

export const daoProposalsCount = 10;
export const daoProposalsSort = 'blockTimestamp';

export const DaoProposalsPage: React.FC<IDaoProposalsPageProps> = async (
    props,
) => {
    const { params } = props;
    const daoPageParams = await params;

    if (!networkUtils.isValidNetwork(daoPageParams.network)) {
        // invalid network handled in DAO layout
        return null;
    }

    const queryClient = new QueryClient();

    const daoId = await daoUtils.resolveDaoId(daoPageParams);
    const daoUrlParams = { id: daoId };
    const daoParams = { urlParams: daoUrlParams };
    const dao = await queryClient.fetchQuery(daoOptions(daoParams));

    // Set pluginAddress parameter to undefined when DAO has more than one plugin as the UI will display an "All proposals"
    // tab that is selected by default
    const processPlugins = daoUtils.getDaoPlugins(dao, {
        type: PluginType.PROCESS,
    })!;
    const pluginAddress =
        processPlugins.length > 1 ? undefined : processPlugins[0].address;

    const proposalListQueryParams = {
        daoId,
        pageSize: daoProposalsCount,
        pluginAddress,
        sort: daoProposalsSort,
        isSubProposal: false,
        onlyActive: pluginAddress == null,
    };
    const proposalListParams = { queryParams: proposalListQueryParams };

    await queryClient.prefetchInfiniteQuery(
        proposalListOptions({ queryParams: proposalListQueryParams }),
    );

    return (
        <Page.Container queryClient={queryClient}>
            <Page.Content>
                <DaoProposalsPageClient initialParams={proposalListParams} />
            </Page.Content>
        </Page.Container>
    );
};

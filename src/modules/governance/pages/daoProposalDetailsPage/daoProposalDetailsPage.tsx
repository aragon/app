import { Page } from '@/shared/components/page';
import { daoUtils } from '@/shared/utils/daoUtils';
import { QueryClient } from '@tanstack/react-query';
import { proposalBySlugOptions } from '../../api/governanceService';
import { type IDaoProposalPageParams } from '../../types';
import { DaoProposalDetailsPageClient } from './daoProposalDetailsPageClient';

export interface IDaoProposalDetailsPageProps {
    /**
     * DAO member page parameters.
     */
    params: Promise<IDaoProposalPageParams>;
}

export const DaoProposalDetailsPage: React.FC<IDaoProposalDetailsPageProps> = async (props) => {
    const { params } = props;
    const { addressOrEns, network, proposalSlug } = await params;
    const daoId = await daoUtils.resolveDaoId({ addressOrEns, network });

    const queryClient = new QueryClient();

    const proposalParams = {
        urlParams: { slug: proposalSlug },
        queryParams: { daoId },
    };

    try {
        await queryClient.fetchQuery(proposalBySlugOptions(proposalParams));
    } catch (error: unknown) {
        return (
            <Page.Error
                error={JSON.parse(JSON.stringify(error)) as unknown}
                actionLink={`/dao/${network}/${addressOrEns}/proposals`}
                notFoundNamespace="app.governance.daoProposalDetailsPage"
            />
        );
    }

    return (
        <Page.Container queryClient={queryClient}>
            <DaoProposalDetailsPageClient daoId={daoId} proposalSlug={proposalSlug} />
        </Page.Container>
    );
};

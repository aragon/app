import { Page } from '@/shared/components/page';
import { daoUtils } from '@/shared/utils/daoUtils';
import { QueryClient } from '@tanstack/react-query';
import { proposalActionsOptions, proposalBySlugOptions } from '../../api/governanceService';
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
        const proposal = await queryClient.fetchQuery(proposalBySlugOptions(proposalParams));
        await queryClient.fetchQuery(proposalActionsOptions({ urlParams: { id: proposal.id } }));
    } catch (error: unknown) {
        const parsedError = JSON.parse(JSON.stringify(error)) as unknown;
        const errorNamespace = 'app.governance.daoProposalDetailsPage.error';
        const actionLink = `/dao/${network}/${addressOrEns}/proposals`;

        return <Page.Error error={parsedError} actionLink={actionLink} errorNamespace={errorNamespace} />;
    }

    return (
        <Page.Container queryClient={queryClient}>
            <DaoProposalDetailsPageClient daoId={daoId} proposalSlug={proposalSlug} />
        </Page.Container>
    );
};

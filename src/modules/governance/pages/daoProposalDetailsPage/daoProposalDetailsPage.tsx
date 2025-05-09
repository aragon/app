import { Page } from '@/shared/components/page';
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
    const { id, proposalSlug } = await params;

    const queryClient = new QueryClient();

    const proposalParams = {
        urlParams: { slug: proposalSlug },
        queryParams: { daoId: id },
    };

    try {
        const proposal = await queryClient.fetchQuery(proposalBySlugOptions(proposalParams));
        // If the proposal has actions then prefetch them, so they are immediately available
        if (proposal.hasActions) {
            await queryClient.fetchQuery(proposalActionsOptions({ urlParams: { id: proposal.id } }));
        }
    } catch (error: unknown) {
        return (
            <Page.Error
                error={JSON.parse(JSON.stringify(error)) as unknown}
                actionLink={`/dao/${id}/proposals`}
                notFoundNamespace="app.governance.daoProposalDetailsPage"
            />
        );
    }

    return (
        <Page.Container queryClient={queryClient}>
            <DaoProposalDetailsPageClient daoId={id} proposalSlug={proposalSlug} />
        </Page.Container>
    );
};

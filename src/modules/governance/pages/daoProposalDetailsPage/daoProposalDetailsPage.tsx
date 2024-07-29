import { Page } from '@/shared/components/page';
import { QueryClient } from '@tanstack/react-query';
import { proposalOptions } from '../../api/governanceService';
import { type IDaoProposalPageParams } from '../../types';
import { DaoProposalDetailsPageClient } from './daoProposalDetailsPageClient';

export interface IDaoProposalDetailsPageProps {
    /**
     * DAO member page parameters.
     */
    params: IDaoProposalPageParams;
}

export const DaoProposalDetailsPage: React.FC<IDaoProposalDetailsPageProps> = async (props) => {
    const { params } = props;
    const { id, proposalId } = params;

    const queryClient = new QueryClient();

    const proposalUrlParams = { id: proposalId };
    const proposalParams = { urlParams: proposalUrlParams };
    await queryClient.prefetchQuery(proposalOptions(proposalParams));

    return (
        <Page.Container queryClient={queryClient}>
            <DaoProposalDetailsPageClient daoId={id} proposalId={proposalId} />
        </Page.Container>
    );
};

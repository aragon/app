import { QueryClient } from '@tanstack/react-query';
import { Page } from '@/shared/components/page';
import { daoUtils } from '@/shared/utils/daoUtils';
import { errorUtils } from '@/shared/utils/errorUtils';
import { notFoundUtils } from '@/shared/utils/notFoundUtils';
import {
    proposalActionsOptions,
    proposalBySlugOptions,
} from '../../api/governanceService';
import type { IDaoProposalPageParams } from '../../types';
import { DaoProposalDetailsPageClient } from './daoProposalDetailsPageClient';

export interface IDaoProposalDetailsPageProps {
    /**
     * DAO member page parameters.
     */
    params: Promise<IDaoProposalPageParams>;
}

export const DaoProposalDetailsPage: React.FC<
    IDaoProposalDetailsPageProps
> = async (props) => {
    const { params } = props;
    const { addressOrEns, network, proposalSlug } = await params;
    // Bots constantly probe proposal URLs with unknown or malformed addresses — render
    // the 404 page for those instead of failing the request.
    const daoId = await notFoundUtils.fetchOrNotFound(() =>
        daoUtils.resolveDaoId({ addressOrEns, network }),
    );

    const queryClient = new QueryClient();

    const proposalParams = {
        urlParams: { slug: proposalSlug },
        queryParams: { daoId },
    };

    try {
        const proposal = await queryClient.fetchQuery(
            proposalBySlugOptions(proposalParams),
        );
        await queryClient.fetchQuery(
            proposalActionsOptions({ urlParams: { id: proposal.id } }),
        );
    } catch (error: unknown) {
        const parsedError = errorUtils.serialize(error);
        const errorNamespace = 'app.governance.daoProposalDetailsPage.error';
        const actionLink = `/dao/${network}/${addressOrEns}/proposals`;

        return (
            <Page.Error
                actionLink={actionLink}
                error={parsedError}
                errorNamespace={errorNamespace}
            />
        );
    }

    return (
        <Page.Container queryClient={queryClient}>
            <DaoProposalDetailsPageClient
                daoId={daoId}
                proposalSlug={proposalSlug}
            />
        </Page.Container>
    );
};

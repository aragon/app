import { QueryClient } from '@tanstack/react-query';
// The `next/navigation` alias points to the client-hooks wrapper, which cannot re-export server functions.
import { notFound } from 'next/navigation-original';
// biome-ignore lint/style/noRestrictedImports: server component cannot use the gov-ui-kit client shim; called with { strict: false } below.
import { isAddress } from 'viem';
import {
    proposalActionsOptions,
    proposalBySlugOptions,
} from '@/modules/governance/api/governanceService';
import { daoOverridesOptions } from '@/shared/api/cmsService';
import { daoOptions } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { featureFlags } from '@/shared/featureFlags';
import type { IWorkspaceProposalPageParams } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { errorUtils } from '@/shared/utils/errorUtils';
import { networkUtils } from '@/shared/utils/networkUtils';
import { workspaceUtils } from '../../utils/workspaceUtils';
import { WorkspaceProposalDetailsPageClient } from './workspaceProposalDetailsPageClient';

export interface IWorkspaceProposalDetailsPageProps {
    /**
     * URL parameters of the page.
     */
    params: Promise<IWorkspaceProposalPageParams>;
}

/**
 * Details of a proposal of one workspace account, rendered by the DAO proposal details page itself.
 *
 * The account ID on the URL is the DAO ID, so the DAO resolves without a lookup and everything the page needs is
 * prefetched here. `LayoutWorkspace` prefetches nothing, so unlike the DAO route — where `LayoutDao` hydrates the
 * DAO — every query `LayoutDao` would provide is fetched below. A prefetch added to `LayoutDao` does not reach
 * this route and must be added here too.
 */
export const WorkspaceProposalDetailsPage: React.FC<
    IWorkspaceProposalDetailsPageProps
> = async (props) => {
    const { params } = props;

    if (!(await featureFlags.isEnabled('workspaces'))) {
        notFound();
    }

    const { workspaceId, accountId, proposalSlug } = await params;

    // Bots constantly probe proposal URLs with unknown or malformed addresses. The DAO route filters those through
    // `resolveDaoId`; here the account ID is used verbatim as the DAO ID, so it is validated before any request.
    const { network, address } = daoUtils.parseDaoId(accountId);

    // Not strict about the checksum, as `resolveDaoId` is not either: the backend accepts any casing, so a
    // lowercase account on a shared link addresses the same proposal.
    if (
        !networkUtils.isValidNetwork(network) ||
        !isAddress(address, { strict: false })
    ) {
        notFound();
    }

    const queryClient = new QueryClient();
    const proposalParams = {
        urlParams: { slug: proposalSlug },
        queryParams: { daoId: accountId },
    };

    try {
        // Its failure is swallowed so a CMS hiccup cannot fail the page, the way the DAO layout prefetches it.
        void queryClient.query(daoOverridesOptions()).catch(() => undefined);

        const [, proposal] = await Promise.all([
            queryClient.query(daoOptions({ urlParams: { id: accountId } })),
            queryClient.query(proposalBySlugOptions(proposalParams)),
        ]);
        await queryClient.query(
            proposalActionsOptions({ urlParams: { id: proposal.id } }),
        );
    } catch (error: unknown) {
        const parsedError = errorUtils.serialize(error);
        const errorNamespace = 'app.governance.daoProposalDetailsPage.error';
        const actionLink = `${workspaceUtils.getWorkspaceUrl(workspaceId, 'proposals')}?account=${accountId}`;

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
            <WorkspaceProposalDetailsPageClient
                accountId={accountId}
                proposalSlug={proposalSlug}
                workspaceId={workspaceId}
            />
        </Page.Container>
    );
};

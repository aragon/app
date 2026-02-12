import { addressUtils, invariant } from '@aragon/gov-ui-kit';
import type { IDao } from '@/shared/api/daoService';
import { daoUtils } from '@/shared/utils/daoUtils';
import type { IProposal } from '../../api/governanceService';

class ProposalUtils {
    getProposalSlug = (
        proposal: Pick<IProposal, 'incrementalId' | 'pluginAddress'>,
        dao?: IDao,
    ): string => {
        const { incrementalId, pluginAddress } = proposal;
        const plugin = daoUtils.getDaoPlugins(dao, {
            pluginAddress,
            includeSubPlugins: true,
        })?.[0];

        invariant(plugin != null, 'getProposalSlug: proposal plugin not found');

        return `${plugin.slug}-${incrementalId.toString()}`.toUpperCase();
    };

    /**
     * Builds the full URL path for a proposal detail page.
     * When the proposal belongs to a subDAO the link points to the subDAO's
     * own page (`/dao/<network>/<subDaoAddress>/proposals/<slug>`) so that
     * `getProposalBySlug` on the backend resolves the slug in the correct DAO
     * context without any extra parameters.
     *
     * `daoAddress` and `network` are optional — when missing (e.g. vote's
     * `parentProposal`) the function falls back to `getDaoUrl(dao, …)`.
     */
    getProposalUrl = (
        proposal: Pick<IProposal, 'incrementalId' | 'pluginAddress'> &
            Partial<Pick<IProposal, 'daoAddress' | 'network'>>,
        dao?: IDao,
    ): string | undefined => {
        const slug = this.getProposalSlug(proposal, dao);
        const proposalPath = `proposals/${slug}`;

        // If we have enough information to detect a subDAO proposal, build a
        // direct link to the subDAO page.
        const isSubDaoProposal =
            proposal.daoAddress != null &&
            proposal.network != null &&
            dao != null &&
            !addressUtils.isAddressEqual(proposal.daoAddress, dao.address);

        if (isSubDaoProposal) {
            return `/dao/${proposal.network}/${proposal.daoAddress}/${proposalPath}`;
        }

        // Same-DAO proposal (or not enough data to tell) — use getDaoUrl for
        // ENS-friendly URLs.
        return daoUtils.getDaoUrl(dao, proposalPath);
    };
}

export const proposalUtils = new ProposalUtils();

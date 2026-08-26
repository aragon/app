import { addressUtils } from '@aragon/gov-ui-kit';
import type { IDao } from '@/shared/api/daoService';
import { daoUtils } from '@/shared/utils/daoUtils';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import type { IProposal } from '../../api/governanceService';

export enum ProposalMetadataStatus {
    /**
     * The proposal metadata has been resolved correctly.
     */
    STANDARD = 'standard',
    /**
     * The onchain metadata is a non-standard string (e.g. plain text instead of an IPFS URI).
     */
    NON_STANDARD = 'nonStandard',
    /**
     * The proposal has no metadata set or its metadata cannot be fetched.
     */
    MISSING = 'missing',
}

class ProposalUtils {
    getMetadataStatus = (
        proposal: Pick<IProposal, 'title' | 'metadataUri'>,
    ): ProposalMetadataStatus => {
        const { title, metadataUri } = proposal;

        if (title != null) {
            return ProposalMetadataStatus.STANDARD;
        }

        const processedUri = metadataUri?.trim();

        // A valid IPFS URI that could not be resolved is treated as missing metadata: only a
        // string written directly onchain instead of an IPFS URI is a non-standard metadata.
        return processedUri && !ipfsUtils.isUri(processedUri)
            ? ProposalMetadataStatus.NON_STANDARD
            : ProposalMetadataStatus.MISSING;
    };

    getProposalSlug = (
        proposal: Pick<IProposal, 'incrementalId' | 'pluginAddress'>,
        dao?: IDao,
    ): string | undefined => {
        const { incrementalId, pluginAddress } = proposal;
        const plugin = daoUtils.getDaoPlugins(dao, {
            pluginAddress,
            includeSubPlugins: true,
            includeLinkedAccounts: true,
        })?.[0];

        if (plugin == null) {
            return undefined;
        }

        return `${plugin.slug}-${incrementalId.toString()}`.toUpperCase();
    };

    /**
     * Builds the full URL path for a proposal detail page.
     * When the proposal belongs to a linked account the link points to the linked account's
     * own page (`/dao/<network>/<linkedAccountAddress>/proposals/<slug>`) so that
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

        if (slug == null) {
            return undefined;
        }

        const proposalPath = `proposals/${slug}`;

        // If we have enough information to detect a linked account proposal, build a
        // direct link to the linked account page.
        const isLinkedAccountProposal =
            proposal.daoAddress != null &&
            proposal.network != null &&
            dao != null &&
            !addressUtils.isAddressEqual(proposal.daoAddress, dao.address);

        if (isLinkedAccountProposal) {
            return `/dao/${proposal.network}/${proposal.daoAddress}/${proposalPath}`;
        }

        // Same-DAO proposal (or not enough data to tell) — use getDaoUrl for
        // ENS-friendly URLs.
        return daoUtils.getDaoUrl(dao, proposalPath);
    };
}

export const proposalUtils = new ProposalUtils();

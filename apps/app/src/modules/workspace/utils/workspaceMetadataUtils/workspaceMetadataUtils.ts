import type { Metadata } from 'next';
import { governanceMetadataUtils } from '@/modules/governance/utils/governanceMetadataUtils';
import { featureFlags } from '@/shared/featureFlags';
import type { IWorkspaceAccountProposalPageParams } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';

export interface IGenerateWorkspaceProposalMetadataParams {
    /**
     * Path parameters of the workspace proposal details page.
     */
    params: Promise<IWorkspaceAccountProposalPageParams>;
}

class WorkspaceMetadataUtils {
    /**
     * Metadata of one proposal of one account of a workspace.
     *
     * `governanceMetadataUtils.generateProposalMetadata` cannot be re-exported as it stands: it destructures
     * `{ proposalSlug, addressOrEns, network }`, which the workspace route does not carry, so it would resolve
     * `undefined` and fall into `resolveDaoId`'s `notFound()`. An account ID is a network and an address, which is
     * exactly what it wants, so this adapts the shape and reuses the whole function.
     *
     * The card it builds names the account rather than the workspace since a proposal lives on the account.
     * @param params - Path parameters of the workspace proposal details page.
     * @returns The metadata of the proposal, or nothing while the feature is disabled.
     */
    generateProposalMetadata = async ({
        params,
    }: IGenerateWorkspaceProposalMetadataParams): Promise<Metadata> => {
        // Gated of its own accord: Next resolves metadata independently of the page, so the page's `notFound()`
        // does not stop this from running. Without the gate, a probe of the URL would read the proposal and the
        // account information from the backend for a feature that does not exist yet, and could title the 404 document with a
        // real proposal.
        if (!(await featureFlags.isEnabled('workspaces'))) {
            return {};
        }

        const { accountId, proposalSlug } = await params;
        const { network, address } = daoUtils.parseDaoId(accountId);

        return governanceMetadataUtils.generateProposalMetadata({
            params: Promise.resolve({
                network,
                addressOrEns: address,
                proposalSlug,
            }),
        });
    };
}

export const workspaceMetadataUtils = new WorkspaceMetadataUtils();

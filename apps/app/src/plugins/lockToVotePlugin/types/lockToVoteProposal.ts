import type { ITokenProposal } from '@/plugins/tokenPlugin/types';
import type { ILockToVotePluginSettings } from './lockToVotePluginSettings';

export interface ILockToVoteProposal extends Omit<ITokenProposal, 'settings'> {
    /**
     * Lock-to-vote-specific plugin settings.
     */
    settings: ILockToVotePluginSettings;
    /**
     * Live ERC-20 totalSupply values keyed by lowercased token address. Populated by the api
     * service layer (`governanceService.getProposalBySlug` / `getProposalList`). Values are
     * stringified bigints for SSR-safe React Query hydration. Optional because SPP sub-proposals
     * routed by the stage plugin's interface type may miss the enrichment when the backend data
     * is inconsistent — consumers must safe-parse missing values.
     */
    tokensTotalSupply?: Record<string, string>;
}

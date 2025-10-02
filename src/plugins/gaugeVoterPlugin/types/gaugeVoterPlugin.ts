import type { IDaoPlugin } from '@/shared/api/daoService';

export interface IGaugeVoterPlugin extends IDaoPlugin {
    /**
     * List of supported gauge types for voting.
     */
    supportedGaugeTypes?: string[];
    /**
     * Minimum voting power required to participate in gauge voting.
     */
    minimumVotingPower?: string;
    /**
     * Whether to enable delegation for gauge voting.
     */
    enableDelegation?: boolean;
}
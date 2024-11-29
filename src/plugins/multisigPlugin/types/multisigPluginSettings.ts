import type { IPluginSettings, Network } from '@/shared/api/daoService';

export interface IMultisigPluginSettings extends IPluginSettings {
    [x: string]: any;
    /**
     * The minimum number of approvals required for a proposal to be approved.
     */
    minApprovals: number;
    /**
     * Boolean indicating whether only multisig members can vote on proposals.
     */
    onlyListed: boolean;
    /**
     * Array of multisig members.
     */
    network: Network;
    /**
     * DAO members count only set when settings are fetched for a specific block number (e.g. settings when a proposal was created)
     */
    historicalMembersCount?: string;
}

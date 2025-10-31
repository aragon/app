import type { IDaoPlugin } from '@/shared/api/daoService';
import type { ILockToVotePluginSettings } from './lockToVotePluginSettings';

export interface ILockToVotePlugin extends IDaoPlugin<ILockToVotePluginSettings> {
    /**
     * The address of the lock manager contract.
     */
    lockManagerAddress: string;
    /**
     * The voting escrow settings of the plugin.
     */
    votingEscrow?: {
        /**
         * The address of the VotingEscrow (curve) contract.
         */
        curveAddress: string;
    };
}

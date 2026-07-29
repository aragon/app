import type { IDaoPlugin } from '@/shared/api/daoService';
import type { ITokenPluginSettings } from './tokenPluginSettings';

export interface ITokenPlugin extends IDaoPlugin<ITokenPluginSettings> {
    /**
     * The voting escrow settings of the plugin.
     */
    votingEscrow?: {
        /**
         * The address of the curve contract.
         */
        curveAddress: string;
        /**
         * The address of the exit queue contract.
         */
        exitQueueAddress: string;
        /**
         * The address of the voting escrow contract.
         */
        escrowAddress: string;
        /**
         * The address of the clock contract.
         */
        clockAddress: string;
        /**
         * The address of the NFT lock contract.
         */
        nftLockAddress: string;
        /**
         * The address of the underlying token contract.
         */
        underlying: string;
    };
}

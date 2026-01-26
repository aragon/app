import type { IToken } from '@/modules/finance/api/financeService';
import type { IDaoPlugin, IPluginSettings } from '@/shared/api/daoService';

export interface IGaugeVoterPluginSettingsEscrowSettings {
    /**
     * The minimum amount required to lock.
     */
    minDeposit: string;
    /**
     * The minimum lock time before unlocking is available.
     */
    minLockTime: number;
    /**
     * The maximum time the voting power can increase.
     */
    maxTime: number;
    /**
     * The linear coefficient used to calculate the voting power increase over time.
     */
    slope: number;
    /**
     * The constant coefficient used to calculate the voting power increase over time.
     */
    bias: number;
    /**
     * The time in seconds between unlock and withdrawal.
     */
    cooldown: number;
    /**
     * Maximum exit fee percentage (basis points: 0-10000). Used for dynamic exit queue.
     */
    feePercent?: number;
    /**
     * Minimum exit fee percentage (basis points: 0-10000). Used for dynamic exit queue.
     */
    minFeePercent?: number;
    /**
     * Minimum cooldown period for early withdrawal (seconds). Used for dynamic exit queue.
     */
    minCooldown?: number;
}

export interface IGaugeVoterPluginSettingsToken extends IToken {
    /**
     * This is not a real ERC20 token, but an adapter contract with some of the interfaces supported (but not all).
     */
    type: 'escrowAdapter';
    /**
     * The address of the underlying token contract.
     */
    underlying: string;
    /**
     * Defines if the token supports the delegation feature or not.
     */
    hasDelegate: boolean;
}

export interface IGaugeVoterPluginSettings extends IPluginSettings {
    /**
     * The settings of the voting escrow.
     */
    votingEscrow: IGaugeVoterPluginSettingsEscrowSettings;
    /**
     * Structured token configuration returned by the backend.
     */
    token: IGaugeVoterPluginSettingsToken;
}

export interface IGaugeVoterPlugin
    extends IDaoPlugin<IGaugeVoterPluginSettings> {
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

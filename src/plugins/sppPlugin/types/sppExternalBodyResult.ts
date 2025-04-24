import type { SppProposalType } from './enum';

export interface ISppExternalBodyResult {
    /**
     * External body address.
     */
    pluginAddress: string;
    /**
     * Result type being reported (`Approval` or `Veto`)
     */
    resultType: SppProposalType;
    /**
     * Transaction hash in which the proposal result was reported.
     */
    transactionHash: string;
    /**
     * Block number in which the proposal result was reported.
     */
    blockNumber: number;
}

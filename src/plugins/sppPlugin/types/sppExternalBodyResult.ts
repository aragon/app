import type { SppProposalType } from './enum';

export interface ISppProposalBodyResult {
    /**
     * External body address.
     */
    pluginAddress: string;
    /**
     * Index of the stage on which external body is located.
     */
    stageIndex: number;
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

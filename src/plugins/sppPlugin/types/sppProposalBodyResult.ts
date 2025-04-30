import type { SppProposalType } from './enum';

export interface ISppProposalBodyResult {
    /**
     * Address of the body.
     */
    pluginAddress: string;
    /**
     * Index of the stage on which body is setup.
     */
    stage: number;
    /**
     * Result type being reported (`Approval` or `Veto`)
     */
    resultType: SppProposalType;
}

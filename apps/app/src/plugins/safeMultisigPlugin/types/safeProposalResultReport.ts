import type { SppProposalType } from '@/plugins/sppPlugin/types';

/**
 * Decoded `reportProposalResult` call found inside a Safe transaction.
 */
export interface ISafeProposalResultReport {
    /**
     * Onchain index of the SPP proposal the result is reported for.
     */
    proposalId: bigint;
    /**
     * Index of the stage the result is reported for.
     */
    stageId: number;
    /**
     * Governance effect of the report, used to name the pending action instead of showing a bare
     * signature count.
     */
    resultType: SppProposalType;
    /**
     * Whether the report also tries to advance the stage.
     */
    tryAdvance: boolean;
}

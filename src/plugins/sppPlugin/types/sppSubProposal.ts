import type { IProposal } from '@/modules/governance/api/governanceService';

export interface ISppSubProposal extends IProposal {
    /**
     * Index of the stage the sub proposal is created on.
     */
    stageIndex: number;
    /**
     * Timestamp of the creation date in seconds.
     */
    blockTimestamp: number;
    /**
     * The result of the sub-proposal (for approval/veto)
     */
    result: boolean;
}

import type { IProposal } from '@/modules/governance/api/governanceService';

export interface ISppSubProposal extends IProposal {
    /**
     * ID of the stage the sub proposal is created on.
     */
    stageId: string;
    /**
     * Timestamp of the creation date in seconds.
     */
    blockTimestamp: number;
    /**
     * The result of the sub-proposal (for approval/veto)
     */
    result: boolean;
}

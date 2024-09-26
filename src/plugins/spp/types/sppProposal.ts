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
}

export interface ISppProposal extends Omit<IProposal, 'endDate'> {
    /**
     * Index of the current active stage.
     */
    currentStageIndex: string;
    /**
     * Mapping from stageId to array of sub-proposals for that stage.
     */
    subProposals: Record<string, ISppSubProposal[]>;
}

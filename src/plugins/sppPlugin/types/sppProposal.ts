import type { IProposal } from '@/modules/governance/api/governanceService';

export enum ISppProposalStageStatus {
    VETOED = 'VETOED',
    PENDING = 'PENDING',
    INACTIVE = 'INACTIVE',
    ACTIVE = 'ACTIVE',
    REJECTED = 'REJECTED',
    ACCEPTED = 'ACCEPTED',
    ADVANCED = 'ADVANCED',
    EXPIRED = 'EXPIRED',
}

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
     * Stage sub proposals.
     */
    subProposals: ISppSubProposal[];
}

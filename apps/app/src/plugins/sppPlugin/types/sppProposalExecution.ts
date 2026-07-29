import type { IProposalExecution } from '@/modules/governance/api/governanceService';

export interface ISppProposalExecution extends IProposalExecution {
    /**
     * The index of the stage this execution status is linked to.
     */
    stageIndex: number;
}

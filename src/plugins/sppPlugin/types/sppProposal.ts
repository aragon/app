import type { IProposal } from '@/modules/governance/api/governanceService';
import type { ISppPluginSettings } from './sppPluginSettings';
import type { ISppProposalBodyResult } from './sppProposalBodyResult';
import type { ISppProposalExecution } from './sppProposalExecution';
import type { ISppSubProposal } from './sppSubProposal';

export interface ISppProposal extends IProposal<ISppPluginSettings> {
    /**
     * Index of the current active stage.
     */
    stageIndex: number;
    /**
     * Timestamp of the last stage transition to help calculate start and end times of the stages.
     */
    lastStageTransition: number;
    /**
     * Stage sub proposals.
     */
    subProposals: ISppSubProposal[];
    /**
     * Execution information for each stage.
     */
    stageExecutions: ISppProposalExecution[];
    /**
     * Results of the process bodies.
     */
    results?: ISppProposalBodyResult[];
}

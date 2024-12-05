import type { IProposal } from '@/modules/governance/api/governanceService';
import type { ISppExecution } from './sppExecution';
import type { ISppPluginSettings } from './sppPluginSettings';
import type { ISppSubProposal } from './sppSubProposal';

export interface ISppProposal extends Omit<IProposal<ISppPluginSettings>, 'endDate'> {
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
    stageExecutions: ISppExecution[];
}

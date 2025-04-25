import type { IProposal } from '@/modules/governance/api/governanceService';
import type { ISppPluginSettings } from './sppPluginSettings';
import type { ISppProposalExecution } from './sppProposalExecution';
import type { ISppSubProposal } from './sppSubProposal';

export enum SppResultType {
    NONE = 0,
    APPROVAL = 1,
    VETO = 2,
}

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
     * The results of the proposals stages.
     */
    results?: Record<number, Record<string, SppResultType>>;
}

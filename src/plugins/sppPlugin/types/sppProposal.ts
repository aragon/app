import type { IProposal } from '@/modules/governance/api/governanceService';
import type { ISppExternalBodyResult } from './sppExternalBodyResult';
import type { ISppPluginSettings } from './sppPluginSettings';
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
     * External body results. One result per external address/body.
     */
    result: ISppExternalBodyResult[];
}

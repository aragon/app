import type { ISppStagePlugin } from './sppStagePlugin';

export interface ISppStage {
    /**
     * ID of the stage.
     */
    id: string;
    /**
     * Name of the stage.
     */
    name: string;
    /**
     * List of plugins for this stage.
     */
    plugins: ISppStagePlugin[];
    /**
     * Duration in seconds of the stage.
     */
    voteDuration: number;
    /**
     * The maximum amount of time a proposal can be advanced to the next stage.
     */
    maxAdvance: number;
    /**
     * The minimum amount of time before a proposal can be advanced to the next stage.
     */
    minAdvance: number;
    /**
     * The threshold of votes needed to approve a proposal.
     */
    approvalThreshold: number;
    /**
     * The threshold of votes needed to veto a proposal.
     */
    vetoThreshold: number;
}

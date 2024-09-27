import type { IDaoPlugin, IDaoSettings } from '@/shared/api/daoService';

export enum SppProposalType {
    APPROVAL = 'Approval',
    VETO = 'Veto',
}

export interface ISppStagePlugin extends IDaoPlugin {
    /**
     * ID of the stage.
     */
    proposalType: SppProposalType;
    // NOTICED THE BELOW IN THE SMART CONTRACT CODE NOT SURE IF WE NEED THEM HERE OR NOT
    /**
     * The address of the allowed body.
     */
    allowedBody: string;
}

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
    votingPeriod: number;
    /**
     * The maximum amount of time a proposal can be advanced to the next stage.
     */
    maxAdvance: number;
    /**
     * The minimum amount of time before a proposal can be advanced to the next stage.
     */
    minAdvance: number;
    /**
     *  The threshold of votes needed to approve a proposal.
     */
    approvalThreshold: number;
    /**
     * The threshold of votes needed to veto a proposal.
     */
    vetoThreshold: number;
}

export interface IDaoSppSettingsObject extends IDaoSettings {
    /**
     * List of stages of the SPP plugin.
     */
    stages: ISppStage[];
}

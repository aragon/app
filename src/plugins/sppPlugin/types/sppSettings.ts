import type { IDaoPlugin, IDaoSettings } from '@/shared/api/daoService';

export enum SppProposalType {
    APPROVAL = 'Approval',
    VETO = 'Veto',
}

export interface ISppStagePlugin extends IDaoPlugin {
    /**
     * is the type of proposal Approval or Veto.
     */
    proposalType: SppProposalType;
    /**
     * Is the plugin of type process.
     */
    isProcess: boolean;
    /**
     * Is the plugin of type body.
     */
    isBody: boolean;
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

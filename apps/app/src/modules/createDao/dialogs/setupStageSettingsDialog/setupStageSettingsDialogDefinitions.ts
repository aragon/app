import type { IDateDuration } from '@/shared/utils/dateUtils';

export interface ISetupStageSettingsForm {
    /**
     * Number of approving bodies required for the stage to pass. `0` when the
     * stage has no approving bodies.
     */
    approvalThreshold: number;
    /**
     * Number of vetoing bodies required to veto the stage. `0` when the stage
     * has no vetoing bodies.
     */
    vetoThreshold: number;
    /**
     * The period of time the stage is open for voting.
     */
    votingPeriod: IDateDuration;
    /**
     * Defines if the stage can advance early or not.
     */
    earlyStageAdvance: boolean;
    /**
     * The amount of time that the stage will be eligible to be advanced.
     */
    stageExpiration?: IDateDuration;
}

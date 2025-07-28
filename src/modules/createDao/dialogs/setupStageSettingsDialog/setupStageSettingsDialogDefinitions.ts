import type { IDateDuration } from '@/shared/utils/dateUtils';
import type { ProcessStageType } from '../../components/createProcessForm';

export interface ISetupStageSettingsForm {
    /**
     * Type of the stage.
     */
    type: ProcessStageType;
    /**
     * Number of bodies required to veto (for optimistic type) or approve.
     */
    requiredApprovals: number;
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

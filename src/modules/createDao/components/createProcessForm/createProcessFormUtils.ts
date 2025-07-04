import { type ICreateProcessFormDataAdvanced, ProcessStageType } from './createProcessFormDefinitions';

class CreateProcessFormUtils {
    private defaultVotingPeriod = { days: 7, minutes: 0, hours: 0 };

    private defaultType = ProcessStageType.NORMAL;

    private defaultStageSettings = {
        type: this.defaultType,
        votingPeriod: this.defaultVotingPeriod,
        earlyStageAdvance: true,
        requiredApprovals: 1,
    };

    buildDefaultStage = (): ICreateProcessFormDataAdvanced['stages'][number] => {
        const internalId = crypto.randomUUID();

        return {
            internalId,
            name: '',
            settings: this.defaultStageSettings,
            bodies: [],
        };
    };
}

export const createProcessFormUtils = new CreateProcessFormUtils();

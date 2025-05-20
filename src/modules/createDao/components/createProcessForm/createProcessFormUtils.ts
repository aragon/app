import { type ICreateProcessFormDataAdvanced, ProcessStageType } from './createProcessFormDefinitions';

class CreateProcessFormUtils {
    private defaultVotingPeriod = { days: 7, minutes: 0, hours: 0 };

    private defaultTimingSettings = { votingPeriod: this.defaultVotingPeriod, earlyStageAdvance: true };

    private defaultType = ProcessStageType.NORMAL;

    buildDefaultStage = (): ICreateProcessFormDataAdvanced['stages'][number] => {
        const internalId = crypto.randomUUID();

        return {
            internalId,
            name: '',
            type: this.defaultType,
            timing: this.defaultTimingSettings,
            bodies: [],
            requiredApprovals: 1,
        };
    };
}

export const createProcessFormUtils = new CreateProcessFormUtils();

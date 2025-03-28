import { ProcessStageType } from './createProcessFormDefinitions';

class CreateProcessFormUtils {
    private defaultVotingPeriod = { days: 7, minutes: 0, hours: 0 };

    private defaultTimingSettings = { votingPeriod: this.defaultVotingPeriod, earlyStageAdvance: false };

    private defaultType = ProcessStageType.NORMAL;

    buildDefaultStage = () => {
        const internalId = crypto.randomUUID();

        return {
            internalId,
            name: '',
            type: this.defaultType,
            timing: this.defaultTimingSettings,
            requiredApprovals: 1,
        };
    };
}

export const createProcessFormUtils = new CreateProcessFormUtils();

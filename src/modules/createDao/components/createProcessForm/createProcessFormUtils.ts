import { type ICreateProcessFormDataAdvanced, ProcessStageType } from './createProcessFormDefinitions';

class CreateProcessFormUtils {
    private defaultVotingPeriod = { days: 7, minutes: 0, hours: 0 };

    private defaultType = ProcessStageType.TIMELOCK;

    buildDefaultStage = (): ICreateProcessFormDataAdvanced['stages'][number] => {
        const internalId = crypto.randomUUID();

        return {
            internalId,
            name: '',
            settings: {
                type: this.defaultType,
                votingPeriod: this.defaultVotingPeriod,
                earlyStageAdvance: true,
                requiredApprovals: 1,
            },
            bodies: [],
        };
    };
}

export const createProcessFormUtils = new CreateProcessFormUtils();

import type { ISetupBodyForm } from '../../dialogs/setupBodyDialog';
import { BodyType } from '../../types/enum';
import { type ICreateProcessFormDataAdvanced, ProcessStageType } from './createProcessFormDefinitions';

class CreateProcessFormUtils {
    private readonly defaultVotingPeriod = { days: 7, minutes: 0, hours: 0 };

    private readonly defaultType = ProcessStageType.NORMAL;

    private readonly defaultStageSettings = {
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

    isBodySafe = (body: ISetupBodyForm) => body.type === BodyType.EXTERNAL && body.isSafe;
}

export const createProcessFormUtils = new CreateProcessFormUtils();

import type { ISetupBodyForm } from '../../dialogs/setupBodyDialog';
import { BodyType } from '../../types/enum';
import type { ICreateProcessFormDataAdvanced } from './createProcessFormDefinitions';

class CreateProcessFormUtils {
    private defaultVotingPeriod = { days: 7, minutes: 0, hours: 0 };

    private defaultStageSettings = {
        votingPeriod: this.defaultVotingPeriod,
        earlyStageAdvance: true,
        approvalThreshold: 1,
        // Encoded as 0 unless the stage actually has vetoing bodies, so this is a
        // safe default that also gives veto/mixed stages a sensible value.
        vetoThreshold: 1,
    };

    buildDefaultStage =
        (): ICreateProcessFormDataAdvanced['stages'][number] => {
            const internalId = crypto.randomUUID();

            return {
                internalId,
                name: '',
                settings: this.defaultStageSettings,
                bodies: [],
            };
        };

    isBodySafe = (body: ISetupBodyForm) =>
        body.type === BodyType.EXTERNAL && body.isSafe;
}

export const createProcessFormUtils = new CreateProcessFormUtils();

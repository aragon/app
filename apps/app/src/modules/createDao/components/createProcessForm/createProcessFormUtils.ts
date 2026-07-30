import { SppProposalType } from '@/plugins/sppPlugin/types';
import type { ISetupBodyForm } from '../../dialogs/setupBodyDialog';
import { BodyType } from '../../types/enum';
import type {
    ICreateProcessFormDataAdvanced,
    ICreateProcessFormStage,
} from './createProcessFormDefinitions';

export interface IEffectiveStageThresholds {
    /**
     * Number of approving bodies in the stage.
     */
    approvingBodyCount: number;
    /**
     * Number of vetoing bodies in the stage.
     */
    vetoingBodyCount: number;
    /**
     * Stage approval threshold clamped to the approving-body count.
     */
    approvalThreshold: number;
    /**
     * Stage veto threshold clamped to the vetoing-body count.
     */
    vetoThreshold: number;
}

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

    // The stored thresholds go stale when the body composition changes without
    // the settings dialog being reopened: 0 when the stage had no bodies of the
    // type, or above the body count after bodies are removed. Clamp to
    // [1, bodyCount] while bodies of the type exist and to 0 otherwise, to
    // match what the encoder writes on-chain. An unset proposalType defaults
    // to approval.
    getEffectiveStageThresholds = (params: {
        settings: Pick<
            ICreateProcessFormStage['settings'],
            'approvalThreshold' | 'vetoThreshold'
        >;
        bodies: ICreateProcessFormStage['bodies'];
    }): IEffectiveStageThresholds => {
        const { settings, bodies } = params;

        const vetoingBodyCount = bodies.filter(
            (body) => body.proposalType === SppProposalType.VETO,
        ).length;
        const approvingBodyCount = bodies.length - vetoingBodyCount;

        const clampThreshold = (threshold: number, bodyCount: number) =>
            bodyCount > 0 ? Math.min(Math.max(threshold, 1), bodyCount) : 0;

        return {
            approvingBodyCount,
            vetoingBodyCount,
            approvalThreshold: clampThreshold(
                settings.approvalThreshold,
                approvingBodyCount,
            ),
            vetoThreshold: clampThreshold(
                settings.vetoThreshold,
                vetoingBodyCount,
            ),
        };
    };
}

export const createProcessFormUtils = new CreateProcessFormUtils();

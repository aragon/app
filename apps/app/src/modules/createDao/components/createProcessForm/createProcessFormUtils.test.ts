import { SppProposalType } from '@/plugins/sppPlugin/types';
import {
    generateSetupBodyFormExternal,
    generateSetupBodyFormNew,
} from '../../testUtils';
import { createProcessFormUtils } from './createProcessFormUtils';

describe('createProcessForm utils', () => {
    describe('getEffectiveStageThresholds', () => {
        const approvingBody = () =>
            generateSetupBodyFormNew({
                proposalType: SppProposalType.APPROVAL,
            });
        const vetoingBody = () =>
            generateSetupBodyFormExternal({
                proposalType: SppProposalType.VETO,
            });

        it('counts approving and vetoing bodies independently', () => {
            const result = createProcessFormUtils.getEffectiveStageThresholds({
                settings: { approvalThreshold: 1, vetoThreshold: 1 },
                bodies: [approvingBody(), approvingBody(), vetoingBody()],
            });

            expect(result.approvingBodyCount).toEqual(2);
            expect(result.vetoingBodyCount).toEqual(1);
        });

        it('defaults bodies without a proposal type to approving', () => {
            const result = createProcessFormUtils.getEffectiveStageThresholds({
                settings: { approvalThreshold: 1, vetoThreshold: 1 },
                bodies: [generateSetupBodyFormNew()],
            });

            expect(result.approvingBodyCount).toEqual(1);
            expect(result.vetoingBodyCount).toEqual(0);
        });

        it('returns zero thresholds when the stage has no bodies of the type, matching the encoder', () => {
            const result = createProcessFormUtils.getEffectiveStageThresholds({
                settings: { approvalThreshold: 1, vetoThreshold: 1 },
                bodies: [vetoingBody()],
            });

            expect(result.approvalThreshold).toEqual(0);
            expect(result.vetoThreshold).toEqual(1);
        });

        it('raises a stale zero threshold to one when bodies of the type exist', () => {
            const result = createProcessFormUtils.getEffectiveStageThresholds({
                settings: { approvalThreshold: 0, vetoThreshold: 0 },
                bodies: [approvingBody(), vetoingBody()],
            });

            expect(result.approvalThreshold).toEqual(1);
            expect(result.vetoThreshold).toEqual(1);
        });

        it('lowers a stale threshold above the body count of the type', () => {
            const result = createProcessFormUtils.getEffectiveStageThresholds({
                settings: { approvalThreshold: 3, vetoThreshold: 2 },
                bodies: [approvingBody(), approvingBody(), vetoingBody()],
            });

            expect(result.approvalThreshold).toEqual(2);
            expect(result.vetoThreshold).toEqual(1);
        });

        it('returns zero thresholds for a timelock stage without bodies', () => {
            const result = createProcessFormUtils.getEffectiveStageThresholds({
                settings: { approvalThreshold: 1, vetoThreshold: 1 },
                bodies: [],
            });

            expect(result.approvalThreshold).toEqual(0);
            expect(result.vetoThreshold).toEqual(0);
        });
    });
});

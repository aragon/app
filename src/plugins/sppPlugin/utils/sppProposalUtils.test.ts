import { type IProposalAction, ProposalActionType } from '@/modules/governance/api/governanceService';
import { timeUtils } from '@/test/utils';
import { ProposalStatus } from '@aragon/ods';
import { DateTime } from 'luxon';
import { generateSppPluginSettings } from '../testUtils';
import { SppStageStatus } from '../types';
import { generateSppProposal } from './../testUtils/generators/sppProposal';
import { generateSppStage } from './../testUtils/generators/sppStage';
import { sppProposalUtils } from './sppProposalUtils';
import { sppStageUtils } from './sppStageUtils';

describe('sppProposal Utils', () => {
    describe('getSppProposalStatus', () => {
        const isStageVetoedSpy = jest.spyOn(sppStageUtils, 'isStageVetoed');
        const endsInFutureSpy = jest.spyOn(sppProposalUtils, 'endsInFuture');
        const getCurrentStageSpy = jest.spyOn(sppProposalUtils, 'getCurrentStage');
        const areAllStagesAcceptedSpy = jest.spyOn(sppProposalUtils, 'areAllStagesAccepted');
        const isExecutionExpiredSpy = jest.spyOn(sppProposalUtils, 'isExecutionExpired');
        const getStageStatusSpy = jest.spyOn(sppStageUtils, 'getStageStatus');

        afterEach(() => {
            jest.resetAllMocks();
        });

        afterAll(() => {
            jest.restoreAllMocks();
        });

        it('returns executed status when proposal has been executed', () => {
            const proposal = generateSppProposal({
                executed: { status: true },
            });
            expect(sppProposalUtils.getProposalStatus(proposal)).toEqual(ProposalStatus.EXECUTED);
        });

        it('returns pending status when proposal has not started yet', () => {
            const now = '2022-02-10T07:55:55.868Z';
            const startDate = DateTime.fromISO('2022-02-10T08:00:00.000Z').toMillis() / 1000;
            const proposal = generateSppProposal({ startDate });
            timeUtils.setTime(now);
            expect(sppProposalUtils.getProposalStatus(proposal)).toEqual(ProposalStatus.PENDING);
        });

        it('returns vetoed status when a stage is vetoed', () => {
            const now = '2022-02-10T08:00:00.000Z';
            const startDate = DateTime.fromISO('2022-02-09T08:00:00.000Z').toMillis() / 1000;
            const proposal = generateSppProposal({
                startDate,
                settings: generateSppPluginSettings({ stages: [generateSppStage({ votingPeriod: 100 })] }),
            });
            timeUtils.setTime(now);
            isStageVetoedSpy.mockReturnValue(true);
            endsInFutureSpy.mockReturnValue(true);
            expect(sppProposalUtils.getProposalStatus(proposal)).toEqual(ProposalStatus.VETOED);
        });

        it('returns active status when proposal is ongoing and current stage is active', () => {
            const now = '2022-02-10T08:00:00.000Z';
            const startDate = DateTime.fromISO('2022-02-09T08:00:00.000Z').toMillis() / 1000;
            const proposal = generateSppProposal({ startDate });
            timeUtils.setTime(now);
            endsInFutureSpy.mockReturnValue(true);
            getCurrentStageSpy.mockReturnValue(generateSppStage());
            getStageStatusSpy.mockReturnValue(SppStageStatus.ACTIVE);
            expect(sppProposalUtils.getProposalStatus(proposal)).toEqual(ProposalStatus.ACTIVE);
        });

        it('returns rejected status when proposal has ended and current stage is rejected', () => {
            const now = '2022-02-12T08:00:00.000Z';
            const startDate = DateTime.fromISO('2022-02-09T08:00:00.000Z').toMillis() / 1000;
            const proposal = generateSppProposal({ startDate });
            timeUtils.setTime(now);
            endsInFutureSpy.mockReturnValue(false);
            getCurrentStageSpy.mockReturnValue(generateSppStage());
            getStageStatusSpy.mockReturnValue(SppStageStatus.REJECTED);
            expect(sppProposalUtils.getProposalStatus(proposal)).toEqual(ProposalStatus.REJECTED);
        });

        it('returns expired status when proposal has ended, all stages are accepted, has actions, but execution is expired', () => {
            const now = '2022-02-12T08:00:00.000Z';
            const startDate = DateTime.fromISO('2022-02-09T08:00:00.000Z').toMillis() / 1000;
            const actions: IProposalAction[] = [
                { from: '0', to: '1', data: '', value: '0', type: ProposalActionType.TRANSFER, inputData: null },
            ];
            const proposal = generateSppProposal({ startDate, actions });
            timeUtils.setTime(now);
            endsInFutureSpy.mockReturnValue(false);
            getCurrentStageSpy.mockReturnValue(generateSppStage());
            getStageStatusSpy.mockReturnValue(SppStageStatus.ACCEPTED);
            areAllStagesAcceptedSpy.mockReturnValue(true);
            isExecutionExpiredSpy.mockReturnValue(true);
            expect(sppProposalUtils.getProposalStatus(proposal)).toEqual(ProposalStatus.EXPIRED);
        });
    });
});

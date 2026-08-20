import { ProposalStatus } from '@aragon/gov-ui-kit';
import { DateTime } from 'luxon';
import { externalPluginId } from '@/plugins/safeMultisigPlugin/constants';
import { safeBodyPluginId } from '@/plugins/safeMultisigPlugin/constants';
import { Network, PluginInterfaceType } from '@/shared/api/daoService';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { timeUtils } from '@/test/utils';
import {
    generateSppPluginSettings,
    generateSppProposal,
    generateSppStage,
    generateSppStagePlugin,
    generateSppSubProposal,
} from '../../testUtils';
import { SppProposalType, VotingBodyBrandIdentity } from '../../types';
import { sppStageUtils } from './sppStageUtils';

describe('SppStageUtils', () => {
    const getSlotFunctionSpy = jest.spyOn(
        pluginRegistryUtils,
        'getSlotFunction',
    );

    afterEach(() => {
        getSlotFunctionSpy.mockReset();
    });

    describe('getBodyPluginId', () => {
        it.each([
            {
                label: 'an installed body',
                plugin: generateSppStagePlugin({
                    interfaceType: PluginInterfaceType.MULTISIG,
                }),
                network: Network.ETHEREUM_MAINNET,
                expected: PluginInterfaceType.MULTISIG,
            },
            {
                label: 'a Safe on a supported network',
                plugin: generateSppStagePlugin({
                    interfaceType: undefined,
                    brandId: VotingBodyBrandIdentity.SAFE,
                }),
                network: Network.ETHEREUM_MAINNET,
                expected: safeBodyPluginId,
            },
            {
                label: 'a Safe on an unsupported network',
                plugin: generateSppStagePlugin({
                    interfaceType: undefined,
                    brandId: VotingBodyBrandIdentity.SAFE,
                }),
                network: Network.CITREA_MAINNET,
                expected: externalPluginId,
            },
            {
                label: 'a generic external body',
                plugin: generateSppStagePlugin({
                    interfaceType: undefined,
                    brandId: VotingBodyBrandIdentity.OTHER,
                }),
                network: Network.ETHEREUM_MAINNET,
                expected: externalPluginId,
            },
        ])('resolves $label to $expected', ({ plugin, network, expected }) => {
            expect(sppStageUtils.getBodyPluginId(plugin, network)).toEqual(
                expected,
            );
        });
    });

    describe('getStageStartDate', () => {
        it('returns main-proposal startDate for the first stage', () => {
            const startDate = DateTime.fromISO(
                '2022-02-10T07:55:55.868Z',
            ).toSeconds();
            const proposal = generateSppProposal({ startDate, stageIndex: 1 });
            const stage = generateSppStage({ stageIndex: 0 });
            const result = sppStageUtils.getStageStartDate(proposal, stage);
            expect(result?.toSeconds()).toBe(startDate);
        });

        it('returns lastStageTransition for current stage', () => {
            const lastStageTransition = DateTime.fromISO(
                '2022-02-10T07:55:55.868Z',
            ).toSeconds();
            const proposal = generateSppProposal({
                lastStageTransition,
                stageIndex: 1,
            });
            const stage = generateSppStage({ stageIndex: 1 });
            const result = sppStageUtils.getStageStartDate(proposal, stage);
            expect(result?.toSeconds()).toBe(lastStageTransition);
        });

        it('returns the linked subProposal startDate for previous stages', () => {
            const subProposalStartDate = DateTime.fromISO(
                '2016-05-25T09:08:34.123',
            ).toSeconds();
            const proposal = generateSppProposal({
                stageIndex: 2,
                subProposals: [
                    generateSppSubProposal({
                        stageIndex: 1,
                        startDate: subProposalStartDate,
                    }),
                ],
            });
            const stage = generateSppStage({ stageIndex: 1 });
            const result = sppStageUtils.getStageStartDate(proposal, stage);
            expect(result?.toSeconds()).toBe(subProposalStartDate);
        });

        it('returns undefined for other stages', () => {
            const now = '2022-02-10T07:55:55.868Z';
            const lastStageTransition = DateTime.fromISO(now)
                .minus({ hours: 2 })
                .toSeconds();
            const proposal = generateSppProposal({
                lastStageTransition,
                stageIndex: 1,
            });
            const stage = generateSppStage({ stageIndex: 2 });
            const result = sppStageUtils.getStageStartDate(proposal, stage);
            expect(result).toBe(undefined);
        });
    });

    describe('getStageEndDate', () => {
        it('returns correct end date based on voteDuration', () => {
            const now = '2022-02-10T07:55:55.868Z';
            const startDate = DateTime.fromISO(now).toSeconds();
            const proposal = generateSppProposal({ startDate });
            const stage = generateSppStage({ voteDuration: 86_400 });
            const result = sppStageUtils.getStageEndDate(proposal, stage);
            expect(result?.toSeconds()).toBe(startDate + 86_400);
        });
    });

    describe('getStageMaxAdvance', () => {
        const getStartStartDateSpy = jest.spyOn(
            sppStageUtils,
            'getStageStartDate',
        );

        afterEach(() => {
            getStartStartDateSpy.mockReset();
        });

        it('returns the max-advance time based on the proposal start date', () => {
            const startDate = DateTime.fromISO('2016-05-25T09:08:34.123');
            const proposal = generateSppProposal();
            const stage = generateSppStage({ maxAdvance: 300 });
            const expectedValue = startDate.plus({ seconds: stage.maxAdvance });
            getStartStartDateSpy.mockReturnValue(startDate);
            expect(sppStageUtils.getStageMaxAdvance(proposal, stage)).toEqual(
                expectedValue,
            );
        });
    });

    describe('getStageMinAdvance', () => {
        const getStartStartDateSpy = jest.spyOn(
            sppStageUtils,
            'getStageStartDate',
        );

        afterEach(() => {
            getStartStartDateSpy.mockReset();
        });

        it('returns the min-advance time based on the proposal start date', () => {
            const startDate = DateTime.fromISO('2016-05-25T09:08:34.123');
            const proposal = generateSppProposal();
            const stage = generateSppStage({ minAdvance: 300 });
            const expectedValue = startDate.plus({ seconds: stage.minAdvance });
            getStartStartDateSpy.mockReturnValue(startDate);
            expect(sppStageUtils.getStageMinAdvance(proposal, stage)).toEqual(
                expectedValue,
            );
        });
    });

    describe('isVetoReached', () => {
        const getStageResultCountsSpy = jest.spyOn(
            sppStageUtils,
            'getStageResultCounts',
        );

        afterEach(() => {
            getStageResultCountsSpy.mockReset();
        });

        it('returns true when veto count reaches threshold', () => {
            getStageResultCountsSpy.mockReturnValue({
                approvalCount: 0,
                vetoCount: 1,
            });

            const stage = generateSppStage({ vetoThreshold: 1 });
            const proposal = generateSppProposal({
                settings: generateSppPluginSettings({ stages: [stage] }),
            });

            expect(sppStageUtils.isVetoReached(proposal, stage)).toBeTruthy();
        });

        it('returns false when veto count is below threshold', () => {
            getStageResultCountsSpy.mockReturnValue({
                approvalCount: 0,
                vetoCount: 1,
            });

            const stage = generateSppStage({ vetoThreshold: 2 });
            const proposal = generateSppProposal({
                settings: generateSppPluginSettings({ stages: [stage] }),
            });

            expect(sppStageUtils.isVetoReached(proposal, stage)).toBeFalsy();
        });

        it('returns false when veto threshold is set to 0', () => {
            getStageResultCountsSpy.mockReturnValue({
                approvalCount: 0,
                vetoCount: 0,
            });

            const stage = generateSppStage({ vetoThreshold: 0 });
            const proposal = generateSppProposal({
                settings: generateSppPluginSettings({ stages: [stage] }),
            });

            expect(sppStageUtils.isVetoReached(proposal, stage)).toBeFalsy();
        });

        it('ignores approving-body successes', () => {
            getStageResultCountsSpy.mockReturnValue({
                approvalCount: 5,
                vetoCount: 0,
            });

            const stage = generateSppStage({ vetoThreshold: 1 });
            const proposal = generateSppProposal({
                settings: generateSppPluginSettings({ stages: [stage] }),
            });

            expect(sppStageUtils.isVetoReached(proposal, stage)).toBeFalsy();
        });
    });

    describe('isApprovalReached', () => {
        const getStageResultCountsSpy = jest.spyOn(
            sppStageUtils,
            'getStageResultCounts',
        );

        afterEach(() => {
            getStageResultCountsSpy.mockReset();
        });

        afterAll(() => {
            getStageResultCountsSpy.mockRestore();
        });

        it('returns true when approval count reaches threshold', () => {
            getStageResultCountsSpy.mockReturnValue({
                approvalCount: 1,
                vetoCount: 0,
            });

            const stage = generateSppStage({ approvalThreshold: 1 });
            const proposal = generateSppProposal({
                settings: generateSppPluginSettings({ stages: [stage] }),
            });

            expect(
                sppStageUtils.isApprovalReached(proposal, stage),
            ).toBeTruthy();
        });

        it('returns false when approval count is below threshold', () => {
            getStageResultCountsSpy.mockReturnValue({
                approvalCount: 0,
                vetoCount: 0,
            });

            const stage = generateSppStage({ approvalThreshold: 1 });
            const proposal = generateSppProposal({
                settings: generateSppPluginSettings({ stages: [stage] }),
            });

            expect(
                sppStageUtils.isApprovalReached(proposal, stage),
            ).toBeFalsy();
        });

        it('ignores vetoing-body successes', () => {
            getStageResultCountsSpy.mockReturnValue({
                approvalCount: 0,
                vetoCount: 5,
            });

            const stage = generateSppStage({ approvalThreshold: 1 });
            const proposal = generateSppProposal({
                settings: generateSppPluginSettings({ stages: [stage] }),
            });

            expect(
                sppStageUtils.isApprovalReached(proposal, stage),
            ).toBeFalsy();
        });

        it('is always reached when the stage has no approval requirement', () => {
            getStageResultCountsSpy.mockReturnValue({
                approvalCount: 0,
                vetoCount: 0,
            });

            const stage = generateSppStage({ approvalThreshold: 0 });
            const proposal = generateSppProposal({
                settings: generateSppPluginSettings({ stages: [stage] }),
            });

            expect(
                sppStageUtils.isApprovalReached(proposal, stage),
            ).toBeTruthy();
        });
    });

    describe('getStageResultCounts', () => {
        it('counts an external approving body that reported an approval result', () => {
            const body = generateSppStagePlugin({
                address: '0x1c479675ad559DC151F6Ec7ed3FbF8ceE79582B6',
                proposalType: SppProposalType.APPROVAL,
            });
            const stage = generateSppStage({ stageIndex: 0, plugins: [body] });
            const results = [
                {
                    pluginAddress: body.address,
                    stage: stage.stageIndex,
                    resultType: SppProposalType.APPROVAL,
                },
            ];
            const proposal = generateSppProposal({ results });

            getSlotFunctionSpy.mockReturnValue(undefined);
            expect(sppStageUtils.getStageResultCounts(proposal, stage)).toEqual(
                { approvalCount: 1, vetoCount: 0 },
            );
        });

        it('does not count a body that reported a result on another stage', () => {
            const body = generateSppStagePlugin({
                address: '0xE66AA98B55C5A55c9Af9da12FE39B8868af9a346',
            });
            const stage = generateSppStage({ stageIndex: 1, plugins: [body] });
            const results = [
                {
                    pluginAddress: body.address,
                    stage: 0,
                    resultType: SppProposalType.APPROVAL,
                },
            ];
            const proposal = generateSppProposal({ results });

            getSlotFunctionSpy.mockReturnValue(undefined);
            expect(sppStageUtils.getStageResultCounts(proposal, stage)).toEqual(
                { approvalCount: 0, vetoCount: 0 },
            );
        });

        it('counts an internal approving body whose sub-proposal passed', () => {
            const body = generateSppStagePlugin({
                address: '0xE66AA98B55C5A55c9Af9da12FE39B8868af9a346',
                proposalType: SppProposalType.APPROVAL,
            });
            const stage = generateSppStage({ stageIndex: 0, plugins: [body] });
            const proposal = generateSppProposal({
                subProposals: [
                    generateSppSubProposal({
                        pluginAddress: body.address,
                        stageIndex: stage.stageIndex,
                    }),
                ],
            });

            getSlotFunctionSpy.mockReturnValue(() => true);
            expect(sppStageUtils.getStageResultCounts(proposal, stage)).toEqual(
                { approvalCount: 1, vetoCount: 0 },
            );
        });

        it('counts approving and vetoing bodies into separate buckets', () => {
            const approvingBody = generateSppStagePlugin({
                address: '0x08B2072d388Fa354A4B61c25341707E4Fcd56267',
                proposalType: SppProposalType.APPROVAL,
            });
            const vetoingBody = generateSppStagePlugin({
                address: '0x00E84A0B678CD4584A9A377D334c810025970873',
                proposalType: SppProposalType.VETO,
            });
            const stage = generateSppStage({
                stageIndex: 0,
                plugins: [approvingBody, vetoingBody],
            });
            const proposal = generateSppProposal({
                subProposals: [
                    generateSppSubProposal({
                        stageIndex: 0,
                        pluginAddress: approvingBody.address,
                    }),
                ],
                results: [
                    {
                        pluginAddress: vetoingBody.address,
                        stage: stage.stageIndex,
                        resultType: SppProposalType.VETO,
                    },
                ],
            });

            getSlotFunctionSpy.mockReturnValue(() => true);
            expect(sppStageUtils.getStageResultCounts(proposal, stage)).toEqual(
                { approvalCount: 1, vetoCount: 1 },
            );
        });
    });

    describe('getStageStatus', () => {
        const isVetoReachedSpy = jest.spyOn(sppStageUtils, 'isVetoReached');
        const isStageUnreachedSpy = jest.spyOn(
            sppStageUtils,
            'isStageUnreached',
        );
        const getStageStartDateSpy = jest.spyOn(
            sppStageUtils,
            'getStageStartDate',
        );
        const getStageEndDateSpy = jest.spyOn(sppStageUtils, 'getStageEndDate');
        const getStageMinAdvanceSpy = jest.spyOn(
            sppStageUtils,
            'getStageMinAdvance',
        );
        const getStageMaxAdvanceSpy = jest.spyOn(
            sppStageUtils,
            'getStageMaxAdvance',
        );
        const isApprovalReachedSpy = jest.spyOn(
            sppStageUtils,
            'isApprovalReached',
        );

        afterEach(() => {
            isVetoReachedSpy.mockReset();
            isStageUnreachedSpy.mockReset();
            getStageStartDateSpy.mockReset();
            getStageEndDateSpy.mockReset();
            getStageMaxAdvanceSpy.mockReset();
            getStageMinAdvanceSpy.mockReset();
            isApprovalReachedSpy.mockReset();
        });

        it('returns vetoed when one of the stage has been vetoed', () => {
            const stage = generateSppStage();
            const proposal = generateSppProposal();
            isVetoReachedSpy.mockReturnValue(true);
            expect(sppStageUtils.getStageStatus(proposal, stage)).toEqual(
                ProposalStatus.VETOED,
            );
        });

        it('returns unreached is current stage cannot be reached', () => {
            const stage = generateSppStage();
            const proposal = generateSppProposal();
            isStageUnreachedSpy.mockReturnValue(true);
            expect(sppStageUtils.getStageStatus(proposal, stage)).toEqual(
                ProposalStatus.UNREACHED,
            );
        });

        it('returns pending when stage start date is in the future', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const startDate = DateTime.fromISO(now).plus({ hours: 1 });
            const stage = generateSppStage();
            const proposal = generateSppProposal();
            getStageStartDateSpy.mockReturnValue(startDate);
            timeUtils.setTime(now);
            expect(sppStageUtils.getStageStatus(proposal, stage)).toBe(
                ProposalStatus.PENDING,
            );
        });

        it('returns pending when stage index is greater than current stage index and start-date cannot be processed', () => {
            const stage = generateSppStage({ stageIndex: 2 });
            const proposal = generateSppProposal({ stageIndex: 0 });
            getStageStartDateSpy.mockReturnValue(undefined);
            expect(sppStageUtils.getStageStatus(proposal, stage)).toBe(
                ProposalStatus.PENDING,
            );
        });

        it('returns active when stage has not ended yet', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const endDate = DateTime.fromISO(now).plus({ hours: 1 });
            const stage = generateSppStage();
            const proposal = generateSppProposal();
            getStageEndDateSpy.mockReturnValue(endDate);
            timeUtils.setTime(now);
            expect(sppStageUtils.getStageStatus(proposal, stage)).toBe(
                ProposalStatus.ACTIVE,
            );
        });

        it('returns active when stage has not ended yet, approval has been reached and proposal has no actions', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const endDate = DateTime.fromISO(now).plus({ days: 7 });
            const stage = generateSppStage();
            const settings = generateSppPluginSettings({ stages: [stage] });
            const proposal = generateSppProposal({
                settings,
                hasActions: false,
            });
            getStageEndDateSpy.mockReturnValue(endDate);
            isApprovalReachedSpy.mockReturnValue(true);
            timeUtils.setTime(now);
            expect(sppStageUtils.getStageStatus(proposal, stage)).toBe(
                ProposalStatus.ACTIVE,
            );
        });

        it('returns advanceable when stage has not ended yet, approval has been reached, proposal has actions and can be advanced', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const startDate = DateTime.fromISO(now).minus({ days: 2 });
            const minAdvance = DateTime.fromISO(now).minus({ days: 1 });
            const maxAdvance = DateTime.fromISO(now).plus({ days: 3 });
            const endDate = DateTime.fromISO(now).plus({ days: 10 });

            const stages = [
                generateSppStage({ stageIndex: 0 }),
                generateSppStage({ stageIndex: 1, vetoThreshold: 0 }),
                generateSppStage({ stageIndex: 2 }),
            ];
            const proposal = generateSppProposal({
                hasActions: true,
                stageIndex: 1,
                settings: generateSppPluginSettings({ stages }),
            });

            getStageStartDateSpy.mockReturnValue(startDate);
            getStageEndDateSpy.mockReturnValue(endDate);
            getStageMaxAdvanceSpy.mockReturnValue(maxAdvance);
            getStageMinAdvanceSpy.mockReturnValue(minAdvance);
            isApprovalReachedSpy.mockReturnValue(true);
            timeUtils.setTime(now);

            expect(sppStageUtils.getStageStatus(proposal, stages[1])).toBe(
                ProposalStatus.ADVANCEABLE,
            );
        });

        it('returns advanceable when stage is active, approval is reached, but minAdvanceDate has not yet passed', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const startDate = DateTime.fromISO(now).minus({ days: 2 });
            const minAdvance = DateTime.fromISO(now).plus({ days: 1 });
            const maxAdvance = DateTime.fromISO(now).plus({ days: 3 });
            const endDate = DateTime.fromISO(now).plus({ days: 10 });

            const stages = [
                generateSppStage({ stageIndex: 0 }),
                generateSppStage({ stageIndex: 1, vetoThreshold: 0 }),
                generateSppStage({ stageIndex: 2 }),
            ];
            const proposal = generateSppProposal({
                hasActions: true,
                stageIndex: 1,
                settings: generateSppPluginSettings({ stages }),
            });

            getStageStartDateSpy.mockReturnValue(startDate);
            getStageEndDateSpy.mockReturnValue(endDate);
            getStageMaxAdvanceSpy.mockReturnValue(maxAdvance);
            getStageMinAdvanceSpy.mockReturnValue(minAdvance);
            isApprovalReachedSpy.mockReturnValue(true);
            timeUtils.setTime(now);

            expect(sppStageUtils.getStageStatus(proposal, stages[1])).toBe(
                ProposalStatus.ADVANCEABLE,
            );
        });

        it('returns active when stage has not ended yet, approval has been reached, proposal has actions and stage is optimistic', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const startDate = DateTime.fromISO(now).minus({ days: 2 });
            const minAdvance = DateTime.fromISO(now).minus({ days: 1 });
            const maxAdvance = DateTime.fromISO(now).plus({ days: 3 });
            const endDate = DateTime.fromISO(now).plus({ days: 10 });

            const stages = [
                generateSppStage({ stageIndex: 0 }),
                generateSppStage({
                    stageIndex: 1,
                    approvalThreshold: 0,
                    vetoThreshold: 1,
                }),
                generateSppStage({ stageIndex: 2 }),
            ];
            const proposal = generateSppProposal({
                hasActions: true,
                stageIndex: 1,
                settings: generateSppPluginSettings({ stages }),
            });

            getStageStartDateSpy.mockReturnValue(startDate);
            getStageEndDateSpy.mockReturnValue(endDate);
            getStageMaxAdvanceSpy.mockReturnValue(maxAdvance);
            getStageMinAdvanceSpy.mockReturnValue(minAdvance);
            isApprovalReachedSpy.mockReturnValue(true);
            timeUtils.setTime(now);

            expect(sppStageUtils.getStageStatus(proposal, stages[1])).toBe(
                ProposalStatus.ACTIVE,
            );
        });

        it('returns active for an objection stage while the window is open, even though approval is already reached', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const startDate = DateTime.fromISO(now).minus({ days: 2 });
            const minAdvance = DateTime.fromISO(now).minus({ days: 1 });
            const maxAdvance = DateTime.fromISO(now).plus({ days: 3 });
            const endDate = DateTime.fromISO(now).plus({ days: 10 });

            const stages = [
                generateSppStage({ stageIndex: 0 }),
                generateSppStage({ stageIndex: 1, approvalThreshold: 1 }),
                generateSppStage({ stageIndex: 2 }),
            ];
            const subProposal = generateSppSubProposal({ stageIndex: 1 });
            subProposal.settings = {
                ...subProposal.settings,
                isObjection: true,
            };
            const proposal = generateSppProposal({
                hasActions: true,
                stageIndex: 1,
                settings: generateSppPluginSettings({ stages }),
                subProposals: [subProposal],
            });

            getStageStartDateSpy.mockReturnValue(startDate);
            getStageEndDateSpy.mockReturnValue(endDate);
            getStageMaxAdvanceSpy.mockReturnValue(maxAdvance);
            getStageMinAdvanceSpy.mockReturnValue(minAdvance);
            isApprovalReachedSpy.mockReturnValue(true);
            timeUtils.setTime(now);

            expect(sppStageUtils.getStageStatus(proposal, stages[1])).toBe(
                ProposalStatus.ACTIVE,
            );
        });

        it('returns advanceable for the same open stage with approval reached when it is not an objection stage', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const startDate = DateTime.fromISO(now).minus({ days: 2 });
            const minAdvance = DateTime.fromISO(now).minus({ days: 1 });
            const maxAdvance = DateTime.fromISO(now).plus({ days: 3 });
            const endDate = DateTime.fromISO(now).plus({ days: 10 });

            const stages = [
                generateSppStage({ stageIndex: 0 }),
                generateSppStage({ stageIndex: 1, approvalThreshold: 1 }),
                generateSppStage({ stageIndex: 2 }),
            ];
            const proposal = generateSppProposal({
                hasActions: true,
                stageIndex: 1,
                settings: generateSppPluginSettings({ stages }),
                subProposals: [generateSppSubProposal({ stageIndex: 1 })],
            });

            getStageStartDateSpy.mockReturnValue(startDate);
            getStageEndDateSpy.mockReturnValue(endDate);
            getStageMaxAdvanceSpy.mockReturnValue(maxAdvance);
            getStageMinAdvanceSpy.mockReturnValue(minAdvance);
            isApprovalReachedSpy.mockReturnValue(true);
            timeUtils.setTime(now);

            expect(sppStageUtils.getStageStatus(proposal, stages[1])).toBe(
                ProposalStatus.ADVANCEABLE,
            );
        });

        it('returns advanceable for optimistic stage once voting period is over and not vetoed', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const startDate = DateTime.fromISO(now).minus({ days: 2 });
            const minAdvance = DateTime.fromISO(now).minus({ minutes: 30 });
            const maxAdvance = DateTime.fromISO(now).plus({ days: 1 });
            const endDate = DateTime.fromISO(now).minus({ hours: 1 });

            const stages = [
                generateSppStage({ stageIndex: 0 }),
                generateSppStage({ stageIndex: 1, vetoThreshold: 1 }),
                generateSppStage({ stageIndex: 2 }),
            ];
            const proposal = generateSppProposal({
                hasActions: true,
                stageIndex: 1,
                settings: generateSppPluginSettings({ stages }),
            });

            getStageStartDateSpy.mockReturnValue(startDate);
            getStageEndDateSpy.mockReturnValue(endDate);
            getStageMinAdvanceSpy.mockReturnValue(minAdvance);
            getStageMaxAdvanceSpy.mockReturnValue(maxAdvance);
            isApprovalReachedSpy.mockReturnValue(true);
            isVetoReachedSpy.mockReturnValue(false);
            timeUtils.setTime(now);

            expect(sppStageUtils.getStageStatus(proposal, stages[1])).toBe(
                ProposalStatus.ADVANCEABLE,
            );
        });

        it('returns expired when stage has ended, approval is reached, max advance date has passed and proposal has actions', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const endDate = DateTime.fromISO(now).minus({ days: 3 });
            const maxAdvance = DateTime.fromISO(now).minus({ days: 2 });
            const stage = generateSppStage();
            const proposal = generateSppProposal({ hasActions: true });
            getStageEndDateSpy.mockReturnValue(endDate);
            getStageMaxAdvanceSpy.mockReturnValue(maxAdvance);
            isApprovalReachedSpy.mockReturnValue(true);
            expect(sppStageUtils.getStageStatus(proposal, stage)).toBe(
                ProposalStatus.EXPIRED,
            );
        });

        it('returns accepted instead of expired when the max advance date has passed but the proposal has already been executed', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const endDate = DateTime.fromISO(now).minus({ days: 3 });
            const maxAdvance = DateTime.fromISO(now).minus({ days: 2 });
            const stage = generateSppStage();
            const proposal = generateSppProposal({
                hasActions: true,
                executed: { status: true },
            });
            getStageEndDateSpy.mockReturnValue(endDate);
            getStageMaxAdvanceSpy.mockReturnValue(maxAdvance);
            isApprovalReachedSpy.mockReturnValue(true);
            timeUtils.setTime(now);
            expect(sppStageUtils.getStageStatus(proposal, stage)).toBe(
                ProposalStatus.ACCEPTED,
            );
        });

        it('returns accepted when stage has ended, approval is reached, max advance date has passed and stage has already been advanced', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const endDate = DateTime.fromISO(now).minus({ days: 3 });
            const maxAdvance = DateTime.fromISO(now).minus({ days: 1 });
            const stage = generateSppStage({ stageIndex: 1 });
            const settings = generateSppPluginSettings({ stages: [stage] });
            const proposal = generateSppProposal({ stageIndex: 2, settings });
            getStageEndDateSpy.mockReturnValue(endDate);
            getStageMaxAdvanceSpy.mockReturnValue(maxAdvance);
            isApprovalReachedSpy.mockReturnValue(true);
            timeUtils.setTime(now);
            expect(sppStageUtils.getStageStatus(proposal, stage)).toBe(
                ProposalStatus.ACCEPTED,
            );
        });

        it('returns accepted when stage has ended, approval is reached, max advance date has passed but proposal has no actions and stage is last stage', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const endDate = DateTime.fromISO(now).minus({ days: 3 });
            const maxAdvance = DateTime.fromISO(now).minus({ days: 1 });
            const stage = generateSppStage();
            const settings = generateSppPluginSettings({ stages: [stage] });
            const proposal = generateSppProposal({
                settings,
                hasActions: false,
            });
            getStageEndDateSpy.mockReturnValue(endDate);
            getStageMaxAdvanceSpy.mockReturnValue(maxAdvance);
            isApprovalReachedSpy.mockReturnValue(true);
            timeUtils.setTime(now);
            expect(sppStageUtils.getStageStatus(proposal, stage)).toBe(
                ProposalStatus.ACCEPTED,
            );
        });

        it('returns rejected when stage has ended and approval is not reached', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const endDate = DateTime.fromISO(now).minus({ days: 3 });
            const stage = generateSppStage();
            const proposal = generateSppProposal();
            isApprovalReachedSpy.mockReturnValue(false);
            getStageEndDateSpy.mockReturnValue(endDate);
            timeUtils.setTime(now);
            expect(sppStageUtils.getStageStatus(proposal, stage)).toBe(
                ProposalStatus.REJECTED,
            );
        });

        it('returns accepted for when stage has ended and its a signalling proposal', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const endDate = DateTime.fromISO(now).minus({ hours: 1 });
            const stage = generateSppStage();
            const settings = generateSppPluginSettings({ stages: [stage] });
            const proposal = generateSppProposal({
                settings,
                hasActions: false,
            });
            getStageEndDateSpy.mockReturnValue(endDate);
            isApprovalReachedSpy.mockReturnValue(true);
            timeUtils.setTime(now);
            expect(sppStageUtils.getStageStatus(proposal, stage)).toBe(
                ProposalStatus.ACCEPTED,
            );
        });

        it('returns accepted when the stage has already been advanced and has actions', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const endDate = DateTime.fromISO(now).minus({ days: 1 });
            const stage = generateSppStage({ stageIndex: 0 });
            const proposal = generateSppProposal({
                stageIndex: 1,
                hasActions: true,
            });
            getStageEndDateSpy.mockReturnValue(endDate);
            isApprovalReachedSpy.mockReturnValue(true);
            timeUtils.setTime(now);
            expect(sppStageUtils.getStageStatus(proposal, stage)).toBe(
                ProposalStatus.ACCEPTED,
            );
        });

        // Mixed stages (both approving and vetoing bodies) evaluate approval and
        // veto independently; veto is checked first, so it overrides approval.
        it('returns vetoed for a mixed stage when the veto threshold is met, even if approval is also met', () => {
            const stage = generateSppStage({
                approvalThreshold: 1,
                vetoThreshold: 1,
            });
            const proposal = generateSppProposal();
            isVetoReachedSpy.mockReturnValue(true);
            isApprovalReachedSpy.mockReturnValue(true);
            expect(sppStageUtils.getStageStatus(proposal, stage)).toBe(
                ProposalStatus.VETOED,
            );
        });

        it('stays active for a mixed stage while the window is open and neither threshold is met', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const endDate = DateTime.fromISO(now).plus({ days: 1 });
            const stage = generateSppStage({
                approvalThreshold: 1,
                vetoThreshold: 1,
            });
            const proposal = generateSppProposal({ hasActions: true });
            isVetoReachedSpy.mockReturnValue(false);
            isApprovalReachedSpy.mockReturnValue(false);
            getStageEndDateSpy.mockReturnValue(endDate);
            timeUtils.setTime(now);
            expect(sppStageUtils.getStageStatus(proposal, stage)).toBe(
                ProposalStatus.ACTIVE,
            );
        });
    });

    describe('isVetoBody', () => {
        it('returns true for a body with a veto result type', () => {
            const plugin = generateSppStagePlugin({
                proposalType: SppProposalType.VETO,
            });
            expect(sppStageUtils.isVetoBody(plugin)).toBeTruthy();
        });

        it('returns false for a body with an approval result type', () => {
            const plugin = generateSppStagePlugin({
                proposalType: SppProposalType.APPROVAL,
            });
            expect(sppStageUtils.isVetoBody(plugin)).toBeFalsy();
        });
    });

    describe('isLastStage', () => {
        it('returns true for the last stage of the proposal', () => {
            const stage = generateSppStage({ stageIndex: 2 });
            const proposal = generateSppProposal({
                settings: generateSppPluginSettings({
                    stages: [
                        generateSppStage({ stageIndex: 0 }),
                        generateSppStage({ stageIndex: 1 }),
                        stage,
                    ],
                }),
            });

            expect(sppStageUtils.isLastStage(proposal, stage)).toBeTruthy();
        });

        it('returns false for non-final stages of the proposal', () => {
            const stage = generateSppStage({ stageIndex: 1 });
            const proposal = generateSppProposal({
                settings: generateSppPluginSettings({
                    stages: [
                        generateSppStage({ stageIndex: 0 }),
                        stage,
                        generateSppStage({ stageIndex: 2 }),
                    ],
                }),
            });

            expect(sppStageUtils.isLastStage(proposal, stage)).toBeFalsy();
        });
    });

    describe('isSignalingProposal', () => {
        it('returns true when the proposal has no actions and the stage is the last stage', () => {
            const stage = generateSppStage({ stageIndex: 2 });
            const proposal = generateSppProposal({
                settings: generateSppPluginSettings({
                    stages: [
                        generateSppStage({ stageIndex: 0 }),
                        generateSppStage({ stageIndex: 1 }),
                        stage,
                    ],
                }),
            });

            expect(
                sppStageUtils.isSignalingProposal(proposal, stage),
            ).toBeTruthy();
        });

        it('returns false when the proposal has actions', () => {
            const stage = generateSppStage({ stageIndex: 2 });
            const proposal = generateSppProposal({
                hasActions: true,
                settings: generateSppPluginSettings({
                    stages: [
                        generateSppStage({ stageIndex: 0 }),
                        generateSppStage({ stageIndex: 1 }),
                        stage,
                    ],
                }),
            });

            expect(
                sppStageUtils.isSignalingProposal(proposal, stage),
            ).toBeFalsy();
        });

        it('returns false when the stage is not the last stage', () => {
            const stage = generateSppStage({ stageIndex: 1 });
            const proposal = generateSppProposal({
                settings: generateSppPluginSettings({
                    stages: [
                        generateSppStage({ stageIndex: 0 }),
                        stage,
                        generateSppStage({ stageIndex: 2 }),
                    ],
                }),
            });

            expect(
                sppStageUtils.isSignalingProposal(proposal, stage),
            ).toBeFalsy();
        });

        it('returns false when the proposal has actions and the stage is not the last stage', () => {
            const stage = generateSppStage({ stageIndex: 1 });
            const proposal = generateSppProposal({
                hasActions: true,
                settings: generateSppPluginSettings({
                    stages: [
                        generateSppStage({ stageIndex: 0 }),
                        stage,
                        generateSppStage({ stageIndex: 2 }),
                    ],
                }),
            });

            expect(
                sppStageUtils.isSignalingProposal(proposal, stage),
            ).toBeFalsy();
        });
    });

    describe('canStageAdvance', () => {
        const isApprovalReachedSpy = jest.spyOn(
            sppStageUtils,
            'isApprovalReached',
        );
        const getStageMinAdvanceSpy = jest.spyOn(
            sppStageUtils,
            'getStageMinAdvance',
        );
        const getStageMaxAdvanceSpy = jest.spyOn(
            sppStageUtils,
            'getStageMaxAdvance',
        );
        const isSignalingProposalSpy = jest.spyOn(
            sppStageUtils,
            'isSignalingProposal',
        );

        afterEach(() => {
            isApprovalReachedSpy.mockReset();
            getStageMinAdvanceSpy.mockReset();
            getStageMaxAdvanceSpy.mockReset();
            isSignalingProposalSpy.mockReset();
        });

        it('returns true when all conditions are met', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const minAdvanceDate = DateTime.fromISO(now).minus({ minutes: 5 });
            const maxAdvanceDate = DateTime.fromISO(now).plus({ minutes: 10 });
            const stage = generateSppStage({ stageIndex: 1 });
            const proposal = generateSppProposal({ stageIndex: 1 });

            timeUtils.setTime(now);
            isApprovalReachedSpy.mockReturnValue(true);
            getStageMinAdvanceSpy.mockReturnValue(minAdvanceDate);
            getStageMaxAdvanceSpy.mockReturnValue(maxAdvanceDate);
            isSignalingProposalSpy.mockReturnValue(false);

            expect(sppStageUtils.canStageAdvance(proposal, stage)).toBeTruthy();
        });

        it('returns false when approval is not reached', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const minAdvanceDate = DateTime.fromISO(now).minus({ minutes: 5 });
            const maxAdvanceDate = DateTime.fromISO(now).plus({ minutes: 10 });
            const stage = generateSppStage();
            const proposal = generateSppProposal();

            timeUtils.setTime(now);
            isApprovalReachedSpy.mockReturnValue(false);
            getStageMinAdvanceSpy.mockReturnValue(minAdvanceDate);
            getStageMaxAdvanceSpy.mockReturnValue(maxAdvanceDate);
            isSignalingProposalSpy.mockReturnValue(false);

            expect(sppStageUtils.canStageAdvance(proposal, stage)).toBeFalsy();
        });

        it('returns false when the current time is before minAdvanceDate', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const minAdvanceDate = DateTime.fromISO(now).plus({ minutes: 5 });
            const maxAdvanceDate = DateTime.fromISO(now).plus({ minutes: 10 });
            const stage = generateSppStage();
            const proposal = generateSppProposal();

            timeUtils.setTime(now);
            isApprovalReachedSpy.mockReturnValue(true);
            getStageMinAdvanceSpy.mockReturnValue(minAdvanceDate);
            getStageMaxAdvanceSpy.mockReturnValue(maxAdvanceDate);
            isSignalingProposalSpy.mockReturnValue(false);

            expect(sppStageUtils.canStageAdvance(proposal, stage)).toBeFalsy();
        });

        it('returns false when the current time is after maxAdvanceDate', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const minAdvanceDate = DateTime.fromISO(now).minus({ minutes: 5 });
            const maxAdvanceDate = DateTime.fromISO(now).minus({ minutes: 1 });
            const stage = generateSppStage();
            const proposal = generateSppProposal();

            timeUtils.setTime(now);
            isApprovalReachedSpy.mockReturnValue(true);
            getStageMinAdvanceSpy.mockReturnValue(minAdvanceDate);
            getStageMaxAdvanceSpy.mockReturnValue(maxAdvanceDate);
            isSignalingProposalSpy.mockReturnValue(false);

            expect(sppStageUtils.canStageAdvance(proposal, stage)).toBeFalsy();
        });

        it('returns false when the proposal is a signaling proposal', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const minAdvanceDate = DateTime.fromISO(now).minus({ minutes: 5 });
            const maxAdvanceDate = DateTime.fromISO(now).plus({ minutes: 10 });
            const stage = generateSppStage();
            const proposal = generateSppProposal();

            timeUtils.setTime(now);
            isApprovalReachedSpy.mockReturnValue(true);
            getStageMinAdvanceSpy.mockReturnValue(minAdvanceDate);
            getStageMaxAdvanceSpy.mockReturnValue(maxAdvanceDate);
            isSignalingProposalSpy.mockReturnValue(true);

            expect(sppStageUtils.canStageAdvance(proposal, stage)).toBeFalsy();
        });

        it('returns false when stage is not the current active proposal stage', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const minAdvanceDate = DateTime.fromISO(now).minus({ minutes: 5 });
            const maxAdvanceDate = DateTime.fromISO(now).plus({ minutes: 10 });
            const stage = generateSppStage({ stageIndex: 0 });
            const proposal = generateSppProposal({
                hasActions: true,
                stageIndex: 1,
            });

            timeUtils.setTime(now);
            isApprovalReachedSpy.mockReturnValue(true);
            getStageMinAdvanceSpy.mockReturnValue(minAdvanceDate);
            getStageMaxAdvanceSpy.mockReturnValue(maxAdvanceDate);
            isSignalingProposalSpy.mockReturnValue(false);

            expect(sppStageUtils.canStageAdvance(proposal, stage)).toBeFalsy();
        });
    });

    describe('canBodyVote', () => {
        const getStageStatusSpy = jest.spyOn(sppStageUtils, 'getStageStatus');
        const getStageEndDateSpy = jest.spyOn(sppStageUtils, 'getStageEndDate');

        afterEach(() => {
            getStageStatusSpy.mockReset();
            getStageEndDateSpy.mockReset();
        });

        afterAll(() => {
            getStageStatusSpy.mockRestore();
            getStageEndDateSpy.mockRestore();
        });

        it('allows any body to vote while the stage is active', () => {
            getStageStatusSpy.mockReturnValue(ProposalStatus.ACTIVE);
            const stage = generateSppStage();
            const proposal = generateSppProposal();
            const approveBody = generateSppStagePlugin({
                proposalType: SppProposalType.APPROVAL,
            });
            const vetoBody = generateSppStagePlugin({
                proposalType: SppProposalType.VETO,
            });

            expect(
                sppStageUtils.canBodyVote(proposal, stage, approveBody),
            ).toBeTruthy();
            expect(
                sppStageUtils.canBodyVote(proposal, stage, vetoBody),
            ).toBeTruthy();
        });

        it('lets a vetoing body veto while the stage is advanceable and the voting window is still open', () => {
            const now = '2023-01-01T12:00:00.000Z';
            getStageStatusSpy.mockReturnValue(ProposalStatus.ADVANCEABLE);
            getStageEndDateSpy.mockReturnValue(
                DateTime.fromISO(now).plus({ days: 1 }),
            );
            timeUtils.setTime(now);
            const stage = generateSppStage({ stageIndex: 0 });
            const proposal = generateSppProposal({ stageIndex: 0 });
            const vetoBody = generateSppStagePlugin({
                proposalType: SppProposalType.VETO,
            });

            expect(
                sppStageUtils.canBodyVote(proposal, stage, vetoBody),
            ).toBeTruthy();
        });

        it('lets a vetoing body veto on the last stage (accepted) while the window is still open', () => {
            const now = '2023-01-01T12:00:00.000Z';
            getStageStatusSpy.mockReturnValue(ProposalStatus.ACCEPTED);
            getStageEndDateSpy.mockReturnValue(
                DateTime.fromISO(now).plus({ days: 1 }),
            );
            timeUtils.setTime(now);
            const stage = generateSppStage({ stageIndex: 1 });
            const proposal = generateSppProposal({ stageIndex: 1 });
            const vetoBody = generateSppStagePlugin({
                proposalType: SppProposalType.VETO,
            });

            expect(
                sppStageUtils.canBodyVote(proposal, stage, vetoBody),
            ).toBeTruthy();
        });

        it('stops a vetoing body once the voting window has closed', () => {
            const now = '2023-01-01T12:00:00.000Z';
            getStageStatusSpy.mockReturnValue(ProposalStatus.ADVANCEABLE);
            getStageEndDateSpy.mockReturnValue(
                DateTime.fromISO(now).minus({ minutes: 1 }),
            );
            timeUtils.setTime(now);
            const stage = generateSppStage({ stageIndex: 0 });
            const proposal = generateSppProposal({ stageIndex: 0 });
            const vetoBody = generateSppStagePlugin({
                proposalType: SppProposalType.VETO,
            });

            expect(
                sppStageUtils.canBodyVote(proposal, stage, vetoBody),
            ).toBeFalsy();
        });

        it('does not let a vetoing body veto a stage that is no longer the active one', () => {
            const now = '2023-01-01T12:00:00.000Z';
            getStageStatusSpy.mockReturnValue(ProposalStatus.ACCEPTED);
            getStageEndDateSpy.mockReturnValue(
                DateTime.fromISO(now).plus({ days: 1 }),
            );
            timeUtils.setTime(now);
            const stage = generateSppStage({ stageIndex: 0 });
            const proposal = generateSppProposal({ stageIndex: 1 });
            const vetoBody = generateSppStagePlugin({
                proposalType: SppProposalType.VETO,
            });

            expect(
                sppStageUtils.canBodyVote(proposal, stage, vetoBody),
            ).toBeFalsy();
        });

        it('does not let an approving body vote once the stage is advanceable', () => {
            getStageStatusSpy.mockReturnValue(ProposalStatus.ADVANCEABLE);
            const stage = generateSppStage();
            const proposal = generateSppProposal();
            const approveBody = generateSppStagePlugin({
                proposalType: SppProposalType.APPROVAL,
            });

            expect(
                sppStageUtils.canBodyVote(proposal, stage, approveBody),
            ).toBeFalsy();
        });

        it('does not allow a vetoing body to veto for a non-votable stage status', () => {
            getStageStatusSpy.mockReturnValue(ProposalStatus.REJECTED);
            const stage = generateSppStage({ stageIndex: 0 });
            const proposal = generateSppProposal({ stageIndex: 0 });
            const vetoBody = generateSppStagePlugin({
                proposalType: SppProposalType.VETO,
            });

            expect(
                sppStageUtils.canBodyVote(proposal, stage, vetoBody),
            ).toBeFalsy();
        });
    });

    describe('isVetoWindowOpen', () => {
        // The spy is re-created per test: earlier describes restore the shared
        // method in their afterAll, which would orphan a collection-time spy.
        let getStageEndDateSpy: jest.SpyInstance;

        beforeEach(() => {
            getStageEndDateSpy = jest.spyOn(sppStageUtils, 'getStageEndDate');
        });

        afterEach(() => {
            getStageEndDateSpy.mockRestore();
        });

        it('returns true when the veto requirement is unmet and the current stage window is open', () => {
            const now = '2023-01-01T12:00:00.000Z';
            getStageEndDateSpy.mockReturnValue(
                DateTime.fromISO(now).plus({ days: 1 }),
            );
            timeUtils.setTime(now);
            const stage = generateSppStage({ stageIndex: 0, vetoThreshold: 1 });
            const proposal = generateSppProposal({ stageIndex: 0 });

            expect(
                sppStageUtils.isVetoWindowOpen(proposal, stage),
            ).toBeTruthy();
        });

        it('returns false when the stage has no veto requirement', () => {
            const now = '2023-01-01T12:00:00.000Z';
            getStageEndDateSpy.mockReturnValue(
                DateTime.fromISO(now).plus({ days: 1 }),
            );
            timeUtils.setTime(now);
            const stage = generateSppStage({ stageIndex: 0, vetoThreshold: 0 });
            const proposal = generateSppProposal({ stageIndex: 0 });

            expect(sppStageUtils.isVetoWindowOpen(proposal, stage)).toBeFalsy();
        });

        it('returns false once the veto threshold has been reached', () => {
            const now = '2023-01-01T12:00:00.000Z';
            getStageEndDateSpy.mockReturnValue(
                DateTime.fromISO(now).plus({ days: 1 }),
            );
            timeUtils.setTime(now);
            const isVetoReachedSpy = jest
                .spyOn(sppStageUtils, 'isVetoReached')
                .mockReturnValue(true);
            const stage = generateSppStage({ stageIndex: 0, vetoThreshold: 1 });
            const proposal = generateSppProposal({ stageIndex: 0 });

            expect(sppStageUtils.isVetoWindowOpen(proposal, stage)).toBeFalsy();
            isVetoReachedSpy.mockRestore();
        });

        it('returns false once the voting window has closed', () => {
            const now = '2023-01-01T12:00:00.000Z';
            getStageEndDateSpy.mockReturnValue(
                DateTime.fromISO(now).minus({ minutes: 1 }),
            );
            timeUtils.setTime(now);
            const stage = generateSppStage({ stageIndex: 0, vetoThreshold: 1 });
            const proposal = generateSppProposal({ stageIndex: 0 });

            expect(sppStageUtils.isVetoWindowOpen(proposal, stage)).toBeFalsy();
        });

        it('returns false when the stage is not the current one', () => {
            const now = '2023-01-01T12:00:00.000Z';
            getStageEndDateSpy.mockReturnValue(
                DateTime.fromISO(now).plus({ days: 1 }),
            );
            timeUtils.setTime(now);
            const stage = generateSppStage({ stageIndex: 0, vetoThreshold: 1 });
            const proposal = generateSppProposal({ stageIndex: 1 });

            expect(sppStageUtils.isVetoWindowOpen(proposal, stage)).toBeFalsy();
        });
    });

    describe('getBodySubProposal', () => {
        it('returns the sub-proposal for the given body address and stage index', () => {
            const bodyAddress = '0x1234567890abcdef1234567890abcdef12345678';
            const stage = 1;
            const subProposal = generateSppSubProposal({
                pluginAddress: bodyAddress,
                stageIndex: stage,
            });
            const proposal = generateSppProposal({
                subProposals: [subProposal],
            });
            const externalBodySubProposal = sppStageUtils.getBodySubProposal(
                proposal,
                bodyAddress,
                stage,
            );
            expect(externalBodySubProposal).toEqual(subProposal);
        });

        it('returns undefined when SPP proposal has no sub-proposals for the given body address and stage index', () => {
            const bodyAddress = '0x1234567890abcdef1234567890abcdef12345678';
            const stage = 1;
            const subProposal = generateSppSubProposal({
                pluginAddress: bodyAddress,
                stageIndex: 2,
            });
            const proposal = generateSppProposal({
                subProposals: [subProposal],
            });
            expect(
                sppStageUtils.getBodySubProposal(proposal, bodyAddress, stage),
            ).toBeUndefined();
        });
    });

    describe('isObjectionStage', () => {
        it('returns true when the stage sub-proposal has the isObjection settings flag', () => {
            const stage = generateSppStage({ stageIndex: 1 });
            const subProposal = generateSppSubProposal({ stageIndex: 1 });
            subProposal.settings = {
                ...subProposal.settings,
                isObjection: true,
            };
            const proposal = generateSppProposal({
                settings: generateSppPluginSettings({ stages: [stage] }),
                subProposals: [subProposal],
            });
            expect(
                sppStageUtils.isObjectionStage(proposal, stage),
            ).toBeTruthy();
        });

        it('returns false when neither sub-proposals nor stage plugins are objection bodies', () => {
            const stage = generateSppStage({ stageIndex: 1 });
            const proposal = generateSppProposal({
                settings: generateSppPluginSettings({ stages: [stage] }),
                subProposals: [generateSppSubProposal({ stageIndex: 1 })],
            });
            expect(sppStageUtils.isObjectionStage(proposal, stage)).toBeFalsy();
        });
    });

    describe('getBodyResult', () => {
        it('returns the result for the given address and stage index if present', () => {
            const externalAddress =
                '0x1234567890abcdef1234567890abcdef12345678';
            const stage = 1;
            const result = {
                pluginAddress: externalAddress,
                stage,
                resultType: SppProposalType.APPROVAL,
            };
            const proposal = generateSppProposal({ results: [result] });
            const externalBodyResult = sppStageUtils.getBodyResult(
                proposal,
                externalAddress,
                stage,
            );
            expect(externalBodyResult).toEqual(result);
        });

        it('returns undefined if the result for the correct external address but on a different stage index', () => {
            const externalAddress =
                '0x1234567890abcdef1234567890abcdef12345678';
            const stage = 1;
            const proposal = generateSppProposal({
                results: [
                    {
                        pluginAddress: externalAddress,
                        stage: 2,
                        resultType: SppProposalType.APPROVAL,
                    },
                ],
            });

            const externalBodyResult = sppStageUtils.getBodyResult(
                proposal,
                externalAddress,
                stage,
            );
            expect(externalBodyResult).toBeUndefined();
        });

        it('returns undefined if the result is undefined', () => {
            const externalAddress =
                '0x1234567890abcdef1234567890abcdef12345678';
            const stage = 1;
            const proposal = generateSppProposal();

            const externalBodyResult = sppStageUtils.getBodyResult(
                proposal,
                externalAddress,
                stage,
            );
            expect(externalBodyResult).toBeUndefined();
        });
    });
});

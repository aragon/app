import { generateDaoPlugin } from '@/shared/testUtils';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { timeUtils } from '@/test/utils';
import { DateTime } from 'luxon';
import type { TransactionReceipt } from 'viem';
import { ProposalActionType } from '../../api/governanceService';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import {
    generateCreateProposalFormData,
    generateProposalActionChangeMembers,
    generateProposalActionUpdateMetadata,
    generateProposalActionWithdrawToken,
} from '../../testUtils';
import { publishProposalDialogUtils } from './publishProposalDialogUtils';

describe('publishProposalDialog utils', () => {
    const getSlotFunctionSpy = jest.spyOn(pluginRegistryUtils, 'getSlotFunction');

    afterEach(() => {
        getSlotFunctionSpy.mockReset();
    });

    describe('prepareMetadata', () => {
        it('correctly map form values to metadata object', () => {
            const formValues = generateCreateProposalFormData({
                title: 'Title',
                summary: 'Short summary',
                body: '<p>Proposal body</p>',
                resources: [{ name: 'Name', url: 'https://aragon.org' }],
            });

            expect(publishProposalDialogUtils.prepareMetadata(formValues)).toEqual({
                title: formValues.title,
                summary: formValues.summary,
                description: formValues.body,
                resources: formValues.resources,
            });
        });
    });

    describe('buildTransaction', () => {
        it('calls the plugin-specific function to prepare the transaction data and resolves with a transaction object', () => {
            const transactionData = '0xfbd56e4100000000000000000000000000000000000000000000000000000000000000e';
            const slotFunction = jest.fn(() => transactionData);
            getSlotFunctionSpy.mockReturnValue(slotFunction);

            const actionBaseValues = { data: '0x123456', to: '0x000', value: '0' };
            const values = generateCreateProposalFormData({
                actions: [{ ...generateProposalActionUpdateMetadata(actionBaseValues), index: 0 }],
                startTimeMode: 'now',
                endTimeMode: 'fixed',
                endTimeFixed: { date: '2020-10-10', time: '10:10' },
            });
            const metadataCid = 'test-cid';
            const plugin = generateDaoPlugin({
                address: '0x30FF8f1Ecd022aBD2d3A79AF44fD069A7bB3EFD3',
                subdomain: 'multisig',
            });

            const transaction = publishProposalDialogUtils.buildTransaction({ values, metadataCid, plugin });

            expect(getSlotFunctionSpy).toHaveBeenCalledWith({
                pluginId: plugin.subdomain,
                slotId: GovernanceSlotId.GOVERNANCE_BUILD_CREATE_PROPOSAL_DATA,
            });
            expect(slotFunction).toHaveBeenCalledWith({
                actions: [actionBaseValues],
                startDate: 0,
                metadata: '0x697066733a2f2f746573742d636964',
                endDate: 1602324600,
            });

            expect(transaction.data).toEqual(transactionData);
            expect(transaction.to).toEqual(plugin.address);
        });
    });

    describe('getProposalId', () => {
        it('parses the transaction receipt to return the proposal id as string', () => {
            const logTopics = [
                '0xa6c1f8f4276dc3f243459e13b557c84e8f4e90b2e09070bad5f6909cee687c92',
                '0x0000000000000000000000000000000000000000000000000000000000000002', // ProposalId
                '0x00000000000000000000000017366cae2b9c6c3055e9e3c78936a69006be5409',
            ];
            const transactionReceipt = { logs: [{ topics: logTopics }] } as TransactionReceipt;
            expect(publishProposalDialogUtils.getProposalId(transactionReceipt)).toEqual('2');
        });
    });

    describe('prepareActions', () => {
        it('calls the prepareAction function related to the action when set', async () => {
            const updateMetadataAction = generateProposalActionUpdateMetadata({ data: 'default-data' });
            const updateMetadataActionData = 'data-with-ipfs-cid';
            const transferAction = generateProposalActionWithdrawToken({ data: '0x123' });
            const transferActionData = 'transfer-async-data';
            const actions = [
                { ...updateMetadataAction, index: 0 },
                { ...transferAction, index: 1 },
            ];
            const prepareActions = {
                [ProposalActionType.METADATA_UPDATE]: () => Promise.resolve(updateMetadataActionData),
                [ProposalActionType.TRANSFER]: () => Promise.resolve(transferActionData),
            };

            const result = await publishProposalDialogUtils.prepareActions({ actions, prepareActions });

            expect(result).toEqual([
                { ...updateMetadataAction, data: updateMetadataActionData, index: 0 },
                { ...transferAction, data: transferActionData, index: 1 },
            ]);
        });

        it('defaults to the action data when no prepare function is found for the aciton', async () => {
            const transferAction = generateProposalActionWithdrawToken({ data: '0x123' });
            const updateAction = generateProposalActionUpdateMetadata({ data: '0x456' });
            const actions = [
                { ...transferAction, index: 0 },
                { ...updateAction, index: 1 },
            ];

            const result = await publishProposalDialogUtils.prepareActions({ actions });
            expect(result).toEqual(actions);
        });
    });

    describe('parseStartDate', () => {
        it('throws error when startTimeMode is set to fixed but startTimeFixed is undefined', () => {
            const formValues = generateCreateProposalFormData({ startTimeMode: 'fixed', startTimeFixed: undefined });
            expect(() => publishProposalDialogUtils['parseStartDate'](formValues)).toThrow();
        });

        it('returns 0 when startTimeMode is set to now', () => {
            const formValues = generateCreateProposalFormData({ startTimeMode: 'now' });
            expect(publishProposalDialogUtils['parseStartDate'](formValues)).toEqual(0);
        });

        it('returns the parsed fixed start date in seconds as an integer', () => {
            const startTimeFixed = { date: '2024-08-30', time: '10:24' };
            const formValues = generateCreateProposalFormData({ startTimeMode: 'fixed', startTimeFixed });
            expect(publishProposalDialogUtils['parseStartDate'](formValues)).toEqual(1725013440);
        });
    });

    describe('parseEndDate', () => {
        it('throws error when endTimeMode is set to duration and endTimeDuration is undefined', () => {
            const formValues = generateCreateProposalFormData({ endTimeMode: 'duration', endTimeDuration: undefined });
            expect(() => publishProposalDialogUtils['parseEndDate'](formValues)).toThrow();
        });

        it('throws error when endTimeMode is set to fixed and endTimeFixed is undefined', () => {
            const formValues = generateCreateProposalFormData({ endTimeMode: 'fixed', endTimeFixed: undefined });
            expect(() => publishProposalDialogUtils['parseEndDate'](formValues)).toThrow();
        });

        it('returns the parsed fixed end date in seconds as an integer', () => {
            const endTimeFixed = { date: '2021-01-22', time: '11:00' };
            const formValues = generateCreateProposalFormData({ endTimeMode: 'fixed', endTimeFixed });
            expect(publishProposalDialogUtils['parseEndDate'](formValues)).toEqual(1611313200);
        });

        it('returns 0 when endTimeMode is duration and minimumDuration equals endTimeDuration', () => {
            const endTimeMode = 'duration';
            const minimumDuration = { days: 3, hours: 0, minutes: 0 };
            const endTimeDuration = minimumDuration;
            const formValues = generateCreateProposalFormData({
                minimumDuration,
                endTimeMode,
                endTimeDuration,
            });
            expect(publishProposalDialogUtils['parseEndDate'](formValues)).toEqual(0);
        });

        it('returns the parsed end date in seconds as an integer by adding the defined duration to the current time', () => {
            timeUtils.setTime('2020-12-20T15:30:00');
            const startTimeMode = 'now';
            const endTimeMode = 'duration';
            const endTimeDuration = { days: 3, hours: 0, minutes: 30 };
            const formValues = generateCreateProposalFormData({ startTimeMode, endTimeMode, endTimeDuration });
            const expectedValue = 1608739200;
            expect(publishProposalDialogUtils['parseEndDate'](formValues)).toEqual(expectedValue);
        });

        it('returns the parsed end date in seconds as an integer by adding the defined duration to the fixed start time', () => {
            const startTimeMode = 'fixed';
            const startTimeFixed = { date: '2023-08-30', time: '11:31' };
            const endTimeMode = 'duration';
            const endTimeDuration = { days: 5, hours: 0, minutes: 0 };
            const formValues = generateCreateProposalFormData({
                startTimeMode,
                startTimeFixed,
                endTimeMode,
                endTimeDuration,
            });
            const expectedValue = 1693827060;
            expect(publishProposalDialogUtils['parseEndDate'](formValues)).toEqual(expectedValue);
        });

        it('returns the parsed end date in seconds as an integer by adding the defined duration to the fixed startTime', () => {
            const startTimeMode = 'fixed';
            const startTimeFixed = { date: '2023-10-11', time: '22:22' };
            const endTimeMode = 'duration';
            const endTimeDuration = { days: 5, hours: 3, minutes: 20 };
            const formValues = generateCreateProposalFormData({
                startTimeMode,
                startTimeFixed,
                endTimeMode,
                endTimeDuration,
            });
            const expectedValue = 1697506920; // value * 1000 in epoch is Tuesday, October 17, 2023 1:42:00 AM
            expect(publishProposalDialogUtils['parseEndDate'](formValues)).toEqual(expectedValue);
        });
    });

    describe('dateToSeconds', () => {
        it('parses the given DateTime object to an integer number representing its seconds', () => {
            const date = DateTime.fromISO('2016-05-25T09:08:34.123');
            expect(publishProposalDialogUtils['dateToSeconds'](date)).toEqual(1464167314);
        });
    });

    describe('formToProposalActions', () => {
        it('correctly maps the form actions to the ones needed for the transaction', () => {
            const actionsBaseData = [
                { to: '0x123', value: '10', data: '0x1234' },
                { to: '0x456', value: '0', data: '0x' },
            ];
            const actions = [
                generateProposalActionChangeMembers(actionsBaseData[0]),
                generateProposalActionUpdateMetadata(actionsBaseData[1]),
            ];
            expect(publishProposalDialogUtils['formToProposalActions'](actions)).toEqual(actionsBaseData);
        });
    });

    describe('compareTimeDuration', () => {
        it('returns true when time durations are equal', () => {
            const first = { days: 4, hours: 0, minutes: 2 };
            const second = { days: 4, hours: 0, minutes: 2 };
            expect(publishProposalDialogUtils['compareTimeDuration'](first, second)).toBeTruthy();
        });

        it('returns false when time durations are not equal', () => {
            const compare = publishProposalDialogUtils['compareTimeDuration'];
            expect(compare({ days: 1, hours: 10, minutes: 3 }, { days: 1, hours: 10, minutes: 2 })).toBeFalsy();
            expect(compare({ days: 1, hours: 10, minutes: 3 }, { days: 1, hours: 0, minutes: 3 })).toBeFalsy();
            expect(compare({ days: 1, hours: 10, minutes: 3 }, { days: 10, hours: 10, minutes: 3 })).toBeFalsy();
            expect(compare({ days: 1, hours: 10, minutes: 3 }, undefined)).toBeFalsy();
            expect(compare(undefined, { days: 1, hours: 10, minutes: 3 })).toBeFalsy();
        });
    });
});

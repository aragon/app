import { timeUtils } from '@/test/utils';
import { DateTime } from 'luxon';
import {
    generateCreateProposalEndDateFormData,
    generateCreateProposalFormData,
    generateCreateProposalStartDateFormData,
} from '../../testUtils';
import { createProposalUtils } from './createProposalUtils';
import type { ICreateProposalEndDateForm } from './createProposalUtils.api';

describe('createProposal utils', () => {
    describe('parseStartDate', () => {
        it('throws error when startTimeMode is set to fixed but startTimeFixed is undefined', () => {
            const formValues = generateCreateProposalStartDateFormData({
                startTimeMode: 'fixed',
                startTimeFixed: undefined,
            });
            expect(() => createProposalUtils.parseStartDate(formValues)).toThrow();
        });

        it('returns 0 when startTimeMode is set to now', () => {
            const formValues = generateCreateProposalStartDateFormData({ startTimeMode: 'now' });
            expect(createProposalUtils.parseStartDate(formValues)).toEqual(0);
        });

        it('returns 0 when startTimeMode is not set', () => {
            const formValues = generateCreateProposalStartDateFormData({ startTimeMode: undefined });
            expect(createProposalUtils.parseStartDate(formValues)).toEqual(0);
        });

        it('returns the parsed fixed start date in seconds as an integer', () => {
            const startTimeFixed = { date: '2024-08-30', time: '10:24' };
            const formValues = generateCreateProposalStartDateFormData({ startTimeMode: 'fixed', startTimeFixed });
            expect(createProposalUtils.parseStartDate(formValues)).toEqual(1725013440);
        });
    });

    describe('parseEndDate', () => {
        it('throws error when endTimeMode is set to duration and endTimeDuration is undefined', () => {
            const formValues = generateCreateProposalEndDateFormData({
                endTimeMode: 'duration',
                endTimeDuration: undefined,
            });
            expect(() => createProposalUtils.parseEndDate(formValues)).toThrow();
        });

        it('throws error when endTimeMode is set to fixed and endTimeFixed is undefined', () => {
            const formValues = generateCreateProposalEndDateFormData({ endTimeMode: 'fixed', endTimeFixed: undefined });
            expect(() => createProposalUtils.parseEndDate(formValues)).toThrow();
        });

        it('returns the parsed fixed end date in seconds as an integer', () => {
            const endTimeFixed = { date: '2021-01-22', time: '11:00' };
            const formValues = generateCreateProposalEndDateFormData({ endTimeMode: 'fixed', endTimeFixed });
            expect(createProposalUtils.parseEndDate(formValues)).toEqual(1611313200);
        });

        it('returns 0 when endTimeMode is duration and minimumDuration equals endTimeDuration', () => {
            const endTimeMode = 'duration';
            const minimumDuration = { days: 3, hours: 0, minutes: 0 };
            const endTimeDuration = minimumDuration;
            const formValues = generateCreateProposalEndDateFormData({
                minimumDuration,
                endTimeMode,
                endTimeDuration,
            });
            expect(createProposalUtils.parseEndDate(formValues)).toEqual(0);
        });

        it('returns 0 when endTimeMode is not set', () => {
            const formValues = generateCreateProposalEndDateFormData({ endTimeMode: undefined });
            expect(createProposalUtils.parseEndDate(formValues)).toEqual(0);
        });

        it('returns the parsed end date in seconds as an integer by adding the defined duration to the current time', () => {
            timeUtils.setTime('2020-12-20T15:30:00');
            const startTimeMode = 'now';
            const endTimeMode = 'duration';
            const endTimeDuration = { days: 3, hours: 0, minutes: 30 };
            const formValues = generateCreateProposalEndDateFormData({ startTimeMode, endTimeMode, endTimeDuration });
            const expectedValue = 1608739200;
            expect(createProposalUtils.parseEndDate(formValues)).toEqual(expectedValue);
        });

        it('returns the parsed end date in seconds as an integer by adding the defined duration to the fixed start time', () => {
            const startTimeMode = 'fixed';
            const startTimeFixed = { date: '2023-08-30', time: '11:31' };
            const endTimeMode = 'duration';
            const endTimeDuration = { days: 5, hours: 0, minutes: 0 };
            const formValues = generateCreateProposalEndDateFormData({
                startTimeMode,
                startTimeFixed,
                endTimeMode,
                endTimeDuration,
            });
            const expectedValue = 1693827060;
            expect(createProposalUtils.parseEndDate(formValues)).toEqual(expectedValue);
        });

        it('returns the parsed end date in seconds as an integer by adding the defined duration to the fixed startTime', () => {
            const startTimeMode = 'fixed';
            const startTimeFixed = { date: '2023-10-11', time: '22:22' };
            const endTimeMode = 'duration';
            const endTimeDuration = { days: 5, hours: 3, minutes: 20 };
            const formValues = generateCreateProposalEndDateFormData({
                startTimeMode,
                startTimeFixed,
                endTimeMode,
                endTimeDuration,
            });
            const expectedValue = 1697506920; // value * 1000 in epoch is Tuesday, October 17, 2023 1:42:00 AM
            expect(createProposalUtils.parseEndDate(formValues)).toEqual(expectedValue);
        });
    });

    describe('dateToSeconds', () => {
        it('parses the given DateTime object to an integer number representing its seconds', () => {
            const date = DateTime.fromISO('2016-05-25T09:08:34.123');
            expect(createProposalUtils['dateToSeconds'](date)).toEqual(1464167314);
        });
    });

    describe('isTimingDataSet', () => {
        it('returns false if no timing data param has been set', () => {
            const proposalWithoutTiming = generateCreateProposalFormData() as ICreateProposalEndDateForm;
            expect(createProposalUtils.isTimingDataSet(proposalWithoutTiming)).toEqual(false);
        });

        it('returns true if only start time data has been set', () => {
            const proposalWithStartTime = generateCreateProposalStartDateFormData();
            expect(createProposalUtils.isTimingDataSet(proposalWithStartTime)).toEqual(true);
        });

        it('returns true if start and end time data have been set', () => {
            const proposalWithTiming = generateCreateProposalEndDateFormData();
            expect(createProposalUtils.isTimingDataSet(proposalWithTiming)).toEqual(true);
        });
    });

    describe('createDefaultEndDate', () => {
        it('returns zero 0 if minDuration is more than 7 days', () => {
            const minDuration = 8 * 24 * 60 * 60;

            expect(createProposalUtils.createDefaultEndDate(minDuration)).toEqual(0);
        });

        it('returns 7 days from now in seconds if minDuration is less the 7 days', () => {
            const minDuration = 6 * 24 * 60 * 60;
            const expectedTime = Date.now() / 1000 + 7 * 24 * 60 * 60;

            expect(createProposalUtils.createDefaultEndDate(minDuration)).toBeCloseTo(expectedTime, -1);
        });
    });
});

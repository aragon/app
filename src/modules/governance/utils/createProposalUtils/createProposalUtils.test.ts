import { timeUtils } from '@/test/utils';
import { DateTime } from 'luxon';
import { generateCreateProposalEndDateFormData, generateCreateProposalStartDateFormData } from '../../testUtils';
import { createProposalUtils } from './createProposalUtils';

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

    describe('compareTimeDuration', () => {
        it('returns true when time durations are equal', () => {
            const first = { days: 4, hours: 0, minutes: 2 };
            const second = { days: 4, hours: 0, minutes: 2 };
            expect(createProposalUtils['compareTimeDuration'](first, second)).toBeTruthy();
        });

        it('returns false when time durations are not equal', () => {
            const compare = createProposalUtils['compareTimeDuration'];
            expect(compare({ days: 1, hours: 10, minutes: 3 }, { days: 1, hours: 10, minutes: 2 })).toBeFalsy();
            expect(compare({ days: 1, hours: 10, minutes: 3 }, { days: 1, hours: 0, minutes: 3 })).toBeFalsy();
            expect(compare({ days: 1, hours: 10, minutes: 3 }, { days: 10, hours: 10, minutes: 3 })).toBeFalsy();
            expect(compare({ days: 1, hours: 10, minutes: 3 }, undefined)).toBeFalsy();
            expect(compare(undefined, { days: 1, hours: 10, minutes: 3 })).toBeFalsy();
        });
    });
});

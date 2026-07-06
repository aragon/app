import { DateTime, Settings } from 'luxon';
import type { ICapitalDistributorCreateCampaignFormData } from '../components/capitalDistributorCreateCampaignActionCreate';
import { CampaignScheduleType } from '../components/capitalDistributorCreateCampaignActionCreate';
import { capitalDistributorCampaignScheduleUtils } from './capitalDistributorCampaignScheduleUtils';

describe('capitalDistributorCampaignScheduleUtils', () => {
    const baseFormData: ICapitalDistributorCreateCampaignFormData = {
        asset: {} as ICapitalDistributorCreateCampaignFormData['asset'],
        title: 'Test Campaign',
        resources: [],
        merkleTreeInfo: {
            merkleRoot: '0x123',
            totalMembers: 10,
            fileName: 'test.json',
        },
    };

    describe('parseScheduleSettings', () => {
        it('returns zero timestamps when scheduleType is undefined', () => {
            const result =
                capitalDistributorCampaignScheduleUtils.parseScheduleSettings(
                    baseFormData,
                );

            expect(result).toEqual({
                startTime: BigInt(0),
                endTime: BigInt(0),
            });
        });

        it('returns zero timestamps when scheduleType is open-ended', () => {
            const result =
                capitalDistributorCampaignScheduleUtils.parseScheduleSettings({
                    ...baseFormData,
                    scheduleType: CampaignScheduleType.OPEN_ENDED,
                });

            expect(result).toEqual({
                startTime: BigInt(0),
                endTime: BigInt(0),
            });
        });

        it('returns zero start time when scheduled with start time mode "now"', () => {
            const result =
                capitalDistributorCampaignScheduleUtils.parseScheduleSettings({
                    ...baseFormData,
                    scheduleType: CampaignScheduleType.SCHEDULED,
                    startTimeMode: 'now',
                });

            expect(result.startTime).toBe(BigInt(0));
        });

        it('parses fixed start time into seconds', () => {
            const result =
                capitalDistributorCampaignScheduleUtils.parseScheduleSettings({
                    ...baseFormData,
                    scheduleType: CampaignScheduleType.SCHEDULED,
                    startTimeMode: 'fixed',
                    startTimeFixed: { date: '2026-03-01', time: '12:00' },
                });

            const expected = DateTime.fromISO('2026-03-01')
                .set({ hour: 12, minute: 0 })
                .toSeconds();

            expect(result.startTime).toBe(BigInt(Math.round(expected)));
        });

        it('parses fixed end time into seconds', () => {
            const result =
                capitalDistributorCampaignScheduleUtils.parseScheduleSettings({
                    ...baseFormData,
                    scheduleType: CampaignScheduleType.SCHEDULED,
                    startTimeMode: 'now',
                    endTimeMode: 'fixed',
                    endTimeFixed: { date: '2026-06-01', time: '18:30' },
                });

            const expected = DateTime.fromISO('2026-06-01')
                .set({ hour: 18, minute: 30 })
                .toSeconds();

            expect(result.endTime).toBe(BigInt(Math.round(expected)));
        });

        it('calculates end time from duration relative to fixed start time', () => {
            const result =
                capitalDistributorCampaignScheduleUtils.parseScheduleSettings({
                    ...baseFormData,
                    scheduleType: CampaignScheduleType.SCHEDULED,
                    startTimeMode: 'fixed',
                    startTimeFixed: { date: '2026-03-01', time: '12:00' },
                    endTimeMode: 'duration',
                    endTimeDuration: { days: 5, hours: 2, minutes: 30 },
                });

            const startDate = DateTime.fromISO('2026-03-01').set({
                hour: 12,
                minute: 0,
            });
            const expectedEnd = startDate.plus({
                days: 5,
                hours: 2,
                minutes: 30,
            });

            expect(result.endTime).toBe(
                BigInt(Math.round(expectedEnd.toSeconds())),
            );
        });

        it('calculates end time from duration relative to now when start time is "now"', () => {
            const fakeNow = DateTime.fromISO('2026-02-13T10:00:00.000');
            Settings.now = () => fakeNow.toMillis();

            try {
                const result =
                    capitalDistributorCampaignScheduleUtils.parseScheduleSettings(
                        {
                            ...baseFormData,
                            scheduleType: CampaignScheduleType.SCHEDULED,
                            startTimeMode: 'now',
                            endTimeMode: 'duration',
                            endTimeDuration: {
                                days: 3,
                                hours: 0,
                                minutes: 0,
                            },
                        },
                    );

                const expectedEnd = fakeNow.plus({ days: 3 });

                expect(result.startTime).toBe(BigInt(0));
                expect(result.endTime).toBe(
                    BigInt(Math.round(expectedEnd.toSeconds())),
                );
            } finally {
                Settings.now = () => Date.now();
            }
        });

        it('returns zero end time when scheduled but no end time mode is set', () => {
            const result =
                capitalDistributorCampaignScheduleUtils.parseScheduleSettings({
                    ...baseFormData,
                    scheduleType: CampaignScheduleType.SCHEDULED,
                    startTimeMode: 'fixed',
                    startTimeFixed: { date: '2026-03-01', time: '12:00' },
                });

            expect(result.endTime).toBe(BigInt(0));
        });

        it('returns zero start time when scheduled with no start time mode set', () => {
            const result =
                capitalDistributorCampaignScheduleUtils.parseScheduleSettings({
                    ...baseFormData,
                    scheduleType: CampaignScheduleType.SCHEDULED,
                    endTimeMode: 'fixed',
                    endTimeFixed: { date: '2026-06-01', time: '18:30' },
                });

            expect(result.startTime).toBe(BigInt(0));
        });
    });
});

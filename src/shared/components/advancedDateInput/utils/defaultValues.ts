import { useMemo } from 'react';
import { DateTime, Duration } from 'luxon';

export interface IUseDefaultValuesProps {
    minDuration: number;
    startTime?: { date: string; time: string };
    isNow: boolean;
}

export const useDefaultValues = ({ minDuration, startTime, isNow }: IUseDefaultValuesProps) => {
    return useMemo(() => {
        const getDefaultDateTime = (): { date: string; time: string } => {
            let defaultDateTime: DateTime;

            if (isNow) {
                defaultDateTime = DateTime.now();
            } else if (startTime) {
                defaultDateTime = DateTime.fromISO(`${startTime.date}T${startTime.time}`);
                if (minDuration > 0) {
                    defaultDateTime = defaultDateTime.plus({ seconds: minDuration });
                } else {
                    defaultDateTime = defaultDateTime.plus({ days: 5 });
                }
            } else if (minDuration > 0) {
                defaultDateTime = DateTime.now().plus({ seconds: minDuration });
            } else {
                defaultDateTime = DateTime.now().plus({ days: 5 });
            }

            return {
                date: defaultDateTime.toISODate() ?? '',
                time: defaultDateTime.toFormat('HH:mm'),
            };
        };

        const getDefaultDuration = () => {
            if (minDuration > 0) {
                const duration = Duration.fromMillis(minDuration * 1000);
                return {
                    days: Math.floor(duration.as('days')),
                    hours: Math.floor(duration.as('hours') % 24),
                    minutes: Math.floor(duration.as('minutes') % 60),
                };
            }
            return { days: 5, hours: 0, minutes: 0 };
        };

        const dateTime = getDefaultDateTime();
        const duration = getDefaultDuration();

        return { dateTime, duration };
    }, [minDuration, startTime, isNow]);
};

import { useMemo } from 'react';

export interface IUseDefaultValuesProps {
    minDuration: number;
    startTime?: { date: string; time: string };
}

export const useDefaultValues = ({ minDuration, startTime }: IUseDefaultValuesProps) => {
    return useMemo(() => {
        const getDefaultDateTime = () => {
            let defaultDate = new Date();
            if (startTime) {
                const [year, month, day] = startTime.date.split('-').map(Number);
                const [hours, minutes] = startTime.time.split(':').map(Number);
                defaultDate = new Date(year, month - 1, day, hours, minutes);

                if (minDuration > 0) {
                    defaultDate.setSeconds(defaultDate.getSeconds() + minDuration);
                } else {
                    defaultDate.setDate(defaultDate.getDate() + 5); // Add 5 days if no minDuration
                }
            } else if (minDuration > 0) {
                defaultDate.setSeconds(defaultDate.getSeconds() + minDuration);
            }

            return {
                date: defaultDate.toISOString().split('T')[0],
                time: defaultDate.toTimeString().slice(0, 5),
            };
        };

        const getDefaultDuration = () => {
            if (minDuration > 0) {
                const days = Math.floor(minDuration / 86400);
                const hours = Math.floor((minDuration % 86400) / 3600);
                const minutes = Math.floor((minDuration % 3600) / 60);
                return { days, hours, minutes };
            }
            return { days: 5, hours: 0, minutes: 0 };
        };

        const dateTime = getDefaultDateTime();
        const duration = getDefaultDuration();

        return { dateTime, duration };
    }, [minDuration, startTime]);
};

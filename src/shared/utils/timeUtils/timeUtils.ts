class TimeUtils {
    normalizeTimeValue = (value: string): string => {
        if (value.length === 0) {
            return '';
        }

        const timeMatch = this.timePattern.exec(value);

        if (!timeMatch) {
            return value;
        }

        const [, hourRaw, minuteRaw, periodRaw] = timeMatch;
        let hours = Number.parseInt(hourRaw, 10);
        let minutes = Number.parseInt(minuteRaw, 10);
        const period = periodRaw ? periodRaw.toLowerCase() : undefined;

        if (period === 'p' && hours < 12) {
            hours += 12;
        }
        if (period === 'a' && hours === 12) {
            hours = 0;
        }

        hours = Math.min(Math.max(hours, 0), 23);
        minutes = Math.min(Math.max(minutes, 0), 59);

        const normalizedHours = hours.toString().padStart(2, '0');
        const normalizedMinutes = minutes.toString().padStart(2, '0');

        return `${normalizedHours}:${normalizedMinutes}`;
    };

    private timePattern = /^(\d{1,2}):(\d{2})(?:\s*([ap])\.?m\.?)?$/i;
}

export const timeUtils = new TimeUtils();

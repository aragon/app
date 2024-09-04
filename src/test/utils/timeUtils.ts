import { Settings } from 'luxon';

class TimeUtils {
    private originalNow = Settings.now;
    private customTime: string | undefined = undefined;

    private customNow = () => {
        const now = this.customTime != null ? new Date(this.customTime) : new Date();

        return now.valueOf();
    };

    setTime = (now: string) => {
        this.customTime = now;
    };

    setup = () => {
        beforeEach(() => {
            Settings.now = this.customNow;
        });

        afterEach(() => {
            Settings.now = this.originalNow;
            this.customTime = undefined;
        });
    };
}

export const timeUtils = new TimeUtils();

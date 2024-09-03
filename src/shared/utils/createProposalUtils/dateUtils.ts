class DateUtils {
    secondsToDaysHoursMinutes = (totalSeconds: number) => {
        const days = Math.floor(totalSeconds / (24 * 60 * 60));
        const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
        return { days, hours, minutes };
    };
}
export const dateUtils = new DateUtils();

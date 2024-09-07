export interface IDateDuration {
    /**
     * Minutes as a number between [0, 59] range.
     */
    minutes: number;
    /**
     * Hours as a number between [0, 23] range.
     */
    hours: number;
    /**
     * Number of days.
     */
    days: number;
}

export interface IDateFixed {
    /**
     * Date in YYYY-MM-DD format.
     */
    date: string;
    /**
     * Time in HH:MM format.
     */
    time: string;
}

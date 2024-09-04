export enum InputModeOptions {
    NOW = 'now',
    FIXED = 'fixed',
    DURATION = 'duration',
}

export enum DurationFields {
    DAYS = 'days',
    HOURS = 'hours',
    MINUTES = 'minutes',
}

export enum DateTimeFields {
    DATE = 'date',
    TIME = 'time',
}

export interface IAdvancedDateInputProps {
    /**
     * Label for the input.
     */
    label: string;
    /**
     * Field for the input to help parsing data.
     */
    field: string;
    /**
     * Help text for the input.
     */
    helpText: string;
    /**
     * Info text for the input.
     */
    infoText?: string;
    /**
     * Boolean to enable or disable duration on end time.
     */
    useDuration?: boolean;
    /**
     * Min date for the input.
     */
    minDuration?: number;
    isStartField?: boolean;
}

export interface IAdvancedDateInputDateFixed {
    /**
     * Date in YYYY-MM-DD format.
     */
    date: string;
    /**
     * Time in HH:MM format.
     */
    time: string;
}

export interface IAdvancedDateInputDateDuration {
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

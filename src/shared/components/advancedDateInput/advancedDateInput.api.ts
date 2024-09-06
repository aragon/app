import type { IDateDuration } from '@/shared/utils/createProposalUtils';
import type { DateTime } from 'luxon';

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
     * Minimum time for fixed input
     */
    minTime: DateTime;
    /**
     * Boolean to enable or disable duration on end time.
     */
    useDuration?: boolean;
    /**
     * Min date for the input.
     */
    minDuration?: IDateDuration;
    /**
     * Validate min duration
     */
    validateMinDuration?: boolean;
}

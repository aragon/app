import type { IInputContainerProps } from '@aragon/gov-ui-kit';
import type { DateTime } from 'luxon';
import type { IDateDuration } from '@/shared/utils/dateUtils';

export interface IAdvancedDateInputBaseProps {
    /**
     * Name of the field set on the form context.
     */
    field: string;
    /**
     * Label of the date input.
     */
    label: string;
    /**
     * Info text for the input.
     */
    infoText?: string;
    /**
     * Defines how the info text is displayed.
     * @default card
     */
    infoDisplay?: 'inline' | 'card';
    /**
     * Minimum (recommended) duration added to the minTime for the input.
     */
    minDuration?: IDateDuration;
    /**
     * Minimum time for fixed input.
     */
    minTime: DateTime;
    /**
     * Validates that the selected date is valid usign the minDuration property when set to true.
     */
    validateMinDuration?: boolean;
}

export interface IAdvancedDateInputProps
    extends IAdvancedDateInputBaseProps,
        Pick<IInputContainerProps, 'helpText'> {
    /**
     * Renders a duration field instead of the "now" selector when set to true.
     */
    useDuration?: boolean;
}

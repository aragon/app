import * as React from 'react';

/**
 * AdvancedDateInput — from @aragon/app@1.39.1 (apps/app/src/shared/components/forms/advancedDateInput/advancedDateInput.tsx).
 */
export interface AdvancedDateInputProps {
  /** Renders a duration field instead of the "now" selector when set to true. */
  useDuration?: boolean;
  /** Name of the field set on the form context. */
  field: string;
  /** Label of the date input. */
  label: string;
  /** Info text for the input. */
  infoText?: string;
  /** Defines how the info text is displayed. */
  infoDisplay?: "inline" | "card";
  /** Minimum (recommended) duration added to the minTime for the input. */
  minDuration?: IDateDuration;
  /** Minimum time for fixed input. */
  minTime: DateTime<boolean>;
  /** Validates that the selected date is valid usign the minDuration property when set to true. */
  validateMinDuration?: boolean;
  /** Help text displayed above the input. */
  helpText?: string;
}

import type { DateTime } from 'luxon';

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

export declare const AdvancedDateInput: React.ComponentType<AdvancedDateInputProps>;
